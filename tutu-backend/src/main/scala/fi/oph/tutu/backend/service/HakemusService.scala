package fi.oph.tutu.backend.service

import fi.oph.tutu.backend.domain.*
import fi.oph.tutu.backend.repository.{
  AsiakirjaRepository,
  EsittelijaRepository,
  HakemusRepository,
  PaatosRepository,
  PerusteluRepository,
  TutuDatabase
}
import fi.oph.tutu.backend.utils.Constants.*
import fi.oph.tutu.backend.utils.TutuJsonFormats
import fi.oph.tutu.backend.utils.Utility.stringToSeq
import org.json4s.*
import org.json4s.jackson.JsonMethods.*
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.stereotype.{Component, Service}
import slick.dbio.DBIO

import java.time.format.DateTimeFormatter
import java.time.{LocalDateTime, ZoneId, ZonedDateTime}
import java.util.UUID
import scala.concurrent.ExecutionContext.Implicits.global
import scala.util.{Failure, Success}

@Component
@Service
class HakemusService(
  hakemusRepository: HakemusRepository,
  esittelijaRepository: EsittelijaRepository,
  asiakirjaRepository: AsiakirjaRepository,
  perusteluRepository: PerusteluRepository,
  kasittelyVaiheService: KasittelyVaiheService,
  paatosRepository: PaatosRepository,
  hakemuspalveluService: HakemuspalveluService,
  onrService: OnrService,
  ataruHakemusParser: AtaruHakemusParser,
  userService: UserService,
  db: TutuDatabase
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

    val esittelijaId = esittelija.map(_.esittelijaId)

    // Rakennetaan transaktio, joka sisältää kaikki tietokantaoperaatiot
    val transactionalAction = for {
      asiakirjaId <- asiakirjaRepository.tallennaUudetAsiakirjatiedotAction(
        Asiakirja(),
        "Hakemuspalvelu"
      )
      hakemusId <- hakemusRepository.tallennaHakemusAction(
        hakemus.hakemusOid,
        hakemus.hakemusKoskee,
        esittelijaId,
        asiakirjaId,
        "Hakemuspalvelu"
      )
      tutkinnot = ataruHakemusParser.parseTutkinnot(hakemusId, ataruHakemus)
      _ <-
        if (tutkinnot != null && tutkinnot.nonEmpty) {
          DBIO.sequence(
            tutkinnot.map(tutkinto => hakemusRepository.lisaaTutkinto(hakemusId, tutkinto, "Hakemuspalvelu"))
          )
        } else {
          DBIO.successful(Seq.empty)
        }
    } yield hakemusId

    // Suoritetaan transaktio
    db.runTransactionally(transactionalAction, "tallenna_ataru_hakemus") match {
      case Success(hakemusId) =>
        LOG.info(s"Ataru-hakemuksen ${hakemus.hakemusOid} tallennus onnistui")
        hakemusId
      case Failure(e) =>
        LOG.error(s"Ataru-hakemuksen ${hakemus.hakemusOid} tallennus epäonnistui: ${e.getMessage}", e)
        throw new RuntimeException(
          s"Ataru-hakemuksen tallennus epäonnistui: ${e.getMessage}",
          e
        )
    }
  }

  /**
   * Luo kokonaisen hakemuksen transaktionaalises ti (hakemus + perustelu + paatos)
   * Käytetään Ataru-hakemuksen luonnissa, jotta kaikki tiedot tallennetaan atomisesti.
   *
   * @param hakemus
   *   uusi Ataru-hakemus
   * @param partialPerustelu
   *   perustelu
   * @param partialPaatos
   *   päätös
   * @param luoja
   *   luojan tunniste
   * @return
   *   (hakemusId, perustelu, paatos) tuple
   */
  def luoKokonainenHakemus(
    hakemus: UusiAtaruHakemus,
    partialPerustelu: PartialPerustelu,
    paatos: Paatos,
    luoja: String
  ): (UUID, Perustelu, Paatos) = {
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

    val esittelijaId = esittelija.map(_.esittelijaId)

    // Rakennetaan perustelu ja paatos domain objektit
    val perustelu = Perustelu().mergeWith(partialPerustelu)

    // Rakennetaan transaktio, joka sisältää kaikki tietokantaoperaatiot
    val transactionalAction = for {
      asiakirjaId <- asiakirjaRepository.tallennaUudetAsiakirjatiedotAction(
        Asiakirja(),
        luoja
      )
      hakemusId <- hakemusRepository.tallennaHakemusAction(
        hakemus.hakemusOid,
        hakemus.hakemusKoskee,
        esittelijaId,
        asiakirjaId,
        luoja
      )
      tutkinnot = ataruHakemusParser.parseTutkinnot(hakemusId, ataruHakemus)
      _ <-
        if (tutkinnot != null && tutkinnot.nonEmpty) {
          DBIO.sequence(
            tutkinnot.map(tutkinto => hakemusRepository.lisaaTutkinto(hakemusId, tutkinto, luoja))
          )
        } else {
          DBIO.successful(Seq.empty)
        }
      savedPerustelu <- perusteluRepository.tallennaPerusteluAction(
        hakemusId,
        perustelu.copy(hakemusId = Some(hakemusId)),
        luoja
      )
      savedPaatos <- paatosRepository.tallennaPaatosAction(
        hakemusId,
        paatos.copy(hakemusId = Some(hakemusId)),
        luoja
      )
    } yield (hakemusId, savedPerustelu, savedPaatos)

    // Suoritetaan transaktio
    db.runTransactionally(transactionalAction, "luo_kokonaishakemus") match {
      case Success(result) =>
        LOG.info(s"Ataru-hakemuksen ${hakemus.hakemusOid} kokonaisluonti onnistui")
        result
      case Failure(e) =>
        LOG.error(s"Ataru-hakemuksen ${hakemus.hakemusOid} kokonaisluonti epäonnistui: ${e.getMessage}", e)
        throw new RuntimeException(
          s"Ataru-hakemuksen kokonaisluonti epäonnistui: ${e.getMessage}",
          e
        )
    }
  }

  private def paivitaTutkinnot(
    ataruHakemus: AtaruHakemus,
    dbHakemus: DbHakemus,
    dbTutkinnot: Seq[Tutkinto]
  ): Seq[Tutkinto] = {
    val ataruTutkinnot = ataruHakemusParser.parseTutkinnot(dbHakemus.id, ataruHakemus)

    ataruTutkinnot.foreach { ataruTutkinto =>
      dbTutkinnot.find(dbTutkinto => dbTutkinto.jarjestys == ataruTutkinto.jarjestys) match {
        // Ei tutkintoa järjestysnumerolla -> lisätään uusi
        case None                     => hakemusRepository.lisaaTutkinto(dbHakemus.id, ataruTutkinto, "TUTU-päivitys")
        case Some(existingDbTutkinto) =>
          existingDbTutkinto.muokattu match {
            // Jos ei muokattu, ylikirjoitetaan, muuten päivitetään tarvittavat tiedot
            case None =>
              hakemusRepository.paivitaTutkinto(ataruTutkinto.copy(id = existingDbTutkinto.id), "TUTU-päivitys")
            case Some(value) =>
              hakemusRepository.paivitaTutkinto(
                existingDbTutkinto.copy(
                  todistusOtsikko = ataruTutkinto.todistusOtsikko,
                  aloitusVuosi = ataruTutkinto.aloitusVuosi,
                  paattymisVuosi = ataruTutkinto.paattymisVuosi
                ),
                "TUTU-päivitys"
              )
          }
      }
    }
    hakemusRepository.haeTutkinnotHakemusIdilla(dbHakemus.id)
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
        val dbTutkinnot = hakemusRepository.haeTutkinnotHakemusIdilla(dbHakemus.id)
        val tutuHakemus = Hakemus(
          hakemusOid = dbHakemus.hakemusOid.toString,
          lomakeOid = lomake.key,
          lomakeId = lomake.id,
          lomakkeenKieli = ataruHakemus.lang,
          hakija = hakija,
          sisalto = ataruHakemusParser.parseSisalto(ataruHakemus, lomake),
          liitteidenTilat = ataruHakemus.`application-hakukohde-attachment-reviews`,
          hakemusKoskee = dbHakemus.hakemusKoskee,
          asiatunnus = dbHakemus.asiatunnus,
          kirjausPvm = Some(
            ZonedDateTime
              .parse(ataruHakemus.submitted, DateTimeFormatter.ofPattern(DATE_TIME_FORMAT))
              .withZoneSameInstant(ZoneId.of("Europe/Helsinki"))
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
          kasittelyVaihe =
            dbHakemus.kasittelyVaihe, // (kasittelyVaihe lasketaan ja päivitetään aina kun hakemusta muokataan)
          muokattu = dbHakemus.muokattu,
          muutosHistoria = Seq(),
          taydennyspyyntoLahetetty = ataruHakemus.`information-request-timestamp` match {
            case None            => None
            case Some(timestamp) =>
              Some(LocalDateTime.parse(timestamp, DateTimeFormatter.ofPattern(DATE_TIME_FORMAT)))
          },
          yhteistutkinto = dbHakemus.yhteistutkinto,
          tutkinnot = dbTutkinnot,
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
        val updatedTutkinnot = paivitaTutkinnot(ataruHakemus, dbHakemus, dbTutkinnot)

        Some(tutuHakemus.copy(tutkinnot = updatedTutkinnot))
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
    val vaiheet: Option[Seq[String]] = vaihe.map(stringToSeq)

    val userOids: Option[Seq[String]] = userOid.map(stringToSeq)

    val hakemusKoskeeParams: Option[Seq[String]] = hakemuskoskee.map(stringToSeq)

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
                aika = ataruHakemus.submitted,
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
      case None => {
        LOG.warn(s"Hakemuksen tallennus epäonnistui, hakemusta ei löytynyt tietokannasta hakemusOidille: $hakemusOid")
        throw new RuntimeException(
          s"Hakemuksen tallennus epäonnistui, hakemusta ei löytynyt tietokannasta hakemusOidille: $hakemusOid"
        )
      }
      case Some(dbHakemus) => {
        // Tallennetaan tutkinnot (korvaa kaikki)
        val tallennetutTutkinnot = hakemusRepository.haeTutkinnotHakemusIdilla(dbHakemus.id)
        hakemusRepository.suoritaTutkintojenModifiointi(
          dbHakemus.id,
          HakemusModifyOperationResolver.resolveTutkintoModifyOperations(
            tallennetutTutkinnot,
            hakemusUpdateRequest.tutkinnot
          ),
          userOid
        )

        // Tallennetaan asiakirjatiedot täysin (korvaa kaikki kentät ilman mergeä)
        val finalAsiakirjaId = dbHakemus.asiakirjaId match {
          case Some(asiakirjaId) =>
            // Päivitä olemassa oleva asiakirja täysin
            asiakirjaRepository.paivitaTaysiAsiakirjaTiedot(
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
          finalAsiakirjaId,
          dbHakemus.id
        )

        // Täysi päivitys - kaikki kentät korvataan
        val modifiedHakemus = dbHakemus.copy(
          asiakirjaId = finalAsiakirjaId,
          hakemusKoskee = hakemusUpdateRequest.hakemusKoskee,
          asiatunnus = hakemusUpdateRequest.asiatunnus,
          esittelijaId = esittelijaId,
          yhteistutkinto = hakemusUpdateRequest.yhteistutkinto,
          kasittelyVaihe = kasittelyVaihe
        )

        hakemusRepository.paivitaTaysiHakemus(
          hakemusOid,
          modifiedHakemus,
          userOid.toString
        )
      }
    }
  }

  def paivitaAsiatunnus(hakemusOid: HakemusOid, asiatunnus: String): Int = {
    hakemusRepository.suoritaPaivitaAsiatunnus(hakemusOid, asiatunnus)
  }

  def paivitaKasittelyVaihe(
    hakemusOid: HakemusOid,
    dbHakemus: DbHakemus,
    luojaTaiMuokkaaja: String
  ): Unit = {
    val kasittelyVaihe = kasittelyVaiheService.resolveKasittelyVaihe(
      dbHakemus.asiakirjaId,
      dbHakemus.id
    )

    if (kasittelyVaihe != dbHakemus.kasittelyVaihe) {
      LOG.info(
        s"Päivitetään kasittelyVaihe: ${dbHakemus.kasittelyVaihe} -> $kasittelyVaihe hakemukselle $hakemusOid"
      )
      hakemusRepository.paivitaPartialHakemus(
        hakemusOid,
        dbHakemus.copy(kasittelyVaihe = kasittelyVaihe),
        luojaTaiMuokkaaja
      )
    }
  }
}
