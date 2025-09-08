export type PerusteluUoRo = {
  id?: string;
  perusteluId: string;
  perustelunSisalto: PerusteluUoRoSisalto;
  luotu?: string;
  luoja?: string;
  muokattu?: string;
  muokkaaja?: string;
};

export type SovellettuTilanne = {
  checked?: boolean;
  value?: string | null;
};

export type PerusteluUoRoSisalto = {
  opettajatEroMonialaisetOpinnotSisalto?: boolean;
  opettajatEroMonialaisetOpinnotLaajuus?: boolean;
  opettajatEroPedagogisetOpinnotSisalto?: boolean;
  opettajatEroPedagogisetOpinnotLaajuus?: boolean;
  opettajatEroKasvatustieteellisetOpinnotSisalto?: boolean;
  opettajatEroKasvatustieteellisetOpinnotVaativuus?: boolean;
  opettajatEroKasvatustieteellisetOpinnotLaajuus?: boolean;
  opettajatEroOpetettavatAineetOpinnotSisalto?: boolean;
  opettajatEroOpetettavatAineetOpinnotVaativuus?: boolean;
  opettajatEroOpetettavatAineetOpinnotLaajuus?: boolean;
  opettajatEroErityisopettajanOpinnotSisalto?: boolean;
  opettajatEroErityisopettajanOpinnotLaajuus?: boolean;
  opettajatMuuEro?: boolean;
  opettajatMuuEroSelite?: string;
  vkOpettajatEroKasvatustieteellisetOpinnotSisalto?: boolean;
  vkOpettajatEroKasvatustieteellisetOpinnotLaajuus?: boolean;
  vkOpettajatEroVarhaiskasvatusEsiopetusOpinnotSisalto?: boolean;
  vkOpettajatEroVarhaiskasvatusEsiopetusOpinnotLaajuus?: boolean;
  vkOpettajatMuuEro?: boolean;
  vkOpettajatMuuEroSelite?: string;
  otmEroOpinnotSisalto?: boolean;
  otmEroOpinnotVaativuus?: boolean;
  otmEroOpinnotLaajuus?: boolean;
  otmMuuEro?: boolean;
  otmMuuEroSelite?: string;

  sovellettuOpettajanPedagogisetOpinnot?: SovellettuTilanne;
  // TODO: sovellettuAineOption
  sovellettuOpetettavanAineenOpinnot?: boolean;
  sovellettuMonialaisetOpinnot?: SovellettuTilanne;
  sovellettuErityisopetus?: SovellettuTilanne;
  sovellettuVarhaiskasvatus?: SovellettuTilanne;
  sovellettuRinnastaminenKasvatustieteelliseenTutkintoon?: SovellettuTilanne;
  sovellettuRiittavatOpinnot?: SovellettuTilanne;
  sovellettuRinnastaminenOtmTutkintoon?: SovellettuTilanne;
  sovellettuLuokanopettaja?: SovellettuTilanne;
  sovellettuMuuTilanne?: boolean;
  sovellettuMuuTilanneSelite?: string;
};
