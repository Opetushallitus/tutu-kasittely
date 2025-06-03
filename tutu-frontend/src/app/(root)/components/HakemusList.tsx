'use client';

import {
  styled,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
} from '@mui/material';
import { parseAsStringLiteral, useQueryState } from 'nuqs';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { ophColors } from '@opetushallitus/oph-design-system';
import { useHakemukset } from '@/src/hooks/useHakemukset';
import { FullSpinner } from '@/src/components/FullSpinner';
import { useTranslations } from '@/src/lib/localization/useTranslations';
import * as R from 'remeda';
import HakemusRow from '@/src/app/(root)/components/HakemusRow';
import { User } from '@/src/lib/types/user';
import { setQueryStateAndLocalStorage } from '@/src/lib/utils';
import { useQueryClient } from '@tanstack/react-query';

const FIELD_KEYS = {
  hakijannimi: 'hakemuslista.hakijannimi',
  asiatunnus: 'hakemuslista.asiatunnus',
  kasittelyvaihe: 'hakemuslista.kasittelyvaihe',
  hakemusKoskee: 'hakemuslista.hakemusKoskee',
  hakijanaika: 'hakemuslista.hakijanaika',
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

interface HakemusListProps {
  user: User | null;
}

export function HakemusList({ user }: HakemusListProps) {
  const queryClient = useQueryClient();
  const [sortField, setSortField] = useQueryState(
    'hakemuslista.sortfield',
    parseAsStringLiteral([...Object.values(FIELD_KEYS), '']).withDefault(''),
  );
  const [sortOrder, setSortOrder] = useQueryState(
    'hakemuslista.sortorder',
    parseAsStringLiteral(['', 'asc', 'desc']).withDefault(''),
  );
  const { isLoading, data } = useHakemukset();

  const handleSort = (field) => () => {
    const isAsc = sortField === field && sortOrder === 'asc';
    const newSortOrder = isAsc ? 'desc' : 'asc';
    setQueryStateAndLocalStorage(queryClient, setSortOrder, newSortOrder);
    setQueryStateAndLocalStorage(queryClient, setSortField, field);
  };

  if (isLoading) return <FullSpinner></FullSpinner>;

  const hakemusRows =
    data && user
      ? R.map(data, (hakemus) => {
          return (
            <HakemusRow hakemus={hakemus} key={hakemus.hakemusOid}></HakemusRow>
          );
        })
      : [];

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>
              <TutuTableSortLabel
                fieldKey={FIELD_KEYS.hakijannimi}
                sortField={sortField}
                sortOrder={sortOrder}
                handleSort={handleSort}
              />
            </TableCell>
            <TableCell>
              <TutuTableSortLabel
                fieldKey={FIELD_KEYS.asiatunnus}
                sortField={sortField}
                sortOrder={sortOrder}
                handleSort={handleSort}
              />
            </TableCell>
            <TableCell>
              <TutuTableSortLabel
                fieldKey={FIELD_KEYS.kasittelyvaihe}
                sortField={sortField}
                sortOrder={sortOrder}
                handleSort={handleSort}
              />
            </TableCell>
            <TableCell>
              <TutuTableSortLabel
                fieldKey={FIELD_KEYS.hakemusKoskee}
                sortField={sortField}
                sortOrder={sortOrder}
                handleSort={handleSort}
              />
            </TableCell>
            <TableCell>
              <TutuTableSortLabel
                fieldKey={FIELD_KEYS.hakijanaika}
                sortField={sortField}
                sortOrder={sortOrder}
                handleSort={handleSort}
              />
            </TableCell>
          </TableRow>
        </TableHead>
        <StyledTableBody data-testid={'hakemus-list'} tabIndex={0}>
          {hakemusRows}
        </StyledTableBody>
      </Table>
    </TableContainer>
  );
}

const TutuTableSortLabel = (props) => {
  const { fieldKey, sortField, sortOrder, handleSort } = props;
  const { t } = useTranslations();
  return (
    <TableSortLabel
      active={sortField === fieldKey}
      direction={sortField === fieldKey ? sortOrder : 'asc'}
      onClick={handleSort(fieldKey)}
      IconComponent={ExpandMore}
    >
      {t(fieldKey)}
    </TableSortLabel>
  );
};
