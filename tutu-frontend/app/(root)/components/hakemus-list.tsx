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
import { useHakemukset } from '@/hooks/useHakemukset';
import { FullSpinner } from '@/components/full-spinner';
import { useTranslations } from '@/lib/localization/useTranslations';
import * as R from 'remeda';
import HakemusRow from '@/app/(root)/components/hakemus-row';

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

export function HakemusList() {
  const { t } = useTranslations();
  const { isLoading, data } = useHakemukset();

  if (isLoading) return <FullSpinner></FullSpinner>;

  const hakemusRows = data
    ? R.map(data, (hakemus) => {
        return (
          <HakemusRow hakemus={hakemus} key={hakemus.asiatunnus}></HakemusRow>
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
            <TableCell>{t('hakemuslista.paatostyyppi')}</TableCell>
            <TableCell>{t('hakemuslista.hakijanaika')}</TableCell>
          </TableRow>
        </TableHead>
        <StyledTableBody>{hakemusRows}</StyledTableBody>
      </Table>
    </TableContainer>
  );
}
