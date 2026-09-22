package fi.oph.tutu.backend.service.generator.paatosteksti

import fi.oph.tutu.backend.service.MaakoodiService
import fi.oph.tutu.backend.domain.*
import fi.oph.tutu.backend.service.generator.formatDate
import fi.oph.tutu.backend.service.TranslationService
import org.springframework.stereotype.{Component, Service}
import fi.oph.tutu.backend.utils.{Constants, haeKysymyksenTiedot}

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

  private def getHakijanTiedot(hakemus: Hakemus): String = {
    val hakijaNimi        = s"${hakemus.hakija.sukunimi} ${hakemus.hakija.etunimet}"
    val hakijaSyntymaaika = hakemus.hakija.syntymaaika

    s"""<p>$hakijaNimi<br>$hakijaSyntymaaika</p>"""
  }

  private def getCommonPaatosHeader(
    hakemus: Hakemus,
    tutkinnot: Seq[Tutkinto],
    paatos: Paatos,
    lang: Kieli,
    maakoodiService: MaakoodiService
  ): String = {
    val hakijanTiedotBlock = getHakijanTiedot(hakemus)

    val isPeruutus = paatos.ratkaisutyyppi match {
      case Some(Ratkaisutyyppi.PeruutusTaiRaukeaminen) => true
      case _                                           => false
    }

    val tutkintoBlocks: String =
      if (isPeruutus) ""
      else {
        getTutkintoBlocks(
          tutkinnot,
          lang,
          maakoodiService,
          translationService
        )
      }

    "<p>"
      + translationService.getTranslation(
        lang,
        "paatosteksti.hakija"
      )
      + s"""</p>$hakijanTiedotBlock$tutkintoBlocks"""
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
    translationService.getTranslation(
      lang,
      "paatosteksti.tasoPaatos.myonteinen",
      Map("tutkintoNimi" -> tutkinto, "koulu" -> koulu)
    )
  }

  private def getTasoPaatosPerusteluBodyText(
    lang: Kieli,
    tutkintoTaso: TutkintoTaso,
    tutkintoNimi: Option[String]
  ): String = {
    val tutkinto = tutkintoNimi.map(n => s" ($n)").getOrElse("")
    val koulu    = getKorkeakouluTasoText(lang, tutkintoTaso)
    translationService.getTranslation(
      lang,
      "paatosteksti.tasoPaatosPerusteluBody",
      Map("tutkintoNimi" -> tutkinto, "koulu" -> koulu)
    )
  }

  private def getTasoPaatosPerusteluHeader(lang: Kieli): String = {
    translationService.getTranslation(lang, "paatosteksti.tasoPaatosPerusteluHeader")
  }

  private def getTasoPaatosLakiText(lang: Kieli): String = {
    this.translationService.getTranslation(lang, "paatosteksti.tasoPaatosLaki")
  }

  private def parseHallintoOikeusName(hallintoOikeus: String): String = {
    if (hallintoOikeus.contains("hallintotuomioistuin")) {
      hallintoOikeus.replace("hallintotuomioistuin", "hallintotuomioistuimelle")
    } else {
      hallintoOikeus.replace("hallinto-oikeus", "hallinto-oikeudelle")
    }
  }

  private def getCommonPaatosValitusoikeusText(lang: Kieli, hallintoOikeus: String): String = {
    val hallintoOikeusNimi = if (lang == Kieli.fi) parseHallintoOikeusName(hallintoOikeus) else hallintoOikeus
    translationService.getTranslation(lang, "paatosteksti.valitusoikeus", Map("hallintoOikeus" -> hallintoOikeusNimi))
  }

  private def getCommonMaksunOikaisuText(lang: Kieli, showPaatosmaksu: Boolean = true): String = {
    val paatosMaksu =
      if (showPaatosmaksu) translationService.getTranslation(lang, "paatosteksti.maksunOikaisu.paatosMaksu")
      else ""

    translationService.getTranslation(lang, "paatosteksti.maksunOikaisu", Map("paatosMaksu" -> paatosMaksu))
  }

  private def getSelectTutkintoTasoText(lang: Kieli): String = {
    translationService.getTranslation(lang, "paatosteksti.tutkinnonTaso.valitse")
  }

  private def getTutkinto(tutkinnot: Seq[Tutkinto], paatosTieto: PaatosTieto): Option[Tutkinto] = {
    tutkinnot.find(tutkinto => tutkinto.id == paatosTieto.tutkintoId)
  }

  private def getTutkintoNimi(lang: Kieli, tutkinnot: Seq[Tutkinto], paatosTieto: PaatosTieto): Option[String] = {
    for {
      tutkinto <- getTutkinto(tutkinnot, paatosTieto) if paatosTieto.lisaaTutkintoPaatostekstiin.getOrElse(false)
      nimi     <-
        if (tutkinto.jarjestys == "MUU")
          Some(translationService.getTranslation(lang, "paatosteksti.muuTutkinto"))
        else tutkinto.nimi
    } yield nimi
  }

  private def generateTasoPaatosTeksti(
    hakemus: Hakemus,
    tutkinnot: Seq[Tutkinto],
    paatos: Paatos,
    lang: Kieli
  ): String = {
    val tasoPaatosTiedot = paatos.paatosTiedot.filter(_.paatosTyyppi.get == PaatosTyyppi.Taso)

    val tutkintoTexts = tasoPaatosTiedot
      .map { pt =>
        if (pt.tutkintoTaso.isDefined)
          getTasoPaatosTutkintoText(lang, pt.tutkintoTaso.get, getTutkintoNimi(lang, tutkinnot, pt))
        else if (pt.myonteinenPaatos.contains(false)) {
          translationService.getTranslation(lang, "paatosteksti.tasoPaatos.kielteinen")
        } else
          getSelectTutkintoTasoText(lang)
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
            .map(taso => getTasoPaatosPerusteluBodyText(lang, taso, getTutkintoNimi(lang, tutkinnot, pt)))
      }
      .mkString("")

    getTasoPaatosHeader(lang, tasoPaatosTiedot.size)
      ++ tutkintoTexts
      ++ getTasoPaatosPerusteluHeader(lang)
      ++ perusteluBodies
      ++ getTasoPaatosLakiText(lang)
  }

  private def generatePeruutusTeksti(lang: Kieli, hakemus: Hakemus): String = {
    val peruutusPvm = hakemus.peruutusPvm match {
      case Some(date) => formatDate(date)
      case _          => if (lang == Kieli.fi) "[pp.kk.vvvv]" else "[dd.mm.åååå]"
    }
    translationService.getTranslation(lang, "paatosteksti.peruutus", Map("peruutusPvm" -> peruutusPvm))
  }

  private def getTODOText(lang: Kieli): String = {
    translationService.getTranslation(lang, "paatosteksti.todo")
  }

  private def getRinnastamisBlock(
    lang: Kieli,
    hakemus: Hakemus,
    vastaavaEhdollinenHakemus: Option[IEhdollinenHakemus]
  ): String = {
    val hyvaksymispvm: String = vastaavaEhdollinenHakemus.flatMap(_.hyvaksymispvm()).getOrElse("")
    val asiatunnus            = hakemus.lopullinenPaatosVastaavaEhdollinenAsiatunnus.getOrElse("")

    val content = translationService.getTranslation(
      lang,
      "paatosteksti.rinnastamispaatos.lopullinen",
      Map("hyvaksymispvm" -> hyvaksymispvm, "asiatunnus" -> asiatunnus)
    )

    s"<p>${content}</p>"
  }

  private def getSuoritetutToimenpiteet(lang: Kieli, hakemus: Hakemus): String = {
    val sopeutumisajanTyonantaja =
      haeKysymyksenTiedot(
        hakemus.sisalto,
        Constants.ATARU_LOMAKE_LOPULLINEN_SUORITETUT_TOIMENPITEET_SOPEUTUMUSAIKA_TYONANATAJA
      )
        .map(_.value.head.label.getOrElse(lang, ""))

    val sopeutumisajanTodistuspvm: String =
      haeKysymyksenTiedot(
        hakemus.sisalto,
        Constants.ATARU_LOMAKE_LOPULLINEN_SUORITETUT_TOIMENPITEET_SOPEUTUMUSAIKA_TODISTUSPVM
      )
        .flatMap(_.value.head.label.get(lang))
        .getOrElse("")

    val kelpoisuuskokeenJarjestaja =
      haeKysymyksenTiedot(
        hakemus.sisalto,
        Constants.ATARU_LOMAKE_LOPULLINEN_SUORITETUT_TOIMENPITEET_KELPOISUUSKOE_JARJESTAJA
      )
        .map(_.value.head.label.getOrElse(lang, ""))

    val kelpoisuuskokeenTodistuspvm: String =
      haeKysymyksenTiedot(
        hakemus.sisalto,
        Constants.ATARU_LOMAKE_LOPULLINEN_SUORITETUT_TOIMENPITEET_KELPOISUUSKOE_TODISTUSPVM
      )
        .flatMap(_.value.head.label.get(lang))
        .getOrElse("")

    val taydentavienOpintojenJarjestaja =
      haeKysymyksenTiedot(
        hakemus.sisalto,
        Constants.ATARU_LOMAKE_LOPULLINEN_SUORITETUT_TOIMENPITEET_TAYDENTAVAT_OPINNOT_JARJESTAJA
      )
        .map(_.value.head.label.getOrElse(lang, ""))

    val result = Seq(
      sopeutumisajanTyonantaja.map(tyonantaja =>
        translationService.getTranslation(
          lang,
          "paatosteksti.lopullinen.toimenpiteet.sopeutumisaika",
          Map("tyonantaja" -> tyonantaja, "todistuspvm" -> sopeutumisajanTodistuspvm)
        )
      ),
      kelpoisuuskokeenJarjestaja.map(jarjestaja =>
        translationService.getTranslation(
          lang,
          "paatosteksti.lopullinen.toimenpiteet.kelpoisuuskoe",
          Map("jarjestaja" -> jarjestaja, "todistuspvm" -> kelpoisuuskokeenTodistuspvm)
        )
      ),
      taydentavienOpintojenJarjestaja.map(jarjestaja =>
        translationService.getTranslation(
          lang,
          "paatosteksti.lopullinen.toimenpiteet.taydentavatOpinnot",
          Map("jarjestaja" -> jarjestaja)
        )
      )
    ).flatten.mkString("<br/>")

    if (result.nonEmpty) {
      val title = translationService.getTranslation(lang, "paatosteksti.lopullinen.toimenpiteet.title")
      s"<p>${title}</p><p>${result}</p>"
    } else {
      ""
    }
  }

  def generateEhdollinenPaatosteksti(
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
          ++ getCommonMaksunOikaisuText(paatosKieli, showPaatosmaksu = false)
      case _ => getTODOText(paatosKieli)
    }
  }

  def generateLopullinenUOPaatosteksti(
    hakemus: Hakemus,
    vastaavaEhdollinenHakemus: Option[IEhdollinenHakemus],
    tutkinnot: Seq[Tutkinto],
    paatos: Paatos,
    paatosKieli: Kieli,
    hallintoOikeus: HallintoOikeus,
    maakoodiService: MaakoodiService
  ): String = {
    val hakijanTiedot: String = getHakijanTiedot(hakemus)
    val tutkinnot: String     = vastaavaEhdollinenHakemus.flatMap(_.haeTutkinnot()).getOrElse("")

    val rinnastamisBlock: String       = getRinnastamisBlock(paatosKieli, hakemus, vastaavaEhdollinenHakemus)
    val suoritetutToimenpiteet: String = getSuoritetutToimenpiteet(paatosKieli, hakemus)

    val paatosteksti: String =
      s"<p>${translationService.getTranslation(paatosKieli, "paatosteksti.lopullinen.uo.paatosteksti")}</p>"

    val valitusoikeusBlock = getCommonPaatosValitusoikeusText(paatosKieli, hallintoOikeus.nimi.get(paatosKieli).get)
    val maksunOikaisuBlock = getCommonMaksunOikaisuText(paatosKieli, showPaatosmaksu = false)

    hakijanTiedot
      ++ tutkinnot
      ++ rinnastamisBlock
      ++ suoritetutToimenpiteet
      ++ paatosteksti
      ++ valitusoikeusBlock
      ++ maksunOikaisuBlock
  }

  def generatePaatosTeksti(
    hakemus: Hakemus,
    vastaavaEhdollinenHakemus: Option[IEhdollinenHakemus],
    tutkinnot: Seq[Tutkinto],
    paatos: Paatos,
    paatosKieli: Kieli,
    hallintoOikeus: HallintoOikeus,
    maakoodiService: MaakoodiService
  ): String = {

    if (hakemus.onLopullinenPaatos) {
      // Lopulliset päätöstekstit
      val paatosOnMyonteinen = paatos.paatosTiedot.headOption.flatMap(_.myonteinenPaatos).exists(_ == true)
      val uoLakiaSovellettu  = paatos.paatosTiedot.headOption.flatMap(_.sovellettuLaki).exists(_ == SovellettuLaki.uo)

      if (paatosOnMyonteinen && uoLakiaSovellettu) {
        // Lopullinen UO-päätös
        generateLopullinenUOPaatosteksti(
          hakemus,
          vastaavaEhdollinenHakemus,
          tutkinnot,
          paatos,
          paatosKieli,
          hallintoOikeus,
          maakoodiService
        )
      } else {
        // TODO: fallback
        ""
      }
    } else {
      // Ehdolliset päätöstekstit

      generateEhdollinenPaatosteksti(
        hakemus,
        tutkinnot,
        paatos,
        paatosKieli,
        hallintoOikeus,
        maakoodiService
      )
    }
  }
}
