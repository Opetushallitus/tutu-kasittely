'use client';

import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import SearchIcon from '@mui/icons-material/Search';
import {
  InputAdornment,
  SelectChangeEvent,
  Stack,
  useTheme,
} from '@mui/material';
import {
  OphButton,
  OphInputFormField,
  OphSelectFormField,
} from '@opetushallitus/oph-design-system';
import { useQueryClient } from '@tanstack/react-query';
import { parseAsString, useQueryState } from 'nuqs';
import { useEffect } from 'react';

import { hakuNakymaValintaOptions } from '@/src/constants/dropdownOptions';
import { useHakemuksetHaku } from '@/src/hooks/useHakemuksetHaku';
import { useToaster } from '@/src/hooks/useToaster';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import { handleFetchError } from '@/src/lib/utils';

export const SearchBar = () => {
  const theme = useTheme();
  const { addToast } = useToaster();
  const { t } = useTranslations();
  const queryClient = useQueryClient();

  const nakymaOptions = hakuNakymaValintaOptions.map((opt) => ({
    ...opt,
    label: t(`haku.nakymaValinta.${opt.label}`),
  }));

  const [haku, setHaku] = useQueryState('haku', parseAsString.withDefault(''));

  const [nakyma, setNakyma] = useQueryState(
    'nakyma',
    parseAsString.withDefault('kaikki'),
  );

  const { data: hakemukset, error: hakemuksetError } = useHakemuksetHaku(
    haku,
    nakyma,
  );

  console.log(hakemukset); // TODO

  useEffect(() => {
    handleFetchError(addToast, hakemuksetError, 'virhe.hakemuksenLataus', t);
  }, [hakemuksetError, addToast, t]);

  const handleHae = () => {
    queryClient.invalidateQueries({ queryKey: ['getHakemuksetHaulla'] });
  };

  return (
    <Stack direction="row" alignItems="center" gap={theme.spacing(3)} flex={1}>
      <Stack
        component="form"
        direction="row"
        alignItems="center"
        gap={theme.spacing(3)}
        flex={1}
        onSubmit={(e) => {
          e.preventDefault();
          handleHae();
        }}
      >
        <OphInputFormField
          placeholder={t('haku.haeKaikistahakemuksista')}
          sx={{ flex: 3 }}
          value={haku}
          onChange={(event) => {
            setHaku(event.target.value);
          }}
          endAdornment={
            <InputAdornment position="end">
              <SearchIcon sx={{ opacity: 0.2 }} />
            </InputAdornment>
          }
          data-testid={'hakukentta'}
        />
        <OphSelectFormField
          options={nakymaOptions}
          value={nakyma}
          sx={{ flex: 1 }}
          data-testid={'hakunakyma'}
          onChange={(event: SelectChangeEvent) => setNakyma(event.target.value)}
          inputProps={{ 'aria-label': t('haku.nakymaValinta') }}
        />
        <OphButton variant="contained" type="submit">
          {t('haku.hae')}
        </OphButton>
      </Stack>
      <OphButton
        variant="text"
        endIcon={<KeyboardArrowDownIcon />}
        onClick={() => {}}
        sx={{ fontWeight: 400 }}
      >
        {t('haku.tarkatHakuehdot')}
      </OphButton>
    </Stack>
  );
};
