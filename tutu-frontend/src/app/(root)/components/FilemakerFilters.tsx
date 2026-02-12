'use client';

import { Grid2 as Grid, useTheme } from '@mui/material';
import {
  OphInputFormField,
  OphSelect,
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

  const [haku, setHaku] = useQueryState(
    'fm-haku',
    parseAsString.withDefault(''),
  );

  const [pageSize, _setPageSize] = useQueryState(
    'fm-pagesize',
    parseAsInteger.withDefault(20),
  );

  const setPageSize = (val: string) => {
    const newValue = Number(val);
    if (Number.isFinite(newValue)) {
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
            onChange={(event) =>
              setFilemakerQueryStateAndLocalStorage(
                queryClient,
                setHaku,
                event.target.value,
              )
            }
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
        <Grid size={'auto'}>
          {hakemukset?.count ?? 0} {t('hakemuslista.hakemusta')}
        </Grid>
        <Grid size={'auto'}>
          <OphSelect
            onChange={(event) => setPageSize(event.target.value)}
            value={`${pageSize ?? 20}`}
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
