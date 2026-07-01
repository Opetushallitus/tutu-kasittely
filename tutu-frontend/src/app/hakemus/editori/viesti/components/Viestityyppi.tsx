import { Stack } from '@mui/system';
import {
  OphRadioGroup,
  OphTypography,
} from '@opetushallitus/oph-design-system';
import React from 'react';

import { TFunction } from '@/src/lib/localization/hooks/useTranslations';
import { Viestityyppi } from '@/src/lib/types/viesti';

const tyyppiOptions = (t: TFunction) => [
  { value: 'taydennyspyynto', label: t('hakemus.viesti.taydennyspyynto') },
  { value: 'ennakkotieto', label: t('hakemus.viesti.ennakkotieto') },
  { value: 'muu', label: t('hakemus.viesti.muu') },
];

export const ViestityyppiComponent = ({
  viestityyppi,
  updateViestityyppi,
  t,
}: {
  viestityyppi?: Viestityyppi | null;
  updateViestityyppi: (viestityyppi: Viestityyppi) => void;
  t: TFunction;
}) => {
  return (
    <Stack>
      <OphTypography variant="body1" sx={{ fontWeight: 600 }}>
        {t('hakemus.viesti.tyyppi')}
      </OphTypography>
      <OphRadioGroup
        labelId={'viesti-tyyppi-radio-group-label'}
        data-testid={'viesti-tyyppi-radio-group'}
        options={tyyppiOptions(t)}
        value={viestityyppi || ''}
        onChange={(e) => updateViestityyppi(e.target.value as Viestityyppi)}
      />
    </Stack>
  );
};
