package fi.oph.tutu.backend.service.generator.paatosteksti

import fi.oph.tutu.backend.service.MaakoodiService
import fi.oph.tutu.backend.domain.*
import fi.oph.tutu.backend.service.generator.formatDate
import fi.oph.tutu.backend.service.TranslationService
import org.springframework.stereotype.{Component, Service}

// See TutkintoComponent.tsx
val tutkintoOtsikkoLabelMap: Map[String, String] = Map(
  "tutkintotodistus"             -> "Tutkintotodistus",
  "tutkintotodistukset"          -> "Tutkintotodistukset",
  "todistus"                     -> "Todistus",
  "todistukset"                  -> "Todistukset",
  "examensbevis"                 -> "Examensbevis",
  "bevis"                        -> "Bevis",
  "muutodistus"                  -> "Muu todistus",
  "muuttodistukset"              -> "Muut todistukset",
  "edeltaneetkorkeakouluopinnot" -> "Edeltäneet korkeakouluopinnot",
  "ovrigbevis"                   -> "Övrig bevis",
  "ovrigabevis"                  -> "Övriga bevis",
  "foregaendehogskolestudier"    -> "Föregående högskolestudier"
)

@Component
@Service
class PaatosTekstiGenerator(translationService: TranslationService) {

  private def getCommonPaatosHeader(
    hakemus: Hakemus,
    tutkinnot: Seq[Tutkinto],
    paatos: Paatos,
    paatosKieli: Kieli,
    maakoodiService: MaakoodiService
  ): String = {
    val hakijaNimi        = s"${hakemus.hakija.sukunimi} ${hakemus.hakija.etunimet}"
    val hakijaSyntymaaika = hakemus.hakija.syntymaaika

    val isPeruutus = paatos.ratkaisutyyppi match {
      case Some(Ratkaisutyyppi.PeruutusTaiRaukeaminen) => true
      case _                                           => false
    }

    val tutkintoBlocks: String =
      if (isPeruutus) ""
      else {
        tutkinnot
          .map { tutkinto =>
            val tutkintoOtsikko =
              tutkinto.todistusOtsikko
                .map(o => tutkintoOtsikkoLabelMap.getOrElse(o, o))
                .getOrElse("")

            val tutkintoNimi     = tutkinto.nimi.getOrElse("")
            val tutkinnonPaaAine = tutkinto.paaAineTaiErikoisala.getOrElse("")
            val korkeakoulu      = tutkinto.oppilaitos.getOrElse("")
            val maakoodiUri      = tutkinto.maakoodiUri

            val sijaintimaa = maakoodiUri
              .flatMap(maakoodiUri =>
                maakoodiService
                  .getMaakoodiByUri(maakoodiUri)
                  .flatMap(m => Some(if (paatosKieli == Kieli.fi) m.fi else m.sv))
              )
              .getOrElse("")

            val tutkintoParts =
              Seq(tutkintoNimi, tutkinnonPaaAine, korkeakoulu, sijaintimaa)
                .map(_.trim)
                .filter(_.nonEmpty)
                .mkString("<br>")

            val todistuksenPaivamaara = tutkinto.todistuksenPaivamaara.getOrElse("")
            val tutkintoOtsikkoLabel  = tutkintoOtsikkoLabelMap.getOrElse(
              tutkintoOtsikko,
              tutkintoOtsikko
            )

            if (tutkintoParts.nonEmpty) { // Filtteröi esim. Muut tutkinnot pois
              if (paatosKieli == Kieli.fi)
                s"""<p>${tutkintoOtsikkoLabel}:</p><p>$tutkintoParts<br>Todistuksen päivämäärä: $todistuksenPaivamaara</p>"""
              else
                s"""<p>${tutkintoOtsikkoLabel}:</p><p>$tutkintoParts<br>Datum för bevis: $todistuksenPaivamaara</p>"""
            } else {
              ""
            }
          }
          .mkString("")
      }

    paatosKieli match {
      case Kieli.fi =>
        s"""<p>Hakija:</p><p>$hakijaNimi<br>$hakijaSyntymaaika</p>$tutkintoBlocks"""
      case _ =>
        s"""<p>Sökande:</p><p>$hakijaNimi<br>$hakijaSyntymaaika</p>$tutkintoBlocks"""
    }
  }

