'use client';

import { useState } from 'react';
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
import ExpandMore from '@mui/icons-material/ExpandMore';
import { ophColors } from '@opetushallitus/oph-design-system';
import { useHakemukset } from '@/src/hooks/useHakemukset';
import { FullSpinner } from '@/src/components/FullSpinner';
import { useTranslations } from '@/src/lib/localization/useTranslations';
import * as R from 'remeda';
import HakemusRow from '@/src/app/(root)/components/HakemusRow';
import { User } from '@/src/lib/types/user';

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
  const [sortField, setSortField] = useState();
  const [sortOrder, setSortOrder] = useState();
  const { isLoading, data } = useHakemukset();

  const handleSort = (field) => () => {
    const isAsc = sortField === field && sortOrder === 'asc';
    setSortOrder(isAsc ? 'desc' : 'asc');
    setSortField(field);
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
                fieldKey={'hakemuslista.hakijannimi'}
                sortField={sortField}
                sortOrder={sortOrder}
                handleSort={handleSort}
              />
            </TableCell>
            <TableCell>
              <TutuTableSortLabel
                fieldKey={'hakemuslista.asiatunnus'}
                sortField={sortField}
                sortOrder={sortOrder}
                handleSort={handleSort}
              />
            </TableCell>
            <TableCell>
              <TutuTableSortLabel
                fieldKey={'hakemuslista.kasittelyvaihe'}
                sortField={sortField}
                sortOrder={sortOrder}
                handleSort={handleSort}
              />
            </TableCell>
            <TableCell>
              <TutuTableSortLabel
                fieldKey={'hakemuslista.hakemusKoskee'}
                sortField={sortField}
                sortOrder={sortOrder}
                handleSort={handleSort}
              />
            </TableCell>
            <TableCell>
              <TutuTableSortLabel
                fieldKey={'hakemuslista.hakijanaika'}
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
