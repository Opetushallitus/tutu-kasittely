package fi.oph.tutu.backend.repository

import fi.oph.tutu.backend.domain.{DbEsittelija, UserOid}
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.{Component, Repository}
import slick.jdbc.GetResult
import slick.jdbc.PostgresProfile.api.*

import java.util.UUID
import scala.concurrent.duration.DurationInt

@Component
@Repository
class EsittelijaRepository {
  @Autowired
  val db: TutuDatabase = null

  final val DB_TIMEOUT = 30.seconds
  val LOG: Logger      = LoggerFactory.getLogger(classOf[HakemusRepository])

  implicit val getEsittelijaResult: GetResult[DbEsittelija] =
    GetResult(r => DbEsittelija(UUID.fromString(r.nextString()), UserOid(r.nextString())))

  /**
   * Hakee esittelijän maakoodin perusteella
   *
   * @param maakoodi
   * esittelijän maakoodi
   * @return
   * Esittelija
   */
  def haeEsittelijaMaakoodilla(maakoodi: String): Option[DbEsittelija] = {
    try {
      val esittelija: DbEsittelija = db.run(
        sql"""
        SELECT id, esittelija_oid from esittelija 
        WHERE maakoodi = $maakoodi AND esittelija_oid IS NOT NULL
        """.as[DbEsittelija].head,
        "haeEsittelijaMaakoodilla"
      )
      Some(esittelija)
    } catch {
      case e: Exception =>
        LOG.warn(s"Esittelijän haku epäonnistui maakoodilla : $maakoodi")
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
   * Luo tai päivittää esittelijän maakoodin perusteella
   *
   * @param maakoodi
   * hakemuksen maakoodi
   * @return
   * Esittelija
   */
  def upsertEsittelija(maakoodi: String, esittelijaOid: UserOid, luoja: String): Option[DbEsittelija] =
    try {
      val esittelijaOidString      = esittelijaOid.toString
      val esittelija: DbEsittelija = db.run(
        sql"""
        INSERT INTO esittelija (maakoodi, esittelija_oid, luoja)
        VALUES ($maakoodi, $esittelijaOidString, $luoja)
        ON CONFLICT (maakoodi) DO
        UPDATE SET
        esittelija_oid = $esittelijaOidString,
        muokkaaja = $luoja
        returning id, esittelija_oid
        """.as[DbEsittelija].head,
        "haeEsittelijaMaakoodilla"
      )
      Some(esittelija)
    } catch {
      case e: Exception =>
        LOG.warn(s"Esittelijän haku tietokannasta epäonnistui maakoodilla : $maakoodi")
        None
    }
}
