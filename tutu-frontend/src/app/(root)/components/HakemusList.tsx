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
import { TableHeaderCell } from './TableHeaderCell';
import { parseAsString, useQueryState } from 'nuqs';
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
  const [sortDef, setSortDef] = useQueryState(
    'hakemuslista.sort',
    parseAsString.withDefault(''),
  );
  const { isLoading, data } = useHakemukset();

  const handleSort = (sortDef) => {
    setQueryStateAndLocalStorage(queryClient, setSortDef, sortDef);
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
            {Object.values(FIELD_KEYS).map((fieldKey) => (
              <TableCell key={fieldKey}>
                <TutuTableSortLabel
                  fieldKey={fieldKey}
                  sortDef={sortDef}
                  handleSort={handleSort}
                />
              </TableCell>
            ))}
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
  const { fieldKey, sortDef, handleSort } = props;
  const { t } = useTranslations();
  return (
    <TableHeaderCell
      colId={fieldKey}
      sort={sortDef}
      title={t(fieldKey)}
      setSort={handleSort}
      sortable={true}
    />
  );
};
