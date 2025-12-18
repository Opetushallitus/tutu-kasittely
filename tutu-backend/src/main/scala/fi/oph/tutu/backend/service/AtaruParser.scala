package fi.oph.tutu.backend.service

import fi.oph.tutu.backend.domain.*
import fi.oph.tutu.backend.utils.Constants
import fi.oph.tutu.backend.utils.Constants.{
  DATE_TIME_FORMAT,
  DATE_TIME_FORMAT_ATARU_ATTACHMENT_REVIEW,
  FINLAND_TZ,
  KELPOISUUS_AMMATTIIN_OPETUSALA_ROOT_VALUE,
  KELPOISUUS_AMMATTIIN_VARHAISKASVATUS_ROOT_VALUE
}
import org.springframework.stereotype.{Component, Service}

import java.time.{LocalDateTime, ZonedDateTime}
import java.time.format.DateTimeFormatter
import java.util.UUID
import scala.collection.mutable.ArrayBuffer
import scala.util.boundary
import scala.util.boundary.break

def findAnswer(key: String, allAnswers: Seq[Answer]): Option[AnswerValue] = {
  allAnswers.find(_.key == key).map(_.value)
}

def findSingleStringAnswer(key: String, allAnswers: Seq[Answer]): Option[String] = {
  findAnswer(key, allAnswers) match {
    case Some(singleValue: SingleValue)                                                      => Some(singleValue.value)
    case Some(multi: MultiValue) if multi.value.size == 1                                    => Some(multi.value.head)
    case Some(nested: NestedValues) if nested.value.size == 1 && nested.value.head.size == 1 =>
      Some(nested.value.head.head)
    case _ => None
  }
}

def findAnswerByAtaruKysymysId(
  kysymysId: AtaruKysymysId,
  allAnswers: Seq[Answer]
): Option[String] = {
  findSingleStringAnswer(kysymysId.definedId, allAnswers) match {
    case Some(answer) => Some(answer)
    case None         =>
      findSingleStringAnswer(kysymysId.generatedId, allAnswers) match {
        case Some(answer) => Some(answer)
        case None         => None
      }
  }
}

def traverseContent(
  content: Seq[LomakeContentItem],
  handleItem: LomakeContentItem => SisaltoItem
): Seq[SisaltoItem] = {
  // map content
  val newItems = content.flatMap((item: LomakeContentItem) => {
    // handle this
    val newItem = handleItem(item)

    // traverse children (children, followups)
    val newChildren = traverseContent(item.children, handleItem)

    val resultItem = newItem.copy(
      children = newChildren
    )

    // omit form nodes with no answer content
    val resultIsEmpty = newItem.value.isEmpty && newChildren.isEmpty

    if (resultIsEmpty) {
      None
    } else {
      Some(resultItem)
    }
  })

  newItems
}

def transformItem(answers: Seq[Answer], item: LomakeContentItem): SisaltoItem = {
  val itemLabel = item.label

  val answer = answers.find(a => a.key == item.id)
  val values = extractValues(answer)

  val valinnat = values.map((value: String) => {
    val emptyOption = Valinta(
      label = Map(
        Kieli.fi -> value,
        Kieli.en -> value,
        Kieli.sv -> value
      ),
      value = "",
      hidden = None
    )
    val valinta = item.options
      .find((option: Valinta) => option.value == value)
      .getOrElse(
        emptyOption
      )
    valinta
  })

  val sisaltoValues = valinnat.map((valinta: Valinta) => {
    SisaltoValue(
      valinta.label,
      valinta.value,
      traverseContent(valinta.followups, item => transformItem(answers, item))
    )
  })

  SisaltoItem(
    key = item.id,
    fieldType = item.fieldType,
    value = sisaltoValues,
    label = itemLabel,
    infoText = item.params.flatMap(_.`info-text`),
    children = Seq()
  )
}

def extractValues(answerMaybe: Option[Answer]): Seq[String] = {
  val value = answerMaybe match {
    case Some(answer) => answer.value
    case None         => null
  }

  value match {
    case SingleValue(value)   => Seq(value)
    case MultiValue(values)   => values
    case NestedValues(values) => values.flatten
    case EmptyValue           => Seq()
    case null                 => Seq()
  }
}

