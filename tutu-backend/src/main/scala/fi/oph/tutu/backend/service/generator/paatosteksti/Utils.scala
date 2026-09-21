package fi.oph.tutu.backend.service.generator.paatosteksti

import fi.oph.tutu.backend.domain.Tutkinto
import fi.oph.tutu.backend.domain.Kieli
import fi.oph.tutu.backend.service.MaakoodiService
import fi.oph.tutu.backend.service.TranslationService

def getTutkintoBlocks(
  tutkinnot: Seq[Tutkinto],
  lang: Kieli,
  maakoodiService: MaakoodiService,
  translationService: TranslationService
): String = {
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
