package fi.oph.tutu.backend.service.generator.perustelumuistio

import fi.oph.tutu.backend.domain.*
import fi.oph.tutu.backend.service.{KoodistoService, MaakoodiService}
import fi.oph.tutu.backend.service.generator.{formatDate, toKyllaEi}
import fi.oph.tutu.backend.utils.{haeKysymyksenTiedot, Constants}

def haeImiPyyntoTieto(hakemusMaybe: Option[Hakemus]): Option[String] = {
  val imiPyynto: Option[ImiPyynto] = hakemusMaybe.flatMap(_.asiakirja).map(_.imiPyynto)
  val showImiData                  = imiPyynto.flatMap(_.imiPyynto).contains(true)

  if (showImiData) {
    val imiPyyntoNumero   = imiPyynto.flatMap(_.getNumeroIfPyyntoTrue).getOrElse(" - ")
    val imiPyyntoVastattu = imiPyynto
      .flatMap(_.getVastattuIfPyyntoTrue)
      .map(formatDate)
      .map(dateStr => s", vastattu $dateStr")
      .getOrElse("")

    Some(s"IMI-pyyntö: $imiPyyntoNumero $imiPyyntoVastattu")
  } else {
    None
  }
}

def haeValmistuminenVahvistettu(hakemusMaybe: Option[Hakemus]): Option[String] = {
  val valmistumisenVahvistusMaybe: Option[ValmistumisenVahvistus] = hakemusMaybe
    .flatMap(_.asiakirja)
    .map(_.valmistumisenVahvistus)

  val muotoiltuVastausMaybe =
    valmistumisenVahvistusMaybe
      .flatMap(_.getVastausIfVahvistusTrue)
      .map {
        case ValmistumisenVahvistusVastaus.Myonteinen  => "myönteinen"
        case ValmistumisenVahvistusVastaus.Kielteinen  => "kielteinen"
        case ValmistumisenVahvistusVastaus.EiVastausta => "vahvistusta ei saatu"
      }

  muotoiltuVastausMaybe.map(muotoiltuVastaus =>
    s"Valmistuminen vahvistettu asiakirjan myöntäjältä tai toimivaltaiselta viranomaiselta\n  - Vastaus: $muotoiltuVastaus"
  )
}

def haeSelvityksetSaatu(hakemusMaybe: Option[Hakemus]): Option[String] = {
  hakemusMaybe
    .flatMap(_.asiakirja)
    .map(_.selvityksetSaatu)
    .map(toKyllaEi)
    .map(muotoiltu => s"Kaikki tarvittavat selvitykset saatu: $muotoiltu")
}

def haeSuostumusSahkoiseenAsiointiin(hakemusMaybe: Option[Hakemus]): Option[String] = {
  val suostumusValue = hakemusMaybe
    .flatMap(hakemus => haeKysymyksenTiedot(hakemus.sisalto, Constants.ATARU_SAHKOISEN_ASIOINNIN_LUPA))
    .flatMap(_.value.head.label.get(Kieli.fi))

  suostumusValue.map(valinta => s"Suostumus sähköiseen asiointiin: $valinta")
}

def haeHakijanNimi(hakemusMaybe: Option[Hakemus]): Option[String] = {
  hakemusMaybe.map(hakemus => s"Hakijan nimi: ${hakemus.hakija.etunimet} ${hakemus.hakija.sukunimi}")
}

def haeHakijanSyntymaaika(hakemusMaybe: Option[Hakemus]): Option[String] = {
  hakemusMaybe.map(hakemus => s"Hakijan syntymäaika: ${hakemus.hakija.syntymaaika}")
}

def haeHakemusKoskeeRivit(kieli: Kieli, item: Option[SisaltoItem], level: Int = 0): Seq[(Int, String, String)] = {
  if (item.isEmpty) {
    Seq.empty
  } else {
    val children: Seq[SisaltoItem]  = item.map(_.children).getOrElse(Seq.empty)
    val followups: Seq[SisaltoItem] = item.map(_.value.flatMap(_.followups)).getOrElse(Seq.empty)

    val allChildren: Seq[SisaltoItem] = children ++ followups

    val alirivit: Seq[(Int, String, String)] = allChildren.flatMap(child => {
      haeHakemusKoskeeRivit(kieli, Option(child), level + 1)
    })

    val labelMaybe = item.flatMap(_.label.get(kieli))
    val valueMaybe = item.flatMap(_.value.head.label.get(kieli))
    val fieldType  = item.map(_.fieldType).getOrElse("-")

    (labelMaybe, valueMaybe) match {
      case (Some(label), Some(value)) =>
        val rivi = s"$label: $value"
        (level, rivi, fieldType) +: alirivit
      case (_, _) => alirivit
    }
  }
}

def haeHakemusKoskee(hakemusMaybe: Option[Hakemus]): Option[String] = {
  if (hakemusMaybe.isEmpty) {
    None
  } else {
    val hakemus = hakemusMaybe.get

    val hakemuksenKieli: Kieli = hakemus.lomakkeenKieli match {
      case "sv" => Kieli.sv
      case "en" => Kieli.en
      case _    => Kieli.fi
    }

    val hakemusKoskeeRoot: Option[SisaltoItem] = haeKysymyksenTiedot(hakemus.sisalto, Constants.ATARU_HAKEMUS_KOSKEE)
    val hakemusKoskeeRivit: Seq[(Int, String, String)] =
      haeHakemusKoskeeRivit(hakemuksenKieli, hakemusKoskeeRoot)
        .filter((t: (Int, String, String)) => t._3 != "attachment")

    val hakemusKoskeeContent = hakemusKoskeeRivit
      .map((t: (Int, String, String)) => {
        val level  = t._1
        val rivi   = t._2
        val indent = " " * level * 2
        s"$indent$rivi"
      })
      .mkString("\n")

    Some(s"Hakemus koskee:\n$hakemusKoskeeContent")
  }
}

