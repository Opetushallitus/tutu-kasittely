'use client';

import {
  Grid2 as Grid,
  SelectChangeEvent,
  ToggleButton,
  ToggleButtonGroup,
  useTheme,
} from '@mui/material';
import {
  OphInput,
  OphSelect,
  OphSelectFormField,
} from '@opetushallitus/oph-design-system';
import {
  parseAsArrayOf,
  parseAsString,
  parseAsStringLiteral,
  useQueryState,
} from 'nuqs';
import { useTranslations } from '@/lib/localization/useTranslations';
import * as R from 'remeda';
import { kasittelyTilat } from '@/app/(root)/components/types';

const hakemuksetQueryStates = ['kaikki', 'omat'] as const;

export default function HakemusListFilters() {
  const theme = useTheme();
  const [hakemukset, setHakemukset] = useQueryState(
    'hakemukset',
    parseAsStringLiteral(hakemuksetQueryStates).withDefault('kaikki'),
  );
  const [haku, setHaku] = useQueryState('haku', parseAsString.withDefault(''));
  const [tilat, setTilat] = useQueryState(
    'tilat',
    parseAsArrayOf(parseAsString).withDefault([]),
  );
  const { t } = useTranslations();

  return (
    <Grid container spacing={theme.spacing(2)}>
      <Grid container spacing={theme.spacing(2)} size={12}>
        <Grid size={'auto'}>
          <ToggleButtonGroup sx={{ width: '100%' }}>
            <ToggleButton
              selected={hakemukset === 'omat'}
              value={'omat'}
              onClick={() => setHakemukset('omat')}
            >
              {t('hakemusListFilters.omat')}
            </ToggleButton>
            <ToggleButton
              selected={hakemukset === 'kaikki'}
              value={'kaikki'}
              onClick={() => setHakemukset('kaikki')}
            >
              {t('hakemusListFilters.kaikki')}
            </ToggleButton>
          </ToggleButtonGroup>
        </Grid>
        <Grid size={'auto'}>
          <OphInput
            sx={{ width: '100%' }}
            value={haku}
            onChange={(event) => setHaku(event.target.value)}
          ></OphInput>
        </Grid>
      </Grid>
      <Grid container spacing={theme.spacing(2)} size={12}>
        <Grid size={6}>
          <OphSelect
            multiple
            sx={{ width: '100%' }}
            value={tilat}
            onChange={(event: SelectChangeEvent) =>
              setTilat(event.target.value)
            }
            options={R.map(kasittelyTilat, (tila) => ({
              label: tila,
              value: tila,
            }))}
          ></OphSelect>
        </Grid>
        <Grid size={3}>
          <OphSelectFormField
            label={'hakemus koskee'}
            options={[]}
          ></OphSelectFormField>
        </Grid>
        <Grid size={3}>Esittelijä</Grid>
      </Grid>
      <Grid
        size={12}
        container
        direction={'row'}
        justifyContent={'space-between'}
      >
        <Grid size={'auto'}>256 hakemusta</Grid>
        <Grid size={'auto'}>
          <div>sivutus</div>
        </Grid>
      </Grid>
    </Grid>
  );
}
