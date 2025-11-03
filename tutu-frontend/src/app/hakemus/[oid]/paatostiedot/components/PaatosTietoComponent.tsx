'use client';

import {
  PaatosTieto,
  PaatosTietoOptionGroup,
  Paatostyyppi,
  SovellettuLaki,
  TutkintoTaso,
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
  tutkinnonTasoOptions,
  tutkintoOptions,
} from '@/src/app/hakemus/[oid]/paatostiedot/constants';
import { Stack } from '@mui/material';
import { Tutkinto } from '@/src/lib/types/hakemus';
import { RinnastettavatTutkinnotTaiOpinnotList } from '@/src/app/hakemus/[oid]/paatostiedot/components/RinnastettavatTutkinnotTaiOpinnotList';
import { MyonteinenPaatos } from '@/src/app/hakemus/[oid]/paatostiedot/components/MyonteinenPaatos';
import { KelpoisuusList } from '@/src/app/hakemus/[oid]/paatostiedot/components/KelpoisuusList';
import { KielteisenPaatoksenPerusteluComponent } from '@/src/app/hakemus/[oid]/paatostiedot/components/KielteisenPaatoksenPerusteluComponent';

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
  const [currentPaatosTieto, setCurrentPaatosTieto] =
    useState<PaatosTieto>(paatosTieto);

  useEffect(() => {
    setCurrentPaatosTieto(paatosTieto);
  }, [paatosTieto]);

  const updateMyonteinenPaatos = (value: boolean) => {
    updatePaatosTietoAction(
      value
        ? {
            ...currentPaatosTieto,
            myonteinenPaatos: true,
            kielteisenPaatoksenPerustelut: undefined,
          }
        : {
            ...currentPaatosTieto,
            myonteinenPaatos: false,
            tutkintoTaso: undefined,
            rinnastettavatTutkinnotTaiOpinnot: [],
          },
    );
  };

  const handlePaatosTyyppiChange = (paatosTyyppi: Paatostyyppi) => {
    switch (paatosTyyppi) {
      case 'Taso':
      case 'TiettyTutkintoTaiOpinnot':
        updatePaatosTietoAction({
          ...currentPaatosTieto,
          paatosTyyppi: paatosTyyppi,
          sovellettuLaki: 'uo' as SovellettuLaki,
          rinnastettavatTutkinnotTaiOpinnot: [],
        });
        break;
      case 'Kelpoisuus':
        updatePaatosTietoAction({
          ...currentPaatosTieto,
          paatosTyyppi: paatosTyyppi,
          sovellettuLaki: undefined,
          rinnastettavatTutkinnotTaiOpinnot: [],
        });
        break;
      case 'RiittavatOpinnot':
        updatePaatosTietoAction({
          ...currentPaatosTieto,
          paatosTyyppi: paatosTyyppi,
          sovellettuLaki: 'ro' as SovellettuLaki,
          rinnastettavatTutkinnotTaiOpinnot: [],
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
        (currentPaatosTieto.paatosTyyppi === 'Kelpoisuus' ||
          currentPaatosTieto.paatosTyyppi === 'Taso') && (
          <>
            <OphSelectFormField
              placeholder={t('yleiset.valitse')}
              label={t('hakemus.paatos.tutkinto.nimi')}
              options={tutkintoOptions(t, tutkinnot)}
              value={currentPaatosTieto.tutkintoId || ''}
              onChange={(event) =>
                updatePaatosTietoAction({
                  ...currentPaatosTieto,
                  tutkintoId: event.target.value,
                })
              }
              data-testid={'paatos-tutkintonimi-dropdown'}
            />
            {currentPaatosTieto.tutkintoId && (
              <OphCheckbox
                data-testid={`paatos-lisaa-tutkinto-paatostekstiin-checkbox`}
                checked={
                  currentPaatosTieto.lisaaTutkintoPaatostekstiin || false
                }
                label={t('hakemus.paatos.tutkinto.lisaaTutkintoPaatosTekstiin')}
                onChange={(event) =>
                  updatePaatosTietoAction({
                    ...currentPaatosTieto,
                    lisaaTutkintoPaatostekstiin: event.target.checked,
                  })
                }
              />
            )}
            {currentPaatosTieto.paatosTyyppi === 'Taso' && (
              <>
                <MyonteinenPaatos
                  t={t}
                  myonteinenPaatos={currentPaatosTieto.myonteinenPaatos}
                  updateMyonteinenPaatosAction={updateMyonteinenPaatos}
                />
                {currentPaatosTieto.myonteinenPaatos ? (
                  <OphSelectFormField
                    placeholder={t('yleiset.valitse')}
                    label={t('hakemus.paatos.tutkinto.tutkinnonTaso')}
                    options={tutkinnonTasoOptions(t)}
                    value={currentPaatosTieto.tutkintoTaso || ''}
                    onChange={(event) =>
                      updatePaatosTietoAction({
                        ...currentPaatosTieto,
                        tutkintoTaso: event.target.value as TutkintoTaso,
                      })
                    }
                    data-testid={'paatos-tutkintotaso-dropdown'}
                  />
                ) : (
                  <KielteisenPaatoksenPerusteluComponent
                    paatosTieto={paatosTieto}
                    updatePaatosTietoAction={updatePaatosTietoAction}
                    t={t}
                  />
                )}
              </>
            )}
          </>
        )}
      {(currentPaatosTieto.paatosTyyppi === 'RiittavatOpinnot' ||
        currentPaatosTieto.paatosTyyppi === 'TiettyTutkintoTaiOpinnot') && (
        <RinnastettavatTutkinnotTaiOpinnotList
          t={t}
          paatosTieto={currentPaatosTieto}
          paatosTietoOptions={paatosTietoOptions}
          rinnastettavatTutkinnotTaiOpinnot={
            currentPaatosTieto.rinnastettavatTutkinnotTaiOpinnot
          }
          updatePaatosTietoAction={updatePaatosTietoAction}
        />
      )}
      {currentPaatosTieto.paatosTyyppi === 'Kelpoisuus' && (
        <KelpoisuusList
          t={t}
          paatosTieto={currentPaatosTieto}
          updatePaatosTietoAction={updatePaatosTietoAction}
        />
      )}
    </Stack>
  );
};