def haeMuuTutkinto(tutkinnot: Seq[Tutkinto]): Option[String] = {
  val muuTutkintoMaybe: Option[Tutkinto]    = tutkinnot.find((tutkinto: Tutkinto) => tutkinto.jarjestys == "MUU")
  val muuTutkintoTietoMaybe: Option[String] = muuTutkintoMaybe.flatMap(_.muuTutkintoTieto)

  muuTutkintoTietoMaybe.map((muuTutkintoTieto: String) => s"Muu tutkinto:\n$muuTutkintoTieto")
}

def haeYhteistutkinto(hakemusMaybe: Option[Hakemus]): Option[String] = {
  hakemusMaybe.flatMap(hakemus =>
    if (hakemus.yhteistutkinto) { Some("Yhteistutkinto") }
    else { None }
  )
}

def haeTutkintokohtaisetTiedot(
  maakoodiService: MaakoodiService,
  koodistoService: KoodistoService,
  hakemusMaybe: Option[Hakemus],
  tutkinnot: Seq[Tutkinto]
): Option[String] = {
  val lomakkeenKieli                  = hakemusMaybe.map(_.lomakkeenKieli)
  val koulutusalat: Seq[KoodistoItem] = koodistoService.getKoodisto("kansallinenkoulutusluokitus2016koulutusalataso1")

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

      val koulutusala: Option[String] = tutkinto.koulutusalaKoodiUri
        .map(koulutusalaKoodiUri => koulutusalat.find(item => item.koodiUri == koulutusalaKoodiUri))
        .flatMap {
          case None       => None
          case Some(item) => item.nimi.get(Kieli.fi)
        }

      Seq[String](
        s"Tutkinto ${tutkinto.jarjestys}:",
        s"  Tutkintotodistusotsikko: ${tutkinto.todistusOtsikko.getOrElse("-")}",
        s"  Nimi: ${tutkinto.nimi.getOrElse("-")}",
        s"  Pääaine tai erikoisala: ${tutkinto.paaaaineTaiErikoisala.getOrElse("-")}",
        s"  Koulutusala: ${koulutusala.getOrElse("-")}",
        s"  Korkeakoulun tai oppilaitoksen nimi: ${tutkinto.oppilaitos.getOrElse("-")}",
        s"  Korkeakoulun tai oppilaitoksen sijaintimaa: ${kielistettyMaakoodi.getOrElse("-")}",
        s"  Todistuksen päivämäärä: ${tutkinto.todistuksenPaivamaara.getOrElse("-")}",
        s"  Suoritusvuodet: $suoritusvuodet",
        s"  Ohjeellinen laajuus: ${tutkinto.ohjeellinenLaajuus.getOrElse("-")}",
        s"  Tutkintoon sisältyi opinnäytetyö: ${tutkinto.opinnaytetyo.map(toKyllaEi).getOrElse("-")}",
        s"  Tutkintoon sisältyi harjoittelu: ${tutkinto.harjoittelu.map(toKyllaEi).getOrElse("-")}",
        s"  Lisätietoja opinnäytteisiin tai harjoitteluun liittyen: ${tutkinto.perustelunLisatietoja.getOrElse("-")}"
      ).mkString("\n")
    })
    .mkString("\n\n") match {
    case ""    => None
    case value => Some(value)
  }
}

def haeYleisetPerustelut(perusteluMaybe: Option[Perustelu]): Option[String] = {
  perusteluMaybe match {
    case None            => None
    case Some(perustelu) =>
      val resultString = Seq(
        perustelu.virallinenTutkinnonMyontaja
          .map(toKyllaEi)
          .map(muotoiltuValue => s"Virallinen tutkinnon myöntäjä: $muotoiltuValue"),
        perustelu.virallinenTutkinto
          .map(toKyllaEi)
          .map(muotoiltuValue => s"Virallinen tutkinto: $muotoiltuValue"),
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
          .map {
            case "alempi_korkeakouluaste"           => "Vähintään kolmivuotinen ensimmäisen vaiheen korkeakoulututkinto"
            case "ylempi_korkeakouluaste"           => "Toisen vaiheen korkeakoulututkinto"
            case "alempi_ja_ylempi_korkeakouluaste" =>
              "Yksiportainen tutkinto, johon sisältyvät ensimmäisen ja toisen vaiheen tutkinnot"
            case "tutkijakoulutusaste" => "Tieteellinen jatkotutknto"
            case "ei_korkeakouluaste"  => "Alle korkeakoulutasoinen koulutus"
          }
          .map(muotoiltuAsema => {
            s"Ylimmän tutkinnon asema lähtömaan järjestelmässä: $muotoiltuAsema"
          }),
        if (perustelu.selvitysTutkinnonAsemastaLahtomaanJarjestelmassa != "") {
          Some(
            s"Lyhyt selvitys tutkinnon asemasta lähtömaan järjestelmässä:\n${perustelu.selvitysTutkinnonAsemastaLahtomaanJarjestelmassa}"
          )
        } else None
      ).flatten.mkString("\n")

      resultString match {
        case "" => None
        case _  => Some(resultString)
      }
  }
}

def haeJatkoOpintoKelpoisuus(perusteluMaybe: Option[Perustelu]): Option[String] = {
  perusteluMaybe match {
    case None            => None
    case Some(perustelu) =>
      val result = Seq(
        perustelu.jatkoOpintoKelpoisuus
          .map {
            case "toisen_vaiheen_korkeakouluopintoihin" => "toisen vaiheen korkeakouluopintoihin"
            case "tieteellisiin_jatko-opintoihin"       => "tieteellisiin jatko-opintoihin"
            case "muu"                                  => "muu"
          }
          .map(muotoiltu => s"Jatko-opintokelpoisuus: $muotoiltu"),
        (perustelu.jatkoOpintoKelpoisuus, perustelu.jatkoOpintoKelpoisuusLisatieto) match {
          case (Some("muu"), Some(lisatieto)) => Some(s"Jatko-opintokelpoisuuus, lisätieto:\n$lisatieto")
          case (_, _)                         => None
        }
      ).flatten.mkString("\n")

      result match {
        case "" => None
        case _  => Some(result)
      }
  }
}

