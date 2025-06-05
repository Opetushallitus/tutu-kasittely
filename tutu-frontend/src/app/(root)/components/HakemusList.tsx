'use client';

import {
  styled,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { TableHeaderCell } from './TableHeaderCell';
import { parseAsStringLiteral, parseAsString, useQueryState } from 'nuqs';
import { naytaQueryStates } from '@/src/app/(root)/components/types';
import { setQueryStateAndLocalStorage } from '@/src/lib/utils';
import { useQueryClient } from '@tanstack/react-query';
import { ophColors } from '@opetushallitus/oph-design-system';
import { useHakemukset } from '@/src/hooks/useHakemukset';
import { FullSpinner } from '@/src/components/FullSpinner';
import { useTranslations } from '@/src/lib/localization/useTranslations';
import * as R from 'remeda';
import HakemusRow from '@/src/app/(root)/components/HakemusRow';
import { User } from '@/src/lib/types/user';

const TutuTableSortLabel = (props: {
  fieldKey: string;
  sortDef: string;
  handleSort: (sortDef: string) => void;
}) => {
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

const FIELD_KEYS = {
  hakijannimi: 'hakemuslista.hakijannimi',
  asiatunnus: 'hakemuslista.asiatunnus',
  esittelija: 'hakemuslista.esittelija',
  kasittelyvaihe: 'hakemuslista.kasittelyvaihe',
  hakemusKoskee: 'hakemuslista.hakemusKoskee',
  // hakijanaika: 'hakemuslista.hakijanaika',
  kokonaisaika: 'hakemuslista.kokonaisaika',
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
  const [nayta] = useQueryState(
    'nayta',
    parseAsStringLiteral(naytaQueryStates).withDefault('kaikki'),
  );

  const handleSort = (sortDef: unknown) => {
    setQueryStateAndLocalStorage(queryClient, setSortDef, sortDef);
  };

  if (isLoading) return <FullSpinner></FullSpinner>;

  const hakemusRows =
    data && user
      ? R.map(data, (hakemus) => {
          return (
            <HakemusRow
              hakemus={hakemus}
              nayta={nayta}
              key={hakemus.hakemusOid}
            ></HakemusRow>
          );
        })
      : [];

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            {R.map(Object.values(FIELD_KEYS), (fieldKey) =>
              nayta === 'omat' && fieldKey === FIELD_KEYS.esittelija ? null : (
                <TutuTableSortLabel
                  key={fieldKey}
                  fieldKey={fieldKey}
                  sortDef={sortDef}
                  handleSort={handleSort}
                />
              ),
            )}
          </TableRow>
        </TableHead>
        <StyledTableBody data-testid={'hakemus-list'} tabIndex={0}>
          {hakemusRows}
        </StyledTableBody>
      </Table>
    </TableContainer>
  );
}
