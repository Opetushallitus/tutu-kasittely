package fi.oph.tutu.backend.service.generator.perustelumuistio

import java.time.LocalDateTime
import java.time.temporal.ChronoUnit.DAYS

import fi.oph.tutu.backend.domain.*
import fi.oph.tutu.backend.service.{KoodistoService, MaakoodiService, OnrService, TranslationService}
import fi.oph.tutu.backend.service.generator.{formatDate, toKyllaEi}
import fi.oph.tutu.backend.utils.{Constants, Utility, haeKysymyksenTiedot}

private val FI = Kieli.fi

def haeImiPyyntoTieto(translationService: TranslationService, hakemusMaybe: Option[Hakemus]): Option[String] = {
  val imiPyynto: Option[ImiPyynto] = hakemusMaybe.flatMap(_.asiakirja).map(_.imiPyynto)
  val showImiData                  = imiPyynto.flatMap(_.imiPyynto).contains(true)

  if (showImiData) {
    val imiPyyntoLabel = translationService.getTranslation(FI, "perustelumuistio.imipyynto.label")
    val vastattuLabel  = translationService.getTranslation(FI, "perustelumuistio.imipyynto.vastattu.label")

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
          translationService.getTranslation(FI, "perustelumuistio.valmistuminenVahvistettu.vastaus.myonteinen")
        case ValmistumisenVahvistusVastaus.Kielteinen =>
          translationService.getTranslation(FI, "perustelumuistio.valmistuminenVahvistettu.vastaus.kielteinen")
        case ValmistumisenVahvistusVastaus.EiVastausta =>
          translationService.getTranslation(
            FI,
            "perustelumuistio.valmistuminenVahvistettu.vastaus.vastaustaEiSaatu"
          )
      }
  muotoiltuVastausMaybe
}

def haeSelvityksetSaatu(translationService: TranslationService, hakemusMaybe: Option[Hakemus]): Option[String] = {
  hakemusMaybe
    .flatMap(_.asiakirja)
    .map(_.selvityksetSaatu)
    .map {
      case true =>
        translationService.getTranslation(FI, "perustelumuistio.selvityksetSaatu.vastaus.kylla")
      case false =>
        translationService.getTranslation(FI, "perustelumuistio.selvityksetSaatu.vastaus.ei")
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
    val label = translationService.getTranslation(FI, "perustelumuistio.suostumusSahkoiseenAsiointiin.label")
    s"$label $valinta".trim
  })
}

def haeHakijanNimi(translationService: TranslationService, hakemusMaybe: Option[Hakemus]): Option[String] = {
  hakemusMaybe.map(hakemus => {
    s"${hakemus.hakija.kutsumanimi} ${hakemus.hakija.sukunimi}".trim
  })
}