  private def getTasoPaatosHeader(lang: Kieli, count: Number): String = lang match {
    case Kieli.fi => s"""<strong>${if (count == 1) s"Tutkinnon" else s"Tutkintojen"} rinnastaminen</strong>"""
    case _        => s"""<strong>Jämställande av examen</strong>"""
  }

  private def getKorkeakouluTasoText(lang: Kieli, tutkintoTaso: TutkintoTaso): String = {
    (lang, tutkintoTaso) match {
      case (Kieli.fi, TutkintoTaso.YlempiKorkeakoulu) => "ylempää"
      case (_, TutkintoTaso.YlempiKorkeakoulu)        => "högre"
      case (Kieli.fi, _)                              => "alempaa"
      case _                                          => "lägre"
    }
  }

  private def getTasoPaatosTutkintoText(
    lang: Kieli,
    tutkintoTaso: TutkintoTaso,
    tutkintoNimi: Option[String]
  ): String = {
    val tutkinto = tutkintoNimi.map(n => s" ($n)").getOrElse("")
    val koulu    = getKorkeakouluTasoText(lang, tutkintoTaso)
    lang match {
      case Kieli.fi =>
        s"""<p>Hakijan suorittama korkeakoulututkinto$tutkinto rinnastetaan Suomessa suoritettavaan ${koulu}n korkeakoulututkintoon.</p>"""
      case _ =>
        s"""<p>Den högskoleexamen som sökanden har avlagt$tutkinto jämställs med $koulu högskoleexamen som avläggs i Finland.</p>"""
    }

  }

  private def getTasoPaatosPerusteluBodyText(
    lang: Kieli,
    tutkintoTaso: TutkintoTaso,
    tutkintoNimi: Option[String]
  ): String = {
    val tutkinto = tutkintoNimi.map(n => s" ($n)").getOrElse("")
    val koulu    = getKorkeakouluTasoText(lang, tutkintoTaso)
    lang match {
      case Kieli.fi =>
        s"""<p>Opetushallitus on arvioinut hakijan tutkinnon$tutkinto vastaavan tasoltaan Suomessa suoritettavaa $koulu korkeakoulututkintoa. Arvio perustuu siihen, että tutkintoon johtanut korkeakouluopintojen kokonaisuus vastaa laajuudeltaan, vaativuudeltaan ja suuntautumiseltaan ${koulu}n korkeakoulututkintoon johtavaa korkeakouluopintojen kokonaisuutta.</p>"""
      case _ =>
        s"""<p>Utbildningsstyrelsen har bedömt att sökandens examen$tutkinto till sin nivå motsvarar en $koulu högskoleexamen som avläggs i Finland. Bedömningen grundar sig på att den helhet av högskolestudier som har lett till examen med hänsyn till dess omfång, svårighetsgrad och inriktning motsvarar den helhet av högskolestudier som leder till $koulu högskoleexamen.</p>"""
    }
  }

  private def getTasoPaatosPerusteluHeader(lang: Kieli): String = lang match {
    case Kieli.fi => "<strong>Perustelu</strong>"
    case _        => "<strong>Motivering</strong>"
  }

  private def getTasoPaatosLakiText(lang: Kieli): String = {
    this.translationService.getTranslation(lang, "paatosteksti.tasoPaatosLaki")
  }
  /*lang match {
  case Kieli.fi =>
    "<strong>Lainkohdat, joihin päätös perustuu</strong><p>Laki ulkomailla suoritettujen korkeakouluopintojen tuottamasta virkakelpoisuudesta (1385/2015), 2, 3 ja 6 §</p>"
  case _ =>
    "<strong>Tillämpade rättsnormer</strong><p>Lagen om den tjänstebehörighet som högskolestudier utomlands medför (1385/2015), 2, 3 och 6 §</p>"
}*/

  private def parseHallintoOikeusName(hallintoOikeus: String): String = {
    if (hallintoOikeus.contains("hallintotuomioistuin")) {
      hallintoOikeus.replace("hallintotuomioistuin", "hallintotuomioistuimelle")
    } else {
      hallintoOikeus.replace("hallinto-oikeus", "hallinto-oikeudelle")
    }
  }

