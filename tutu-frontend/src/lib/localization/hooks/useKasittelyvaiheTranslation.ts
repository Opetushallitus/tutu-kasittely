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
    return { translation: '', timeLimitExceeded: false };
  }

  const kasittelyVaihe = hakemus.kasittelyVaihe;

  if (
    kasittelyVaihe === 'HakemustaTaydennetty' &&
    hakemus.ataruHakemustaMuokattu
  ) {
    return {
      translation: t(`hakemus.kasittelyvaihe.hakemustataydennettytalloin`, {
        date: dateFns.format(
          Date.parse(hakemus.ataruHakemustaMuokattu),
          DATE_PLACEHOLDER,
        ),
      }),
      timeLimitExceeded: false,
    };
  } else if (
    kasittelyVaihe === 'OdottaaTaydennysta' &&
    hakemus.taydennyspyyntoLahetetty
  ) {
    const dateLimit = dateFns.addWeeks(
      Date.parse(hakemus.taydennyspyyntoLahetetty),
      2,
    );
    return {
      translation: t(`hakemus.kasittelyvaihe.odottaataydennystamennessa`, {
        date: dateFns.format(dateLimit, DATE_PLACEHOLDER),
      }),
      timeLimitExceeded: dateLimit < new Date(),
    };
  } else {
    return {
      translation: t(`hakemus.kasittelyvaihe.${kasittelyVaihe.toLowerCase()}`),
      timeLimitExceeded: false,
    };
  }
}
