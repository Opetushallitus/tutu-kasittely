package fi.oph.tutu.backend.service

import fi.oph.tutu.backend.domain.*
import fi.oph.tutu.backend.repository.{AsiakirjaRepository, EsittelijaRepository, HakemusRepository}
import fi.oph.tutu.backend.domain.SortDef.{Asc, Desc, Undefined}
import fi.oph.tutu.backend.utils.Constants.*
import fi.oph.tutu.backend.utils.TutuJsonFormats
import org.json4s.*
import org.json4s.jackson.JsonMethods.*
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.stereotype.{Component, Service}

import java.time.format.DateTimeFormatter
import java.time.{LocalDateTime, ZoneId, ZonedDateTime}
import java.util.UUID

@Component
@Service
class HakemusService(
  hakemusRepository: HakemusRepository,
  esittelijaRepository: EsittelijaRepository,
  asiakirjaRepository: AsiakirjaRepository,
  hakemuspalveluService: HakemuspalveluService,
  onrService: OnrService,
  ataruHakemusParser: AtaruHakemusParser
) extends TutuJsonFormats {
  val LOG: Logger = LoggerFactory.getLogger(classOf[HakemusService])

  def tallennaHakemus(hakemus: UusiAtaruHakemus): UUID = {
    val ataruHakemus = hakemuspalveluService.haeHakemus(hakemus.hakemusOid) match {
      case Left(error: Throwable) =>
        throw error
      case Right(response: String) => parse(response).extract[AtaruHakemus]
    }

    val tutkinto_1_maakoodiUri = ataruHakemusParser.parseTutkinto1MaakoodiUri(ataruHakemus)

    val esittelija = tutkinto_1_maakoodiUri match {
      case Some(tutkinto_1_maakoodiUri) if tutkinto_1_maakoodiUri.nonEmpty =>
        esittelijaRepository.haeEsittelijaMaakoodiUrilla(tutkinto_1_maakoodiUri)
      case _ => None
    }

    val asiakirjaId = asiakirjaRepository.tallennaUudetAsiakirjatiedot(
      Asiakirja(),
      "Hakemuspalvelu"
    )
    val esittelijaId = esittelija.map(_.esittelijaId)

    val tallennettuAtaruHakemusId = hakemusRepository.tallennaHakemus(
      hakemus.hakemusOid,
      hakemus.hakemusKoskee,
      esittelijaId,
      asiakirjaId,
      "Hakemuspalvelu"
    )
    val tutkinnot = ataruHakemusParser.parseTutkinnot(tallennettuAtaruHakemusId, ataruHakemus)

    try {
      if (tutkinnot != null) {
        tutkinnot.foreach(tutkinto =>
          hakemusRepository.lisaaTutkintoSeparately(tallennettuAtaruHakemusId, tutkinto, "Hakemuspalvelu")
        )
      }
    } catch {
      case e: Exception =>
        LOG.error(s"Virhe tutkintojen tallennuksessa hakemukselle ${hakemus.hakemusOid}: ${e.getMessage}", e)
    }
    tallennettuAtaruHakemusId
  }

  def haeHakemus(hakemusOid: HakemusOid): Option[Hakemus] = {
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

    val ataruHakija    = ataruHakemusParser.parseHakija(ataruHakemus)
    val hakija: Hakija = onrService.haeHenkilo(ataruHakija.henkiloOid) match {
      case Right(henkilo) =>
        henkilo.hetu match {
          case Some(hetu) =>
            Hakija(
              henkiloOid = henkilo.oidHenkilo,
              etunimet = ataruHakija.etunimet,
              kutsumanimi = ataruHakija.kutsumanimi,
              sukunimi = ataruHakija.sukunimi,
              kansalaisuus = henkilo.kansalaisuus match {
                case koodit =>
                  koodit.flatMap(koodi => ataruHakemusParser.countryCode2Name(Some(koodi.kansalaisuusKoodi)))
                case null => ataruHakija.kansalaisuus
              },
              hetu = henkilo.hetu,
              syntymaaika = ataruHakija.syntymaaika,
              matkapuhelin = ataruHakija.matkapuhelin,
              asuinmaa = ataruHakija.asuinmaa,
              katuosoite = ataruHakija.katuosoite,
              postinumero = ataruHakija.postinumero,
              postitoimipaikka = ataruHakija.postitoimipaikka,
              kotikunta = ataruHakija.kotikunta,
              sahkopostiosoite = ataruHakija.sahkopostiosoite,
              yksiloityVTJ = true
            )
          case _ => ataruHakija
        }
      case _ => ataruHakija
    }

    hakemusRepository.haeHakemus(hakemusOid) match {
      case Some(dbHakemus) =>
        Some(
          Hakemus(
            hakemusOid = dbHakemus.hakemusOid.toString,
            lomakeOid = lomake.key,
            lomakkeenKieli = ataruHakemus.lang,
            hakija = hakija,
            sisalto = ataruHakemusParser.parseSisalto(ataruHakemus, lomake),
            liitteidenTilat = ataruHakemus.`application-hakukohde-attachment-reviews`,
            hakemusKoskee = dbHakemus.hakemusKoskee,
            asiatunnus = dbHakemus.asiatunnus,
            kirjausPvm = Some(
              ZonedDateTime
                .parse(ataruHakemus.created, DateTimeFormatter.ofPattern(DATE_TIME_FORMAT))
                .withZoneSameInstant(ZoneId.systemDefault())
                .toLocalDateTime
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
            muutosHistoria = Seq(),
            taydennyspyyntoLahetetty = ataruHakemus.`information-request-timestamp` match {
              case None            => None
              case Some(timestamp) =>
                Some(LocalDateTime.parse(timestamp, DateTimeFormatter.ofPattern(DATE_TIME_FORMAT)))
            },
            yhteistutkinto = dbHakemus.yhteistutkinto,
            tutkinnot = hakemusRepository.haeTutkinnotHakemusIdilla(dbHakemus.id),
            asiakirja = asiakirjaRepository.haeKaikkiAsiakirjaTiedot(dbHakemus.asiakirjaId) match {
              case Some((asiakirjaTiedot, pyydettavatAsiakirjat, asiakirjamallitTutkinnoista)) =>
                Some(
                  new Asiakirja(
                    asiakirjaTiedot,
                    pyydettavatAsiakirjat,
                    asiakirjamallitTutkinnoista
                  )
                )
              case _ =>
                None
            }
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
    vaihe: Option[String],
    sort: String
  ): Seq[HakemusListItem] = {
    val vaiheet: Option[Seq[String]] = vaihe match {
      case None        => None
      case Some(vaihe) => Some(vaihe.split(",").map(_.trim).toSeq)
    }

    val userOids: Option[Seq[String]] = userOid match {
      case None       => None
      case Some(oids) => Some(oids.split(",").map(_.trim).toSeq)
    }

    val hakemusKoskeeParams: Option[Seq[String]] = hakemuskoskee match {
      case None     => None
      case Some(hk) => Some(hk.split(",").map(_.trim).toSeq)
    }

    // jos hakemusKoskee = 4, kyseessä on Kelpoisuus ammattiin (AP-hakemus) -hakemus (hakemusKoskee = 1, apHakemus = true):
    val hakemusKoskeeQueryParams = hakemusKoskeeParams match {
      case Some(params) =>
        Some(params.map {
          case "4"   => "1"
          case param => param
        }.distinct)
      case None => hakemusKoskeeParams
    }

    val apHakemusQueryParam = hakemusKoskeeParams match {
      case Some(params) => params.contains("4")
      case None         => false
    }

    val hakemusOidit: Seq[HakemusOid] =
      hakemusRepository.haeHakemusOidit(userOids, hakemusKoskeeQueryParams, vaiheet, apHakemusQueryParam)

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

    val hakemusList = hakemusRepository
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
                viimeinenAsiakirjaHakijalta = item.viimeinenAsiakirjaHakijalta.map(dateStr => dateStr.split(" ").head),
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
    sort match {
      case null => hakemusList
      case _    => {

        val sortParam = sort.split(":").headOption.getOrElse("undefined")
        val sortDef   = SortDef.fromString(sort.split(":").lastOption.getOrElse("undefined"))

        val sortedList: Seq[HakemusListItem] = sortDef match {
          case SortDef.Asc =>
            sortParam match {
              case "hakija"         => hakemusList.sortBy(_.hakija)
              case "asiatunnus"     => hakemusList.sortBy(_.asiatunnus)
              case "esittelija"     => hakemusList.sortBy(_.esittelijaKutsumanimi)
              case "kasittelyvaihe" => hakemusList.sortBy(_.kasittelyVaihe)
              case "hakemusKoskee"  =>
                hakemusList.sortBy(item => hakemusKoskeeOrder.getOrElse(item.hakemusKoskee, Int.MaxValue))
              case "kokonaisaika" => hakemusList.sortBy(_.aika).reverse
              case "hakijanaika"  => hakemusList.sortBy(_.viimeinenAsiakirjaHakijalta).reverse

              case _ => hakemusList
            }
          case SortDef.Desc =>
            sortParam match {
              case "hakija"         => hakemusList.sortBy(_.hakija).reverse
              case "asiatunnus"     => hakemusList.sortBy(_.asiatunnus).reverse
              case "esittelija"     => hakemusList.sortBy(_.esittelijaKutsumanimi).reverse
              case "kasittelyvaihe" => hakemusList.sortBy(_.kasittelyVaihe).reverse
              case "hakemusKoskee"  =>
                hakemusList.sortBy(item => hakemusKoskeeOrder.getOrElse(item.hakemusKoskee, Int.MaxValue)).reverse
              case "kokonaisaika" => hakemusList.sortBy(_.aika)
              case "hakijanaika"  => hakemusList.sortBy(_.viimeinenAsiakirjaHakijalta)
              case _              => hakemusList
            }
          case SortDef.Undefined => hakemusList
        }
        sortedList
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
        // Tallennetaan / poistetaan tutkinnot
        partialHakemus.tutkinnot match {
          case None            => ()
          case Some(tutkinnot) =>
            val tallennetutTutkinnot = hakemusRepository.haeTutkinnotHakemusIdilla(dbHakemus.id)
            hakemusRepository.suoritaTutkintojenModifiointi(
              dbHakemus.id,
              HakemusModifyOperationResolver.resolveTutkintoModifyOperations(tallennetutTutkinnot, tutkinnot),
              userOid
            )
        }

        val newOrUpdatedAsiakirjaId = partialHakemus.asiakirja match {
          case Some(asiakirja) =>
            paivitaTaiLisaaAsiakirjatiedot(dbHakemus.asiakirjaId, asiakirja, userOid)
          case _ => None
        }

        val modifiedHakemus = dbHakemus.copy(
          asiakirjaId = newOrUpdatedAsiakirjaId.orElse(dbHakemus.asiakirjaId),
          hakemusKoskee = partialHakemus.hakemusKoskee.getOrElse(dbHakemus.hakemusKoskee),
          asiatunnus = partialHakemus.asiatunnus.orElse(dbHakemus.asiatunnus),
          esittelijaId = esittelijaId.orElse(dbHakemus.esittelijaId),
          yhteistutkinto = partialHakemus.yhteistutkinto.getOrElse(dbHakemus.yhteistutkinto)
        )
        hakemusRepository.paivitaPartialHakemus(
          hakemusOid,
          modifiedHakemus,
          userOid.toString
        )
      }
    }
  }

  private def paivitaTaiLisaaAsiakirjatiedot(
    currentAsiakirjaId: Option[UUID],
    toBeAsiakirjaTiedot: PartialAsiakirja,
    luojaTaiMuokkaaja: UserOid
  ): Option[UUID] = {
    asiakirjaRepository.haeKaikkiAsiakirjaTiedot(currentAsiakirjaId) match {
      case Some((dbAsiakirjaTiedot, dbPyydettavatAsiakirjat, dbAsiakirjamallitTutkinnoista)) =>
        val updatedAsiakirjaTiedot = dbAsiakirjaTiedot.mergeWithUpdatedAsiakirja(toBeAsiakirjaTiedot)
        if (updatedAsiakirjaTiedot != dbAsiakirjaTiedot) {
          asiakirjaRepository.paivitaAsiakirjaTiedot(
            updatedAsiakirjaTiedot,
            luojaTaiMuokkaaja
          )
        }
        toBeAsiakirjaTiedot.pyydettavatAsiakirjat.foreach { pyydettavatAsiakirjat =>
          asiakirjaRepository.suoritaPyydettavienAsiakirjojenModifiointi(
            currentAsiakirjaId.get,
            HakemusModifyOperationResolver
              .resolvePyydettavatAsiakirjatModifyOperations(dbPyydettavatAsiakirjat, pyydettavatAsiakirjat),
            luojaTaiMuokkaaja
          )
        }
        toBeAsiakirjaTiedot.asiakirjamallitTutkinnoista.foreach { asiakirjamallitTutkinnoista =>
          asiakirjaRepository.suoritaAsiakirjamallienModifiointi(
            currentAsiakirjaId.get,
            HakemusModifyOperationResolver
              .resolveAsiakirjamalliModifyOperations(dbAsiakirjamallitTutkinnoista, asiakirjamallitTutkinnoista),
            luojaTaiMuokkaaja
          )
        }
        None
      case None =>
        val asiakirjaId = asiakirjaRepository.tallennaUudetAsiakirjatiedot(
          new Asiakirja(toBeAsiakirjaTiedot),
          luojaTaiMuokkaaja.toString()
        )
        toBeAsiakirjaTiedot.pyydettavatAsiakirjat.foreach { pyydettavatAsiakirjat =>
          asiakirjaRepository.suoritaPyydettavienAsiakirjojenModifiointi(
            asiakirjaId,
            PyydettavaAsiakirjaModifyData(pyydettavatAsiakirjat, Seq(), Seq()),
            luojaTaiMuokkaaja
          )
        }
        toBeAsiakirjaTiedot.asiakirjamallitTutkinnoista.foreach { asiakirjamallitTutkinnoista =>
          asiakirjaRepository.suoritaAsiakirjamallienModifiointi(
            asiakirjaId,
            AsiakirjamalliModifyData(asiakirjamallitTutkinnoista, Map(), Seq()),
            luojaTaiMuokkaaja
          )
        }
        Some(asiakirjaId)
    }
  }
}
