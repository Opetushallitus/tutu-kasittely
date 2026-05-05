'use client';

import FirstPageIcon from '@mui/icons-material/FirstPage';
import LastPageIcon from '@mui/icons-material/LastPage';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { Box, Stack, useTheme } from '@mui/material';
import { OphButton, OphTypography } from '@opetushallitus/oph-design-system';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { PageContent } from '@/src/components/PageLayout';
import { hakemusKoskeeOptions } from '@/src/constants/dropdownOptions';
import { useHakemusOriginal } from '@/src/context/HakemusContext';
import { useSearchRibbon } from '@/src/context/SearchRibbonContext';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import { DEFAULT_BOX_BORDER, ophColors } from '@/src/lib/theme';
import { HakemusKoskee } from '@/src/lib/types/hakemus';

import { FullSpinner } from './FullSpinner';

const ScrollArrow = ({
  direction,
  scrollRef,
}: {
  direction: 'left' | 'right';
  scrollRef: React.RefObject<HTMLDivElement | null>;
}) => {
  const Icon = direction === 'left' ? NavigateBeforeIcon : NavigateNextIcon;
  const sign = direction === 'left' ? -1 : 1;
  return (
    <Box
      sx={{
        position: 'absolute',
        [direction]: 0,
        top: 0,
        width: 30,
        background: ophColors.white,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
      }}
    >
      <Icon
        sx={{
          color: ophColors.blue2,
          pointerEvents: 'auto',
          cursor: 'pointer',
        }}
        onClick={() => {
          const el = scrollRef.current;
          if (!el) return;
          el.scrollBy({
            left: sign * Math.max(10, el.clientWidth - 247),
            behavior: 'smooth',
          });
        }}
      />
    </Box>
  );
};

const RibbonCard = ({
  name,
  asiatunnus,
  hakemusKoskeeLabel,
  isSelected,
  onClick,
}: {
  name: string;
  asiatunnus: string;
  hakemusKoskeeLabel: string;
  isSelected: boolean;
  onClick: () => void;
}) => {
  const border = isSelected
    ? `2px solid ${ophColors.grey700}`
    : `1px solid ${ophColors.grey400}`;

  return (
    <Box
      onClick={onClick}
      data-testid={`ribbon-card`}
      sx={{
        width: 247,
        minHeight: 130,
        padding: '4px 8px',
        border: border,
        borderRadius: '4px',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
      }}
    >
      <OphTypography variant="label">{name}</OphTypography>
      <OphTypography variant="body1">{asiatunnus}</OphTypography>
      <OphTypography variant="body1" sx={{ marginTop: 'auto' }}>
        {hakemusKoskeeLabel}
      </OphTypography>
    </Box>
  );
};

