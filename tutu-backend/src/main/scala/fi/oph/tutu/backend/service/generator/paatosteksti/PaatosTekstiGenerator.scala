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
    lang: Kieli,
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
                  .flatMap(m => Some(if (lang == Kieli.fi) m.fi else m.sv))
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
              s"""<p>${tutkintoOtsikkoLabel}:</p><p>$tutkintoParts<br>"""
                + translationService.getTranslation(
                  lang,
                  "paatosteksti.todistuksenPaivamaara",
                  Map("paivamaara" -> todistuksenPaivamaara)
                )
                + "</p>"
            } else {
              ""
            }
          }
          .mkString("")
      }

    "<p>"
      + translationService.getTranslation(
        lang,
        "paatosteksti.hakija"
      )
      + s"""</p><p>$hakijaNimi<br>$hakijaSyntymaaika</p>$tutkintoBlocks"""
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

  private def getCommonMaksunOikaisuText(lang: Kieli, isPeruutus: Boolean = false): String = {
    val paatosMaksu =
      if (isPeruutus) ""
      else translationService.getTranslation(lang, "paatosteksti.maksunOikaisu.paatosMaksu")

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
