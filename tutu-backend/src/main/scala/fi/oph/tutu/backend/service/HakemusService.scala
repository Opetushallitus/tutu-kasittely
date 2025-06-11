package fi.oph.tutu.backend.service

import fi.oph.tutu.backend.domain.*
import fi.oph.tutu.backend.repository.{EsittelijaRepository, HakemusRepository}
import fi.oph.tutu.backend.utils.Constants.*
import org.json4s.*
import org.json4s.jackson.JsonMethods.*
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.stereotype.{Component, Service}

import java.time.LocalDateTime
import java.time.format.DateTimeFormatter
import java.util.UUID

@Component
@Service
class HakemusService(
  hakemusRepository: HakemusRepository,
  esittelijaRepository: EsittelijaRepository,
  hakemuspalveluService: HakemuspalveluService,
  onrService: OnrService
) {
  val LOG: Logger = LoggerFactory.getLogger(classOf[HakemusService])

  def tallennaHakemus(hakemus: UusiAtaruHakemus): UUID = {
    esittelijaRepository.haeEsittelijaMaakoodilla(hakemus.maakoodi) match {
      case Some(esittelija) =>
        hakemusRepository.tallennaHakemus(
          hakemus.hakemusOid,
          hakemus.hakemusKoskee,
          Some(esittelija.esittelijaId),
          "Hakemuspalvelu"
        )
      case None => hakemusRepository.tallennaHakemus(hakemus.hakemusOid, hakemus.hakemusKoskee, None, "Hakemuspalvelu")
    }
  }

  def haeHakemus(hakemusOid: HakemusOid): Option[Hakemus] = {
    val ataruHakemus = hakemuspalveluService.haeHakemus(hakemusOid) match {
      case Left(error: Throwable) =>
        LOG.warn(s"Ataru-hakemuksen haku epäonnistui hakemusOidille $hakemusOid: ", error.getMessage)
        return None
      case Right(response: String) => parse(response).extract[AtaruHakemus]
    }

    hakemusRepository.haeHakemus(hakemusOid) match {
      case Some(dbHakemus) =>
        Some(
          Hakemus(
            hakemusOid = dbHakemus.hakemusOid.toString,
            hakijanEtunimet = ataruHakemus.etunimet,
            hakijanSukunimi = ataruHakemus.sukunimi,
            hakijanHetu = ataruHakemus.henkilotunnus match {
              case None       => None
              case Some(hetu) => Some(hetu)
            },
            hakemusKoskee = dbHakemus.hakemusKoskee,
            asiatunnus = dbHakemus.asiatunnus,
            kirjausPvm = Some(
              LocalDateTime.parse(ataruHakemus.created, DateTimeFormatter.ofPattern(DATE_TIME_FORMAT))
            ),
            // TODO: esittelyPvm, paatosPvm.
            esittelyPvm = None,
            paatosPvm = None,
            esittelijaOid = dbHakemus.esittelijaOid match {
              case None                => None
              case Some(esittelijaOid) => Some(esittelijaOid.toString)
            }
          )
        )
      case None =>
        LOG.warn(s"Hakemusta ei löytynyt tietokannasta hakemusOidille: $hakemusOid")
        None
    }
  }

  def haeHakemusLista(userOid: Option[String], hakemuskoskee: Option[String]): Seq[HakemusListItem] = {
    val hakemusOidit: Seq[HakemusOid] = hakemusRepository.haeHakemusOidit(userOid, hakemuskoskee)

    // Jos hakemusOideja ei löydy, palautetaan tyhjä lista
    if (hakemusOidit.isEmpty) {
      LOG.warn(
        "Hakemuksia ei löytynyt parametreillä: " + userOid.getOrElse("None") + ", " + hakemuskoskee.getOrElse("None")
      )
      return Seq.empty[HakemusListItem]
    }

    // Datasisältöhaku eri palveluista (Ataru, TUTU, ...)
    val ataruHakemukset = hakemuspalveluService.haeHakemukset(hakemusOidit) match {
      case Left(error) => LOG.error(error.getMessage); Seq.empty[AtaruHakemus]
      case Right(response) => {
        parse(response).extract[Seq[AtaruHakemus]]
      }
    }

    hakemusRepository
      .haeHakemusLista(hakemusOidit)
      .flatMap { item =>
        val ataruHakemus = ataruHakemukset.find(hakemus => hakemus.key == item.hakemusOid)

        val esittelija = item.esittelijaOid match {
          case None => (null, null)
          case Some(esittelijaOid) =>
            onrService.haeHenkilo(item.esittelijaOid.get) match {
              case Left(error)    => (null, null)
              case Right(henkilo) => (henkilo.kutsumanimi, henkilo.sukunimi)
            }
        }

        ataruHakemus match {
          case None =>
            LOG.warn(
              s"Atarusta ei löytynyt hakemusta TUTU-hakemusOidille: ${item.hakemusOid}, ei näytetä hakemusta listassa."
            )
            None
          case Some(ataruHakemus) =>
            Some(
              HakemusListItem(
                asiatunnus = item.asiatunnus,
                hakija = s"${ataruHakemus.etunimet} ${ataruHakemus.sukunimi}",
                vaihe = "Testi Vaihe",
                aika = ataruHakemus.created,
                hakemusOid = item.hakemusOid,
                hakemusKoskee = item.hakemusKoskee,
                esittelijaOid = item.esittelijaOid,
                esittelijaKutsumanimi = esittelija(0),
                esittelijaSukunimi = esittelija(1)
              )
            )
        }
      }
  }

  def paivitaHakemus(hakemusOid: HakemusOid, hakemus: PartialHakemus, userOid: UserOid): HakemusOid = {
    val esittelijaId = hakemus.esittelijaOid match {
      case None => None
      case Some(esittelijaOid) =>
        esittelijaRepository.haeEsittelijaOidilla(esittelijaOid) match {
          case Some(esittelija) => Some(esittelija.esittelijaId)
          case None =>
            LOG.warn(s"Esittelijää ei löytynyt oidilla: ${hakemus.esittelijaOid}")
            None
        }

    }

    hakemusRepository.haeHakemus(hakemusOid) match {
      case None => {
        LOG.warn(s"Hakemuksen päivitys epäonnistui, hakemusta ei löytynyt tietokannasta hakemusOidille: $hakemusOid")
        throw new RuntimeException(
          s"Hakemuksen päivitys epäonnistui, hakemusta ei löytynyt tietokannasta hakemusOidille: $hakemusOid"
        )
      }
      case Some(dbHakemus) => {
        val updatedHakemus = dbHakemus.copy(
          hakemusKoskee = hakemus.hakemusKoskee.getOrElse(dbHakemus.hakemusKoskee),
          asiatunnus = hakemus.asiatunnus.orElse(dbHakemus.asiatunnus),
          esittelijaId = esittelijaId.orElse(dbHakemus.esittelijaId)
        )
        hakemusRepository.paivitaPartialHakemus(hakemusOid, updatedHakemus, userOid.toString)
      }
    }
  }
}
