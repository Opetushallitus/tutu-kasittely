import { getKelpoisuusMuuAmmattiDropdownOption } from '@/src/app/hakemus/paatostiedot/paatostietoUtils';
import { TFunction } from '@/src/lib/localization/hooks/useTranslations';
import {
  TranslationNode,
  TreeOption,
  buildTreeOptions,
} from '@/src/lib/localization/translationUtils';

const kelpoisuusItems: TranslationNode[] = [
  {
    tKey: 'haku.kelpoisuus.opetusalanAmmatit',
    value: 'Opetusalan ammatit',
    children: [
      {
        tKey: 'haku.kelpoisuus.luokanopettaja',
        value: 'Opetusalan ammatit_Luokanopettaja',
      },
      {
        tKey: 'haku.kelpoisuus.esiopettaja',
        value: 'Opetusalan ammatit_Esiopetusta antava opettaja',
      },
      {
        tKey: 'haku.kelpoisuus.apIpOhjaaja',
        value: 'Opetusalan ammatit_Aamu- ja iltapäivätoiminnan ohjaaja',
      },
      {
        tKey: 'haku.kelpoisuus.aineenopettajaPerusopetuksessa',
        value: 'Opetusalan ammatit_Aineenopettaja perusopetuksessa',
      },
      {
        tKey: 'haku.kelpoisuus.aineenopettajaLukiossa',
        value: 'Opetusalan ammatit_Aineenopettaja lukiossa',
      },
      {
        tKey: 'haku.kelpoisuus.erityisluokanopettaja',
        value: 'Opetusalan ammatit_Erityisluokanopettaja',
      },
      {
        tKey: 'haku.kelpoisuus.erityisopettajaPerusopetuksessa',
        value: 'Opetusalan ammatit_Erityisopettaja perusopetuksessa',
      },
      {
        tKey: 'haku.kelpoisuus.erityisopettajaLukiossa',
        value: 'Opetusalan ammatit_Erityisopettaja lukiossa',
      },
      {
        tKey: 'haku.kelpoisuus.muuErityisopettaja',
        value: 'Opetusalan ammatit_Muu erityisopettaja',
      },
      {
        tKey: 'haku.kelpoisuus.oppilaanohjaajaPerusopetuksessa',
        value: 'Opetusalan ammatit_Oppilaanohjaaja perusopetuksessa',
      },
      {
        tKey: 'haku.kelpoisuus.opintoohjaajaLukiossa',
        value: 'Opetusalan ammatit_Opinto-ohjaaja lukiossa',
      },
      {
        tKey: 'haku.kelpoisuus.ammattikoulunOpettajaAmmattiosat',
        value:
          'Opetusalan ammatit_Ammatillisten tutkinnon osien opettaja ammatillisessa koulutuksessa',
      },
      {
        tKey: 'haku.kelpoisuus.ammattikoulunOpettajaYhteiset',
        value:
          'Opetusalan ammatit_Yhteisten tutkinnon osien opettaja ammatillisessa koulutuksessa',
      },
      {
        tKey: 'haku.kelpoisuus.vapaanSivistystyonOpettaja',
        value: 'Opetusalan ammatit_Vapaan sivistystyön opettaja',
      },
      {
        tKey: 'haku.kelpoisuus.kuraattori',
        value: 'Opetusalan ammatit_Kuraattori',
      },
    ],
  },
  {
    tKey: 'haku.kelpoisuus.varhaiskasvatuksenTehtavat',
    value: 'Varhaiskasvatuksen tehtävät',
    children: [
      {
        tKey: 'haku.kelpoisuus.varhaiskasvatuksenOpettaja',
        value: 'Varhaiskasvatuksen tehtävät_Varhaiskasvatuksen opettaja',
      },
      {
        tKey: 'haku.kelpoisuus.varhaiskasvatuksenSosionomi',
        value: 'Varhaiskasvatuksen tehtävät_Varhaiskasvatuksen sosionomi',
      },
      {
        tKey: 'haku.kelpoisuus.varhaiskasvatuksenLastenhoitaja',
        value: 'Varhaiskasvatuksen tehtävät_Varhaiskasvatuksen lastenhoitaja',
      },
      {
        tKey: 'haku.kelpoisuus.varhaiskasvatuksenErityisopettaja',
        value: 'Varhaiskasvatuksen tehtävät_Varhaiskasvatuksen erityisopettaja',
      },
      {
        tKey: 'haku.kelpoisuus.muuVarhaiskasvatuksenTehtava',
        value: 'Varhaiskasvatuksen tehtävät_Muu varhaiskasvatuksen tehtävä',
      },
    ],
  },
];

export const kelpoisuusFilterTreeOptions = (t: TFunction): TreeOption[] => {
  return [
    ...buildTreeOptions(kelpoisuusItems, t),
    getKelpoisuusMuuAmmattiDropdownOption(t),
  ];
};
