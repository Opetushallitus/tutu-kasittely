'use client';

import FirstPageIcon from '@mui/icons-material/FirstPage';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import LastPageIcon from '@mui/icons-material/LastPage';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { Box, Stack, Theme, useTheme } from '@mui/material';
import { OphButton, OphTypography } from '@opetushallitus/oph-design-system';
import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { PageContent } from '@/src/components/PageLayout';
import { hakemusKoskeeOptions } from '@/src/constants/dropdownOptions';
import { useHakemusOriginal } from '@/src/context/HakemusContext';
import { useSearchRibbon } from '@/src/context/SearchRibbonContext';
import {
  TFunction,
  useTranslations,
} from '@/src/lib/localization/hooks/useTranslations';
import { DEFAULT_BOX_BORDER, ophColors } from '@/src/lib/theme';
import { HakemusKoskee } from '@/src/lib/types/hakemus';

import { FullSpinner } from './FullSpinner';

const EmptyList: React.FC<{ t: TFunction; theme: Theme }> = ({ t, theme }) => {
  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.spacing(0.5),
        position: 'absolute',
        inset: 2,
      }}
    >
      <Box
        data-testid="search-results-empty-icon"
        sx={{
          height: 40,
          width: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: ophColors.grey50,
          borderRadius: '50%',
        }}
      >
        <FolderOutlinedIcon sx={{ color: ophColors.grey700 }} />
      </Box>
      <OphTypography variant="body1">{t('haku.eiTuloksia')}</OphTypography>
    </Box>
  );
};

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
        bottom: 0,
        width: 30,
        background: 'rgba(255, 255, 255, 0.8)',
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
          fontSize: 32,
          display: 'block',
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
        marginBottom: '12px',
        cursor: 'pointer',
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
    setSelectedOid,
    selectedIndex,
    setSelectedIndex,
    totalCount,
    pageSize,
    ribbonVisible,
    closeRibbon,
    fetchPage,
  } = useSearchRibbon();
  const { data: originalHakemus } = useHakemusOriginal();

  const scrollRef = useRef<HTMLDivElement>(null);
  const lastSelectedRef = useRef<number | null>(null);
  const selectionOriginRef = useRef<'user' | 'nav' | null>(null);
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

  // Observe placeholders: fetch their page when they appear.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !fetchPage) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const page = Number(
            (entry.target as HTMLElement).dataset.placeholderPage,
          );
          if (page) {
            fetchPage(page);
          }
        }
      },
      { root: el },
    );
    const placeholders = el.querySelectorAll<HTMLElement>(
      '[data-placeholder-page]',
    );
    placeholders.forEach((p) => observer.observe(p));
    return () => observer.disconnect();
  }, [searchResults, fetchPage]);

  // When selectedIndex changes, ensure currentPage and selectedOid stay in sync
  useEffect(() => {
    if (selectedIndex == null || selectedIndex === -1 || !totalCount) return;
    if (searchResults && searchResults.length) {
      const item = searchResults[selectedIndex];
      if (item) {
        setSelectedOid(item.hakemusOid);
      }
    }
  }, [selectedIndex, pageSize, searchResults, setSelectedOid, totalCount]);

  // Scroll the selected card into view when it's on the currently loaded page.
  // Only auto-scroll when the selection originated from navigation controls.
  useEffect(() => {
    const el = scrollRef.current;
    if (selectedIndex == null || !searchResults || !pageSize || !el) {
      return;
    }

    const cards = el.querySelectorAll('[data-testid="ribbon-card"]');
    const target = cards[selectedIndex] as HTMLElement | undefined;
    if (!target) return;

    if (selectionOriginRef.current !== 'nav') {
      // Don't scroll when user clicks a card directly.
      selectionOriginRef.current = null;
      lastSelectedRef.current = selectedIndex;
      return;
    }

    const last = lastSelectedRef.current;
    const forward = last == null ? true : selectedIndex > last;

    const overlayWidth = 30; // ScrollArrow width
    let desiredLeft = 0;
    if (forward) {
      desiredLeft =
        target.offsetLeft - (target.offsetLeft > 1 ? overlayWidth : 0);
    } else {
      desiredLeft =
        target.offsetLeft > 1 ? target.offsetLeft - overlayWidth : 0;
    }

    desiredLeft = Math.max(
      0,
      Math.min(desiredLeft, el.scrollWidth - el.clientWidth),
    );
    el.scrollTo({ left: desiredLeft, behavior: 'instant' });
    lastSelectedRef.current = selectedIndex;
    selectionOriginRef.current = null;
  }, [
    selectedIndex,
    searchResults,
    pageSize,
    showLeftArrow,
    showRightArrow,
    fetchPage,
  ]);

  const { pathname } = useLocation();
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
        sx={{ paddingY: '8px' }}
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

              {Boolean(searchResults?.length) && (
                <>
                  <OphTypography variant="body1" sx={{ mx: theme.spacing(1) }}>
                    {`${selectedIndex! + 1} / ${totalCount}`}
                  </OphTypography>

                  <OphButton
                    variant="text"
                    disabled={!totalCount}
                    onClick={() => {
                      // First item
                      selectionOriginRef.current = 'nav';
                      setSelectedIndex(0);
                    }}
                    aria-label={t('yleiset.ensimmainenSivu')}
                    startIcon={<FirstPageIcon />}
                    sx={{ px: 0 }}
                  />
                  <OphButton
                    variant="text"
                    disabled={!totalCount}
                    onClick={() => {
                      // Previous item
                      if (selectedIndex == null) return;
                      const newAbs = Math.max(0, selectedIndex - 1);
                      selectionOriginRef.current = 'nav';
                      setSelectedIndex(newAbs);
                    }}
                    sx={{ marginRight: theme.spacing(1), px: 0 }}
                  >
                    <NavigateBeforeIcon />
                    {t('hakemuslista.edellinen')}
                  </OphButton>
                  <OphButton
                    variant="text"
                    disabled={!totalCount}
                    onClick={() => {
                      // Next item
                      if (selectedIndex == null) return;
                      const newAbs = Math.min(
                        totalCount - 1,
                        selectedIndex + 1,
                      );
                      selectionOriginRef.current = 'nav';
                      setSelectedIndex(newAbs);
                    }}
                    sx={{ marginLeft: theme.spacing(1), px: 0 }}
                  >
                    {t('hakemuslista.seuraava')}
                    <NavigateNextIcon />
                  </OphButton>
                  <OphButton
                    variant="text"
                    disabled={!totalCount}
                    onClick={() => {
                      // Last item
                      const lastAbs = Math.max(0, totalCount - 1);
                      selectionOriginRef.current = 'nav';
                      setSelectedIndex(lastAbs);
                    }}
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

        <Box
          sx={{
            position: 'relative',
            display: 'flex',
            alignItems: 'stretch',
            minHeight: 130,
          }}
        >
          {/* Alkuperäinen hakemus */}
          <Box
            sx={{
              width: 247,
              flexShrink: 0,
              marginRight: 2,
              display: 'flex',
              zIndex: 1,
            }}
          >
            {originalHakemus && (
              <RibbonCard
                name={`${originalHakemus.hakija.sukunimi}, ${originalHakemus.hakija.etunimet}`}
                asiatunnus={originalHakemus.asiatunnus}
                hakemusKoskeeLabel={translateHakemusKoskee(
                  originalHakemus.hakemusKoskee,
                  originalHakemus.asiakirja.apHakemus,
                )}
                isSelected={selectedIndex === -1}
                onClick={() => {
                  selectionOriginRef.current = 'user';
                  setSelectedOid(null);
                  setSelectedIndex(-1);
                }}
              />
            )}
          </Box>

          {/* Hakutulokset */}
          {totalCount === 0 ? (
            // No results known yet
            searchResults === null ? (
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <FullSpinner />
              </Box>
            ) : (
              <EmptyList t={t} theme={theme} />
            )
          ) : (
            <Box
              sx={{
                position: 'relative',
                flex: 1,
                overflow: 'hidden',
                minHeight: 130,
              }}
            >
              <Box
                ref={scrollRef}
                sx={{
                  display: 'flex',
                  gap: theme.spacing(1),
                  overflowX: 'auto',
                  scrollbarWidth: 'none',
                }}
              >
                {Array.from({ length: totalCount }).map((_, absIndex) => {
                  const item = searchResults?.[absIndex];
                  if (item) {
                    return (
                      <RibbonCard
                        key={item.hakemusOid}
                        name={`${item.hakija.sukunimi}, ${item.hakija.etunimet}`}
                        asiatunnus={item.asiatunnus}
                        hakemusKoskeeLabel={translateHakemusKoskee(
                          item.hakemusKoskee,
                          item.apHakemus,
                        )}
                        isSelected={selectedIndex === absIndex}
                        onClick={() => {
                          selectionOriginRef.current = 'user';
                          setSelectedIndex(absIndex);
                        }}
                      />
                    );
                  }
                  // Placeholder for not yet loaded item
                  const isSelected = selectedIndex === absIndex;
                  const placeholderBorder = isSelected
                    ? `2px solid ${ophColors.grey700}`
                    : `1px dashed ${ophColors.grey300}`;

                  return (
                    <Box
                      key={`placeholder-${absIndex}`}
                      data-testid={`ribbon-card`}
                      data-placeholder-page={
                        Math.floor(absIndex / pageSize) + 1
                      }
                      onClick={() => {
                        selectionOriginRef.current = 'user';
                        setSelectedIndex(absIndex);
                      }}
                      sx={{
                        width: 247,
                        minHeight: 130,
                        padding: '4px 8px',
                        border: placeholderBorder,
                        borderRadius: '4px',
                        display: 'flex',
                        flexDirection: 'column',
                        flexShrink: 0,
                        marginBottom: '12px',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: ophColors.grey500,
                        cursor: 'pointer',
                      }}
                    >
                      <FullSpinner />
                    </Box>
                  );
                })}
              </Box>
              {showLeftArrow && (
                <ScrollArrow direction="left" scrollRef={scrollRef} />
              )}
              {showRightArrow && (
                <ScrollArrow direction="right" scrollRef={scrollRef} />
              )}
            </Box>
          )}
        </Box>
      </Stack>
    </PageContent>
  );
};