@Component
@Service
class AtaruHakemusParser(koodistoService: KoodistoService) {
  private def findRequiredSingleStringAnswer(key: String, allAnswers: Seq[Answer]): String = {
    findSingleStringAnswer(key, allAnswers).getOrElse("")
  }

  def countryCode2Name(code: Option[String]): Option[Kielistetty] = {
    val country = koodistoService.getKoodisto("maatjavaltiot2").find(c => c.koodiArvo == code.getOrElse(""))
    country.map(_.nimi)
  }

  private def municipalityCode2Name(code: Option[String]): Option[Kielistetty] = {
    val country = koodistoService.getKoodisto("kunta").find(c => c.koodiArvo == code.getOrElse(""))
    country.map(_.nimi)
  }

  def parseHakija(hakemus: AtaruHakemus): Hakija = {
    val answers                 = hakemus.content.answers
    val nationalityCode         = findSingleStringAnswer("nationality", answers)
    val countryCodeForResidence = findSingleStringAnswer("country-of-residence", answers)
    val homeTownCode            = findSingleStringAnswer("home-town", answers)
    Hakija(
      hakemus.`person-oid`,
      hakemus.etunimet,
      findRequiredSingleStringAnswer("preferred-name", answers),
      hakemus.sukunimi,
      Seq(countryCode2Name(nationalityCode).getOrElse(Map())),
      hakemus.henkilotunnus,
      findRequiredSingleStringAnswer("birth-date", answers),
      findSingleStringAnswer("phone", answers),
      countryCode2Name(countryCodeForResidence).getOrElse(Map()),
      findRequiredSingleStringAnswer("address", answers),
      findRequiredSingleStringAnswer("postal-code", answers),
      findRequiredSingleStringAnswer("postal-office", answers),
      municipalityCode2Name(homeTownCode).getOrElse(Map()),
      findSingleStringAnswer("email", answers),
      false
    )
  }

  def parseSisalto(hakemus: AtaruHakemus, lomake: AtaruLomake): Seq[SisaltoItem] = {
    val answers            = hakemus.content.answers
    val formContent        = lomake.content
    val transformedContent = traverseContent(formContent, item => transformItem(answers, item))

    transformedContent
  }

  def parseHakemusKoskee(hakemus: AtaruHakemus): Int = {
    val answers = hakemus.content.answers
    findAnswerByAtaruKysymysId(Constants.ATARU_HAKEMUS_KOSKEE, answers).get.toInt
  }

  def parseTutkinto1MaakoodiUri(hakemus: AtaruHakemus): Option[String] = {
    val answers = hakemus.content.answers
    findAnswerByAtaruKysymysId(Constants.ATARU_TUTKINTO_1_MAA, answers).map(value => s"maatjavaltiot2_$value")
  }

  def parseLopullinenPaatosSuoritusmaaMaakoodiUri(hakemus: AtaruHakemus): Option[String] = {
    val answers = hakemus.content.answers
    findAnswerByAtaruKysymysId(Constants.ATARU_LOPULLINEN_PAATOS_SUORITUSMAA, answers)
      .map(value => s"maatjavaltiot2_$value")
  }

  def parseLopullinenPaatosVastaavaEhdollinen(hakemus: AtaruHakemus): Option[String] = {
    val answers = hakemus.content.answers
    findAnswerByAtaruKysymysId(Constants.ATARU_LOPULLINEN_PAATOS_VASTAAVA_EHDOLLINEN, answers)
      .map(identity)
  }

  private def getAttachementKeys(contentItems: Seq[LomakeContentItem]): Seq[String] = {
    contentItems.flatMap(contentItem => {
      val keysOfChildren    = getAttachementKeys(contentItem.children)
      val keysFromFollowups = contentItem.options.flatMap(o => getAttachementKeys(o.followups))
      if (contentItem.fieldType == "attachment")
        keysOfChildren ++ keysFromFollowups :+ contentItem.id
      else
        keysOfChildren ++ keysFromFollowups
    })
  }

