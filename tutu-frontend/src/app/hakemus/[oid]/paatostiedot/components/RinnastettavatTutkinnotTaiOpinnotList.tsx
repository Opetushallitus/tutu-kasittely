'use client';

import { TFunction } from '@/src/lib/localization/hooks/useTranslations';
import { PaatosTieto, TutkintoTaiOpinto } from '@/src/lib/types/paatos';
import { OphButton } from '@opetushallitus/oph-design-system';
import { Add } from '@mui/icons-material';
import React, { useEffect } from 'react';
import { RinnastettavaTutkintoTaiOpintoComponent } from '@/src/app/hakemus/[oid]/paatostiedot/components/RinnastettavaTutkintoTaiOpintoComponent';

const emptyTutkintoTaiOpinto = (paatostietoId: string): TutkintoTaiOpinto => ({
  paatostietoId: paatostietoId,
  myonteisenPaatoksenLisavaatimukset: '{}',
  kielteisenPaatoksenPerustelut: '{}',
});

type RinnastettavatTutkinnotTaiOpinnotListProps = {
  t: TFunction;
  paatosTieto: PaatosTieto;
  rinnastettavatTutkinnotTaiOpinnot: TutkintoTaiOpinto[];
  updatePaatosTietoAction: (updatedPaatosTieto: PaatosTieto) => void;
};

export const RinnastettavatTutkinnotTaiOpinnotList = ({
  t,
  paatosTieto,
  rinnastettavatTutkinnotTaiOpinnot,
  updatePaatosTietoAction,
}: RinnastettavatTutkinnotTaiOpinnotListProps) => {
  const [tutkinnotTaiOpinnot, setTutkinnotTaiOpinnot] = React.useState<
    TutkintoTaiOpinto[]
  >([]);

  useEffect(() => {
    if (!rinnastettavatTutkinnotTaiOpinnot) return;
    setTutkinnotTaiOpinnot(rinnastettavatTutkinnotTaiOpinnot);
  }, [rinnastettavatTutkinnotTaiOpinnot]);
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
    setTutkinnotTaiOpinnot(newTutkinnotTaiOpinnot);
    updatePaatosTietoAction({
      ...paatosTieto,
      rinnastettavatTutkinnotTaiOpinnot: newTutkinnotTaiOpinnot,
    });
  };

  const addTutkintoTaiOpinto = () => {
    setTutkinnotTaiOpinnot((oldTutkinnotTaiOpinnot) =>
      oldTutkinnotTaiOpinnot.concat([emptyTutkintoTaiOpinto(paatosTieto.id!)]),
    );
  };

  const deleteTutkintoTaiOpinto = (id: string | undefined) => {
    const newTutkinnotTaiOpinnot = id
      ? tutkinnotTaiOpinnot.filter(
          (tutkintoTaiOpinto) => tutkintoTaiOpinto.id !== id,
        )
      : tutkinnotTaiOpinnot.slice(0, -1);
    setTutkinnotTaiOpinnot(newTutkinnotTaiOpinnot);
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
