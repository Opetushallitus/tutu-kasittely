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
            lomakeOid = lomake.key,
            hakija = hakija,
            sisalto = ataruHakemusParser.parseSisalto(ataruHakemus, lomake),
            liitteidenTilat = ataruHakemus.`application-hakukohde-attachment-reviews`,
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
            muutosHistoria = muutosHistoria,
            taydennyspyyntoLahetetty = ataruHakemus.`information-request-timestamp` match {
              case None            => None
              case Some(timestamp) =>
                Some(LocalDateTime.parse(timestamp, DateTimeFormatter.ofPattern(DATE_TIME_FORMAT)))
            },
            pyydettavatAsiakirjat =
              hakemusRepository.haePyydettavatAsiakirjatHakemusOidilla(dbHakemus.hakemusOid) match {
                case asiakirjat => asiakirjat
                case null       => Seq.empty
              },
            allekirjoituksetTarkistettu = dbHakemus.allekirjoituksetTarkistettu,
            allekirjoituksetTarkistettuLisatiedot = dbHakemus.allekirjoituksetTarkistettuLisatiedot,
            alkuperaisetAsiakirjatSaatuNahtavaksi = dbHakemus.alkuperaisetAsiakirjatSaatuNahtavaksi,
            alkuperaisetAsiakirjatSaatuNahtavaksiLisatiedot = dbHakemus.alkuperaisetAsiakirjatSaatuNahtavaksiLisatiedot,
            selvityksetSaatu = dbHakemus.selvityksetSaatu,
            asiakirjamallitTutkinnoista =
              hakemusRepository.haeAsiakirjamallitTutkinnoistaHakemusOidilla(dbHakemus.id) match {
                case asiakirjamallit => asiakirjamallit
                case null            => Map()
              },
            imiPyynto = ImiPyynto(
              imiPyynto = dbHakemus.imiPyynto,
              imiPyyntoNumero = dbHakemus.imiPyyntoNumero,
              imiPyyntoLahetetty = dbHakemus.imiPyyntoLahetetty,
              imiPyyntoVastattu = dbHakemus.imiPyyntoVastattu
            ),
            apHakemus = dbHakemus.apHakemus
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

    // jos hakemusKoskee = 4, kyseessä on Kelpoisuus ammattiin (AP-hakemus) -hakemus (hakemusKoskee = 1, apHakemus = true):
    val hakemusKoskeeQueryParam = hakemuskoskee match {
      case Some("4") => Some("1")
      case _         => hakemuskoskee
    }

    val apHakemusQueryParam = hakemuskoskee match {
      case Some("4") => true
      case _         => false
    }

    val hakemusOidit: Seq[HakemusOid] =
      hakemusRepository.haeHakemusOidit(userOid, hakemusKoskeeQueryParam, vaiheet, apHakemusQueryParam)

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
                muokattu = item.muokattu,
                taydennyspyyntoLahetetty = ataruHakemus.`information-request-timestamp`,
                apHakemus = item.apHakemus
              )
            )
        }
      }
  }

  def paivitaHakemus(hakemusOid: HakemusOid, partialHakemus: PartialHakemus, userOid: UserOid): HakemusOid = {
    val esittelijaId = partialHakemus.esittelijaOid match {
      case None                => None
      case Some(esittelijaOid) =>
        esittelijaRepository.haeEsittelijaOidilla(esittelijaOid) match {
          case Some(esittelija) => Some(esittelija.esittelijaId)
          case None             =>
            LOG.warn(s"Esittelijää ei löytynyt oidilla: ${partialHakemus.esittelijaOid}")
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
        // Tallennetaan / poistetaan pyydettävät asiakirjat
        partialHakemus.pyydettavatAsiakirjat match {
          case None             => ()
          case Some(asiakirjat) =>
            val tallennetutAsiakirjat = hakemusRepository.haePyydettavatAsiakirjatHakemusOidilla(hakemusOid)

            // Lisätään uudet asiakirjat
            val uudetAsiakirjat = asiakirjat.filterNot(asiakirja => tallennetutAsiakirjat.exists(_.id == asiakirja.id))
            if (uudetAsiakirjat.nonEmpty) {
              uudetAsiakirjat.foreach(asiakirja =>
                hakemusRepository.luoPyydettavaAsiakirja(hakemusOid, asiakirja.asiakirjanTyyppi, userOid)
              )
            }

            // Päivitetään olemassa olevat asiakirjat
            val paivitettavatAsiakirjat =
              asiakirjat.filter(asiakirja =>
                tallennetutAsiakirjat.exists(tallennettuAsiakirja =>
                  tallennettuAsiakirja.id == asiakirja.id && tallennettuAsiakirja.asiakirjanTyyppi != asiakirja.asiakirjanTyyppi
                )
              )
            if (paivitettavatAsiakirjat.nonEmpty) {
              paivitettavatAsiakirjat.foreach { asiakirja =>
                hakemusRepository.paivitaPyydettavaAsiakirja(
                  asiakirja.id.get,
                  asiakirja.asiakirjanTyyppi,
                  userOid
                )
              }
            }

            // Poistetaan asiakirjat
            val poistettavatAsiakirjat =
              tallennetutAsiakirjat.filterNot(asiakirja => asiakirjat.exists(_.id == asiakirja.id))
            if (poistettavatAsiakirjat.nonEmpty) {
              poistettavatAsiakirjat.foreach(asiakirja => hakemusRepository.poistaPyydettavaAsiakirja(asiakirja.id.get))
            }
        }

        partialHakemus.asiakirjamallitTutkinnoista match {
          case None                      => ()
          case Some(toBeAsiakirjaMallit) =>
            val currentAsiakirjamallit   = hakemusRepository.haeAsiakirjamallitTutkinnoistaHakemusOidilla(dbHakemus.id)
            val asiakirjamalliModifyData = HakemusModifyOperationResolver.resolveAsiakirjamalliModifyOperations(
              currentAsiakirjamallit,
              toBeAsiakirjaMallit
            )
            hakemusRepository.suoritaAsiakirjamallienModifiointi(dbHakemus.id, asiakirjamalliModifyData, userOid)
        }

        val modifiedHakemus = dbHakemus.copy(
          hakemusKoskee = partialHakemus.hakemusKoskee.getOrElse(dbHakemus.hakemusKoskee),
          asiatunnus = partialHakemus.asiatunnus.orElse(dbHakemus.asiatunnus),
          allekirjoituksetTarkistettu =
            partialHakemus.allekirjoituksetTarkistettu.getOrElse(dbHakemus.allekirjoituksetTarkistettu),
          allekirjoituksetTarkistettuLisatiedot = partialHakemus.allekirjoituksetTarkistettuLisatiedot.orElse(
            dbHakemus.allekirjoituksetTarkistettuLisatiedot
          ),
          esittelijaId = esittelijaId.orElse(dbHakemus.esittelijaId),
          alkuperaisetAsiakirjatSaatuNahtavaksi = partialHakemus.alkuperaisetAsiakirjatSaatuNahtavaksi.getOrElse(
            dbHakemus.alkuperaisetAsiakirjatSaatuNahtavaksi
          ),
          alkuperaisetAsiakirjatSaatuNahtavaksiLisatiedot =
            partialHakemus.alkuperaisetAsiakirjatSaatuNahtavaksiLisatiedot.orElse(
              dbHakemus.alkuperaisetAsiakirjatSaatuNahtavaksiLisatiedot
            ),
          selvityksetSaatu = partialHakemus.selvityksetSaatu.getOrElse(dbHakemus.selvityksetSaatu),
          imiPyynto = partialHakemus.imiPyynto match {
            case Some(imiPyynto) =>
              imiPyynto.imiPyynto match {
                case Some(value) => Some(value)
                case None        => None
              }
            case None =>
              dbHakemus.imiPyynto
          },
          imiPyyntoNumero = partialHakemus.imiPyynto match {
            case Some(imiPyynto) =>
              imiPyynto.imiPyynto match {
                case Some(true) => imiPyynto.imiPyyntoNumero
                case _          => None
              }
            case None =>
              dbHakemus.imiPyyntoNumero
          },
          imiPyyntoLahetetty = partialHakemus.imiPyynto match {
            case Some(imiPyynto) =>
              imiPyynto.imiPyynto match {
                case Some(true) => imiPyynto.imiPyyntoLahetetty
                case _          => None
              }
            case None =>
              dbHakemus.imiPyyntoLahetetty
          },
          imiPyyntoVastattu = partialHakemus.imiPyynto match {
            case Some(imiPyynto) =>
              imiPyynto.imiPyynto match {
                case Some(true) => imiPyynto.imiPyyntoVastattu
                case _          => None
              }
            case None =>
              dbHakemus.imiPyyntoVastattu
          },
          apHakemus = partialHakemus.apHakemus.orElse(dbHakemus.apHakemus)
        )
        hakemusRepository.paivitaPartialHakemus(
          hakemusOid,
          modifiedHakemus,
          userOid.toString
        )
      }
    }
  }
}