  private def getCommonPaatosValitusoikeusText(lang: Kieli, hallintoOikeus: String): String = lang match {
    case Kieli.fi =>
      s"""<strong>Valitusoikeus</strong><p>Tähän päätökseen saa hakea muutosta valittamalla ${parseHallintoOikeusName(
          hallintoOikeus
        )}. Liitteenä olevasta valitusosoituksesta ilmenee valituksen määräaika ja se, miten muutosta haettaessa on meneteltävä.</p>"""
    case _ =>
      s"""<strong>Besvärsrätt</strong><p>Ändring i detta beslut får sökas genom besvär hos $hallintoOikeus. Besvärstiden och förfarandet framgår av bifogade besvärsanvisning.</p>"""
  }

  private def getCommonMaksunOikaisuText(lang: Kieli, isPeruutus: Boolean = false): String = {

    val paatosMaksu = (lang, isPeruutus) match {
      case (_, true)         => ""
      case (Kieli.fi, false) => "<p>Päätösmaksu 395 euroa</p>"
      case _                 => "<p>Beslutsavgift 395 euro</p>"
    }
    lang match {
      case Kieli.fi =>
        s"""<strong>Maksun oikaisu</strong><p>Päätöksestä perityt maksut perustuvat opetus- ja kulttuuriministeriön asetukseen Opetushallituksen ja sen erillisyksiköiden suoritteiden maksullisuudesta (1508/2025, 1 ja 2 §). Maksuihin voi vaatia oikaisua Opetushallitukselta. Liitteenä olevasta oikaisuvaatimusosoituksesta ilmenee oikaisuvaatimuksen määräaika ja se, miten oikaisua vaadittaessa on meneteltävä.</p><p>Käsittelymaksu 100 euroa</p>$paatosMaksu"""
      case _ =>
        s"""<strong>Omprövning som berör avgifterna</strong><p>Avgifterna för beslutet baserar sig på undervisnings- och kulturministeriets förordning om Utbildningsstyrelsens och dess fristående enheters avgiftsbelagda prestationer (1508/2025, 1 och 2 §). Omprövning som berör avgifterna kan begäras av Utbildningsstyrelsen. Av bifogade anvisning för begäran om omprövning framgår tiden för begäran om omprövning och ansökningsförfarandet.</p><p>Behandlingsavgift 100 euro</p>$paatosMaksu"""
    }
  }

  private def getSelectTutkintoTasoText(lang: Kieli): String = lang match {
    case Kieli.fi => "<p>Valitse tutkinnon taso.</p>"
    case _        => "<p>Välj kvalifikationsnivå.</p>"
  }

  private def getTutkinto(tutkinnot: Seq[Tutkinto], paatosTieto: PaatosTieto): Option[Tutkinto] = {
    tutkinnot.find(tutkinto => tutkinto.id == paatosTieto.tutkintoId)
  }

  private def getTutkintoNimi(lang: Kieli, tutkinnot: Seq[Tutkinto], paatosTieto: PaatosTieto): Option[String] = {
    for {
      tutkinto <- getTutkinto(tutkinnot, paatosTieto) if paatosTieto.lisaaTutkintoPaatostekstiin.getOrElse(false)
      nimi     <-
        if (tutkinto.jarjestys == "MUU") Some(if (lang == Kieli.fi) "Muu tutkinto" else "Annan examen")
        else tutkinto.nimi
    } yield nimi
  }

