package fi.oph.tutu.backend.service.generator.perustelumuistio

import java.time.LocalDateTime
import java.time.temporal.ChronoUnit.DAYS

import fi.oph.tutu.backend.domain.*
import fi.oph.tutu.backend.service.{KoodistoService, MaakoodiService, OnrService, TranslationService}
import fi.oph.tutu.backend.service.generator.{formatDate, toKyllaEi}
import fi.oph.tutu.backend.utils.{Constants, Utility, haeKysymyksenTiedot}

def haeImiPyyntoTieto(translationService: TranslationService, hakemusMaybe: Option[Hakemus]): Option[String] = {
  val imiPyynto: Option[ImiPyynto] = hakemusMaybe.flatMap(_.asiakirja).map(_.imiPyynto)
  val showImiData                  = imiPyynto.flatMap(_.imiPyynto).contains(true)

  if (showImiData) {
    val imiPyyntoLabel = translationService.getTranslation("fi", "perustelumuistio.imipyynto.label")
    val vastattuLabel  = translationService.getTranslation("fi", "perustelumuistio.imipyynto.vastattu.label")

    val imiPyyntoNumero   = imiPyynto.flatMap(_.getNumeroIfPyyntoTrue).getOrElse(" - ")
    val imiPyyntoVastattu = imiPyynto
      .flatMap(_.getVastattuIfPyyntoTrue)
      .map(formatDate)
      .map(dateStr => s" $vastattuLabel $dateStr")
      .getOrElse("")

    Some(s"$imiPyyntoLabel $imiPyyntoNumero $imiPyyntoVastattu".trim)
  } else {
    None
  }
}

def haeValmistuminenVahvistettu(
  translationService: TranslationService,
  hakemusMaybe: Option[Hakemus]
): Option[String] = {
  val valmistumisenVahvistusMaybe: Option[ValmistumisenVahvistus] = hakemusMaybe
    .flatMap(_.asiakirja)
    .map(_.valmistumisenVahvistus)

  val muotoiltuVastausMaybe =
    valmistumisenVahvistusMaybe
      .flatMap(_.getVastausIfVahvistusTrue)
      .map {
        case ValmistumisenVahvistusVastaus.Myonteinen =>
          translationService.getTranslation("fi", "perustelumuistio.valmistuminenVahvistettu.vastaus.myonteinen")
        case ValmistumisenVahvistusVastaus.Kielteinen =>
          translationService.getTranslation("fi", "perustelumuistio.valmistuminenVahvistettu.vastaus.kielteinen")
        case ValmistumisenVahvistusVastaus.EiVastausta =>
          translationService.getTranslation("fi", "perustelumuistio.valmistuminenVahvistettu.vastaus.vastaustaEiSaatu")
      }
  muotoiltuVastausMaybe
}

def haeSelvityksetSaatu(translationService: TranslationService, hakemusMaybe: Option[Hakemus]): Option[String] = {
  hakemusMaybe
    .flatMap(_.asiakirja)
    .map(_.selvityksetSaatu)
    .map {
      case true =>
        translationService.getTranslation("fi", "perustelumuistio.selvityksetSaatu.vastaus.kylla")
      case false =>
        translationService.getTranslation("fi", "perustelumuistio.selvityksetSaatu.vastaus.ei")
    }
}

def haeSuostumusSahkoiseenAsiointiin(
  translationService: TranslationService,
  hakemusMaybe: Option[Hakemus]
): Option[String] = {
  val suostumusValue = hakemusMaybe
    .flatMap(hakemus => haeKysymyksenTiedot(hakemus.sisalto, Constants.ATARU_SAHKOISEN_ASIOINNIN_LUPA))
    .flatMap(_.value.head.label.get(Kieli.fi))

  suostumusValue.map(valinta => {
    val label = translationService.getTranslation("fi", "perustelumuistio.suostumusSahkoiseenAsiointiin.label")
    s"$label $valinta".trim
  })
}

def haeHakijanNimi(translationService: TranslationService, hakemusMaybe: Option[Hakemus]): Option[String] = {
  hakemusMaybe.map(hakemus => {
    val label = translationService.getTranslation("fi", "perustelumuistio.hakijanNimi.label")
    s"$label ${hakemus.hakija.etunimet} ${hakemus.hakija.sukunimi}".trim
  })
}

def haeHakijanSyntymaaika(translationService: TranslationService, hakemusMaybe: Option[Hakemus]): Option[String] = {
  hakemusMaybe.map(hakemus => {
    val label = translationService.getTranslation("fi", "perustelumuistio.hakijanSyntymaaika.label")
    s"$label ${hakemus.hakija.syntymaaika}".trim
  })
}

def haeHakemusKoskeeRivit(
  translationService: TranslationService,
  kieli: Kieli,
  item: Option[SisaltoItem],
  level: Int = 0
): Seq[(Int, String, String)] = {
  if (item.isEmpty) {
    Seq.empty
  } else {
    val children: Seq[SisaltoItem]  = item.map(_.children).getOrElse(Seq.empty)
    val followups: Seq[SisaltoItem] = item.map(_.value.flatMap(_.followups)).getOrElse(Seq.empty)

    val allChildren: Seq[SisaltoItem] = children ++ followups

    val alirivit: Seq[(Int, String, String)] = allChildren.flatMap(child => {
      haeHakemusKoskeeRivit(translationService, kieli, Option(child), level + 1)
    })

    val valueMaybe = item.flatMap(_.value.head.label.get(kieli))
    val fieldType  = item.map(_.fieldType).getOrElse("-")

    valueMaybe match {
      case Some(value) =>
        val rivi = s"$value"
        (level, rivi, fieldType) +: alirivit
      case _ => alirivit
    }
  }
}

def haeHakemusKoskee(translationService: TranslationService, hakemusMaybe: Option[Hakemus]): Option[String] = {
  if (hakemusMaybe.isEmpty) {
    None
  } else {
    val label   = translationService.getTranslation("fi", "perustelumuistio.hakemusKoskee.label")
    val hakemus = hakemusMaybe.get

    val hakemuksenKieli: Kieli = hakemus.lomakkeenKieli match {
      case "sv" => Kieli.sv
      case "en" => Kieli.en
      case _    => Kieli.fi
    }

    val hakemusKoskeeRoot: Option[SisaltoItem] = haeKysymyksenTiedot(hakemus.sisalto, Constants.ATARU_HAKEMUS_KOSKEE)
    val hakemusKoskeeRivit: Seq[(Int, String, String)] =
      haeHakemusKoskeeRivit(translationService, hakemuksenKieli, hakemusKoskeeRoot)
        .filter((t: (Int, String, String)) => t._3 != "attachment")

    val hakemusKoskeeContent = hakemusKoskeeRivit
      .map((t: (Int, String, String)) => {
        val level  = t._1
        val rivi   = t._2
        val indent = " " * level * 2
        s"$indent$rivi"
      })
      .mkString("\n")

    Some(s"$label\n$hakemusKoskeeContent".trim)
  }
}

def haeMuuTutkinto(translationService: TranslationService, tutkinnot: Seq[Tutkinto]): Option[String] = {
  val label                              = translationService.getTranslation("fi", "perustelumuistio.muuTutkinto.label")
  val muuTutkintoMaybe: Option[Tutkinto] = tutkinnot.find((tutkinto: Tutkinto) => tutkinto.jarjestys == "MUU")
  val muuTutkintoTietoMaybe: Option[String] = muuTutkintoMaybe.flatMap(_.muuTutkintoTieto)

  muuTutkintoTietoMaybe.map((muuTutkintoTieto: String) => s"$label\n$muuTutkintoTieto")
}

def haeYhteistutkinto(translationService: TranslationService, hakemusMaybe: Option[Hakemus]): Option[String] = {
  val value = translationService.getTranslation("fi", "perustelumuistio.yhteistutkinto.value")
  hakemusMaybe.flatMap(hakemus =>
    if (hakemus.yhteistutkinto) { Some(value) }
    else { None }
  )
}

