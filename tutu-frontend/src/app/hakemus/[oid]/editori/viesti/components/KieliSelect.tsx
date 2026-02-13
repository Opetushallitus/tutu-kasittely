import { SelectChangeEvent } from '@mui/material/Select';
import { Theme } from '@mui/material/styles';
import { Stack } from '@mui/system';
import {
  OphSelectFormField,
  OphTypography,
} from '@opetushallitus/oph-design-system';

import { TFunction } from '@/src/lib/localization/hooks/useTranslations';
import { Language } from '@/src/lib/localization/localizationTypes';

const getKieliOptions = (t: TFunction) => [
  { value: 'fi', label: t('yleiset.suomi') },
  { value: 'sv', label: t('yleiset.ruotsi') },
  { value: 'en', label: t('yleiset.englanti') },
];

export const KieliSelect = ({
  oletusKieli,
  updateKieli,
  t,
  theme,
}: {
  oletusKieli: Language;
  updateKieli: (kieli: Language) => void;
  t: TFunction;
  theme: Theme;
}) => {
  const kieliOptions = getKieliOptions(t);
  return (
    <Stack direction="column" width="100%" gap={theme.spacing(2)}>
      <OphTypography
        component="span"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'left',
          height: '100%',
        }}
      >
        {t('hakemus.viesti.kieli')}{' '}
        <OphSelectFormField
          options={kieliOptions}
          value={
            kieliOptions.some((opt) => opt.value === oletusKieli)
              ? oletusKieli
              : 'fi'
          }
          sx={{ width: '50%', paddingLeft: theme.spacing(2) }}
          data-testid={'viesti-kieli-select'}
          onChange={(event: SelectChangeEvent) => {
            updateKieli(event.target.value as Language);
          }}
          inputProps={{ 'aria-label': t('hakemus.viesti.kieli') }}
        />
      </OphTypography>
    </Stack>
  );
};
