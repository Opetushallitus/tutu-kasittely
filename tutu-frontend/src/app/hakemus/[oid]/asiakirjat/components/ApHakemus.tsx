import { useEffect, useState } from 'react';

import { Stack, useTheme } from '@mui/material';
import { OphRadio, OphTypography } from '@opetushallitus/oph-design-system';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';

import {
  AsiakirjaTieto,
  AsiakirjaTietoUpdateCallback,
} from '@/src/lib/types/hakemus';

interface ApHakemusProps {
  asiakirjaTieto: AsiakirjaTieto;
  hakemusKoskee: number;
  updateAsiakirjaTieto: AsiakirjaTietoUpdateCallback;
}

export const ApHakemus = ({
  asiakirjaTieto,
  hakemusKoskee,
  updateAsiakirjaTieto,
}: ApHakemusProps) => {
  const { t } = useTranslations();

  const [isApHakemus, setIsApHakemus] = useState<boolean | undefined>();

  const updateApHakemus = (val: boolean | undefined) => {
    if (val !== isApHakemus) {
      setIsApHakemus(val);
      updateAsiakirjaTieto({ apHakemus: val });
    }
  };

  useEffect(() => {
    setIsApHakemus(asiakirjaTieto.apHakemus);
  }, [asiakirjaTieto.apHakemus]);

  const theme = useTheme();

  return (
    hakemusKoskee === 1 && (
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
