package fi.oph.tutu.backend.service.generator.perustelumuistio

import fi.oph.tutu.backend.domain.*
import fi.oph.tutu.backend.service.TranslationService
import fi.oph.tutu.backend.service.generator.toKyllaEi

private val FI = Kieli.fi

type PaatosNodeType =
  Paatos | PeruutuksenTaiRaukeamisenSyy | PaatosTieto | TutkintoTaiOpinto | MyonteisenPaatoksenLisavaatimukset |
    ErotKoulutuksessa | KorvaavaToimenpide | AmmattikomemusJaElinikainenOppiminen | KelpoisuudenLisavaatimukset |
    KielteisenPaatoksenPerustelut | Kelpoisuus

type PaatosNodeTypeAggregate =
  PaatosNodeType | Option[PaatosNodeType] | Seq[PaatosNodeType]

type PerustelumuistioGetter = PaatosNodeTypeAggregate => Option[String]

def bindHaePaatostiedot(
  translationService: TranslationService,
  tutkinnot: Seq[Tutkinto]
): (
  PerustelumuistioGetter,
  PerustelumuistioGetter
) = {
  val getListLabel = bindGetListLabel(translationService)

  val extractPaatos                             = bindExtractPaatos(translationService, tutkinnot)
  val extractPeruutuksenTaiRaukeamisenSyy       = bindExtractPeruutuksenTaiRaukeamisenSyy(translationService, tutkinnot)
  val extractPaatosTieto                        = bindExtractPaatosTieto(translationService, tutkinnot)
  val extractTutkintoTaiOpinto                  = bindExtractTutkintoTaiOpinto(translationService, tutkinnot)
  val extractMyonteisenPaatoksenLisavaatimukset =
    bindExtractMyonteisenPaatoksenLisavaatimukset(translationService, tutkinnot)
  val extractErotKoulutuksessa                    = bindExtractErotKoulutuksessa(translationService, tutkinnot)
  val extractKorvaavaToimenpide                   = bindExtractKorvaavaToimenpide(translationService, tutkinnot)
  val extractAmmattikomemusJaElinikainenOppiminen =
    bindExtractAmmattikomemusJaElinikainenOppiminen(translationService, tutkinnot)
  val extractKelpoisuudenLisavaatimukset   = bindExtractKelpoisuudenLisavaatimukset(translationService, tutkinnot)
  val extractKielteisenPaatoksenPerustelut = bindExtractKielteisenPaatoksenPerustelut(translationService, tutkinnot)
  val extractKelpoisuus                    = bindExtractKelpoisuus(translationService, tutkinnot)

  def extractNext(node: PaatosNodeType): Option[String] = {
    node match {
      case node: Paatos                               => extractPaatos(node)
      case node: PeruutuksenTaiRaukeamisenSyy         => extractPeruutuksenTaiRaukeamisenSyy(node)
      case node: PaatosTieto                          => extractPaatosTieto(node)
      case node: TutkintoTaiOpinto                    => extractTutkintoTaiOpinto(node)
      case node: MyonteisenPaatoksenLisavaatimukset   => extractMyonteisenPaatoksenLisavaatimukset(node)
      case node: ErotKoulutuksessa                    => extractErotKoulutuksessa(node)
      case node: KorvaavaToimenpide                   => extractKorvaavaToimenpide(node)
      case node: AmmattikomemusJaElinikainenOppiminen => extractAmmattikomemusJaElinikainenOppiminen(node)
      case node: KelpoisuudenLisavaatimukset          => extractKelpoisuudenLisavaatimukset(node)
      case node: KielteisenPaatoksenPerustelut        => extractKielteisenPaatoksenPerustelut(node)
      case node: Kelpoisuus                           => extractKelpoisuus(node)
      case _                                          => None
    }
  }

  def haePaatostiedotExtract = applyOrDefault(
    poistaKielteisenPaatoksenPerustelut,
    extractNext,
    None
  )

  def haeKielteisenPaatoksenPerustelutExtract = applyOrDefault(
    vainKielteisenPaatoksenPerustelut,
    extractNext,
    None
  )

  def haePaatosGetListLabel = applyOrDefault(
    poistaKielteisenPaatoksenPerustelut,
    getListLabel,
    None
  )

  def haeKielteisenPaatoksenPerustelutGetListLabel = applyOrDefault(
    vainKielteisenPaatoksenPerustelut,
    getListLabel,
    None
  )

  val haePaatostiedot                  = bindTraverse(haePaatostiedotExtract, expand, combine, haePaatosGetListLabel)
  val haeKielteisenPaatoksenPerustelut =
    bindTraverse(haeKielteisenPaatoksenPerustelutExtract, expand, combine, haeKielteisenPaatoksenPerustelutGetListLabel)

  (haePaatostiedot, haeKielteisenPaatoksenPerustelut)
}

