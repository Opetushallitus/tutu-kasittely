'use client';

import { TFunction } from '@/src/lib/localization/hooks/useTranslations';
import { OphRadioGroupWithClear } from '@/src/components/OphRadioGroupWithClear';
import { myonteinenPaatosOptions } from '@/src/app/hakemus/[oid]/paatostiedot/constants';
import React, { useEffect, useState } from 'react';
import { PaatosTieto } from '@/src/lib/types/paatos';

interface MyonteinenPaatosProps {
  t: TFunction;
  paatosTieto: PaatosTieto;
  updatePaatosTietoAction: (updatedPaatosTieto: PaatosTieto) => void;
}

export const MyonteinenPaatos = ({
  t,
  paatosTieto,
  updatePaatosTietoAction,
}: MyonteinenPaatosProps) => {
  // Local optimistic state for immediate UI feedback
  // This handles the controlled component behavior while cache updates propagate
  const [optimisticValue, setOptimisticValue] = useState<
    boolean | null | undefined
  >(undefined);

  // Use optimistic value if set, otherwise use prop value
  const currentValue =
    optimisticValue !== undefined
      ? optimisticValue
      : paatosTieto?.myonteinenPaatos;

  // Clear optimistic state when prop value catches up
  useEffect(() => {
    if (optimisticValue !== undefined) {
      // If prop matches optimistic value, clear optimistic state
      if (paatosTieto?.myonteinenPaatos === optimisticValue) {
        setOptimisticValue(undefined);
      }
    }
  }, [paatosTieto?.myonteinenPaatos, optimisticValue]);

  const updateMyonteinenPaatos = (val: boolean | null | undefined) => {
    // Set local optimistic value immediately for instant UI feedback
    setOptimisticValue(val);

    // Send update to server
    updatePaatosTietoAction({
      ...paatosTieto,
      myonteinenPaatos: val,
      // Clear tutkintoTaso if not "Kyllä" (true)
      ...(val !== true && { tutkintoTaso: undefined }),
    });
  };

  return (
    <OphRadioGroupWithClear
      label={t('hakemus.paatos.tutkinto.myonteinenPaatos')}
      labelId="myonteinenPaatos-radio-group-label"
      data-testid="paatos-myonteinenPaatos-radio-group"
      labelVariant="h4"
      options={myonteinenPaatosOptions(t)}
      row
      value={currentValue?.toString() ?? ''}
      onChange={(e) => updateMyonteinenPaatos(e.target.value === 'true')}
      onClear={() => updateMyonteinenPaatos(null)}
    />
  );
};
