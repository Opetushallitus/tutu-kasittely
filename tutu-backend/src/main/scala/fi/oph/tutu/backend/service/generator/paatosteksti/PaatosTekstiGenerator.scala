package fi.oph.tutu.backend.service.generator.paatosteksti

import fi.oph.tutu.backend.service.MaakoodiService
import fi.oph.tutu.backend.domain.*
import fi.oph.tutu.backend.service.generator.formatDate

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

private def getCommonPaatosHeader(
  hakemus: Hakemus,
  tutkinnot: Seq[Tutkinto],
  paatos: Paatos,
  paatosKieli: String,
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
          val tutkinnonPaaAine = tutkinto.paaaaineTaiErikoisala.getOrElse("")
          val korkeakoulu      = tutkinto.oppilaitos.getOrElse("")
          val maakoodiUri      = tutkinto.maakoodiUri

          val sijaintimaa = maakoodiUri
            .flatMap(maakoodiUri =>
              maakoodiService
                .getMaakoodiByUri(maakoodiUri)
                .flatMap(m => Some(if (paatosKieli == "finnish") m.fi else m.sv))
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
            if (paatosKieli == "finnish")
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
    case "finnish" =>
      s"""<p>Hakija:</p><p>$hakijaNimi<br>$hakijaSyntymaaika</p>$tutkintoBlocks"""
    case _ =>
      s"""<p>Sökande:</p><p>$hakijaNimi<br>$hakijaSyntymaaika</p>$tutkintoBlocks"""
  }
}

private def getTasoPaatosHeader(lang: String, count: Number): String = lang match {
  case "finnish" => s"""<strong>${if (count == 1) s"Tutkinnon" else s"Tutkintojen"} rinnastaminen</strong>"""
  case _         => s"""<strong>Jämställande av examen</strong>"""
}

private def getTasoPaatosTutkintoText(
  lang: String,
  isYlempiKorkeakouluTutkinto: Boolean,
  tutkintoNimi: Option[String]
): String = {
  val tutkinto = tutkintoNimi.map(nimi => s" ($nimi)").getOrElse("")
  lang match {
    case "finnish" =>
      s"""<p>Hakijan suorittama korkeakoulututkinto$tutkinto rinnastetaan Suomessa suoritettavaan ${
          if (isYlempiKorkeakouluTutkinto) s"ylempään" else "alempaan"
        } korkeakoulututkintoon.</p>"""
    case _ =>
      s"""<p>Den högskoleexamen som sökanden har avlagt$tutkinto jämställs med ${
          if (isYlempiKorkeakouluTutkinto) s"högre" else "lägre"
        } högskoleexamen som avläggs i Finland.</p>"""
  }
}

private def getTasoPaatosPerusteluText(
  lang: String,
  isYlempiKorkeakouluTutkinto: Boolean,
  tutkintoNimi: Option[String]
): String = {
  val tutkinto = tutkintoNimi.map(nimi => s" ($nimi)").getOrElse("")
  lang match {
    case "finnish" =>
      s"""<strong>Perustelu</strong><p>Opetushallitus on arvioinut hakijan tutkinnon$tutkinto vastaavan tasoltaan Suomessa suoritettavaa ${
          if (isYlempiKorkeakouluTutkinto) s"ylempää" else "alempaa"
        } korkeakoulututkintoa. Arvio perustuu siihen, että tutkintoon johtanut korkeakouluopintojen kokonaisuus vastaa laajuudeltaan, vaativuudeltaan ja suuntautumiseltaan ${
          if (isYlempiKorkeakouluTutkinto) s"ylempään" else "alempaan"
        } korkeakoulututkintoon johtavaa korkeakouluopintojen kokonaisuutta.</p><p><strong>Lainkohdat, joihin päätös perustuu</strong></p><p>Laki ulkomailla suoritettujen korkeakouluopintojen tuottamasta virkakelpoisuudesta (1385/2015), 2, 3 ja 6 §|</p>"""
    case _ =>
      s"""<strong>Motivering</strong><p>Utbildningsstyrelsen har bedömt att sökandens examen$tutkinto till sin nivå motsvarar en ${
          if (isYlempiKorkeakouluTutkinto) s"högre" else "lägre"
        } högskoleexamen som avläggs i Finland. Bedömningen grundar sig på att den helhet av högskolestudier som har lett till examen med hänsyn till dess omfång, svårighetsgrad och inriktning motsvarar den helhet av högskolestudier som leder till ${
          if (isYlempiKorkeakouluTutkinto) s"högre" else "lägre"
        } högskoleexamen.</p><p><strong>Tillämpade rättsnormer</strong></p><p>Lagen om den tjänstebehörighet som högskolestudier utomlands medför (1385/2015), 2, 3 och 6 §|</p>"""
  }
}

private def parseHallintoOikeusName(hallintoOikeus: String): String = {
  if (hallintoOikeus.contains("hallintotuomioistuin")) {
    hallintoOikeus.replace("hallintotuomioistuin", "hallintotuomioistuimelle")
  } else {
    hallintoOikeus.replace("hallinto-oikeus", "hallinto-oikeudelle")
  }
}

private def getCommonPaatosValitusoikeusText(lang: String, hallintoOikeus: String): String = lang match {
  case "finnish" =>
    s"""<strong>Valitusoikeus</strong><p>Tähän päätökseen saa hakea muutosta valittamalla ${parseHallintoOikeusName(
        hallintoOikeus
      )}. Liitteenä olevasta valitusosoituksesta ilmenee valituksen määräaika ja se, miten muutosta haettaessa on meneteltävä.</p>"""
  case _ =>
    s"""<strong>Besvärsrätt</strong><p>Ändring i detta beslut får sökas genom besvär hos $hallintoOikeus. Besvärstiden och förfarandet framgår av bifogade besvärsanvisning.</p>"""
}

