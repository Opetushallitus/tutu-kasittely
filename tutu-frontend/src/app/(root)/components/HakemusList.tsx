'use client';

import { Table, TableContainer, TableHead, TableRow } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import {
  parseAsInteger,
  parseAsStringLiteral,
  parseAsString,
  useQueryState,
} from 'nuqs';
import { useEffect } from 'react';
import * as R from 'remeda';

import HakemusRow from '@/src/app/(root)/components/HakemusRow';
import { naytaQueryStates } from '@/src/app/(root)/components/types';
import { FullSpinner } from '@/src/components/FullSpinner';
import { StyledTableBody } from '@/src/components/StyledTableBody';
import { useHakemukset } from '@/src/hooks/useHakemukset';
import useToaster from '@/src/hooks/useToaster';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import { User } from '@/src/lib/types/user';
import {
  handleFetchError,
  setQueryStateAndLocalStorage,
} from '@/src/lib/utils';

import PaginationButtons from './PaginationButtons';
import TableSortLabel from './TableSortLabel';

const FIELD_KEYS = {
  hakija: 'hakija',
  asiatunnus: 'asiatunnus',
  esittelija: 'esittelija',
  kasittelyvaihe: 'kasittelyvaihe',
  hakemusKoskee: 'hakemusKoskee',
  saapumisPvm: 'saapumisPvm',
  kokonaisaika: 'kokonaisaika',
  hakijanaika: 'hakijanaika',
};

interface HakemusListProps {
  user: User | null;
}

export function HakemusList({ user }: HakemusListProps) {
  const queryClient = useQueryClient();
  const { addToast } = useToaster();
  const { t } = useTranslations();

  const { isLoading, data, error } = useHakemukset();

  useEffect(() => {
    handleFetchError(addToast, error, 'virhe.hakemuslistanLataus', t);
  }, [error, addToast, t]);

  const [sortDef, setSortDef] = useQueryState('sort', {
    ...parseAsString.withDefault('saapumisPvm:desc'),
    clearOnDefault: false,
  });

  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));

  const [nayta] = useQueryState(
    'nayta',
    parseAsStringLiteral(naytaQueryStates).withDefault('kaikki'),
  );

  const handleSort = (sortDef: unknown) => {
    setPage(1);
    setQueryStateAndLocalStorage(queryClient, setSortDef, sortDef);
  };

  if (isLoading) return <FullSpinner></FullSpinner>;

  const hakemusRows =
    data && user
      ? R.map(data.items, (hakemus) => {
          return (
            <HakemusRow
              hakemus={hakemus}
              nayta={nayta}
              key={hakemus.hakemusOid}
            ></HakemusRow>
          );
        })
      : [];

  const selectPage = (page: number): Promise<void> => {
    return setQueryStateAndLocalStorage(queryClient, setPage, page);
  };

  const pageCount = data ? data.totalPages : 1;

  return (
    <>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {R.map(Object.values(FIELD_KEYS), (fieldKey) =>
                nayta === 'omat' &&
                fieldKey === FIELD_KEYS.esittelija ? null : (
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
      <PaginationButtons
        page={page}
        pageCount={pageCount}
        selectPage={selectPage}
      />
    </>
  );
}
