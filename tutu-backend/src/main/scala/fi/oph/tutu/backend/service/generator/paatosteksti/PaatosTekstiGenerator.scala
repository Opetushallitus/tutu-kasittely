package fi.oph.tutu.backend.service.generator.paatosteksti

import fi.oph.tutu.backend.service.MaakoodiService
import fi.oph.tutu.backend.domain.*

private def getCommonPaatosHeader(
  hakemus: Hakemus,
  tutkinnot: Seq[Tutkinto],
  paatos: Paatos,
  paatosKieli: String,
  maakoodiService: MaakoodiService
): String = {
  val hakijaNimi        = s"${hakemus.hakija.sukunimi} ${hakemus.hakija.etunimet}"
  val hakijaSyntymaaika = hakemus.hakija.syntymaaika

  val tutkinto         = getTutkinto(tutkinnot, paatos.paatosTiedot.head)
  val tutkintoOtsikko  = tutkinto.flatMap(_.todistusOtsikko).getOrElse("")
  val tutkintoNimi     = tutkinto.flatMap(_.nimi).getOrElse("")
  val tutkinnonPaaAine = tutkinto.flatMap(_.paaaaineTaiErikoisala).getOrElse("")
  val korkeakoulu      = tutkinto.flatMap(_.oppilaitos).getOrElse("")
  val maakoodi         = tutkinto.flatMap(_.maakoodiUri).getOrElse("")
  val sijaintimaa      = maakoodiService.getMaakoodiByUri(maakoodi) match {
    case Some(maakoodi) => if (paatosKieli == "finnish") maakoodi.fi else maakoodi.sv
    case None           => ""
  }

  val tutkintoParts =
    Seq(tutkintoOtsikko, tutkintoNimi, tutkinnonPaaAine, korkeakoulu, sijaintimaa)
      .map(_.trim)
      .filter(_.nonEmpty)
      .mkString("<br>")

  val todistuksenPaivamaara = tutkinto.flatMap(_.todistuksenPaivamaara).getOrElse("")

  paatosKieli match {
    case "finnish" =>
      s"""<p>Hakija:</p><p>$hakijaNimi<br>$hakijaSyntymaaika</p><p>Tutkintotodistus:</p><p>${tutkintoParts}<br>Todistuksen päivämäärä: $todistuksenPaivamaara</p>"""
    case _ =>
      s"""<p>Sökande:</p><p>$hakijaNimi<br>$hakijaSyntymaaika</p><p>Examensbevis:</p><p>${tutkintoParts}<br>Datum för bevis: $todistuksenPaivamaara</p>"""
  }
}

private def getTasoPaatosHeader(lang: String, count: Number): String = lang match {
  case "finnish" => s"""<h4>${if (count == 1) s"Tutkinnon" else s"Tutkintojen"} rinnastaminen</h4>"""
  case _         => s"""<h4>Jämställande av examen</h4>"""
}

private def getTasoPaatosTutkintoText(lang: String, isYlempiKorkeakouluTutkinto: Boolean): String = lang match {
  case "finnish" =>
    s"""<p>Hakijan suorittama korkeakoulututkinto rinnastetaan Suomessa suoritettavaan ${
        if (isYlempiKorkeakouluTutkinto) s"ylempään" else "alempaan"
      } korkeakoulututkintoon.</p>"""
  case _ =>
    s"""<p>Den högskoleexamen som sökanden har avlagt jämställs med ${
        if (isYlempiKorkeakouluTutkinto) s"högre" else "lägre"
      } högskoleexamen som avläggs i Finland.</p>"""
}

private def getTasoPaatosTutkintoTextWithTutkintoName(
  lang: String,
  isYlempiKorkeakouluTutkinto: Boolean,
  tutkintoNimi: String
): String = lang match {
  case "finnish" =>
    s"""<p>Hakijan suorittama $tutkintoNimi korkeakoulututkinto rinnastetaan Suomessa suoritettavaan ${
        if (isYlempiKorkeakouluTutkinto) s"ylempään" else "alempaan"
      } korkeakoulututkintoon.</p>"""
  case _ =>
    s"""<p>Den högskoleexamen ($tutkintoNimi) som sökanden har avlagt jämställs med ${
        if (isYlempiKorkeakouluTutkinto) s"högre" else "lägre"
      } högskoleexamen som avläggs i Finland.</p>"""
}