export const SearchResultsRibbon = () => {
  const theme = useTheme();
  const { t } = useTranslations();
  const {
    searchResults,
    selectedOid,
    setSelectedOid,
    currentPage,
    setCurrentPage,
    totalPages,
    ribbonVisible,
    closeRibbon,
  } = useSearchRibbon();

  const { data: originalHakemus, isLoading: isOriginalHakemusLoading } =
    useHakemusOriginal();

  const scrollRef = useRef<HTMLDivElement>(null);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const [showLeftArrow, setShowLeftArrow] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const update = () => {
      const atEnd = el.scrollLeft >= el.scrollWidth - el.clientWidth - 1;
      setShowRightArrow(el.scrollWidth > el.clientWidth && !atEnd);
      setShowLeftArrow(el.scrollLeft > 1);
    };
    update();
    el.addEventListener('scroll', update);
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener('scroll', update);
      ro.disconnect();
    };
  }, [searchResults]);

  // Nollaa scroll kun sivu tai tulokset vaihtuvat
  useEffect(() => {
    scrollRef.current?.scrollTo({ left: 0 });
  }, [currentPage, searchResults]);

  const pathname = usePathname();
  if (!ribbonVisible || pathname.includes('/editori/')) {
    return null;
  }

  const translateHakemusKoskee = (
    hakemusKoskee: HakemusKoskee,
    isApHakemus: boolean | undefined | null,
  ) => {
    if (isApHakemus) {
      hakemusKoskee = HakemusKoskee.KELPOISUUS_AMMATTIIN_AP;
    }
    const label = hakemusKoskeeOptions.find(
      (o) => o.value === String(hakemusKoskee),
    )?.label;

    return t(`valinnat.hakemusKoskeeValinta.${label}`);
  };

  return (
    <PageContent
      data-testid="search-results-ribbon"
      sx={{
        backgroundColor: ophColors.white,
        border: DEFAULT_BOX_BORDER,
      }}
    >
      <Stack
        direction="column"
        gap={theme.spacing(0.5)}
        sx={{ paddingY: theme.spacing(1) }}
      >
        <Stack direction="row" alignItems="center">
          <Box sx={{ width: 247, flexShrink: 0, marginRight: 2 }}>
            <OphTypography variant="label" sx={{ fontWeight: 'bold' }}>
              {t('haku.hakemuksesi')}
            </OphTypography>
          </Box>

          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            flex={1}
            gap={theme.spacing(1)}
          >
            <Stack direction="row" alignItems="center">
              <OphTypography variant="label" sx={{ fontWeight: 'bold' }}>
                {t('haku.hakutuloksesi')}
              </OphTypography>

              {searchResults && (
                <>
                  <OphTypography variant="body1" sx={{ mx: theme.spacing(1) }}>
                    {currentPage} / {totalPages}
                  </OphTypography>

                  <OphButton
                    variant="text"
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage(1)}
                    aria-label={t('yleiset.ensimmainenSivu')}
                    startIcon={<FirstPageIcon />}
                    sx={{ px: 0 }}
                  />
                  <OphButton
                    variant="text"
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                    sx={{ marginRight: theme.spacing(1), px: 0 }}
                  >
                    <NavigateBeforeIcon />
                    {t('hakemuslista.edellinen')}
                  </OphButton>
                  <OphButton
                    variant="text"
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                    sx={{ marginLeft: theme.spacing(1), px: 0 }}
                  >
                    {t('hakemuslista.seuraava')}
                    <NavigateNextIcon />
                  </OphButton>
                  <OphButton
                    variant="text"
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage(totalPages)}
                    aria-label={t('yleiset.viimeinenSivu')}
                    startIcon={<LastPageIcon />}
                    sx={{ px: 0 }}
                  />
                </>
              )}
            </Stack>

            <OphButton
              variant="text"
              onClick={closeRibbon}
              sx={{ whiteSpace: 'nowrap', flexShrink: 0 }}
            >
              {t('haku.suljeJaPalaaHakemukseesi')}
            </OphButton>
          </Stack>
        </Stack>

        <Stack direction="row" alignItems="stretch">
          {/* Alkuperäinen hakemus */}
          <Box
            sx={{ width: 247, flexShrink: 0, marginRight: 2, display: 'flex' }}
          >
            {isOriginalHakemusLoading ? (
              <FullSpinner minHeight={130} />
            ) : (
              originalHakemus && (
                <RibbonCard
                  name={`${originalHakemus.hakija.sukunimi}, ${originalHakemus.hakija.etunimet}`}
                  asiatunnus={originalHakemus.asiatunnus}
                  hakemusKoskeeLabel={translateHakemusKoskee(
                    originalHakemus.hakemusKoskee,
                    originalHakemus.asiakirja.apHakemus,
                  )}
                  isSelected={selectedOid === null}
                  onClick={() => setSelectedOid(null)}
                />
              )
            )}
          </Box>

          {/* Hakutulokset */}
          <Box sx={{ position: 'relative', flex: 1, overflow: 'hidden' }}>
            {!searchResults ? (
              <FullSpinner minHeight={130} />
            ) : (
              <>
                <Box
                  ref={scrollRef}
                  sx={{
                    display: 'flex',
                    gap: theme.spacing(1),
                    overflowX: 'auto',
                    scrollbarWidth: 'none',
                  }}
                >
                  {searchResults.map((result) => (
                    <RibbonCard
                      key={result.hakemusOid}
                      name={`${result.hakija.sukunimi}, ${result.hakija.etunimet}`}
                      asiatunnus={result.asiatunnus}
                      hakemusKoskeeLabel={translateHakemusKoskee(
                        result.hakemusKoskee,
                        result.apHakemus,
                      )}
                      isSelected={selectedOid === result.hakemusOid}
                      onClick={() => setSelectedOid(result.hakemusOid)}
                    />
                  ))}
                </Box>
                {showLeftArrow && (
                  <ScrollArrow direction="left" scrollRef={scrollRef} />
                )}
                {showRightArrow && (
                  <ScrollArrow direction="right" scrollRef={scrollRef} />
                )}
              </>
            )}
          </Box>
        </Stack>
      </Stack>
    </PageContent>
  );
};