def haeTutkintokohtaisetTiedot(
  translationService: TranslationService,
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

      val koulutusala: Option[String] = tutkinto.koulutusalaKoodiUri
        .map(koulutusalaKoodiUri => koulutusalat.find(item => item.koodiUri == koulutusalaKoodiUri))
        .flatMap {
          case None       => None
          case Some(item) => item.nimi.get(Kieli.fi)
        }

      Seq[String](
        tutkinto.todistusOtsikko.getOrElse("-"),
        tutkinto.nimi.getOrElse("-"),
        tutkinto.paaaaineTaiErikoisala.getOrElse("-"),
        tutkinto.oppilaitos.getOrElse("-"),
        kielistettyMaakoodi.getOrElse("-"),
        tutkinto.todistuksenPaivamaara.getOrElse("-")
      ).mkString("\n")
    })
    .mkString("\n\n") match {
    case ""    => None
    case value => Some(value)
  }
}

def haePerustelunTutkintokohtaisetTiedot(
  translationService: TranslationService,
  tutkinnot: Seq[Tutkinto]
): Option[String] = {
  tutkinnot
    .filter((tutkinto: Tutkinto) => tutkinto.jarjestys != "MUU")
    .sortWith((a: Tutkinto, b: Tutkinto) => a.jarjestys.toInt < b.jarjestys.toInt)
    .map((tutkinto: Tutkinto) => {
      val suoritusvuodetLabel     = translationService.getTranslation("fi", "perustelumuistio.suoritusvuodet.label")
      val ohjeellinenLaajuusLabel = translationService.getTranslation("fi", "perustelumuistio.ohjeellinenLaajuus.label")
      val tutkintoonSisaltyiOpinnaytetyoLabel =
        translationService.getTranslation("fi", "perustelumuistio.tutkintoonSisaltyiOpinnayte.label")
      val tutkintoonSisaltyiHarjoitteluLabel =
        translationService.getTranslation("fi", "perustelumuistio.tutkintoonSisaltyiHarjoittelu.label")
      val lisatietoaOpinnaytteisiinJaHArjoitteluunLabel =
        translationService.getTranslation("fi", "perustelumuistio.lisatietoaOpinnaytteeseenJaHarjoitteluun.label")

      val suoritusvuodet = Seq(tutkinto.aloitusVuosi, tutkinto.paattymisVuosi).flatten
        .mkString(" - ")

      Seq[String](
        s"${tutkinto.nimi.getOrElse("-")}",
        s"${tutkinto.paaaaineTaiErikoisala.getOrElse("-")}",
        s"$suoritusvuodetLabel $suoritusvuodet".trim,
        s"$ohjeellinenLaajuusLabel ${tutkinto.ohjeellinenLaajuus.getOrElse("-")}".trim,
        s"$tutkintoonSisaltyiOpinnaytetyoLabel ${tutkinto.opinnaytetyo.map(toKyllaEi).getOrElse("-")}".trim,
        s"$tutkintoonSisaltyiHarjoitteluLabel ${tutkinto.harjoittelu.map(toKyllaEi).getOrElse("-")}".trim,
        s"$lisatietoaOpinnaytteisiinJaHArjoitteluunLabel ${tutkinto.perustelunLisatietoja.getOrElse("-")}".trim
      ).mkString("\n")
    })
    .mkString("\n\n") match {
    case ""    => None
    case value => Some(value)
  }
}

def haeYleisetPerustelut(translationService: TranslationService, perusteluMaybe: Option[Perustelu]): Option[String] = {
  perusteluMaybe match {
    case None            => None
    case Some(perustelu) =>
      val resultString = Seq(
        perustelu.virallinenTutkinnonMyontaja
          .map {
            case true =>
              translationService.getTranslation("fi", "perustelumuistio.virallinenTutkinnonMyontaja.kylla")
            case false =>
              translationService.getTranslation("fi", "perustelumuistio.virallinenTutkinnonMyontaja.ei")
          },
        perustelu.virallinenTutkinto
          .map {
            case true =>
              translationService.getTranslation("fi", "perustelumuistio.virallinenTutkinto.kylla")
            case false =>
              translationService.getTranslation("fi", "perustelumuistio.virallinenTutkinto.ei")
          },
        if (perustelu.lahdeLahtomaanKansallinenLahde) {
          Some(
            translationService.getTranslation("fi", "perustelumuistio.lahdeLahtomaanKansallinenLahde.value")
          )
        } else None,
        if (perustelu.lahdeLahtomaanVirallinenVastaus) {
          Some(
            translationService.getTranslation("fi", "perustelumuistio.lahdeLahtomaanVirallinenVastaus.value")
          )
        } else None,
        if (perustelu.lahdeKansainvalinenHakuteosTaiVerkkosivusto) {
          Some(
            translationService.getTranslation(
              "fi",
              "perustelumuistio.lahdeKansainvalinenHakuteosTaiVerkkosivusto.value"
            )
          )
        } else None,
        if (perustelu.selvitysTutkinnonMyontajastaJaTutkinnonVirallisuudesta != "") {
          val label = translationService.getTranslation(
            "fi",
            "perustelumuistio.selvitysTutkinnonMyontajastaJaTutkinnonVirallisuudesta.label"
          )
          Some(
            s"$label\n${perustelu.selvitysTutkinnonMyontajastaJaTutkinnonVirallisuudesta}"
          )
        } else None,
        perustelu.ylimmanTutkinnonAsemaLahtomaanJarjestelmassa
          .map {
            case "alempi_korkeakouluaste" =>
              translationService.getTranslation(
                "fi",
                "perustelumuistio.ylimmanTutkinnonAsemaLahtomaanJarjestelmassa.alempi_korkeakouluaste"
              )
            case "ylempi_korkeakouluaste" =>
              translationService.getTranslation(
                "fi",
                "perustelumuistio.ylimmanTutkinnonAsemaLahtomaanJarjestelmassa.ylempi_korkeakouluaste"
              )
            case "alempi_ja_ylempi_korkeakouluaste" =>
              translationService.getTranslation(
                "fi",
                "perustelumuistio.ylimmanTutkinnonAsemaLahtomaanJarjestelmassa.alempi_ja_ylempi_korkeakouluaste"
              )
            case "tutkijakoulutusaste" =>
              translationService.getTranslation(
                "fi",
                "perustelumuistio.ylimmanTutkinnonAsemaLahtomaanJarjestelmassa.tutkijakoulutusaste"
              )
            case "ei_korkeakouluaste" =>
              translationService.getTranslation(
                "fi",
                "perustelumuistio.ylimmanTutkinnonAsemaLahtomaanJarjestelmassa.ei_korkeakouluaste"
              )
          },
        if (perustelu.selvitysTutkinnonAsemastaLahtomaanJarjestelmassa != "") {
          val label = translationService.getTranslation(
            "fi",
            "perustelumuistio.selvitysTutkinnonAsemastaLahtomaanJarjestelmassa.label"
          )
          Some(
            s"$label\n${perustelu.selvitysTutkinnonAsemastaLahtomaanJarjestelmassa}"
          )
        } else None
      ).flatten.mkString("\n")

      resultString match {
        case "" => None
        case _  => Some(resultString)
      }
  }
}

