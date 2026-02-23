import { LopullinenKelpoisuusComponent } from '@/src/app/hakemus/[oid]/paatostiedot/components/kelpoisuus/LopullinenKelpoisuusComponent';
import { TFunction } from '@/src/lib/localization/hooks/useTranslations';
import { Kelpoisuus, PaatosTieto } from '@/src/lib/types/paatos';

type LopullinenKelpoisuusListProps = {
  t: TFunction;
  paatosTieto: PaatosTieto;
  updatePaatosTietoAction: (
    updatedPaatosTieto: PaatosTieto,
    immediateSave?: boolean,
  ) => void;
};

export const LopullinenKelpoisuusList = ({
  t,
  paatosTieto,
  updatePaatosTietoAction,
}: LopullinenKelpoisuusListProps) => {
  const updateKelpoisuus = (updatedKelpoisuus: Kelpoisuus, index: number) => {
    const tobeKelpoisuudet = [...paatosTieto.kelpoisuudet];
    tobeKelpoisuudet[index] = updatedKelpoisuus;
    updatePaatosTietoAction({
      ...paatosTieto,
      kelpoisuudet: tobeKelpoisuudet,
    });
  };

  return (
    <>
      {paatosTieto.kelpoisuudet.map((kelpoisuus, index) => (
        <LopullinenKelpoisuusComponent
          key={kelpoisuus.id ?? index}
          t={t}
          index={index}
          kelpoisuus={kelpoisuus}
          updateKelpoisuusAction={updateKelpoisuus}
        />
      ))}
    </>
  );
};
