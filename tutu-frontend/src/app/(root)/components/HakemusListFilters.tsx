'use client';

import {
  Box,
  Chip,
  Grid2 as Grid,
  SelectChangeEvent,
  ToggleButton,
  ToggleButtonGroup,
  useTheme,
} from '@mui/material';
import {
  OphFormFieldWrapper,
  OphInputFormField,
  OphSelectFormField,
} from '@opetushallitus/oph-design-system';
import {
  parseAsArrayOf,
  parseAsString,
  parseAsStringLiteral,
  useQueryState,
} from 'nuqs';
import { useTranslations } from '@/src/lib/localization/useTranslations';
import * as R from 'remeda';
import {
  hakemusKoskeeQueryStates,
  kasittelyTilat,
  naytaQueryStates,
} from '@/src/app/(root)/components/types';
import { redirect, useSearchParams } from 'next/navigation';
import { setQueryStateAndLocalStorage } from '@/src/lib/utils';
import { useQueryClient } from '@tanstack/react-query';
import {
  emptyOption,
  hakemusKoskeeOptions,
} from '@/src/constants/dropdownOptions';
import { useEsittelijat } from '@/src/hooks/useEsittelijat';

export default function HakemusListFilters() {
  const theme = useTheme();
  const { t } = useTranslations();
  const queryClient = useQueryClient();
  const { options: esittelijaOptions } = useEsittelijat();

  const [nayta, setNayta] = useQueryState(
    'nayta',
    parseAsStringLiteral(naytaQueryStates).withDefault('kaikki'),
  );

  const naytaKaikki = nayta === 'kaikki';

  const [haku, setHaku] = useQueryState('haku', parseAsString.withDefault(''));

  const [tilat, setTilat] = useQueryState(
    'tilat',
    parseAsArrayOf(parseAsStringLiteral(kasittelyTilat)).withDefault([]),
  );

  const [hakemusKoskee, setHakemusKoskee] = useQueryState(
    'hakemuskoskee',
    parseAsStringLiteral(hakemusKoskeeQueryStates).withDefault(''),
  );

  const [esittelija, setEsittelija] = useQueryState(
    'esittelija',
    parseAsString.withDefault(''),
  );

  const searchParams = useSearchParams();

  if (searchParams.toString() === '') {
    const localStorageSearchParams = localStorage.getItem('tutu-query-string');
    if (localStorageSearchParams && localStorageSearchParams !== '') {
      redirect(`?${localStorageSearchParams}`);
    }
  }

  return (
    <Grid container spacing={theme.spacing(2)}>
      <Grid container spacing={theme.spacing(2)} size={12}>
        <Grid size={2}>
          <OphFormFieldWrapper
            renderInput={() => {
              return (
                <ToggleButtonGroup>
                  <ToggleButton
                    selected={!naytaKaikki}
                    value={'omat'}
                    onClick={() =>
                      setQueryStateAndLocalStorage(
                        queryClient,
                        setNayta,
                        'omat',
                      )
                    }
                    data-testid={'nayta-omat'}
                  >
                    {t('hakemuslista.omat')}
                  </ToggleButton>
                  <ToggleButton
                    selected={naytaKaikki}
                    value={'kaikki'}
                    onClick={() =>
                      setQueryStateAndLocalStorage(
                        queryClient,
                        setNayta,
                        'kaikki',
                      )
                    }
                  >
                    {t('hakemuslista.kaikki')}
                  </ToggleButton>
                </ToggleButtonGroup>
              );
            }}
            label={t('hakemuslista.nayta')}
          ></OphFormFieldWrapper>
        </Grid>
        <Grid size={10}>
          <OphInputFormField
            label={t('hakemuslista.haeHakemuksia')}
            sx={{ width: '100%' }}
            value={haku}
            onChange={(event) =>
              setQueryStateAndLocalStorage(
                queryClient,
                setHaku,
                event.target.value,
              )
            }
            data-testid={'hakukentta'}
          ></OphInputFormField>
        </Grid>
      </Grid>
      <Grid container spacing={theme.spacing(2)} size={12}>
        <Grid size={naytaKaikki ? 6 : 9}>
          <OphSelectFormField
            label={t('hakemuslista.kasittelytila')}
            multiple
            options={R.map(kasittelyTilat, (tila) => ({
              label: tila,
              value: tila,
            }))}
            value={tilat as never}
            onChange={(event: SelectChangeEvent) =>
              setQueryStateAndLocalStorage(
                queryClient,
                setTilat,
                event.target.value,
              )
            }
            sx={{ width: '100%' }}
            data-testid={'kasittelytila'}
            renderValue={() => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {R.map(tilat, (value) => (
                  <Chip
                    key={value}
                    label={value}
                    sx={{ borderRadius: '0px' }}
                    onDelete={() =>
                      setQueryStateAndLocalStorage(
                        queryClient,
                        setTilat,
                        R.filter(tilat, (val) => val !== value),
                      )
                    }
                    onMouseDown={(event) => {
                      event.stopPropagation();
                    }}
                  />
                ))}
              </Box>
            )}
          ></OphSelectFormField>
        </Grid>
        <Grid size={3}>
          <OphSelectFormField
            label={t('hakemuslista.hakemusKoskee')}
            options={emptyOption.concat(
              R.map(hakemusKoskeeOptions, (option) => ({
                label: t(`hakemuslista.hakemusKoskeeValinta.${option.label}`),
                value: option.value,
              })),
            )}
            value={hakemusKoskee}
            onChange={(event: SelectChangeEvent) =>
              setQueryStateAndLocalStorage(
                queryClient,
                setHakemusKoskee,
                event.target.value,
              )
            }
            sx={{ width: '100%' }}
            data-testid={'hakemus-koskee'}
          ></OphSelectFormField>
        </Grid>
        {naytaKaikki && (
          <Grid size={3}>
            <OphSelectFormField
              label={t('hakemuslista.esittelija')}
              options={esittelijaOptions}
              value={esittelija}
              onChange={(event: SelectChangeEvent) =>
                setQueryStateAndLocalStorage(
                  queryClient,
                  setEsittelija,
                  event.target.value,
                )
              }
              sx={{ width: '100%' }}
              data-testid={'esittelija'}
            ></OphSelectFormField>
          </Grid>
        )}
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
