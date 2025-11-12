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
  SisaltoItem,
  Tutkinto,
  ValmistumisenVahvistus,
  ValmistumisenVahvistusVastaus
}

def toKyllaEi(value: Boolean): String = {
  if (value) { "Kyllä" }
  else { "Ei" }
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

def haeSuostumusSahkoiseenAsiointiin(hakemusMaybe: Option[Hakemus]): Option[String] = {
  val suostumusValue = hakemusMaybe
    .flatMap(hakemus => haeKysymyksenTiedot(hakemus.sisalto, Constants.ATARU_SAHKOISEN_ASIOINNIN_LUPA))
    .flatMap(_.value.head.label.get(Kieli.fi))

  suostumusValue.map(valinta => s"Suostumus sähköiseen asiointiin: ${valinta}")
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

def haeHakemusKoskeeRivit(kieli: Kieli, item: Option[SisaltoItem], level: Int = 0): Seq[Tuple3[Int, String, String]] = {
  if (item == None) {
    Seq.empty
  } else {
    val children: Seq[SisaltoItem]  = item.map(_.children).getOrElse(Seq.empty)
    val followups: Seq[SisaltoItem] = item.map(_.value.flatMap(_.followups)).getOrElse(Seq.empty)

    val allChildren: Seq[SisaltoItem] = children ++ followups

    val alirivit: Seq[Tuple3[Int, String, String]] = allChildren.flatMap(child => {
      haeHakemusKoskeeRivit(kieli, Option(child), level + 1)
    })

    val labelMaybe = item.flatMap(_.label.get(kieli))
    val valueMaybe = item.flatMap(_.value.head.label.get(kieli))
    val fieldType  = item.map(_.fieldType).getOrElse("-")

    (labelMaybe, valueMaybe) match {
      case (Some(label), Some(value)) => {
        val rivi = s"${label}: ${value}"
        (level, rivi, fieldType) +: alirivit
      }
      case (_, _) => alirivit
    }
  }
}

def haeHakemusKoskee(hakemusMaybe: Option[Hakemus]): Option[String] = {
  if (hakemusMaybe == None) {
    None
  } else {
    val hakemus = hakemusMaybe.get

    val hakemuksenKieli: Kieli = hakemus.lomakkeenKieli match {
      case "sv" => Kieli.sv
      case "en" => Kieli.en
      case _    => Kieli.fi
    }

    val hakemusKoskeeRoot: Option[SisaltoItem] = haeKysymyksenTiedot(hakemus.sisalto, Constants.ATARU_HAKEMUS_KOSKEE)
    val hakemusKoskeeRivit: Seq[Tuple3[Int, String, String]] =
      haeHakemusKoskeeRivit(hakemuksenKieli, hakemusKoskeeRoot)
        .filter((t: Tuple3[Int, String, String]) => t._3 != "attachment")

    val hakemusKoskeeContent = hakemusKoskeeRivit
      .map((t: Tuple3[Int, String, String]) => {
        val level  = t._1
        val rivi   = t._2
        val indent = " " * level * 2
        s"${indent}${rivi}"
      })
      .mkString("\n")

    Some(s"Hakemus koskee:\n${hakemusKoskeeContent}")
  }
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
    .map(toKyllaEi)
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

          val suoritusvuodet = Seq(tutkinto.aloitusVuosi, tutkinto.paattymisVuosi).flatten
            .mkString(" - ")

          Seq[String](
            s"Tutkinto ${tutkinto.jarjestys}:",
            s"  Tutkintotodistusotsikko: ${tutkinto.todistusOtsikko.getOrElse("-")}",
            s"  Nimi: ${tutkinto.nimi.getOrElse("-")}",
            s"  Pääaine tai erikoisala: ${tutkinto.paaaaineTaiErikoisala.getOrElse("-")}",
            s"  Korkeakoulun tai oppilaitoksen nimi: ${tutkinto.oppilaitos.getOrElse("-")}",
            s"  Korkeakoulun tai oppilaitoksen sijaintimaa: ${kielistettyMaakoodi.getOrElse("-")}",
            s"  Todistuksen päivämäärä: ${tutkinto.todistuksenPaivamaara.getOrElse("-")}",
            s"  Suoritusvuodet: ${suoritusvuodet}",
            s"  Ohjeellinen laajuus: ${tutkinto.ohjeellinenLaajuus.getOrElse("-")}",
            s"  Tutkintoon sisältyi opinnäytetyö: ${tutkinto.opinnaytetyo.map(toKyllaEi).getOrElse("-")}",
            s"  Tutkintoon sisältyi harjoittelu: ${tutkinto.harjoittelu.map(toKyllaEi).getOrElse("-")}",
            s"  Lisätietoja opinnäytteisiin tai harjoitteluun liittyen: ${tutkinto.perustelunLisatietoja.getOrElse("-")}"
          ).mkString("\n")
        })
        .mkString("\n\n")
    })
}

