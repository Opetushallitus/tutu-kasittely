package fi.oph.tutu.backend.service

import fi.oph.tutu.backend.domain.{
  Answer,
  AnswerValue,
  AtaruHakemus,
  AtaruLomake,
  EmptyValue,
  Hakija,
  Kieli,
  Kielistetty,
  LomakeContentItem,
  MultiValue,
  NestedValues,
  SingleValue,
  SisaltoItem,
  Valinta
}
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
}

def traverseContent(
  content: Seq[LomakeContentItem],
  handleItem: (LomakeContentItem) => (SisaltoItem, Seq[LomakeContentItem])
): Seq[SisaltoItem] = {
  // map content
  val newItems = content
    .map((item: LomakeContentItem) => {

      // handle this
      val (newItem, followups) = handleItem(item)

      // traverse children (children, followups)
      val newChildren  = traverseContent(item.children, handleItem)
      val newFollowups = traverseContent(followups, handleItem)

      val resultItem = newItem.copy(
        children = newChildren,
        followups = newFollowups
      )

      // omit form nodes with no answer content
      val resultIsEmpty = newItem.value.isEmpty && newChildren.isEmpty && newFollowups.isEmpty

      if (resultIsEmpty) {
        None
      } else {
        Some(resultItem)
      }
    })
    .flatten

  newItems
}

def transformItem(answers: Seq[Answer], item: LomakeContentItem): (SisaltoItem, Seq[LomakeContentItem]) = {
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
    val valinta = item.options.find((option: Valinta) => option.value == value)
    .getOrElse(
      emptyOption
    )
    valinta
  })

  val readableValues = valinnat.map((valinta: Valinta) => {
    valinta.label
  })

  val collectedFollowups = valinnat.flatMap((valinta: Valinta) => {
    valinta.followups
  })

  (
    SisaltoItem(
      key = item.id,
      fieldType = item.fieldType,
      value = readableValues,
      label = itemLabel,
      children = Seq(),
      followups = Seq()
    ),
    collectedFollowups
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
