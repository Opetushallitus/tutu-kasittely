'use client';

import { TFunction } from '@/src/lib/localization/hooks/useTranslations';
import { Paatostyyppi, TutkintoTaiOpinto } from '@/src/lib/types/paatos';
import { OphButton } from '@opetushallitus/oph-design-system';
import { Add } from '@mui/icons-material';
import React, { useEffect } from 'react';
import { RinnastettavaTutkintoTaiOpintoComponent } from '@/src/app/hakemus/[oid]/paatostiedot/components/RinnastettavaTutkintoTaiOpintoComponent';

const emptyTutkintoTaiOpinto = (paatostietoId: string): TutkintoTaiOpinto => ({
  paatostietoId: paatostietoId,
});

interface RinnastettavatTutkinnotTaiOpinnotListProps {
  t: TFunction;
  paatosTyyppi: Paatostyyppi;
  paatostietoId: string;
  rinnastettavatTutkinnotTaiOpinnot: TutkintoTaiOpinto[];
}

export const RinnastettavatTutkinnotTaiOpinnotList = ({
  t,
  paatosTyyppi,
  paatostietoId,
  rinnastettavatTutkinnotTaiOpinnot,
}: RinnastettavatTutkinnotTaiOpinnotListProps) => {
  const [tutkinnotTaiOpinnot, setTutkinnotTaiOpinnot] = React.useState<
    TutkintoTaiOpinto[]
  >([]);

  useEffect(() => {
    if (!rinnastettavatTutkinnotTaiOpinnot) return;
    setTutkinnotTaiOpinnot(rinnastettavatTutkinnotTaiOpinnot);
  }, [rinnastettavatTutkinnotTaiOpinnot]);
  const tyyppi =
    paatosTyyppi === 'RiittavatOpinnot'
      ? 'riittavatOpinnot'
      : 'tiettyTutkintoTaiOpinnot';

  const lisaaTutkintoTaiOpinto = () => {
    setTutkinnotTaiOpinnot((prevTutkinnotTaiOpinnot) => [
      ...prevTutkinnotTaiOpinnot.concat([
        emptyTutkintoTaiOpinto(paatostietoId),
      ]),
    ]);
  };

  console.log(tutkinnotTaiOpinnot);
  return (
    <>
      {tutkinnotTaiOpinnot.map((tutkintoTaiOpinto, index) => (
        <React.Fragment key={index}>
          <RinnastettavaTutkintoTaiOpintoComponent
            t={t}
            rinnastettavaTutkintoTaiOpinto={tutkintoTaiOpinto}
          />
        </React.Fragment>
      ))}
      <OphButton
        sx={{
          alignSelf: 'flex-start',
        }}
        data-testid={`lisaa-tutkinto-button`}
        variant="outlined"
        startIcon={<Add />}
        onClick={() => lisaaTutkintoTaiOpinto()}
      >
        {t(`hakemus.paatos.paatostyyppi.${tyyppi}.lisaa`)}
      </OphButton>
    </>
  );
};
