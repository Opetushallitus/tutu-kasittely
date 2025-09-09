package fi.oph.tutu.backend.repository

import fi.oph.tutu.backend.domain.{Kieli, KoodistoItem}
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.{Component, Repository}
import slick.dbio.DBIO
import slick.jdbc.GetResult
import slick.jdbc.PostgresProfile.api.*

import java.util.UUID
import scala.concurrent.duration.DurationInt
import scala.util.{Failure, Success}
import scala.concurrent.ExecutionContext.Implicits.global

case class DbMaakoodi(
  id: UUID,
  esittelijaId: Option[UUID],
  koodi: String,
  nimi: String
)

@Component
@Repository
class MaakoodiRepository {
  @Autowired
  val db: TutuDatabase = null

  final val DB_TIMEOUT = 30.seconds
  val LOG: Logger      = LoggerFactory.getLogger(classOf[MaakoodiRepository])

  implicit val getMaakoodiResult: GetResult[DbMaakoodi] =
    GetResult(r =>
      DbMaakoodi(
        UUID.fromString(r.nextString()),
        Option(r.nextString()).map(UUID.fromString),
        r.nextString(),
        r.nextString()
      )
    )

  def listAll(): Seq[DbMaakoodi] =
    db.run(
      sql"""
        SELECT id, esittelija_id, koodi, nimi
        FROM maakoodi
      """.as[DbMaakoodi],
      "list_all_maakoodi"
    )

  /**
   * Creates or updates a maakoodi entry
   *
   * @param koodi maakoodi value
   * @param nimi name for the maakoodi
   * @param muokkaajaTaiLuoja creator or modifier of the entry
   * @return the created or updated maakoodi
   */
  def upsertMaakoodi(
    koodi: String,
    nimi: String,
    muokkaajaTaiLuoja: String,
    esittelijaId: Option[UUID] = None
  ): Option[DbMaakoodi] = {
    try {
      val esittelijaIdSql = esittelijaId.map(id => s"'$id'::uuid").getOrElse("NULL")
      val query           = sql"""
        INSERT INTO maakoodi (koodi, nimi, luoja, esittelija_id)
        VALUES ($koodi, $nimi, $muokkaajaTaiLuoja, #$esittelijaIdSql)
        ON CONFLICT (koodi) DO
        UPDATE SET
          nimi = EXCLUDED.nimi,
          muokkaaja = EXCLUDED.luoja,
          esittelija_id = #$esittelijaIdSql,
          muokattu = now()
        RETURNING id, esittelija_id, koodi, nimi
        """.as[DbMaakoodi]
      val maakoodi: DbMaakoodi = db.run(query.head, "upsertMaakoodi")
      Some(maakoodi)
    } catch {
      case e: Exception =>
        LOG.warn(s"Failed to upsert maakoodi with koodi: $koodi", e)
        None
    }
  }

  private def syncInsert(
    koodi: String,
    nimi: String,
    muokkaajaTaiLuoja: String
  ): DBIO[Int] =
    sqlu"""
      INSERT INTO maakoodi (koodi, nimi, luoja)
      VALUES (
        $koodi,
        $nimi,
        $muokkaajaTaiLuoja
      )
      ON CONFLICT (koodi)
      DO UPDATE SET
        nimi = EXCLUDED.nimi,
        muokkaaja = EXCLUDED.luoja,
        muokattu = now()
    """

  private def syncDelete(koodi: String): DBIO[Int] =
    sqlu"""
      DELETE FROM maakoodi WHERE koodi = $koodi
    """

  def syncFromKoodisto(
    items: Seq[KoodistoItem],
    muokkaajaTaiLuoja: String
  ): Unit = {
    val existing = listAll().map(_.koodi).toSet
    val incoming = items.map(_.koodiArvo).toSet

    val toInsertOrUpdate = items.map { item =>
      val nameFi = item.nimi.getOrElse(Kieli.fi, "")
      syncInsert(item.koodiArvo, nameFi, muokkaajaTaiLuoja)
    }

    val toDelete = (existing -- incoming).toSeq.map(syncDelete)

    val actions: Seq[DBIO[Int]] = toInsertOrUpdate ++ toDelete

    try {
      db.runTransactionally(DBIO.sequence(actions).map(_.sum), "sync_maakoodi") match {
        case Success(_) => ()
        case Failure(e) => throw e
      }
    } catch {
      case e: Exception =>
        LOG.error(s"Maakoodi sync failed: ${e.getMessage}", e)
        throw new RuntimeException(s"Maakoodi sync failed: ${e.getMessage}", e)
    }
  }

  def updateMaakoodi(
    id: UUID,
    esittelijaId: Option[UUID],
    muokkaaja: String
  ): Option[DbMaakoodi] = {
    try {
      val esittelijaIdSql = esittelijaId.map(uuid => s"'$uuid'::uuid").getOrElse("NULL")
      val query           = sql"""
        UPDATE maakoodi
        SET
          esittelija_id = #$esittelijaIdSql,
          muokkaaja = $muokkaaja,
          muokattu = now()
        WHERE id = ${id.toString}::uuid
        RETURNING id, esittelija_id, koodi, nimi
      """.as[DbMaakoodi]
      val maakoodi: DbMaakoodi = db.run(query.head, "updateMaakoodi")
      Some(maakoodi)
    } catch {
      case e: Exception =>
        LOG.error(s"Maakoodin paivitys epäonnistui id: $id", e)
        None
    }
  }
}
