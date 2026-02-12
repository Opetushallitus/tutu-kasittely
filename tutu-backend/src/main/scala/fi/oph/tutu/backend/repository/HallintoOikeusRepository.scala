package fi.oph.tutu.backend.repository

import fi.oph.tutu.backend.domain.{HallintoOikeus, MaakuntaHallintoOikeus}
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.{Component, Repository}
import slick.jdbc.GetResult
import slick.jdbc.PostgresProfile.api.*

import java.util.UUID
import scala.concurrent.duration.DurationInt

@Component
@Repository
class HallintoOikeusRepository extends BaseResultHandlers {
  @Autowired
  val db: TutuDatabase = null
  val LOG: Logger      = LoggerFactory.getLogger(classOf[HallintoOikeusRepository])

  final val DB_TIMEOUT = 30.seconds

  implicit val getHallintoOikeusResult: GetResult[HallintoOikeus] = GetResult(r =>
    HallintoOikeus(
      id = Some(r.nextObject().asInstanceOf[UUID]),
      koodi = r.nextString(),
      nimi = parseKielistetty(r.nextString()),
      osoite = parseKielistettyOption(r.nextStringOption()),
      puhelin = r.nextStringOption(),
      sahkoposti = r.nextStringOption(),
      verkkosivu = parseKielistettyOption(r.nextStringOption()),
      luotu = r.nextTimestampOption(),
      muokattu = r.nextTimestampOption()
    )
  )

  implicit val getMaakuntaHallintoOikeusResult: GetResult[MaakuntaHallintoOikeus] = GetResult(r =>
    MaakuntaHallintoOikeus(
      id = Some(r.nextObject().asInstanceOf[UUID]),
      maakuntaKoodi = r.nextString(),
      hallintoOikeusId = r.nextObject().asInstanceOf[UUID]
    )
  )

  /**
   * Hakee hallinto-oikeuden ID:llä
   */
  def findById(id: UUID): Option[HallintoOikeus] = {
    try
      db.run(
        sql"""
          SELECT id, koodi, nimi::text, osoite::text,
                 puhelin, sahkoposti, verkkosivu::text,
                 luotu, muokattu
          FROM hallinto_oikeus
          WHERE id = ${id.toString}::uuid
        """.as[HallintoOikeus].headOption,
        "hae_hallinto_oikeus_by_id"
      )
    catch {
      case e: Exception =>
        LOG.error(s"Hallinto-oikeuden haku ID:llä $id epäonnistui: ${e}")
        throw new RuntimeException(s"Hallinto-oikeuden haku epäonnistui: ${e.getMessage}", e)
    }
  }

  /**
   * Hakee hallinto-oikeuden koodilla
   */
  def findByKoodi(koodi: String): Option[HallintoOikeus] = {
    try
      db.run(
        sql"""
          SELECT id, koodi, nimi::text, osoite::text,
                 puhelin, sahkoposti, verkkosivu::text,
                 luotu, muokattu
          FROM hallinto_oikeus
          WHERE koodi = $koodi
        """.as[HallintoOikeus].headOption,
        "hae_hallinto_oikeus_by_koodi"
      )
    catch {
      case e: Exception =>
        LOG.error(s"Hallinto-oikeuden haku koodilla $koodi epäonnistui: ${e}")
        throw new RuntimeException(s"Hallinto-oikeuden haku epäonnistui: ${e.getMessage}", e)
    }
  }

  /**
   * Hakee kaikki hallinto-oikeudet
   */
  def findAll(): Seq[HallintoOikeus] = {
    try
      db.run(
        sql"""
          SELECT id, koodi, nimi::text, osoite::text,
                 puhelin, sahkoposti, verkkosivu::text,
                 luotu, muokattu
          FROM hallinto_oikeus
          ORDER BY nimi->>'fi'
        """.as[HallintoOikeus],
        "hae_kaikki_hallinto_oikeudet"
      )
    catch {
      case e: Exception =>
        LOG.error(s"Kaikkien hallinto-oikeuksien haku epäonnistui: ${e}")
        throw new RuntimeException(s"Hallinto-oikeuksien haku epäonnistui: ${e.getMessage}", e)
    }
  }

  /**
   * Hakee maakunta-hallinto-oikeus mappingin maakuntakoodilla
   * @param maakuntaKoodi Maakuntakoodi (esim. "01")
   * @return Mapping jos löytyy
   */
  def findByMaakuntaKoodi(maakuntaKoodi: String): Option[MaakuntaHallintoOikeus] = {
    try
      db.run(
        sql"""
          SELECT id, maakunta_koodi, hallinto_oikeus_id
          FROM maakunta_hallinto_oikeus
          WHERE maakunta_koodi = $maakuntaKoodi
        """.as[MaakuntaHallintoOikeus].headOption,
        "hae_maakunta_hallinto_oikeus_by_maakunta"
      )
    catch {
      case e: Exception =>
        LOG.error(s"Maakunta-hallinto-oikeus mappingin haku maakunnalla $maakuntaKoodi epäonnistui: ${e}")
        throw new RuntimeException(s"Maakunta-hallinto-oikeus mappingin haku epäonnistui: ${e.getMessage}", e)
    }
  }

}