  def parseLiitteidenTilat(ataruHakemus: AtaruHakemus, ataruLomake: AtaruLomake): Seq[AttachmentReview] = {
    val dateTimeFormatter = DateTimeFormatter.ofPattern(DATE_TIME_FORMAT_ATARU_ATTACHMENT_REVIEW)
    val allAttachmentKeys = getAttachementKeys(ataruLomake.content)
    // TODO Ylemmän ehdon voi poistaa kunhan ataru ja tutu ovat ajantasalla
    val tilat =
      if (ataruHakemus.`application-hakukohde-attachment-reviews`.nonEmpty)
        ataruHakemus.`application-hakukohde-attachment-reviews`
      else
        ataruHakemus.`latest-attachment-reviews`.map(r =>
          AttachmentReview(
            r.attachment,
            r.state,
            r.hakukohde,
            Some(
              ZonedDateTime
                .parse(r.updateTime, dateTimeFormatter)
                .withZoneSameInstant(FINLAND_TZ)
                .toLocalDateTime
            )
          )
        )
    allAttachmentKeys.map(key => {
      tilat.find(tila => tila.attachment == key).getOrElse(AttachmentReview(key, "not-checked", "form", None))
    })
  }

  def parseTutkinnot(hakemusId: UUID, hakemus: AtaruHakemus): Seq[Tutkinto] = {
    val answers     = hakemus.content.answers
    val paatosKieli = findAnswerByAtaruKysymysId(Constants.ATARU_PAATOS_KIELI, answers)

    val tutkinnot = ArrayBuffer(
      Tutkinto(
        id = None,
        hakemusId = hakemusId,
        jarjestys = "1",
        nimi = findAnswerByAtaruKysymysId(Constants.ATARU_TUTKINTO_1_NIMI, answers),
        oppilaitos = findAnswerByAtaruKysymysId(Constants.ATARU_TUTKINTO_1_OPPILAITOS, answers),
        aloitusVuosi =
          findAnswerByAtaruKysymysId(Constants.ATARU_TUTKINTO_1_ALOITUS_VUOSI, answers).flatMap(_.toIntOption),
        paattymisVuosi =
          findAnswerByAtaruKysymysId(Constants.ATARU_TUTKINTO_1_LOPETUS_VUOSI, answers).flatMap(_.toIntOption),
        maakoodiUri =
          findAnswerByAtaruKysymysId(Constants.ATARU_TUTKINTO_1_MAA, answers).map(value => s"maatjavaltiot2_$value"),
        muuTutkintoTieto = None,
        todistuksenPaivamaara = None,
        koulutusalaKoodiUri = None,
        paaaaineTaiErikoisala = None,
        todistusOtsikko = paatosKieli match {
          case Some("swedish") => Some("examensbevis")
          case _               => Some("tutkintotodistus")
        },
        muuTutkintoMuistioId = None
      )
    )
    val isTutkinto2Defined = findAnswerByAtaruKysymysId(Constants.ATARU_TUTKINTO_2_NIMI, answers).isDefined
    val isTutkinto3Defined = findAnswerByAtaruKysymysId(Constants.ATARU_TUTKINTO_3_NIMI, answers).isDefined

    if (isTutkinto2Defined) {
      tutkinnot += Tutkinto(
        id = None,
        hakemusId = hakemusId,
        jarjestys = "2",
        nimi = findAnswerByAtaruKysymysId(Constants.ATARU_TUTKINTO_2_NIMI, answers),
        oppilaitos = findAnswerByAtaruKysymysId(Constants.ATARU_TUTKINTO_2_OPPILAITOS, answers),
        aloitusVuosi =
          findAnswerByAtaruKysymysId(Constants.ATARU_TUTKINTO_2_ALOITUS_VUOSI, answers).flatMap(_.toIntOption),
        paattymisVuosi = findAnswerByAtaruKysymysId(Constants.ATARU_TUTKINTO_2_LOPETUS_VUOSI, answers).flatMap(
          _.toIntOption
        ),
        maakoodiUri =
          findAnswerByAtaruKysymysId(Constants.ATARU_TUTKINTO_2_MAA, answers).map(value => s"maatjavaltiot2_$value"),
        muuTutkintoTieto = None,
        todistuksenPaivamaara = None,
        koulutusalaKoodiUri = None,
        paaaaineTaiErikoisala = None,
        todistusOtsikko = paatosKieli match {
          case Some("swedish") => Some("ovrigbevis")
          case _               => Some("muutodistus")
        },
        muuTutkintoMuistioId = None
      )
    }

    val tutkinto = if (isTutkinto3Defined) {
      tutkinnot +=
        Tutkinto(
          id = None,
          hakemusId = hakemusId,
          jarjestys = if (isTutkinto2Defined) "3" else "2",
          nimi = findAnswerByAtaruKysymysId(Constants.ATARU_TUTKINTO_3_NIMI, answers),
          oppilaitos = findAnswerByAtaruKysymysId(Constants.ATARU_TUTKINTO_3_OPPILAITOS, answers),
          aloitusVuosi =
            findAnswerByAtaruKysymysId(Constants.ATARU_TUTKINTO_3_ALOITUS_VUOSI, answers).flatMap(_.toIntOption),
          paattymisVuosi =
            findAnswerByAtaruKysymysId(Constants.ATARU_TUTKINTO_3_LOPETUS_VUOSI, answers).flatMap(_.toIntOption),
          maakoodiUri =
            findAnswerByAtaruKysymysId(Constants.ATARU_TUTKINTO_3_MAA, answers).map(value => s"maatjavaltiot2_$value"),
          muuTutkintoTieto = None,
          todistuksenPaivamaara = None,
          koulutusalaKoodiUri = None,
          paaaaineTaiErikoisala = None,
          todistusOtsikko =
            if (isTutkinto2Defined) None
            else
              paatosKieli match {
                case Some("swedish") => Some("ovrigbevis")
                case _               => Some("muutodistus")
              },
          muuTutkintoMuistioId = None
        )
    }

    val muuTutkinto = if (findAnswerByAtaruKysymysId(Constants.ATARU_MUU_TUTKINTO_TIETO, answers).isDefined) {
      tutkinnot +=
        Tutkinto(
          id = None,
          hakemusId = hakemusId,
          nimi = None,
          oppilaitos = None,
          aloitusVuosi = None,
          paattymisVuosi = None,
          maakoodiUri = None,
          jarjestys = "MUU",
          muuTutkintoTieto = findAnswerByAtaruKysymysId(Constants.ATARU_MUU_TUTKINTO_TIETO, answers),
          todistuksenPaivamaara = None,
          koulutusalaKoodiUri = None,
          paaaaineTaiErikoisala = None,
          todistusOtsikko = None,
          muuTutkintoMuistioId = None
        )
    }
    tutkinnot.toSeq
  }
}

