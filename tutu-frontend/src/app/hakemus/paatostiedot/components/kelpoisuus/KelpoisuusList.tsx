import { Add } from '@mui/icons-material';
import { Stack } from '@mui/material';
import { OphButton } from '@opetushallitus/oph-design-system';
import { useEffect, useState } from 'react';

import { KelpoisuusComponent } from '@/src/app/hakemus/paatostiedot/components/kelpoisuus/KelpoisuusComponent';
import { TFunction } from '@/src/lib/localization/hooks/useTranslations';
import { TranslatedName } from '@/src/lib/localization/localizationTypes';
import { TreeOption } from '@/src/lib/localization/translationUtils';
import { Kelpoisuus, PaatosTieto } from '@/src/lib/types/paatos';

const emptyKelpoisuus = (paatostietoId: string): Kelpoisuus => ({
  paatostietoId: paatostietoId,
  opetettavaAine: '',
  myonteisenPaatoksenLisavaatimukset: undefined,
  kielteisenPaatoksenPerustelut: undefined,
});

type KelpoisuusListProps = {
  t: TFunction;
  paatosTieto: PaatosTieto;
  updatePaatosTietoAction: (
    updatedPaatosTieto: PaatosTieto,
    immediateSave?: boolean,
  ) => void;
  kelpoisuusOptions: TreeOption<TranslatedName>[];
};

export const KelpoisuusList = ({
  t,
  paatosTieto,
  updatePaatosTietoAction,
  kelpoisuusOptions,
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

  const addKelpoisuus = ({ kelpoisuus }: Partial<Kelpoisuus> = {}) => {
    const uusiKelpoisuus = emptyKelpoisuus(paatosTieto.id!);
    if (kelpoisuus !== undefined) {
      uusiKelpoisuus.kelpoisuus = kelpoisuus;
    }
    const tobeKelpoisuudet = currentKelpoisuudet.concat([uusiKelpoisuus]);
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
    updatePaatosTietoAction(
      {
        ...paatosTieto,
        kelpoisuudet: tobeKelpoisuudet,
      },
      true,
    );
  };

  const lastAineenopetusKelpoisuus: Kelpoisuus | undefined = currentKelpoisuudet
    .toReversed()
    .find((k: Kelpoisuus) => k.kelpoisuus?.includes('Aineenopettaja'));

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
          kelpoisuusOptions={kelpoisuusOptions}
        />
      ))}
      <Stack direction="row" gap={2}>
        <OphButton
          sx={{
            alignSelf: 'flex-start',
          }}
          data-testid={`lisaa-kelpoisuus-button`}
          variant="outlined"
          startIcon={<Add />}
          onClick={() => addKelpoisuus()}
        >
          {t(`hakemus.paatos.paatostyyppi.kelpoisuus.lisaa`)}
        </OphButton>
        {lastAineenopetusKelpoisuus && (
          <OphButton
            sx={{
              alignSelf: 'flex-start',
            }}
            data-testid={`lisaa-opetettava-aine-button`}
            variant="outlined"
            startIcon={<Add />}
            onClick={() =>
              addKelpoisuus({
                kelpoisuus: lastAineenopetusKelpoisuus.kelpoisuus,
              })
            }
          >
            {t(`hakemus.paatos.paatostyyppi.kelpoisuus.lisaaOpetettavaAine`)}
          </OphButton>
        )}
      </Stack>
    </>
  );
};
