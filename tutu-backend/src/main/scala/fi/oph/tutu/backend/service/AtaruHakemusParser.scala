package fi.oph.tutu.backend.service

import fi.oph.tutu.backend.domain.{
  Answer,
  AnswerValue,
  AtaruHakemus,
  Hakija,
  Kielistetty,
  MultiValue,
  NestedValues,
  SingleValue
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
}
