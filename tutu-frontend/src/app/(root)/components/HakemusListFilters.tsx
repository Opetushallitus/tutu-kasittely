'use client';

import {
  Grid2 as Grid,
  ToggleButton,
  ToggleButtonGroup,
  useTheme,
} from '@mui/material';
import {
  OphFormFieldWrapper,
  OphInputFormField,
} from '@opetushallitus/oph-design-system';
import { useQueryClient } from '@tanstack/react-query';
import { redirect, useSearchParams } from 'next/navigation';
import {
  parseAsArrayOf,
  parseAsString,
  parseAsStringLiteral,
  useQueryState,
} from 'nuqs';
import { useEffect } from 'react';
import * as R from 'remeda';

import {
  kasittelyVaiheet,
  naytaQueryStates,
} from '@/src/app/(root)/components/types';
import { OphSelectOption } from '@/src/components/OphSelect';
import { OphSelectMultiple } from '@/src/components/OphSelectMultiple';
import { hakemusKoskeeOptions } from '@/src/constants/dropdownOptions';
import { useEsittelijat } from '@/src/hooks/useEsittelijat';
import { useHakemukset } from '@/src/hooks/useHakemukset';
import useToaster from '@/src/hooks/useToaster';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import {
  handleFetchError,
  setQueryStateAndLocalStorage,
} from '@/src/lib/utils';

export default function HakemusListFilters() {
  const theme = useTheme();
  const { t } = useTranslations();
  const queryClient = useQueryClient();
  const { options: esittelijaOptions, error } = useEsittelijat();
  const { addToast } = useToaster();
  const { data: hakemukset, error: hakemuksetError } = useHakemukset();

  useEffect(() => {
    handleFetchError(addToast, hakemuksetError, 'virhe.hakemuslistanLataus', t);
  }, [hakemuksetError, addToast, t]);

  useEffect(() => {
    handleFetchError(addToast, error, 'virhe.esittelijoidenLataus', t);
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
    parseAsArrayOf(
      parseAsStringLiteral(
        R.map(hakemusKoskeeOptions, (option) => option.value),
      ),
    ).withDefault([]),
  );

  const [esittelija, setEsittelija] = useQueryState(
    'esittelija',
    parseAsArrayOf(parseAsString).withDefault([]),
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
          <OphFormFieldWrapper
            label={t('hakemuslista.kasittelyvaihe')}
            sx={{ width: '100%' }}
            renderInput={() => (
              <OphSelectMultiple
                placeholder={t('yleiset.valitse')}
                options={R.map(kasittelyVaiheet, (vaihe) => ({
                  label: t(`hakemus.kasittelyvaihe.${vaihe.toLowerCase()}`),
                  value: vaihe,
                }))}
                value={vaiheet}
                sx={{ width: '100%' }}
                onChange={(event) =>
                  setQueryStateAndLocalStorage(
                    queryClient,
                    setVaiheet,
                    event.target.value,
                  )
                }
                data-testid={'kasittelyvaihe'}
                inputProps={{ 'aria-label': t('hakemuslista.kasittelyvaihe') }}
              />
            )}
          />
        </Grid>
        <Grid size={3}>
          <OphFormFieldWrapper
            label={t('hakemuslista.hakemusKoskee')}
            sx={{ width: '100%' }}
            renderInput={() => (
              <OphSelectMultiple
                placeholder={t('yleiset.valitse')}
                options={R.map(hakemusKoskeeOptions, (option) => ({
                  label: t(`valinnat.hakemusKoskeeValinta.${option.label}`),
                  value: option.value,
                }))}
                value={hakemusKoskee}
                sx={{ width: '100%' }}
                onChange={(event) =>
                  setQueryStateAndLocalStorage(
                    queryClient,
                    setHakemusKoskee,
                    event.target.value,
                  )
                }
                data-testid={'hakemus-koskee'}
                inputProps={{ 'aria-label': t('hakemuslista.hakemusKoskee') }}
              />
            )}
          />
        </Grid>
        {naytaKaikki && (
          <Grid size={3}>
            <OphFormFieldWrapper
              label={t('hakemuslista.esittelija')}
              sx={{ width: '100%' }}
              renderInput={() => (
                <OphSelectMultiple
                  placeholder={t('yleiset.valitse')}
                  options={R.map(
                    esittelijaOptions,
                    (option: OphSelectOption<string>) => ({
                      label: option.label,
                      value: option.value,
                    }),
                  )}
                  value={esittelija}
                  onChange={(event) =>
                    setQueryStateAndLocalStorage(
                      queryClient,
                      setEsittelija,
                      event.target.value,
                    )
                  }
                  data-testid={'esittelija'}
                  inputProps={{ 'aria-label': t('hakemuslista.esittelija') }}
                />
              )}
            />
          </Grid>
        )}
      </Grid>
      <Grid
        size={12}
        container
        direction={'row'}
        justifyContent={'space-between'}
      >
        {hakemukset && (
          <Grid size={'auto'}>
            {hakemukset?.length} {t('hakemuslista.hakemusta')}
          </Grid>
        )}
        <Grid size={'auto'}>
          <div>sivutus</div>
        </Grid>
      </Grid>
    </Grid>
  );
}