def haeAikaisemmatPaatokset(perusteluMaybe: Option[Perustelu]): Option[String] = {
  perusteluMaybe.flatMap(perustelu => {
    perustelu.aikaisemmatPaatokset
      .map(toKyllaEi)
      .map(muotoiltu => s"Opetushallitus on tehnyt vastaavia päätöksiä: $muotoiltu")
  })
}

def haeMuuPerustelu(perusteluMaybe: Option[Perustelu]): Option[String] = {
  perusteluMaybe.flatMap(perustelu => {
    perustelu.muuPerustelu
      .filter(_.nonEmpty)
      .map(muotoiltu => s"Ratkaisun tai päätöksen muut perustelut:\n$muotoiltu")
  })
}

def haeUoRoPerustelu(
  perusteluMaybe: Option[Perustelu],
  koulutuksenSisaltoMuistioMaybe: Option[Muistio],
  muuTutkintoMuistioMaybe: Option[Muistio]
): Option[String] = {
  val koulutuksenSisalto = koulutuksenSisaltoMuistioMaybe
    .map(_.sisalto)
    .map(sisalto => s"Koulutuksen sisältö:\n$sisalto")

  val erotKoulutuksenSisallossa = perusteluMaybe
    .map(_.uoRoSisalto)
    .map(uoRoSisalto => {
      Seq(
        ////////////
        // Opettajat
        uoRoSisalto.opettajatEroMonialaisetOpinnotSisalto
          .filter(_.==(true))
          .map(_ => "Ero monialaisten opintojen sisällössä"),
        uoRoSisalto.opettajatEroMonialaisetOpinnotLaajuus
          .filter(_.==(true))
          .map(_ => "Ero monialaisten opintojen laajuudessa"),
        uoRoSisalto.opettajatEroPedagogisetOpinnotSisalto
          .filter(_.==(true))
          .map(_ => "Ero pedagogisten opintojen sisällössä"),
        uoRoSisalto.opettajatEroPedagogisetOpinnotLaajuus
          .filter(_.==(true))
          .map(_ => "Ero pedagogisten opintojen laajuudessa"),
        uoRoSisalto.opettajatEroKasvatustieteellisetOpinnotLaajuus
          .filter(_.==(true))
          .map(_ => "Ero kasvatustieteellisten opintojen laajuudessa (LO)"),
        uoRoSisalto.opettajatEroKasvatustieteellisetOpinnotVaativuus
          .filter(_.==(true))
          .map(_ => "Ero kasvatustieteellisten opintojen vaativuudessa (LO)"),
        uoRoSisalto.opettajatEroKasvatustieteellisetOpinnotSisalto
          .filter(_.==(true))
          .map(_ => "Ero kasvatustieteellisten opintojen sisällössä (LO)"),
        uoRoSisalto.opettajatEroOpetettavatAineetOpinnotSisalto
          .filter(_.==(true))
          .map(_ => "Ero opetettavan aineen opintojen sisällössä"),
        uoRoSisalto.opettajatEroOpetettavatAineetOpinnotVaativuus
          .filter(_.==(true))
          .map(_ => "Ero opetettavan aineen opintojen vaativuudessa"),
        uoRoSisalto.opettajatEroOpetettavatAineetOpinnotLaajuus
          .filter(_.==(true))
          .map(_ => "Ero opetettavan aineen opintojen laajuudessa"),
        uoRoSisalto.opettajatEroErityisopettajanOpinnotSisalto
          .filter(_.==(true))
          .map(_ => "Ero erityisopettajan opintojen sisällössä"),
        uoRoSisalto.opettajatEroErityisopettajanOpinnotLaajuus
          .filter(_.==(true))
          .map(_ => "Ero erityisopettajan opintojen laajuudessa"),
        (uoRoSisalto.opettajatMuuEro, uoRoSisalto.opettajatMuuEroSelite) match {
          case (Some(true), Some(""))     => Some("Muu ero")
          case (Some(true), None)         => Some("Muu ero")
          case (Some(true), Some(selite)) => Some(s"Muu ero:\n$selite")
          case (_, _)                     => None
        },

        ///////////////////////////////
        // Varhaiskasvatuksen opettajat
        uoRoSisalto.vkOpettajatEroKasvatustieteellisetOpinnotLaajuus
          .filter(_.==(true))
          .map(_ => "Ero kasvatustieteellisten opintojen laajuudessa"),
        uoRoSisalto.vkOpettajatEroKasvatustieteellisetOpinnotSisalto
          .filter(_.==(true))
          .map(_ => "Ero kasvatustieteellisten opintojen sisällössä"),
        uoRoSisalto.vkOpettajatEroVarhaiskasvatusEsiopetusOpinnotLaajuus
          .filter(_.==(true))
          .map(_ => "Ero varhaiskasvatuksen ja esiopetuksen opintojen laajuudessa"),
        uoRoSisalto.vkOpettajatEroVarhaiskasvatusEsiopetusOpinnotSisalto
          .filter(_.==(true))
          .map(_ => "Ero varhaiskasvatuksen ja esiopetuksen opintojen sisällössä"),
        (uoRoSisalto.vkOpettajatMuuEro, uoRoSisalto.vkOpettajatMuuEroSelite) match {
          case (Some(true), Some(""))     => Some("Muu ero")
          case (Some(true), None)         => Some("Muu ero")
          case (Some(true), Some(selite)) => Some(s"Muu ero:\n$selite")
          case (_, _)                     => None
        },

        //////////////////////////
        // Oikeustieteen maisterit
        uoRoSisalto.otmEroOpinnotLaajuus
          .filter(_.==(true))
          .map(_ => "Ero oikeustieteellisten opintojen laajuudessa"),
        uoRoSisalto.otmEroOpinnotVaativuus
          .filter(_.==(true))
          .map(_ => "Ero oikeustieteellisten opintojen vaativuudessa"),
        uoRoSisalto.otmEroOpinnotSisalto
          .filter(_.==(true))
          .map(_ => "Ero oikeustieteellisten opintojen sisällössä"),
        (uoRoSisalto.otmMuuEro, uoRoSisalto.otmMuuEroSelite) match {
          case (Some(true), Some(""))     => Some("Muu ero")
          case (Some(true), None)         => Some("Muu ero")
          case (Some(true), Some(selite)) => Some(s"Muu ero:\n$selite")
          case (_, _)                     => None
        }
      ).flatten.mkString("\n")
    })

  val muuTutkintoTaiOpintosuoritus = muuTutkintoMuistioMaybe
    .map(_.sisalto)
    .map(sisalto => s"Muu tutkinto tai opintosuoritus:\n$sisalto")

  val result = Seq(
    koulutuksenSisalto,
    erotKoulutuksenSisallossa,
    muuTutkintoTaiOpintosuoritus
  ).flatten.mkString("\n")

  result match {
    case "" => None
    case _  => Some(result)
  }
}

