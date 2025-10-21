'use client';

import { TFunction } from '@/src/lib/localization/hooks/useTranslations';
import { OphRadioGroupWithClear } from '@/src/components/OphRadioGroupWithClear';
import { myonteinenPaatosOptions } from '@/src/app/hakemus/[oid]/paatostiedot/constants';
import React from 'react';
import { PaatosTieto } from '@/src/lib/types/paatos';

interface MyonteinenPaatosProps {
  t: TFunction;
  myonteinenPaatos?: boolean | null;
  updatePaatosTietoAction: (updatedPaatosTieto: PaatosTieto) => void;
  currentPaatosTieto: PaatosTieto;
}

export const MyonteinenPaatos = ({
  t,
  myonteinenPaatos,
  updatePaatosTietoAction,
  currentPaatosTieto,
}: MyonteinenPaatosProps) => {
  return (
    <OphRadioGroupWithClear
      label={t('hakemus.paatos.tutkinto.myonteinenPaatos')}
      labelId="myonteinenPaatos-radio-group-label"
      data-testid="paatos-myonteinenPaatos-radio-group"
      labelVariant="h4"
      options={myonteinenPaatosOptions(t)}
      row
      value={myonteinenPaatos?.toString() ?? ''}
      onChange={(e) =>
        updatePaatosTietoAction({
          ...currentPaatosTieto,
          myonteinenPaatos: e.target.value === 'true',
          ...(e.target.value === 'false' && { tutkintoTaso: undefined }),
        })
      }
      onClear={() =>
        updatePaatosTietoAction({
          ...currentPaatosTieto,
          myonteinenPaatos: null,
          tutkintoTaso: undefined,
        })
      }
    />
  );
};
