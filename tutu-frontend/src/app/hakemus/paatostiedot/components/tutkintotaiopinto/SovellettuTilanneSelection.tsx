import React from 'react';

import { OphSelectFormFieldPatched } from '@/src/components/OphSelectFormFieldPatched';
import { TFunction } from '@/src/lib/localization/hooks/useTranslations';

export type SovellettuTilanneOption = {
  value: string;
  tKey?: string;
  ordinal?: string;
};

export type SovellettuTilanneProps = {
  t: TFunction;
  sovellettuTilanne?: string;
  sovellettuTilanneOptions: SovellettuTilanneOption[];
  updateCb: (sovellettuTilanne: string) => void;
};

const SovellettuTilanneLabel = (
  t: TFunction,
  sovellettuTilanne: SovellettuTilanneOption,
): string => {
  const base = sovellettuTilanne.tKey
    ? t(
        `hakemus.paatos.myonteinenPaatos.uo.sovellettuTilanne.${sovellettuTilanne.tKey}`,
      )
    : sovellettuTilanne.value;
  return sovellettuTilanne.ordinal
    ? `${base} ${sovellettuTilanne.ordinal}`
    : base;
};

export const SovellettuTilanneSelection = ({
  t,
  sovellettuTilanne,
  sovellettuTilanneOptions,
  updateCb,
}: SovellettuTilanneProps) => {
  return (
    <>
      {sovellettuTilanneOptions.length > 0 && (
        <OphSelectFormFieldPatched
          options={sovellettuTilanneOptions.map((option) => ({
            label: SovellettuTilanneLabel(t, option),
            value: option.value,
          }))}
          label={t(`hakemus.paatos.myonteinenPaatos.uo.sovellettuTilanne`)}
          value={sovellettuTilanne || ''}
          onChange={(event) => {
            updateCb(event.target.value);
          }}
          data-testid={`myonteinenPaatos-uo-sovellettuTilanne-select`}
        />
      )}
    </>
  );
};
