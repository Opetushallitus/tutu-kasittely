'use client';

import { TFunction } from '@/src/lib/localization/hooks/useTranslations';
import {
  OphCheckbox,
  OphTypography,
} from '@opetushallitus/oph-design-system';
import { OphRadioGroupWithClear } from '@/src/components/OphRadioGroupWithClear';
import { myonteinenPaatosOptions } from '@/src/app/hakemus/[oid]/paatostiedot/constants';
import React, { useEffect, useState } from 'react';
import { Stack, useTheme } from '@mui/material';
import { MyonteisenPaatoksenLisavaatimukset, PaatosTieto } from '@/src/lib/types/paatos';

interface MyonteinenPaatosProps {
  t: TFunction;
  paatosTieto: PaatosTieto;
  myonteinenPaatos?: boolean;
  lisavaatimukset?: MyonteisenPaatoksenLisavaatimukset;
  updatePaatosTietoAction: (updatedPaatosTieto: PaatosTieto) => void;
  updateMyonteinenPaatosAction: (
    myonteinenPaatos: boolean,
    lisavaatimukset?: MyonteisenPaatoksenLisavaatimukset,
  ) => void;
}

export const MyonteinenPaatos = ({
  t,
  paatosTieto,
  myonteinenPaatos,
  lisavaatimukset,
  updatePaatosTietoAction,
  updateMyonteinenPaatosAction,
}: MyonteinenPaatosProps) => {
  const theme = useTheme();

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
    <Stack direction="column" gap={theme.spacing(2)}>
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
      {myonteinenPaatos && lisavaatimukset && (
        <>
          <OphTypography variant="h5">
            {t('hakemus.paatos.myonteinenPaatos.otsikko')}
          </OphTypography>
          <OphCheckbox
            data-testid="myonteinenPaatos-taydentavatOpinnot"
            label={t('hakemus.paatos.myonteinenPaatos.taydentavatOpinnot')}
            checked={lisavaatimukset.taydentavatOpinnot || false}
            onChange={(e) =>
              updateMyonteinenPaatosAction(true, {
                ...lisavaatimukset,
                taydentavatOpinnot: e.target.checked,
              } as MyonteisenPaatoksenLisavaatimukset)
            }
          />
          <OphCheckbox
            data-testid="myonteinenPaatos-kelpoisuuskoe"
            label={t('hakemus.paatos.myonteinenPaatos.kelpoisuuskoe')}
            checked={lisavaatimukset.kelpoisuuskoe || false}
            onChange={(e) =>
              updateMyonteinenPaatosAction(true, {
                ...lisavaatimukset,
                kelpoisuuskoe: e.target.checked,
              } as MyonteisenPaatoksenLisavaatimukset)
            }
          />
          <OphCheckbox
            data-testid="myonteinenPaatos-sopeutumisaika"
            label={t('hakemus.paatos.myonteinenPaatos.sopeutumisaika')}
            checked={lisavaatimukset.sopeutumisaika || false}
            onChange={(e) =>
              updateMyonteinenPaatosAction(true, {
                ...lisavaatimukset,
                sopeutumisaika: e.target.checked,
              } as MyonteisenPaatoksenLisavaatimukset)
            }
          />
        </>
      )}
    </Stack>
  );
};
