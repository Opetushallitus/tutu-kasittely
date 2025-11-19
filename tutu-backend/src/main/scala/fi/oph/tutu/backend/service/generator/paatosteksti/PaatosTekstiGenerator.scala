package fi.oph.tutu.backend.service.generator.paatosteksti

import fi.oph.tutu.backend.domain.*
import fi.oph.tutu.backend.domain.PaatosTyyppi.Taso
import fi.oph.tutu.backend.domain.TutkintoTaso.YlempiKorkeakoulu

private def getTasoPaatosHeader(lang: String, count: Number): String = lang match {
  case "finnish" => s"""<h4>${if (count == 1) s"Tutkinnon" else s"Tutkintojen"} rinnastaminen</h4>"""
  case _         => s"""<h4>Jämställande av examen</h4>"""
}

private def getTasoPaatosTutkintoText(lang: String, isYlempiKorkeakouluTutkinto: Boolean): String = lang match {
  case "finnish" =>
    s"""<p>Hakijan suorittama korkeakoulututkinto rinnastetaan Suomessa suoritettavaan<br><span style=\"padding-left: 20px;\">${
        if (isYlempiKorkeakouluTutkinto) s"ylempään" else "alempaan"
      }</span><br>korkeakoulututkintoon.</p>""".stripMargin
  case _ =>
    s"""<p>Den högskoleexamen som sökanden har avlagt jämställs med<br><span style="padding-left: 20px;">${
        if (isYlempiKorkeakouluTutkinto) s"högre" else "lägre"
      }</span><br>högskoleexamen som avläggs i Finland.</p>""".stripMargin
}

private def getTasoPaatosTutkintoTextWithTutkintoName(
  lang: String,
  isYlempiKorkeakouluTutkinto: Boolean,
  tutkintoNimi: String
): String = lang match {
  case "finnish" =>
    s"""<p>Hakijan suorittama $tutkintoNimi korkeakoulututkinto rinnastetaan Suomessa suoritettavaan<br><span style="padding-left: 20px;">${
        if (isYlempiKorkeakouluTutkinto) s"ylempään" else "alempaan"
      }</span><br>korkeakoulututkintoon.</p>""".stripMargin
  case _ =>
    s"""<p>Den högskoleexamen ($tutkintoNimi) som sökanden har avlagt jämställs med<br><span style="padding-left: 20px;">${
        if (isYlempiKorkeakouluTutkinto) s"högre" else "lägre"
      }</span><br>högskoleexamen som avläggs i Finland.</p>""".stripMargin
}

private def getTasoPaatosPerusteluText(lang: String, isYlempiKorkeakouluTutkinto: Boolean): String = lang match {
  case "finnish" =>
    s"""<h4>Perustelu:</h4><p>Opetushallitus on arvioinut hakijan tutkinnon vastaavan tasoltaan Suomessa suoritettavaa<br><span style="padding-left: 20px;">${
        if (isYlempiKorkeakouluTutkinto) s"ylempää" else "alempaa"
      }</span><br>korkeakoulututkintoa.<br>Arvio perustuu siihen, että tutkintoon johtanut korkeakouluopintojen kokonaisuus vastaa laajuudeltaan, vaativuudeltaan ja suuntautumiseltaan<br><span style="padding-left: 20px;">${
        if (isYlempiKorkeakouluTutkinto) s"ylempään" else "alempaan"
      }</span><br>korkeakoulututkintoon johtavaa korkeakouluopintojen kokonaisuutta.<br>Sovelletut oikeusohjeet: Laki ulkomailla suoritettujen korkeakouluopintojen tuottamasta virkakelpoisuudesta (1385/2015), 2, 3 ja 6 §</p>""".stripMargin
  case _ =>
    s"""<h4>Motivering:</h4><p>Utbildningsstyrelsen har bedömt att sökandens examen till sin nivå motsvarar en<br><span style="padding-left: 20px;">${
        if (isYlempiKorkeakouluTutkinto) s"högre" else "lägre"
      }</span><br>högskoleexamen som avläggs i Finland. Bedömningen grundar sig på att den helhet av högskolestudier som har lett till examen med hänsyn till dess omfång, svårighetsgrad och inriktning motsvarar den helhet av högskolestudier som leder till<br><span style="padding-left: 20px;">${
        if (isYlempiKorkeakouluTutkinto) s"högre" else "lägre"
      }</span><br>högskoleexamen.<br>Tillämpade rättsnormer: Lagen om den tjänstebehörighet som högskolestudier utomlands medför (1385/2015), 2, 3 och 6 §</p>""".stripMargin
}

private def parseHallintoOikeusName(hallintoOikeus: String): String = {
  hallintoOikeus.contains("hallintotuomioistuin") match {
    case true  => hallintoOikeus.replace("hallintotuomioistuin", "hallintotuomioistuimelle")
    case false => hallintoOikeus.replace("hallinto-oikeus", "hallinto-oikeudelle")
  }
}