def haeJatkoOpintoKelpoisuus(
  translationService: TranslationService,
  perusteluMaybe: Option[Perustelu]
): Option[String] = {
  perusteluMaybe match {
    case None            => None
    case Some(perustelu) =>
      val result = Seq(
        perustelu.jatkoOpintoKelpoisuus
          .map {
            case "toisen_vaiheen_korkeakouluopintoihin" =>
              translationService.getTranslation(
                "fi",
                "perustelumuistio.jatkoOpintoKelpoisuus.toisen_vaiheen_korkeakouluopintoihin"
              )
            case "tieteellisiin_jatko-opintoihin" =>
              translationService.getTranslation(
                "fi",
                "perustelumuistio.jatkoOpintoKelpoisuus.tieteellisiin_jatko-opintoihin"
              )
            case "muu" =>
              translationService.getTranslation("fi", "perustelumuistio.jatkoOpintoKelpoisuus.muu")
          },
        (perustelu.jatkoOpintoKelpoisuus, perustelu.jatkoOpintoKelpoisuusLisatieto) match {
          case (Some("muu"), Some(lisatieto)) => {
            val label =
              translationService.getTranslation("fi", "perustelumuistio.jatkoOpintoKelpoisuus.lisatieto.label")
            Some(s"$label\n$lisatieto")
          }
          case (_, _) => None
        }
      ).flatten.mkString("\n")

      result match {
        case "" => None
        case _  => Some(result)
      }
  }
}

def haeAikaisemmatPaatokset(
  translationService: TranslationService,
  perusteluMaybe: Option[Perustelu]
): Option[String] = {
  perusteluMaybe.flatMap(perustelu => {
    perustelu.aikaisemmatPaatokset
      .map {
        case true  => translationService.getTranslation("fi", "perustelumuistio.aikaisemmatPaatokset.kylla")
        case false => translationService.getTranslation("fi", "perustelumuistio.aikaisemmatPaatokset.ei")
      }
  })
}

def haeMuuPerustelu(translationService: TranslationService, perusteluMaybe: Option[Perustelu]): Option[String] = {
  perusteluMaybe.flatMap(perustelu => {
    perustelu.muuPerustelu
      .filter(_.nonEmpty)
      .map(muotoiltu => {
        val label = translationService.getTranslation("fi", "perustelumuistio.muuPerustelu.label")
        s"$label\n$muotoiltu"
      })
  })
}

