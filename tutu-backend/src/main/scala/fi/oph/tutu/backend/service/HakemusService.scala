package fi.oph.tutu.backend.service

import fi.oph.tutu.backend.domain.*
import fi.oph.tutu.backend.domain.SortDef.{Asc, Desc, Undefined}
import fi.oph.tutu.backend.repository.{EsittelijaRepository, HakemusRepository}
import fi.oph.tutu.backend.utils.Constants.*
import fi.oph.tutu.backend.utils.TutuJsonFormats
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
  onrService: OnrService,
  ataruHakemusParser: AtaruHakemusParser
) extends TutuJsonFormats {
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

  def haeHakemus(hakemusOid: HakemusOid, muutosHistoriaSortDef: SortDef = Undefined): Option[Hakemus] = {
    val ataruHakemus = hakemuspalveluService.haeHakemus(hakemusOid) match {
      case Left(error: Throwable) =>
        error match {
          case e: NotFoundException =>
            return None
          case _ =>
            throw error
        }
      case Right(response: String) => parse(response).extract[AtaruHakemus]
    }

    val lomake = hakemuspalveluService.haeLomake(ataruHakemus.form_id) match {
      case Left(error: Throwable) =>
        LOG.warn(s"Ataru-lomakkeen haku epäonnistui lomake-id:llä ${ataruHakemus.form_id}: ", error.getMessage)
        return None
      case Right(response: String) => parse(response).extract[AtaruLomake]
    }

    val hakija         = ataruHakemusParser.parseHakija(ataruHakemus)
    var muutosHistoria = hakemuspalveluService.haeMuutoshistoria(hakemusOid) match {
      case Left(error: Throwable) =>
        LOG.warn(s"Ataru-hakemuksen muutoshistorian haku epäonnistui hakemusOidille $hakemusOid: {}", error.getMessage)
        throw error
      case Right(response: String) =>
        resolveMuutoshistoria(response, hakija)
    }
    muutosHistoria = muutosHistoriaSortDef match {
      case Desc => muutosHistoria.sortBy(_.time)(Ordering[LocalDateTime].reverse)
      case Asc  => muutosHistoria.sortBy(_.time)
      case _    => muutosHistoria
    }

    hakemusRepository.haeHakemus(hakemusOid) match {
      case Some(dbHakemus) =>
        Some(
          Hakemus(
            hakemusOid = dbHakemus.hakemusOid.toString,
            hakija = hakija,
            sisalto = ataruHakemusParser.parseSisalto(ataruHakemus, lomake),
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
            },
            ataruHakemuksenTila = AtaruHakemuksenTila.fromString(
              ataruHakemus.`application-hakukohde-reviews`
                .collectFirst(review => review.state)
                .getOrElse(AtaruHakemuksenTila.UNDEFINED)
            ),
            kasittelyVaihe = dbHakemus.kasittelyVaihe,
            muokattu = dbHakemus.muokattu,
            muutosHistoria = muutosHistoria
          )
        )
      case None =>
        LOG.warn(s"Hakemusta ei löytynyt tietokannasta hakemusOidille: $hakemusOid")
        None
    }
  }

  private def resolveMuutoshistoria(jsonString: String, hakija: Hakija): Seq[MuutosHistoriaItem] = {
    parse(jsonString) match {
      case JArray(rawItems) =>
        val relevant = rawItems.filter { item =>
          MuutosHistoriaRoleType.isRelevant((item \ "type").extract[String])
        }
        relevant.map(item => {
          val roleType = (item \ "type").extract[String]
          val time = LocalDateTime.parse((item \ "time").extract[String], DateTimeFormatter.ofPattern(DATE_TIME_FORMAT))
          val esittelijaOid                       = (item \ "virkailijaOid").extractOpt[String]
          val (etunimi: String, sukunimi: String) = esittelijaOid match {
            case None                => (hakija.kutsumanimi, hakija.sukunimi)
            case Some(esittelijaOid) =>
              onrService.haeHenkilo(esittelijaOid) match {
                case Left(error) =>
                  LOG.warn(
                    s"Ataru-hakemuksen editoijan haku epäonnistui esittelijaOidille $esittelijaOid: {}",
                    error.getMessage
                  )
                  ("", "")
                case Right(henkilo) => (henkilo.kutsumanimi, henkilo.sukunimi)
              }

          }
          val editoija = s"$etunimi $sukunimi".trim
          MuutosHistoriaItem(MuutosHistoriaRoleType.fromString(roleType), time, editoija)
        })
      case _ => throw new MappingException(s"Cannot deserialize muutoshistoria response")
    }
  }

  def haeHakemusLista(
    userOid: Option[String],
    hakemuskoskee: Option[String],
    vaihe: Option[String]
  ): Seq[HakemusListItem] = {
    val vaiheet: Option[Seq[String]] = vaihe match {
      case None        => None
      case Some(vaihe) => Some(vaihe.split(",").map(_.trim).toSeq)
    }
    val hakemusOidit: Seq[HakemusOid] = hakemusRepository.haeHakemusOidit(userOid, hakemuskoskee, vaiheet)

    // Jos hakemusOideja ei löydy, palautetaan tyhjä lista
    if (hakemusOidit.isEmpty) {
      LOG.warn(
        "Hakemuksia ei löytynyt parametreillä: " + userOid.getOrElse("None") + ", " + hakemuskoskee.getOrElse("None")
      )
      return Seq.empty[HakemusListItem]
    }

    // Datasisältöhaku eri palveluista (Ataru, TUTU, ...)
    val ataruHakemukset = hakemuspalveluService.haeHakemukset(hakemusOidit) match {
      case Left(error)     => throw error
      case Right(response) => {
        parse(response).extract[Seq[AtaruHakemus]]
      }
    }

    hakemusRepository
      .haeHakemusLista(hakemusOidit)
      .flatMap { item =>
        val ataruHakemus = ataruHakemukset.find(hakemus => hakemus.key == item.hakemusOid)

        val esittelija = item.esittelijaOid match {
          case None                => (null, null)
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
                aika = ataruHakemus.created,
                hakemusOid = item.hakemusOid,
                hakemusKoskee = item.hakemusKoskee,
                esittelijaOid = item.esittelijaOid,
                esittelijaKutsumanimi = esittelija(0),
                esittelijaSukunimi = esittelija(1),
                kasittelyVaihe = item.kasittelyVaihe,
                muokattu = item.muokattu
              )
            )
        }
      }
  }

  def paivitaHakemus(hakemusOid: HakemusOid, hakemus: PartialHakemus, userOid: UserOid): HakemusOid = {
    val esittelijaId = hakemus.esittelijaOid match {
      case None                => None
      case Some(esittelijaOid) =>
        esittelijaRepository.haeEsittelijaOidilla(esittelijaOid) match {
          case Some(esittelija) => Some(esittelija.esittelijaId)
          case None             =>
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