private def getCommonMaksunOikaisuText(lang: String, isPeruutus: Boolean = false): String = lang match {
  case "finnish" =>
    s"""<strong>Maksun oikaisu</strong><p>Päätöksestä perityt maksut perustuvat opetus- ja kulttuuriministeriön asetukseen Opetushallituksen ja sen erillisyksiköiden suoritteiden maksullisuudesta (1508/2025, 1 ja 2 §). Maksuihin voi vaatia oikaisua Opetushallitukselta. Liitteenä olevasta oikaisuvaatimusosoituksesta ilmenee oikaisuvaatimuksen määräaika ja se, miten oikaisua vaadittaessa on meneteltävä.</p><p>Käsittelymaksu 100 euroa</p>${
        if (!isPeruutus) "<p>Päätösmaksu 395 euroa</p>" else ""
      }"""
  case _ =>
    s"""<strong>Omprövning som berör avgifterna</strong><p>Avgifterna för beslutet baserar sig på undervisnings- och kulturministeriets förordning om Utbildningsstyrelsens och dess fristående enheters avgiftsbelagda prestationer (1508/2025, 1 och 2 §). Omprövning som berör avgifterna kan begäras av Utbildningsstyrelsen. Av bifogade anvisning för begäran om omprövning framgår tiden för begäran om omprövning och ansökningsförfarandet.</p><p>Behandlingsavgift 100 euro</p>${
        if (!isPeruutus) "<p>Beslutsavgift 395 euro</p>" else ""
      }"""

}

private def getSelectTutkintoTasoText(lang: String): String = lang match {
  case "finnish" =>
    s"""<p>Valitse tutkinnon taso.</p>"""
  case _ =>
    s"""<p>Välj kvalifikationsnivå.</p>"""
}

private def getTutkinto(tutkinnot: Seq[Tutkinto], paatosTieto: PaatosTieto): Option[Tutkinto] = {
  tutkinnot.find(tutkinto => tutkinto.id == paatosTieto.tutkintoId)
}

private def getTutkintoNimi(tutkinnot: Seq[Tutkinto], paatosTieto: PaatosTieto): String = {
  val tutkinto = getTutkinto(tutkinnot, paatosTieto).get
  if (tutkinto.jarjestys == "MUU") "Muu tutkinto" else tutkinto.nimi.get
}

private def generateTasoPaatosTeksti(
  hakemus: Hakemus,
  tutkinnot: Seq[Tutkinto],
  paatos: Paatos,
  paatosKieli: String
): String = {
  val paatosTietoTexts = getTasoPaatosHeader(paatosKieli, paatos.paatosTiedot.size)

  paatos.paatosTiedot.foldLeft(paatosTietoTexts)((acc, paatosTieto) => {
    val isTasoPaatos = paatosTieto.paatosTyyppi.get == PaatosTyyppi.Taso
    if (isTasoPaatos) {
      val isTutkintoTasoSelected = paatosTieto.tutkintoTaso.isDefined
      if (isTutkintoTasoSelected) {
        val isYlempiKorkeakouluTutkinto   = paatosTieto.tutkintoTaso.get == TutkintoTaso.YlempiKorkeakoulu
        val isLisaaTutkintoPaatostekstiin = paatosTieto.lisaaTutkintoPaatostekstiin.getOrElse(false)
        val tutkintoNimi = Option.when(isLisaaTutkintoPaatostekstiin)(getTutkintoNimi(tutkinnot, paatosTieto))

        acc
          ++ getTasoPaatosTutkintoText(
            paatosKieli,
            isYlempiKorkeakouluTutkinto,
            tutkintoNimi
          )
          ++ getTasoPaatosPerusteluText(paatosKieli, isYlempiKorkeakouluTutkinto, tutkintoNimi)
      } else {
        acc ++ getSelectTutkintoTasoText(paatosKieli)
      }
    } else {
      acc
    }
  })
}

private def generatePeruutusTeksti(lang: String, hakemus: Hakemus): String = {
  val peruutusPvm = hakemus.peruutusPvm match {
    case Some(date) => formatDate(date)
    case _          => if (lang == "finnish") "[pp.kk.vvvv]" else "[dd.mm.åååå]"
  }
  lang match {
    case "finnish" =>
      s"""<strong>Päätös</strong><p>Hakija on peruuttanut hakemuksensa $peruutusPvm. Hakemuksen käsittely raukeaa.</p>"""
    case _ =>
      s"""<strong>Beslut</strong><p>Den sökande har dragit tillbaka sin ansökan $peruutusPvm. Behandlingen av ansökan förfaller.</p>"""
  }
}

private def getTODOText(lang: String): String = lang match {
  case "finnish" =>
    s"""<p>Tällä hetkellä esikatselua ei ole saatavilla.</p>""".stripMargin
  case _ =>
    s"""<p>Det finns för närvarande ingen förhandsvisning tillgänglig.</p>""".stripMargin
}

def generatePaatosTeksti(
  hakemus: Hakemus,
  tutkinnot: Seq[Tutkinto],
  paatos: Paatos,
  paatosKieli: String,
  hallintoOikeus: HallintoOikeus,
  maakoodiService: MaakoodiService
): String = {
  val hallintoOikeudenNimi = paatosKieli match {
    case "finnish" => hallintoOikeus.nimi.get(Kieli.fi)
    case _         => hallintoOikeus.nimi.get(Kieli.sv)
  }

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
