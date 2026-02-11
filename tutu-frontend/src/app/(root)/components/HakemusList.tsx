'use client';

import { Table, TableContainer, TableHead, TableRow } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { parseAsStringLiteral, parseAsString, useQueryState } from 'nuqs';
import { useEffect } from 'react';
import * as R from 'remeda';

import HakemusRow from '@/src/app/(root)/components/HakemusRow';
import StyledTableBody from '@/src/app/(root)/components/StyledTableBody';
import { naytaQueryStates } from '@/src/app/(root)/components/types';
import { FullSpinner } from '@/src/components/FullSpinner';
import { useHakemukset } from '@/src/hooks/useHakemukset';
import useToaster from '@/src/hooks/useToaster';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import { User } from '@/src/lib/types/user';
import {
  handleFetchError,
  setQueryStateAndLocalStorage,
} from '@/src/lib/utils';

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
  const [sortDef, setSortDef] = useQueryState('sort', {
    ...parseAsString.withDefault('saapumisPvm:desc'),
    clearOnDefault: false,
  });
  const { isLoading, data, error } = useHakemukset();
  useEffect(() => {
    handleFetchError(addToast, error, 'virhe.hakemuslistanLataus', t);
  }, [error, addToast, t]);

  const [nayta] = useQueryState(
    'nayta',
    parseAsStringLiteral(naytaQueryStates).withDefault('kaikki'),
  );

  const handleSort = async (sortDef: unknown) => {
    await setQueryStateAndLocalStorage(queryClient, setSortDef, sortDef);
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
                  mainKey="hakemuslista"
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
