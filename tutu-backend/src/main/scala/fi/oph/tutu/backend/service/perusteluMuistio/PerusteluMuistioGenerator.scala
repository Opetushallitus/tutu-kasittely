package fi.oph.tutu.backend.service.perustelumuistio

import java.time.LocalDateTime
import java.time.format.DateTimeFormatter

import fi.oph.tutu.backend.utils.Constants
import fi.oph.tutu.backend.service.findAnswerByAtaruKysymysId
import fi.oph.tutu.backend.domain.{AtaruHakemus, Hakemus, ImiPyynto, Perustelu}

def haeImiPyyntoTieto(hakemusMaybe: Option[Hakemus]): Option[String] = {
  val imiPyynto: Option[ImiPyynto] = hakemusMaybe.flatMap(_.asiakirja).map(_.imiPyynto)
  val showImiData                  = imiPyynto.flatMap(_.imiPyynto).contains(true)

  if (showImiData) {
    val imiPyyntoNumero   = imiPyynto.flatMap(_.getNumeroIfPyyntoTrue).getOrElse(" - ")
    val imiPyyntoVastattu = imiPyynto
      .flatMap(_.getVastattuIfPyyntoTrue)
      .map(date => date.format(DateTimeFormatter.ofPattern("dd.MM.yyyy")))
      .map(dateStr => s", vastattu ${dateStr}")
      .getOrElse("")

    Some(s"IMI-pyyntö: ${imiPyyntoNumero} ${imiPyyntoVastattu}")
  } else {
    None
  }
}

def haeSuostumusSahkoiseenAsiointiin(ataruHakemusMaybe: Option[AtaruHakemus]) = {
  ataruHakemusMaybe match {
    case Some(ataruHakemus) => {
      findAnswerByAtaruKysymysId(Constants.ATARU_SAHKOISEN_ASIOINNIN_LUPA, ataruHakemus.content.answers)
        .map(answer => s"Suostumus sähköiseen asiointiin: ${answer}")
    }
    case _ => None
  }
}

def generate(
  hakemusMaybe: Option[Hakemus],
  ataruHakemusMaybe: Option[AtaruHakemus],
  perusteluMaybe: Option[Perustelu]
): String = {
  var result = Seq[String]()
  result = haeImiPyyntoTieto(hakemusMaybe).map(part => result :+ part).getOrElse(result)
  result = haeSuostumusSahkoiseenAsiointiin(ataruHakemusMaybe).map(part => result :+ part).getOrElse(result)

  result.mkString("\n\n")
}
