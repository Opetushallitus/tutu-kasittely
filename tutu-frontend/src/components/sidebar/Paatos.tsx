import { Stack, useTheme, Box } from '@mui/material';
import { OphTypography } from '@opetushallitus/oph-design-system';
import React from 'react';

import { StyledLink } from '@/src/components/StyledLink';
import { useHakemus } from '@/src/context/HakemusContext';
import { usePaatos } from '@/src/hooks/usePaatos';
import {
  TFunction,
  useTranslations,
} from '@/src/lib/localization/hooks/useTranslations';
import { PaatosTieto, Paatostyyppi } from '@/src/lib/types/paatos';

import { KielteinenBadge, MyonteinenBadge } from '../Badges';

export const mapPaatostyyppi = (
  paatosTyyppi: Paatostyyppi | undefined,
  t: TFunction,
): string => {
  if (!paatosTyyppi) {
    return '';
  }

  switch (paatosTyyppi) {
    case 'Taso':
      return t('hakemus.paatos.paatostyyppi.options.taso');
    case 'Kelpoisuus':
      return t('hakemus.paatos.paatostyyppi.options.kelpoisuus');
    case 'TiettyTutkintoTaiOpinnot':
      return t('hakemus.paatos.paatostyyppi.options.tiettyTutkintoTaiOpinnot');
    case 'RiittavatOpinnot':
      return t('hakemus.paatos.paatostyyppi.options.riittavatOpinnot');
    case 'LopullinenPaatos':
      return t('hakemus.paatos.paatostyyppi.options.lopullinenPaatos');
  }
};

const mapMyonteinenPaatos = (paatosTieto: PaatosTieto, t: TFunction) => {
  let myonteinenPaatos = paatosTieto.myonteinenPaatos;

  // Näissä voi olla useampi päätös sisällä
  if (paatosTieto.paatosTyyppi === 'Kelpoisuus') {
    myonteinenPaatos = paatosTieto.kelpoisuudet.every(
      (k) => k.myonteinenPaatos,
    );
  } else if (
    paatosTieto.paatosTyyppi === 'TiettyTutkintoTaiOpinnot' ||
    paatosTieto.paatosTyyppi === 'RiittavatOpinnot'
  ) {
    myonteinenPaatos = paatosTieto.rinnastettavatTutkinnotTaiOpinnot.every(
      (k) => k.myonteinenPaatos,
    );
  }

  return myonteinenPaatos ? (
    <MyonteinenBadge label={t('hakemus.paatos.myonteinenPaatos.otsikko')} />
  ) : (
    <KielteinenBadge label={t('hakemus.paatos.kielteinenPaatos.otsikko')} />
  );
};

const AikaisempiPaatos = ({
  t,
  asiatunnus,
  gap,
}: {
  t: TFunction;
  asiatunnus: string;
  gap: string;
}) => {
  return (
    <Stack direction="column" gap={gap}>
      <OphTypography variant={'label'} sx={{ fontWeight: 'bold' }}>
        {t('hakemus.sivupalkki.paatos.otsikkoAikaisempi')}
      </OphTypography>
      <OphTypography variant={'body1'}>
        {t('hakemus.sivupalkki.paatos.seliteAikaisempi')}
      </OphTypography>
      <StyledLink href={'/'} sx={{ fontWeight: '400' }}>
        {asiatunnus}
      </StyledLink>
    </Stack>
  );
};

export const Paatos = () => {
  const theme = useTheme();
  const { t } = useTranslations();
  const {
    hakemusState: { editedData: hakemus },
  } = useHakemus();
  const { paatos } = usePaatos(hakemus?.hakemusOid);

  return (
    <Stack direction="column" gap={theme.spacing(2)}>
      {paatos?.paatostekstiVahvistettu &&
        paatos.paatosTiedot?.map((tiedot, index) => (
          <Box
            key={index}
            data-testid="hakemus-sidebar-paatos-item"
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: theme.spacing(0.25),
              alignItems: 'flex-start',
            }}
          >
            <OphTypography variant={'label'} sx={{ fontWeight: 'bold' }}>
              {t('hakemus.sivupalkki.paatos.otsikko', '', {
                numero: index + 1,
              })}
            </OphTypography>
            <span>{mapPaatostyyppi(tiedot.paatosTyyppi, t)}</span>
            <span>
              {t(
                `hakemus.sivupalkki.paatos.sovellettuLaki.${tiedot.sovellettuLaki}`,
              )}
            </span>
            {mapMyonteinenPaatos(tiedot, t)}
          </Box>
        ))}
      <AikaisempiPaatos
        t={t}
        asiatunnus="OPH-1234-5678"
        gap={theme.spacing(1)}
      ></AikaisempiPaatos>
    </Stack>
  );
};