private def getTasoPaatosPerusteluText(lang: String, isYlempiKorkeakouluTutkinto: Boolean): String = lang match {
  case "finnish" =>
    s"""<p>Perustelu:</p><p>Opetushallitus on arvioinut hakijan tutkinnon vastaavan tasoltaan Suomessa suoritettavaa ${
        if (isYlempiKorkeakouluTutkinto) s"ylempää" else "alempaa"
      } korkeakoulututkintoa.</p><p>Arvio perustuu siihen, että tutkintoon johtanut korkeakouluopintojen kokonaisuus vastaa laajuudeltaan, vaativuudeltaan ja suuntautumiseltaan ${
        if (isYlempiKorkeakouluTutkinto) s"ylempään" else "alempaan"
      } korkeakoulututkintoon johtavaa korkeakouluopintojen kokonaisuutta.</p><p>Sovelletut oikeusohjeet: Laki ulkomailla suoritettujen korkeakouluopintojen tuottamasta virkakelpoisuudesta (1385/2015), 2, 3 ja 6 §</p>"""
  case _ =>
    s"""<p>Motivering:</p><p>Utbildningsstyrelsen har bedömt att sökandens examen till sin nivå motsvarar en ${
        if (isYlempiKorkeakouluTutkinto) s"högre" else "lägre"
      } högskoleexamen som avläggs i Finland. Bedömningen grundar sig på att den helhet av högskolestudier som har lett till examen med hänsyn till dess omfång, svårighetsgrad och inriktning motsvarar den helhet av högskolestudier som leder till ${
        if (isYlempiKorkeakouluTutkinto) s"högre" else "lägre"
      } högskoleexamen.</p><p>Tillämpade rättsnormer: Lagen om den tjänstebehörighet som högskolestudier utomlands medför (1385/2015), 2, 3 och 6 §</p>"""
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
    s"""<h4>Valitusoikeus</h4><p>Tähän päätökseen saa hakea muutosta valittamalla ${parseHallintoOikeusName(
        hallintoOikeus
      )}. Liitteenä olevasta valitusosoituksesta ilmenee valituksen määräaika ja se, miten muutosta haettaessa on meneteltävä.</p>"""
  case _ =>
    s"""<h4>Besvärsrätt</h4><p>Ändring i detta beslut får sökas genom besvär hos $hallintoOikeus. Besvärstiden och förfarandet framgår av bifogade besvärsanvisning.</p>"""
}

private def getCommonMaksunOikaisuText(lang: String): String = lang match {
  case "finnish" =>
    s"""<h4>Maksun oikaisu</h4><p>Päätöksestä perityt maksut perustuvat opetus- ja kulttuuriministeriön asetukseen Opetushallituksen ja sen erillisyksiköiden suoritteiden maksullisuudesta (1508/2025, 1 ja 2 §). Maksuihin voi vaatia oikaisua Opetushallitukselta. Liitteenä olevasta oikaisuvaatimusosoituksesta ilmenee oikaisuvaatimuksen määräaika ja se, miten oikaisua vaadittaessa on meneteltävä.</p><p>Käsittelymaksu 100 euroa</p><p>Päätösmaksu 395 euroa</p>"""
  case _ =>
    s"""<h4>Omprövning som berör avgifterna</h4><p>Avgifterna för beslutet baserar sig på undervisnings- och kulturministeriets förordning om Utbildningsstyrelsens och dess fristående enheters avgiftsbelagda prestationer (1508/2025, 1 och 2 §). Omprövning som berör avgifterna kan begäras av Utbildningsstyrelsen. Av bifogade anvisning för begäran om omprövning framgår tiden för begäran om omprövning och ansökningsförfarandet.</p><p>Behandlingsavgift 100 euroa</p><p>Beslutsavgift 395 euroa</p>"""
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

        val tutkintoText =
          if (isLisaaTutkintoPaatostekstiin) {
            getTasoPaatosTutkintoTextWithTutkintoName(
              paatosKieli,
              isYlempiKorkeakouluTutkinto,
              getTutkintoNimi(tutkinnot, paatosTieto)
            )
          } else {
            getTasoPaatosTutkintoText(
              paatosKieli,
              isYlempiKorkeakouluTutkinto
            )
          }

        acc ++ tutkintoText ++ getTasoPaatosPerusteluText(paatosKieli, isYlempiKorkeakouluTutkinto)
      } else {
        acc ++ getSelectTutkintoTasoText(paatosKieli)
      }
    } else {
      acc
    }
  })
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
    case _ => getTODOText(paatosKieli)
  }
}
