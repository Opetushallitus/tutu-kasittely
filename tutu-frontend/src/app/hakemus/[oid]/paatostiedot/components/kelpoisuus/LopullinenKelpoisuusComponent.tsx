import { Stack, useTheme } from '@mui/material';
import { OphTypography } from '@opetushallitus/oph-design-system';
import React from 'react';

import { MyonteinenTaiKielteinenPaatosComponent } from '@/src/app/hakemus/[oid]/paatostiedot/components/MyonteinenTaiKielteinenPaatosComponent';
import { TFunction } from '@/src/lib/localization/hooks/useTranslations';
import { ophColors } from '@/src/lib/theme';
import { Kelpoisuus } from '@/src/lib/types/paatos';

type LopullinenKelpoisuusComponentProps = {
  t: TFunction;
  index: number;
  kelpoisuus: Kelpoisuus;
  updateKelpoisuusAction: (
    updatedKelpoisuus: Kelpoisuus,
    index: number,
  ) => void;
};

export const LopullinenKelpoisuusComponent = ({
  t,
  index,
  kelpoisuus,
  updateKelpoisuusAction,
}: LopullinenKelpoisuusComponentProps) => {
  const theme = useTheme();

  const heading = `${t('hakemus.paatos.paatostyyppi.kelpoisuus.otsikko')} ${index + 1}: ${kelpoisuus.kelpoisuus}`;

  return (
    <Stack
      key={`lopullinen-kelpoisuus-stack-${index}`}
      gap={theme.spacing(2)}
      sx={{ width: '100%' }}
    >
      <OphTypography variant={'h3'}>{heading}</OphTypography>
      <Stack
        sx={{ backgroundColor: ophColors.grey50 }}
        padding={theme.spacing(2)}
        gap={theme.spacing(2)}
      >
        {kelpoisuus.kelpoisuus && (
          <OphTypography variant={'body1'}>
            {kelpoisuus.kelpoisuus}
          </OphTypography>
        )}
        <MyonteinenTaiKielteinenPaatosComponent
          myonteinenPaatos={kelpoisuus.myonteinenPaatos}
          kielteisenPaatoksenPerustelut={
            kelpoisuus.kielteisenPaatoksenPerustelut
          }
          updatePaatosAction={(paatos) => {
            updateKelpoisuusAction({ ...kelpoisuus, ...paatos }, index);
          }}
          t={t}
        />
      </Stack>
    </Stack>
  );
};
