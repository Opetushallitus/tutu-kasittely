import { HakemusListItem } from '@/src/lib/types/hakemusListItem';
import { Hakemus } from '@/src/lib/types/hakemus';
import * as dateFns from 'date-fns';
import { DATE_PLACEHOLDER } from '@/src/constants/constants';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';

export function useKasittelyvaiheTranslation(
  hakemus: Hakemus | HakemusListItem | undefined,
) {
  const { t } = useTranslations();
  if (!hakemus) {
    return '';
  }

  // Käytetään backendiltä tulevaa kasittelyVaihe-arvoa, joka lasketaan dynaamisesti
  const kasittelyVaihe = hakemus.kasittelyVaihe;

  // Käsitellään erikoismuotoilu tietyille tiloille
  if (kasittelyVaihe === 'HakemustaTaydennetty') {
    return (
      t(`hakemus.kasittelyvaihe.hakemustataydennetty`) +
      ' ' +
      dateFns.format(Date.parse(hakemus?.muokattu), DATE_PLACEHOLDER)
    );
  } else if (kasittelyVaihe === 'OdottaaTaydennysta') {
    return t(`hakemus.kasittelyvaihe.odottaataydennystamennessa`, {
      date: dateFns.format(
        dateFns.addWeeks(Date.parse(hakemus.taydennyspyyntoLahetetty), 2),
        DATE_PLACEHOLDER,
      ),
    });
  } else {
    return t(`hakemus.kasittelyvaihe.${kasittelyVaihe.toLowerCase()}`);
  }
}
