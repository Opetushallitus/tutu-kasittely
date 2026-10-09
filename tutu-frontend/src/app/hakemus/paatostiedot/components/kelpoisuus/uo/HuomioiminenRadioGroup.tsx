import {
  OphFormFieldWrapper,
  OphRadioGroup,
} from '@opetushallitus/oph-design-system';
import React from 'react';

import { TFunction } from '@/src/lib/localization/hooks/useTranslations';

type HuomioiminenRadioGroupProps<T extends string> = {
  field: string;
  options: Array<T>;
  value?: T;
  updateValue: (value: T) => void;
  t: TFunction;
};

export const HuomioiminenRadioGroup = <T extends string>({
  field,
  options,
  value,
  updateValue,
  t,
}: HuomioiminenRadioGroupProps<T>) => {
  return (
    <OphFormFieldWrapper
      label={t(`hakemus.paatos.paatostyyppi.kelpoisuus.uo.${field}`)}
      renderInput={({ labelId }) => (
        <OphRadioGroup
          sx={{ marginTop: 1 }}
          options={options.map((option) => ({
            label: t(
              `hakemus.paatos.paatostyyppi.kelpoisuus.uo.${field}.${option}`,
            ),
            value: option,
          }))}
          labelId={labelId}
          value={value || ''}
          onChange={(event) => updateValue(event.target.value as T)}
          data-testid={`uo-${field}-radio`}
        />
      )}
    />
  );
};