@Component
@Service
class AtaruLomakeParser() {
  def parsePaatosTietoOptions(lomake: AtaruLomake): PaatosTietoOptions = {
    val kelpoisuusOptions = findOptionsByAtaruKysymysId(
      Constants.ATARU_LOMAKE_KELPOISUUS_AMMATTIIN_OPETUSALA_OPTIONS,
      lomake,
      Some(KELPOISUUS_AMMATTIIN_OPETUSALA_ROOT_VALUE)
    )
      ++ findOptionsByAtaruKysymysId(
        Constants.ATARU_LOMAKE_KELPOISUUS_AMMATTIIN_VARHAISKASVATUS_OPTIONS,
        lomake,
        Some(KELPOISUUS_AMMATTIIN_VARHAISKASVATUS_ROOT_VALUE)
      )

    val tiettyTutkintoTaiOpinnotOptions = findOptionsByAtaruKysymysId(
      Constants.ATARU_LOMAKE_TIETTY_TUTKINTO_TAI_OPINNOT_OIKEUSTIETEELLINEN_OPTIONS,
      lomake
    ) ++ findOptionsByAtaruKysymysId(
      Constants.ATARU_LOMAKE_TIETTY_TUTKINTO_TAI_OPINNOT_AINE_OPTIONS,
      lomake
    )

    val riittavatOpinnotOptions = findOptionsByAtaruKysymysId(
      Constants.ATARU_LOMAKE_RIITTAVAT_OPINNOT_OPTIONS,
      lomake
    )

    PaatosTietoOptions(
      kelpoisuusOptions = kelpoisuusOptions,
      tiettyTutkintoTaiOpinnotOptions = tiettyTutkintoTaiOpinnotOptions,
      riittavatOpinnotOptions = riittavatOpinnotOptions
    )
  }