private def getTasoPaatosValitusoikeusText(lang: String, hallintoOikeus: String): String = lang match {
  case "finnish" =>
    s"""<h4>Valitusoikeus</h4><p>Tähän päätökseen saa hakea muutosta valittamalla<br><span style="padding-left: 20px;">${parseHallintoOikeusName(
        hallintoOikeus
      )}.</span><br>Liitteenä olevasta valitusosoituksesta ilmenee valituksen määräaika ja se, miten muutosta haettaessa on meneteltävä. </p>""".stripMargin
  case _ =>
    s"""<h4>Besvärsrätt</h4><p>Ändring i detta beslut får sökas genom besvär hos<br><span style="padding-left: 20px;">$hallintoOikeus.<br>Besvärstiden och förfarandet framgår av bifogade besvärsanvisning.</span></p>""".stripMargin
}

private def getTasoPaatosMaksunOikaisuText(lang: String): String = lang match {
  case "finnish" =>
    s"""<h4>Maksun oikaisu</h4><p>Päätöksestä perityt maksut perustuvat opetus- ja kulttuuriministeriön asetukseen Opetushallituksen ja sen erillisyksiköiden suoritteiden maksullisuudesta (1188/2023, 1 ja 2 §). Maksuihin voi vaatia oikaisua Opetushallitukselta. Liitteenä olevasta oikaisuvaatimusosoituksesta ilmenee oikaisuvaatimuksen määräaika ja se, miten oikaisua vaadittaessa on meneteltävä.</p>""".stripMargin
  case _ =>
    s"""<h4>Omprövning som berör avgifterna</h4><p>Avgifterna för beslutet baserar sig på undervisnings- och kulturministeriets förordning om Utbildningsstyrelsens och dess fristående enheters avgiftsbelagda prestationer (1188/2023, 1 och 2 §). Omprövning som berör avgifterna kan begäras av Utbildningsstyrelsen. Av bifogade anvisning för begäran om omprövning framgår tiden för begäran om omprövning och ansökningsförfarandet.</p>""".stripMargin
}

private def getTODOText(lang: String): String = lang match {
  case "finnish" =>
    s"""<p>Tällä hetkellä esikatselu on saatavilla vain tasopäätökselle.</p>""".stripMargin
  case _ =>
    s"""<p>För närvarande är förhandsgranskning endast tillgänglig för nivåbeslut.</p>""".stripMargin
}

private def getSelectTutkintoTasoText(lang: String): String = lang match {
  case "finnish" =>
    s"""<p>Valitse tutkinnon taso.</p>""".stripMargin
  case _ =>
    s"""<p>Välj kvalifikationsnivå.</p>""".stripMargin
}

private def getTutkintoNimi(hakemus: Hakemus, paatosTieto: PaatosTieto): String = {
  val tutkinto = hakemus.tutkinnot
    .find(tutkinto => tutkinto.id == paatosTieto.tutkintoId)
    .get
  if (tutkinto.jarjestys == "MUU") "Muu tutkinto" else tutkinto.nimi.get
}

def generatePaatosTeksti(
  hakemus: Hakemus,
  paatos: Paatos,
  paatosKieli: String,
  hallintoOikeus: HallintoOikeus
): String = {
  val containsTasoPaatos = paatos.paatosTiedot.exists(paatosTieto => paatosTieto.paatosTyyppi.get == Taso)

  if (containsTasoPaatos) {
    var paatosTietoTexts     = getTasoPaatosHeader(paatosKieli, paatos.paatosTiedot.size)
    val hallintoOikeudenNimi = paatosKieli match {
      case "finnish" => hallintoOikeus.nimi.get(Kieli.fi)
      case _         => hallintoOikeus.nimi.get(Kieli.sv)
    }
    paatosTietoTexts = paatos.paatosTiedot.foldLeft(paatosTietoTexts)((acc, paatosTieto) => {
      val isTasoPaatos = paatosTieto.paatosTyyppi.get == Taso
      if (isTasoPaatos) {
        val isTutkintoTasoSelected = paatosTieto.tutkintoTaso.isDefined
        if (isTutkintoTasoSelected) {
          val isYlempiKorkeakouluTutkinto   = paatosTieto.tutkintoTaso.get == YlempiKorkeakoulu
          val isLisaaTutkintoPaatostekstiin = paatosTieto.lisaaTutkintoPaatostekstiin.getOrElse(false)

          val tutkintoText =
            if (isLisaaTutkintoPaatostekstiin) {
              getTasoPaatosTutkintoTextWithTutkintoName(
                paatosKieli,
                isYlempiKorkeakouluTutkinto,
                getTutkintoNimi(hakemus, paatosTieto)
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
    paatosTietoTexts ++ getTasoPaatosValitusoikeusText(
      paatosKieli,
      hallintoOikeudenNimi.get
    ) ++ getTasoPaatosMaksunOikaisuText(
      paatosKieli
    )
  } else {
    getTODOText(paatosKieli)
  }
}