def haeApPerustelu(perusteluMaybe: Option[Perustelu]): Option[String] = {
  perusteluMaybe match {
    case None            => None
    case Some(perustelu) =>
      val apSisalto = perustelu.apSisalto
      val result    = Seq(
        /////////////////////////////////
        // Peruste AP-lain soveltamiselle
        apSisalto.lakiperusteToisessaJasenmaassaSaannelty
          .filter(_.==(true))
          .map(_ => "Toisessa jäsenmaassa säänneltyyn ammattiin johtanut koulutus tai säännelty ammatillinen koulutus"),
        apSisalto.lakiperustePatevyysLahtomaanOikeuksilla
          .filter(_.==(true))
          .map(_ => "Pätevyys ammattiin lähtömaassa saavutettujen oikeuksien nojalla"),
        apSisalto.lakiperusteToinenEUmaaTunnustanut
          .filter(_.==(true))
          .map(_ =>
            "EU-kansalaisen EU:n ulkopuolella hankkima ammattipätevyys, jonka toinen EU-maa on tunnustanut, ja henkilöllä on jäsenmaassa hankittu"
          ),
        apSisalto.lakiperusteLahtomaassaSaantelematon
          .filter(_.==(true))
          .map(_ =>
            "Lähtömaassa sääntelemätön ammatti tai koulutus ja hakijalla vähintään vuoden ammattikokemus maasta, joka ei sääntele ammattia"
          ),

        // ------- //
        apSisalto.todistusEUKansalaisuuteenRinnasteisestaAsemasta
          .filter(_.nonEmpty)
          .map(text => s"Todistus, joka todistaa EU-kansalaisuuteen rinnaisteisen aseman:\n$text\n"),
        apSisalto.ammattiJohonPatevoitynyt
          .filter(_.nonEmpty)
          .map(text => s"Mihin ammattiin hakija on pätevöitynyt toisessa jäsenmaassa:\n$text\n"),
        apSisalto.ammattitoiminnanPaaAsiallinenSisalto
          .filter(_.nonEmpty)
          .map(text => s"Ammattitoiminnan pääasiallinen sisältö lähtömaassa:\n$text\n"),
        apSisalto.koulutuksenKestoJaSisalto
          .filter(_.nonEmpty)
          .map(text => s"Koulutuksen kesto ja pääasiallinen sisältö:\n$text\n"),

        //////////////////////////////////////////////////////////////////////////////
        // Ammattipätevyyttä ja ammatin tai koulutuksen sääntelyä koskevat selvitykset
        apSisalto.selvityksetLahtomaanViranomaiselta
          .filter(_.==(true))
          .map(_ => "Vastaus lähtömaan toimivaltaiselta viranomaiselta"),
        apSisalto.selvityksetLahtomaanLainsaadannosta
          .filter(_.==(true))
          .map(_ => "Selvitetty lähtömaan lainsäädännöstä"),
        (apSisalto.selvityksetAikaisempiTapaus, apSisalto.selvityksetAikaisemmanTapauksenAsiaTunnus) match {
          case (Some(true), Some(""))         => Some("Selvitetty aikaisempien samanlaisten tapausten yhteydessä")
          case (Some(true), None)             => Some("Selvitetty aikaisempien samanlaisten tapausten yhteydessä")
          case (Some(true), Some(asiatunnus)) =>
            Some(s"Selvitetty aikaisempien samanlaisten tapausten yhteydessä. Asiatunnus: $asiatunnus")
          case (_, _) => None
        },
        apSisalto.selvityksetIlmeneeAsiakirjoista
          .filter(_.==(true))
          .map(_ => "Ilmenee hakijan esittämistä asiakirjoista"),

        // ------- //
        apSisalto.lisatietoja
          .filter(_.nonEmpty)
          .map(text => s"Lisätietoja:\n$text\n"),
        apSisalto.IMIHalytysTarkastettu
          .filter(_.==(true))
          .map(muotoiltuValinta => s"IMI-hälytykset tarkistettu"),
        apSisalto.muutAPPerustelut
          .filter(_.nonEmpty)
          .map(text => s"Muut AP-päätöksen perustelut:\n$text\n"),
        apSisalto.SEUTArviointi
          .filter(_.nonEmpty)
          .map(text => s"SEUT-arviointi:\n$text\n")
      ).flatten.mkString("\n")

      result match {
        case "" => None
        case _  => Some(result)
      }
  }
}

