'use client';

import {
  PaatosTieto,
  Paatostyyppi,
  SovellettuLaki,
} from '@/src/lib/types/paatos';
import React, { useEffect, useState } from 'react';
import {
  OphCheckbox,
  OphSelectFormField,
} from '@opetushallitus/oph-design-system';
import { TFunction } from '@/src/lib/localization/hooks/useTranslations';
import {
  paatostyyppiOptions,
  sovellettuLakiOptions,
} from '@/src/app/hakemus/[oid]/paatostiedot/constants';
import { Stack } from '@mui/material';
import { Tutkinto } from '@/src/lib/types/hakemus';
import { OphSelectOption } from '@/src/components/OphSelect';

interface PaatosTietoProps {
  t: TFunction;
  paatosTieto: PaatosTieto;
  updatePaatosTietoAction: (updatedPaatosTieto: PaatosTieto) => void;
  tutkinnot: Tutkinto[];
}

export const PaatosTietoComponent = ({
  t,
  paatosTieto,
  updatePaatosTietoAction,
  tutkinnot,
}: PaatosTietoProps) => {
  const [currentPaatosTieto, setCurrentPaatosTieto] =
    useState<PaatosTieto>(paatosTieto);

  useEffect(() => {
    setCurrentPaatosTieto(paatosTieto);
  }, [paatosTieto]);

  const tutkintoOptions: OphSelectOption<string>[] =
    tutkinnot.map((tutkinto) => ({
      label:
        tutkinto.jarjestys === 'MUU'
          ? t('hakemus.paatos.tutkinto.muuTutkinto')
          : tutkinto.nimi!,
      value: tutkinto.id!,
    })) || [];

  const handlePaatosTyyppiChange = (paatosTyyppi: Paatostyyppi) => {
    switch (paatosTyyppi) {
      case 'Taso':
      case 'TiettyTutkintoTaiOpinnot':
        updatePaatosTietoAction({
          ...currentPaatosTieto,
          paatosTyyppi: paatosTyyppi,
          sovellettuLaki: 'uo' as SovellettuLaki,
        });
        break;
      case 'Kelpoisuus':
        updatePaatosTietoAction({
          ...currentPaatosTieto,
          paatosTyyppi: paatosTyyppi,
          sovellettuLaki: undefined,
        });
        break;
      case 'RiittavatOpinnot':
        updatePaatosTietoAction({
          ...currentPaatosTieto,
          paatosTyyppi: paatosTyyppi,
          sovellettuLaki: 'ro' as SovellettuLaki,
        });
        break;
    }
  };

  return (
    <Stack direction={'column'} gap={2}>
      <OphSelectFormField
        placeholder={t('yleiset.valitse')}
        label={t('hakemus.paatos.paatostyyppi.otsikko')}
        options={paatostyyppiOptions(t)}
        value={currentPaatosTieto.paatosTyyppi || ''}
        onChange={(event) =>
          handlePaatosTyyppiChange(event.target.value as Paatostyyppi)
        }
        data-testid={'paatos-paatostyyppi-dropdown'}
      />
      <OphSelectFormField
        placeholder={t('yleiset.valitse')}
        label={t('hakemus.paatos.sovellettuLaki.otsikko')}
        options={sovellettuLakiOptions(
          currentPaatosTieto.paatosTyyppi as Paatostyyppi,
          t,
        )}
        value={currentPaatosTieto.sovellettuLaki || ''}
        onChange={(event) =>
          updatePaatosTietoAction({
            ...currentPaatosTieto,
            sovellettuLaki: event.target.value as SovellettuLaki,
          })
        }
        data-testid={'paatos-sovellettulaki-dropdown'}
      />
      {currentPaatosTieto.sovellettuLaki &&
        currentPaatosTieto.sovellettuLaki && (
          <OphSelectFormField
            placeholder={t('yleiset.valitse')}
            label={t('hakemus.paatos.tutkinto.nimi')}
            options={tutkintoOptions}
            value={currentPaatosTieto.tutkintoId || ''}
            onChange={(event) =>
              updatePaatosTietoAction({
                ...currentPaatosTieto,
                tutkintoId: event.target.value,
              })
            }
            data-testid={'paatos-tutkintonimi-dropdown'}
          />
        )}
      {currentPaatosTieto.tutkintoId && (
        <OphCheckbox
          data-testid={`paatos-lisaa-tutkinto-paatostekstiin-checkbox`}
          checked={currentPaatosTieto.lisaaTutkintoPaatostekstiin}
          label={t('hakemus.paatos.tutkinto.lisaaTutkintoPaatosTekstiin')}
          onChange={(event) =>
            updatePaatosTietoAction({
              ...currentPaatosTieto,
              lisaaTutkintoPaatostekstiin: event.target.checked,
            })
          }
        />
      )}
    </Stack>
  );
};