def applyOrDefault[S, T](
  predicate: S => Boolean,
  op: S => T,
  defaultValue: T
): S => T = {
  def fn(node: S): T = {
    if predicate(node) then op(node) else defaultValue
  }
  fn
}

def bindStep(
  extract: PaatosNodeType => Option[String],
  expand: PaatosNodeType => Seq[PaatosNodeTypeAggregate]
): PaatosNodeType => (Option[String], Seq[PaatosNodeTypeAggregate]) = {
  def fn(node: PaatosNodeType): (Option[String], Seq[PaatosNodeTypeAggregate]) = {
    val extractedValue: Option[String]         = extract(node)
    val newNodes: Seq[PaatosNodeTypeAggregate] = expand(node)

    (extractedValue, newNodes)
  }

  fn
}

def bindTraverse(
  extract: PaatosNodeType => Option[String],
  expand: PaatosNodeType => Seq[PaatosNodeTypeAggregate],
  combine: (Seq[PaatosNodeTypeAggregate], Seq[PaatosNodeTypeAggregate]) => Seq[PaatosNodeTypeAggregate],
  getListLabel: PaatosNodeType => Option[String]
): PaatosNodeTypeAggregate => Option[String] = {
  def step = bindStep(extract, expand)
  def extractAndExpandAggregate(aggregate: PaatosNodeTypeAggregate): (Option[String], Seq[PaatosNodeTypeAggregate]) = {
    aggregate match {
      case nodeSeq: Seq[PaatosNodeType] if nodeSeq.isEmpty => (None, Seq.empty)
      case nodeSeq: Seq[PaatosNodeType]                    =>
        val listLabel = getListLabel(nodeSeq.head)
        (listLabel, nodeSeq)
      case Some(node)           => step(node)
      case None                 => (None, Seq.empty)
      case node: PaatosNodeType => step(node)
    }
  }

  def traverseInternal(openList: Seq[PaatosNodeTypeAggregate], currentResultMaybe: Option[String]): Option[String] = {
    openList.headOption match {
      case None       => currentResultMaybe
      case Some(head) => {
        val (stepResultMaybe, newOpenNodes) = extractAndExpandAggregate(head)
        val newResult                       = Seq(currentResultMaybe, stepResultMaybe).flatten.mkString("\n").trim
        val newResultMaybe                  = if newResult.isEmpty then None else Some(newResult)
        val newOpenList                     = combine(openList.tail, newOpenNodes)
        traverseInternal(newOpenList, newResultMaybe)
      }
    }
  }

  def traverse(aggregate: PaatosNodeTypeAggregate): Option[String] = {
    traverseInternal(Seq(aggregate), None)
  }

  traverse
}

def expand(node: PaatosNodeType): Seq[PaatosNodeTypeAggregate] = {
  node match {
    case node: Paatos                               => expandPaatos(node)
    case node: PeruutuksenTaiRaukeamisenSyy         => expandPeruutuksenTaiRaukeamisenSyy(node)
    case node: PaatosTieto                          => expandPaatosTieto(node)
    case node: TutkintoTaiOpinto                    => expandTutkintoTaiOpinto(node)
    case node: MyonteisenPaatoksenLisavaatimukset   => expandMyonteisenPaatoksenLisavaatimukset(node)
    case node: ErotKoulutuksessa                    => expandErotKoulutuksessa(node)
    case node: KorvaavaToimenpide                   => expandKorvaavaToimenpide(node)
    case node: AmmattikomemusJaElinikainenOppiminen => expandAmmattikomemusJaElinikainenOppiminen(node)
    case node: KelpoisuudenLisavaatimukset          => expandKelpoisuudenLisavaatimukset(node)
    case node: KielteisenPaatoksenPerustelut        => expandKielteisenPaatoksenPerustelut(node)
    case node: Kelpoisuus                           => expandKelpoisuus(node)
    case _                                          => Seq.empty
  }
}

