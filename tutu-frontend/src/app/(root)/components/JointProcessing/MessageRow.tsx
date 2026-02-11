import { styled, TableCell, TableRow } from '@mui/material';
import { OphTypography } from '@opetushallitus/oph-design-system';
import Link from 'next/link';

import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import { YhteisenKasittelynViesti } from '@/src/lib/types/yhteisenKasittelynViesti';

const StyledTableCell = styled(TableCell)({
  borderBottom: 'none',
});

export default function MessageRow({
  message,
}: {
  message: YhteisenKasittelynViesti;
}) {
  const { t } = useTranslations();
  const { lahetysPvm, asiatunnus, vastaus, hakijanNimi, hakemusOid } = message;
  const vastaamatta = vastaus === undefined || vastaus.length === 0;

  // TODO: Korjaa oikea linkki
  return (
    <TableRow>
      <StyledTableCell>
        <OphTypography variant="body1">{lahetysPvm}</OphTypography>
      </StyledTableCell>
      <StyledTableCell>
        <OphTypography variant="body1">
          {vastaamatta
            ? t('yhteinenKasittely.vastaamatta')
            : t('yhteinenKasittely.vastattu')}
        </OphTypography>
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
