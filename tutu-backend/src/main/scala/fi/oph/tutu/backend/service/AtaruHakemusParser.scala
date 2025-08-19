package fi.oph.tutu.backend.service

import fi.oph.tutu.backend.domain.*
import fi.oph.tutu.backend.utils.Constants
import org.springframework.stereotype.{Component, Service}

@Component
@Service
class AtaruHakemusParser(koodistoService: KoodistoService) {
  private def findAnswer(key: String, allAnswers: Seq[Answer]): Option[AnswerValue] = {
    allAnswers.find(_.key == key).map(_.value)
  }
  private def findSingleStringAnswer(key: String, allAnswers: Seq[Answer]): Option[String] = {
    findAnswer(key, allAnswers) match {
      case Some(singleValue: SingleValue)                   => Some(singleValue.value)
      case Some(multi: MultiValue) if multi.value.size == 1 => Some(multi.value.head)
      case Some(nested: NestedValues) if nested.value.size == 1 && nested.value.head.size == 1 =>
        Some(nested.value.head.head)
      case _ => None
    }
  }

  private def findRequiredSingleStringAnswer(key: String, allAnswers: Seq[Answer]): String = {
    findSingleStringAnswer(key, allAnswers).getOrElse("")
  }

  private def countryCode2Name(code: Option[String]): Option[Kielistetty] = {
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
      hakemus.etunimet,
      findRequiredSingleStringAnswer("preferred-name", answers),
      hakemus.sukunimi,
      countryCode2Name(nationalityCode).getOrElse(Map()),
      hakemus.henkilotunnus,
      findRequiredSingleStringAnswer("birth-date", answers),
      findSingleStringAnswer("phone", answers),
      countryCode2Name(countryCodeForResidence).getOrElse(Map()),
      findRequiredSingleStringAnswer("address", answers),
      findRequiredSingleStringAnswer("postal-code", answers),
      findRequiredSingleStringAnswer("postal-office", answers),
      municipalityCode2Name(homeTownCode).getOrElse(Map()),
      findSingleStringAnswer("email", answers)
    )
  }

  def parseSisalto(hakemus: AtaruHakemus, lomake: AtaruLomake): Seq[SisaltoItem] = {
    val answers            = hakemus.content.answers
    val formContent        = lomake.content
    val transformedContent = traverseContent(formContent, item => transformItem(answers, item))

    transformedContent
  }

  private def findAnswerByAtaruKysymysId(
    kysymysId: AtaruKysymysId,
    allAnswers: Seq[Answer]
  ): String = {
    findSingleStringAnswer(kysymysId.definedId, allAnswers) match {
      case Some(answer) => answer
      case None         =>
        findSingleStringAnswer(kysymysId.generatedId, allAnswers) match {
          case Some(answer) => answer
          case None         => ""
        }
    }
  }

  def parseTutkinnot(hakemus: AtaruHakemus): Tutkinnot = {
    val answers = hakemus.content.answers

    val tutkinto1 = Tutkinto(
      id = None,
      hakemusId = None,
      jarjestysNumero = 1,
      nimi = findAnswerByAtaruKysymysId(Constants.ATARU_TUTKINTO_1_NIMI, answers),
      oppilaitos = findAnswerByAtaruKysymysId(Constants.ATARU_TUTKINTO_1_OPPILAITOS, answers),
      aloitusVuosi = findAnswerByAtaruKysymysId(Constants.ATARU_TUTKINTO_1_ALOITUS_VUOSI, answers).toInt,
      paattymisVuosi = findAnswerByAtaruKysymysId(Constants.ATARU_TUTKINTO_1_LOPETUS_VUOSI, answers).toInt
    )

    val tutkinto2 =
      if (findAnswerByAtaruKysymysId(Constants.ATARU_TUTKINTO_2_NIMI, answers) != "") {
        Some(
          Tutkinto(
            id = None,
            hakemusId = None,
            jarjestysNumero = 2,
            nimi = findAnswerByAtaruKysymysId(Constants.ATARU_TUTKINTO_2_NIMI, answers),
            oppilaitos = findAnswerByAtaruKysymysId(Constants.ATARU_TUTKINTO_2_OPPILAITOS, answers),
            aloitusVuosi = findAnswerByAtaruKysymysId(Constants.ATARU_TUTKINTO_2_ALOITUS_VUOSI, answers).toInt,
            paattymisVuosi = findAnswerByAtaruKysymysId(Constants.ATARU_TUTKINTO_2_LOPETUS_VUOSI, answers).toInt
          )
        )
      } else {
        None
      }

    val tutkinto3 = if (findAnswerByAtaruKysymysId(Constants.ATARU_TUTKINTO_3_NIMI, answers) != "") {
      Some(
        Tutkinto(
          None,
          None,
          jarjestysNumero = 3,
          nimi = findAnswerByAtaruKysymysId(Constants.ATARU_TUTKINTO_3_NIMI, answers),
          oppilaitos = findAnswerByAtaruKysymysId(Constants.ATARU_TUTKINTO_3_OPPILAITOS, answers),
          aloitusVuosi = findAnswerByAtaruKysymysId(Constants.ATARU_TUTKINTO_3_ALOITUS_VUOSI, answers).toInt,
          paattymisVuosi = findAnswerByAtaruKysymysId(Constants.ATARU_TUTKINTO_3_LOPETUS_VUOSI, answers).toInt
        )
      )
    } else {
      None
    }

    val muuTutkinto = if (findAnswerByAtaruKysymysId(Constants.ATARU_MUU_TUTKINTO_TIETO, answers) != "") {
      Some(
        MuuTutkinto(
          None,
          None,
          tieto = findAnswerByAtaruKysymysId(Constants.ATARU_MUU_TUTKINTO_TIETO, answers)
        )
      )
    } else {
      None
    }
    Tutkinnot(
      tutkinto1 = tutkinto1,
      tutkinto2 = tutkinto2,
      tutkinto3 = tutkinto3,
      muuTutkinto = muuTutkinto
    )
  }
}

def traverseContent(
  content: Seq[LomakeContentItem],
  handleItem: (LomakeContentItem) => SisaltoItem
): Seq[SisaltoItem] = {
  // map content
  val newItems = content
    .map((item: LomakeContentItem) => {
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
    .flatten

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
      value = ""
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
    case NestedValues(values) => values.flatten()
    case EmptyValue           => Seq()
    case null                 => Seq()
  }
}
