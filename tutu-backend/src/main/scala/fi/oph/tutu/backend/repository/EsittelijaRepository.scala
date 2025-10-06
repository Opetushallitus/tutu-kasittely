package fi.oph.tutu.backend.repository

import fi.oph.tutu.backend.domain.{DbEsittelija, UserOid}
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.{Component, Repository}
import slick.jdbc.GetResult
import slick.jdbc.PostgresProfile.api.*
import slick.dbio.DBIO

import java.util.UUID
import scala.concurrent.duration.DurationInt
import scala.util.{Failure, Success}
import scala.concurrent.ExecutionContext.Implicits.global

@Component
@Repository
class EsittelijaRepository {
  @Autowired
  val db: TutuDatabase = null

  final val DB_TIMEOUT = 30.seconds
  val LOG: Logger      = LoggerFactory.getLogger(classOf[EsittelijaRepository])

  implicit val getEsittelijaResult: GetResult[DbEsittelija] =
    GetResult(r => DbEsittelija(UUID.fromString(r.nextString()), UserOid(r.nextString())))

  /**
   * Hakee esittelijän maakoodin perusteella
   *
   * @param maakoodiUri
   * esittelijän maakoodi
   * @return
   * Esittelija
   */
  def haeEsittelijaMaakoodiUrilla(maakoodiUri: String): Option[DbEsittelija] = {
    try {
      val esittelija: DbEsittelija = db.run(
        sql"""
      SELECT e.id, e.esittelija_oid
      FROM esittelija e
      INNER JOIN maakoodi m ON m.esittelija_id = e.id
      WHERE m.koodiuri = $maakoodiUri
      AND m.esittelija_id IS NOT NULL
      AND e.esittelija_oid IS NOT NULL
      """.as[DbEsittelija].head,
        "haeEsittelijaMaakoodilla"
      )
      Some(esittelija)
    } catch {
      case e: Exception =>
        LOG.warn(s"Esittelijän haku epäonnistui maakoodilla: $maakoodiUri")
        None
    }
  }

  /**
   * Hakee esittelijän oidin perusteella
   *
   * @param oid
   * esittelijän oid
   * @return
   * Esittelija
   */
  def haeEsittelijaOidilla(oid: String): Option[DbEsittelija] = {
    try {
      val esittelija: DbEsittelija = db.run(
        sql"""
        SELECT id, esittelija_oid from esittelija
        WHERE esittelija_oid = $oid
        """.as[DbEsittelija].head,
        "haeEsittelijaOidilla"
      )
      Some(esittelija)
    } catch {
      case e: Exception =>
        LOG.warn(s"Esittelijän haku epäonnistui oidilla: $oid")
        None
    }
  }

  /**
   * Luo tai päivittää esittelijän
   *
   * @return
   * Esittelija
   */
  def insertEsittelija(esittelijaOid: UserOid, muokkaajaTaiLuoja: String): Option[DbEsittelija] =
    try {
      val esittelijaOidString      = esittelijaOid.toString
      val esittelija: DbEsittelija = db.run(
        sql"""
        INSERT INTO esittelija (esittelija_oid, luoja)
        VALUES ($esittelijaOidString, $muokkaajaTaiLuoja)
        RETURNING id, esittelija_oid
        """.as[DbEsittelija].head,
        "insertEsittelija"
      )
      Some(esittelija)
    } catch {
      case e: Exception =>
        LOG.warn(s"Esittelijän insert epäonnistui oidilla: ${esittelijaOid.toString}", e)
        None
    }

  def haeKaikkiEsitteilijaOidit(): Seq[String] = {
    try {
      db.run(
        sql"""
        SELECT esittelija_oid from esittelija
        WHERE esittelija_oid IS NOT NULL
        """.as[String],
        "listAllEsittelijaOids"
      )
    } catch {
      case e: Exception =>
        LOG.warn("Esittelijöiden haku epäonnistui", e)
        Seq.empty
    }
  }

  def haeKaikkiEsittelijat(): Seq[DbEsittelija] = {
    try {
      db.run(
        sql"""
        SELECT id, esittelija_oid from esittelija
        WHERE esittelija_oid IS NOT NULL
        """.as[DbEsittelija],
        "haeKaikkiEsittelijat"
      )
    } catch {
      case e: Exception =>
        LOG.warn("Esittelijöiden haku epäonnistui", e)
        Seq.empty
    }
  }

  private def syncInsert(oid: String, muokkaajaTaiLuoja: String): DBIO[Int] =
    sqlu"""
      INSERT INTO esittelija (esittelija_oid, luoja)
      VALUES ($oid, $muokkaajaTaiLuoja)
    """

  private def syncDelete(oid: String): DBIO[Int] =
    sqlu"""
      DELETE FROM esittelija WHERE esittelija_oid = $oid
    """

  def syncFromKayttooikeusService(esittelijaOids: Seq[String], muokkaajaTaiLuoja: String): Unit = {
    val existing = haeKaikkiEsitteilijaOidit().toSet
    val incoming = esittelijaOids.toSet

    val toInsert = (incoming -- existing).toSeq.map(oid => syncInsert(oid, muokkaajaTaiLuoja))
    val toDelete = (existing -- incoming).toSeq.map(syncDelete)

    val actions: Seq[DBIO[Int]] = toInsert ++ toDelete

    if (toInsert.nonEmpty) {
      LOG.info(s"Syncing ${toInsert.size} new esittelijät to database")
    }
    if (toDelete.nonEmpty) {
      LOG.info(s"Removing ${toDelete.size} esittelijät from database")
    }

    try {
      db.runTransactionally(DBIO.sequence(actions).map(_.sum), "sync_esittelija") match {
        case Success(rowsAffected) =>
          LOG.info(s"Esittelija sync completed successfully. Rows affected: $rowsAffected")
        case Failure(e) => throw e
      }
    } catch {
      case e: Exception =>
        LOG.error(s"Esittelija sync failed: ${e.getMessage}", e)
        throw new RuntimeException(s"Esittelija sync failed: ${e.getMessage}", e)
    }
  }
}