def combine(
  openList: Seq[PaatosNodeTypeAggregate],
  newList: Seq[PaatosNodeTypeAggregate]
): Seq[PaatosNodeTypeAggregate] = {
  newList ++ openList
}

def bindGetListLabel(translationService: TranslationService): PaatosNodeType => Option[String] = {
  def fn(node: PaatosNodeType): Option[String] = {
    node match {
      case node: TutkintoTaiOpinto =>
        Some(translationService.getTranslation(FI, "perustelumuistio.rinnastettavatTutkinnotTaiOpinnot.label"))
      case node: Kelpoisuus => Some(translationService.getTranslation(FI, "perustelumuistio.kelpoisuudet.label"))
      case _                => None
    }
  }
  fn
}

def poistaKielteisenPaatoksenPerustelut(node: PaatosNodeType): Boolean = {
  node match {
    case _: KielteisenPaatoksenPerustelut => false
    case _                                => true
  }
}

def vainKielteisenPaatoksenPerustelut(node: PaatosNodeType): Boolean = {
  node match {
    case _: KielteisenPaatoksenPerustelut => true
    case _                                => false
  }
}

/* ------- */

def expandPaatos(node: Paatos): Seq[PaatosNodeTypeAggregate] = {
  Seq(
    node.paatosTiedot
  )
}

def expandPeruutuksenTaiRaukeamisenSyy(node: PeruutuksenTaiRaukeamisenSyy): Seq[PaatosNodeTypeAggregate] = {
  Seq.empty
}

def expandPaatosTieto(node: PaatosTieto): Seq[PaatosNodeTypeAggregate] = {
  Seq(
    node.kelpoisuudet,
    node.rinnastettavatTutkinnotTaiOpinnot,
    node.kielteisenPaatoksenPerustelut
  )
}

def expandTutkintoTaiOpinto(node: TutkintoTaiOpinto): Seq[PaatosNodeTypeAggregate] = {
  Seq(
    node.kielteisenPaatoksenPerustelut,
    node.myonteisenPaatoksenLisavaatimukset
  )
}

def expandMyonteisenPaatoksenLisavaatimukset(node: MyonteisenPaatoksenLisavaatimukset): Seq[PaatosNodeTypeAggregate] = {
  Seq.empty
}

def expandErotKoulutuksessa(node: ErotKoulutuksessa): Seq[PaatosNodeTypeAggregate] = {
  Seq.empty
}

def expandKorvaavaToimenpide(node: KorvaavaToimenpide): Seq[PaatosNodeTypeAggregate] = {
  Seq.empty
}

def expandAmmattikomemusJaElinikainenOppiminen(
  node: AmmattikomemusJaElinikainenOppiminen
): Seq[PaatosNodeTypeAggregate] = {
  Seq(
    node.korvaavaToimenpide
  )
}

def expandKelpoisuudenLisavaatimukset(node: KelpoisuudenLisavaatimukset): Seq[PaatosNodeTypeAggregate] = {
  Seq(
    node.erotKoulutuksessa,
    node.korvaavaToimenpide,
    node.ammattikokemusJaElinikainenOppiminen
  )
}

def expandKielteisenPaatoksenPerustelut(node: KielteisenPaatoksenPerustelut): Seq[PaatosNodeTypeAggregate] = {
  Seq.empty
}

def expandKelpoisuus(node: Kelpoisuus): Seq[PaatosNodeTypeAggregate] = {
  Seq(
    node.kielteisenPaatoksenPerustelut,
    node.myonteisenPaatoksenLisavaatimukset
  )
}

/* ------- */

def bindExtractPaatos(
  translationService: TranslationService,
  tutkinnot: Seq[Tutkinto]
): (Paatos) => Option[String] = {
  def next(node: Paatos): Option[String] = {
    val ratkaisutyyppi: Option[String] = haeRatkaisutyyppi(translationService, node)
    val seutArviointi: Option[String]  =
      Option.when(node.seutArviointi)(translationService.getTranslation(FI, "perustelumuistio.SEUTArviointi"))

    val label  = translationService.getTranslation(FI, "perustelumuistio.paatosEsitys.label")
    val result = Seq(
      Some(label),
      ratkaisutyyppi,
      seutArviointi
    ).flatten.mkString("\n").trim

    if result.nonEmpty then Some(result) else None
  }

  next
}

