package fi.oph.tutu.backend.service.generator.perustelumuistio

import fi.oph.tutu.backend.domain.*
import fi.oph.tutu.backend.service.TranslationService
import fi.oph.tutu.backend.service.generator.toKyllaEi

private val FI = Kieli.fi

///////////////////////////////////////////////////////////////////////////////
// Käytetään pääosin samoja funktioita kuin haePaatostiedot.scala -tiedostossa.
// Korvataan tarvittavat funktiot UO/RO-kohtaisilla funktioilla.

def bindHaePaatostiedotUORO(
  translationService: TranslationService,
  tutkinnot: Seq[Tutkinto]
): (Option[Paatos] => Option[String]) = {
  val getListLabel = bindGetListLabel(translationService)

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
      case node: Paatos                               => noExtract(node)
      case node: PeruutuksenTaiRaukeamisenSyy         => noExtract(node)
      case node: PaatosTieto                          => noExtract(node)
      case node: TutkintoTaiOpinto                    => noExtract(node)
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

  def haePaatosGetListLabel = applyOrDefault(
    poistaKielteisenPaatoksenPerustelut,
    getListLabel,
    None
  )

  val heaPerustelutUOROPaatostiedoille = bindTraverse(haePaatostiedotExtract, expand, combine, haePaatosGetListLabel)

  def heaPerustelutUORO(paatosMaybe: Option[Paatos]): Option[String] = {
    val result = paatosMaybe
      .map(_.paatosTiedot)
      .map(
        _.filter(paatosTieto =>
          paatosTieto.sovellettuLaki.contains(SovellettuLaki.uo) || paatosTieto.sovellettuLaki.contains(
            SovellettuLaki.ro
          )
        )
      )
      .map(heaPerustelutUOROPaatostiedoille)
      .flatten
      .mkString("\n")
    Option.when(result.nonEmpty)(result)
  }

  heaPerustelutUORO
}

def expandMyonteisenPaatoksenLisavaatimuksetUORO(
  node: MyonteisenPaatoksenLisavaatimukset
): Seq[PaatosNodeTypeAggregate] = {
  Seq(
    TitleNode(
      titleKey = Some("perustelumuistio.tutkinnonTaiOpinnonLisavaatimukset.lahtokohtaisetOsaamisenTaydentamisenTavat"),
      child = node.lahtokohtaisetOsaamisenTaydentamisenTavat
    )
  )
}
