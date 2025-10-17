'use client';

import {
  PaatosTieto,
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
import { OphRadioGroupWithClear } from '@/src/components/OphRadioGroupWithClear';
import {
  myonteinenPaatosOptions,
  paatostyyppiOptions,
  sovellettuLakiOptions,
  tutkinnonTasoOptions,
  tutkintoOptions,
} from '@/src/app/hakemus/[oid]/paatostiedot/constants';
import { Stack } from '@mui/material';
import { Tutkinto } from '@/src/lib/types/hakemus';
<<<<<<< HEAD
import { wrapField } from '@/src/lib/types/fieldWrapper';
=======
import { RinnastettavatTutkinnotTaiOpinnotList } from '@/src/app/hakemus/[oid]/paatostiedot/components/RinnastettavatTutkinnotTaiOpinnotList';
>>>>>>> ca4d53f (OPHTUTU-158-159: Lisätty komponenttien skeletonit)

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
<<<<<<< HEAD
      {paatosTieto.sovellettuLaki && paatosTieto.sovellettuLaki && (
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
      )}
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
          <OphRadioGroupWithClear
            label={t('hakemus.paatos.tutkinto.myonteinenPaatos')}
            labelId="myonteinenPaatos-radio-group-label"
            data-testid="paatos-myonteinenPaatos-radio-group"
            sx={{ width: '100%' }}
            options={myonteinenPaatosOptions(t)}
            row
            value={paatosTieto.myonteinenPaatos?.toString() ?? ''}
            onChange={(e) =>
              updatePaatosTietoAction({
                ...paatosTieto,
                ...(wrapField(
                  'myonteinenPaatos',
                  e.target.value === 'true',
                ) as unknown as Partial<PaatosTieto>),
                ...(e.target.value === 'false' && { tutkintoTaso: undefined }),
              })
            }
            onClear={() =>
              updatePaatosTietoAction({
                ...paatosTieto,
                ...(wrapField(
                  'myonteinenPaatos',
                  null,
                ) as unknown as Partial<PaatosTieto>),
                tutkintoTaso: undefined,
              })
            }
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
=======
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
>>>>>>> ca4d53f (OPHTUTU-158-159: Lisätty komponenttien skeletonit)
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
                <OphTypography variant="h4">
                  {t('hakemus.paatos.tutkinto.myonteinenPaatos')}
                </OphTypography>
                <OphRadioGroup
                  labelId="myonteinenPaatos-radio-group-label"
                  data-testid="paatos-myonteinenPaatos-radio-group"
                  sx={{ width: '100%' }}
                  options={myonteinenPaatosOptions(t)}
                  row
                  value={
                    currentPaatosTieto.myonteinenPaatos?.toString() || null
                  }
                  onChange={(e) =>
                    updatePaatosTietoAction(
                      e.target.value === 'true'
                        ? {
                            ...currentPaatosTieto,
                            myonteinenPaatos: true,
                          }
                        : {
                            ...currentPaatosTieto,
                            myonteinenPaatos: false,
                            tutkintoTaso: undefined,
                          },
                    )
                  }
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
          paatosTyyppi={currentPaatosTieto.paatosTyyppi}
          paatostietoId={currentPaatosTieto.id!}
          rinnastettavatTutkinnotTaiOpinnot={
            currentPaatosTieto.rinnastettavatTutkinnotTaiOpinnot
          }
        />
      )}
    </Stack>
  );
};
