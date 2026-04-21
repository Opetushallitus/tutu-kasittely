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
  OphSelectMultiple,
  OphSelect,
  OphTypography,
} from '@opetushallitus/oph-design-system';
import { useQueryClient } from '@tanstack/react-query';
import { redirect } from 'next/navigation';
import {
  parseAsArrayOf,
  parseAsInteger,
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
import { hakemusKoskeeOptions } from '@/src/constants/dropdownOptions';
import { useDebounce } from '@/src/hooks/useDebounce';
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
  const { addToast } = useToaster();

  const { options: esittelijaOptions, error } = useEsittelijat();

  const [_, setPage] = useQueryState('page', parseAsInteger.withDefault(1));
  const [pageSize, _setPageSize] = useQueryState(
    'pagesize',
    parseAsInteger.withDefault(20),
  );

  const setPageSize = (val: string) => {
    const newValue = Number(val);
    if (Number.isFinite(newValue)) {
      setPage(1);
      setQueryStateAndLocalStorage(queryClient, _setPageSize, newValue);
    }
  };

  const { data: hakemukset, error: hakemuksetError } = useHakemukset();

  useEffect(() => {
    handleFetchError(addToast, hakemuksetError, 'virhe.hakemuslistanLataus', t);
    handleFetchError(addToast, error, 'virhe.esittelijoidenLataus', t);
  }, [hakemuksetError, error, addToast, t]);

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

  useEffect(() => {
    if (!window.location.search) {
      const localStorageSearchParams =
        localStorage.getItem('tutu-query-string');
      if (localStorageSearchParams && localStorageSearchParams !== '') {
        redirect(`?${localStorageSearchParams}`);
      }
    }
  }, []);

  const debouncedFetch = useDebounce(() => {
    setQueryStateAndLocalStorage(queryClient, setPage, 1);
  }, 300);

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
                    onClick={() => {
                      setPage(1);
                      setQueryStateAndLocalStorage(
                        queryClient,
                        setNayta,
                        'omat',
                      );
                    }}
                    data-testid={'nayta-omat'}
                  >
                    {t('hakemuslista.omat')}
                  </ToggleButton>
                  <ToggleButton
                    selected={naytaKaikki}
                    value={'kaikki'}
                    onClick={() => {
                      setPage(1);
                      setQueryStateAndLocalStorage(
                        queryClient,
                        setNayta,
                        'kaikki',
                      );
                    }}
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
            onChange={(event) => {
              setHaku(event.target.value);
              debouncedFetch();
            }}
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
              <div data-testid={'kasittelyvaihe'}>
                <OphSelectMultiple
                  placeholder={t('yleiset.valitse')}
                  options={R.map(kasittelyVaiheet, (vaihe) => ({
                    label: t(`hakemus.kasittelyvaihe.${vaihe.toLowerCase()}`),
                    value: vaihe,
                  }))}
                  value={vaiheet}
                  sx={{ width: '100%' }}
                  onChange={(event) => {
                    setPage(1);
                    setQueryStateAndLocalStorage(
                      queryClient,
                      setVaiheet,
                      event.target.value,
                    );
                  }}
                  inputProps={{
                    'aria-label': t('hakemuslista.kasittelyvaihe'),
                  }}
                />
              </div>
            )}
          />
        </Grid>
        <Grid size={3}>
          <OphFormFieldWrapper
            label={t('hakemuslista.hakemusKoskee')}
            sx={{ width: '100%' }}
            renderInput={() => (
              <div data-testid={'hakemus-koskee'}>
                <OphSelectMultiple
                  placeholder={t('yleiset.valitse')}
                  options={R.map(hakemusKoskeeOptions, (option) => ({
                    label: t(`valinnat.hakemusKoskeeValinta.${option.label}`),
                    value: option.value,
                  }))}
                  value={hakemusKoskee}
                  sx={{ width: '100%' }}
                  onChange={(event) => {
                    setPage(1);
                    setQueryStateAndLocalStorage(
                      queryClient,
                      setHakemusKoskee,
                      event.target.value,
                    );
                  }}
                  inputProps={{ 'aria-label': t('hakemuslista.hakemusKoskee') }}
                />
              </div>
            )}
          />
        </Grid>
        {naytaKaikki && (
          <Grid size={3}>
            <OphFormFieldWrapper
              label={t('hakemuslista.esittelija')}
              sx={{ width: '100%' }}
              renderInput={() => (
                <div data-testid={'esittelija'}>
                  <OphSelectMultiple
                    placeholder={t('yleiset.valitse')}
                    options={R.map(esittelijaOptions, (option) => ({
                      label: option.label,
                      value: option.value,
                    }))}
                    value={esittelija}
                    onChange={(event) => {
                      setPage(1);
                      setQueryStateAndLocalStorage(
                        queryClient,
                        setEsittelija,
                        event.target.value,
                      );
                    }}
                    inputProps={{
                      'aria-label': t('hakemuslista.esittelija'),
                    }}
                  />
                </div>
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
            {hakemukset.totalCount} {t('hakemuslista.hakemusta')}
          </Grid>
        )}
        <Grid size={'auto'} direction="row" container alignItems="center">
          <OphTypography id="page-size-label">
            {t('filemaker.pageSize.label')}:
          </OphTypography>
          <OphSelect
            labelId="page-size-label"
            onChange={(event) => setPageSize(event.target.value)}
            value={`${pageSize}`}
            options={[
              { label: '20', value: '20' },
              { label: '50', value: '50' },
              { label: '100', value: '100' },
            ]}
          />
        </Grid>
      </Grid>
    </Grid>
  );
}