  private def findOptionsByAtaruKysymysId(
    kysymysId: AtaruKysymysId,
    lomake: AtaruLomake,
    rootItem: Option[PaatosTietoOption] = None
  ): Seq[PaatosTietoOption] = {
    findOptionsInContentAsNestedInfoText(kysymysId, lomake.content, rootItem)
  }

  private def findOptionsInContentAsNestedInfoText(
    kysymysId: AtaruKysymysId,
    items: Seq[LomakeContentItem],
    rootItem: Option[PaatosTietoOption]
  ): Seq[PaatosTietoOption] = {
    var result = Seq[PaatosTietoOption]()

    boundary {
      for (item <- items) {

        if (matchesAtaruKysymysId(item, kysymysId)) {
          result = collectAllOptionsRecursively(item, None, rootItem)
          break()
        }

        // If not found at this level, search recursively in children
        val resultFromChildren = findOptionsInContentAsNestedInfoText(kysymysId, item.children, rootItem)
        if (resultFromChildren.nonEmpty) {
          result = resultFromChildren
          break()
        }

        // Also search in followups within options
        for (valinta <- item.options) {
          val resultFromFollowups = findOptionsInContentAsNestedInfoText(kysymysId, valinta.followups, rootItem)
          if (resultFromFollowups.nonEmpty) {
            result = resultFromFollowups
            break()
          }
        }
      }
    }

    result
  }

  private def optionPath(
    basePath: Option[Kielistetty],
    optionLabel: Kielistetty
  ): Kielistetty = {
    basePath match {
      case Some(basePathVal) =>
        Map(
          Kieli.fi -> s"${basePathVal.getOrElse(Kieli.fi, "")}_${optionLabel.getOrElse(Kieli.fi, "")}",
          Kieli.sv -> s"${basePathVal.getOrElse(Kieli.sv, "")}_${optionLabel.getOrElse(Kieli.sv, "")}",
          Kieli.en -> s"${basePathVal.getOrElse(Kieli.en, "")}_${optionLabel.getOrElse(Kieli.en, "")}"
        )
      case _ =>
        Map(
          Kieli.fi -> optionLabel.getOrElse(Kieli.fi, ""),
          Kieli.sv -> optionLabel.getOrElse(Kieli.sv, ""),
          Kieli.en -> optionLabel.getOrElse(Kieli.en, "")
        )
    }
  }

  private def collectAllOptionsRecursively(
    item: LomakeContentItem,
    basePath: Option[Kielistetty],
    rootItem: Option[PaatosTietoOption]
  ): Seq[PaatosTietoOption] = {
    rootItem match {
      case Some(rootOption) =>
        Seq(
          rootOption.copy(
            children = collectAllOptionsRecursively(item, rootOption.label, None)
          )
        )
      case _ =>
        item.options.map { option =>
          val optionPathVal = optionPath(basePath, option.label)
          PaatosTietoOption(
            label = Some(option.label),
            value = Some(optionPathVal),
            children = option.followups.flatMap { followup =>
              collectAllOptionsRecursivelyFromFollowups(followup, optionPathVal)
            }
          )
        }
    }
  }

  private def collectAllOptionsRecursivelyFromFollowups(
    item: LomakeContentItem,
    basePath: Kielistetty
  ): Seq[PaatosTietoOption] = {
    item.options.filter(option => !option.hidden.getOrElse(false)).map { option =>
      val optionPathVal = optionPath(Some(basePath), option.label)

      PaatosTietoOption(
        label = Some(option.label),
        value = Some(optionPathVal),
        children = option.followups.flatMap { followup =>
          collectAllOptionsRecursivelyFromFollowups(followup, optionPathVal)
        }
      )
    }
  }

  private def matchesAtaruKysymysId(item: LomakeContentItem, kysymysId: AtaruKysymysId): Boolean = {
    item.id == kysymysId.definedId || item.id == kysymysId.generatedId
  }
}
