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
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import * as R from 'remeda';
import {
  hakemusKoskeeQueryStates,
  kasittelyVaiheet,
  naytaQueryStates,
} from '@/src/app/(root)/components/types';
import { redirect, useSearchParams } from 'next/navigation';
import {
  handleFetchError,
  setQueryStateAndLocalStorage,
} from '@/src/lib/utils';
import { useQueryClient } from '@tanstack/react-query';
import {
  emptyOption,
  hakemusKoskeeOptions,
} from '@/src/constants/dropdownOptions';
import { useEsittelijat } from '@/src/hooks/useEsittelijat';
import useToaster from '@/src/hooks/useToaster';
import { useEffect } from 'react';

export default function HakemusListFilters() {
  const theme = useTheme();
  const { t } = useTranslations();
  const queryClient = useQueryClient();
  const { options: esittelijaOptions, error } = useEsittelijat();
  const { addToast } = useToaster();

  useEffect(() => {
    handleFetchError(addToast, error, 'virhe.esittelijoiden-lataus', t);
  }, [error, addToast, t]);

  const [nayta, setNayta] = useQueryState(
    'nayta',
    parseAsStringLiteral(naytaQueryStates).withDefault('kaikki'),
  );

  const naytaKaikki = nayta === 'kaikki';

  const [haku, setHaku] = useQueryState('haku', parseAsString.withDefault(''));

  const [vaiheet, setVaiheet] = useQueryState(
    'vaihe',
    parseAsArrayOf(parseAsStringLiteral(kasittelyVaiheet)).withDefault([]),
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
            label={t('hakemuslista.kasittelyvaihe')}
            multiple
            options={R.map(kasittelyVaiheet, (vaihe) => ({
              label: t(`hakemus.kasittelyvaihe.${vaihe.toLowerCase()}`),
              value: vaihe,
            }))}
            value={vaiheet as never}
            onChange={(event: SelectChangeEvent) =>
              setQueryStateAndLocalStorage(
                queryClient,
                setVaiheet,
                event.target.value,
              )
            }
            sx={{ width: '100%' }}
            data-testid={'kasittelyvaihe'}
            renderValue={() => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {R.map(vaiheet, (value) => (
                  <Chip
                    key={value}
                    label={t(`hakemus.kasittelyvaihe.${value.toLowerCase()}`)}
                    sx={{ borderRadius: '0px' }}
                    onDelete={() =>
                      setQueryStateAndLocalStorage(
                        queryClient,
                        setVaiheet,
                        R.filter(vaiheet, (val) => val !== value),
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
                label: t(`valinnat.hakemusKoskeeValinta.${option.label}`),
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
