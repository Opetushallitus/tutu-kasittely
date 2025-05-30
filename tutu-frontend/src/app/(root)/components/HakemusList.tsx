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
  const { t } = useTranslations();
  const { isLoading, data } = useHakemukset();

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
            <TableCell>{t('hakemuslista.hakijannimi')}</TableCell>
            <TableCell>{t('hakemuslista.asiatunnus')}</TableCell>
            <TableCell>{t('hakemuslista.kasittelyvaihe')}</TableCell>
            <TableCell>{t('hakemuslista.hakemusKoskee')}</TableCell>
            <TableCell>{t('hakemuslista.hakijanaika')}</TableCell>
          </TableRow>
        </TableHead>
        <StyledTableBody data-testid={'hakemus-list'} tabIndex={0}>
          {hakemusRows}
        </StyledTableBody>
      </Table>
    </TableContainer>
  );
}
