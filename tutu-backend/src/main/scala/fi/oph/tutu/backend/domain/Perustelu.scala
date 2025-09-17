package fi.oph.tutu.backend.domain

import java.time.LocalDateTime
import java.util.UUID

case class Perustelu(
  id: Option[UUID] = None,
  hakemusId: Option[UUID] = None,
  virallinenTutkinnonMyontaja: Option[Boolean] = None,
  virallinenTutkinto: Option[Boolean] = None,
  lahdeLahtomaanKansallinenLahde: Boolean = false,
  lahdeLahtomaanVirallinenVastaus: Boolean = false,
  lahdeKansainvalinenHakuteosTaiVerkkosivusto: Boolean = false,
  selvitysTutkinnonMyontajastaJaTutkinnonVirallisuudesta: String = "",
  ylimmanTutkinnonAsemaLahtomaanJarjestelmassa: Option[String] = None,
  selvitysTutkinnonAsemastaLahtomaanJarjestelmassa: String = "",
  aikaisemmatPaatokset: Option[Boolean] = None,
  jatkoOpintoKelpoisuus: Option[String] = None,
  jatkoOpintoKelpoisuusLisatieto: Option[String] = None,
  luotu: Option[LocalDateTime] = None,
  luoja: Option[String] = None,
  muokattu: Option[LocalDateTime] = None,
  muokkaaja: Option[String] = None,
  lausuntotieto: Option[Lausuntotieto] = None,
  perusteluUoRo: Option[PerusteluUoRo] = None
) {
  def mergeWith(partial: PartialPerustelu): Perustelu =
    this.copy(
      virallinenTutkinnonMyontaja = partial.virallinenTutkinnonMyontaja.orElse(this.virallinenTutkinnonMyontaja),
      virallinenTutkinto = partial.virallinenTutkinto.orElse(this.virallinenTutkinto),
      lahdeLahtomaanKansallinenLahde =
        partial.lahdeLahtomaanKansallinenLahde.getOrElse(this.lahdeLahtomaanKansallinenLahde),
      lahdeLahtomaanVirallinenVastaus =
        partial.lahdeLahtomaanVirallinenVastaus.getOrElse(this.lahdeLahtomaanVirallinenVastaus),
      lahdeKansainvalinenHakuteosTaiVerkkosivusto =
        partial.lahdeKansainvalinenHakuteosTaiVerkkosivusto.getOrElse(this.lahdeKansainvalinenHakuteosTaiVerkkosivusto),
      selvitysTutkinnonMyontajastaJaTutkinnonVirallisuudesta =
        partial.selvitysTutkinnonMyontajastaJaTutkinnonVirallisuudesta
          .getOrElse(this.selvitysTutkinnonMyontajastaJaTutkinnonVirallisuudesta),
      ylimmanTutkinnonAsemaLahtomaanJarjestelmassa =
        partial.ylimmanTutkinnonAsemaLahtomaanJarjestelmassa.orElse(this.ylimmanTutkinnonAsemaLahtomaanJarjestelmassa),
      selvitysTutkinnonAsemastaLahtomaanJarjestelmassa = partial.selvitysTutkinnonAsemastaLahtomaanJarjestelmassa
        .getOrElse(this.selvitysTutkinnonAsemastaLahtomaanJarjestelmassa),
      aikaisemmatPaatokset = partial.aikaisemmatPaatokset
        .orElse(this.aikaisemmatPaatokset),
      jatkoOpintoKelpoisuus = partial.jatkoOpintoKelpoisuus
        .orElse(this.jatkoOpintoKelpoisuus),
      jatkoOpintoKelpoisuusLisatieto = partial.jatkoOpintoKelpoisuusLisatieto
        .orElse(this.jatkoOpintoKelpoisuusLisatieto)
    )
}

case class PartialPerustelu(
  virallinenTutkinnonMyontaja: Option[Boolean] = None,
  virallinenTutkinto: Option[Boolean] = None,
  lahdeLahtomaanKansallinenLahde: Option[Boolean] = None,
  lahdeLahtomaanVirallinenVastaus: Option[Boolean] = None,
  lahdeKansainvalinenHakuteosTaiVerkkosivusto: Option[Boolean] = None,
  selvitysTutkinnonMyontajastaJaTutkinnonVirallisuudesta: Option[String] = None,
  ylimmanTutkinnonAsemaLahtomaanJarjestelmassa: Option[String] = None,
  selvitysTutkinnonAsemastaLahtomaanJarjestelmassa: Option[String] = None,
  lausuntotieto: Option[PartialLausuntotieto] = None,
  perusteluUoRo: Option[PartialPerusteluUoRo] = None,
  aikaisemmatPaatokset: Option[Boolean] = None,
  jatkoOpintoKelpoisuus: Option[String] = None,
  jatkoOpintoKelpoisuusLisatieto: Option[String] = None
) {
  def topLevelFieldsModified(): Boolean =
    Seq(
      virallinenTutkinnonMyontaja,
      virallinenTutkinto,
      lahdeLahtomaanKansallinenLahde,
      lahdeLahtomaanVirallinenVastaus,
      lahdeKansainvalinenHakuteosTaiVerkkosivusto,
      selvitysTutkinnonMyontajastaJaTutkinnonVirallisuudesta,
      ylimmanTutkinnonAsemaLahtomaanJarjestelmassa,
      selvitysTutkinnonAsemastaLahtomaanJarjestelmassa,
      aikaisemmatPaatokset,
      jatkoOpintoKelpoisuus,
      jatkoOpintoKelpoisuusLisatieto
    ).exists(_.isDefined)
}

