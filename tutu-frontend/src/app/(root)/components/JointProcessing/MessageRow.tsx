import { AccessTimeFilled, CheckCircle } from '@mui/icons-material';
import { Grid2, styled, TableCell, TableRow } from '@mui/material';
import { ophColors, OphTypography } from '@opetushallitus/oph-design-system';
import * as dateFns from 'date-fns';
import Link from 'next/link';

import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import { YhteisenKasittelynViesti } from '@/src/lib/types/yhteisenKasittelynViesti';

const StyledTableCell = styled(TableCell)({
  borderBottom: 'none',
});

const StyledNotRespondedIcon = styled(AccessTimeFilled)({
  color: ophColors.yellow1,
  paddingRight: 4,
});

const StyledRespondedIcon = styled(CheckCircle)({
  color: ophColors.green2,
  paddingRight: 4,
});

export default function MessageRow({
  message,
}: {
  message: YhteisenKasittelynViesti;
}) {
  const { t } = useTranslations();
  const { luotu, asiatunnus, vastaus, hakijanNimi, hakemusOid } = message;
  const vastaamatta = vastaus === null || vastaus?.length === 0;
  const lahetysAika = luotu ? dateFns.format(luotu, 'dd.MM.yy HH:mm') : '-';

  // TODO: Korjaa oikea linkki
  return (
    <TableRow>
      <StyledTableCell>
        <OphTypography variant="body1">{lahetysAika}</OphTypography>
      </StyledTableCell>
      <StyledTableCell>
        <Grid2 container wrap={'nowrap'}>
          {vastaamatta ? <StyledNotRespondedIcon /> : <StyledRespondedIcon />}
          <OphTypography variant="body1">
            {vastaamatta
              ? t('yhteinenKasittely.vastaamatta')
              : t('yhteinenKasittely.vastattu')}
          </OphTypography>
        </Grid2>
      </StyledTableCell>
      <StyledTableCell>
        <Link href={`/hakemus/${hakemusOid}/perustiedot`}>{hakijanNimi}</Link>
      </StyledTableCell>
      <StyledTableCell>
        <OphTypography variant="body1">{asiatunnus}</OphTypography>
      </StyledTableCell>
    </TableRow>
  );
}
