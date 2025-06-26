package fi.oph.tutu.backend.service

import fi.oph.tutu.backend.domain.{
  Answer,
  AnswerValue,
  AtaruHakemus,
  AtaruLomake,
  EmptyValue,
  Hakija,
  Kaannokset,
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
    val municipality = koodistoService.getKoodisto("kunta").find(c => c.koodiArvo == code.getOrElse(""))
    municipality.map(_.nimi)
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

    transformedContent match {
      case Some(items) => items
      case None        => Seq()
    }
  }
}

def traverseContent(
  contentMaybe: Option[Seq[LomakeContentItem]],
  handleItem: (LomakeContentItem) => SisaltoItem
): Option[Seq[SisaltoItem]] = {
  contentMaybe match {
    case None => None
    case Some(content) => {
      // map content
      val newItems = content.map((item: LomakeContentItem) => {

        // traverse children (followups, children)
        val newChildren  = traverseContent(getChildren(item), handleItem)
        val newFollowups = traverseContent(getFollowups(item), handleItem)

        // handle this
        val newItem = handleItem(item)

        newItem.copy(
          children = newChildren,
          followups = newFollowups
        )
      })

      Some(newItems)
    }
  }
}

def getChildren(item: LomakeContentItem | Valinta): Option[Seq[LomakeContentItem]] = {
  item match {
    case lomakeContentItem: LomakeContentItem => lomakeContentItem.children
    case _: Valinta                           => None
  }
}

def getFollowups(item: LomakeContentItem | Valinta): Option[Seq[LomakeContentItem]] = {
  item match {
    case valinta: Valinta     => valinta.followups
    case _: LomakeContentItem => None
  }
}

def transformItem(answers: Seq[Answer], item: LomakeContentItem): SisaltoItem = {
  val itemLabel = item.label

  val answer = answers.find(a => a.key == item.id)
  val values = extractValues(answer)

  val readableValues = values.map((value: String) => {
    val optionMaybe = item.options match {
      case Some(opts) => opts.find((option: Valinta) => option.value == value)
      case None       => None
    }

    optionMaybe match {
      case Some(option) => option.label
      case None         => Kaannokset(Some(value), Some(value), Some(value))
    }
  })

  SisaltoItem(
    key = item.id,
    fieldType = item.fieldType,
    value = readableValues,
    label = itemLabel,
    children = None,
    followups = None
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
