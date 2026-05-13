'use client';

import CloseIcon from '@mui/icons-material/Close';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import SearchIcon from '@mui/icons-material/Search';
import {
  Collapse,
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
import {
  HakemuksetFilters,
  useHakemuksetHaku,
} from '@/src/hooks/useHakemuksetHaku';
import { useToaster } from '@/src/hooks/useToaster';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import { handleFetchError } from '@/src/lib/utils';

import { SearchFilters } from './SearchFilters';

type CommittedSearch = {
  haku: string;
  nakyma: string;
  filters: HakemuksetFilters;
};

const EMPTY_COMMITTED: CommittedSearch = {
  haku: '',
  nakyma: 'kaikki',
  filters: {
    suoritusmaa: '',
    paattymisVuosi: '',
    todistusVuosi: '',
    oppilaitos: '',
    tutkinnonNimi: '',
    paaAine: '',
    kelpoisuus: '',
    opetettavatAineet: '',
    ratkaisutyyppi: '',
    paatostyyppi: '',
    sovellettuLaki: '',
    tutkinnonTaso: '',
    kielteinen: '',
    myonteinen: '',
    esittelijaOid: '',
    hakijanNimi: '',
    asiatunnus: '',
  },
};

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
  const [suoritusmaa, setSuoritusmaa] = useQueryState(
    'suoritusmaa',
    parseAsString.withDefault(''),
  );
  const [paattymisVuosi, setPaattymisVuosi] = useQueryState(
    'paattymisVuosi',
    parseAsString.withDefault(''),
  );
  const [todistusVuosi, setTodistusVuosi] = useQueryState(
    'todistusVuosi',
    parseAsString.withDefault(''),
  );
  const [oppilaitos, setOppilaitos] = useQueryState(
    'oppilaitos',
    parseAsString.withDefault(''),
  );
  const [tutkinnonNimi, setTutkinnonNimi] = useQueryState(
    'tutkinnonNimi',
    parseAsString.withDefault(''),
  );
  const [paaAine, setPaaAine] = useQueryState(
    'paaAine',
    parseAsString.withDefault(''),
  );
  const [kelpoisuus, setKelpoisuus] = useQueryState(
    'kelpoisuus',
    parseAsString.withDefault(''),
  );
  const [opetettavatAineet, setOpetettavatAineet] = useQueryState(
    'opetettavatAineet',
    parseAsString.withDefault(''),
  );
  const [ratkaisutyyppi, setRatkaisutyyppi] = useQueryState(
    'ratkaisutyyppi',
    parseAsString.withDefault(''),
  );
  const [paatostyyppi, setPaatostyyppi] = useQueryState(
    'paatostyyppi',
    parseAsString.withDefault(''),
  );
  const [sovellettuLaki, setSovellettuLaki] = useQueryState(
    'sovellettuLaki',
    parseAsString.withDefault(''),
  );
  const [tutkinnonTaso, setTutkinnonTaso] = useQueryState(
    'tutkinnonTaso',
    parseAsString.withDefault(''),
  );
  const [kielteinen, setKielteinen] = useQueryState(
    'kielteinen',
    parseAsString.withDefault(''),
  );
  const [myonteinen, setMyonteinen] = useQueryState(
    'myonteinen',
    parseAsString.withDefault(''),
  );
  const [esittelijaOid, setEsittelijaOid] = useQueryState(
    'esittelijaOid',
    parseAsString.withDefault(''),
  );
  const [hakijanNimi, setHakijanNimi] = useQueryState(
    'hakijanNimi',
    parseAsString.withDefault(''),
  );
  const [asiatunnus, setAsiatunnus] = useQueryState(
    'asiatunnus',
    parseAsString.withDefault(''),
  );

  const [committed, setCommitted] = useState<CommittedSearch>(() => ({
    haku,
    nakyma,
    filters: {
      suoritusmaa,
      paattymisVuosi,
      todistusVuosi,
      oppilaitos,
      tutkinnonNimi,
      paaAine,
      kelpoisuus,
      opetettavatAineet,
      ratkaisutyyppi,
      paatostyyppi,
      sovellettuLaki,
      tutkinnonTaso,
      kielteinen,
      myonteinen,
      esittelijaOid,
      hakijanNimi,
      asiatunnus,
    },
  }));

  const [filtersOpen, setFiltersOpen] = useState(() =>
    Object.values(committed.filters).some(Boolean),
  );

  const {
    data: hakemukset,
    error: hakemuksetError,
    isLoading,
    isEnabled,
  } = useHakemuksetHaku(
    committed.haku,
    committed.nakyma,
    currentPage,
    committed.filters,
  );

  // Avaa nauha automaattisesti jos URL:iin on asetettu hakuparametrejä.
  // Mount-only: ei saa reagoida kirjoittamiseen.
  useEffect(() => {
    if (isEnabled) {
      setRibbonVisible(true);
    }
    registerOnClose(() => {
      setHaku('');
      setNakyma('kaikki');
      setSuoritusmaa('');
      setPaattymisVuosi('');
      setTodistusVuosi('');
      setOppilaitos('');
      setTutkinnonNimi('');
      setPaaAine('');
      setKelpoisuus('');
      setOpetettavatAineet('');
      setRatkaisutyyppi('');
      setPaatostyyppi('');
      setSovellettuLaki('');
      setTutkinnonTaso('');
      setKielteinen('');
      setMyonteinen('');
      setEsittelijaOid('');
      setHakijanNimi('');
      setAsiatunnus('');
      setCommitted(EMPTY_COMMITTED);
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
    const newFilters = {
      suoritusmaa,
      paattymisVuosi,
      todistusVuosi,
      oppilaitos,
      tutkinnonNimi,
      paaAine,
      kelpoisuus,
      opetettavatAineet,
      ratkaisutyyppi,
      paatostyyppi,
      sovellettuLaki,
      tutkinnonTaso,
      kielteinen,
      myonteinen,
      esittelijaOid,
      hakijanNimi,
      asiatunnus,
    };

    if (!haku.trim() && !Object.values(newFilters).some(Boolean)) {
      return;
    }

    setCurrentPage(1);
    setSelectedOid(null);
    setRibbonVisible(true);
    setCommitted({
      haku,
      nakyma,
      filters: newFilters,
    });
    queryClient.removeQueries({ queryKey: ['getHakemuksetHaulla'] });
  };

  // Älä näytä hakuja editorissa
  const pathname = usePathname();
  if (pathname.includes('/editori/')) {
    return null;
  }

  return (
    <Stack direction="column" flex={1} gap={theme.spacing(1)}>
      <Stack
        direction="row"
        alignItems="center"
        gap={theme.spacing(3)}
        flex={1}
      >
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
            onChange={(event) => setHaku(event.target.value)}
            endAdornment={
              <InputAdornment position="end">
                {haku && (
                  <CloseIcon
                    sx={{ cursor: 'pointer' }}
                    onClick={() => setHaku('')}
                  />
                )}
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
            onChange={(event: SelectChangeEvent) =>
              setNakyma(event.target.value)
            }
            inputProps={{ 'aria-label': t('haku.nakymaValinta') }}
          />
          <OphButton variant="contained" type="submit">
            {t('haku.hae')}
          </OphButton>
        </Stack>
        <OphButton
          variant="text"
          endIcon={
            filtersOpen ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />
          }
          onClick={() => setFiltersOpen((v) => !v)}
          sx={{ fontWeight: 400 }}
          data-testid="tarkat-hakuehdot"
        >
          {t('haku.tarkatHakuehdot')}
        </OphButton>
      </Stack>
      <Collapse in={filtersOpen} unmountOnExit>
        <SearchFilters
          values={{
            suoritusmaa,
            paattymisVuosi,
            todistusVuosi,
            oppilaitos,
            tutkinnonNimi,
            paaAine,
            kelpoisuus,
            opetettavatAineet,
            ratkaisutyyppi,
            paatostyyppi,
            sovellettuLaki,
            tutkinnonTaso,
            kielteinen,
            myonteinen,
            esittelijaOid,
            hakijanNimi,
            asiatunnus,
          }}
          setSuoritusmaa={setSuoritusmaa}
          setPaattymisVuosi={setPaattymisVuosi}
          setTodistusVuosi={setTodistusVuosi}
          setOppilaitos={setOppilaitos}
          setTutkinnonNimi={setTutkinnonNimi}
          setPaaAine={setPaaAine}
          setKelpoisuus={setKelpoisuus}
          setOpetettavatAineet={setOpetettavatAineet}
          setRatkaisutyyppi={setRatkaisutyyppi}
          setPaatostyyppi={setPaatostyyppi}
          setSovellettuLaki={setSovellettuLaki}
          setTutkinnonTaso={setTutkinnonTaso}
          setKielteinen={setKielteinen}
          setMyonteinen={setMyonteinen}
          setEsittelijaOid={setEsittelijaOid}
          setHakijanNimi={setHakijanNimi}
          setAsiatunnus={setAsiatunnus}
          onClearAll={() => {
            setSuoritusmaa('');
            setPaattymisVuosi('');
            setTodistusVuosi('');
            setOppilaitos('');
            setTutkinnonNimi('');
            setPaaAine('');
            setKelpoisuus('');
            setOpetettavatAineet('');
            setRatkaisutyyppi('');
            setPaatostyyppi('');
            setSovellettuLaki('');
            setTutkinnonTaso('');
            setKielteinen('');
            setMyonteinen('');
            setEsittelijaOid('');
            setHakijanNimi('');
            setAsiatunnus('');
          }}
        />
      </Collapse>
    </Stack>
  );
};
