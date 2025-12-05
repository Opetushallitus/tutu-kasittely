package fi.oph.tutu.backend.service.generator.perustelumuistio

import fi.oph.tutu.backend.domain.*
import fi.oph.tutu.backend.service.{findAnswerByAtaruKysymysId, KoodistoService, MaakoodiService}
import fi.oph.tutu.backend.service.generator.{formatDate, toKyllaEi}
import fi.oph.tutu.backend.utils.{haeKysymyksenTiedot, Constants}

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
      .map(formatDate)
      .map(dateStr => s", vastattu ${dateStr}")
      .getOrElse("")

    Some(s"IMI-pyyntö: ${imiPyyntoNumero} ${imiPyyntoVastattu}")
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

def haeSelvityksetSaatu(hakemusMaybe: Option[Hakemus]): Option[String] = {
  hakemusMaybe
    .flatMap(_.asiakirja)
    .map(_.selvityksetSaatu)
    .map(toKyllaEi)
    .map(muotoiltu => s"Kaikki tarvittavat selvitykset saatu: ${muotoiltu}")
}

def haeSuostumusSahkoiseenAsiointiin(hakemusMaybe: Option[Hakemus]): Option[String] = {
  val suostumusValue = hakemusMaybe
    .flatMap(hakemus => haeKysymyksenTiedot(hakemus.sisalto, Constants.ATARU_SAHKOISEN_ASIOINNIN_LUPA))
    .flatMap(_.value.head.label.get(Kieli.fi))

  suostumusValue.map(valinta => s"Suostumus sähköiseen asiointiin: ${valinta}")
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
  koodistoService: KoodistoService,
  hakemusMaybe: Option[Hakemus]
): Option[String] = {
  val lomakkeenKieli                  = hakemusMaybe.map(_.lomakkeenKieli)
  val koulutusalat: Seq[KoodistoItem] = koodistoService.getKoodisto("kansallinenkoulutusluokitus2016koulutusalataso1")

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

          val koulutusala: Option[String] = tutkinto.koulutusalaKoodiUri
            .map(koulutusalaKoodiUri => koulutusalat.find(item => item.koodiUri == koulutusalaKoodiUri))
            .flatMap(itemMaybe =>
              itemMaybe match {
                case None       => None
                case Some(item) => item.nimi.get(Kieli.fi)
              }
            )

          Seq[String](
            s"Tutkinto ${tutkinto.jarjestys}:",
            s"  Tutkintotodistusotsikko: ${tutkinto.todistusOtsikko.getOrElse("-")}",
            s"  Nimi: ${tutkinto.nimi.getOrElse("-")}",
            s"  Pääaine tai erikoisala: ${tutkinto.paaaaineTaiErikoisala.getOrElse("-")}",
            s"  Koulutusala: ${koulutusala.getOrElse("-")}",
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
  perusteluMaybe match {
    case None            => None
    case Some(perustelu) => {
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
          .map {
            case "alempi_korkeakouluaste"           => "Vähintään kolmivuotinen ensimmäisen vaiheen korkeakoulututkinto"
            case "ylempi_korkeakouluaste"           => "Toisen vaiheen korkeakoulututkinto"
            case "alempi_ja_ylempi_korkeakouluaste" =>
              "Yksiportainen tutkinto, johon sisältyvät ensimmäisen ja toisen vaiheen tutkinnot"
            case "tutkijakoulutusaste" => "Tieteellinen jatkotutknto"
            case "ei_korkeakouluaste"  => "Alle korkeakoulutasoinen koulutus"
          }
          .map(muotoiltuAsema => {
            s"Ylimmän tutkinnon asema lähtömaan järjestelmässä: ${muotoiltuAsema}"
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
}

def haeJatkoOpintoKelpoisuus(perusteluMaybe: Option[Perustelu]): Option[String] = {
  perusteluMaybe match {
    case None            => None
    case Some(perustelu) => {
      val result = Seq(
        perustelu.jatkoOpintoKelpoisuus
          .map {
            case "toisen_vaiheen_korkeakouluopintoihin" => "toisen vaiheen korkeakouluopintoihin"
            case "tieteellisiin_jatko-opintoihin"       => "tieteellisiin jatko-opintoihin"
            case "muu"                                  => "muu"
          }
          .map(muotoiltu => s"Jatko-opintokelpoisuus: ${muotoiltu}"),
        (perustelu.jatkoOpintoKelpoisuus, perustelu.jatkoOpintoKelpoisuusLisatieto) match {
          case (Some("muu"), Some(lisatieto)) => Some(s"Jatko-opintokelpoisuuus, lisätieto:\n${lisatieto}")
          case (_, _)                         => None
        }
      ).flatten.mkString("\n")

      result match {
        case "" => None
        case _  => Some(result)
      }
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
      .filter(!_.isEmpty)
      .map(muotoiltu => s"Ratkaisun tai päätöksen muut perustelut:\n${muotoiltu}")
  })
}

def haeUoRoPerustelu(
  perusteluMaybe: Option[Perustelu],
  koulutuksenSisaltoMuistioMaybe: Option[Muistio],
  muuTutkintoMuistioMaybe: Option[Muistio]
): Option[String] = {
  val koulutuksenSisalto = koulutuksenSisaltoMuistioMaybe
    .map(_.sisalto)
    .map(sisalto => s"Koulutuksen sisältö:\n${sisalto}")

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
          case (Some(true), Some(selite)) => Some(s"Muu ero:\n${selite}")
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
          case (Some(true), Some(selite)) => Some(s"Muu ero:\n${selite}")
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
          case (Some(true), Some(selite)) => Some(s"Muu ero:\n${selite}")
          case (_, _)                     => None
        }
      ).flatten.mkString("\n")
    })

  val muuTutkintoTaiOpintosuoritus = muuTutkintoMuistioMaybe
    .map(_.sisalto)
    .map(sisalto => s"Muu tutkinto tai opintosuoritus:\n${sisalto}")

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
    case Some(perustelu) => {
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
          .filter(!_.isEmpty)
          .map(text => s"Todistus, joka todistaa EU-kansalaisuuteen rinnaisteisen aseman:\n${text}\n"),
        apSisalto.ammattiJohonPatevoitynyt
          .filter(!_.isEmpty)
          .map(text => s"Mihin ammattiin hakija on pätevöitynyt toisessa jäsenmaassa:\n${text}\n"),
        apSisalto.ammattitoiminnanPaaAsiallinenSisalto
          .filter(!_.isEmpty)
          .map(text => s"Ammattitoiminnan pääasiallinen sisältö lähtömaassa:\n${text}\n"),
        apSisalto.koulutuksenKestoJaSisalto
          .filter(!_.isEmpty)
          .map(text => s"Koulutuksen kesto ja pääasiallinen sisältö:\n${text}\n"),

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
            Some(s"Selvitetty aikaisempien samanlaisten tapausten yhteydessä. Asiatunnus: ${asiatunnus}")
          case (_, _) => None
        },
        apSisalto.selvityksetIlmeneeAsiakirjoista
          .filter(_.==(true))
          .map(_ => "Ilmenee hakijan esittämistä asiakirjoista"),

        // ------- //
        apSisalto.lisatietoja
          .filter(!_.isEmpty)
          .map(text => s"Lisätietoja:\n${text}\n"),
        apSisalto.IMIHalytysTarkastettu
          .filter(_.==(true))
          .map(muotoiltuValinta => s"IMI-hälytykset tarkistettu"),
        apSisalto.muutAPPerustelut
          .filter(!_.isEmpty)
          .map(text => s"Muut AP-päätöksen perustelut:\n${text}\n"),
        apSisalto.SEUTArviointi
          .filter(!_.isEmpty)
          .map(text => s"SEUT-arviointi:\n${text}\n")
      ).flatten.mkString("\n")

      result match {
        case "" => None
        case _  => Some(result)
      }
    }
  }
}

