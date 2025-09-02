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
  lyhytnimi: Option[String],
  nimi: String,
  lisatieto: Option[String]
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
        Option(r.nextString()),
        r.nextString(),
        Option(r.nextString())
      )
    )

  def listAll(): Seq[DbMaakoodi] =
    db.run(
      sql"""
        SELECT id, esittelija_id, koodi, lyhytnimi, nimi, lisatieto
        FROM maakoodi
      """.as[DbMaakoodi],
      "list_all_maakoodi"
    )

  def upsertMaakoodi(
    koodi: String,
    lyhytnimi: Option[String],
    nimi: String,
    lisatieto: Option[String],
    muokkaajaTaiLuoja: String
  ): DBIO[Int] =
    sqlu"""
      INSERT INTO maakoodi (koodi, lyhytnimi, nimi, lisatieto, luoja)
      VALUES (
        $koodi,
        ${lyhytnimi.orNull},
        $nimi,
        ${lisatieto.orNull},
        $muokkaajaTaiLuoja
      )
      ON CONFLICT (koodi)
      DO UPDATE SET
        lyhytnimi = EXCLUDED.lyhytnimi,
        nimi = EXCLUDED.nimi,
        lisatieto = EXCLUDED.lisatieto,
        muokkaaja = EXCLUDED.luoja,
        muokattu = now()
    """

  def deleteByKoodi(koodi: String): DBIO[Int] =
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
      val nameFi = item.nimi.get(Kieli.fi).getOrElse("")
      upsertMaakoodi(item.koodiArvo, None, nameFi, None, muokkaajaTaiLuoja)
    }

    val toDelete = (existing -- incoming).toSeq.map(deleteByKoodi)

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
}
