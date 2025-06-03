package fi.oph.tutu.backend.service

import fi.oph.tutu.backend.domain.*
import fi.oph.tutu.backend.repository.{EsittelijaRepository, HakemusRepository}
import org.json4s.*
import org.json4s.jackson.JsonMethods.*
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.stereotype.{Component, Service}

implicit val formats: Formats = DefaultFormats

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

  def haeHakemusLista(userOid: Option[String], hakemuskoskee: Option[String]): Seq[HakemusListItem] = {
    val hakemusOidit: Seq[HakemusOid] = hakemusRepository.haeHakemusOidit(userOid, hakemuskoskee)

    // Jos hakemusOideja ei löydy, palautetaan tyhjä lista
    if (hakemusOidit.isEmpty) {
      LOG.info(
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
                aika = "2 kk",
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
}
