package fi.oph.tutu.backend.service.generator.paatosteksti

import com.fasterxml.jackson.databind.node.ObjectNode
import java.time.format.DateTimeFormatter
import scala.util.matching.Regex
import fi.oph.tutu.backend.service.TutkintoService
import fi.oph.tutu.backend.domain.{Hakemus, HakemusOid, Tutkinto}
import fi.oph.tutu.backend.domain.Kieli
import fi.oph.tutu.backend.service.MaakoodiService
import fi.oph.tutu.backend.service.TranslationService

/**
 * ********************************************************************
 *                                                                    *
 * Apufunktioita lopullisen päätöksen päätöstekstin tuottamiseen      *
 * niiltä osin missä tarvitaan vastaavan ehdollisen päätöksen tietoja *
 *                                                                    *
 * ********************************************************************
 */

private val dtFormatter: DateTimeFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss[.SSS]'Z'")
private val datePattern: Regex             = raw"\d{1,2}\.\d{1,2}\.\d{4}".r

trait IEhdollinenHakemus {
  def hyvaksymispvm(): Option[String]
  def haeTutkinnot(): Option[String]
}

class EhdollinenTutuHakemus(
  hakemus: Hakemus,
  tutkintoService: TutkintoService,
  lang: Kieli,
  maakoodiService: MaakoodiService,
  translationService: TranslationService
) extends IEhdollinenHakemus {
  def hyvaksymispvm(): Option[String] = {
    hakemus.paatosPvm.map(_.format(DateTimeFormatter.ofPattern("dd.MM.yyyy")))
  }
  def haeTutkinnot(): Option[String] = {
    val tutkinnot: Seq[Tutkinto] = tutkintoService.haeTutkinnot(HakemusOid(hakemus.hakemusOid))

    Some(
      getTutkintoBlocks(
        tutkinnot,
        lang,
        maakoodiService,
        translationService
      )
    )
  }
}

class EhdollinenFileMakerHakemus(hakemus: ObjectNode) extends IEhdollinenHakemus {
  def hyvaksymispvm(): Option[String] = {
    val jsonNode = hakemus.get("spss_ratkaisupvm")
    if (jsonNode.isValueNode) {
      Option.when(datePattern.matches(jsonNode.asText))(jsonNode.asText)
    } else {
      None
    }
  }
  def haeTutkinnot(): Option[String] = {
    val jsonNode = hakemus.get("Tutkintotodistusteksti_päätökseen")
    if (jsonNode.isValueNode) {
      Some(jsonNode.asText)
    } else {
      None
    }
  }
}
