import { useEffect, useState } from 'react';

import { Stack, useTheme } from '@mui/material';
import { OphRadio, OphTypography } from '@opetushallitus/oph-design-system';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';

import { Hakemus, HakemusUpdateCallback } from '@/src/lib/types/hakemus';
import { isDefined } from 'remeda';

interface ApHakemusProps {
  hakemus: Hakemus;
  updateHakemus: HakemusUpdateCallback;
}

export const ApHakemus = ({ hakemus, updateHakemus }: ApHakemusProps) => {
  const { t } = useTranslations();

  const [isApHakemus, setIsApHakemus] = useState<boolean | undefined>();

  const updateApHakemus = (val: boolean | undefined) => {
    if (val !== isApHakemus) {
      setIsApHakemus(val);
      updateHakemus({ apHakemus: val });
    }
  };

  useEffect(() => {
    const apHakemus = hakemus?.apHakemus;
    if (isDefined(apHakemus)) {
      setIsApHakemus(apHakemus);
    }
  }, [hakemus?.apHakemus]);

  const theme = useTheme();

  return (
    hakemus?.hakemusKoskee === 1 && (
      <>
        <OphTypography variant="h4">{t('hakemus.apHakemus')}</OphTypography>
        <Stack direction="row" gap={theme.spacing(3)}>
          <OphRadio
            value={'true'}
            checked={isApHakemus === true}
            label={t('yleiset.kylla')}
            name="ap_hakemus_true_false"
            onChange={() => updateApHakemus(true)}
          ></OphRadio>
          <OphRadio
            value={'false'}
            checked={isApHakemus === false}
            label={t('yleiset.ei')}
            name="ap_hakemus_true_false"
            onChange={() => updateApHakemus(false)}
          ></OphRadio>
        </Stack>
      </>
    )
  );
};