case class PerusteluUoRo(
  id: Option[UUID] = None,
  perusteluId: Option[UUID] = null,
  perustelunSisalto: PerusteluUoRoSisalto = PerusteluUoRoSisalto(),
  luotu: Option[LocalDateTime] = None,
  luoja: Option[String] = None,
  muokattu: Option[LocalDateTime] = None,
  muokkaaja: Option[String] = None
) {
  def mergeWith(partial: PartialPerusteluUoRo): PerusteluUoRo = {
    this.copy(
      perustelunSisalto = partial.perustelunSisalto.getOrElse(this.perustelunSisalto)
    )
  }
}

case class PartialPerusteluUoRo(
  perusteluId: UUID,
  perustelunSisalto: Option[PerusteluUoRoSisalto] = None
)

case class PerusteluUoRoSisalto(
  opettajatEroMonialaisetOpinnotSisalto: Option[Boolean] = None,
  opettajatEroMonialaisetOpinnotLaajuus: Option[Boolean] = None,
  opettajatEroPedagogisetOpinnotSisalto: Option[Boolean] = None,
  opettajatEroPedagogisetOpinnotLaajuus: Option[Boolean] = None,
  opettajatEroKasvatustieteellisetOpinnotSisalto: Option[Boolean] = None,
  opettajatEroKasvatustieteellisetOpinnotVaativuus: Option[Boolean] = None,
  opettajatEroKasvatustieteellisetOpinnotLaajuus: Option[Boolean] = None,
  opettajatEroOpetettavatAineetOpinnotSisalto: Option[Boolean] = None,
  opettajatEroOpetettavatAineetOpinnotVaativuus: Option[Boolean] = None,
  opettajatEroOpetettavatAineetOpinnotLaajuus: Option[Boolean] = None,
  opettajatEroErityisopettajanOpinnotSisalto: Option[Boolean] = None,
  opettajatEroErityisopettajanOpinnotLaajuus: Option[Boolean] = None,
  opettajatMuuEro: Option[Boolean] = None,
  opettajatMuuEroSelite: Option[String] = None,
  vkOpettajatEroKasvatustieteellisetOpinnotSisalto: Option[Boolean] = None,
  vkOpettajatEroKasvatustieteellisetOpinnotLaajuus: Option[Boolean] = None,
  vkOpettajatEroVarhaiskasvatusEsiopetusOpinnotSisalto: Option[Boolean] = None,
  vkOpettajatEroVarhaiskasvatusEsiopetusOpinnotLaajuus: Option[Boolean] = None,
  vkOpettajatMuuEro: Option[Boolean] = None,
  vkOpettajatMuuEroSelite: Option[String] = None,
  otmEroOpinnotSisalto: Option[Boolean] = None,
  otmEroOpinnotVaativuus: Option[Boolean] = None,
  otmEroOpinnotLaajuus: Option[Boolean] = None,
  otmMuuEro: Option[Boolean] = None,
  otmMuuEroSelite: Option[String] = None,
  sovellettuOpettajanPedagogisetOpinnot: SovellettuTilanne = SovellettuTilanne(),
  sovellettuOpetettavanAineenOpinnot: SovellettuTilanneOpetettavatAineet = SovellettuTilanneOpetettavatAineet(),
  sovellettuMonialaisetOpinnot: SovellettuTilanne = SovellettuTilanne(),
  sovellettuErityisopetus: SovellettuTilanne = SovellettuTilanne(),
  sovellettuVarhaiskasvatus: SovellettuTilanne = SovellettuTilanne(),
  sovellettuRinnastaminenKasvatustieteelliseenTutkintoon: SovellettuTilanne = SovellettuTilanne(),
  sovellettuRiittavatOpinnot: SovellettuTilanne = SovellettuTilanne(),
  sovellettuRinnastaminenOtmTutkintoon: SovellettuTilanne = SovellettuTilanne(),
  sovellettuLuokanopettaja: SovellettuTilanne = SovellettuTilanne(),
  sovellettuMuuTilanne: Option[Boolean] = None,
  sovellettuMuuTilanneSelite: Option[String] = None
)

case class Aine(
  aine: String,
  value: String
)

case class KieliAine(
  aine: String,
  values: Seq[String]
)

case class SovellettuTilanneOpetettavatAineet(
  checked: Option[Boolean] = None,
  kieliAine: Option[KieliAine] = None,
  aineet: Option[Seq[Aine]] = None
)

case class SovellettuTilanne(
  checked: Option[Boolean] = None,
  value: Option[String] = None
)

case class Lausuntotieto(
  id: Option[UUID] = None,
  perusteluId: Option[UUID] = None,
  pyyntojenLisatiedot: Option[String] = None,
  sisalto: Option[String] = None,
  lausuntopyynnot: Seq[Lausuntopyynto] = Seq.empty
) {
  def mergeWith(partial: PartialLausuntotieto): Lausuntotieto = {
    this.copy(
      pyyntojenLisatiedot = partial.pyyntojenLisatiedot.orElse(this.pyyntojenLisatiedot),
      sisalto = partial.sisalto.orElse(this.sisalto)
    )
  }
}

case class PartialLausuntotieto(
  pyyntojenLisatiedot: Option[String] = None,
  sisalto: Option[String] = None,
  lausuntopyynnot: Option[Seq[Lausuntopyynto]] = None
)

case class Lausuntopyynto(
  id: Option[UUID] = None,
  lausuntotietoId: Option[UUID] = None,
  lausunnonAntaja: Option[String] = None,
  lahetetty: Option[LocalDateTime] = None,
  saapunut: Option[LocalDateTime] = None
)

case class LausuntopyyntoModifyData(
  uudet: Seq[Lausuntopyynto] = Seq.empty,
  muutetut: Seq[Lausuntopyynto] = Seq.empty,
  poistetut: Seq[UUID] = Seq.empty
)
