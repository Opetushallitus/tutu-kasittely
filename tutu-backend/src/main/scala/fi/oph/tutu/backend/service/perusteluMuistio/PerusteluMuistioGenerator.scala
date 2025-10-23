package fi.oph.tutu.backend.service.perustelumuistio

import java.time.LocalDateTime
import java.time.format.DateTimeFormatter

import fi.oph.tutu.backend.utils.{haeKysymyksenTiedot, Constants}
import fi.oph.tutu.backend.service.{findAnswerByAtaruKysymysId, MaakoodiService}
import fi.oph.tutu.backend.domain.{
  AtaruHakemus,
  AtaruLomake,
  Hakemus,
  ImiPyynto,
  Kieli,
  Muistio,
  Perustelu,
  Tutkinto,
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
  hakemusMaybe.map(hakemus => s"Hakijan nimi: ${hakemus.hakija.etunimet} ${hakemus.hakija.sukunimi}")
}

def haeHakijanSyntymaaika(hakemusMaybe: Option[Hakemus]): Option[String] = {
  hakemusMaybe.map(hakemus => s"Hakijan syntymäaika: ${hakemus.hakija.syntymaaika}")
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

def haeKoulutuksenSisalto(uoRoMuistioMaybe: Option[Muistio]): Option[String] = {
  uoRoMuistioMaybe
    .map(_.sisalto)
    .map(sisalto => s"Koulutuksen sisältö:\n${sisalto}")
}

def haeImiHalytyksetTarkastettu(perusteluMaybe: Option[Perustelu]): Option[String] = {
  perusteluMaybe
    .map(_.apSisalto)
    .flatMap(_.IMIHalytysTarkastettu)
    .map(value => if (value) "kyllä" else "ei")
    .map(muotoiltuValinta => s"IMI-hälytykset tarkistettu: ${muotoiltuValinta}")
}

def haeMuuTutkinto(hakemusMaybe: Option[Hakemus]): Option[String] = {
  val tutkinnotMaybe: Option[Seq[Tutkinto]] = hakemusMaybe.map(_.tutkinnot)
  val muuTutkintoMaybe: Option[Tutkinto]    = tutkinnotMaybe
    .flatMap((tutkinnot: Seq[Tutkinto]) => {
      tutkinnot.find((tutkinto: Tutkinto) => tutkinto.jarjestys == "MUU")
    })
  val muuTutkintoTietoMaybe: Option[String] = muuTutkintoMaybe.flatMap(_.muuTutkintoTieto)

  muuTutkintoTietoMaybe.map((muuTutkintoTieto: String) => s"Muu tutkinto:\n${muuTutkintoTieto}")
}

def haeYhteistutkinto(hakemusMaybe: Option[Hakemus]): Option[String] = {
  hakemusMaybe.flatMap(hakemus =>
    if (hakemus.yhteistutkinto) { Some("Yhteistutkinto") }
    else { None }
  )
}

def haeTutkintokohtaisetTiedot(
  maakoodiService: MaakoodiService,
  hakemusMaybe: Option[Hakemus]
): Option[String] = {
  val lomakkeenKieli = hakemusMaybe.map(_.lomakkeenKieli)
  hakemusMaybe
    .map(_.tutkinnot)
    .map((tutkinnot: Seq[Tutkinto]) => {
      tutkinnot
        .filter((tutkinto: Tutkinto) => tutkinto.jarjestys != "MUU")
        .sortWith((a: Tutkinto, b: Tutkinto) => a.jarjestys.toInt < b.jarjestys.toInt)
        .map((tutkinto: Tutkinto) => {
          val kielistettyMaakoodi: Option[String] =
            tutkinto.maakoodiUri
              .flatMap(uri => maakoodiService.getMaakoodiByUri(uri))
              .map(koodi =>
                lomakkeenKieli match {
                  case Some("sv") => koodi.sv
                  case Some("en") => koodi.en
                  case _          => koodi.fi
                }
              )

          Seq[String](
            s"Tutkinto ${tutkinto.jarjestys}:",
            s"Tutkintotodistusotsikko: ${tutkinto.todistusOtsikko.getOrElse("-")}",
            s"Nimi: ${tutkinto.nimi.getOrElse("-")}",
            s"Pääaine tai erikoisala: ${tutkinto.paaaaineTaiErikoisala.getOrElse("paaaaineTaiErikoisala")}",
            s"Korkeakoulun tai oppilaitoksen nimi: ${tutkinto.oppilaitos.getOrElse("-")}",
            s"Korkeakoulun tai oppilaitoksen sijaintimaa: ${kielistettyMaakoodi.getOrElse("-")}",
            s"Todistuksen päivämäärä: ${tutkinto.todistuksenPaivamaara.getOrElse("-")}"
          ).mkString("\n")
        })
        .mkString("\n\n")
    })
}

def generate(
  maakoodiService: MaakoodiService,
  hakemusMaybe: Option[Hakemus],
  ataruHakemusMaybe: Option[AtaruHakemus],
  perusteluMaybe: Option[Perustelu],
  uoRoMuistioMaybe: Option[Muistio]
): String = {
  var result: Seq[String] = Seq[Option[String]](
    haeHakijanNimi(hakemusMaybe),
    haeHakijanSyntymaaika(hakemusMaybe),
    haeHakemusKoskee(hakemusMaybe),
    haeSuostumusSahkoiseenAsiointiin(ataruHakemusMaybe),
    haeImiPyyntoTieto(hakemusMaybe),
    haeValmistuminenVahvistettu(hakemusMaybe),
    haeKoulutuksenSisalto(uoRoMuistioMaybe),
    haeImiHalytyksetTarkastettu(perusteluMaybe),
    haeMuuTutkinto(hakemusMaybe),
    haeYhteistutkinto(hakemusMaybe),
    haeTutkintokohtaisetTiedot(maakoodiService, hakemusMaybe)
  ).flatten

  result.mkString("\n\n")
}
