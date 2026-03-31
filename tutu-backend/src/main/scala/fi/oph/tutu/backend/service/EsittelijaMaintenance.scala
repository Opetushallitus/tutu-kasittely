package fi.oph.tutu.backend.service

import fi.oph.tutu.backend.domain.OnrUser
import fi.oph.tutu.backend.repository.EsittelijaRepository
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.context.annotation.Profile
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Component

/**
 * Pitää esittelija-taulun ajan tasalla kerran vuorokaudessa:
 *   1. Synkronoi aktiiviset OID:t käyttöoikeuspalvelusta (lisää uudet, poistaa poistuneet).
 *   2. Päivittää kutsumanimi + sukunimi ONR:stä kaikille DB-riveille.
 */
@Profile(Array("!test"))
@Component
class EsittelijaMaintenance(
  esittelijaRepository: EsittelijaRepository,
  kayttooikeusService: KayttooikeusService,
  onrService: OnrService
) {
  val LOG: Logger = LoggerFactory.getLogger(classOf[EsittelijaMaintenance])

  @Scheduled(fixedRateString = "${caching.spring.dayTTL}")
  def syncEsittelijat(): Unit = {
    LOG.info("Aloitetaan esittelijöiden synkronointi")

    val esittelijaOids = kayttooikeusService.haeEsittelijat match {
      case Left(error) =>
        LOG.error(s"Esittelijöiden OID-synkronointi epäonnistui: ${error.getMessage}", error)
        return
      case Right(oids) =>
        LOG.info(s"OID-synkronointi valmis, aktiivisia esittelijöitä: ${oids.size}")
        oids
    }

    var success = 0
    var failure = 0

    esittelijaOids.foreach { oid =>
      onrService.haeHenkilo(oid) match {
        case Right(henkilo) =>
          val esittelija = henkilo.toEsittelija
          esittelijaRepository.paivitaEsittelijaTiedot(
            oid,
            esittelija.etunimi,
            esittelija.sukunimi,
            esittelija.sahkoposti.orNull,
            esittelija.puhelinnumero.orNull
          )
          success += 1
        case Left(error) =>
          LOG.warn(s"Esittelijän $oid nimitietojen haku ONR:stä epäonnistui: ${error.getMessage}")
          failure += 1
      }
    }

    LOG.info(
      s"Esittelijöiden synkronointi valmis. " +
        s"Onnistui: $success, epäonnistui: $failure, yhteensä: ${esittelijaOids.size}"
    )
  }
}
