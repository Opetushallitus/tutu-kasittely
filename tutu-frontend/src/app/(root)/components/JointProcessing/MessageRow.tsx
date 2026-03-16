import { AccessTimeFilled, CheckCircle } from '@mui/icons-material';
import { Grid2, styled, TableCell, TableRow } from '@mui/material';
import { ophColors, OphTypography } from '@opetushallitus/oph-design-system';
import * as dateFns from 'date-fns';

import { StyledLink } from '@/src/components/StyledLink';
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
  showTag = false,
}: {
  message: YhteisenKasittelynViesti;
  showTag?: boolean;
}) {
  const { t } = useTranslations();
  const { luotu, asiatunnus, hakija, hakemusOid, status } = message;
  const lahetysAika = luotu ? dateFns.format(luotu, 'd.M.yy') : '-';

  return (
    <TableRow data-testid={'yhteisen-kasittelyn-viesti-row'}>
      <StyledTableCell>
        <OphTypography variant="body1" data-testid={'viestin-lahetysaika'}>
          {lahetysAika}
        </OphTypography>
      </StyledTableCell>
      <StyledTableCell>
        <Grid2 container wrap={'nowrap'}>
          {status === 2 ? <StyledNotRespondedIcon /> : <StyledRespondedIcon />}
          <OphTypography variant="body1" data-testid={'viestin-status'}>
            {status === 2
              ? t('yhteinenKasittely.vastaamatta')
              : t('yhteinenKasittely.vastattu')}
          </OphTypography>
          {status === 1 && showTag && (
            <OphTypography
              variant="body1"
              sx={{
                color: 'black',
                background: ophColors.green5,
                marginLeft: 1,
                paddingLeft: 1,
                paddingRight: 1,
                borderRadius: 1,
              }}
            >
              {t('yhteinenKasittely.uusi')}
            </OphTypography>
          )}
        </Grid2>
      </StyledTableCell>
      <StyledTableCell>
        <StyledLink
          href={`/hakemus/${hakemusOid}/yhteinenkasittely`}
          data-testid={'hakijan-nimi'}
          sx={{ fontWeight: 'normal' }}
        >
          {hakija}
        </StyledLink>
      </StyledTableCell>
      <StyledTableCell>
        <OphTypography variant="body1" data-testid={'asiatunnus'}>
          {asiatunnus}
        </OphTypography>
      </StyledTableCell>
    </TableRow>
  );
}
