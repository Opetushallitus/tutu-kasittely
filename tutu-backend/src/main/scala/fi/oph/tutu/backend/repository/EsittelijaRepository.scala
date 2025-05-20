package fi.oph.tutu.backend.repository

import fi.oph.tutu.backend.domain.{Esittelija, UserOid}
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

  implicit val getEsittelijaResult: GetResult[Esittelija] =
    GetResult(r => Esittelija(UUID.fromString(r.nextString()), UserOid(r.nextString())))

  /**
   * Hakee esittelijän maakoodin perusteella
   *
   * @param maakoodi
   * hakemuksen maakoodi
   * @return
   * Esittelija
   */
  def haeEsittelijaMaakoodilla(maakoodi: String): Option[Esittelija] =
    try {
      val esittelija: Esittelija = db.run(
        sql"""
        SELECT id, esittelija_oid from esittelija 
        WHERE maatjavaltiot_koodi_uri = $maakoodi AND esittelija_oid IS NOT NULL
        """.as[Esittelija].head,
        "haeEsittelijaMaakoodilla"
      )
      Some(esittelija)
    } catch {
      case e: Exception =>
        LOG.warn(s"Esittelijän haku epäonnistui maakoodilla : $maakoodi")
        None
    }
}