def bindExtractPeruutuksenTaiRaukeamisenSyy(
  translationService: TranslationService,
  tutkinnot: Seq[Tutkinto]
): (PeruutuksenTaiRaukeamisenSyy) => Option[String] = {
  def next(node: PeruutuksenTaiRaukeamisenSyy): Option[String] = {
    val eiSaaHakemaansaEikaHaluaPaatostaJonkaVoisiSaada = node.eiSaaHakemaansaEikaHaluaPaatostaJonkaVoisiSaada
      .filter(_ == true)
      .map(_ => translationService.getTranslation(FI, "perustelumuistio.peruutusTaiRaukeaminen.syy.eiSaaHakemaansa"))
    val muutenTyytymatonRatkaisuun = node.muutenTyytymatonRatkaisuun
      .filter(_ == true)
      .map(_ =>
        translationService
          .getTranslation(FI, "perustelumuistio.peruutusTaiRaukeaminen.syy.muutenTyytymatonRatkaisuun")
      )
    val eiApMukainenTutkintoTaiHaettuaPatevyytta = node.eiApMukainenTutkintoTaiHaettuaPatevyytta
      .filter(_ == true)
      .map(_ =>
        translationService
          .getTranslation(
            FI,
            "perustelumuistio.peruutusTaiRaukeaminen.syy.eiAPLainMukainenTaiHaettuaAmmattipatevyytta"
          )
      )
    val eiTasoltaanVastaaSuomessaSuoritettavaaTutkintoa = node.eiTasoltaanVastaaSuomessaSuoritettavaaTutkintoa
      .filter(_ == true)
      .map(_ =>
        translationService
          .getTranslation(FI, "perustelumuistio.peruutusTaiRaukeaminen.syy.eiVastaaTasoltaanSuomalaista")
      )
    val epavirallinenKorkeakouluTaiTutkinto = node.epavirallinenKorkeakouluTaiTutkinto
      .filter(_ == true)
      .map(_ =>
        translationService
          .getTranslation(FI, "perustelumuistio.peruutusTaiRaukeaminen.syy.epavirallinenKorkeakouluTaiTutkinto")
      )
    val eiEdellytyksiaRoEikaTasopaatokselle = node.eiEdellytyksiaRoEikaTasopaatokselle
      .filter(_ == true)
      .map(_ =>
        translationService
          .getTranslation(FI, "perustelumuistio.peruutusTaiRaukeaminen.syy.eiEdellytyksiaROTaiTasopaatokselle")
      )
    val eiEdellytyksiaRinnastaaTiettyihinKkOpintoihin = node.eiEdellytyksiaRinnastaaTiettyihinKkOpintoihin
      .filter(_ == true)
      .map(_ =>
        translationService
          .getTranslation(FI, "perustelumuistio.peruutusTaiRaukeaminen.syy.eiEdellytyksiaRinnastukselle")
      )
    val hakijallaJoPaatosSamastaKoulutusKokonaisuudesta = node.hakijallaJoPaatosSamastaKoulutusKokonaisuudesta
      .filter(_ == true)
      .map(_ =>
        translationService
          .getTranslation(
            FI,
            "perustelumuistio.peruutusTaiRaukeaminen.syy.hakijallaOnJoPaatosKoulutuskokonaisuudesta"
          )
      )
    val muuSyy = node.muuSyy
      .filter(_ == true)
      .map(_ => translationService.getTranslation(FI, "perustelumuistio.peruutusTaiRaukeaminen.syy.muu"))

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
      val label = translationService.getTranslation(FI, "perustelumuistio.peruutusTaiRaukeaminen.syy.label")
      Some((label +: result).mkString("\n"))
    } else {
      None
    }
  }

  next
}

