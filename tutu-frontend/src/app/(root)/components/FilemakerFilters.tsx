'use client';

import { Grid2 as Grid, useTheme } from '@mui/material';
import {
  OphInputFormField,
  OphSelect,
  OphTypography,
} from '@opetushallitus/oph-design-system';
import { useQueryClient } from '@tanstack/react-query';
import { redirect, useSearchParams } from 'next/navigation';
import { parseAsInteger, parseAsString, useQueryState } from 'nuqs';
import { useEffect } from 'react';

import { useFilemakerHakemukset } from '@/src/hooks/useFilemakerHakemukset';
import useToaster from '@/src/hooks/useToaster';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import {
  handleFetchError,
  setFilemakerQueryStateAndLocalStorage,
} from '@/src/lib/utils';

export default function FilemakerFilters() {
  const theme = useTheme();
  const { t } = useTranslations();
  const queryClient = useQueryClient();
  const { addToast } = useToaster();
  const { data: hakemukset, error: hakemuksetError } = useFilemakerHakemukset();

  useEffect(() => {
    handleFetchError(addToast, hakemuksetError, 'virhe.hakemuslistanLataus', t);
  }, [hakemuksetError, addToast, t]);

  const [haku, setHaku] = useQueryState('query', parseAsString.withDefault(''));

  const [_, setPage] = useQueryState('page', parseAsInteger.withDefault(1));
  const [pageSize, _setPageSize] = useQueryState(
    'pagesize',
    parseAsInteger.withDefault(20),
  );

  const setPageSize = (val: string) => {
    const newValue = Number(val);
    if (Number.isFinite(newValue)) {
      setPage(1);
      setFilemakerQueryStateAndLocalStorage(
        queryClient,
        _setPageSize,
        newValue,
      );
    }
  };

  const searchParams = useSearchParams();

  if (searchParams.toString() === '') {
    const localStorageSearchParams = localStorage.getItem(
      'tutu-filemaker-query-string',
    );
    if (localStorageSearchParams && localStorageSearchParams !== '') {
      redirect(`?${localStorageSearchParams}`);
    }
  }

  return (
    <Grid container spacing={theme.spacing(2)}>
      <Grid container spacing={theme.spacing(2)} size={12}>
        <Grid size={12}>
          <OphInputFormField
            label={t('hakemuslista.haeHakemuksia')}
            sx={{ width: '100%' }}
            value={haku}
            onChange={(event) => {
              setPage(1);
              setFilemakerQueryStateAndLocalStorage(
                queryClient,
                setHaku,
                event.target.value,
              );
            }}
            data-testid={'hakukentta'}
          ></OphInputFormField>
        </Grid>
      </Grid>
      <Grid
        size={12}
        container
        direction={'row'}
        justifyContent={'space-between'}
      >
        {hakemukset && (
          <Grid size={'auto'} container alignItems="center">
            {hakemukset.totalCount} {t('hakemuslista.hakemusta')}
          </Grid>
        )}
        <Grid size={'auto'} direction="row" container alignItems="center">
          <OphTypography id="fm-page-size-label">
            {t('filemaker.pageSize.label')}:
          </OphTypography>
          <OphSelect
            labelId="fm-page-size-label"
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
