import { useEffect, useState } from 'react';

import { Stack, useTheme } from '@mui/material';
import { OphRadio, OphTypography } from '@opetushallitus/oph-design-system';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';

import { useDebounce } from '@/src/hooks/useDebounce';

import { Hakemus } from '@/src/lib/types/hakemus';
import { isDefined } from 'remeda';

interface ApHakemusProps {
  hakemus: Hakemus | undefined;
  updateHakemus: (patch: Partial<Hakemus>) => void;
}

export const ApHakemus = ({ hakemus, updateHakemus }: ApHakemusProps) => {
  const { t } = useTranslations();

  const [isApHakemus, _setIsApHakemus] = useState<boolean | undefined>();

  const debouncedHakemusUpdateAction = useDebounce((val: boolean) => {
    updateHakemus({
      ...hakemus,
      apHakemus: val,
    });
  }, 1500);

  const setIsApHakemus = (val: boolean | undefined) => {
    if (val !== isApHakemus) {
      debouncedHakemusUpdateAction(val);
      _setIsApHakemus(val);
    }
  };

  useEffect(() => {
    const apHakemus = hakemus?.apHakemus;
    if (isDefined(apHakemus)) {
      _setIsApHakemus(apHakemus);
    }
  }, [hakemus?.apHakemus]);

  const theme = useTheme();

  return (
    <>
      <OphTypography variant="h4">
        {t('hakemus.asiakirjat.apHakemus')}
      </OphTypography>
      <Stack direction="row" gap={theme.spacing(3)}>
        <OphRadio
          value={'true'}
          checked={isApHakemus === true}
          label={t('yleiset.kylla')}
          name="ap_hakemus_true_false"
          onChange={() => setIsApHakemus(true)}
        ></OphRadio>
        <OphRadio
          value={'false'}
          checked={isApHakemus === false}
          label={t('yleiset.ei')}
          name="ap_hakemus_true_false"
          onChange={() => setIsApHakemus(false)}
        ></OphRadio>
      </Stack>
    </>
  );
};
