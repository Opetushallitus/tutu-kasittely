package fi.oph.tutu.backend.service.generator.paatosteksti

import fi.oph.tutu.backend.domain.PaatosTyyppi.Taso
import fi.oph.tutu.backend.domain.TutkintoTaso.YlempiKorkeakoulu
import fi.oph.tutu.backend.domain.{Hakemus, Paatos, PaatosTyyppi}

def getTasoPaatosHeader(lang: String): String = lang match {
  case "finnish" => s"""<h2>Tutkinnon rinnastaminen</h2>"""
  case _         => s"""<h2>Jämställande av examen</h2>"""
}

def getTasoPaatosTutkintoText(lang: String, isYlempiKorkeakouluTutkinto: Boolean): String = lang match {
  case "finnish" =>
    s"""<p>Hakijan suorittama korkeakoulututkinto rinnastetaan Suomessa suoritettavaan\n${
        if (isYlempiKorkeakouluTutkinto) s"ylempään" else "alempaan"
      }\nkorkeakoulututkintoon.</p>""".stripMargin
  case _ =>
    s"""<p>Den högskoleexamen som sökanden har avlagt jämställs med\n${
        if (isYlempiKorkeakouluTutkinto) s"högre" else "lägre"
      }\nhögskoleexamen som avläggs i Finland.</p>""".stripMargin
}

def getTasoPaatosPerusteluText(lang: String, isYlempiKorkeakouluTutkinto: Boolean): String = lang match {
  case "finnish" =>
    s"""<h2>Perustelu:</h2>\n<p>Opetushallitus on arvioinut hakijan tutkinnon vastaavan tasoltaan Suomessa suoritettavaa\n${
        if (isYlempiKorkeakouluTutkinto) s"ylempää" else "alempaa"
      }\nkorkeakoulututkintoa.\nArvio perustuu siihen, että tutkintoon johtanut korkeakouluopintojen kokonaisuus vastaa laajuudeltaan, vaativuudeltaan ja suuntautumiseltaan\n${
        if (isYlempiKorkeakouluTutkinto) s"ylempään" else "alempaan"
      }\nkorkeakoulututkintoon johtavaa korkeakouluopintojen kokonaisuutta.\nSovelletut oikeusohjeet: Laki ulkomailla suoritettujen korkeakouluopintojen tuottamasta virkakelpoisuudesta (1385/2015), 2, 3 ja 6 §</p>""".stripMargin
  case _ =>
    s"""<h2>Motivering:</h2>\n<p>Utbildningsstyrelsen har bedömt att sökandens examen till sin nivå motsvarar en\n${
        if (isYlempiKorkeakouluTutkinto) s"högre" else "lägre"
      }\nhögskoleexamen som avläggs i Finland. Bedömningen grundar sig på att den helhet av högskolestudier som har lett till examen med hänsyn till dess omfång, svårighetsgrad och inriktning motsvarar den helhet av högskolestudier som leder till\n${
        if (isYlempiKorkeakouluTutkinto) s"högre" else "lägre"
      }\nhögskoleexamen.\nTillämpade rättsnormer: Lagen om den tjänstebehörighet som högskolestudier utomlands medför (1385/2015), 2, 3 och 6 §</p>""".stripMargin
}

def getTasoPaatosValitusoikeusText(lang: String, hallintoOikeus: String): String = lang match {
  case "finnish" =>
    s"""<h4>Valitusoikeus</h4>\n<p>Tähän päätökseen saa hakea muutosta valittamalla\n${hallintoOikeus}:n hallinto-oikeudelle.\nLiitteenä olevasta valitusosoituksesta ilmenee valituksen määräaika ja se, miten muutosta haettaessa on meneteltävä. </p>""".stripMargin
  case _ =>
    s"""<h4>Besvärsrätt</h2>\n<p>Ändring i detta beslut får sökas genom besvär hos\n${hallintoOikeus} förvaltningsdomstol.\nBesvärstiden och förfarandet framgår av bifogade besvärsanvisning.</p>""".stripMargin
}

def getTasoPaatosMaksunOikaisuText(lang: String): String = lang match {
  case "finnish" =>
    s"""<h2>Maksun oikaisu</h2>\n<p>Päätöksestä perityt maksut perustuvat opetus- ja kulttuuriministeriön asetukseen Opetushallituksen ja sen erillisyksiköiden suoritteiden maksullisuudesta (1188/2023, 1 ja 2 §). Maksuihin voi vaatia oikaisua Opetushallitukselta. Liitteenä olevasta oikaisuvaatimusosoituksesta ilmenee oikaisuvaatimuksen määräaika ja se, miten oikaisua vaadittaessa on meneteltävä.</p>""".stripMargin
  case _ =>
    s"""<h2>Omprövning som berör avgifterna</h2>\n<p>Avgifterna för beslutet baserar sig på undervisnings- och kulturministeriets förordning om Utbildningsstyrelsens och dess fristående enheters avgiftsbelagda prestationer (1188/2023, 1 och 2 §). Omprövning som berör avgifterna kan begäras av Utbildningsstyrelsen. Av bifogade anvisning för begäran om omprövning framgår tiden för begäran om omprövning och ansökningsförfarandet.</p>""".stripMargin
}

def getTODOText(lang: String): String = lang match {
  case "finnish" =>
    s"""<p>Tällä hetkellä esikatselu on saatavilla vain tasopäätökselle.</p>""".stripMargin
  case _ =>
    s"""<p>För närvarande är förhandsgranskning endast tillgänglig för nivåbeslut.</p>""".stripMargin
}

def getSelectTutkintoTasoText(lang: String): String = lang match {
  case "finnish" =>
    s"""<p>Valitse tutkinnon taso.</p>""".stripMargin
  case _ =>
    s"""<p>Välj kvalifikationsnivå.</p>""".stripMargin
}

def generate(
  hakemus: Hakemus,
  paatos: Paatos,
  paatosKieli: String
): String = {
  val constainsTasoPaatos = paatos.paatosTiedot.exists(paatosTieto => paatosTieto.paatosTyyppi.get == Taso)

  if (constainsTasoPaatos) {
    val hallintoOikeus   = "TODO HALLINTO-OIKEUS"
    var paatosTietoTexts = getTasoPaatosHeader(paatosKieli)

    paatosTietoTexts = paatos.paatosTiedot.foldLeft(paatosTietoTexts)((acc, paatosTieto) => {
      val isTasoPaatos = paatosTieto.paatosTyyppi.get == Taso
      if (isTasoPaatos) {
        val isTutkintoTasoSelected = paatosTieto.tutkintoTaso.isDefined
        if (isTutkintoTasoSelected) {
          val isYlempiKorkeakouluTutkinto = paatosTieto.tutkintoTaso.get == YlempiKorkeakoulu
          acc ++ getTasoPaatosTutkintoText(
            paatosKieli,
            isYlempiKorkeakouluTutkinto
          ) ++ getTasoPaatosPerusteluText(paatosKieli, isYlempiKorkeakouluTutkinto)
        } else {
          acc ++ getSelectTutkintoTasoText(paatosKieli)
        }
      } else {
        acc
      }
    })

    paatosTietoTexts ++ getTasoPaatosValitusoikeusText(paatosKieli, hallintoOikeus) ++ getTasoPaatosMaksunOikaisuText(
      paatosKieli
    )
  } else {
    getTODOText(paatosKieli)
  }
}
