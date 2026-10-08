import { TAYSI_AMMATTIKOKEMUS_OPTIONS } from '@/src/app/hakemus/paatostiedot/constants';
import {
  emptyErotKoulutuksessa,
  initOrUpdateKorvaavaToimenpide,
  shouldShowKorvaavaToimenpide,
} from '@/src/app/hakemus/paatostiedot/paatostietoUtils';
import { KelpoisuudenLisavaatimukset } from '@/src/lib/types/paatos';

export const getSovellettuTilanneOptions = (
  kelpoisuusKey?: string,
): Array<string> | undefined => {
  switch (kelpoisuusKey) {
    case 'Opetusalan ammatit_Luokanopettaja_uo':
      return [
        'pedagogiset1_ja_monialaiset1',
        'pedagogiset1_ja_monialaiset2',
        'pedagogiset1_ja_monialaiset3',
        'pedagogiset2_ja_monialaiset1',
        'pedagogiset2_ja_monialaiset2',
        'pedagogiset2_ja_monialaiset3',
        'pedagogiset3_ja_monialaiset1',
        'pedagogiset3_ja_monialaiset2',
        'pedagogiset3_ja_monialaiset3',
      ];
    case 'Opetusalan ammatit_Aineenopettaja perusopetuksessa_uo':
      return [
        'pedagogiset1_ja_aine1',
        'pedagogiset1_ja_aine2',
        'pedagogiset1_ja_aine3',
        'pedagogiset2_ja_aine1',
        'pedagogiset2_ja_aine2',
        'pedagogiset2_ja_aine3',
        'pedagogiset3_ja_aine1',
        'pedagogiset3_ja_aine2',
        'pedagogiset3_ja_aine3',
      ];
    case 'Opetusalan ammatit_Aineenopettaja lukiossa_uo':
      return [
        'pedagogiset1_ja_aine1/aine4',
        'pedagogiset1_ja_aine2',
        'pedagogiset1_ja_aine3',
        'pedagogiset1_ja_aine5',
        'pedagogiset1_ja_aine6',
        'pedagogiset2_ja_aine1/aine4',
        'pedagogiset2_ja_aine2',
        'pedagogiset2_ja_aine3',
        'pedagogiset2_ja_aine5',
        'pedagogiset2_ja_aine6',
        'pedagogiset3_ja_aine1/aine4',
        'pedagogiset3_ja_aine2',
        'pedagogiset3_ja_aine3',
        'pedagogiset3_ja_aine5',
        'pedagogiset3_ja_aine6',
      ];
    default:
      return undefined;
  }
};

export const shouldShowKelpoisuusKorvaavaToimenpide = (
  lisavaatimukset?: KelpoisuudenLisavaatimukset | null,
) => {
  return (
    shouldShowKorvaavaToimenpide(
      lisavaatimukset?.ammattikokemuksenHuomioiminen,
      lisavaatimukset?.suomessaSuoritettujenOpintojenHuomioiminen,
    ) && !lisavaatimukset?.ammattikokemusJaOpinnotYhdessaKorvaavatKokonaan
  );
};

export const shouldShowEiEdellytetaOsaamisenTaydentamista = (
  lisavaatimukset?: KelpoisuudenLisavaatimukset | null,
) => {
  return (
    (!!lisavaatimukset?.ammattikokemuksenHuomioiminen &&
      TAYSI_AMMATTIKOKEMUS_OPTIONS.includes(
        lisavaatimukset.ammattikokemuksenHuomioiminen,
      )) ||
    lisavaatimukset?.suomessaSuoritettujenOpintojenHuomioiminen ===
      'KorvaavatKokonaan' ||
    !!lisavaatimukset?.ammattikokemusJaOpinnotYhdessaKorvaavatKokonaan
  );
};

export const shouldShowKaytetaanLahtokohtaisiaOsaamisenTaydentamisenTapoja = (
  lisavaatimukset?: KelpoisuudenLisavaatimukset | null,
) => {
  return (
    lisavaatimukset?.ammattikokemuksenHuomioiminen === 'EiHuomioida' &&
    lisavaatimukset?.suomessaSuoritettujenOpintojenHuomioiminen ===
      'EiHuomioida' &&
    !shouldShowEiEdellytetaOsaamisenTaydentamista(lisavaatimukset)
  );
};

export const initOrUpdateMyonteinenKelpoisuusPaatosUO = (
  currentKelpoisuudenLisavaatimukset: KelpoisuudenLisavaatimukset,
  updatedKelpoisuudenLisavaatimukset: Partial<KelpoisuudenLisavaatimukset>,
  kelpoisuusKey?: string,
): KelpoisuudenLisavaatimukset => {
  const tobe = {
    ...currentKelpoisuudenLisavaatimukset,
    ...updatedKelpoisuudenLisavaatimukset,
  };
  tobe.erotKoulutuksessa =
    tobe.erotKoulutuksessa ?? emptyErotKoulutuksessa(kelpoisuusKey);

  tobe.korvaavaToimenpide = shouldShowKelpoisuusKorvaavaToimenpide(tobe)
    ? initOrUpdateKorvaavaToimenpide(tobe.korvaavaToimenpide)
    : null;
  if (!tobe.ammattikokemusJaOpinnotYhdessaKorvaavatKokonaan) {
    tobe.ammattikokemusJaOpinnotYhdessaTasmennys = null;
  }
  tobe.lahtokohtaisetOsaamisenTaydentamisenTavat =
    initOrUpdateKorvaavaToimenpide(
      tobe.lahtokohtaisetOsaamisenTaydentamisenTavat,
    );
  tobe.olennaisiaEroja = null;
  tobe.ammattikokemusJaElinikainenOppiminen = null;

  return tobe;
};
