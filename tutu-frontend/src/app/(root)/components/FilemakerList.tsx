/* eslint-disable  @typescript-eslint/no-explicit-any */

'use client';

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
import {
  handleFetchError,
  setFilemakerQueryStateAndLocalStorage,
} from '@/src/lib/utils';
import { OphButton, ophColors } from '@opetushallitus/oph-design-system';
import { FullSpinner } from '@/src/components/FullSpinner';
import useToaster from '@/src/hooks/useToaster';
import { useEffect } from 'react';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import { useFilemakerHakemukset } from '@/src/hooks/useFilemakerHakemukset';
import Link from 'next/link';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { parseAsInteger, useQueryState } from 'nuqs';
import { useQueryClient } from '@tanstack/react-query';

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

  const [page, setPage] = useQueryState(
    'fm-page',
    parseAsInteger.withDefault(1),
  );

  const nextPage = () => {
    setFilemakerQueryStateAndLocalStorage(queryClient, setPage, page + 1);
  };
  const prevPage = () => {
    setFilemakerQueryStateAndLocalStorage(
      queryClient,
      setPage,
      Math.max(page - 1, 1),
    );
  };

  if (isLoading) return <FullSpinner></FullSpinner>;

  const hakemusRows = data
    ? data.map((hakemus) => {
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
      <Pagination page={page} nextPage={nextPage} prevPage={prevPage} />
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
          {hakemus['Koko nimi']}
        </Link>
      </StyledTableCell>
      <StyledTableCell>
        <Link href={`/filemaker-hakemus/${hakemus.id}`}>
          {hakemus.Asiatunnus}
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
  nextPage,
  prevPage,
}: {
  page: number;
  nextPage: VoidFunction;
  prevPage: VoidFunction;
}) => {
  const { t } = useTranslations();
  const disabled = page === 1 ? { disabled: true } : {};
  return (
    <PaginationRow>
      <OphButton data-testid="fm-prev-page" {...disabled} onClick={prevPage}>
        <PrevIcon /> {t('hakemuslista.edellinen')}
      </OphButton>
      <span data-testid="fm-page-view">{page}</span>
      <OphButton data-testid="fm-next-page" onClick={nextPage}>
        {t('hakemuslista.seuraava')} <NextIcon />
      </OphButton>
    </PaginationRow>
  );
};