def haeUoRoPerustelu(
  translationService: TranslationService,
  perusteluMaybe: Option[Perustelu]
): Option[String] = {
  val koulutuksenSisalto = perusteluMaybe
    .flatMap(_.uoRoSisalto.koulutuksenSisalto)
    .map(sisalto => {
      val label = translationService.getTranslation("fi", "perustelumuistio.koulutuksenSisalto.label")
      s"$label\n$sisalto"
    })

  val erotKoulutuksenSisallossa = perusteluMaybe
    .map(_.uoRoSisalto)
    .map(uoRoSisalto => {
      Seq(
        ////////////
        // Opettajat
        uoRoSisalto.opettajatEroMonialaisetOpinnotSisalto
          .filter(_.==(true))
          .map(_ =>
            translationService.getTranslation("fi", "perustelumuistio.uoro.koulutuserot.opettajat.monialaisetSisalto")
          ),
        uoRoSisalto.opettajatEroMonialaisetOpinnotLaajuus
          .filter(_.==(true))
          .map(_ =>
            translationService.getTranslation("fi", "perustelumuistio.uoro.koulutuserot.opettajat.monialaisetLaajuus")
          ),
        uoRoSisalto.opettajatEroPedagogisetOpinnotSisalto
          .filter(_.==(true))
          .map(_ =>
            translationService.getTranslation("fi", "perustelumuistio.uoro.koulutuserot.opettajat.pedagogisetSisalto")
          ),
        uoRoSisalto.opettajatEroPedagogisetOpinnotLaajuus
          .filter(_.==(true))
          .map(_ =>
            translationService.getTranslation("fi", "perustelumuistio.uoro.koulutuserot.opettajat.pedagogisetLaajuus")
          ),
        uoRoSisalto.opettajatEroKasvatustieteellisetOpinnotLaajuus
          .filter(_.==(true))
          .map(_ =>
            translationService
              .getTranslation("fi", "perustelumuistio.uoro.koulutuserot.opettajat.kasvatustieteellisetLaajuus")
          ),
        uoRoSisalto.opettajatEroKasvatustieteellisetOpinnotVaativuus
          .filter(_.==(true))
          .map(_ =>
            translationService
              .getTranslation("fi", "perustelumuistio.uoro.koulutuserot.opettajat.kasvatustieteellisetVaativuus")
          ),
        uoRoSisalto.opettajatEroKasvatustieteellisetOpinnotSisalto
          .filter(_.==(true))
          .map(_ =>
            translationService
              .getTranslation("fi", "perustelumuistio.uoro.koulutuserot.opettajat.kasvatustieteellisetSisalto")
          ),
        uoRoSisalto.opettajatEroOpetettavatAineetOpinnotSisalto
          .filter(_.==(true))
          .map(_ =>
            translationService
              .getTranslation("fi", "perustelumuistio.uoro.koulutuserot.opettajat.opetettavatAineetSisalto")
          ),
        uoRoSisalto.opettajatEroOpetettavatAineetOpinnotVaativuus
          .filter(_.==(true))
          .map(_ =>
            translationService
              .getTranslation("fi", "perustelumuistio.uoro.koulutuserot.opettajat.opetettavatAineetVaativuus")
          ),
        uoRoSisalto.opettajatEroOpetettavatAineetOpinnotLaajuus
          .filter(_.==(true))
          .map(_ =>
            translationService
              .getTranslation("fi", "perustelumuistio.uoro.koulutuserot.opettajat.opetettavatAineetLaajuus")
          ),
        uoRoSisalto.opettajatEroErityisopettajanOpinnotSisalto
          .filter(_.==(true))
          .map(_ =>
            translationService
              .getTranslation("fi", "perustelumuistio.uoro.koulutuserot.opettajat.erityisopettajaSisalto")
          ),
        uoRoSisalto.opettajatEroErityisopettajanOpinnotLaajuus
          .filter(_.==(true))
          .map(_ =>
            translationService
              .getTranslation("fi", "perustelumuistio.uoro.koulutuserot.opettajat.erityisopettajaLaajuus")
          ),
        (uoRoSisalto.opettajatMuuEro, uoRoSisalto.opettajatMuuEroSelite) match {
          case (Some(true), Some("")) =>
            Some(translationService.getTranslation("fi", "perustelumuistio.uoro.koulutuserot.muu"))
          case (Some(true), None) =>
            Some(translationService.getTranslation("fi", "perustelumuistio.uoro.koulutuserot.muu"))
          case (Some(true), Some(selite)) => {
            val label = translationService.getTranslation("fi", "perustelumuistio.uoro.koulutuserot.muuLabel")
            Some(s"$label\n$selite")
          }
          case (_, _) => None
        },

        ///////////////////////////////
        // Varhaiskasvatuksen opettajat
        uoRoSisalto.vkOpettajatEroKasvatustieteellisetOpinnotLaajuus
          .filter(_.==(true))
          .map(_ =>
            translationService
              .getTranslation("fi", "perustelumuistio.uoro.koulutuserot.vkopettajat.kasvatustieteellisetLaajuus")
          ),
        uoRoSisalto.vkOpettajatEroKasvatustieteellisetOpinnotSisalto
          .filter(_.==(true))
          .map(_ =>
            translationService
              .getTranslation("fi", "perustelumuistio.uoro.koulutuserot.vkopettajat.kasvatustieteellisetSisalto")
          ),
        uoRoSisalto.vkOpettajatEroVarhaiskasvatusEsiopetusOpinnotLaajuus
          .filter(_.==(true))
          .map(_ =>
            translationService.getTranslation("fi", "perustelumuistio.uoro.koulutuserot.vkopettajat.opintojenLaajuus")
          ),
        uoRoSisalto.vkOpettajatEroVarhaiskasvatusEsiopetusOpinnotSisalto
          .filter(_.==(true))
          .map(_ =>
            translationService.getTranslation("fi", "perustelumuistio.uoro.koulutuserot.vkopettajat.opintojenSisalto")
          ),
        (uoRoSisalto.vkOpettajatMuuEro, uoRoSisalto.vkOpettajatMuuEroSelite) match {
          case (Some(true), Some("")) =>
            Some(translationService.getTranslation("fi", "perustelumuistio.uoro.koulutuserot.muu"))
          case (Some(true), None) =>
            Some(translationService.getTranslation("fi", "perustelumuistio.uoro.koulutuserot.muu"))
          case (Some(true), Some(selite)) => {
            val label = translationService.getTranslation("fi", "perustelumuistio.uoro.koulutuserot.muuLabel")
            Some(s"$label\n$selite")
          }
          case (_, _) => None
        },

        //////////////////////////
        // Oikeustieteen maisterit
        uoRoSisalto.otmEroOpinnotLaajuus
          .filter(_.==(true))
          .map(_ => translationService.getTranslation("fi", "perustelumuistio.uoro.koulutuserot.otm.opintojenLaajuus")),
        uoRoSisalto.otmEroOpinnotVaativuus
          .filter(_.==(true))
          .map(_ =>
            translationService.getTranslation("fi", "perustelumuistio.uoro.koulutuserot.otm.opintojenVaativuus")
          ),
        uoRoSisalto.otmEroOpinnotSisalto
          .filter(_.==(true))
          .map(_ => translationService.getTranslation("fi", "perustelumuistio.uoro.koulutuserot.otm.opintojenSisalto")),
        (uoRoSisalto.otmMuuEro, uoRoSisalto.otmMuuEroSelite) match {
          case (Some(true), Some("")) =>
            Some(translationService.getTranslation("fi", "perustelumuistio.uoro.koulutuserot.muu"))
          case (Some(true), None) =>
            Some(translationService.getTranslation("fi", "perustelumuistio.uoro.koulutuserot.muu"))
          case (Some(true), Some(selite)) => {
            val label = translationService.getTranslation("fi", "perustelumuistio.uoro.koulutuserot.muuLabel")
            Some(s"$label\n$selite")
          }
          case (_, _) => None
        }
      ).flatten.mkString("\n")
    })

  val muuTutkintoTaiOpintosuoritus = perusteluMaybe
    .flatMap(_.uoRoSisalto.muuTutkinto)
    .map(sisalto => {
      val label = translationService.getTranslation("fi", "perustelumuistio.uoro.muuTutkintoTaiSuoritus.label")
      s"$label\n$sisalto"
    })

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

def haeApPerustelu(translationService: TranslationService, perusteluMaybe: Option[Perustelu]): Option[String] = {
  perusteluMaybe match {
    case None            => None
    case Some(perustelu) =>
      val apSisalto = perustelu.apSisalto
      val result    = Seq(
        /////////////////////////////////
        // Peruste AP-lain soveltamiselle
        apSisalto.lakiperusteToisessaJasenmaassaSaannelty
          .filter(_.==(true))
          .map(_ =>
            translationService
              .getTranslation("fi", "perustelumuistio.ap.lakiperuste.toisessaJasenmaassaSaanneltyKoulutus")
          ),
        apSisalto.lakiperustePatevyysLahtomaanOikeuksilla
          .filter(_.==(true))
          .map(_ =>
            translationService.getTranslation("fi", "perustelumuistio.ap.lakiperuste.lahtomaassaSaavutetutOikeudet")
          ),
        apSisalto.lakiperusteToinenEUmaaTunnustanut
          .filter(_.==(true))
          .map(_ => translationService.getTranslation("fi", "perustelumuistio.ap.lakiperuste.toinenEUMaaTunnustanut")),
        apSisalto.lakiperusteLahtomaassaSaantelematon
          .filter(_.==(true))
          .map(_ =>
            translationService.getTranslation("fi", "perustelumuistio.ap.lakiperuste.saantelematonAmmattiJaTyokokemus")
          ),

        // ------- //
        apSisalto.todistusEUKansalaisuuteenRinnasteisestaAsemasta
          .filter(_.nonEmpty)
          .map(text =>
            val label =
              translationService.getTranslation("fi", "perustelumuistio.ap.todistusEUKansalaisuusAsemasta.label")
            s"$label\n$text\n"
          ),
        apSisalto.ammattiJohonPatevoitynyt
          .filter(_.nonEmpty)
          .map(text =>
            val label = translationService.getTranslation("fi", "perustelumuistio.ap.ammattiJohonPatevoitynyt.label")
            s"$label\n$text\n"
          ),
        apSisalto.ammattitoiminnanPaaAsiallinenSisalto
          .filter(_.nonEmpty)
          .map(text =>
            val label = translationService.getTranslation("fi", "perustelumuistio.ap.ammattitoiminnanSisalto.label")
            s"$label\n$text\n"
          ),
        apSisalto.koulutuksenKestoJaSisalto
          .filter(_.nonEmpty)
          .map(text =>
            val label = translationService.getTranslation("fi", "perustelumuistio.ap.koulutuksenKestoJaSisalto.label")
            s"$label\n$text\n"
          ),

        //////////////////////////////////////////////////////////////////////////////
        // Ammattipätevyyttä ja ammatin tai koulutuksen sääntelyä koskevat selvitykset
        apSisalto.selvityksetLahtomaanViranomaiselta
          .filter(_.==(true))
          .map(_ => translationService.getTranslation("fi", "perustelumuistio.ap.selvitykset.lahtomaanViranomaiselta")),
        apSisalto.selvityksetLahtomaanLainsaadannosta
          .filter(_.==(true))
          .map(_ =>
            translationService.getTranslation("fi", "perustelumuistio.ap.selvitykset.lahtomaanLainsaadannosta")
          ),
        (apSisalto.selvityksetAikaisempiTapaus, apSisalto.selvityksetAikaisemmanTapauksenAsiaTunnus) match {
          case (Some(true), Some("")) =>
            Some(translationService.getTranslation("fi", "perustelumuistio.ap.selvitykset.aikaisempiTapaus"))
          case (Some(true), None) =>
            Some(translationService.getTranslation("fi", "perustelumuistio.ap.selvitykset.aikaisempiTapaus"))
          case (Some(true), Some(asiatunnus)) => {
            val label = translationService.getTranslation("fi", "perustelumuistio.ap.selvitykset.aikaisempiTapausLabel")
            Some(s"$label $asiatunnus".trim)
          }
          case (_, _) => None
        },
        apSisalto.selvityksetIlmeneeAsiakirjoista
          .filter(_.==(true))
          .map(_ => translationService.getTranslation("fi", "perustelumuistio.ap.selvitykset.asiakirjoista")),

        // ------- //
        apSisalto.lisatietoja
          .filter(_.nonEmpty)
          .map(text =>
            val label = translationService.getTranslation("fi", "perustelumuistio.ap.lisatietoja.label")
            s"$label\n$text"
          ),
        apSisalto.IMIHalytysTarkastettu
          .filter(_.==(true))
          .map(_ => translationService.getTranslation("fi", "perustelumuistio.ap.IMIHalytyksetTarkastettu")),
        apSisalto.muutAPPerustelut
          .filter(_.nonEmpty)
          .map(text =>
            val label = translationService.getTranslation("fi", "perustelumuistio.ap.muutPerustelut.label")
            s"$label\n$text"
          ),
        apSisalto.SEUTArviointi
          .filter(_.nonEmpty)
          .map(text =>
            val label = translationService.getTranslation("fi", "perustelumuistio.ap.SEUTArviointi.label")
            s"$label\n$text"
          )
      ).flatten.mkString("\n")

      result match {
        case "" => None
        case _  => Some(result)
      }
  }
}

def haeLausuntopyynnot(
  translationService: TranslationService,
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
            case (Some("muu"), Some(tarkenne)) => {
              val label =
                translationService.getTranslation("fi", "perustelumuistio.lausuntopyynnot.lausunnonAntaja.muuLabel")
              Some(s"$label $tarkenne".trim)
            }
            case (Some("muu"), None) =>
              Some(
                translationService.getTranslation("fi", "perustelumuistio.lausuntopyynnot.lausunnonAntaja.muu")
              )
            case (Some(korkeakouluKoodi), _) =>
              val korkeakoulu = korkeakoulut
                .find(item => item.koodiUri == korkeakouluKoodi)
                .flatMap(_.nimi.get(Kieli.fi))

              val label =
                translationService.getTranslation("fi", "perustelumuistio.lausuntopyynnot.lausunnonAntaja.label")
              korkeakoulu match {
                case None                   => Some(s"$label $korkeakouluKoodi".trim)
                case Some(korkeakoulunNimi) => Some(s"$label $korkeakoulunNimi".trim)
              }
            case (None, _) => None
          },
          pyynto.lahetetty
            .map(formatDate)
            .map(lahetetty => {
              val label = translationService.getTranslation("fi", "perustelumuistio.lausuntopyynnot.lahetetty.label")
              s"$label $lahetetty".trim
            }),
          pyynto.saapunut
            .map(formatDate)
            .map(saapunut => {
              val label = translationService.getTranslation("fi", "perustelumuistio.lausuntopyynnot.saapunut.label")
              s"$label $saapunut".trim
            })
        ).flatten.mkString("\n")
      })

      val sisalto = perustelu.lausunnonSisalto
        .map(sisalto => {
          val label = translationService.getTranslation("fi", "perustelumuistio.lausuntopyynnot.sisalto.label")
          s"$label\n$sisalto"
        })

      val yhdistetty = if (sisalto.nonEmpty) pyynnot :+ sisalto.get else pyynnot

      val result = yhdistetty.mkString("\n\n")

      if (result != "") {
        Some(result)
      } else {
        None
      }
  }
}

