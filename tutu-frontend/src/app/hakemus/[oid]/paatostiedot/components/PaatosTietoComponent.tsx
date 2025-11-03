'use client';

import {
  PaatosTieto,
  PaatosTietoOptionGroup,
  Paatostyyppi,
  SovellettuLaki,
  TutkintoTaso,
} from '@/src/lib/types/paatos';
import React from 'react';
import {
  OphCheckbox,
  OphSelectFormField,
} from '@opetushallitus/oph-design-system';
import { TFunction } from '@/src/lib/localization/hooks/useTranslations';
import {
  paatostyyppiOptions,
  sovellettuLakiOptions,
  tutkinnonTasoOptions,
  tutkintoOptions,
} from '@/src/app/hakemus/[oid]/paatostiedot/constants';
import { Stack } from '@mui/material';
import { Tutkinto } from '@/src/lib/types/hakemus';
import { RinnastettavatTutkinnotTaiOpinnotList } from '@/src/app/hakemus/[oid]/paatostiedot/components/RinnastettavatTutkinnotTaiOpinnotList';
import { MyonteinenPaatos } from '@/src/app/hakemus/[oid]/paatostiedot/components/MyonteinenPaatos';

interface PaatosTietoProps {
  t: TFunction;
  paatosTieto: PaatosTieto;
  paatosTietoOptions: PaatosTietoOptionGroup;
  updatePaatosTietoAction: (updatedPaatosTieto: PaatosTieto) => void;
  tutkinnot: Tutkinto[];
}

export const PaatosTietoComponent = ({
  t,
  paatosTieto,
  paatosTietoOptions,
  updatePaatosTietoAction,
  tutkinnot,
}: PaatosTietoProps) => {
  // Fully controlled component - no local state
  // All state managed at page level

  const handlePaatosTyyppiChange = (paatosTyyppi: Paatostyyppi) => {
    switch (paatosTyyppi) {
      case 'Taso':
      case 'TiettyTutkintoTaiOpinnot':
        updatePaatosTietoAction({
          ...paatosTieto,
          paatosTyyppi: paatosTyyppi,
          sovellettuLaki: 'uo' as SovellettuLaki,
        });
        break;
      case 'Kelpoisuus':
        updatePaatosTietoAction({
          ...paatosTieto,
          paatosTyyppi: paatosTyyppi,
          sovellettuLaki: undefined,
        });
        break;
      case 'RiittavatOpinnot':
        updatePaatosTietoAction({
          ...paatosTieto,
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
        value={paatosTieto.paatosTyyppi || ''}
        onChange={(event) =>
          handlePaatosTyyppiChange(event.target.value as Paatostyyppi)
        }
        data-testid={'paatos-paatostyyppi-dropdown'}
      />
      <OphSelectFormField
        placeholder={t('yleiset.valitse')}
        label={t('hakemus.paatos.sovellettuLaki.otsikko')}
        options={sovellettuLakiOptions(
          paatosTieto.paatosTyyppi as Paatostyyppi,
          t,
        )}
        value={paatosTieto.sovellettuLaki || ''}
        onChange={(event) =>
          updatePaatosTietoAction({
            ...paatosTieto,
            sovellettuLaki: event.target.value as SovellettuLaki,
          })
        }
        data-testid={'paatos-sovellettulaki-dropdown'}
      />
      {paatosTieto.sovellettuLaki &&
        (paatosTieto.paatosTyyppi === 'Kelpoisuus' ||
          paatosTieto.paatosTyyppi === 'Taso') && (
          <>
            <OphSelectFormField
              placeholder={t('yleiset.valitse')}
              label={t('hakemus.paatos.tutkinto.nimi')}
              options={tutkintoOptions(t, tutkinnot)}
              value={paatosTieto.tutkintoId || ''}
              onChange={(event) =>
                updatePaatosTietoAction({
                  ...paatosTieto,
                  tutkintoId: event.target.value,
                })
              }
              data-testid={'paatos-tutkintonimi-dropdown'}
            />
            {paatosTieto.tutkintoId && (
              <OphCheckbox
                data-testid={`paatos-lisaa-tutkinto-paatostekstiin-checkbox`}
                checked={paatosTieto.lisaaTutkintoPaatostekstiin || false}
                label={t('hakemus.paatos.tutkinto.lisaaTutkintoPaatosTekstiin')}
                onChange={(event) =>
                  updatePaatosTietoAction({
                    ...paatosTieto,
                    lisaaTutkintoPaatostekstiin: event.target.checked,
                  })
                }
              />
            )}

            {paatosTieto.paatosTyyppi === 'Taso' && (
              <>
                <MyonteinenPaatos
                  t={t}
                  paatosTieto={paatosTieto}
                  updatePaatosTietoAction={updatePaatosTietoAction}
                  testId="myonteinenPaatos-radio-group"
                />
                {paatosTieto.myonteinenPaatos && (
                  <OphSelectFormField
                    placeholder={t('yleiset.valitse')}
                    label={t('hakemus.paatos.tutkinto.tutkinnonTaso')}
                    options={tutkinnonTasoOptions(t)}
                    value={paatosTieto.tutkintoTaso || ''}
                    onChange={(event) =>
                      updatePaatosTietoAction({
                        ...paatosTieto,
                        tutkintoTaso: event.target.value as TutkintoTaso,
                      })
                    }
                    data-testid={'paatos-tutkintotaso-dropdown'}
                  />
                )}
              </>
            )}
          </>
        )}
      {(paatosTieto.paatosTyyppi === 'RiittavatOpinnot' ||
        paatosTieto.paatosTyyppi === 'TiettyTutkintoTaiOpinnot') && (
        <RinnastettavatTutkinnotTaiOpinnotList
          t={t}
          paatosTieto={paatosTieto}
          paatosTietoOptions={paatosTietoOptions}
          rinnastettavatTutkinnotTaiOpinnot={
            paatosTieto.rinnastettavatTutkinnotTaiOpinnot
          }
          updatePaatosTietoAction={updatePaatosTietoAction}
        />
      )}
    </Stack>
  );
};
