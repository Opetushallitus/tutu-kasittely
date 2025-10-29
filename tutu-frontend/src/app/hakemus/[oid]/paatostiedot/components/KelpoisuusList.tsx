import { TFunction } from '@/src/lib/localization/hooks/useTranslations';
import { Kelpoisuus, PaatosTieto } from '@/src/lib/types/paatos';
import { useEffect, useState } from 'react';
import { KelpoisuusComponent } from '@/src/app/hakemus/[oid]/paatostiedot/components/KelpoisuusComponent';

const emptyKelpoisuus = (paatostietoId: string): Kelpoisuus => ({
  paatostietoId: paatostietoId,
  opetettavaAine: '',
  myonteisenPaatoksenLisavaatimukset: '{}',
  kielteisenPaatoksenPerustelut: '{}',
});

type KelpoisuusListProps = {
  t: TFunction;
  paatosTieto: PaatosTieto;
  updatePaatosTietoAction: (updatedPaatosTieto: PaatosTieto) => void;
};

export const KelpoisuusList = ({
  t,
  paatosTieto,
  updatePaatosTietoAction,
}: KelpoisuusListProps) => {
  const [currentKelpoisuudet, setCurrentKelpoisuudet] = useState<Kelpoisuus[]>(
    [],
  );
  useEffect(() => {
    setCurrentKelpoisuudet(
      paatosTieto.kelpoisuudet.length
        ? paatosTieto.kelpoisuudet
        : [emptyKelpoisuus(paatosTieto.id!)],
    );
  }, [paatosTieto.id, paatosTieto.kelpoisuudet]);

  const updateKelpoisuus = (updatedKelpoisuus: Kelpoisuus, index: number) => {
    const tobeKelpoisuudet = [...currentKelpoisuudet];
    tobeKelpoisuudet[index] = updatedKelpoisuus;
    setCurrentKelpoisuudet(tobeKelpoisuudet);
    updatePaatosTietoAction({
      ...paatosTieto,
      kelpoisuudet: tobeKelpoisuudet,
    });
  };

  const addKelpoisuus = () => {
    const tobeKelpoisuudet = currentKelpoisuudet.concat([
      emptyKelpoisuus(paatosTieto.id!),
    ]);
    setCurrentKelpoisuudet(tobeKelpoisuudet);
    updatePaatosTietoAction({
      ...paatosTieto,
      kelpoisuudet: tobeKelpoisuudet,
    });
  };

  const deleteKelpoisuus = (id?: string) => {
    const tobeKelpoisuudet = id
      ? currentKelpoisuudet.filter((kelpoisuus) => kelpoisuus.id !== id)
      : currentKelpoisuudet.slice(0, -1);
    setCurrentKelpoisuudet(tobeKelpoisuudet);
    updatePaatosTietoAction({
      ...paatosTieto,
      kelpoisuudet: tobeKelpoisuudet,
    });
  };

  return (
    <>
      {currentKelpoisuudet.map((kelpoisuus, index) => (
        <KelpoisuusComponent
          key={index}
          t={t}
          index={index}
          kelpoisuus={kelpoisuus}
          sovellettuLaki={paatosTieto.sovellettuLaki}
          updateKelpoisuusAction={updateKelpoisuus}
          deleteKelpoisuusAction={deleteKelpoisuus}
        />
      ))}
    </>
  );
};
