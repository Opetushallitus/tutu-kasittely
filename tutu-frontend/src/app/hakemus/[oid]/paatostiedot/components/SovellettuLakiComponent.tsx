import { OphSelectFormField } from '@opetushallitus/oph-design-system';
import React from 'react';

import { sovellettuLakiOptions } from '@/src/app/hakemus/[oid]/paatostiedot/constants';
import { TFunction } from '@/src/lib/localization/hooks/useTranslations';
import { PaatosTieto, Paatostyyppi } from '@/src/lib/types/paatos';

export type SovellettuLakiComponentProps = {
  t: TFunction;
  paatostieto: PaatosTieto;
  handleChange: (value: string) => void;
};

export const SovellettuLakiComponent = ({
  t,
  paatostieto,
  handleChange,
}: SovellettuLakiComponentProps) => {
  return (
    <OphSelectFormField
      placeholder={t('yleiset.valitse')}
      label={t('hakemus.paatos.sovellettuLaki.otsikko')}
      options={sovellettuLakiOptions(
        paatostieto.paatosTyyppi as Paatostyyppi,
        t,
      )}
      value={paatostieto.sovellettuLaki || ''}
      onChange={(event) => handleChange(event.target.value)}
      data-testid={'paatos-sovellettulaki-dropdown'}
      inputProps={{
        'aria-label': t('hakemus.paatos.sovellettuLaki.otsikko'),
      }}
    />
  );
};
