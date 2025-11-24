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
import { KelpoisuusList } from '@/src/app/hakemus/[oid]/paatostiedot/components/kelpoisuus/KelpoisuusList';
import { MyonteinenTaiKielteinenPaatosComponent } from '@/src/app/hakemus/[oid]/paatostiedot/components/MyonteinenTaiKielteinenPaatosComponent';

interface PaatosTietoProps {
  t: TFunction;
  paatosTieto: PaatosTieto;
  paatosTietoOptions: PaatosTietoOptionGroup;
  updatePaatosTietoAction: (
    updatedPaatosTieto: PaatosTieto,
    immediateSave?: boolean,
  ) => void;
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

  const handlePaatosTyyppiChange = (paatosTyyppi: Paatostyyppi) => {
    const initial = {
      ...currentPaatosTieto,
      paatosTyyppi: paatosTyyppi,
      kelpoisuudet: [],
      rinnastettavatTutkinnotTaiOpinnot: [],
      myonteinenPaatos: undefined,
      kielteisenPaatoksenPerustelut: undefined,
      tutkintoTaso: undefined,
    };

    switch (paatosTyyppi) {
      case 'Taso':
      case 'TiettyTutkintoTaiOpinnot':
        updatePaatosTietoAction({
          ...initial,
          sovellettuLaki: 'uo' as SovellettuLaki,
        });
        break;
      case 'Kelpoisuus':
        updatePaatosTietoAction({
          ...initial,
          sovellettuLaki: undefined,
        });
        break;
      case 'RiittavatOpinnot':
        updatePaatosTietoAction({
          ...initial,
          paatosTyyppi: paatosTyyppi,
          sovellettuLaki: 'ro' as SovellettuLaki,
        });
        break;
    }
  };

  const handleSovellettuLakiChange = (sovellettuLaki: string) => {
    updatePaatosTietoAction({
      ...currentPaatosTieto,
      sovellettuLaki: sovellettuLaki as SovellettuLaki,
      kelpoisuudet: [],
      rinnastettavatTutkinnotTaiOpinnot: [],
    });
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
        onChange={(event) => handleSovellettuLakiChange(event.target.value)}
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
                <MyonteinenTaiKielteinenPaatosComponent
                  myonteinenPaatos={paatosTieto.myonteinenPaatos}
                  kielteisenPaatoksenPerustelut={
                    paatosTieto.kielteisenPaatoksenPerustelut
                  }
                  updatePaatosAction={(paatos) => {
                    const tobePaatostieto = {
                      ...currentPaatosTieto,
                      ...paatos,
                    };
                    // If paatos is changed to kielteinen, remove tutkintoTaso
                    if (paatos.myonteinenPaatos === false) {
                      tobePaatostieto.tutkintoTaso = undefined;
                    }
                    updatePaatosTietoAction(tobePaatostieto);
                  }}
                  t={t}
                />
                {currentPaatosTieto.myonteinenPaatos && (
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
      {currentPaatosTieto.paatosTyyppi === 'Kelpoisuus' &&
        currentPaatosTieto.sovellettuLaki && (
          <KelpoisuusList
            t={t}
            paatosTieto={currentPaatosTieto}
            updatePaatosTietoAction={updatePaatosTietoAction}
            kelpoisuusOptions={paatosTietoOptions?.kelpoisuusOptions || []}
          />
        )}
    </Stack>
  );
};
