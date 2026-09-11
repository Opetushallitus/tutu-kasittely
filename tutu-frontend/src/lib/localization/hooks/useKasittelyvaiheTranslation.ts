import * as dateFns from 'date-fns';

import { DATE_PLACEHOLDER } from '@/src/constants/constants';
import { formatHelsinki } from '@/src/lib/dateUtils';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import { Hakemus } from '@/src/lib/types/hakemus';
import { HakemusListItem } from '@/src/lib/types/hakemusListItem';

const ODOTTAA_LAUSUNTOA_TRANSLATION_KEYS: Record<string, string> = {
  OdottaaKHOLausuntoa: 'odottaakholausuntoamennessa',
  OdottaaHaOLausuntoa: 'odottaahaolausuntoamennessa',
};

export function useKasittelyvaiheTranslation(
  hakemus: Hakemus | HakemusListItem | undefined,
) {
  const { t } = useTranslations();
  if (!hakemus) {
    return { translation: '', timeLimitExceeded: false };
  }

  const kasittelyVaihe = hakemus.kasittelyVaihe;
  const odottaaLausuntoaKey =
    ODOTTAA_LAUSUNTOA_TRANSLATION_KEYS[kasittelyVaihe];

  if (odottaaLausuntoaKey && hakemus.lausunnonMaaraaikaPvm) {
    return {
      translation: t(`hakemus.kasittelyvaihe.${odottaaLausuntoaKey}`, {
        date: formatHelsinki(hakemus.lausunnonMaaraaikaPvm, DATE_PLACEHOLDER),
      }),
      timeLimitExceeded: false,
    };
  } else if (
    kasittelyVaihe === 'HakemustaTaydennetty' &&
    hakemus.ataruHakemustaMuokattu
  ) {
    return {
      translation: t(`hakemus.kasittelyvaihe.hakemustataydennettytalloin`, {
        date: formatHelsinki(hakemus.ataruHakemustaMuokattu, DATE_PLACEHOLDER),
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
        date: formatHelsinki(dateLimit, DATE_PLACEHOLDER),
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
