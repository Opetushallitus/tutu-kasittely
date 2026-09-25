package fi.oph.tutu.backend.service.generator.perustelumuistio

import fi.oph.tutu.backend.domain.*
import fi.oph.tutu.backend.service.TranslationService

private val FI = Kieli.fi

///////////////////////////////////////////////////////////////////////////////
// Käytetään pääosin samoja funktioita kuin haePaatostiedot.scala -tiedostossa.
// Korvataan tarvittavat funktiot UO/RO-kohtaisilla funktioilla.

def bindHaePaatostiedotAP(
  translationService: TranslationService,
  tutkinnot: Seq[Tutkinto]
): Option[Paatos] => Option[String] = {
  val extractPaatosTieto = bindExtractPaatosTieto(translationService, tutkinnot)
  val extractMyonteisenPaatoksenLisavaatimukset =
    bindExtractMyonteisenPaatoksenLisavaatimukset(translationService, tutkinnot)
  val extractErotKoulutuksessa                    = bindExtractErotKoulutuksessa(translationService, tutkinnot)
  val extractKorvaavaToimenpide                   = bindExtractKorvaavaToimenpide(translationService, tutkinnot)
  val extractAmmattikokemusJaElinikainenOppiminen =
    bindExtractAmmattikokemusJaElinikainenOppiminen(translationService, tutkinnot)
  val extractKelpoisuudenLisavaatimukset   = bindExtractKelpoisuudenLisavaatimukset(translationService, tutkinnot)
  val extractKielteisenPaatoksenPerustelut = bindExtractKielteisenPaatoksenPerustelut(translationService, tutkinnot)
  val extractKelpoisuus                    = bindExtractKelpoisuus(translationService, tutkinnot)

  def extractNext(node: PaatosNodeType): Option[String] = {
    node match {
      case node: Paatos                               => None
      case node: PeruutuksenTaiRaukeamisenSyy         => None
      case node: PaatosTieto                          => extractPaatosTieto(node)
      case node: TutkintoTaiOpinto                    => None
      case node: MyonteisenPaatoksenLisavaatimukset   => extractMyonteisenPaatoksenLisavaatimukset(node)
      case node: ErotKoulutuksessa                    => extractErotKoulutuksessa(node)
      case node: KorvaavaToimenpide                   => extractKorvaavaToimenpide(node)
      case node: AmmattikokemusJaElinikainenOppiminen => extractAmmattikokemusJaElinikainenOppiminen(node)
      case node: KelpoisuudenLisavaatimukset          => extractKelpoisuudenLisavaatimukset(node)
      case node: KielteisenPaatoksenPerustelut        => extractKielteisenPaatoksenPerustelut(node)
      case node: Kelpoisuus                           => extractKelpoisuus(node)
      case _                                          => None
    }
  }

  val haePerustelutAPPaatostiedoille = bindTraverse(extractNext, expandAP, combine)

  def haePerustelutAP(paatosMaybe: Option[Paatos]): Option[String] = {
    val result = paatosMaybe
      .map(_.paatosTiedot)
      .map(
        _.filter(paatosTieto => paatosTieto.sovellettuLaki.contains(SovellettuLaki.ap))
      )
      .flatMap(haePerustelutAPPaatostiedoille)
      .mkString("\n")
    Option.when(result.nonEmpty)(result)
  }

  haePerustelutAP
}

def expandAP(node: PaatosNodeType): Seq[PaatosNodeTypeAggregate] = {
  node match {
    case node: KelpoisuudenLisavaatimukset => expandKelpoisuudenLisavaatimuksetAP(node)
    case _                                 => expand(node)
  }
}

def expandKelpoisuudenLisavaatimuksetAP(
  node: KelpoisuudenLisavaatimukset
): Seq[PaatosNodeTypeAggregate] = {
  Seq(
    TitleNode(
      titleKey = Some("perustelumuistio.ammattikokemusJaElinikainenOppiminen.lahtokohtaisetKorvaavatToimenpiteet"),
      child = Seq(
        node.korvaavaToimenpide,
        // node.ammattikokemusJaElinikainenOppiminen,
      ).flatten
    )
  )
}
