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
  perusteluUoRo: Option[PerusteluUoRo] = None
)

case class PerusteluUoRo(
  id: UUID,
  perusteluId: UUID,
  perustelunSisalto: PerusteluUoRoSisalto,
  luotu: LocalDateTime,
  luoja: String,
  muokattu: Option[LocalDateTime] = None,
  muokkaaja: Option[String] = None
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
