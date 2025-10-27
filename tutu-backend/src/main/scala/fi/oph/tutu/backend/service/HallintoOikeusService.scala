package fi.oph.tutu.backend.service

import fi.oph.tutu.backend.domain.HallintoOikeus
import fi.oph.tutu.backend.exception.{HallintoOikeusNotFoundException, HallintoOikeusServiceException}
import fi.oph.tutu.backend.repository.HallintoOikeusRepository
import fi.oph.tutu.backend.utils.TutuJsonFormats
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.cache.annotation.Cacheable
import org.springframework.stereotype.{Component, Service}
import org.json4s.*
import org.json4s.native.JsonMethods.*

@Component
@Service
class HallintoOikeusService(
  hallintoOikeusRepository: HallintoOikeusRepository,
  koodistoService: KoodistoService
) extends TutuJsonFormats {

  val LOG: Logger = LoggerFactory.getLogger(classOf[HallintoOikeusService])

  def haeHallintoOikeusByKunta(kuntaKoodi: String): HallintoOikeus = {
    LOG.debug(s"Haetaan hallinto-oikeus kuntakoodilla: $kuntaKoodi")

    val maakuntaKoodi  = haeMaakuntaKoodi(kuntaKoodi)
    val hallintoOikeus = haeHallintoOikeusByMaakunta(maakuntaKoodi)

    LOG.debug(s"Löytyi hallinto-oikeus: ${hallintoOikeus.koodi} kunnalle: $kuntaKoodi")

    hallintoOikeus
  }

  def haeKaikkiHallintoOikeudet(): Seq[HallintoOikeus] = {
    try {
      hallintoOikeusRepository.findAll()
    } catch {
      case e: Exception =>
        LOG.error(s"Kaikkien hallinto-oikeuksien haku epäonnistui: ${e}")
        Seq.empty
    }
  }

  /**
   * Hakee maakunnan koodisto-palvelusta (cached)
   */
  @Cacheable(value = Array("kuntaMaakuntaMapping"), key = "#kuntaKoodi")
  private def haeMaakuntaKoodi(kuntaKoodi: String): String = {
    LOG.debug(s"Haetaan maakunta koodisto-palvelusta kunnalle: $kuntaKoodi")

    try {
      koodistoService.getKoodistoRelaatiot(s"kunta_$kuntaKoodi") match {
        case Left(error) =>
          LOG.error(s"Koodisto-palvelu API-kutsu epäonnistui kunnalle $kuntaKoodi: ${error.getMessage}")
          throw new HallintoOikeusServiceException(
            s"Koodisto-palvelun kutsu epäonnistui kunnalle $kuntaKoodi",
            error
          )
        case Right(response) =>
          parseKoodistopalveluRelationResponse(response, kuntaKoodi)
      }
    } catch {
      case e: HallintoOikeusServiceException  => throw e
      case e: HallintoOikeusNotFoundException => throw e
      case e: Exception                       =>
        LOG.error(s"Maakunnan haku koodisto-palvelusta epäonnistui kunnalle $kuntaKoodi: ${e.getMessage}")
        throw new HallintoOikeusServiceException(
          s"Odottamaton virhe maakunnan haussa kunnalle $kuntaKoodi",
          e
        )
    }
  }

  private def haeHallintoOikeusByMaakunta(maakuntaKoodi: String): HallintoOikeus = {
    val mapping = hallintoOikeusRepository.findByMaakuntaKoodi(maakuntaKoodi).getOrElse {
      LOG.error(s"Maakunta-mapping ei löytynyt maakunnalla: $maakuntaKoodi")
      throw new HallintoOikeusNotFoundException(s"Hallinto-oikeutta ei löytynyt maakunnalle: $maakuntaKoodi")
    }

    hallintoOikeusRepository.findById(mapping.hallintoOikeusId).getOrElse {
      LOG.error(s"Hallinto-oikeus ei löytynyt ID:llä: ${mapping.hallintoOikeusId}")
      throw new HallintoOikeusNotFoundException(s"Hallinto-oikeus ei löytynyt ID:llä: ${mapping.hallintoOikeusId}")
    }
  }

  // Jäsentää koodisto-palvelun vastauksen ja poimii maakuntakoodin
  private def parseMaakuntaFromRelations(response: String): Option[String] = {
    try {
      val jsonResponse = parse(response)

      jsonResponse match {
        case JArray(relations) =>
          relations.flatMap { relation =>
            for {
              koodiUri  <- (relation \ "koodiUri").extractOpt[String]
              koodiArvo <- (relation \ "koodiArvo").extractOpt[String]
              tila      <- (relation \ "tila").extractOpt[String]
              if koodiUri.startsWith("maakunta_") && tila == "HYVAKSYTTY"
            } yield koodiArvo
          }.headOption
        case _ =>
          LOG.error(s"Koodisto-palvelu API-vastaus ei ole taulukko")
          None
      }
    } catch {
      case e: Exception =>
        LOG.error(s"Koodisto-palvelu API-vastauksen jäsentäminen epäonnistui: ${e.getMessage}")
        None
    }
  }

  private def parseKoodistopalveluRelationResponse(response: String, kuntaKoodi: String): String = {
    parseMaakuntaFromRelations(response) match {
      case Some(maakuntaKoodi) =>
        LOG.debug(s"Löytyi maakunta $maakuntaKoodi kuntakoodille $kuntaKoodi")
        maakuntaKoodi
      case None =>
        LOG.error(s"Maakuntaa ei löytynyt kuntakoodille $kuntaKoodi API-vastauksesta")
        throw new HallintoOikeusNotFoundException(
          s"Hallinto-oikeutta ei löytynyt kunnalle $kuntaKoodi - kuntaa ei löydy koodistosta"
        )
    }
  }

}
