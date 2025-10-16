package fi.oph.tutu.backend.service.perustelumuistio

import java.time.LocalDateTime
import java.time.format.DateTimeFormatter

import fi.oph.tutu.backend.utils.{haeKysymyksenTiedot, Constants}
import fi.oph.tutu.backend.service.findAnswerByAtaruKysymysId
import fi.oph.tutu.backend.domain.{
  AtaruHakemus,
  AtaruLomake,
  Hakemus,
  ImiPyynto,
  Kieli,
  Perustelu,
  ValmistumisenVahvistus,
  ValmistumisenVahvistusVastaus
}

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
  ataruHakemusMaybe
    .flatMap(ataruHakemus => {
      findAnswerByAtaruKysymysId(Constants.ATARU_SAHKOISEN_ASIOINNIN_LUPA, ataruHakemus.content.answers)
    })
    .map(answer => s"Suostumus sähköiseen asiointiin: ${answer}")

}

def haeValmistuminenVahvistettu(hakemusMaybe: Option[Hakemus]): Option[String] = {
  val valmistumisenVahvistusMaybe: Option[ValmistumisenVahvistus] = hakemusMaybe
    .flatMap(_.asiakirja)
    .map(_.valmistumisenVahvistus)

  val muotoiltuVastausMaybe =
    valmistumisenVahvistusMaybe
      .flatMap(_.getVastausIfVahvistusTrue)
      .map(value => {
        value match {
          case ValmistumisenVahvistusVastaus.Myonteinen  => "myönteinen"
          case ValmistumisenVahvistusVastaus.Kielteinen  => "kielteinen"
          case ValmistumisenVahvistusVastaus.EiVastausta => "vahvistusta ei saatu"
        }
      })

  muotoiltuVastausMaybe.map(muotoiltuVastaus =>
    s"Valmistuminen vahvistettu asiakirjan myöntäjältä tai toimivaltaiselta viranomaiselta\n  - Vastaus: ${muotoiltuVastaus}"
  )
}

def haeHakijanNimi(hakemusMaybe: Option[Hakemus]): Option[String] = {
  hakemusMaybe.map(hakemus => s"${hakemus.hakija.etunimet} ${hakemus.hakija.sukunimi}")
}

def haeHakijanSyntymaaika(hakemusMaybe: Option[Hakemus]): Option[String] = {
  hakemusMaybe.map(hakemus => hakemus.hakija.syntymaaika)
}

def haeHakemusKoskee(hakemusMaybe: Option[Hakemus]): Option[String] = {
  hakemusMaybe
    .flatMap(hakemus => {
      val kieli: Kieli = hakemus.lomakkeenKieli match {
        case "sv" => Kieli.sv
        case "en" => Kieli.en
        case _    => Kieli.fi
      }
      haeKysymyksenTiedot(hakemus.sisalto, Constants.ATARU_HAKEMUS_KOSKEE)
        .map(_.value.head.label.get(kieli))
    })
    .map(hakemusKoskee => s"Hakemus koskee:\n  - ${hakemusKoskee}")
}

def generate(
  hakemusMaybe: Option[Hakemus],
  ataruHakemusMaybe: Option[AtaruHakemus],
  perusteluMaybe: Option[Perustelu]
): String = {
  var result: Seq[String] = Seq[Option[String]](
    haeHakijanNimi(hakemusMaybe),
    haeHakijanSyntymaaika(hakemusMaybe),
    haeHakemusKoskee(hakemusMaybe),
    haeSuostumusSahkoiseenAsiointiin(ataruHakemusMaybe),
    haeImiPyyntoTieto(hakemusMaybe),
    haeValmistuminenVahvistettu(hakemusMaybe)
  ).flatten

  result.mkString("\n\n")
}