def haeYleisetPerustelut(perusteluMaybe: Option[Perustelu]): Option[String] = {
  if (perusteluMaybe == None) {
    None
  } else {
    val perustelu = perusteluMaybe.get

    val resultString = Seq(
      perustelu.virallinenTutkinnonMyontaja
        .map(toKyllaEi)
        .map(muotoiltuValue => s"Virallinen tutkinnon myöntäjä: ${muotoiltuValue}"),
      perustelu.virallinenTutkinto
        .map(toKyllaEi)
        .map(muotoiltuValue => s"Virallinen tutkinto: ${muotoiltuValue}"),
      if (perustelu.lahdeLahtomaanKansallinenLahde) {
        Some("Lähde: Lähtömaan kansallinen lähde (verkkosivut, lainsäädäntö, julkaisut)")
      } else None,
      if (perustelu.lahdeLahtomaanVirallinenVastaus) {
        Some("Lähde: Lähtömaan virallinen vastaus")
      } else None,
      if (perustelu.lahdeKansainvalinenHakuteosTaiVerkkosivusto) {
        Some("Lähde: Kansainvälinen hakuteos tai verkkosivusto")
      } else None,
      if (perustelu.selvitysTutkinnonMyontajastaJaTutkinnonVirallisuudesta != "") {
        Some(
          s"Lyhyt selvitys tutkinnon myöntäjästä ja tutkinnon virallisuudesta:\n${perustelu.selvitysTutkinnonMyontajastaJaTutkinnonVirallisuudesta}"
        )
      } else None,
      perustelu.ylimmanTutkinnonAsemaLahtomaanJarjestelmassa
        .map(asema =>
          asema match {
            case "alempi_korkeakouluaste"           => "Vähintään kolmivuotinen ensimmäisen vaiheen korkeakoulututkinto"
            case "ylempi_korkeakouluaste"           => "Toisen vaiheen korkeakoulututkinto"
            case "alempi_ja_ylempi_korkeakouluaste" =>
              "Yksiportainen tutkinto, johon sisältyvät ensimmäisen ja toisen vaiheen tutkinnot"
            case "tutkijakoulutusaste" => "Tieteellinen jatkotutknto"
            case "ei_korkeakouluaste"  => "Alle korkeakoulutasoinen koulutus"
          }
        )
        .map(muotoiltuAsema => {
          s"Ylimmän tutkinnon asema lähtömaan järjestelmässä: ${muotoiltuAsema}"
        }),
      if (perustelu.selvitysTutkinnonAsemastaLahtomaanJarjestelmassa != "") {
        Some(
          s"Lyhyt selvitys tutkinnon asemasta lähtömaan järjestelmässä:\n${perustelu.selvitysTutkinnonAsemastaLahtomaanJarjestelmassa}"
        )
      } else None
    ).flatten.mkString("\n")

    if (resultString != "") {
      Some(resultString)
    } else {
      None
    }
  }
}

def haeJatkoOpintoKelpoisuus(perusteluMaybe: Option[Perustelu]): Option[String] = {
  if (perusteluMaybe == None) {
    None
  } else {
    val perustelu = perusteluMaybe.get
    val result    = Seq(
      perustelu.jatkoOpintoKelpoisuus
        .map(jatkoOpintoKelpoisuus =>
          jatkoOpintoKelpoisuus match {
            case "toisen_vaiheen_korkeakouluopintoihin" => "toisen vaiheen korkeakouluopintoihin"
            case "tieteellisiin_jatko-opintoihin"       => "tieteellisiin jatko-opintoihin"
            case "muu"                                  => "muu"
          }
        )
        .map(muotoiltu => s"Jatko-opintokelpoisuus: ${muotoiltu}"),
      (perustelu.jatkoOpintoKelpoisuus, perustelu.jatkoOpintoKelpoisuusLisatieto) match {
        case (Some("muu"), Some(lisatieto)) => Some(s"Jatko-opintokelpoisuuus, lisätieto:\n${lisatieto}")
        case (_, _)                         => None
      }
    ).flatten.mkString("\n")

    if (result != "") {
      Some(result)
    } else {
      None
    }
  }
}

def haeAikaisemmatPaatokset(perusteluMaybe: Option[Perustelu]): Option[String] = {
  perusteluMaybe.flatMap(perustelu => {
    perustelu.aikaisemmatPaatokset
      .map(toKyllaEi)
      .map(muotoiltu => s"Opetushallitus on tehnyt vastaavia päätöksiä: ${muotoiltu}")
  })
}

def haeMuuPerustelu(perusteluMaybe: Option[Perustelu]): Option[String] = {
  perusteluMaybe.flatMap(perustelu => {
    perustelu.muuPerustelu
      .map(muotoiltu => s"Ratkaisun tai päätöksen muut perustelut:\n${muotoiltu}")
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
    haeSuostumusSahkoiseenAsiointiin(hakemusMaybe),
    haeImiPyyntoTieto(hakemusMaybe),
    haeKoulutuksenSisalto(uoRoMuistioMaybe),
    haeImiHalytyksetTarkastettu(perusteluMaybe),
    haeYleisetPerustelut(perusteluMaybe),
    haeJatkoOpintoKelpoisuus(perusteluMaybe),
    haeAikaisemmatPaatokset(perusteluMaybe),
    haeMuuPerustelu(perusteluMaybe),
    haeValmistuminenVahvistettu(hakemusMaybe),
    haeMuuTutkinto(hakemusMaybe),
    haeYhteistutkinto(hakemusMaybe),
    haeTutkintokohtaisetTiedot(maakoodiService, hakemusMaybe)
  ).flatten

  result.mkString("\n\n")
}