def haeLausuntopyynnot(
  koodistoService: KoodistoService,
  perusteluMaybe: Option[Perustelu]
): Option[String] = {
  perusteluMaybe match {
    case None            => None
    case Some(perustelu) => {
      val korkeakoulut = koodistoService.haeKorkeakoulut()

      val pyynnot = perustelu.lausuntopyynnot.map(pyynto => {
        Seq(
          (pyynto.lausunnonAntajaKoodiUri, pyynto.lausunnonAntajaMuu) match {
            case (Some("muu"), Some(tarkenne)) => Some(s"Lausunnon antaja, muu: $tarkenne")
            case (Some("muu"), None)           => Some(s"Lausunnon antaja, muu")
            case (Some(korkeakouluKoodi), _)   => {
              val korkeakoulu = korkeakoulut
                .find(item => item.koodiUri == korkeakouluKoodi)
                .flatMap(_.nimi.get(Kieli.fi))

              korkeakoulu match {
                case None                   => Some(s"Lausunnon antaja: $korkeakouluKoodi")
                case Some(korkeakoulunNimi) => Some(s"Lausunnon antaja: $korkeakoulunNimi")
              }
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
    .map(sisalto => s"Esittelijän huomioita asiakirjoista:\n${sisalto}")

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

def haePaatostiedot(paatosMaybe: Option[Paatos]): Option[String] = {
  paatosMaybe match {
    case None         => None
    case Some(paatos) => {
      val seutArviointiTehty: Option[String] = haeSeutArviointiTehty(paatos)
      val ratkaisutyyppi: Option[String]     = haeRatkaisutyyppi(paatos)

      val osapaatoskohtaisetTiedot = paatos.paatosTiedot.zipWithIndex
        .map((paatosTiedot: PaatosTieto, index: Int) => {
          val paatosTyyppi   = haePaatosTyyppi(paatosTiedot)
          val sovellettuLaki = haeSovellettuLaki(paatosTiedot)
          val tutkinnonNimi  = None // TODO

          val result = Seq(
            Some(s"Päätös: $index"),
            paatosTyyppi,
            sovellettuLaki,
            tutkinnonNimi
          ).flatten.mkString("\n")

          if (result != "") {
            Some(result)
          } else {
            None
          }
        })

      val result = Seq(
        seutArviointiTehty,
        ratkaisutyyppi,
        osapaatoskohtaisetTiedot
      ).flatten.mkString("\n")

      if (result != "") {
        Some(result)
      } else {
        None
      }
    }
  }

  /*
    Päätös:
    - SEUT-arviointi tehty
    - Ratkaisutyyppi-alasvetovalikko
    - Päätöstyyppi-alasvetovalikko
    - Sovellettu laki -alasvetovalikko

    - Tutkinnon nimi -alasvetovalikko

    - Päätöstyyppi Taso, myönteinen (Alempi korkeakoulututkinto / Ylempi korkeakoulututkinto)
    - Päätöstyyppi Taso, kielteinen (+ perustelut)
    - Ratkaisutyyppi 2 Peruutus tai raukeaminen
    - Kelpoisuus-alasvetovalikko
    - Rinnastettava tutkinto tai opinnot -alasvetovalikko
    - Tietty tutkinto tai opinnot, lisävaatimukset
    - Rinnastettavat opinnot -alasvetovalikko
    - Valinta myönteinen / kielteinen
   */
}

def generate(
  koodistoService: KoodistoService,
  maakoodiService: MaakoodiService,
  hakemusMaybe: Option[Hakemus],
  ataruHakemusMaybe: Option[AtaruHakemus],
  perusteluMaybe: Option[Perustelu],
  paatosMaybe: Option[Paatos],
  koulutuksenSisaltoMuistioMaybe: Option[Muistio],
  muuTutkintoMuistioMaybe: Option[Muistio],
  asiakirjaMuistioMaybe: Option[Muistio]
): String = {
  var result: Seq[String] = Seq[Option[String]](
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
    haeMuuTutkinto(hakemusMaybe),
    haeYhteistutkinto(hakemusMaybe),
    haeTutkintokohtaisetTiedot(maakoodiService, koodistoService, hakemusMaybe),
    haeAsiakirjat(hakemusMaybe, asiakirjaMuistioMaybe),
    haePaatostiedot(paatosMaybe)
  ).flatten

  result.mkString("\n\n")
}
