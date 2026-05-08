'use client';

import CloseIcon from '@mui/icons-material/Close';
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
import { usePathname } from 'next/dist/client/components/navigation';
import { parseAsString, useQueryState } from 'nuqs';
import { useEffect, useState } from 'react';

import { hakuNakymaValintaOptions } from '@/src/constants/dropdownOptions';
import { useSearchRibbon } from '@/src/context/SearchRibbonContext';
import { useHakemuksetHaku } from '@/src/hooks/useHakemuksetHaku';
import { useToaster } from '@/src/hooks/useToaster';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import { handleFetchError } from '@/src/lib/utils';

export const SearchBar = () => {
  const theme = useTheme();
  const { addToast } = useToaster();
  const { t } = useTranslations();
  const queryClient = useQueryClient();
  const {
    setSearchResults,
    setSelectedOid,
    currentPage,
    setCurrentPage,
    setTotalPages,
    ribbonVisible,
    setRibbonVisible,
    registerOnClose,
  } = useSearchRibbon();

  const nakymaOptions = hakuNakymaValintaOptions.map((opt) => ({
    ...opt,
    label: t(`haku.nakymaValinta.${opt.label}`),
  }));

  const [haku, setHaku] = useQueryState('haku', parseAsString.withDefault(''));
  const [nakyma, setNakyma] = useQueryState(
    'nakyma',
    parseAsString.withDefault('kaikki'),
  );

  // Päivitä parametrit vasta hae-napilla
  const [inputHaku, setInputHaku] = useState(haku);
  const [inputNakyma, setInputNakyma] = useState(nakyma);

  const {
    data: hakemukset,
    error: hakemuksetError,
    isLoading,
    isEnabled,
  } = useHakemuksetHaku(haku, nakyma, currentPage);

  // Avaa nauha automaattisesti jos URL:iin on asetettu hakuparametrejä.
  // Mount-only: ei saa reagoida kirjoittamiseen.
  useEffect(() => {
    if (isEnabled) {
      setRibbonVisible(true);
    }
    registerOnClose(() => {
      setHaku('');
      setNakyma('kaikki');
      setInputHaku('');
      setInputNakyma('kaikki');
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isLoading && ribbonVisible) {
      setSearchResults(null);
    }
  }, [isLoading, ribbonVisible, setSearchResults]);

  useEffect(() => {
    if (hakemukset && ribbonVisible) {
      setSearchResults(hakemukset.items);
      setTotalPages(hakemukset.totalPages);
      setSelectedOid(hakemukset.items[0]?.hakemusOid ?? null);
    }
  }, [
    hakemukset,
    ribbonVisible,
    setSearchResults,
    setTotalPages,
    setSelectedOid,
  ]);

  useEffect(() => {
    handleFetchError(addToast, hakemuksetError, 'virhe.hakemuksenLataus', t);
  }, [hakemuksetError, addToast, t]);

  const handleHae = () => {
    if (!inputHaku.trim()) {
      return;
    }
    setHaku(inputHaku);
    setNakyma(inputNakyma);
    setCurrentPage(1);
    setSelectedOid(null);
    setRibbonVisible(true);
    queryClient.removeQueries({ queryKey: ['getHakemuksetHaulla'] });
  };

  // Älä näytä hakuja editorissa
  const pathname = usePathname();
  if (pathname.includes('/editori/')) {
    return null;
  }

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
          value={inputHaku}
          onChange={(event) => {
            setInputHaku(event.target.value);
          }}
          endAdornment={
            <InputAdornment position="end">
              {inputHaku && (
                <CloseIcon
                  sx={{ cursor: 'pointer' }}
                  onClick={() => setInputHaku('')}
                />
              )}
              <SearchIcon sx={{ opacity: 0.2 }} />
            </InputAdornment>
          }
          data-testid={'hakukentta'}
        />
        <OphSelectFormField
          options={nakymaOptions}
          value={inputNakyma}
          sx={{ flex: 1 }}
          data-testid={'hakunakyma'}
          onChange={(event: SelectChangeEvent) =>
            setInputNakyma(event.target.value)
          }
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
