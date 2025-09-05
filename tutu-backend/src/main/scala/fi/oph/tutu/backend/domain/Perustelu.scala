package fi.oph.tutu.backend.domain

import java.time.LocalDateTime
import java.util.UUID

case class Perustelu(
  id: UUID = null,
  hakemusId: UUID = null,
  virallinenTutkinnonMyontaja: Option[Boolean] = None,
  virallinenTutkinto: Option[Boolean] = None,
  lahdeLahtomaanKansallinenLahde: Boolean = false,
  lahdeLahtomaanVirallinenVastaus: Boolean = false,
  lahdeKansainvalinenHakuteosTaiVerkkosivusto: Boolean = false,
  selvitysTutkinnonMyontajastaJaTutkinnonVirallisuudesta: String = "",
  ylimmanTutkinnonAsemaLahtomaanJarjestelmassa: Option[String] = None,
  selvitysTutkinnonAsemastaLahtomaanJarjestelmassa: String = "",
  luotu: LocalDateTime = null,
  luoja: String = null,
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
        .getOrElse(this.selvitysTutkinnonAsemastaLahtomaanJarjestelmassa)
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
  perusteluUoRo: Option[PartialPerusteluUoRo] = None
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
      selvitysTutkinnonAsemastaLahtomaanJarjestelmassa
    ).exists(_.isDefined)
}

case class PerusteluUoRo(
  id: UUID = null,
  perusteluId: UUID = null,
  perustelunSisalto: PerusteluUoRoSisalto = PerusteluUoRoSisalto(),
  luotu: LocalDateTime = null,
  luoja: String = null,
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
  perustelunSisalto: Option[PerusteluUoRoSisalto] = None
)

case class PerusteluUoRoSisalto(
  opettajatEroMonialaisetOpinnotSisalto: Boolean = false,
  opettajatEroMonialaisetOpinnotLaajuus: Boolean = false,
  opettajatEroPedagogisetOpinnotSisalto: Boolean = false,
  opettajatEroPedagogisetOpinnotLaajuus: Boolean = false,
  opettajatEroKasvatustieteellisetOpinnotSisalto: Boolean = false,
  opettajatEroKasvatustieteellisetOpinnotVaativuus: Boolean = false,
  opettajatEroKasvatustieteellisetOpinnotLaajuus: Boolean = false,
  opettajatEroOpetettavatAineetOpinnotSisalto: Boolean = false,
  opettajatEroOpetettavatAineetOpinnotVaativuus: Boolean = false,
  opettajatEroOpetettavatAineetOpinnotLaajuus: Boolean = false,
  opettajatEroErityisopettajanOpinnotSisalto: Boolean = false,
  opettajatEroErityisopettajanOpinnotLaajuus: Boolean = false,
  opettajatMuuEro: Boolean = false,
  opettajatMuuEroSelite: Option[String] = None,
  vkOpettajatEroKasvatustieteellisetOpinnotSisalto: Boolean = false,
  vkOpettajatEroKasvatustieteellisetOpinnotLaajuus: Boolean = false,
  vkOpettajatEroVarhaiskasvatusEsiopetusOpinnotSisalto: Boolean = false,
  vkOpettajatEroVarhaiskasvatusEsiopetusOpinnotLaajuus: Boolean = false,
  vkOpettajatMuuEro: Boolean = false,
  vkOpettajatMuuEroSelite: Option[String] = None,
  otmEroOpinnotSisalto: Boolean = false,
  otmEroOpinnotVaativuus: Boolean = false,
  otmEroOpinnotLaajuus: Boolean = false,
  otmMuuEro: Boolean = false,
  otmMuuEroSelite: Option[String] = None,
  sovellettuOpettajanPedagogisetOpinnot: Boolean = false,
  sovellettuOpetettavanAineenOpinnot: Boolean = false,
  sovellettuMonialaisetOpinnot: Boolean = false,
  sovellettuErityisopetus: Boolean = false,
  sovellettuVarhaiskasvatus: Boolean = false,
  sovellettuRinnastaminenKasvatustieteelliseenTutkintoon: Boolean = false,
  sovellettuRiittavatOpinnot: Boolean = false,
  sovellettuRinnastaminenOtmTutkintoon: Boolean = false,
  sovellettuLuokanopettaja: Boolean = false,
  sovellettuMuuTilanne: Boolean = false,
  sovellettuMuuTilanneSelite: Option[String] = None
)

case class Lausuntotieto(
  id: UUID = null,
  perusteluId: UUID = null,
  pyyntojenLisatiedot: Option[String] = None,
  sisalto: Option[String] = None,
  luotu: LocalDateTime = null,
  luoja: String = null,
  muokattu: Option[LocalDateTime] = None,
  muokkaaja: Option[String] = None,
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
  id: UUID = null,
  lausuntotietoId: UUID = null,
  lausunnonAntaja: Option[String] = None,
  lahetetty: Option[LocalDateTime] = None,
  saapunut: Option[LocalDateTime] = None,
  luotu: LocalDateTime = null,
  luoja: String = null,
  muokattu: Option[LocalDateTime] = None,
  muokkaaja: Option[String] = None
)

case class LausuntopyyntoModifyData(
  uudet: Seq[Lausuntopyynto] = Seq.empty,
  muutetut: Seq[Lausuntopyynto] = Seq.empty,
  poistetut: Seq[UUID] = Seq.empty
)
