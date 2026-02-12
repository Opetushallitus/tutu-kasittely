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
  hakemuksenKieli,
  t,
  theme,
}: {
  hakemuksenKieli: Language;
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
            kieliOptions.some((opt) => opt.value === hakemuksenKieli)
              ? hakemuksenKieli
              : 'fi'
          }
          sx={{ width: '50%', paddingLeft: theme.spacing(2) }}
          data-testid={'viesti-kieli-select'}
          onChange={
            (/*event: SelectChangeEvent*/) => {
              //updateHakemusLocal({ esittelijaOid: event.target.value })
            }
          }
          inputProps={{ 'aria-label': t('hakemus.viesti.kieli') }}
        />
      </OphTypography>
    </Stack>
  );
};