def bindExtractPaatosTieto(
  translationService: TranslationService,
  tutkinnot: Seq[Tutkinto]
): (PaatosTieto) => Option[String] = {
  def next(node: PaatosTieto): Option[String] = {
    val paatosTyyppi     = haePaatosTyyppi(translationService, node)
    val sovellettuLaki   = haeSovellettuLaki(translationService, node)
    val tutkinnonNimi    = haeTutkinnonNimi(translationService, node, tutkinnot)
    val myonteinenPaatos = haeMyonteinenTaiKielteinen(translationService, node.myonteinenPaatos)
    val tutkinnonTaso    = haeTutkinnonTaso(translationService, node)

    val result =
      Seq(
        paatosTyyppi,
        sovellettuLaki,
        tutkinnonNimi,
        myonteinenPaatos,
        tutkinnonTaso
      ).flatten.mkString("\n").trim

    if result.nonEmpty then Some(result) else None
  }

  next
}

def bindExtractTutkintoTaiOpinto(
  translationService: TranslationService,
  tutkinnot: Seq[Tutkinto]
): (TutkintoTaiOpinto) => Option[String] = {
  def next(node: TutkintoTaiOpinto): Option[String] = {
    val nimi: Option[String] = node.tutkintoTaiOpinto
      .map(_.split("_"))
      .map(_.last)
    val myonteinenPaatos: Option[String] = haeMyonteinenTaiKielteinen(translationService, node.myonteinenPaatos)

    val result =
      Seq(
        nimi,
        myonteinenPaatos
      ).flatten.mkString("\n").trim

    if result.nonEmpty then Some(result) else None
  }

  next
}

def bindExtractMyonteisenPaatoksenLisavaatimukset(
  translationService: TranslationService,
  tutkinnot: Seq[Tutkinto]
): (MyonteisenPaatoksenLisavaatimukset) => Option[String] = {
  def next(node: MyonteisenPaatoksenLisavaatimukset): Option[String] = {
    val result = Seq(
      Option.when(node.taydentavatOpinnot)(
        translationService.getTranslation(FI, "perustelumuistio.tutkinnonTaiOpinnonLisavaatimukset.taydentavatOpinnot")
      ),
      Option.when(node.kelpoisuuskoe)(
        translationService.getTranslation(FI, "perustelumuistio.tutkinnonTaiOpinnonLisavaatimukset.kelpoisuuskoe")
      ),
      Option.when(node.sopeutumisaika)(
        translationService.getTranslation(FI, "perustelumuistio.tutkinnonTaiOpinnonLisavaatimukset.sopeutumisaika")
      )
    ).flatten

    if (result.nonEmpty) {
      val label =
        translationService.getTranslation(FI, "perustelumuistio.tutkinnonTaiOpinnonLisavaatimukset.label")
      val resultWithTitle = label +: result
      Some(resultWithTitle.mkString("\n"))
    } else {
      None
    }
  }

  next
}

def bindExtractErotKoulutuksessa(
  translationService: TranslationService,
  tutkinnot: Seq[Tutkinto]
): (ErotKoulutuksessa) => Option[String] = {
  def next(node: ErotKoulutuksessa): Option[String] = {
    val nimetytErot = node.erot.map(ero => s"- ${ero.name}: ${toKyllaEi(ero.value)}")

    val muuEro = node.muuEro
      .filter(_ == true)
      .map(_ =>
        val label = translationService
          .getTranslation(FI, "perustelumuistio.kelpoisuudenLisavaatimukset.erotKoulutuksessa.muuLabel")
        s"$label ${node.muuEroKuvaus.getOrElse("")}".trim
      )

    val kaikkiErot = Seq(nimetytErot, muuEro).flatten

    if (kaikkiErot.nonEmpty) {
      val label = translationService.getTranslation(
        FI,
        "perustelumuistio.kelpoisuudenLisavaatimukset.erotKoulutuksessa.label"
      )
      Some(
        (label +: kaikkiErot).mkString("\n")
      )
    } else {
      None
    }
  }

  next
}