def haeAsiakirjat(
  translationService: TranslationService,
  hakemusMaybe: Option[Hakemus]
): Option[String] = {
  val imipyyntoMaybe: Option[String]                = haeImiPyyntoTieto(translationService, hakemusMaybe)
  val valmistuminenVahvistettuMaybe: Option[String] = haeValmistuminenVahvistettu(translationService, hakemusMaybe)
  val selvityksetSaatuMaybe: Option[String]         = haeSelvityksetSaatu(translationService, hakemusMaybe)

  val esittelijanHuomiotMaybe: Option[String] = hakemusMaybe
    .flatMap(_.asiakirja)
    .flatMap(_.esittelijanHuomioita)
    .map(sisalto =>
      val label = translationService.getTranslation("fi", "perustelumuistio.asiakirjat.esittelijanHuomiot.label")
      s"$label\n$sisalto".trim
    )

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

def haeSeutArviointiTehty(translationService: TranslationService, paatos: Paatos): Option[String] = {
  if (paatos.seutArviointi) {
    Some(
      translationService.getTranslation("fi", "perustelumuistio.SEUTArviointi")
    )
  } else {
    None
  }
}

def haeRatkaisutyyppi(translationService: TranslationService, paatos: Paatos): Option[String] = {
  paatos.ratkaisutyyppi
    .map {
      case Ratkaisutyyppi.Paatos =>
        translationService.getTranslation("fi", "perustelumuistio.ratkaisutyyppi.paatos")
      case Ratkaisutyyppi.PeruutusTaiRaukeaminen =>
        translationService.getTranslation("fi", "perustelumuistio.ratkaisutyyppi.peruutusTaiRaukeaminen")
      case Ratkaisutyyppi.Oikaisu =>
        translationService.getTranslation("fi", "perustelumuistio.ratkaisutyyppi.oikaisu")
      case Ratkaisutyyppi.JatetaanTutkimatta =>
        translationService.getTranslation("fi", "perustelumuistio.ratkaisutyyppi.jatetaanTutkimatta")
      case Ratkaisutyyppi.Siirto =>
        translationService.getTranslation("fi", "perustelumuistio.ratkaisutyyppi.siirto")
    }
}

def haePaatosTyyppi(translationService: TranslationService, paatosTiedot: PaatosTieto): Option[String] = {
  paatosTiedot.paatosTyyppi
    .map {
      case PaatosTyyppi.Taso =>
        translationService.getTranslation("fi", "perustelumuistio.paatostyyppi.taso")
      case PaatosTyyppi.Kelpoisuus =>
        translationService.getTranslation("fi", "perustelumuistio.paatostyyppi.kelpoisuus")
      case PaatosTyyppi.TiettyTutkintoTaiOpinnot =>
        translationService.getTranslation("fi", "perustelumuistio.paatostyyppi.tiettyTutkintoTaiOpinnot")
      case PaatosTyyppi.RiittavatOpinnot =>
        translationService.getTranslation("fi", "perustelumuistio.paatostyyppi.riittavatOpinnot")
      case PaatosTyyppi.LopullinenPaatos =>
        translationService.getTranslation("fi", "perustelumuistio.paatostyyppi.lopullinenPaatos")
    }
}

def haeSovellettuLaki(translationService: TranslationService, paatosTiedot: PaatosTieto): Option[String] = {
  paatosTiedot.sovellettuLaki
    .map {
      case SovellettuLaki.uo =>
        translationService.getTranslation("fi", "perustelumuistio.sovellettuLaki.uo")
      case SovellettuLaki.ap =>
        translationService.getTranslation("fi", "perustelumuistio.sovellettuLaki.ap")
      case SovellettuLaki.ap_seut =>
        translationService.getTranslation("fi", "perustelumuistio.sovellettuLaki.apSeut")
      case SovellettuLaki.ro =>
        translationService.getTranslation("fi", "perustelumuistio.sovellettuLaki.ro")
    }
}

def haeTutkinnonNimi(
  translationService: TranslationService,
  paatosTiedot: PaatosTieto,
  tutkinnot: Seq[Tutkinto]
): Option[String] = {
  tutkinnot
    .find(tutkinto => tutkinto.id == paatosTiedot.tutkintoId)
    .flatMap(_.nimi)
    .map(muotoiltu =>
      val label = translationService.getTranslation("fi", "perustelumuistio.tutkinnonNimi.label")
      s"$label $muotoiltu".trim
    )
}

def haeMyonteinenTaiKielteinen(translationService: TranslationService, paatostiedot: PaatosTieto): Option[String] = {
  paatostiedot.myonteinenPaatos
    .map(toKyllaEi)
    .map(muotoiltu =>
      val label = translationService.getTranslation("fi", "perustelumuistio.myonteinenTaiKielteinen.label")
      s"$label $muotoiltu".trim
    )
}

def haeTutkinnonTaso(translationService: TranslationService, paatostiedot: PaatosTieto): Option[String] = {
  paatostiedot.tutkintoTaso
    .map {
      case TutkintoTaso.AlempiKorkeakoulu =>
        translationService.getTranslation("fi", "perustelumuistio.tutkinnonTaso.alempiKorkeakoulu")
      case TutkintoTaso.YlempiKorkeakoulu =>
        translationService.getTranslation("fi", "perustelumuistio.tutkinnonTaso.ylempiKorkeakoulu")
    }
}

def haeKielteisenPaatosTiedonPerustelut(
  translationService: TranslationService,
  perustelut: Option[KielteisenPaatoksenPerustelut]
): Option[String] = {
  val epavirallinenKorkeakoulu = perustelut
    .map(_.epavirallinenKorkeakoulu)
    .filter(_ == true)
    .map(_ =>
      translationService.getTranslation("fi", "perustelumuistio.kielteinenPaatos.perustelu.epavirallinenKorkeakoulu")
    )
  val epavirallinenTutkinto = perustelut
    .map(_.epavirallinenTutkinto)
    .filter(_ == true)
    .map(_ =>
      translationService.getTranslation("fi", "perustelumuistio.kielteinenPaatos.perustelu.epavirallinenTutkinto")
    )
  val eiVastaaSuomessaSuoritettavaaTutkintoa = perustelut
    .map(_.eiVastaaSuomessaSuoritettavaaTutkintoa)
    .filter(_ == true)
    .map(_ =>
      translationService
        .getTranslation("fi", "perustelumuistio.kielteinenPaatos.perustelu.eiVastaaTasoltaanSuomalaista")
    )

  val muuPerusteluSelected: Boolean = perustelut
    .map(_.muuPerustelu)
    .filter(_ == true)
    .getOrElse(false)
  val muuPerustelu = if (muuPerusteluSelected) {
    perustelut
      .flatMap(_.muuPerusteluKuvaus)
      .map(kuvaus =>
        val label = translationService.getTranslation("fi", "perustelumuistio.kielteinenPaatos.perustelu.muuLabel")
        s"$label $kuvaus".trim
      )
  } else {
    None
  }

  val result = Seq(
    epavirallinenKorkeakoulu,
    epavirallinenTutkinto,
    eiVastaaSuomessaSuoritettavaaTutkintoa,
    muuPerustelu
  ).flatten

  if (result.nonEmpty) {
    val label           = translationService.getTranslation("fi", "perustelumuistio.kielteinenPaatos.perustelu.label")
    val resultWithTitle = label +: result
    Some(resultWithTitle.mkString("\n"))
  } else {
    None
  }
}

def haePeruutusTaiRaukeaminen(translationService: TranslationService, paatos: Paatos): Option[String] = {
  val syyt = paatos.peruutuksenTaiRaukeamisenSyy

  val eiSaaHakemaansaEikaHaluaPaatostaJonkaVoisiSaada = syyt
    .flatMap(_.eiSaaHakemaansaEikaHaluaPaatostaJonkaVoisiSaada)
    .filter(_ == true)
    .map(_ => translationService.getTranslation("fi", "perustelumuistio.peruutusTaiRaukeaminen.syy.eiSaaHakemaansa"))
  val muutenTyytymatonRatkaisuun = syyt
    .flatMap(_.muutenTyytymatonRatkaisuun)
    .filter(_ == true)
    .map(_ =>
      translationService.getTranslation("fi", "perustelumuistio.peruutusTaiRaukeaminen.syy.muutenTyytymatonRatkaisuun")
    )
  val eiApMukainenTutkintoTaiHaettuaPatevyytta = syyt
    .flatMap(_.eiApMukainenTutkintoTaiHaettuaPatevyytta)
    .filter(_ == true)
    .map(_ =>
      translationService
        .getTranslation("fi", "perustelumuistio.peruutusTaiRaukeaminen.syy.eiAPLainMukainenTaiHaettuaAmmattipatevyytta")
    )
  val eiTasoltaanVastaaSuomessaSuoritettavaaTutkintoa = syyt
    .flatMap(_.eiTasoltaanVastaaSuomessaSuoritettavaaTutkintoa)
    .filter(_ == true)
    .map(_ =>
      translationService
        .getTranslation("fi", "perustelumuistio.peruutusTaiRaukeaminen.syy.eiVastaaTasoltaanSuomalaista")
    )
  val epavirallinenKorkeakouluTaiTutkinto = syyt
    .flatMap(_.epavirallinenKorkeakouluTaiTutkinto)
    .filter(_ == true)
    .map(_ =>
      translationService
        .getTranslation("fi", "perustelumuistio.peruutusTaiRaukeaminen.syy.epavirallinenKorkeakouluTaiTutkinto")
    )
  val eiEdellytyksiaRoEikaTasopaatokselle = syyt
    .flatMap(_.eiEdellytyksiaRoEikaTasopaatokselle)
    .filter(_ == true)
    .map(_ =>
      translationService
        .getTranslation("fi", "perustelumuistio.peruutusTaiRaukeaminen.syy.eiEdellytyksiaROTaiTasopaatokselle")
    )
  val eiEdellytyksiaRinnastaaTiettyihinKkOpintoihin = syyt
    .flatMap(_.eiEdellytyksiaRinnastaaTiettyihinKkOpintoihin)
    .filter(_ == true)
    .map(_ =>
      translationService
        .getTranslation("fi", "perustelumuistio.peruutusTaiRaukeaminen.syy.eiEdellytyksiaRinnastukselle")
    )
  val hakijallaJoPaatosSamastaKoulutusKokonaisuudesta = syyt
    .flatMap(_.hakijallaJoPaatosSamastaKoulutusKokonaisuudesta)
    .filter(_ == true)
    .map(_ =>
      translationService
        .getTranslation("fi", "perustelumuistio.peruutusTaiRaukeaminen.syy.hakijallaOnJoPaatosKoulutuskokonaisuudesta")
    )
  val muuSyy = syyt
    .flatMap(_.muuSyy)
    .filter(_ == true)
    .map(_ => translationService.getTranslation("fi", "perustelumuistio.peruutusTaiRaukeaminen.syy.muu"))

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

  if (result.nonEmpty) {
    val label = translationService.getTranslation("fi", "perustelumuistio.peruutusTaiRaukeaminen.syy.label")
    Some((label +: result).mkString("\n"))
  } else {
    None
  }
}

/* ------- */
/* ------- */

def haeRinnastettavatTutkinnotTaiOpinnot(
  translationService: TranslationService,
  paatosTiedot: PaatosTieto
): Option[String] = {
  val resultList: Seq[String] =
    paatosTiedot.rinnastettavatTutkinnotTaiOpinnot.flatMap((tutkintoTaiOpinto: TutkintoTaiOpinto) => {
      val nimi: Option[String] = tutkintoTaiOpinto.tutkintoTaiOpinto
        .map(_.split("_"))
        .map(_.last)

      val kielteisenPaatoksenPerustelut: Option[String] =
        haeKielteisenPaatosTiedonPerustelut(translationService, tutkintoTaiOpinto.kielteisenPaatoksenPerustelut)

      val myonteisenPaatoksenLisavaatimukset: Option[String] =
        haeTutkinnonTaiOpinnonLisavaatimukset(translationService, tutkintoTaiOpinto.myonteisenPaatoksenLisavaatimukset)

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

  if (resultList.nonEmpty) {
    val label = translationService.getTranslation("fi", "perustelumuistio.rinnastettavatTutkinnotTaiOpinnot.label")
    val resultWithTitle = label +: resultList
    Some(resultWithTitle.mkString("\n"))
  } else {
    None
  }
}

def haeKelpoisuudet(translationService: TranslationService, paatosTiedot: PaatosTieto): Option[String] = {
  val resultList: Seq[String] = paatosTiedot.kelpoisuudet.flatMap((kelpoisuus: Kelpoisuus) => {
    val nimi: Option[String] = kelpoisuus.kelpoisuus
      .map(_.split("_"))
      .map(_.last)

    val kielteisenPaatoksenPerustelut: Option[String] =
      haeKielteisenPaatosTiedonPerustelut(translationService, kelpoisuus.kielteisenPaatoksenPerustelut)

    val myonteisenPaatoksenLisavaatimukset: Option[String] =
      haeKelpoisuudenLisavaatimukset(translationService, kelpoisuus.myonteisenPaatoksenLisavaatimukset)

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

  if (resultList.nonEmpty) {
    val label           = translationService.getTranslation("fi", "perustelumuistio.kelpoisuudet.label")
    val resultWithTitle = label +: resultList
    Some(resultWithTitle.mkString("\n"))
  } else {
    None
  }
}

/* ------- */

def haeTutkinnonTaiOpinnonLisavaatimukset(
  translationService: TranslationService,
  lisavaatimuksetMaybe: Option[MyonteisenPaatoksenLisavaatimukset]
): Option[String] = {
  lisavaatimuksetMaybe match {
    case None                  => None
    case Some(lisavaatimukset) =>
      val result = Seq(
        if (lisavaatimukset.taydentavatOpinnot)
          Some(
            translationService
              .getTranslation("fi", "perustelumuistio.tutkinnonTaiOpinnonLisavaatimukset.taydentavatOpinnot")
          )
        else None,
        if (lisavaatimukset.kelpoisuuskoe)
          Some(
            translationService.getTranslation("fi", "perustelumuistio.tutkinnonTaiOpinnonLisavaatimukset.kelpoisuuskoe")
          )
        else None,
        if (lisavaatimukset.sopeutumisaika)
          Some(
            translationService
              .getTranslation("fi", "perustelumuistio.tutkinnonTaiOpinnonLisavaatimukset.sopeutumisaika")
          )
        else None
      ).flatten

      if (result.nonEmpty) {
        val label = translationService.getTranslation("fi", "perustelumuistio.tutkinnonTaiOpinnonLisavaatimukset.label")
        val resultWithTitle = label +: result
        Some(resultWithTitle.mkString("\n"))
      } else {
        None
      }
  }
}

def haeKelpoisuudenLisavaatimukset(
  translationService: TranslationService,
  lisavaatimuksetMaybe: Option[KelpoisuudenLisavaatimukset]
): Option[String] = {
  lisavaatimuksetMaybe match {
    case None                  => None
    case Some(lisavaatimukset) =>
      val olennaisiaEroja = lisavaatimukset.olennaisiaEroja.map(_ =>
        translationService.getTranslation("fi", "perustelumuistio.kelpoisuudenLisavaatimukset.olennaisiaEroja")
      )

      val erotKoulutuksessa = lisavaatimukset.erotKoulutuksessa
        .map((erotKoulutuksessa: ErotKoulutuksessa) => {
          val nimetytErot = erotKoulutuksessa.erot
            .map((valinta: NamedBoolean) => Some(s"- ${valinta.name}: ${toKyllaEi(valinta.value)}"))

          val muuEro = erotKoulutuksessa.muuEro
            .filter(_ == true)
            .map(_ =>
              val label = translationService
                .getTranslation("fi", "perustelumuistio.kelpoisuudenLisavaatimukset.erotKoulutuksessa.muuLabel")
              s"$label ${erotKoulutuksessa.muuEroKuvaus.getOrElse("")}".trim
            )

          val kaikkiErot = (nimetytErot :+ muuEro).flatten

          if (kaikkiErot.nonEmpty) {
            val label = translationService.getTranslation(
              "fi",
              "perustelumuistio.kelpoisuudenLisavaatimukset.erotKoulutuksessa.label"
            )
            Some(
              (label +: kaikkiErot).mkString("\n")
            )
          } else {
            None
          }
        })

      val korvaavaToimenpide = lisavaatimukset.korvaavaToimenpide
        .map(haeKorvaavaToimenpide(translationService, _))

      val ammattikokemusJaElinikainenOppiminen = lisavaatimukset.ammattikokemusJaElinikainenOppiminen
        .flatMap((kokemusJaOppiminen: AmmattikomemusJaElinikainenOppiminen) => {
          val ammattikokemusTaiElinikainenOppiminenValittu = Seq(
            kokemusJaOppiminen.ammattikokemus,
            kokemusJaOppiminen.elinikainenOppiminen
          ).flatten
            .contains(true)

          if (ammattikokemusTaiElinikainenOppiminenValittu) {
            val ammattikokemus = kokemusJaOppiminen.ammattikokemus
              .map(_ =>
                translationService.getTranslation(
                  "fi",
                  "perustelumuistio.kelpoisuudenLisavaatimukset.ammattikokemusJaElinikainenOppiminen.ammattikokemus"
                )
              )

            val elinikainenOppiminen = kokemusJaOppiminen.elinikainenOppiminen
              .map(_ =>
                translationService.getTranslation(
                  "fi",
                  "perustelumuistio.kelpoisuudenLisavaatimukset.ammattikokemusJaElinikainenOppiminen.elinikainenOppiminen"
                )
              )

            val lisatieto = kokemusJaOppiminen.lisatieto
              .map(value =>
                val label = translationService.getTranslation(
                  "fi",
                  "perustelumuistio.kelpoisuudenLisavaatimukset.ammattikokemusJaElinikainenOppiminen.lisatietoLabel"
                )
                s"$label\n  $value".trim
              )

            val korvaavuus = kokemusJaOppiminen.korvaavuus
              .map {
                case AmmattikokemusElinikainenOppiminenKorvaavuus.Taysi =>
                  translationService.getTranslation(
                    "fi",
                    "perustelumuistio.kelpoisuudenLisavaatimukset.ammattikokemusJaElinikainenOppiminen.korvaavuus.taysin"
                  )
                case AmmattikokemusElinikainenOppiminenKorvaavuus.Osittainen =>
                  translationService.getTranslation(
                    "fi",
                    "perustelumuistio.kelpoisuudenLisavaatimukset.ammattikokemusJaElinikainenOppiminen.korvaavuus.osittain"
                  )
                case AmmattikokemusElinikainenOppiminenKorvaavuus.Ei =>
                  translationService.getTranslation(
                    "fi",
                    "perustelumuistio.kelpoisuudenLisavaatimukset.ammattikokemusJaElinikainenOppiminen.korvaavuus.ei"
                  )
              }

            val korvaavaToimenpide = kokemusJaOppiminen.korvaavaToimenpide
              .map(haeKorvaavaToimenpide(translationService, _))

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

      if (result.nonEmpty) {
        val label = translationService.getTranslation("fi", "perustelumuistio.kelpoisuudenLisavaatimukset.label")
        val resultWithTitle = label +: result
        Some(resultWithTitle.mkString("\n"))
      } else {
        None
      }
  }
}

def haeKorvaavaToimenpide(
  translationService: TranslationService,
  korvaavaToimenpide: KorvaavaToimenpide
): Option[String] = {
  val kelpoisuuskoe =
    haeKelpoisuuskoe(translationService, korvaavaToimenpide.kelpoisuuskoe, korvaavaToimenpide.kelpoisuuskoeSisalto)
  val sopeutumisaika =
    haeSopeutumisaika(translationService, korvaavaToimenpide.sopeutumisaika, korvaavaToimenpide.sopeutumiusaikaKestoKk)
  val yhdistettyKelpoisuuskoe = haeKelpoisuuskoe(
    translationService,
    korvaavaToimenpide.kelpoisuuskoeJaSopeutumisaika,
    korvaavaToimenpide.kelpoisuuskoeJaSopeutumisaikaSisalto
  )
  val yhdistettySopeutumisaika = haeSopeutumisaika(
    translationService,
    korvaavaToimenpide.kelpoisuuskoeJaSopeutumisaika,
    korvaavaToimenpide.kelpoisuuskoeJaSopeutumisaikaKestoKk
  )

  val resultList = Seq(
    kelpoisuuskoe,
    sopeutumisaika,
    yhdistettyKelpoisuuskoe,
    yhdistettySopeutumisaika
  ).flatten

  if (resultList.nonEmpty) {
    val label = translationService.getTranslation("fi", "perustelumuistio.korvaavaToimenpide.label")
    Some(
      (label +: resultList).mkString("\n")
    )
  } else {
    None
  }
}

def haeKelpoisuuskoe(
  translationService: TranslationService,
  valittu: Boolean,
  sisaltoMaybe: Option[KelpoisuuskoeSisalto]
): Option[String] = {
  if (valittu) {
    sisaltoMaybe.flatMap((sisalto: KelpoisuuskoeSisalto) => {
      val result = Seq(
        if (sisalto.aihealue1)
          Some(
            translationService.getTranslation("fi", "perustelumuistio.kelpoisuuskoe.sisalto.aihealue1")
          )
        else None,
        if (sisalto.aihealue2)
          Some(
            translationService.getTranslation("fi", "perustelumuistio.kelpoisuuskoe.sisalto.aihealue2")
          )
        else None,
        if (sisalto.aihealue3)
          Some(
            translationService.getTranslation("fi", "perustelumuistio.kelpoisuuskoe.sisalto.aihealue3")
          )
        else None
      ).flatten

      if (result.nonEmpty) {
        val label = translationService.getTranslation("fi", "perustelumuistio.kelpoisuuskoe.label")
        Some(
          (label +: result).mkString("\n")
        )
      } else {
        None
      }
    })
  } else {
    None
  }
}

def haeSopeutumisaika(
  translationService: TranslationService,
  valittu: Boolean,
  kestoMaybe: Option[String]
): Option[String] = {
  if (valittu) {
    val label = translationService.getTranslation("fi", "perustelumuistio.sopeutumisajanKesto.label")
    kestoMaybe.map(kesto => s"$label $kesto".trim)
  } else {
    None
  }
}

/* ------- */
/* ------- */

def haePaatostiedot(
  translationService: TranslationService,
  paatosMaybe: Option[Paatos],
  tutkinnot: Seq[Tutkinto]
): Option[String] = {
  paatosMaybe match {
    case None         => None
    case Some(paatos) =>
      val ratkaisutyyppi: Option[String] = haeRatkaisutyyppi(translationService, paatos)

      val osapaatoskohtaisetTiedot = paatos.paatosTiedot
        .map((paatosTiedot: PaatosTieto) => {
          val paatosTyyppi     = haePaatosTyyppi(translationService, paatosTiedot)
          val sovellettuLaki   = haeSovellettuLaki(translationService, paatosTiedot)
          val tutkinnonNimi    = haeTutkinnonNimi(translationService, paatosTiedot, tutkinnot)
          val myonteinenPaatos = haeMyonteinenTaiKielteinen(translationService, paatosTiedot)
          val tutkinnonTaso    = haeTutkinnonTaso(translationService, paatosTiedot)

          val result = Seq(
            paatosTyyppi,
            sovellettuLaki,
            tutkinnonNimi,
            myonteinenPaatos,
            tutkinnonTaso
          ).flatten.mkString("\n")

          if (result != "") {
            Some(result)
          } else {
            None
          }
        })

      val label               = translationService.getTranslation("fi", "perustelumuistio.paatosEsitys.label")
      val yleisetPaatostiedot = Seq(
        Some(label),
        ratkaisutyyppi
      ).flatten.mkString("\n")

      val yhdistetty = Some(yleisetPaatostiedot) +: osapaatoskohtaisetTiedot

      val result = yhdistetty.flatten.mkString("\n\n")

      if (result != "") {
        Some(result)
      } else {
        None
      }
  }
}

def haeKielteisenPaatoksenPerustelut(
  translationService: TranslationService,
  paatosMaybe: Option[Paatos]
): Option[String] = {
  paatosMaybe match {
    case None         => None
    case Some(paatos) => {

      val osapaatoskohtaisetTiedot = paatos.paatosTiedot
        .map(_.kielteisenPaatoksenPerustelut)
        .map(haeKielteisenPaatosTiedonPerustelut(translationService, _))

      val result = osapaatoskohtaisetTiedot.flatten.mkString("\n")

      if (result != "") {
        Some(result)
      } else {
        None
      }
    }
  }
}

def haeEsittelija(
  translationService: TranslationService,
  hakemusMaybe: Option[Hakemus],
  onrService: OnrService
): Option[String] = {
  onrService
    .haeNimiOption(hakemusMaybe.flatMap(_.esittelijaOid))
    .map(nimi =>
      val label = translationService.getTranslation("fi", "perustelumuistio.esittelija.label")
      s"$label $nimi".trim
    )
}

def haeKasittelyajat(translationService: TranslationService, hakemusMaybe: Option[Hakemus]): Option[String] = {
  val viimeisinAsiakirjaPvmMaybe: Option[LocalDateTime] = hakemusMaybe
    .flatMap(_.asiakirja)
    .flatMap(_.viimeinenAsiakirjaHakijalta)
  val paatosPvmMaybe: Option[LocalDateTime] = hakemusMaybe
    .flatMap(_.paatosPvm)
  val saapumisPvmMaybe: Option[LocalDateTime] = hakemusMaybe
    .flatMap(_.saapumisPvm)
  val esittelyPvmMaybe: Option[LocalDateTime] = hakemusMaybe
    .flatMap(_.esittelyPvm)

  val aikaKirjauksestaEsittelyynMonths: Option[Double] = (saapumisPvmMaybe, esittelyPvmMaybe) match {
    case (Some(saapumisPvm), Some(esittelyPvm)) =>
      Some(DAYS.between(saapumisPvm, esittelyPvm)).map(days => Utility.toPrecision(days / 30.0, 1))
    case (_, _) => None
  }
  val aikaAsiakirjastaPaatokseenMonths: Option[Double] = (viimeisinAsiakirjaPvmMaybe, paatosPvmMaybe) match {
    case (Some(viimeisinAsiakirjaPvm), Some(paatosPvm)) =>
      Some(DAYS.between(viimeisinAsiakirjaPvm, paatosPvm)).map(days => Utility.toPrecision(days / 30.0, 1))
    case (_, _) => None
  }

  val result = Seq(
    aikaKirjauksestaEsittelyynMonths.map(months =>
      val label = translationService.getTranslation("fi", "perustelumuistio.kasittelyajat.kirjauksestaEsittelyyn.label")
      val unit  = translationService.getTranslation("fi", "perustelumuistio.kasittelyajat.yksikko.kuukautta")
      s"$label ${months} $unit"
    ),
    aikaAsiakirjastaPaatokseenMonths.map(months =>
      val label = translationService.getTranslation("fi", "perustelumuistio.kasittelyajat.asiakirjastaRatkaisuun.label")
      val unit  = translationService.getTranslation("fi", "perustelumuistio.kasittelyajat.yksikko.kuukautta")
      s"$label ${months} $unit"
    )
  ).flatten.mkString("\n")

  if (result != "") {
    Some(result)
  } else {
    None
  }
}

def haePerusteluTitle(
  translationService: TranslationService,
  paatosMaybe: Option[Paatos]
): Option[String] = {
  // Esitetään Perustelu-otsikko vain jos ratkaisuehdotus on esitetty (paatosMaybe != None)
  paatosMaybe.map(_ => translationService.getTranslation("fi", "perustelumuistio.perustelu.label"))
}

def generate(
  koodistoService: KoodistoService,
  maakoodiService: MaakoodiService,
  onrService: OnrService,
  translationService: TranslationService,
  hakemusMaybe: Option[Hakemus],
  tutkinnot: Seq[Tutkinto],
  ataruHakemusMaybe: Option[AtaruHakemus],
  perusteluMaybe: Option[Perustelu],
  paatosMaybe: Option[Paatos]
): String = {
  val result: Seq[String] = Seq[Option[String]](
    haeEsittelija(translationService, hakemusMaybe, onrService),
    haeKasittelyajat(translationService, hakemusMaybe),

    haeHakijanNimi(translationService, hakemusMaybe),
    haeHakijanSyntymaaika(translationService, hakemusMaybe),

    haeTutkintokohtaisetTiedot(translationService, maakoodiService, koodistoService, hakemusMaybe, tutkinnot),
    haeMuuTutkinto(translationService, tutkinnot),

    haeHakemusKoskee(translationService, hakemusMaybe),

    haePaatostiedot(translationService, paatosMaybe, tutkinnot),

    haePerusteluTitle(translationService, paatosMaybe),

    haePerustelunTutkintokohtaisetTiedot(translationService, tutkinnot),
    haeYleisetPerustelut(translationService, perusteluMaybe),
    haeJatkoOpintoKelpoisuus(translationService, perusteluMaybe),

    haeKielteisenPaatoksenPerustelut(translationService, paatosMaybe),
    haeAikaisemmatPaatokset(translationService, perusteluMaybe),

    haeMuuPerustelu(translationService, perusteluMaybe),

    haeLausuntopyynnot(translationService, koodistoService, perusteluMaybe),

    haeAsiakirjat(translationService, hakemusMaybe),
    haeSuostumusSahkoiseenAsiointiin(translationService, hakemusMaybe),

    // TODO: Alla olevat ovat OPH:n katselmoitavana

    haeUoRoPerustelu(translationService, perusteluMaybe),
    haeApPerustelu(translationService, perusteluMaybe),
    haeYhteistutkinto(translationService, hakemusMaybe)
  ).flatten

  result.mkString("\n\n")
}
