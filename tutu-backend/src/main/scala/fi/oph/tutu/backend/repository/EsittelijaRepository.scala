package fi.oph.tutu.backend.repository

import fi.oph.tutu.backend.domain.{DbEsittelija, UserOid}
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.{Component, Repository}
import slick.jdbc.GetResult
import slick.jdbc.PostgresProfile.api.*
import slick.dbio.DBIO

import java.util.UUID
import scala.util.{Failure, Success}
import scala.concurrent.ExecutionContext.Implicits.global

@Component
@Repository
class EsittelijaRepository {
  @Autowired
  val db: TutuDatabase = null

  val LOG: Logger = LoggerFactory.getLogger(classOf[EsittelijaRepository])

  implicit val getEsittelijaResult: GetResult[DbEsittelija] =
    GetResult(r =>
      DbEsittelija(
        esittelijaId = UUID.fromString(r.nextString()),
        esittelijaOid = UserOid(r.nextString()),
        kutsumanimi = r.nextStringOption(),
        sukunimi = r.nextStringOption(),
        sahkoposti = r.nextStringOption(),
        puhelinnumero = r.nextStringOption(),
        deactivated = r.nextTimestampOption().map(_.toLocalDateTime)
      )
    )

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
      db.run(
        sql"""
          SELECT e.id, e.esittelija_oid, e.kutsumanimi, e.sukunimi, e.sahkoposti, e.puhelinnumero, deactivated
          FROM esittelija e
          INNER JOIN maakoodi m ON m.esittelija_id = e.id
          WHERE m.koodiuri = $maakoodiUri
          AND m.esittelija_id IS NOT NULL
          AND e.esittelija_oid IS NOT NULL
        """.as[DbEsittelija].headOption,
        "haeEsittelijaMaakoodilla"
      )
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
      db.run(
        sql"""
          SELECT id, esittelija_oid, kutsumanimi, sukunimi, sahkoposti, puhelinnumero, deactivated
          FROM esittelija
          WHERE esittelija_oid = $oid
        """.as[DbEsittelija].headOption,
        "haeEsittelijaOidilla"
      )
    } catch {
      case e: Exception =>
        LOG.warn(s"Esittelijän haku epäonnistui oidilla: $oid")
        LOG.error("", e)
        None
    }
  }

  /**
   * Luo tai päivittää esittelijän
   *
   * @return
   * Esittelija
   */
  def insertEsittelija(
    esittelijaOid: UserOid,
    muokkaajaTaiLuoja: String,
    kutsumanimi: String | Null = null,
    sukunimi: String | Null = null,
    sahkoposti: Option[String] = None,
    puhelinnumero: Option[String] = None
  ): Option[DbEsittelija] =
    try {
      val esittelijaOidString      = esittelijaOid.toString
      val esittelija: DbEsittelija = db.run(
        sql"""
          INSERT INTO esittelija (esittelija_oid, luoja, kutsumanimi, sukunimi, sahkoposti, puhelinnumero)
          VALUES ($esittelijaOidString, $muokkaajaTaiLuoja, $kutsumanimi, $sukunimi, ${sahkoposti.orNull}, ${puhelinnumero.orNull})
          RETURNING id, esittelija_oid, kutsumanimi, sukunimi, sahkoposti, puhelinnumero, deactivated
        """.as[DbEsittelija].head,
        "insertEsittelija"
      )
      Some(esittelija)
    } catch {
      case e: Exception =>
        LOG.warn(s"Esittelijän insert epäonnistui oidilla: ${esittelijaOid.toString}", e)
        None
    }

  private def haeKaikkiEsittelijaOidit(): Seq[String] = {
    try {
      db.run(
        sql"""
          SELECT esittelija_oid
          FROM esittelija
          WHERE esittelija_oid IS NOT NULL AND deactivated IS NULL
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
          SELECT id, esittelija_oid, kutsumanimi, sukunimi, sahkoposti, puhelinnumero, deactivated
          FROM esittelija
          WHERE esittelija_oid IS NOT NULL AND deactivated IS NULL
        """.as[DbEsittelija],
        "haeKaikkiEsittelijat"
      )
    } catch {
      case e: Exception =>
        LOG.warn("Esittelijöiden haku epäonnistui", e)
        Seq.empty
    }
  }

  def paivitaEsittelijaTiedot(
    oid: String,
    kutsumanimi: String,
    sukunimi: String,
    sahkoposti: String,
    puhelin: String
  ): Unit = {
    try {
      db.run(
        sqlu"""
          UPDATE esittelija
          SET kutsumanimi = $kutsumanimi, sukunimi = $sukunimi, sahkoposti = $sahkoposti, puhelinnumero = $puhelin
          WHERE esittelija_oid = $oid AND deactivated IS NULL
        """,
        "paivitaEsittelijaTiedot"
      )
    } catch {
      case e: Exception =>
        LOG.warn(s"Esittelijän nimen päivitys epäonnistui oidilla: $oid")
    }
  }

  private def syncInsert(oid: String, muokkaajaTaiLuoja: String): DBIO[Int] =
    sqlu"""
      INSERT INTO esittelija (esittelija_oid, luoja)
      VALUES ($oid, $muokkaajaTaiLuoja)
      ON CONFLICT (esittelija_oid)
      DO UPDATE SET deactivated = NULL, muokkaaja = $muokkaajaTaiLuoja
    """

  private def syncDeactivate(oid: String, muokkaaja: String): DBIO[Int] =
    sqlu"""
      UPDATE esittelija
      SET deactivated = now(), muokkaaja = $muokkaaja, kutsumanimi = 'Deaktivoitu', sukunimi = 'Esittelija', sahkoposti = NULL, puhelinnumero = NULL
      WHERE esittelija_oid = $oid
    """

  private def syncPoistaDeaktivoituEsittelijaMaakoodeista(oid: String, muokkaaja: String): DBIO[Int] = {
    sqlu"""
            UPDATE maakoodi
              SET esittelija_id = NULL, muokkaaja = $muokkaaja
              WHERE esittelija_id IN (SELECT id FROM esittelija WHERE esittelija_oid = $oid)
          """
  }

  def syncFromKayttooikeusService(esittelijaOids: Seq[String], muokkaajaTaiLuoja: String): Unit = {
    val existing = haeKaikkiEsittelijaOidit().toSet
    val incoming = esittelijaOids.toSet

    val toInsert              = (incoming -- existing).toSeq.map(oid => syncInsert(oid, muokkaajaTaiLuoja))
    val toDeactivate          = (existing -- incoming).toSeq.map(oid => syncDeactivate(oid, muokkaajaTaiLuoja))
    val toDeactivateMaakoodit =
      (existing -- incoming).toSeq.map(oid => syncPoistaDeaktivoituEsittelijaMaakoodeista(oid, muokkaajaTaiLuoja))

    val actions: Seq[DBIO[Int]] = toInsert ++ toDeactivate ++ toDeactivateMaakoodit

    if (toInsert.nonEmpty) {
      LOG.info(s"Syncing ${toInsert.size} new esittelijät to database")
    }
    if (toDeactivate.nonEmpty) {
      LOG.info(s"Deactivating ${toDeactivate.size} esittelijät in database")
    }
    if (toDeactivateMaakoodit.nonEmpty) {
      LOG.info(s"Clearing deactivated esittelija from ${toDeactivateMaakoodit.size} maakoodit")
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
