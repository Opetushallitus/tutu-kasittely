package fi.oph.tutu.backend.service

import fi.oph.tutu.backend.domain.*
import fi.oph.tutu.backend.domain.AtaruHakemuksenTila.TaydennysPyynto
import fi.oph.tutu.backend.repository.{
  AsiakirjaRepository,
  EsittelijaRepository,
  HakemusRepository,
  PaatosRepository,
  PerusteluRepository,
  TutkintoRepository,
  TutuDatabase
}
import fi.oph.tutu.backend.utils.Constants.*
import fi.oph.tutu.backend.utils.TutuJsonFormats
import fi.oph.tutu.backend.utils.Utility.{currentLocalDateTime, stringToIntSeq, stringToSeq, toLocalDateTime}
import org.json4s.*
import org.json4s.jackson.JsonMethods.*
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.stereotype.{Component, Service}
import slick.dbio.DBIO

import java.util.UUID
import scala.collection.mutable.ListBuffer
import scala.concurrent.ExecutionContext.Implicits.global
import scala.util.{Failure, Success, Try}

@Component
@Service
class HakemusService(
  hakemusRepository: HakemusRepository,
  esittelijaRepository: EsittelijaRepository,
  asiakirjaRepository: AsiakirjaRepository,
  perusteluRepository: PerusteluRepository,
  tutkintoRepository: TutkintoRepository,
  kasittelyVaiheService: KasittelyVaiheService,
  paatosRepository: PaatosRepository,
  hakemuspalveluService: HakemuspalveluService,
  onrService: OnrService,
  ataruHakemusParser: AtaruHakemusParser,
  userService: UserService,
  db: TutuDatabase
) extends TutuJsonFormats {
  val LOG: Logger = LoggerFactory.getLogger(classOf[HakemusService])

  def tallennaAtaruHakemus(hakemus: UusiAtaruHakemus): (UUID, Perustelu, Paatos) = {
    val ataruHakemus = haeAtaruHakemus(hakemus.hakemusOid)

    val tutkinto_1_maakoodiUri = ataruHakemusParser.parseTutkinto1MaakoodiUri(ataruHakemus)

    val esittelijaId = resolveEsittelijaId(tutkinto_1_maakoodiUri)

    // Rakennetaan transaktio, joka sisältää kaikki tietokantaoperaatiot
    val transactionalAction = for {
      asiakirjaId <- asiakirjaRepository.tallennaUudetAsiakirjatiedotAction(
        Asiakirja(),
        ATARU_SERVICE
      )
      hakemusId <- hakemusRepository.tallennaHakemusAction(
        hakemus.hakemusOid,
        hakemus.hakemusKoskee,
        ataruHakemus.form_id,
        esittelijaId,
        asiakirjaId,
        None,
        None,
        ATARU_SERVICE
      )
      tutkinnot = ataruHakemusParser.parseTutkinnot(hakemusId, ataruHakemus)
      _ <-
        if (tutkinnot != null && tutkinnot.nonEmpty) {
          DBIO.sequence(
            tutkinnot.map(tutkinto => tutkintoRepository.lisaaTutkinto(tutkinto, ATARU_SERVICE))
          )
        } else {
          DBIO.successful(Seq.empty)
        }
      savedPerustelu <- perusteluRepository.tallennaPerusteluAction(
        hakemusId,
        Perustelu(hakemusId = Some(hakemusId), jatkoOpintoKelpoisuusLisatieto = Some("")),
        TUTU_SERVICE
      )
      savedPaatos <- paatosRepository.tallennaPaatosAction(
        hakemusId,
        Paatos(hakemusId = Some(hakemusId)),
        TUTU_SERVICE
      )
    } yield (hakemusId, savedPerustelu, savedPaatos)

    luoKokonaishakemus(hakemus.hakemusOid, transactionalAction)
  }

  def luoLopullisenPaatoksenHakemus(
    hakemus: UusiAtaruHakemus
  ): (UUID, Paatos) = {
    val ataruHakemus             = haeAtaruHakemus(hakemus.hakemusOid)
    val suoritusMaaKoodiUri      = ataruHakemusParser.parseLopullinenPaatosSuoritusmaaMaakoodiUri(ataruHakemus)
    val vastaavaEhdollinenPaatos = ataruHakemusParser.parseLopullinenPaatosVastaavaEhdollinen(ataruHakemus)
    val esittelijaId             = resolveEsittelijaId(suoritusMaaKoodiUri)

    val transactionalAction = for {
      // TODO tarvitaanko lopulliselle päätökselle oma asiakirja-tyyppi?
      asiakirjaId <- asiakirjaRepository.tallennaUudetAsiakirjatiedotAction(
        Asiakirja(),
        ATARU_SERVICE
      )
      hakemusId <- hakemusRepository.tallennaHakemusAction(
        hakemus.hakemusOid,
        hakemus.hakemusKoskee,
        ataruHakemus.form_id,
        esittelijaId,
        asiakirjaId,
        vastaavaEhdollinenPaatos,
        suoritusMaaKoodiUri,
        ATARU_SERVICE
      )
      // TODO oma päätöstyypi lopulliselle päätökselle
      savedPaatos <- paatosRepository.tallennaPaatosAction(
        hakemusId,
        Paatos(hakemusId = Some(hakemusId)),
        TUTU_SERVICE
      )
    } yield (hakemusId, savedPaatos)

    luoKokonaishakemus(hakemus.hakemusOid, transactionalAction)
  }

  def onkoHakemusJoOlemassa(hakemusOid: HakemusOid): Boolean =
    hakemusRepository.onkoHakemusOlemassa(hakemusOid)

  def haeAtaruHakemus(hakemusOid: HakemusOid): AtaruHakemus = {
    hakemuspalveluService.haeHakemus(hakemusOid) match {
      case Left(error: Throwable) =>
        throw error
      case Right(response: String) => parse(response).extract[AtaruHakemus]
    }
  }

  private def resolveEsittelijaId(
    maaKoodiUri: Option[String]
  ): Option[UUID] = {
    val esittelija = maaKoodiUri match {
      case Some(maakoodiUri) if maakoodiUri.nonEmpty =>
        esittelijaRepository.haeEsittelijaMaakoodiUrilla(maakoodiUri)
      case _ => None
    }

    esittelija.map(_.esittelijaId)
  }

  private def luoKokonaishakemus[R](hakemusOid: HakemusOid, transactionalAction: DBIO[R]): R = {
    db.runTransactionally(transactionalAction, "luo_kokonaishakemus") match {
      case Success(result) =>
        LOG.info(s"Ataru-hakemuksen $hakemusOid kokonaisluonti onnistui")
        result
      case Failure(e) =>
        LOG.error(s"Ataru-hakemuksen $hakemusOid kokonaisluonti epäonnistui: ${e.getMessage}", e)
        throw new RuntimeException(
          s"Ataru-hakemuksen kokonaisluonti epäonnistui: ${e.getMessage}",
          e
        )
    }
  }

  private def paivitaTutkinnotAtaruHakemukselta(
    ataruHakemus: AtaruHakemus,
    dbHakemus: DbHakemus,
    dbTutkinnot: Seq[Tutkinto]
  ): Seq[Tutkinto] = {
    val ataruTutkinnot       = ataruHakemusParser.parseTutkinnot(dbHakemus.id, ataruHakemus)
    val ataruHakemusModified = toLocalDateTime(ataruHakemus.modified)

    ataruTutkinnot.foreach { ataruTutkinto =>
      dbTutkinnot.find(dbTutkinto => dbTutkinto.jarjestys == ataruTutkinto.jarjestys) match {
        // Ei tutkintoa järjestysnumerolla -> lisätään uusi
        case None                     => tutkintoRepository.suoritaLisaaTutkinto(ataruTutkinto, ATARU_SERVICE)
        case Some(existingDbTutkinto) =>
          existingDbTutkinto.muokkaaja match {
            // Jos ei muokattu virkailijan toimesta, ylikirjoitetaan, muuten päivitetään tarvittavat tiedot
            case Some(ATARU_SERVICE) | None =>
              if (existingDbTutkinto.muokattu.isEmpty || ataruHakemusModified.isAfter(existingDbTutkinto.muokattu.get))
                tutkintoRepository.suoritaPaivitaTutkinto(ataruTutkinto.copy(id = existingDbTutkinto.id), ATARU_SERVICE)
            case Some(value) =>
              if (
                (existingDbTutkinto.muokattu.isEmpty ||
                  ataruHakemusModified.isAfter(existingDbTutkinto.muokattu.get)) &&
                (existingDbTutkinto.todistusOtsikko != ataruTutkinto.todistusOtsikko
                  || existingDbTutkinto.aloitusVuosi != ataruTutkinto.aloitusVuosi
                  || existingDbTutkinto.paattymisVuosi != ataruTutkinto.paattymisVuosi)
              ) {
                tutkintoRepository.suoritaPaivitaTutkinto(
                  existingDbTutkinto.copy(
                    todistusOtsikko = ataruTutkinto.todistusOtsikko,
                    aloitusVuosi = ataruTutkinto.aloitusVuosi,
                    paattymisVuosi = ataruTutkinto.paattymisVuosi
                  ),
                  ataruTutkinto.muokkaaja.getOrElse(TUTU_SERVICE)
                )
              } else { 0 }
          }
      }
    }
    tutkintoRepository.haeTutkinnotHakemusOidilla(dbHakemus.hakemusOid)
  }

  def haeHakemus(hakemusOid: HakemusOid): Option[Hakemus] = {
    val ataruHakemus = Try(haeAtaruHakemus(hakemusOid)).toEither match {
      case Right(ataruHakemus)            => ataruHakemus
      case Left(error: NotFoundException) => return None
      case Left(error)                    => throw error
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
        val henkilo: String = dbHakemus.muokkaaja match {
          case None            => ""
          case Some(muokkaaja) =>
            onrService.haeHenkilo(muokkaaja) match {
              case Left(_)        => ""
              case Right(henkilo) => s"${henkilo.kutsumanimi} ${henkilo.sukunimi}"
            }
        }
        val tutuHakemus = Hakemus(
          hakemusOid = dbHakemus.hakemusOid.toString,
          lomakeOid = lomake.key,
          lomakeId = lomake.id,
          lomakkeenKieli = ataruHakemus.lang,
          hakija = hakija,
          sisalto = ataruHakemusParser.parseSisalto(ataruHakemus, lomake),
          liitteidenTilat = ataruHakemusParser.parseLiitteidenTilat(ataruHakemus, lomake),
          hakemusKoskee = dbHakemus.hakemusKoskee,
          asiatunnus = dbHakemus.asiatunnus,
          kirjausPvm = Some(toLocalDateTime(ataruHakemus.submitted)),
          // TODO: esittelyPvm, paatosPvm.
          esittelyPvm = None,
          paatosPvm = None,
          esittelijaOid = dbHakemus.esittelijaOid match {
            case None                => None
            case Some(esittelijaOid) => Some(esittelijaOid.toString)
          },
          ataruHakemuksenTila = ataruHakemus.hakemuksenTila(),
          ataruHakemustaMuokattu = Some(toLocalDateTime(ataruHakemus.modified)),
          kasittelyVaihe =
            dbHakemus.kasittelyVaihe, // (kasittelyVaihe lasketaan ja päivitetään aina kun hakemusta muokataan)
          muokattu = dbHakemus.muokattu,
          muokkaaja = henkilo,
          muutosHistoria = Seq(),
          taydennyspyyntoLahetetty = ataruHakemus.`information-request-timestamp` match {
            case None            => None
            case Some(timestamp) => Some(toLocalDateTime(timestamp))
          },
          yhteistutkinto = dbHakemus.yhteistutkinto,
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
          },
          lopullinenPaatosVastaavaEhdollinenAsiatunnus = dbHakemus.lopullinenPaatosVastaavaEhdollinenAsiatunnus,
          lopullinenPaatosVastaavaEhdollinenSuoritusmaaKoodiUri =
            dbHakemus.lopullinenPaatosVastaavaEhdollinenSuoritusmaaKoodiUri,
          esittelijanHuomioita = dbHakemus.esittelijanHuomioita,
          onkoPeruutettu = dbHakemus.onkoPeruutettu,
          peruutusPvm = dbHakemus.peruutusPvm,
          peruutusLisatieto = dbHakemus.peruutusLisatieto,
          viimeisinTaydennyspyyntoPvm = dbHakemus.viimeisinTaydennyspyyntoPvm
        )
        paivitaTutkinnotAtaruHakemukselta(
          ataruHakemus,
          dbHakemus,
          tutkintoRepository.haeTutkinnotHakemusOidilla(hakemusOid)
        )
        Some(tutuHakemus)
      case None =>
        LOG.warn(s"Hakemusta ei löytynyt tietokannasta hakemusOidille: $hakemusOid")
        None
    }
  }

  def haeHakemusLista(
    userOid: Option[String],
    hakemuskoskee: Option[String],
    vaihe: Option[String],
    sort: String
  ): Seq[HakemusListItem] = {
    val vaiheet: Seq[String] = vaihe.map(stringToSeq).getOrElse(Seq())

    val userOids: Seq[String] = userOid.map(stringToSeq).getOrElse(Seq())

    val hakemusKoskeeParams: Seq[Int] = hakemuskoskee.map(stringToIntSeq).getOrElse(Seq())

    // jos hakemusKoskee = 4, kyseessä on Kelpoisuus ammattiin (AP-hakemus) -hakemus (hakemusKoskee = 1, apHakemus = true):
    val hakemusKoskeeQueryParams = hakemusKoskeeParams.map(param => if (param == 4) 1 else param)
    val apHakemusQueryParam      = hakemusKoskeeParams.contains(4)

    val hakemusOidit: Seq[HakemusOid] =
      hakemusRepository.haeHakemusOidit(userOids, hakemusKoskeeQueryParams, vaiheet, apHakemusQueryParam)

    // Jos hakemusOideja ei löydy, palautetaan tyhjä lista
    if (hakemusOidit.isEmpty) {
      LOG.warn(
        "Hakemuksia ei löytynyt parametreillä: " + userOid.getOrElse("None") + ", " + hakemuskoskee.getOrElse(
          "None"
        ) + ", " + vaihe.getOrElse("None")
      )
      return Seq.empty[HakemusListItem]
    }

    // Datasisältöhaku eri palveluista (Ataru, TUTU, ...)
    val ataruHakemukset = hakemuspalveluService.haeHakemukset(hakemusOidit) match {
      case Left(error)     => throw error
      case Right(response) =>
        parse(response).extract[Seq[AtaruHakemus]]
    }

    val hakemusList = hakemusRepository
      .haeHakemusLista(hakemusOidit)
      .flatMap { hakemus =>
        val ataruHakemus = ataruHakemukset.find(ataruHakemus => ataruHakemus.key == hakemus.hakemusOid)

        val esittelija = hakemus.esittelijaOid match {
          case None                => (null, null)
          case Some(esittelijaOid) =>
            onrService.haeHenkilo(esittelijaOid) match {
              case Left(error)    => (null, null)
              case Right(henkilo) => (henkilo.kutsumanimi, henkilo.sukunimi)
            }
        }

        ataruHakemus match {
          case None =>
            LOG.warn(
              s"Atarusta ei löytynyt hakemusta TUTU-hakemusOidille: ${hakemus.hakemusOid}, ei näytetä hakemusta listassa."
            )
            None
          case Some(ataruHakemus) =>
            Some(
              HakemusListItem(
                asiatunnus = hakemus.asiatunnus,
                hakija = s"${ataruHakemus.etunimet} ${ataruHakemus.sukunimi}",
                aika = ataruHakemus.submitted,
                viimeinenAsiakirjaHakijalta =
                  hakemus.viimeinenAsiakirjaHakijalta.map(dateStr => dateStr.split(" ").head),
                hakemusOid = hakemus.hakemusOid,
                hakemusKoskee = hakemus.hakemusKoskee,
                esittelijaOid = hakemus.esittelijaOid,
                esittelijaKutsumanimi = esittelija(0),
                esittelijaSukunimi = esittelija(1),
                kasittelyVaihe = hakemus.kasittelyVaihe,
                muokattu = hakemus.muokattu,
                taydennyspyyntoLahetetty = ataruHakemus.`information-request-timestamp` match {
                  case None            => None
                  case Some(timestamp) => Some(toLocalDateTime(timestamp))
                },
                ataruHakemustaMuokattu = Some(toLocalDateTime(ataruHakemus.latestVersionCreated)),
                apHakemus = hakemus.apHakemus,
                onkoPeruutettu = hakemus.onkoPeruutettu
              )
            )
        }
      }
    sort match {
      case null => hakemusList
      case _    =>
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
              case "saapumisPvm"  => hakemusList.sortBy(_.aika)
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
              case "saapumisPvm"  => hakemusList.sortBy(_.aika).reverse
              case "kokonaisaika" => hakemusList.sortBy(_.aika)
              case "hakijanaika"  => hakemusList.sortBy(_.viimeinenAsiakirjaHakijalta)
              case _              => hakemusList
            }
          case SortDef.Undefined => hakemusList
        }
        sortedList
    }
  }

  /**
   * Tallentaa hakemuksen kokonaan (PUT endpoint).
   * Korvaa kaikki käyttäjän muokattavat kentät.
   * NULL arvo pyynnössä -> NULL tietokantaan.
   */
  def tallennaHakemus(
    hakemusOid: HakemusOid,
    hakemusUpdateRequest: HakemusUpdateRequest,
    userOid: UserOid
  ): HakemusOid = {
    val esittelijaId = hakemusUpdateRequest.esittelijaOid match {
      case None                => None
      case Some(esittelijaOid) =>
        esittelijaRepository.haeEsittelijaOidilla(esittelijaOid) match {
          case Some(esittelija) => Some(esittelija.esittelijaId)
          case None             =>
            LOG.warn(s"Esittelijää ei löytynyt oidilla: ${hakemusUpdateRequest.esittelijaOid}")
            None
        }
    }

    hakemusRepository.haeHakemus(hakemusOid) match {
      case None =>
        LOG.warn(s"Hakemuksen tallennus epäonnistui, hakemusta ei löytynyt tietokannasta hakemusOidille: $hakemusOid")
        throw new RuntimeException(
          s"Hakemuksen tallennus epäonnistui, hakemusta ei löytynyt tietokannasta hakemusOidille: $hakemusOid"
        )
      case Some(dbHakemus) =>
        // Tallennetaan asiakirjatiedot täysin (korvaa kaikki kentät ilman mergeä)
        val finalAsiakirjaId = dbHakemus.asiakirjaId match {
          case Some(asiakirjaId) =>
            // Päivitä olemassa oleva asiakirja täysin
            asiakirjaRepository.paivitaAsiakirjaTiedot(
              asiakirjaId,
              hakemusUpdateRequest.asiakirja,
              userOid
            )
            Some(asiakirjaId)
          case None =>
            // Luo uusi asiakirja jos ei ole olemassa
            // tallennaUudetAsiakirjatiedot hoitaa myös nested collectionien tallennuksen
            val asiakirjaId = asiakirjaRepository.tallennaUudetAsiakirjatiedot(
              hakemusUpdateRequest.asiakirja,
              userOid.toString
            )
            Some(asiakirjaId)
        }

        // Laske lopullinen kasittelyVaihe päivitettyjen tietojen perusteella
        val kasittelyVaihe = kasittelyVaiheService.resolveKasittelyVaihe(
          dbHakemus.copy(asiakirjaId = finalAsiakirjaId),
          haeAtaruHakemus(hakemusOid)
        )

        // Täysi päivitys - kaikki kentät korvataan
        val modifiedHakemus = dbHakemus.copy(
          asiakirjaId = finalAsiakirjaId,
          hakemusKoskee = hakemusUpdateRequest.hakemusKoskee,
          asiatunnus = hakemusUpdateRequest.asiatunnus,
          esittelijaId = esittelijaId,
          yhteistutkinto = hakemusUpdateRequest.yhteistutkinto,
          kasittelyVaihe = kasittelyVaihe,
          lopullinenPaatosVastaavaEhdollinenAsiatunnus =
            hakemusUpdateRequest.lopullinenPaatosVastaavaEhdollinenAsiatunnus,
          lopullinenPaatosVastaavaEhdollinenSuoritusmaaKoodiUri =
            hakemusUpdateRequest.lopullinenPaatosVastaavaEhdollinenSuoritusmaaKoodiUri,
          esittelijanHuomioita = hakemusUpdateRequest.esittelijanHuomioita,
          onkoPeruutettu = hakemusUpdateRequest.onkoPeruutettu,
          peruutusPvm = hakemusUpdateRequest.peruutusPvm,
          peruutusLisatieto = hakemusUpdateRequest.peruutusLisatieto
        )

        if (!dbHakemus.onkoPeruutettu && hakemusUpdateRequest.onkoPeruutettu)
          paatosRepository.asetaPaatosPeruutetuksi(dbHakemus.id, userOid.toString)

        hakemusRepository.paivitaHakemus(
          hakemusOid,
          modifiedHakemus,
          userOid.toString
        )
    }
  }

  def paivitaAsiatunnus(hakemusOid: HakemusOid, asiatunnus: String, muokkaaja: String): Int = {
    hakemusRepository.suoritaPaivitaAsiatunnus(hakemusOid, asiatunnus, muokkaaja)
  }

  def paivitaKasittelyVaiheSisaisesti(
    hakemusOid: HakemusOid,
    dbHakemus: DbHakemus,
    luojaTaiMuokkaaja: String
  ): Unit = {
    paivitaKasittelyVaihe(hakemusOid, dbHakemus, luojaTaiMuokkaaja, haeAtaruHakemus(hakemusOid))
  }

  def paivitaKasittelyVaiheAtarusta(
    hakemusOid: HakemusOid,
    ataruHakemuksenTila: AtaruHakemuksenTila,
    infoRequestTimestamp: Option[String]
  ): Unit = {
    hakemusRepository.haeHakemus(hakemusOid) match {
      case Some(dbHakemus) =>
        val dbHakemusWithInfoRequestTimestamp = (ataruHakemuksenTila, infoRequestTimestamp) match {
          case (TaydennysPyynto, Some(timestamp)) =>
            dbHakemus.copy(viimeisinTaydennyspyyntoPvm = Some(toLocalDateTime(timestamp)))
          case (TaydennysPyynto, _) => dbHakemus.copy(viimeisinTaydennyspyyntoPvm = Some(currentLocalDateTime()))
          case _                    => dbHakemus
        }
        paivitaKasittelyVaihe(hakemusOid, dbHakemusWithInfoRequestTimestamp, ATARU_SERVICE, haeAtaruHakemus(hakemusOid))
      case _ =>
        LOG.warn(s"Vastaanotettiin tilapäivitys hakemukselle ${hakemusOid.s} jota ei löydy TUTU -kannasta")
    }
  }

  private def paivitaKasittelyVaihe(
    hakemusOid: HakemusOid,
    dbHakemus: DbHakemus,
    luojaTaiMuokkaaja: String,
    ataruHakemus: AtaruHakemus
  ): Unit = {
    val kasittelyVaihe = kasittelyVaiheService.resolveKasittelyVaihe(
      dbHakemus,
      ataruHakemus
    )

    if (kasittelyVaihe != dbHakemus.kasittelyVaihe) {
      LOG.info(
        s"Päivitetään kasittelyVaihe: ${dbHakemus.kasittelyVaihe} -> $kasittelyVaihe hakemukselle $hakemusOid"
      )
      hakemusRepository.paivitaHakemus(
        hakemusOid,
        dbHakemus.copy(kasittelyVaihe = kasittelyVaihe),
        luojaTaiMuokkaaja
      )
    }
  }

  def paivitaTiedotAtarusta(hakemusOid: HakemusOid): Unit = {
    hakemusRepository.haeHakemus(hakemusOid) match {
      case Some(dbHakemus) =>
        val ataruHakemus      = haeAtaruHakemus(hakemusOid)
        val hakemusKoskee     = ataruHakemusParser.parseHakemusKoskee(ataruHakemus)
        val hakemusPeruutettu = ataruHakemusParser.onkoHakemusPeruutettu(ataruHakemus)
        val asetaPeruutetuksi = !dbHakemus.onkoPeruutettu && hakemusPeruutettu
        val kasittelyVaihe    =
          kasittelyVaiheService.resolveKasittelyVaihe(
            dbHakemus,
            ataruHakemus
          )
        val muutokset = ListBuffer[String]()
        if (kasittelyVaihe != dbHakemus.kasittelyVaihe)
          muutokset += s"${dbHakemus.kasittelyVaihe} -> $kasittelyVaihe"
        if (hakemusKoskee != dbHakemus.hakemusKoskee)
          muutokset += s"hakemusKoskee: ${dbHakemus.hakemusKoskee} -> $hakemusKoskee"
        val peruutusPvm =
          if (asetaPeruutetuksi)
            Some(toLocalDateTime(ataruHakemus.latestVersionCreated))
          else dbHakemus.peruutusPvm
        if (asetaPeruutetuksi)
          muutokset += s"hakemus peruutettu $peruutusPvm"
        if (muutokset.nonEmpty) {
          LOG.info(s"Päivitetään hakemus ${hakemusOid.s} ${muutokset.mkString(", ")}")
          hakemusRepository.paivitaHakemus(
            hakemusOid,
            dbHakemus.copy(
              kasittelyVaihe = kasittelyVaihe,
              hakemusKoskee = hakemusKoskee,
              onkoPeruutettu = asetaPeruutetuksi || dbHakemus.onkoPeruutettu,
              peruutusPvm = peruutusPvm
            ),
            ATARU_SERVICE
          )
          if (asetaPeruutetuksi)
            paatosRepository.asetaPaatosPeruutetuksi(dbHakemus.id, ATARU_SERVICE)
        }
      case _ =>
        LOG.warn(s"Vastaanotettiin päivitys hakemukselle ${hakemusOid.s} jota ei löydy TUTU -kannasta")
    }
  }
}
