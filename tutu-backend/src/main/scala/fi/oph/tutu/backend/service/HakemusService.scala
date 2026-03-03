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
import fi.oph.tutu.backend.utils.Utility.{stringToIntSeq, stringToSeq, toLocalDateTime}
import java.time.LocalDateTime
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
        ATARU_SERVICE,
        saapumisPvm = Some(java.sql.Timestamp.valueOf(toLocalDateTime(ataruHakemus.submitted))),
        ataruHakemusMuokattu = Some(java.sql.Timestamp.valueOf(toLocalDateTime(ataruHakemus.latestVersionCreated))),
        hakijaEtunimet = Some(ataruHakemus.etunimet),
        hakijaSukunimi = Some(ataruHakemus.sukunimi),
        viimeisinTaydennyspyyntoPvm = ataruHakemus.`information-request-timestamp`
          .map(ts => java.sql.Timestamp.valueOf(toLocalDateTime(ts)))
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
        ATARU_SERVICE,
        saapumisPvm = Some(java.sql.Timestamp.valueOf(toLocalDateTime(ataruHakemus.submitted))),
        ataruHakemusMuokattu = Some(java.sql.Timestamp.valueOf(toLocalDateTime(ataruHakemus.latestVersionCreated))),
        hakijaEtunimet = Some(ataruHakemus.etunimet),
        hakijaSukunimi = Some(ataruHakemus.sukunimi),
        viimeisinTaydennyspyyntoPvm = ataruHakemus.`information-request-timestamp`
          .map(ts => java.sql.Timestamp.valueOf(toLocalDateTime(ts)))
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
  ): Unit = {
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
              }
          }
      }
    }
  }

  def haeHakemus(hakemusOid: HakemusOid): Option[Hakemus] = {
    val ataruHakemus = Try(haeAtaruHakemus(hakemusOid)).toEither match {
      case Right(ataruHakemus)            => ataruHakemus
      case Left(error: NotFoundException) => return None
      case Left(error)                    => throw error
    }

    val lomake = hakemuspalveluService.haeLomake(ataruHakemus.form_id) match {
      case Left(error: Throwable) =>
        LOG.warn(s"Ataru-lomakkeen haku epäonnistui lomake-id:llä ${ataruHakemus.form_id}: ${error.getMessage}")
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
            lomakeId = lomake.id,
            lomakkeenKieli = ataruHakemus.lang,
            hakija = hakija,
            sisalto = ataruHakemusParser.parseSisalto(ataruHakemus, lomake),
            liitteidenTilat = ataruHakemusParser.parseLiitteidenTilat(ataruHakemus, lomake),
            hakemusKoskee = dbHakemus.hakemusKoskee,
            asiatunnus = dbHakemus.asiatunnus,
            saapumisPvm = dbHakemus.saapumisPvm,
            // TODO: paatosPvm
            esittelyPvm = dbHakemus.esittelyPvm,
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
            muokkaaja = onrService.haeNimi(dbHakemus.muokkaaja),
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
        )
      case None =>
        LOG.warn(s"Hakemusta ei löytynyt tietokannasta hakemusOidille: $hakemusOid")
        None
    }
  }

  def haeHakemusLista(
    userOid: Option[String],
    hakemuskoskee: Option[String],
    vaihe: Option[String],
    sortParam: Option[ListSortParam],
    page: Int,
    pageSize: Int
  ): HakemusListResult = {
    val vaiheet: Seq[String]          = vaihe.map(stringToSeq).getOrElse(Seq())
    val userOids: Seq[String]         = userOid.map(stringToSeq).getOrElse(Seq())
    val hakemusKoskeeParams: Seq[Int] = hakemuskoskee.map(stringToIntSeq).getOrElse(Seq())

    // Jos hakemusKoskee = 4, kyseessä on Kelpoisuus ammattiin (AP-hakemus) -hakemus (hakemusKoskee = 1, apHakemus = true):
    val hakemusKoskeeQueryParams = hakemusKoskeeParams.filter(param => param != 4)
    val apHakemusQueryParam      = hakemusKoskeeParams.contains(4)

    val (items, totalCount) = hakemusRepository.haeHakemusLista(
      userOids,
      hakemusKoskeeQueryParams,
      vaiheet,
      apHakemusQueryParam,
      sortParam,
      page,
      pageSize
    )

    val totalPages =
      if (totalCount == 0) 1
      else math.ceil(totalCount.toDouble / pageSize.max(1)).toInt

    HakemusListResult(
      items = items,
      totalCount = totalCount,
      page = page,
      pageSize = pageSize,
      totalPages = totalPages
    )
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

  def asetaEsittelypaiva(hakemusOid: HakemusOid, esittelyPvm: LocalDateTime, muokkaaja: String): Int = {
    hakemusRepository.suoritaPaivitaEsittelyPvm(hakemusOid, esittelyPvm, muokkaaja)
  }

  def paivitaKasittelyVaiheSisaisesti(
    hakemusOid: HakemusOid,
    dbHakemus: DbHakemus,
    luojaTaiMuokkaaja: String
  ): Unit = {
    paivitaKasittelyVaihe(hakemusOid, dbHakemus, luojaTaiMuokkaaja, haeAtaruHakemus(hakemusOid))
  }

  def paivitaKasittelyVaiheSisaisesti(
    hakemusOid: HakemusOid,
    luojaTaiMuokkaaja: String
  ): Unit = {
    hakemusRepository.haeHakemus(hakemusOid) match {
      case Some(dbHakemus) =>
        paivitaKasittelyVaihe(hakemusOid, dbHakemus, luojaTaiMuokkaaja, haeAtaruHakemus(hakemusOid))
      case None =>
        LOG.warn(s"Vastaanotettiin tilapäivitys hakemukselle ${hakemusOid.s} jota ei löydy TUTU -kannasta")
    }
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
          case (TaydennysPyynto, _) => dbHakemus.copy(viimeisinTaydennyspyyntoPvm = Some(LocalDateTime.now()))
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
        val formId            = ataruHakemus.form_id
        val hakemusKoskee     = ataruHakemusParser.parseHakemusKoskee(ataruHakemus)
        val hakemusPeruutettu = ataruHakemusParser.onkoHakemusPeruutettu(ataruHakemus)
        val asetaPeruutetuksi = !dbHakemus.onkoPeruutettu && hakemusPeruutettu
        val kasittelyVaihe    =
          kasittelyVaiheService.resolveKasittelyVaihe(
            dbHakemus,
            ataruHakemus
          )
        val saapumisPvm          = Some(toLocalDateTime(ataruHakemus.submitted))
        val ataruHakemusMuokattu = Some(toLocalDateTime(ataruHakemus.latestVersionCreated))

        val muutokset = ListBuffer[String]()
        if (formId != dbHakemus.formId)
          muutokset += s"form_id: ${dbHakemus.formId} -> $formId"
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
        if (saapumisPvm != dbHakemus.saapumisPvm)
          muutokset += s"saapumisPvm: ${dbHakemus.saapumisPvm} -> $saapumisPvm"
        if (ataruHakemusMuokattu != dbHakemus.ataruHakemusMuokattu)
          muutokset += s"ataruHakemusMuokattu: ${dbHakemus.ataruHakemusMuokattu} -> $ataruHakemusMuokattu"
        if (!dbHakemus.hakijaEtunimet.contains(ataruHakemus.etunimet))
          muutokset += s"hakijaEtunimet: ${dbHakemus.hakijaEtunimet} -> ${ataruHakemus.etunimet}"
        if (!dbHakemus.hakijaSukunimi.contains(ataruHakemus.sukunimi))
          muutokset += s"hakijaSukunimi: ${dbHakemus.hakijaSukunimi} -> ${ataruHakemus.sukunimi}"

        paivitaTutkinnotAtaruHakemukselta(
          ataruHakemus,
          dbHakemus,
          tutkintoRepository.haeTutkinnotHakemusOidilla(hakemusOid)
        )

        if (muutokset.nonEmpty) {
          LOG.info(s"Päivitetään hakemus ${hakemusOid.s} ${muutokset.mkString(", ")}")
          hakemusRepository.paivitaHakemus(
            hakemusOid,
            dbHakemus.copy(
              kasittelyVaihe = kasittelyVaihe,
              hakemusKoskee = hakemusKoskee,
              onkoPeruutettu = asetaPeruutetuksi || dbHakemus.onkoPeruutettu,
              peruutusPvm = peruutusPvm,
              formId = formId,
              saapumisPvm = saapumisPvm,
              ataruHakemusMuokattu = ataruHakemusMuokattu,
              hakijaEtunimet = Some(ataruHakemus.etunimet),
              hakijaSukunimi = Some(ataruHakemus.sukunimi)
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

  def haeYkViestiLista(
    userOid: String,
    sort: String
  ): Seq[YkViestiListItem] = {
    val viestiLista = hakemusRepository.haeYkViestiLista(userOid)
  }
}
