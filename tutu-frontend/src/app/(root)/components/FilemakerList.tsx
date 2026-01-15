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
import { handleFetchError } from '@/src/lib/utils';
import { ophColors } from '@opetushallitus/oph-design-system';
import { FullSpinner } from '@/src/components/FullSpinner';
import useToaster from '@/src/hooks/useToaster';
import { useEffect } from 'react';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import { useFilemakerHakemukset } from '@/src/hooks/useFilemakerHakemukset';
import Link from 'next/link';

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

  const { isLoading, data, error } = useFilemakerHakemukset();
  useEffect(() => {
    handleFetchError(addToast, error, 'virhe.hakemuslistanLataus', t);
  }, [error, addToast, t]);

  if (isLoading) return <FullSpinner></FullSpinner>;

  const hakemusRows = data
    ? data.map((hakemus) => {
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
              <HeaderCell key={fieldKey} fieldKey={fieldKey} />
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

const StyledTableCell = styled(TableCell)({
  borderBottom: 'none',
});

const HakemusRow = ({ hakemus }: { hakemus: any }) => {
  return (
    <TableRow data-testid={'hakemus-row'}>
      <StyledTableCell>
        <Link href={`/hakemus/${hakemus.hakemusOid}/perustiedot`}>
          {hakemus.hakija}
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
