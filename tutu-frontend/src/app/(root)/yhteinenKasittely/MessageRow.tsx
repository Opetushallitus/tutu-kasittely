import { AccessTimeFilled, CheckCircle } from '@mui/icons-material';
import { Grid2, styled, TableCell, TableRow } from '@mui/material';
import { ophColors, OphTypography } from '@opetushallitus/oph-design-system';

import { StyledLink } from '@/src/components/StyledLink';
import { formatHelsinki } from '@/src/lib/dateUtils';
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

enum Status {
  vastaamatta = 'vastaamatta',
  vastattu = 'vastattu',
  uusiVastaus = 'uusiVastaus',
}

export default function MessageRow({
  message,
}: {
  message: YhteisenKasittelynViesti;
}) {
  const { t } = useTranslations();
  const { luotu, asiatunnus, hakija, hakemusOid, status } = message;

  const TagVastaamatta = () => (
    <>
      <StyledNotRespondedIcon />
      <OphTypography variant="body1" data-testid={'viestin-status-vastaamatta'}>
        {t('yhteinenKasittely.vastaamatta')}
      </OphTypography>
    </>
  );

  const TagVastattu = () => (
    <>
      <StyledRespondedIcon />
      <OphTypography variant="body1" data-testid={'viestin-status-vastattu'}>
        {t('yhteinenKasittely.vastattu')}
      </OphTypography>
    </>
  );

  const TagUusiVastaus = () => (
    <>
      <StyledRespondedIcon />
      <OphTypography
        variant="body1"
        data-testid={'viestin-status-uusi-vastaus'}
      >
        {t('yhteinenKasittely.vastattu')}
      </OphTypography>
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
    </>
  );

  return (
    <TableRow data-testid={'yhteisen-kasittelyn-viesti-row'}>
      <StyledTableCell>
        <OphTypography variant="body1" data-testid={'viestin-lahetysaika'}>
          {formatHelsinki(luotu || '', 'd.M.yyyy')}
        </OphTypography>
      </StyledTableCell>
      <StyledTableCell>
        <Grid2 container wrap={'nowrap'}>
          {status === Status.vastaamatta && <TagVastaamatta />}
          {status === Status.vastattu && <TagVastattu />}
          {status === Status.uusiVastaus && <TagUusiVastaus />}
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
