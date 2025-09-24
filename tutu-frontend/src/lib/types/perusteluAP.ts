export type PerusteluAP = Partial<{
  lakiperusteToisessaJasenmaassaSaannelty?: boolean;
  lakiperustePatevyysLahtomaanOikeuksilla?: boolean;
  lakiperusteToinenEUmaaTunnustanut?: boolean;
  lakiperusteLahtomaassaSaantelematon?: boolean;
  todistusEUKansalaisuuteenRinnasteisestaAsemasta?: string;
  ammattiJohonPatevoitynyt?: string;
  ammattitoiminnanPaaAsiallinenSisalto?: string;
  koulutuksenKestoJaSisalto?: string;
  selvityksetLahtomaanViranomaiselta?: boolean;
  selvityksetLahtomaanLainsaadannosta?: boolean;
  selvityksetAikaisempiTapaus?: boolean;
  selvityksetIlmeneeAsiakirjoista?: boolean;
  lisatietoja?: string;
  IMIHalytysTarkastettu?: boolean;
  muutAPPerustelut?: string;
  SEUTArviointi?: string;
}>;
