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

def haeSuostumusSahkoiseenAsiointiin(ataruHakemusMaybe: Option[AtaruHakemus]): Option[String] = {
  ataruHakemusMaybe match {
    case Some(ataruHakemus) => {
      findAnswerByAtaruKysymysId(Constants.ATARU_SAHKOISEN_ASIOINNIN_LUPA, ataruHakemus.content.answers)
        .map(answer => s"Suostumus sähköiseen asiointiin: ${answer}")
    }
    case _ => None
  }
}

def haeValmistuminenVahvistettu(hakemusMaybe: Option[Hakemus]): Option[String] = {
  val valmistumisenVahvistus: Option[ValmistumisenVahvistus] = hakemusMaybe
    .flatMap(_.asiakirja)
    .map(_.valmistumisenVahvistus)

  val muotoiltuVastausMaybe = valmistumisenVahvistus.getVastausIfVahvistusTrue match {
    case ValmistumisenVahvistusVastaus.Myonteinen  => "myönteinen"
    case ValmistumisenVahvistusVastaus.Kielteinen  => "kielteinen"
    case ValmistumisenVahvistusVastaus.EiVastausta => "vahvistusta ei saatu"
    case _                                         => None
  }

  muotoiltuVastausMaybe.map(muotoiltuVastaus =>
    s"Valmistuminen vahvistettu asiakirjan myöntäjältä tai toimivaltaiselta viranomaiselta\n  - Vastaus: ${muotoiltuVastaus}"
  )
}

def generate(
  hakemusMaybe: Option[Hakemus],
  ataruHakemusMaybe: Option[AtaruHakemus],
  perusteluMaybe: Option[Perustelu]
): String = {
  var result = Seq[String](
    haeImiPyyntoTieto(hakemusMaybe),
    haeSuostumusSahkoiseenAsiointiin(ataruHakemusMaybe),
    haeValmistuminenVahvistettu(hakemusMaybe)
  ).flatten

  result.mkString("\n\n")
}