def haeLausuntopyynnot(
  koodistoService: KoodistoService,
  perusteluMaybe: Option[Perustelu]
): Option[String] = {
  perusteluMaybe match {
    case None            => None
    case Some(perustelu) =>
      val korkeakoulut = koodistoService.haeKorkeakoulut()

      val pyynnot = perustelu.lausuntopyynnot.map(pyynto => {
        Seq(
          (pyynto.lausunnonAntajaKoodiUri, pyynto.lausunnonAntajaMuu) match {
            case (Some("muu"), Some(tarkenne)) => Some(s"Lausunnon antaja, muu: $tarkenne")
            case (Some("muu"), None)           => Some(s"Lausunnon antaja, muu")
            case (Some(korkeakouluKoodi), _)   =>
              val korkeakoulu = korkeakoulut
                .find(item => item.koodiUri == korkeakouluKoodi)
                .flatMap(_.nimi.get(Kieli.fi))

              korkeakoulu match {
                case None                   => Some(s"Lausunnon antaja: $korkeakouluKoodi")
                case Some(korkeakoulunNimi) => Some(s"Lausunnon antaja: $korkeakoulunNimi")
              }
            case (None, _) => Some(s"Lausunnon antaja: -")
          },
          pyynto.lahetetty
            .map(formatDate)
            .map(lahetetty => s"Lähetetty: $lahetetty"),
          pyynto.saapunut
            .map(formatDate)
            .map(saapunut => s"Lähetetty: $saapunut")
        ).flatten.mkString("\n")
      })

      val sisalto = perustelu.lausunnonSisalto
        .map(sisalto => s"Lausuntopyynnön sisältö:\n$sisalto")

      val yhdistetty = pyynnot :+ sisalto

      Some(yhdistetty.mkString("\n\n"))
  }
}

def haeAsiakirjat(
  hakemusMaybe: Option[Hakemus],
  asiakirjaMuistioMaybe: Option[Muistio]
): Option[String] = {
  val imipyyntoMaybe: Option[String]                = haeImiPyyntoTieto(hakemusMaybe)
  val valmistuminenVahvistettuMaybe: Option[String] = haeValmistuminenVahvistettu(hakemusMaybe)
  val selvityksetSaatuMaybe: Option[String]         = haeSelvityksetSaatu(hakemusMaybe)

  val esittelijanHuomiotMaybe: Option[String] = asiakirjaMuistioMaybe
    .map(_.sisalto)
    .map(sisalto => s"Esittelijän huomioita asiakirjoista:\n$sisalto")

  val result = Seq(
    imipyyntoMaybe,
    valmistuminenVahvistettuMaybe,
    selvityksetSaatuMaybe,
    esittelijanHuomiotMaybe
  ).flatten.mkString("\n")

  if (result == "") {
    None
  } else {
    Some(result)
  }
}

///////////////
// Päätökset

def haeSeutArviointiTehty(paatos: Paatos): Option[String] = {
  if (paatos.seutArviointi) {
    Some("SEUT-arviointi tehty")
  } else {
    None
  }
}

def haeRatkaisutyyppi(paatos: Paatos): Option[String] = {
  paatos.ratkaisutyyppi
    .map {
      case Ratkaisutyyppi.Paatos                 => "Päätös"
      case Ratkaisutyyppi.PeruutusTaiRaukeaminen => "Peruutus tai raukeaminen"
      case Ratkaisutyyppi.Oikaisu                => "Oikaisu"
      case Ratkaisutyyppi.JatetaanTutkimatta     => "Jätetään tutkimatta"
      case Ratkaisutyyppi.Siirto                 => "Siirto"
    }
    .map((muotoiltu: String) => {
      s"Ratkaisutyyppi: $muotoiltu"
    })
}

def haePaatosTyyppi(paatosTiedot: PaatosTieto): Option[String] = {
  paatosTiedot.paatosTyyppi
    .map {
      case PaatosTyyppi.Taso                     => "Taso"
      case PaatosTyyppi.Kelpoisuus               => "Kelpoisuus"
      case PaatosTyyppi.TiettyTutkintoTaiOpinnot => "Tietty tutkinto tai opinnot"
      case PaatosTyyppi.RiittavatOpinnot         => "Riittävät opinnot"
    }
    .map((muotoiltu: String) => s"Päätöstyyppi: $muotoiltu")
}

def haeSovellettuLaki(paatosTiedot: PaatosTieto): Option[String] = {
  paatosTiedot.sovellettuLaki
    .map {
      case SovellettuLaki.uo      => "Päätös UO"
      case SovellettuLaki.ap      => "Päätös AP"
      case SovellettuLaki.ap_seut => "Päätös AP/SEUT"
      case SovellettuLaki.ro      => "Päätös RO"
    }
    .map((muotoiltu: String) => s"Sovellettu laki: $muotoiltu")
}

def haeTutkinnonNimi(paatosTiedot: PaatosTieto, tutkinnot: Seq[Tutkinto]): Option[String] = {
  tutkinnot
    .find(tutkinto => tutkinto.id == paatosTiedot.tutkintoId)
    .flatMap(_.nimi)
    .map(muotoiltu => s"Tutkinnon nimi, jota päätös koskee: $muotoiltu")
}

def haeMyonteinenTaiKielteinen(paatostiedot: PaatosTieto): Option[String] = {
  paatostiedot.myonteinenPaatos
    .map(toKyllaEi)
    .map(muotoiltu => s"Päätös on myönteinen: $muotoiltu")
}

def haeTutkinnonTaso(paatostiedot: PaatosTieto): Option[String] = {
  paatostiedot.tutkintoTaso
    .map {
      case TutkintoTaso.AlempiKorkeakoulu => "Alempi korkeakoulututkinto"
      case TutkintoTaso.YlempiKorkeakoulu => "Ylempi korkeakoulututkinto"
    }
    .map(muotoiltu => s"Tutkinnon taso: $muotoiltu")
}