def bindExtractKorvaavaToimenpide(
  translationService: TranslationService,
  tutkinnot: Seq[Tutkinto]
): (KorvaavaToimenpide) => Option[String] = {
  def next(node: KorvaavaToimenpide): Option[String] = {
    val kelpoisuuskoe = if (node.kelpoisuuskoe) {
      haeKelpoisuuskoeSisalto(translationService, node.kelpoisuuskoeSisalto)
    } else None
    val sopeutumisaika = if (node.sopeutumisaika) {
      haeSopeutumisaika(translationService, node.sopeutumiusaikaKestoKk)
    } else None
    val yhdistettyKelpoisuuskoe = if (node.kelpoisuuskoeJaSopeutumisaika) {
      haeKelpoisuuskoeSisalto(translationService, node.kelpoisuuskoeJaSopeutumisaikaSisalto)
    } else None
    val yhdistettySopeutumisaika = if (node.kelpoisuuskoeJaSopeutumisaika) {
      haeSopeutumisaika(translationService, node.kelpoisuuskoeJaSopeutumisaikaKestoKk)
    } else None

    val resultList = Seq(
      kelpoisuuskoe,
      sopeutumisaika,
      yhdistettyKelpoisuuskoe,
      yhdistettySopeutumisaika
    ).flatten

    if (resultList.nonEmpty) {
      val label = translationService.getTranslation(FI, "perustelumuistio.korvaavaToimenpide.label")
      Some(
        (label +: resultList).mkString("\n")
      )
    } else {
      None
    }
  }

  next
}

def bindExtractAmmattikomemusJaElinikainenOppiminen(
  translationService: TranslationService,
  tutkinnot: Seq[Tutkinto]
): (AmmattikomemusJaElinikainenOppiminen) => Option[String] = {
  def next(node: AmmattikomemusJaElinikainenOppiminen): Option[String] = {
    val ammattikokemusTaiElinikainenOppiminenValittu = Seq(
      node.ammattikokemus,
      node.elinikainenOppiminen
    ).flatten
      .contains(true)

    if (ammattikokemusTaiElinikainenOppiminenValittu) {
      val ammattikokemus = node.ammattikokemus
        .map(_ =>
          translationService.getTranslation(
            FI,
            "perustelumuistio.kelpoisuudenLisavaatimukset.ammattikokemusJaElinikainenOppiminen.ammattikokemus"
          )
        )

      val elinikainenOppiminen = node.elinikainenOppiminen
        .map(_ =>
          translationService.getTranslation(
            FI,
            "perustelumuistio.kelpoisuudenLisavaatimukset.ammattikokemusJaElinikainenOppiminen.elinikainenOppiminen"
          )
        )

      val lisatieto = node.lisatieto
        .map(value =>
          val label = translationService.getTranslation(
            FI,
            "perustelumuistio.kelpoisuudenLisavaatimukset.ammattikokemusJaElinikainenOppiminen.lisatietoLabel"
          )
          s"$label\n  $value".trim
        )

      val korvaavuus = node.korvaavuus
        .map {
          case AmmattikokemusElinikainenOppiminenKorvaavuus.Taysi =>
            translationService.getTranslation(
              FI,
              "perustelumuistio.kelpoisuudenLisavaatimukset.ammattikokemusJaElinikainenOppiminen.korvaavuus.taysin"
            )
          case AmmattikokemusElinikainenOppiminenKorvaavuus.Osittainen =>
            translationService.getTranslation(
              FI,
              "perustelumuistio.kelpoisuudenLisavaatimukset.ammattikokemusJaElinikainenOppiminen.korvaavuus.osittain"
            )
          case AmmattikokemusElinikainenOppiminenKorvaavuus.Ei =>
            translationService.getTranslation(
              FI,
              "perustelumuistio.kelpoisuudenLisavaatimukset.ammattikokemusJaElinikainenOppiminen.korvaavuus.ei"
            )
        }

      Some(
        Seq(
          ammattikokemus,
          elinikainenOppiminen,
          lisatieto,
          korvaavuus
        ).flatten.mkString("\n")
      )
    } else {
      None
    }
  }

  next
}

def bindExtractKelpoisuudenLisavaatimukset(
  translationService: TranslationService,
  tutkinnot: Seq[Tutkinto]
): (KelpoisuudenLisavaatimukset) => Option[String] = {
  def next(node: KelpoisuudenLisavaatimukset): Option[String] = {
    node.olennaisiaEroja
      .filter(_ == true)
      .map(_ => translationService.getTranslation(FI, "perustelumuistio.kelpoisuudenLisavaatimukset.olennaisiaEroja"))
      .map(content =>
        val label = translationService.getTranslation(FI, "perustelumuistio.kelpoisuudenLisavaatimukset.label")
        Seq(content, label).mkString("\n")
      )
  }

  next
}

