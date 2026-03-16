/* eslint-disable  @typescript-eslint/no-explicit-any */

'use client';

import {
  styled,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { ophColors } from '@opetushallitus/oph-design-system';
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

import PaginationButtons from './PaginationButtons';

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

export function FilemakerList() {
  const { addToast } = useToaster();
  const { t } = useTranslations();
  const queryClient = useQueryClient();

  const { isLoading, data, error } = useFilemakerHakemukset();

  useEffect(() => {
    handleFetchError(addToast, error, 'virhe.hakemuslistanLataus', t);
  }, [error, addToast, t]);

  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));

  const selectPage = (page: number): Promise<void> => {
    return setFilemakerQueryStateAndLocalStorage(queryClient, setPage, page);
  };

  const pageCount = data ? data.totalPages : 1;

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
          <StyledTableBody data-testid={'filemaker-hakemus-list'} tabIndex={0}>
            {hakemusRows}
          </StyledTableBody>
        </Table>
      </TableContainer>
      <PaginationButtons
        page={page}
        pageCount={pageCount}
        selectPage={selectPage}
      />
    </>
  );
}

const StyledTableCell = styled(TableCell)({
  borderBottom: 'none',
});

const HakemusRow = ({ hakemus }: { hakemus: any }) => {
  const kokonimi = getters.kokonimi(hakemus);
  const asiatunnus = getters.asiatunnus(hakemus);
  return (
    <TableRow data-testid={'filemaker-hakemus-row'}>
      <StyledTableCell>
        <Link href={`/filemaker-hakemus/${hakemus.id}`}>
          {kokonimi ? kokonimi : '-'}
        </Link>
      </StyledTableCell>
      <StyledTableCell>
        <Link href={`/filemaker-hakemus/${hakemus.id}`}>
          {asiatunnus ? asiatunnus : '-'}
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
