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
  koodiUri: String,
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
        SELECT id, esittelija_id, koodiuri, nimi
        FROM maakoodi
      """.as[DbMaakoodi],
      "list_all_maakoodi"
    )

  /**
   * Creates or updates a maakoodi entry
   *
   * @param koodiUri maakoodi value in format maatjavaltiot2_XXX
   * @param nimi name for the maakoodi
   * @param muokkaajaTaiLuoja creator or modifier of the entry
   * @return the created or updated maakoodi
   */
  def upsertMaakoodi(
    koodiUri: String,
    nimi: String,
    muokkaajaTaiLuoja: String,
    esittelijaId: Option[UUID] = None
  ): Option[DbMaakoodi] = {
    try {
      val esittelijaIdSql = esittelijaId.map(id => s"'$id'::uuid").getOrElse("NULL")
      val query           = sql"""
        INSERT INTO maakoodi (koodiuri, nimi, luoja, esittelija_id)
        VALUES ($koodiUri, $nimi, $muokkaajaTaiLuoja, #$esittelijaIdSql)
        ON CONFLICT (koodiuri) DO
        UPDATE SET
          nimi = EXCLUDED.nimi,
          muokkaaja = EXCLUDED.luoja,
          esittelija_id = #$esittelijaIdSql,
          muokattu = now()
        RETURNING id, esittelija_id, koodiuri, nimi
        """.as[DbMaakoodi]
      val maakoodi: DbMaakoodi = db.run(query.head, "upsertMaakoodi")
      Some(maakoodi)
    } catch {
      case e: Exception =>
        LOG.warn(s"Failed to upsert maakoodi with koodiUri: $koodiUri", e)
        None
    }
  }

  private def syncInsert(
    koodiUri: String,
    nimi: String,
    muokkaajaTaiLuoja: String
  ): DBIO[Int] =
    sqlu"""
      INSERT INTO maakoodi (koodiuri, nimi, luoja)
      VALUES (
        $koodiUri,
        $nimi,
        $muokkaajaTaiLuoja
      )
      ON CONFLICT (koodiuri)
      DO UPDATE SET
        nimi = EXCLUDED.nimi,
        muokkaaja = EXCLUDED.luoja,
        muokattu = now()
    """

  private def syncDelete(koodiUri: String): DBIO[Int] =
    sqlu"""
      DELETE FROM maakoodi WHERE koodiuri = $koodiUri
    """

  def syncFromKoodisto(
    items: Seq[KoodistoItem],
    muokkaajaTaiLuoja: String
  ): Unit = {
    val existing = listAll().map(_.koodiUri).toSet
    val incoming = items.map(_.koodiUri).toSet

    val toInsertOrUpdate = items.map { item =>
      val nameFi = item.nimi.getOrElse(Kieli.fi, "")
      syncInsert(item.koodiUri, nameFi, muokkaajaTaiLuoja)
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

  def getMaakoodi(id: UUID): Option[DbMaakoodi] = {
    try {
      val query = sql"""
        SELECT id, esittelija_id, koodiuri, nimi
        FROM maakoodi
        WHERE id = ${id.toString}::uuid
      """.as[DbMaakoodi]
      val maakoodi = db.run(query.head, "getMaakoodi")
      Some(maakoodi)
    } catch {
      case e: java.util.NoSuchElementException =>
        LOG.error(s"Maakoodi not found with id: $id")
        None
      case e: java.sql.SQLException =>
        LOG.error(
          s"SQL virhe maakoodin haussa - id: $id, SQL State: ${e.getSQLState}, Error Code: ${e.getErrorCode}",
          e
        )
        None
      case e: Exception =>
        LOG.error(s"Maakoodin haku epäonnistui - id: $id", e)
        None
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
        RETURNING id, esittelija_id, koodiuri, nimi
      """.as[DbMaakoodi]
      val maakoodi: DbMaakoodi = db.run(query.head, "updateMaakoodi")
      Some(maakoodi)
    } catch {
      case e: java.util.NoSuchElementException =>
        LOG.error(s"Maakoodi not found with id: $id")
        None
      case e: java.sql.SQLException =>
        LOG.error(
          s"SQL virhe maakoodin päivityksessä - id: $id, SQL State: ${e.getSQLState}, Error Code: ${e.getErrorCode}",
          e
        )
        None
      case e: Exception =>
        LOG.error(s"Maakoodin päivitys epäonnistui - id: $id", e)
        None
    }
  }
}