def bindExtractKielteisenPaatoksenPerustelut(
  translationService: TranslationService,
  tutkinnot: Seq[Tutkinto]
): (KielteisenPaatoksenPerustelut) => Option[String] = {
  def next(node: KielteisenPaatoksenPerustelut): Option[String] = {
    val epavirallinenKorkeakoulu =
      Option.when(node.epavirallinenKorkeakoulu)(
        translationService.getTranslation(FI, "perustelumuistio.kielteinenPaatos.perustelu.epavirallinenKorkeakoulu")
      )
    val epavirallinenTutkinto =
      Option.when(node.epavirallinenTutkinto)(
        translationService.getTranslation(FI, "perustelumuistio.kielteinenPaatos.perustelu.epavirallinenTutkinto")
      )
    val eiVastaaSuomessaSuoritettavaaTutkintoa =
      Option.when(node.eiVastaaSuomessaSuoritettavaaTutkintoa)(
        translationService.getTranslation(
          FI,
          "perustelumuistio.kielteinenPaatos.perustelu.eiVastaaTasoltaanSuomalaista"
        )
      )
    val muuPerustelu = if (node.muuPerustelu) {
      node.muuPerusteluKuvaus
        .map(kuvaus =>
          val label = translationService.getTranslation(FI, "perustelumuistio.kielteinenPaatos.perustelu.muuLabel")
          s"$label $kuvaus".trim
        )
    } else { None }

    val result = Seq(
      epavirallinenKorkeakoulu,
      epavirallinenTutkinto,
      eiVastaaSuomessaSuoritettavaaTutkintoa,
      muuPerustelu
    ).flatten

    if (result.nonEmpty) {
      val label           = translationService.getTranslation(FI, "perustelumuistio.kielteinenPaatos.perustelu.label")
      val resultWithTitle = label +: result
      Some(resultWithTitle.mkString("\n"))
    } else {
      None
    }
  }

  next
}

def bindExtractKelpoisuus(
  translationService: TranslationService,
  tutkinnot: Seq[Tutkinto]
): (Kelpoisuus) => Option[String] = {
  def next(node: Kelpoisuus): Option[String] = {
    val nimi: Option[String] = node.kelpoisuus
      .map(_.split("_"))
      .map(_.last)
    val opetettavaAine: Option[String]                        = node.opetettavaAine
    val direktiiviTaso: Option[String]                        = node.direktiivitaso.map(_.toString)
    val direktiivitasoLisatiedot: Option[String]              = node.direktiivitasoLisatiedot
    val kansallisestiVaadittavaDirektiivitaso: Option[String] =
      node.kansallisestiVaadittavaDirektiivitaso.map(_.toString)
    val myonteinenPaatos: Option[String] = haeMyonteinenTaiKielteinen(translationService, node.myonteinenPaatos)

    val result =
      Seq(
        nimi,
        opetettavaAine,
        direktiiviTaso,
        direktiivitasoLisatiedot,
        kansallisestiVaadittavaDirektiivitaso,
        myonteinenPaatos
      ).flatten.mkString("\n").trim

    if result.nonEmpty then Some(result) else None
  }

  next
}

/* ------- */

def haeRatkaisutyyppi(translationService: TranslationService, paatos: Paatos): Option[String] = {
  paatos.ratkaisutyyppi
    .map {
      case Ratkaisutyyppi.Paatos =>
        translationService.getTranslation(FI, "perustelumuistio.ratkaisutyyppi.paatos")
      case Ratkaisutyyppi.PeruutusTaiRaukeaminen =>
        translationService.getTranslation(FI, "perustelumuistio.ratkaisutyyppi.peruutusTaiRaukeaminen")
      case Ratkaisutyyppi.Oikaisu =>
        translationService.getTranslation(FI, "perustelumuistio.ratkaisutyyppi.oikaisu")
      case Ratkaisutyyppi.JatetaanTutkimatta =>
        translationService.getTranslation(FI, "perustelumuistio.ratkaisutyyppi.jatetaanTutkimatta")
      case Ratkaisutyyppi.Siirto =>
        translationService.getTranslation(FI, "perustelumuistio.ratkaisutyyppi.siirto")
    }
}