def haeKielteisenPaatoksenPerustelut(perustelut: Option[KielteisenPaatoksenPerustelut]): Option[String] = {
  val epavirallinenKorkeakoulu = perustelut
    .map(_.epavirallinenKorkeakoulu)
    .filter(_ == true)
    .map(_ => "- Epävirallinen korkeakoulu")
  val epavirallinenTutkinto = perustelut
    .map(_.epavirallinenTutkinto)
    .filter(_ == true)
    .map(_ => "- Epävirallinen tutkinto")
  val eiVastaaSuomessaSuoritettavaaTutkintoa = perustelut
    .map(_.eiVastaaSuomessaSuoritettavaaTutkintoa)
    .filter(_ == true)
    .map(_ => "- Ei tasoltaan vastaa Suomessa suoritettavaa korkeakoulututkintoa")

  val muuPerusteluSelected: Boolean = perustelut
    .map(_.muuPerustelu)
    .filter(_ == true)
    .getOrElse(false)
  val muuPerustelu = if (muuPerusteluSelected) {
    perustelut
      .flatMap(_.muuPerusteluKuvaus)
      .map(kuvaus => s"- Muu perustelu: $kuvaus")
  } else {
    None
  }

  val result = Seq(
    epavirallinenKorkeakoulu,
    epavirallinenTutkinto,
    eiVastaaSuomessaSuoritettavaaTutkintoa,
    muuPerustelu
  ).flatten

  if (result.size > 0) {
    val resultWithTitle = "Kielteisen päätöksen perustelut:" +: result
    Some(resultWithTitle.mkString("\n"))
  } else {
    None
  }
}

def haePeruutusTaiRaukeaminen(paatos: Paatos): Option[String] = {
  val syyt = paatos.peruutuksenTaiRaukeamisenSyy

  val eiSaaHakemaansaEikaHaluaPaatostaJonkaVoisiSaada = syyt
    .flatMap(_.eiSaaHakemaansaEikaHaluaPaatostaJonkaVoisiSaada)
    .filter(_ == true)
    .map(_ => "- Ei voi saada hakemaansa päätöstä, eikä halua päätöstä jonka voisi saada")
  val muutenTyytymatonRatkaisuun = syyt
    .flatMap(_.muutenTyytymatonRatkaisuun)
    .filter(_ == true)
    .map(_ => "- On muuten tyytymätön ratkaisuun")
  val eiApMukainenTutkintoTaiHaettuaPatevyytta = syyt
    .flatMap(_.eiApMukainenTutkintoTaiHaettuaPatevyytta)
    .filter(_ == true)
    .map(_ => "- Ei AP-lain mukainen tutkinto tai haettua ammattipätevyyttä")
  val eiTasoltaanVastaaSuomessaSuoritettavaaTutkintoa = syyt
    .flatMap(_.eiTasoltaanVastaaSuomessaSuoritettavaaTutkintoa)
    .filter(_ == true)
    .map(_ => "- Ei tasoltaan vastaa Suomessa suoritettavaa korkeakoulututkintoa")
  val epavirallinenKorkeakouluTaiTutkinto = syyt
    .flatMap(_.epavirallinenKorkeakouluTaiTutkinto)
    .filter(_ == true)
    .map(_ => "- Epävirallinen korkeakoulu tai tutkinto")
  val eiEdellytyksiaRoEikaTasopaatokselle = syyt
    .flatMap(_.eiEdellytyksiaRoEikaTasopaatokselle)
    .filter(_ == true)
    .map(_ => "- Ei edellytyksiä RO- eikä tasopäätökselle")
  val eiEdellytyksiaRinnastaaTiettyihinKkOpintoihin = syyt
    .flatMap(_.eiEdellytyksiaRinnastaaTiettyihinKkOpintoihin)
    .filter(_ == true)
    .map(_ => "- Ei edellytyksiä rinnastaa tiettyihin korkeakouluopintoihin")
  val hakijallaJoPaatosSamastaKoulutusKokonaisuudesta = syyt
    .flatMap(_.hakijallaJoPaatosSamastaKoulutusKokonaisuudesta)
    .filter(_ == true)
    .map(_ => "- Hakijalla on jo päätös samasta koulutuskokonaisuudesta")
  val muuSyy = syyt
    .flatMap(_.muuSyy)
    .filter(_ == true)
    .map(_ => "- Muu syy, esim. aikataulu")

  val result = Seq(
    eiSaaHakemaansaEikaHaluaPaatostaJonkaVoisiSaada,
    muutenTyytymatonRatkaisuun,
    eiApMukainenTutkintoTaiHaettuaPatevyytta,
    eiTasoltaanVastaaSuomessaSuoritettavaaTutkintoa,
    epavirallinenKorkeakouluTaiTutkinto,
    eiEdellytyksiaRoEikaTasopaatokselle,
    eiEdellytyksiaRinnastaaTiettyihinKkOpintoihin,
    hakijallaJoPaatosSamastaKoulutusKokonaisuudesta,
    muuSyy
  ).flatten

  if (result.size > 0) {
    Some(("Peruutuksen tai raukeamisen syyt:" +: result).mkString("\n"))
  } else {
    None
  }
}

/* ------- */
/* ------- */

def haeRinnastettavatTutkinnotTaiOpinnot(paatosTiedot: PaatosTieto): Option[String] = {
  val resultList: Seq[String] = paatosTiedot.rinnastettavatTutkinnotTaiOpinnot
    .map((tutkintoTaiOpinto: TutkintoTaiOpinto) => {
      val nimi: Option[String] = tutkintoTaiOpinto.tutkintoTaiOpinto
        .map(_.split("_"))
        .map(_.last)

      val kielteisenPaatoksenPerustelut: Option[String] =
        haeKielteisenPaatoksenPerustelut(tutkintoTaiOpinto.kielteisenPaatoksenPerustelut)

      val myonteisenPaatoksenLisavaatimukset: Option[String] =
        haeTutkinnonTaiOpinnonLisavaatimukset(tutkintoTaiOpinto.myonteisenPaatoksenLisavaatimukset)

      val result = Seq(
        nimi,
        kielteisenPaatoksenPerustelut,
        myonteisenPaatoksenLisavaatimukset
      ).flatten.mkString("\n")

      if (result != "") {
        Some(result)
      } else {
        None
      }
    })
    .flatten

  if (resultList.size > 0) {
    val resultWithTitle = "Rinnastettavat tutkinnot tai opinnot:" +: resultList
    Some(resultWithTitle.mkString("\n"))
  } else {
    None
  }
}

