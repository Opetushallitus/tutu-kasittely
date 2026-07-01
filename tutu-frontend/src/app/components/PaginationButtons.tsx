import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { Box, styled } from '@mui/material';
import { OphButton } from '@opetushallitus/oph-design-system';
import React from 'react';

import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';

const PageButton = styled(OphButton)({
  minWidth: 0,
  padding: '2px 10px',
});

const PaginationRow = styled(Box)({
  flexDirection: 'row',
  justifySelf: 'center',
});

const NextIcon = styled(ChevronRightIcon)({
  alignSelf: 'end',
  marginBottom: '-1px',
});

const PrevIcon = styled(ChevronLeftIcon)({
  alignSelf: 'end',
  marginBottom: '-1px',
});

export const PaginationButtons = ({
  page,
  pageCount,
  selectPage,
}: {
  page: number;
  pageCount: number;
  selectPage: (page: number) => Promise<void>;
}) => {
  const { t } = useTranslations();
  const prevDisabled = page === 1 ? { disabled: true } : {};
  const nextDisabled = page >= pageCount ? { disabled: true } : {};

  return (
    <PaginationRow>
      <OphButton
        aria-label={t('hakemuslista.edellinen')}
        data-testid="prev-page"
        {...prevDisabled}
        onClick={async () => {
          await selectPage(page - 1);
          if (typeof window !== 'undefined') {
            window.scrollTo({ top: 0, behavior: 'instant' });
          }
        }}
      >
        <PrevIcon /> {t('hakemuslista.edellinen')}
      </OphButton>
      <>{getPageButtons(page, pageCount, selectPage)}</>
      <OphButton
        aria-label={t('hakemuslista.seuraava')}
        data-testid="next-page"
        {...nextDisabled}
        onClick={async () => {
          await selectPage(page + 1);
          if (typeof window !== 'undefined') {
            window.scrollTo({ top: 0, behavior: 'instant' });
          }
        }}
      >
        {t('hakemuslista.seuraava')} <NextIcon />
      </OphButton>
    </PaginationRow>
  );
};

const getPageButtons = (
  page: number,
  pageCount: number,
  selectPage: (page: number) => Promise<void>,
) => {
  const pageNumbers = getPageNumbers(page, pageCount);

  const pageNumbersWithGaps: (number | string)[] = pageNumbers.flatMap(
    (pagenum, index, arr) => {
      if (index > 0 && arr[index] - arr[index - 1] > 1) {
        return ['...', pagenum];
      }
      return pagenum;
    },
  );

  return pageNumbersWithGaps.map((pagenum, index) => {
    if (Number.isFinite(pagenum)) {
      const testId =
        page === pagenum ? { 'data-testid': 'page-view' } : undefined;
      return (
        <PageButton
          key={`pagination-link--${pagenum}-${index}`}
          variant={page === pagenum ? 'contained' : 'text'}
          {...testId}
          onClick={
            page === pagenum
              ? undefined
              : async () => {
                  await selectPage(pagenum as number);
                  if (typeof window !== 'undefined') {
                    window.scrollTo({ top: 0, behavior: 'instant' });
                  }
                }
          }
        >
          {pagenum}
        </PageButton>
      );
    }
    return '...';
  });
};

const getPageNumbers = (page: number, pageCount: number) => {
  const firstPage = 1;
  const lastPage = Math.max(pageCount, 1);

  const nearbyPages = [page - 2, page - 1, page, page + 1, page + 2];
  const adjustedNearbyPages = adjustUp(
    firstPage,
    adjustDown(lastPage, nearbyPages),
  );
  const prunedNearbyPages = adjustedNearbyPages
    .filter((val) => val > firstPage)
    .filter((val) => val < lastPage);

  const uniquePageNumbers = new Set([
    firstPage,
    ...prunedNearbyPages,
    lastPage,
  ]);

  return [...uniquePageNumbers];
};

const adjustUp = (firstPage: number, nearbyPages: number[]) => {
  const adjustAmount = Math.max(firstPage - nearbyPages[0], 0);
  return nearbyPages.map((val) => val + adjustAmount);
};

const adjustDown = (lastPage: number, nearbyPages: number[]) => {
  const adjustAmount = Math.max(
    nearbyPages[nearbyPages.length - 1] - lastPage,
    0,
  );
  return nearbyPages.map((val) => val - adjustAmount);
};

export default PaginationButtons;