def haePaatosTyyppi(translationService: TranslationService, paatosTiedot: PaatosTieto): Option[String] = {
  paatosTiedot.paatosTyyppi
    .map {
      case PaatosTyyppi.Taso =>
        translationService.getTranslation(FI, "perustelumuistio.paatostyyppi.taso")
      case PaatosTyyppi.Kelpoisuus =>
        translationService.getTranslation(FI, "perustelumuistio.paatostyyppi.kelpoisuus")
      case PaatosTyyppi.TiettyTutkintoTaiOpinnot =>
        translationService.getTranslation(FI, "perustelumuistio.paatostyyppi.tiettyTutkintoTaiOpinnot")
      case PaatosTyyppi.RiittavatOpinnot =>
        translationService.getTranslation(FI, "perustelumuistio.paatostyyppi.riittavatOpinnot")
      case PaatosTyyppi.LopullinenPaatos =>
        translationService.getTranslation(FI, "perustelumuistio.paatostyyppi.lopullinenPaatos")
    }
}

def haeSovellettuLaki(translationService: TranslationService, paatosTiedot: PaatosTieto): Option[String] = {
  paatosTiedot.sovellettuLaki
    .map {
      case SovellettuLaki.uo =>
        translationService.getTranslation(FI, "perustelumuistio.sovellettuLaki.uo")
      case SovellettuLaki.ap =>
        translationService.getTranslation(FI, "perustelumuistio.sovellettuLaki.ap")
      case SovellettuLaki.ap_seut =>
        translationService.getTranslation(FI, "perustelumuistio.sovellettuLaki.apSeut")
      case SovellettuLaki.ro =>
        translationService.getTranslation(FI, "perustelumuistio.sovellettuLaki.ro")
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
      val label = translationService.getTranslation(FI, "perustelumuistio.tutkinnonNimi.label")
      s"$label $muotoiltu".trim
    )
}

def haeMyonteinenTaiKielteinen(
  translationService: TranslationService,
  myonteinenPaatosMaybe: Option[Boolean]
): Option[String] = {
  myonteinenPaatosMaybe
    .map(toKyllaEi)
    .map(muotoiltu =>
      val label = translationService.getTranslation(FI, "perustelumuistio.myonteinenTaiKielteinen.label")
      s"$label $muotoiltu".trim
    )
}

def haeTutkinnonTaso(translationService: TranslationService, paatostiedot: PaatosTieto): Option[String] = {
  paatostiedot.tutkintoTaso
    .map {
      case TutkintoTaso.AlempiKorkeakoulu =>
        translationService.getTranslation(FI, "perustelumuistio.tutkinnonTaso.alempiKorkeakoulu")
      case TutkintoTaso.YlempiKorkeakoulu =>
        translationService.getTranslation(FI, "perustelumuistio.tutkinnonTaso.ylempiKorkeakoulu")
    }
}

def haeSopeutumisaika(
  translationService: TranslationService,
  kestoMaybe: Option[String]
): Option[String] = {
  val label = translationService.getTranslation(FI, "perustelumuistio.sopeutumisajanKesto.label")
  kestoMaybe.map(kesto => s"$label $kesto".trim)
}

def haeKelpoisuuskoeSisalto(
  translationService: TranslationService,
  sisaltoMaybe: Option[KelpoisuuskoeSisalto]
): Option[String] = {
  sisaltoMaybe.flatMap(sisalto => {
    val result = Seq(
      Option.when(sisalto.aihealue1)(
        translationService.getTranslation(FI, "perustelumuistio.kelpoisuuskoe.sisalto.aihealue1")
      ),
      Option.when(sisalto.aihealue2)(
        translationService.getTranslation(FI, "perustelumuistio.kelpoisuuskoe.sisalto.aihealue2")
      ),
      Option.when(sisalto.aihealue3)(
        translationService.getTranslation(FI, "perustelumuistio.kelpoisuuskoe.sisalto.aihealue3")
      )
    ).flatten

    if (result.nonEmpty) {
      val label = translationService.getTranslation(FI, "perustelumuistio.kelpoisuuskoe.label")
      Some(
        (label +: result).mkString("\n")
      )
    } else {
      None
    }
  })
}