def haeKelpoisuudet(paatosTiedot: PaatosTieto): Option[String] = {
  val resultList: Seq[String] = paatosTiedot.kelpoisuudet
    .map((kelpoisuus: Kelpoisuus) => {
      val nimi: Option[String] = kelpoisuus.kelpoisuus
        .map(_.split("_"))
        .map(_.last)

      val kielteisenPaatoksenPerustelut: Option[String] =
        haeKielteisenPaatoksenPerustelut(kelpoisuus.kielteisenPaatoksenPerustelut)

      val myonteisenPaatoksenLisavaatimukset: Option[String] =
        haeKelpoisuudenLisavaatimukset(kelpoisuus.myonteisenPaatoksenLisavaatimukset)

      val result = Seq(
        nimi,
        kielteisenPaatoksenPerustelut,
        myonteisenPaatoksenLisavaatimukset
      ).flatten.mkString("\n")

      if (result != "") {
        Some(result)
      } else {
        None
      }
    })
    .flatten

  if (resultList.size > 0) {
    val resultWithTitle = "Kelpoisuudet:" +: resultList
    Some(resultWithTitle.mkString("\n"))
  } else {
    None
  }
}

/* ------- */

def haeTutkinnonTaiOpinnonLisavaatimukset(
  lisavaatimuksetMaybe: Option[MyonteisenPaatoksenLisavaatimukset]
): Option[String] = {
  lisavaatimuksetMaybe match {
    case None                  => None
    case Some(lisavaatimukset) => {
      val result = Seq(
        if (lisavaatimukset.taydentavatOpinnot) Some("- Täydentävät opinnot") else None,
        if (lisavaatimukset.kelpoisuuskoe) Some("- Kelpoisuuskoe") else None,
        if (lisavaatimukset.sopeutumisaika) Some("- Sopeutumisaika") else None
      ).flatten

      if (result.size > 0) {
        val resultWithTitle = "Lisävaatimukset:" +: result
        Some(resultWithTitle.mkString("\n"))
      } else {
        None
      }
    }
  }
}

def haeKelpoisuudenLisavaatimukset(lisavaatimuksetMaybe: Option[KelpoisuudenLisavaatimukset]): Option[String] = {
  lisavaatimuksetMaybe match {
    case None                  => None
    case Some(lisavaatimukset) => {
      val olennaisiaEroja = lisavaatimukset.olennaisiaEroja.map(_ => "- Olennaisia eroja")

      val erotKoulutuksessa = lisavaatimukset.erotKoulutuksessa
        .map((erotKoulutuksessa: ErotKoulutuksessa) => {
          val nimetytErot = erotKoulutuksessa.erot
            .map((valinta: NamedBoolean) => Some(s"- ${valinta.name}: ${toKyllaEi(valinta.value)}"))

          val muuEro = erotKoulutuksessa.muuEro
            .filter(_ == true)
            .map(_ => s"- Muu ero: ${erotKoulutuksessa.muuEroKuvaus.getOrElse("")}")

          val kaikkiErot = (nimetytErot :+ muuEro).flatten

          if (kaikkiErot.size > 0) {
            Some(
              ("Erot koulutuksessa:" +: kaikkiErot).mkString("\n")
            )
          } else {
            None
          }
        })

      val korvaavaToimenpide = lisavaatimukset.korvaavaToimenpide
        .map(haeKorvaavaToimenpide)

      val ammattikokemusJaElinikainenOppiminen = lisavaatimukset.ammattikokemusJaElinikainenOppiminen
        .flatMap((kokemusJaOppiminen: AmmattikomemusJaElinikainenOppiminen) => {
          val ammattikokemusTaiElinikainenOppiminenValittu = Seq(
            kokemusJaOppiminen.ammattikokemus,
            kokemusJaOppiminen.elinikainenOppiminen
          ).flatten
            .contains(true)

          if (ammattikokemusTaiElinikainenOppiminenValittu) {
            val ammattikokemus = kokemusJaOppiminen.ammattikokemus
              .map(_ => "- Ammattikokemus")

            val elinikainenOppiminen = kokemusJaOppiminen.elinikainenOppiminen
              .map(_ => "- Elinikäinen oppiminen")

            val lisatieto = kokemusJaOppiminen.lisatieto
              .map(value => s"- Lisätieto:\n  $value")

            val korvaavuus = kokemusJaOppiminen.korvaavuus
              .map {
                case AmmattikokemusElinikainenOppiminenKorvaavuus.Taysi =>
                  "Täysin"
                case AmmattikokemusElinikainenOppiminenKorvaavuus.Osittainen =>
                  "Osittain"
                case AmmattikokemusElinikainenOppiminenKorvaavuus.Ei =>
                  "Ei, käytetään lähtökohtaista korvaavaa toimenpidettä"
              }
              .map(valinta => s"- Korvaako ammattikokemus tai elinikäinen oppiminen olennaisen eron?: $valinta")

            val korvaavaToimenpide = kokemusJaOppiminen.korvaavaToimenpide
              .map(haeKorvaavaToimenpide)

            Some(
              Seq(
                ammattikokemus,
                elinikainenOppiminen,
                lisatieto,
                korvaavuus,
                korvaavaToimenpide
              ).flatten.mkString("\n")
            )
          } else {
            None
          }
        })

      val result = Seq(
        olennaisiaEroja,
        erotKoulutuksessa,
        korvaavaToimenpide,
        ammattikokemusJaElinikainenOppiminen
      ).flatten

      if (result.size > 0) {
        val resultWithTitle = Some("Lisävaatimukset:") +: result
        Some(resultWithTitle.mkString("\n"))
      } else {
        None
      }
    }
  }
}