def haeHakijanSyntymaaika(translationService: TranslationService, hakemusMaybe: Option[Hakemus]): Option[String] = {
  hakemusMaybe.map(hakemus => {
    s"${hakemus.hakija.syntymaaika}".trim
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

    val label     = item.filter(_.fieldType != "dropdown").flatMap(_.label.get(kieli)).getOrElse("")
    val values    = item.map(_.value.map(_.label.get(kieli).getOrElse(""))).getOrElse(Seq.empty)
    val fieldType = item.map(_.fieldType).getOrElse("-")

    val uudetRivit = values.size match {
      case 0 => alirivit
      case 1 =>
        val value = values.head
        val rivi  = s"$label $value"
        (level, rivi, fieldType) +: alirivit
      case _ =>
        val labelRivi = (level, label, fieldType)
        val rivit     = values.map(value => (level + 1, value, fieldType))
        (labelRivi +: rivit) ++ alirivit
    }

    uudetRivit.filter(r => r._2.nonEmpty)
  }
}

def haeHakemusKoskee(translationService: TranslationService, hakemusMaybe: Option[Hakemus]): Option[String] = {
  if (hakemusMaybe.isEmpty) {
    None
  } else {
    val label   = translationService.getTranslation(FI, "perustelumuistio.hakemusKoskee.label")
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
  val label                              = translationService.getTranslation(FI, "perustelumuistio.muuTutkinto.label")
  val muuTutkintoMaybe: Option[Tutkinto] = tutkinnot.find((tutkinto: Tutkinto) => tutkinto.jarjestys == "MUU")
  val muuTutkintoTietoMaybe: Option[String] = muuTutkintoMaybe.flatMap(_.muuTutkintoTieto)

  muuTutkintoTietoMaybe.map((muuTutkintoTieto: String) => s"$label\n$muuTutkintoTieto")
}

def haeYhteistutkinto(translationService: TranslationService, hakemusMaybe: Option[Hakemus]): Option[String] = {
  val value = translationService.getTranslation(FI, "perustelumuistio.yhteistutkinto.value")
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
  val lomakkeenKieli = hakemusMaybe.map(_.lomakkeenKieli)

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
        tutkinto.todistusOtsikko.getOrElse("-"),
        tutkinto.nimi.getOrElse("-"),
        tutkinto.paaAineTaiErikoisala.getOrElse("-"),
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
      val suoritusvuodetLabel     = translationService.getTranslation(FI, "perustelumuistio.suoritusvuodet.label")
      val ohjeellinenLaajuusLabel =
        translationService.getTranslation(FI, "perustelumuistio.ohjeellinenLaajuus.label")
      val tutkintoonSisaltyiOpinnaytetyoLabel =
        translationService.getTranslation(FI, "perustelumuistio.tutkintoonSisaltyiOpinnayte.label")
      val tutkintoonSisaltyiHarjoitteluLabel =
        translationService.getTranslation(FI, "perustelumuistio.tutkintoonSisaltyiHarjoittelu.label")
      val lisatietoaOpinnaytteisiinJaHArjoitteluunLabel =
        translationService.getTranslation(FI, "perustelumuistio.lisatietoaOpinnaytteeseenJaHarjoitteluun.label")

      val suoritusvuodet = Seq(tutkinto.aloitusVuosi, tutkinto.paattymisVuosi).flatten
        .mkString(" - ")

      Seq[String](
        s"${tutkinto.nimi.getOrElse("-")}",
        s"${tutkinto.paaAineTaiErikoisala.getOrElse("-")}",
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
              translationService.getTranslation(FI, "perustelumuistio.virallinenTutkinnonMyontaja.kylla")
            case false =>
              translationService.getTranslation(FI, "perustelumuistio.virallinenTutkinnonMyontaja.ei")
          },
        perustelu.virallinenTutkinto
          .map {
            case true =>
              translationService.getTranslation(FI, "perustelumuistio.virallinenTutkinto.kylla")
            case false =>
              translationService.getTranslation(FI, "perustelumuistio.virallinenTutkinto.ei")
          },
        if (perustelu.lahdeLahtomaanKansallinenLahde) {
          Some(
            translationService.getTranslation(FI, "perustelumuistio.lahdeLahtomaanKansallinenLahde.value")
          )
        } else None,
        if (perustelu.lahdeLahtomaanVirallinenVastaus) {
          Some(
            translationService.getTranslation(FI, "perustelumuistio.lahdeLahtomaanVirallinenVastaus.value")
          )
        } else None,
        if (perustelu.lahdeKansainvalinenHakuteosTaiVerkkosivusto) {
          Some(
            translationService.getTranslation(
              FI,
              "perustelumuistio.lahdeKansainvalinenHakuteosTaiVerkkosivusto.value"
            )
          )
        } else None,
        if (perustelu.selvitysTutkinnonMyontajastaJaTutkinnonVirallisuudesta != "") {
          val label = translationService.getTranslation(
            FI,
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
                FI,
                "perustelumuistio.ylimmanTutkinnonAsemaLahtomaanJarjestelmassa.alempi_korkeakouluaste"
              )
            case "ylempi_korkeakouluaste" =>
              translationService.getTranslation(
                FI,
                "perustelumuistio.ylimmanTutkinnonAsemaLahtomaanJarjestelmassa.ylempi_korkeakouluaste"
              )
            case "alempi_ja_ylempi_korkeakouluaste" =>
              translationService.getTranslation(
                FI,
                "perustelumuistio.ylimmanTutkinnonAsemaLahtomaanJarjestelmassa.alempi_ja_ylempi_korkeakouluaste"
              )
            case "tutkijakoulutusaste" =>
              translationService.getTranslation(
                FI,
                "perustelumuistio.ylimmanTutkinnonAsemaLahtomaanJarjestelmassa.tutkijakoulutusaste"
              )
            case "ei_korkeakouluaste" =>
              translationService.getTranslation(
                FI,
                "perustelumuistio.ylimmanTutkinnonAsemaLahtomaanJarjestelmassa.ei_korkeakouluaste"
              )
          },
        if (perustelu.selvitysTutkinnonAsemastaLahtomaanJarjestelmassa != "") {
          val label = translationService.getTranslation(
            FI,
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
                FI,
                "perustelumuistio.jatkoOpintoKelpoisuus.toisen_vaiheen_korkeakouluopintoihin"
              )
            case "tieteellisiin_jatko-opintoihin" =>
              translationService.getTranslation(
                FI,
                "perustelumuistio.jatkoOpintoKelpoisuus.tieteellisiin_jatko-opintoihin"
              )
            case "muu" =>
              translationService.getTranslation(FI, "perustelumuistio.jatkoOpintoKelpoisuus.muu")
          },
        (perustelu.jatkoOpintoKelpoisuus, perustelu.jatkoOpintoKelpoisuusLisatieto) match {
          case (Some("muu"), Some(lisatieto)) => {
            val label =
              translationService.getTranslation(FI, "perustelumuistio.jatkoOpintoKelpoisuus.lisatieto.label")
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
        case true  => translationService.getTranslation(FI, "perustelumuistio.aikaisemmatPaatokset.kylla")
        case false => translationService.getTranslation(FI, "perustelumuistio.aikaisemmatPaatokset.ei")
      }
  })
}

def haeMuuPerustelu(translationService: TranslationService, perusteluMaybe: Option[Perustelu]): Option[String] = {
  perusteluMaybe.flatMap(perustelu => {
    perustelu.muuPerustelu
      .filter(_.nonEmpty)
      .map(muotoiltu => {
        val label = translationService.getTranslation(FI, "perustelumuistio.muuPerustelu.label")
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
      val label = translationService.getTranslation(FI, "perustelumuistio.koulutuksenSisalto.label")
      s"$label\n$sisalto"
    })

  val result = Seq(
    koulutuksenSisalto
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
              .getTranslation(FI, "perustelumuistio.ap.lakiperuste.toisessaJasenmaassaSaanneltyKoulutus")
          ),
        apSisalto.lakiperustePatevyysLahtomaanOikeuksilla
          .filter(_.==(true))
          .map(_ =>
            translationService.getTranslation(FI, "perustelumuistio.ap.lakiperuste.lahtomaassaSaavutetutOikeudet")
          ),
        apSisalto.lakiperusteToinenEUmaaTunnustanut
          .filter(_.==(true))
          .map(_ => translationService.getTranslation(FI, "perustelumuistio.ap.lakiperuste.toinenEUMaaTunnustanut")),
        apSisalto.lakiperusteLahtomaassaSaantelematon
          .filter(_.==(true))
          .map(_ =>
            translationService
              .getTranslation(FI, "perustelumuistio.ap.lakiperuste.saantelematonAmmattiJaTyokokemus")
          ),

        // ------- //
        apSisalto.todistusEUKansalaisuuteenRinnasteisestaAsemasta
          .filter(_.nonEmpty)
          .map(text =>
            val label =
              translationService.getTranslation(FI, "perustelumuistio.ap.todistusEUKansalaisuusAsemasta.label")
            s"$label\n$text\n"
          ),
        apSisalto.ammattiJohonPatevoitynyt
          .filter(_.nonEmpty)
          .map(text =>
            val label = translationService.getTranslation(FI, "perustelumuistio.ap.ammattiJohonPatevoitynyt.label")
            s"$label\n$text\n"
          ),
        apSisalto.ammattitoiminnanPaaAsiallinenSisalto
          .filter(_.nonEmpty)
          .map(text =>
            val label = translationService.getTranslation(FI, "perustelumuistio.ap.ammattitoiminnanSisalto.label")
            s"$label\n$text\n"
          ),
        apSisalto.koulutuksenKestoJaSisalto
          .filter(_.nonEmpty)
          .map(text =>
            val label =
              translationService.getTranslation(FI, "perustelumuistio.ap.koulutuksenKestoJaSisalto.label")
            s"$label\n$text\n"
          ),

        //////////////////////////////////////////////////////////////////////////////
        // Ammattipätevyyttä ja ammatin tai koulutuksen sääntelyä koskevat selvitykset
        apSisalto.selvityksetLahtomaanViranomaiselta
          .filter(_.==(true))
          .map(_ => translationService.getTranslation(FI, "perustelumuistio.ap.selvitykset.lahtomaanViranomaiselta")),
        apSisalto.selvityksetLahtomaanLainsaadannosta
          .filter(_.==(true))
          .map(_ => translationService.getTranslation(FI, "perustelumuistio.ap.selvitykset.lahtomaanLainsaadannosta")),
        (apSisalto.selvityksetAikaisempiTapaus, apSisalto.selvityksetAikaisemmanTapauksenAsiaTunnus) match {
          case (Some(true), Some("")) =>
            Some(translationService.getTranslation(FI, "perustelumuistio.ap.selvitykset.aikaisempiTapaus"))
          case (Some(true), None) =>
            Some(translationService.getTranslation(FI, "perustelumuistio.ap.selvitykset.aikaisempiTapaus"))
          case (Some(true), Some(asiatunnus)) => {
            val label =
              translationService.getTranslation(FI, "perustelumuistio.ap.selvitykset.aikaisempiTapausLabel")
            Some(s"$label $asiatunnus".trim)
          }
          case (_, _) => None
        },
        apSisalto.selvityksetIlmeneeAsiakirjoista
          .filter(_.==(true))
          .map(_ => translationService.getTranslation(FI, "perustelumuistio.ap.selvitykset.asiakirjoista")),

        // ------- //
        apSisalto.lisatietoja
          .filter(_.nonEmpty)
          .map(text =>
            val label = translationService.getTranslation(FI, "perustelumuistio.ap.lisatietoja.label")
            s"$label\n$text"
          ),
        apSisalto.IMIHalytysTarkastettu
          .filter(_.==(true))
          .map(_ => translationService.getTranslation(FI, "perustelumuistio.ap.IMIHalytyksetTarkastettu")),
        apSisalto.muutAPPerustelut
          .filter(_.nonEmpty)
          .map(text =>
            val label = translationService.getTranslation(FI, "perustelumuistio.ap.muutPerustelut.label")
            s"$label\n$text"
          ),
        apSisalto.SEUTArviointi
          .filter(_.nonEmpty)
          .map(text =>
            val label = translationService.getTranslation(FI, "perustelumuistio.ap.SEUTArviointi.label")
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
                translationService.getTranslation(FI, "perustelumuistio.lausuntopyynnot.lausunnonAntaja.muuLabel")
              Some(s"$label $tarkenne".trim)
            }
            case (Some("muu"), None) =>
              Some(
                translationService.getTranslation(FI, "perustelumuistio.lausuntopyynnot.lausunnonAntaja.muu")
              )
            case (Some(korkeakouluKoodi), _) =>
              val korkeakoulu = korkeakoulut
                .find(item => item.koodiUri == korkeakouluKoodi)
                .flatMap(_.nimi.get(Kieli.fi))

              val label =
                translationService.getTranslation(FI, "perustelumuistio.lausuntopyynnot.lausunnonAntaja.label")
              korkeakoulu match {
                case None                   => Some(s"$label $korkeakouluKoodi".trim)
                case Some(korkeakoulunNimi) => Some(s"$label $korkeakoulunNimi".trim)
              }
            case (None, _) => None
          },
          pyynto.lahetetty
            .map(formatDate)
            .map(lahetetty => {
              val label = translationService.getTranslation(FI, "perustelumuistio.lausuntopyynnot.lahetetty.label")
              s"$label $lahetetty".trim
            }),
          pyynto.saapunut
            .map(formatDate)
            .map(saapunut => {
              val label = translationService.getTranslation(FI, "perustelumuistio.lausuntopyynnot.saapunut.label")
              s"$label $saapunut".trim
            })
        ).flatten.mkString("\n")
      })

      val sisalto = perustelu.lausunnonSisalto
        .map(sisalto => {
          val label = translationService.getTranslation(FI, "perustelumuistio.lausuntopyynnot.sisalto.label")
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
      val label = translationService.getTranslation(FI, "perustelumuistio.asiakirjat.esittelijanHuomiot.label")
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

/* ------- */
/* ------- */

def haeEsittelija(
  translationService: TranslationService,
  hakemusMaybe: Option[Hakemus],
  onrService: OnrService
): Option[String] = {
  onrService
    .haeNimiOption(hakemusMaybe.flatMap(_.esittelijaOid))
    .map(nimi =>
      val label = translationService.getTranslation(FI, "perustelumuistio.esittelija.label")
      s"$label $nimi".trim
    )
}

def haeKasittelyajat(translationService: TranslationService, hakemusMaybe: Option[Hakemus]): Option[String] = {
  val viimeisinAsiakirjaPvmMaybe: Option[LocalDateTime] = hakemusMaybe
    .flatMap(_.asiakirja)
    .flatMap(_.viimeinenAsiakirjaHakijalta)
  val saapumisPvmMaybe: Option[LocalDateTime] = hakemusMaybe
    .flatMap(_.saapumisPvm)
  val esittelyPvmMaybe: Option[LocalDateTime] = hakemusMaybe
    .flatMap(_.esittelyPvm)

  val aikaKirjauksestaEsittelyynMonths: Option[Double] = (saapumisPvmMaybe, esittelyPvmMaybe) match {
    case (Some(saapumisPvm), Some(esittelyPvm)) =>
      Some(DAYS.between(saapumisPvm, esittelyPvm)).map(days => Utility.toPrecision(days / 30.0, 1))
    case (_, _) => None
  }
  val aikaAsiakirjastaEsittelyynMonths: Option[Double] = (viimeisinAsiakirjaPvmMaybe, esittelyPvmMaybe) match {
    case (Some(viimeisinAsiakirjaPvm), Some(esittelyPvm)) =>
      Some(DAYS.between(viimeisinAsiakirjaPvm, esittelyPvm)).map(days => Utility.toPrecision(days / 30.0, 1))
    case (_, _) => None
  }

  val result = Seq(
    aikaKirjauksestaEsittelyynMonths.map(months =>
      val label =
        translationService.getTranslation(FI, "perustelumuistio.kasittelyajat.kirjauksestaEsittelyyn.label")
      val unit = translationService.getTranslation(FI, "perustelumuistio.kasittelyajat.yksikko.kuukautta")
      s"$label ${months} $unit"
    ),
    aikaAsiakirjastaEsittelyynMonths.map(months =>
      val label =
        translationService.getTranslation(FI, "perustelumuistio.kasittelyajat.asiakirjastaRatkaisuun.label")
      val unit = translationService.getTranslation(FI, "perustelumuistio.kasittelyajat.yksikko.kuukautta")
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
  paatosMaybe.map(_ => translationService.getTranslation(FI, "perustelumuistio.perustelu.label"))
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
  val (haePaatostiedot, haeKielteisenPaatoksenPerustelut) = bindHaePaatostiedot(
    translationService = translationService,
    tutkinnot = tutkinnot
  )

  val result: Seq[String] = Seq[Option[String]](
    haeEsittelija(translationService, hakemusMaybe, onrService),
    haeKasittelyajat(translationService, hakemusMaybe),

    haeHakijanNimi(translationService, hakemusMaybe),
    haeHakijanSyntymaaika(translationService, hakemusMaybe),

    haeTutkintokohtaisetTiedot(translationService, maakoodiService, koodistoService, hakemusMaybe, tutkinnot),
    haeMuuTutkinto(translationService, tutkinnot),

    haeHakemusKoskee(translationService, hakemusMaybe),

    haePaatostiedot(paatosMaybe),

    haePerusteluTitle(translationService, paatosMaybe),

    haePerustelunTutkintokohtaisetTiedot(translationService, tutkinnot),
    haeYleisetPerustelut(translationService, perusteluMaybe),
    haeJatkoOpintoKelpoisuus(translationService, perusteluMaybe),

    haeKielteisenPaatoksenPerustelut(paatosMaybe),
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
