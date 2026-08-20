import { Stack } from '@mui/material';
import React, { useMemo } from 'react';

import { MyonteinenPaatosProps } from '@/src/app/hakemus/paatostiedot/components/tutkintotaiopinto/MyonteinenPaatos';
import { SovellettuTilanneOikeustieteenMaisteri } from '@/src/app/hakemus/paatostiedot/components/tutkintotaiopinto/oikeustieteenmaisteri/SovellettuTilanneOikeustieteenMaisteri';
import { OIKEUSTIETEEN_MAISTERI_KEYS } from '@/src/app/hakemus/paatostiedot/constants';
import { OphSelectFormFieldPatched } from '@/src/components/OphSelectFormFieldPatched';

enum resolvedEntity {
  OikeustieteenMaisteri,
  OpetettavaAine,
  OpettajanPedagogisetOpinnot,
  Erityisopetus,
  OppilasJaOpintoOhjaus,
  KasvatustieteellinenAla,
  SosiaaliJaTerveysAla,
  MonialaisetOpinnot,
  AmmatillisetValmiudet,
  Muu,
}

const KEYWORDS_BY_TUTKINTO_TAI_OPINTO = [
  {
    tutkintoTaiOpinto: resolvedEntity.OikeustieteenMaisteri,
    keywords: OIKEUSTIETEEN_MAISTERI_KEYS,
  },
  { tutkintoTaiOpinto: resolvedEntity.OpetettavaAine, keywords: [] },
  {
    tutkintoTaiOpinto: resolvedEntity.OpettajanPedagogisetOpinnot,
    keywords: [],
  },
  { tutkintoTaiOpinto: resolvedEntity.Erityisopetus, keywords: [] },
  { tutkintoTaiOpinto: resolvedEntity.OppilasJaOpintoOhjaus, keywords: [] },
  { tutkintoTaiOpinto: resolvedEntity.KasvatustieteellinenAla, keywords: [] },
  { tutkintoTaiOpinto: resolvedEntity.SosiaaliJaTerveysAla, keywords: [] },
  { tutkintoTaiOpinto: resolvedEntity.MonialaisetOpinnot, keywords: [] },
  { tutkintoTaiOpinto: resolvedEntity.AmmatillisetValmiudet, keywords: [] },
  { tutkintoTaiOpinto: resolvedEntity.Muu, keywords: [] },
];

type SovellettuTilanne = {
  value: string;
  tKey?: string;
};
const SOVELLETTU_TILANNE_BY_ENTITY: Record<
  resolvedEntity,
  SovellettuTilanne[]
> = {
  [resolvedEntity.OikeustieteenMaisteri]: [
    { value: '1' },
    { value: '1a' },
    { value: '1b' },
    { value: '2' },
    { value: '2a' },
    { value: '3' },
    { value: '4' },
    { value: '4a' },
    { value: 'muu', tKey: 'muuOikeustieteenMaisteri' },
  ],
  [resolvedEntity.OpetettavaAine]: [],
  [resolvedEntity.OpettajanPedagogisetOpinnot]: [],
  [resolvedEntity.Erityisopetus]: [],
  [resolvedEntity.OppilasJaOpintoOhjaus]: [],
  [resolvedEntity.KasvatustieteellinenAla]: [],
  [resolvedEntity.SosiaaliJaTerveysAla]: [],
  [resolvedEntity.MonialaisetOpinnot]: [],
  [resolvedEntity.AmmatillisetValmiudet]: [],
  [resolvedEntity.Muu]: [],
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ENTITIES_WITH_KIELISTETTY_SOVELLETTU_TILANNE: resolvedEntity[] = [];

export const MyonteinenPaatosTutkintoTaiOpintoUO: React.FC<
  MyonteinenPaatosProps
> = ({
  t,
  updateLisavaatimukset,
  tutkintoTaiOpinto,
  lisavaatimukset,
}: MyonteinenPaatosProps) => {
  const { selectedEntity, sovellettuTilanneOptions } = useMemo(() => {
    const entity =
      KEYWORDS_BY_TUTKINTO_TAI_OPINTO.find((item) =>
        item.keywords.some((kw) => (tutkintoTaiOpinto ?? '').includes(kw)),
      )?.tutkintoTaiOpinto ?? resolvedEntity.Muu;
    return {
      selectedEntity: entity,
      sovellettuTilanneOptions: SOVELLETTU_TILANNE_BY_ENTITY[entity],
    };
  }, [tutkintoTaiOpinto]);

  return (
    <Stack direction="column" gap={3}>
      {sovellettuTilanneOptions.length > 0 && (
        <OphSelectFormFieldPatched
          options={sovellettuTilanneOptions.map((option) => ({
            label: option.tKey
              ? t(
                  `hakemus.paatos.myonteinenPaatos.uo.sovellettuTilanne.${option.tKey}`,
                )
              : option.value,
            value: option.value,
          }))}
          label={t(`hakemus.paatos.myonteinenPaatos.uo.sovellettuTilanne`)}
          value={lisavaatimukset?.sovellettuTilanne || ''}
          onChange={(event) => {
            updateLisavaatimukset({
              sovellettuTilanne: event.target.value,
            });
          }}
          data-testid={`myonteinenPaatos-uo-sovellettuTilanne-select`}
        />
      )}
      {selectedEntity === resolvedEntity.OikeustieteenMaisteri &&
        lisavaatimukset?.sovellettuTilanne && (
          <SovellettuTilanneOikeustieteenMaisteri
            t={t}
            lisavaatimukset={lisavaatimukset}
            updateLisavaatimukset={updateLisavaatimukset}
          />
        )}
    </Stack>
  );
};