def haeKorvaavaToimenpide(korvaavaToimenpide: KorvaavaToimenpide): Option[String] = {
  val kelpoisuuskoe  = haeKelpoisuuskoe(korvaavaToimenpide.kelpoisuuskoe, korvaavaToimenpide.kelpoisuuskoeSisalto)
  val sopeutumisaika = haeSopeutumisaika(korvaavaToimenpide.sopeutumisaika, korvaavaToimenpide.sopeutumiusaikaKestoKk)
  val yhdistettyKelpoisuuskoe = haeKelpoisuuskoe(
    korvaavaToimenpide.kelpoisuuskoeJaSopeutumisaika,
    korvaavaToimenpide.kelpoisuuskoeJaSopeutumisaikaSisalto
  )
  val yhdistettySopeutumisaika = haeSopeutumisaika(
    korvaavaToimenpide.kelpoisuuskoeJaSopeutumisaika,
    korvaavaToimenpide.kelpoisuuskoeJaSopeutumisaikaKestoKk
  )

  val resultList = Seq(
    kelpoisuuskoe,
    sopeutumisaika,
    yhdistettyKelpoisuuskoe,
    yhdistettySopeutumisaika
  ).flatten

  if (resultList.size > 0) {
    Some(
      ("Korvaava toimenpide:" +: resultList).mkString("\n")
    )
  } else {
    None
  }
}

def haeKelpoisuuskoe(valittu: Boolean, sisaltoMaybe: Option[KelpoisuuskoeSisalto]): Option[String] = {
  if (valittu) {
    sisaltoMaybe.flatMap((sisalto: KelpoisuuskoeSisalto) => {
      val result = Seq(
        if (sisalto.aihealue1) Some("  - Aihealue 1") else None,
        if (sisalto.aihealue2) Some("  - Aihealue 2") else None,
        if (sisalto.aihealue3) Some("  - Aihealue 3") else None
      ).flatten

      if (result.size > 0) {
        Some(
          ("- Kelpoisuuskoe:" +: result).mkString("\n")
        )
      } else {
        None
      }
    })
  } else {
    None
  }
}

def haeSopeutumisaika(valittu: Boolean, kestoMaybe: Option[String]): Option[String] = {
  if (valittu) {
    kestoMaybe.map(kesto => s"- Sopeutumisajan kesto: ${kesto}")
  } else {
    None
  }
}

/* ------- */
/* ------- */

def haePaatostiedot(paatosMaybe: Option[Paatos], tutkinnot: Seq[Tutkinto]): Option[String] = {
  paatosMaybe match {
    case None         => None
    case Some(paatos) => {
      val seutArviointiTehty: Option[String] = haeSeutArviointiTehty(paatos)
      val ratkaisutyyppi: Option[String]     = haeRatkaisutyyppi(paatos)

      val osapaatoskohtaisetTiedot = paatos.paatosTiedot.zipWithIndex
        .map((paatosTiedot: PaatosTieto, index: Int) => {
          val paatosTyyppi                  = haePaatosTyyppi(paatosTiedot)
          val sovellettuLaki                = haeSovellettuLaki(paatosTiedot)
          val tutkinnonNimi                 = haeTutkinnonNimi(paatosTiedot, tutkinnot)
          val myonteinenPaatos              = haeMyonteinenTaiKielteinen(paatosTiedot)
          val tutkinnonTaso                 = haeTutkinnonTaso(paatosTiedot)
          val kielteisenPaatoksenPerustelut =
            haeKielteisenPaatoksenPerustelut(paatosTiedot.kielteisenPaatoksenPerustelut)
          val rinnastettavatTutkinnotTaiOpinnot = haeRinnastettavatTutkinnotTaiOpinnot(paatosTiedot)
          val kelpoisuudet                      = haeKelpoisuudet(paatosTiedot)

          val result = Seq(
            Some(s"Päätös: $index"),
            paatosTyyppi,
            sovellettuLaki,
            tutkinnonNimi,
            myonteinenPaatos,
            tutkinnonTaso,
            kielteisenPaatoksenPerustelut,
            rinnastettavatTutkinnotTaiOpinnot,
            kelpoisuudet
          ).flatten.mkString("\n")

          if (result != "") {
            Some(result)
          } else {
            None
          }
        })

      val peruutusTaiRaukeaminen = haePeruutusTaiRaukeaminen(paatos)

      val result = Seq(
        seutArviointiTehty,
        ratkaisutyyppi,
        osapaatoskohtaisetTiedot,
        peruutusTaiRaukeaminen
      ).flatten.mkString("\n")

      if (result != "") {
        Some(result)
      } else {
        None
      }
    }
  }
}

def generate(
  koodistoService: KoodistoService,
  maakoodiService: MaakoodiService,
  hakemusMaybe: Option[Hakemus],
  tutkinnot: Seq[Tutkinto],
  ataruHakemusMaybe: Option[AtaruHakemus],
  perusteluMaybe: Option[Perustelu],
  paatosMaybe: Option[Paatos],
  koulutuksenSisaltoMuistioMaybe: Option[Muistio],
  muuTutkintoMuistioMaybe: Option[Muistio],
  asiakirjaMuistioMaybe: Option[Muistio]
): String = {
  val result: Seq[String] = Seq[Option[String]](
    haeHakijanNimi(hakemusMaybe),
    haeHakijanSyntymaaika(hakemusMaybe),
    haeHakemusKoskee(hakemusMaybe),
    haeSuostumusSahkoiseenAsiointiin(hakemusMaybe),
    haeYleisetPerustelut(perusteluMaybe),
    haeJatkoOpintoKelpoisuus(perusteluMaybe),
    haeAikaisemmatPaatokset(perusteluMaybe),
    haeMuuPerustelu(perusteluMaybe),
    haeUoRoPerustelu(perusteluMaybe, koulutuksenSisaltoMuistioMaybe, muuTutkintoMuistioMaybe),
    haeApPerustelu(perusteluMaybe),
    haeLausuntopyynnot(koodistoService, perusteluMaybe),
    haeMuuTutkinto(tutkinnot),
    haeYhteistutkinto(hakemusMaybe),
    haeTutkintokohtaisetTiedot(maakoodiService, koodistoService, hakemusMaybe, tutkinnot),
    haeAsiakirjat(hakemusMaybe, asiakirjaMuistioMaybe),
    haePaatostiedot(paatosMaybe, tutkinnot)
  ).flatten

  result.mkString("\n\n")
}
