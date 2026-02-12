/* eslint-disable  @typescript-eslint/no-explicit-any */

'use client';

import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import {
  Box,
  styled,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { OphButton, ophColors } from '@opetushallitus/oph-design-system';
import { useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { parseAsInteger, useQueryState } from 'nuqs';
import { useEffect } from 'react';

import { FullSpinner } from '@/src/components/FullSpinner';
import { useFilemakerHakemukset } from '@/src/hooks/useFilemakerHakemukset';
import useToaster from '@/src/hooks/useToaster';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import {
  handleFetchError,
  setFilemakerQueryStateAndLocalStorage,
} from '@/src/lib/utils';
import { getters } from '@/src/lib/utils/filemakerDataUtils';

const FIELD_KEYS = {
  hakija: 'hakija',
  asiatunnus: 'asiatunnus',
};

const StyledTableBody = styled(TableBody)({
  '& .MuiTableRow-root': {
    '&:nth-of-type(even)': {
      '.MuiTableCell-root': {
        backgroundColor: ophColors.grey50,
      },
    },
    '&:nth-of-type(odd)': {
      '.MuiTableCell-root': {
        backgroundColor: ophColors.white,
      },
    },
    '&:hover': {
      '.MuiTableCell-root': {
        backgroundColor: ophColors.lightBlue2,
      },
    },
  },
});

const PageButton = styled(OphButton)({
  minWidth: 0,
  padding: '2px 10px',
});

export function FilemakerList() {
  const { addToast } = useToaster();
  const { t } = useTranslations();
  const queryClient = useQueryClient();

  const { isLoading, data, error } = useFilemakerHakemukset();
  useEffect(() => {
    handleFetchError(addToast, error, 'virhe.hakemuslistanLataus', t);
  }, [error, addToast, t]);

  const [page, setPage] = useQueryState(
    'fm-page',
    parseAsInteger.withDefault(1),
  );

  const [pageSize] = useQueryState(
    'fm-pagesize',
    parseAsInteger.withDefault(20),
  );

  const pageCount = data ? Math.ceil(data.count / pageSize) : 1;

  const selectPage = (page: number) => {
    setFilemakerQueryStateAndLocalStorage(queryClient, setPage, page);
  };
  const nextPage = () => {
    selectPage(Math.min(page + 1, pageCount));
  };
  const prevPage = () => {
    selectPage(Math.max(page - 1, 1));
  };

  if (isLoading) return <FullSpinner></FullSpinner>;

  const hakemusRows = data
    ? data?.items.map((hakemus) => {
        return <HakemusRow hakemus={hakemus} key={hakemus.id} />;
      })
    : [];

  return (
    <>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {Object.values(FIELD_KEYS).map((fieldKey) => (
                <HeaderCell key={fieldKey} fieldKey={fieldKey} />
              ))}
            </TableRow>
          </TableHead>
          <StyledTableBody data-testid={'hakemus-list'} tabIndex={0}>
            {hakemusRows}
          </StyledTableBody>
        </Table>
      </TableContainer>
      <Pagination
        page={page}
        pageCount={pageCount}
        nextPage={nextPage}
        prevPage={prevPage}
        selectPage={selectPage}
      />
    </>
  );
}

const StyledTableCell = styled(TableCell)({
  borderBottom: 'none',
});

const HakemusRow = ({ hakemus }: { hakemus: any }) => {
  return (
    <TableRow data-testid={'hakemus-row'}>
      <StyledTableCell>
        <Link href={`/filemaker-hakemus/${hakemus.id}`}>
          {getters.kokonimi(hakemus)}
        </Link>
      </StyledTableCell>
      <StyledTableCell>
        <Link href={`/filemaker-hakemus/${hakemus.id}`}>
          {getters.asiatunnus(hakemus)}
        </Link>
      </StyledTableCell>
    </TableRow>
  );
};

const StyledHeaderCell = styled(TableCell)(({ theme }) => ({
  padding: theme.spacing(0, 0, 1, 2),
  '&:last-child': {
    paddingRight: theme.spacing(2),
  },
  textAlign: 'left',
  'button:focus': {
    color: ophColors.blue2,
  },
}));

const HeaderCell = ({ fieldKey }: { fieldKey: string }) => {
  const { t } = useTranslations();

  return (
    <StyledHeaderCell>
      <span style={{ fontWeight: 600 }}>{t(`hakemuslista.${fieldKey}`)}</span>
    </StyledHeaderCell>
  );
};

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

const Pagination = ({
  page,
  pageCount,
  nextPage,
  prevPage,
  selectPage,
}: {
  page: number;
  pageCount: number;
  nextPage: VoidFunction;
  prevPage: VoidFunction;
  selectPage: (page: number) => void;
}) => {
  const { t } = useTranslations();
  const prevDisabled = page === 1 ? { disabled: true } : {};
  const nextDisabled = page >= pageCount ? { disabled: true } : {};
  return (
    <PaginationRow>
      <OphButton
        data-testid="fm-prev-page"
        {...prevDisabled}
        onClick={prevPage}
      >
        <PrevIcon /> {t('hakemuslista.edellinen')}
      </OphButton>
      <>{getPageButtons(page, pageCount, selectPage)}</>
      <OphButton
        data-testid="fm-next-page"
        {...nextDisabled}
        onClick={nextPage}
      >
        {t('hakemuslista.seuraava')} <NextIcon />
      </OphButton>
    </PaginationRow>
  );
};

const getPageButtons = (
  page: number,
  pageCount: number,
  selectPage: (page: number) => void,
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
      return (
        <PageButton
          key={`fm-pagination-link--${pagenum}-${index}`}
          variant={page === pagenum ? 'contained' : 'text'}
          onClick={
            page === pagenum ? undefined : () => selectPage(pagenum as number)
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
  const lastPage = pageCount;

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
