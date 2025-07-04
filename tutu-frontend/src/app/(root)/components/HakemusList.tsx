'use client';

import {
  styled,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import TableSortLabel from './TableSortLabel';
import { parseAsStringLiteral, parseAsString, useQueryState } from 'nuqs';
import { naytaQueryStates } from '@/src/app/(root)/components/types';
import {
  handleFetchError,
  setQueryStateAndLocalStorage,
} from '@/src/lib/utils';
import { useQueryClient } from '@tanstack/react-query';
import { ophColors } from '@opetushallitus/oph-design-system';
import { useHakemukset } from '@/src/hooks/useHakemukset';
import { FullSpinner } from '@/src/components/FullSpinner';
import * as R from 'remeda';
import HakemusRow from '@/src/app/(root)/components/HakemusRow';
import { User } from '@/src/lib/types/user';
import useToaster from '@/src/hooks/useToaster';
import { useEffect } from 'react';
import { useTranslations } from '@/src/lib/localization/useTranslations';

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
  const { addToast } = useToaster();
  const { t } = useTranslations();
  const [sortDef, setSortDef] = useQueryState(
    'hakemuslista.sort',
    parseAsString.withDefault(''),
  );
  const { isLoading, data, error } = useHakemukset();
  useEffect(() => {
    handleFetchError(addToast, error, 'virhe.hakemus-listan-lataus', t);
  }, [error, addToast, t]);

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
                <TableSortLabel
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