  private def generateTasoPaatosTeksti(
    hakemus: Hakemus,
    tutkinnot: Seq[Tutkinto],
    paatos: Paatos,
    paatosKieli: Kieli
  ): String = {
    val tasoPaatosTiedot = paatos.paatosTiedot.filter(_.paatosTyyppi.get == PaatosTyyppi.Taso)

    val tutkintoTexts = tasoPaatosTiedot
      .map { pt =>
        if (pt.tutkintoTaso.isDefined)
          getTasoPaatosTutkintoText(paatosKieli, pt.tutkintoTaso.get, getTutkintoNimi(paatosKieli, tutkinnot, pt))
        else if (pt.myonteinenPaatos.contains(false)) {
          paatosKieli match {
            case Kieli.fi =>
              "<p>Hakijan suorittamaa tutkintoa ei rinnasteta Suomessa suoritettavaan korkeakoulututkintoon.</p>"
            case _ =>
              "<p>Den examen som den sökande har avlagt jämställs inte med en högskoleexamen som avläggs i Finland.</p>"
          }
        } else
          getSelectTutkintoTasoText(paatosKieli)
      }
      .mkString("")

    val perusteluBodies = tasoPaatosTiedot
      .flatMap { pt =>
        if (pt.myonteinenPaatos.contains(false)) { // Kielteinen paatos
          pt.kielteisenPaatoksenPerustelut.toList.flatMap { kp =>
            kp.productElementNames
              .zip(kp.productIterator)
              .collect {
                case (perusteluNimi, perusteluArvo: Boolean) if perusteluArvo =>
                  val perusteluTeksti = perusteluNimi match {
                    case "epavirallinenKorkeakoulu" =>
                      "Epävirallinen korkeakoulu"
                    case "epavirallinenTutkinto" =>
                      "Epävirallinen tutkinto"
                    case "eiVastaaSuomessaSuoritettavaaTutkintoa" =>
                      "Ei vastaa Suomessa suoritettavaa tutkintoa"
                    case "muuPerustelu" =>
                      s"Muu perustelu: ${kp.muuPerusteluKuvaus.getOrElse("")}"
                    case _ => ""
                  }
                  s"<p>$perusteluTeksti</p>"
              }
          }
        } else
          pt.tutkintoTaso
            .map(taso => getTasoPaatosPerusteluBodyText(paatosKieli, taso, getTutkintoNimi(paatosKieli, tutkinnot, pt)))
      }
      .mkString("")

    getTasoPaatosHeader(paatosKieli, tasoPaatosTiedot.size)
      ++ tutkintoTexts
      ++ getTasoPaatosPerusteluHeader(paatosKieli)
      ++ perusteluBodies
      ++ getTasoPaatosLakiText(paatosKieli)
  }

  private def generatePeruutusTeksti(lang: Kieli, hakemus: Hakemus): String = {
    val peruutusPvm = hakemus.peruutusPvm match {
      case Some(date) => formatDate(date)
      case _          => if (lang == Kieli.fi) "[pp.kk.vvvv]" else "[dd.mm.åååå]"
    }
    lang match {
      case Kieli.fi =>
        s"""<strong>Päätös</strong><p>Hakija on peruuttanut hakemuksensa $peruutusPvm. Hakemuksen käsittely raukeaa.</p>"""
      case _ =>
        s"""<strong>Beslut</strong><p>Den sökande har dragit tillbaka sin ansökan $peruutusPvm. Behandlingen av ansökan förfaller.</p>"""
    }
  }

  private def getTODOText(lang: Kieli): String = lang match {
    case Kieli.fi =>
      s"""<p>Tällä hetkellä esikatselua ei ole saatavilla.</p>"""
    case _ =>
      s"""<p>Det finns för närvarande ingen förhandsvisning tillgänglig.</p>"""
  }

  def generatePaatosTeksti(
    hakemus: Hakemus,
    tutkinnot: Seq[Tutkinto],
    paatos: Paatos,
    paatosKieli: Kieli,
    hallintoOikeus: HallintoOikeus,
    maakoodiService: MaakoodiService
  ): String = {
    val hallintoOikeudenNimi = hallintoOikeus.nimi.get(paatosKieli)

    val containsTasoPaatos =
      paatos.paatosTiedot.exists(paatosTieto => paatosTieto.paatosTyyppi.get == PaatosTyyppi.Taso)

    paatos.ratkaisutyyppi match {
      case Some(Ratkaisutyyppi.Paatos) =>
        getCommonPaatosHeader(hakemus, tutkinnot, paatos, paatosKieli, maakoodiService)
          ++ (containsTasoPaatos match {
            case true => generateTasoPaatosTeksti(hakemus, tutkinnot, paatos, paatosKieli)
            case _    => getTODOText(paatosKieli)
          })
          ++ getCommonPaatosValitusoikeusText(paatosKieli, hallintoOikeudenNimi.get)
          ++ getCommonMaksunOikaisuText(paatosKieli)
      case Some(Ratkaisutyyppi.PeruutusTaiRaukeaminen) =>
        getCommonPaatosHeader(hakemus, tutkinnot, paatos, paatosKieli, maakoodiService)
          ++ generatePeruutusTeksti(paatosKieli, hakemus)
          ++ getCommonMaksunOikaisuText(paatosKieli, isPeruutus = true)
      case _ => getTODOText(paatosKieli)
    }
  }
}
