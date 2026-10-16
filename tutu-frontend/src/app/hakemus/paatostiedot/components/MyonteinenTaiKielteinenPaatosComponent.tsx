import { Stack } from '@mui/material';
import React from 'react';

import { KielteisenPaatoksenPerusteluComponent } from '@/src/app/hakemus/paatostiedot/components/KielteisenPaatoksenPerusteluComponent';
import { myonteinenPaatosOptions } from '@/src/app/hakemus/paatostiedot/constants';
import { emptyKielteisenPaatoksenPerustelut } from '@/src/app/hakemus/paatostiedot/paatostietoUtils';
import { OphRadioGroupWithClear } from '@/src/components/OphRadioGroupWithClear';
import { TFunction } from '@/src/lib/localization/hooks/useTranslations';
import {
  MyonteinenTaiKielteinenPaatos,
  KielteisenPaatoksenPerustelut,
  Paatostyyppi,
  SovellettuLaki,
} from '@/src/lib/types/paatos';

export type MyonteinenPaatosChange = {
  myonteinenPaatos: boolean | null;
  kielteisenPaatoksenPerustelut: KielteisenPaatoksenPerustelut;
};

export type MyonteinenTaiKielteinenPaatosProps = {
  myonteisenPaatoksenKentat?: React.ReactNode;
  updateMyonteinenPaatos: (paatos: MyonteinenPaatosChange) => void;
  updateKielteisenPaatoksenPerustelut: (
    perustelut: KielteisenPaatoksenPerustelut,
  ) => void;
  t: TFunction;
  paatosTyyppi?: Paatostyyppi;
  sovellettuLaki?: SovellettuLaki;
} & MyonteinenTaiKielteinenPaatos;

export const MyonteinenTaiKielteinenPaatosComponent = ({
  myonteisenPaatoksenKentat,
  myonteinenPaatos,
  kielteisenPaatoksenPerustelut,
  updateMyonteinenPaatos,
  updateKielteisenPaatoksenPerustelut,
  t,
  paatosTyyppi,
  sovellettuLaki,
}: MyonteinenTaiKielteinenPaatosProps) => {
  const changeMyonteinenPaatos = (myonteinen: boolean | null) =>
    updateMyonteinenPaatos({
      myonteinenPaatos: myonteinen,
      kielteisenPaatoksenPerustelut: emptyKielteisenPaatoksenPerustelut(),
    });
  return (
    <Stack spacing={3}>
      <OphRadioGroupWithClear
        labelVariant="label"
        labelId="myonteinenPaatos-radio-group-label"
        label={t('hakemus.paatos.myonteinenTaiKielteinenPaatos')}
        data-testid="myonteinenPaatos-radio-group"
        sx={{ width: '100%' }}
        options={myonteinenPaatosOptions(t)}
        row
        value={myonteinenPaatos?.toString() || ''}
        onChange={(e) => changeMyonteinenPaatos(e.target.value === 'true')}
        onClear={() => changeMyonteinenPaatos(null)}
      />
      {myonteinenPaatos && myonteisenPaatoksenKentat}
      {myonteinenPaatos === false && (
        <KielteisenPaatoksenPerusteluComponent
          perustelut={kielteisenPaatoksenPerustelut || undefined}
          updatePerustelutAction={(
            perustelut: Partial<KielteisenPaatoksenPerustelut>,
          ) => {
            updateKielteisenPaatoksenPerustelut({
              ...kielteisenPaatoksenPerustelut,
              ...perustelut,
            });
          }}
          t={t}
          paatosTyyppi={paatosTyyppi}
          sovellettuLaki={sovellettuLaki}
        />
      )}
    </Stack>
  );
};
