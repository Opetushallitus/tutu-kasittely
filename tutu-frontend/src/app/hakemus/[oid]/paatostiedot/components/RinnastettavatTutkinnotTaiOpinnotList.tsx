'use client';

import { TFunction } from '@/src/lib/localization/hooks/useTranslations';
import {
  PaatosTieto,
  PaatosTietoOptionGroup,
  TutkintoTaiOpinto,
} from '@/src/lib/types/paatos';
import { OphButton } from '@opetushallitus/oph-design-system';
import { Add } from '@mui/icons-material';
import React from 'react';
import { RinnastettavaTutkintoTaiOpintoComponent } from '@/src/app/hakemus/[oid]/paatostiedot/components/RinnastettavaTutkintoTaiOpintoComponent';

const emptyTutkintoTaiOpinto = (paatostietoId: string): TutkintoTaiOpinto => ({
  paatostietoId: paatostietoId,
  myonteisenPaatoksenLisavaatimukset: {
    taydentavatOpinnot: false,
    kelpoisuuskoe: false,
    sopeutumisaika: false,
  },
  kielteisenPaatoksenPerustelut: '{}',
});

type RinnastettavatTutkinnotTaiOpinnotListProps = {
  t: TFunction;
  paatosTieto: PaatosTieto;
  paatosTietoOptions: PaatosTietoOptionGroup;
  rinnastettavatTutkinnotTaiOpinnot: TutkintoTaiOpinto[];
  updatePaatosTietoAction: (updatedPaatosTieto: PaatosTieto) => void;
};

export const RinnastettavatTutkinnotTaiOpinnotList = ({
  t,
  paatosTieto,
  paatosTietoOptions,
  rinnastettavatTutkinnotTaiOpinnot,
  updatePaatosTietoAction,
}: RinnastettavatTutkinnotTaiOpinnotListProps) => {
  // Fully controlled component - no local state
  const tutkinnotTaiOpinnot = rinnastettavatTutkinnotTaiOpinnot || [];

  const tyyppi =
    paatosTieto.paatosTyyppi === 'RiittavatOpinnot'
      ? 'riittavatOpinnot'
      : 'tiettyTutkintoTaiOpinnot';

  const updateTutkintoTaiOpinto = (
    updatedTutkintoTaiOpinto: TutkintoTaiOpinto,
    index: number,
  ) => {
    const newTutkinnotTaiOpinnot = [...tutkinnotTaiOpinnot];
    newTutkinnotTaiOpinnot[index] = updatedTutkintoTaiOpinto;
    updatePaatosTietoAction({
      ...paatosTieto,
      rinnastettavatTutkinnotTaiOpinnot: newTutkinnotTaiOpinnot,
    });
  };

  const addTutkintoTaiOpinto = () => {
    const newTutkinnotTaiOpinnot = [
      ...tutkinnotTaiOpinnot,
      emptyTutkintoTaiOpinto(paatosTieto.id!),
    ];
    updatePaatosTietoAction({
      ...paatosTieto,
      rinnastettavatTutkinnotTaiOpinnot: newTutkinnotTaiOpinnot,
    });
  };

  const deleteTutkintoTaiOpinto = (id: string | undefined) => {
    const newTutkinnotTaiOpinnot = id
      ? tutkinnotTaiOpinnot.filter(
          (tutkintoTaiOpinto) => tutkintoTaiOpinto.id !== id,
        )
      : tutkinnotTaiOpinnot.slice(0, -1);
    updatePaatosTietoAction({
      ...paatosTieto,
      rinnastettavatTutkinnotTaiOpinnot: newTutkinnotTaiOpinnot,
    });
  };

  return (
    <>
      {tutkinnotTaiOpinnot &&
        tutkinnotTaiOpinnot.map((tutkintoTaiOpinto, index) => (
          <React.Fragment key={index}>
            <RinnastettavaTutkintoTaiOpintoComponent
              t={t}
              index={index}
              tutkintoTaiOpinto={tutkintoTaiOpinto}
              paatosTyyppi={tyyppi}
              paatosTietoOptions={paatosTietoOptions}
              updateTutkintoTaiOpintoAction={updateTutkintoTaiOpinto}
              deleteTutkintoTaiOpintoAction={deleteTutkintoTaiOpinto}
              tyyppi={tyyppi}
            />
          </React.Fragment>
        ))}
      <OphButton
        sx={{
          alignSelf: 'flex-start',
        }}
        data-testid={`lisaa-tutkinto-tai-opinto-button`}
        variant="outlined"
        startIcon={<Add />}
        onClick={() => addTutkintoTaiOpinto()}
      >
        {t(`hakemus.paatos.paatostyyppi.${tyyppi}.lisaa`)}
      </OphButton>
    </>
  );
};
