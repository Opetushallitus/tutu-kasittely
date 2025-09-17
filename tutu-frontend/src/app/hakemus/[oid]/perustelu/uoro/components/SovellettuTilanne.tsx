'use client';

import { TFunction } from '@/src/lib/localization/hooks/useTranslations';
import {
  OphCheckbox,
  OphInputFormField,
  OphRadioGroup,
} from '@opetushallitus/oph-design-system';
import {
  PerusteluUoRo,
  PerusteluUoRoSisalto,
} from '@/src/lib/types/perusteluUoRo';
import { sovellettuTilanneBooleanFields } from '@/src/app/hakemus/[oid]/perustelu/uoro/constants/perusteluUoRoBooleanFields';
import React from 'react';
import { OphRadioOption } from '@/src/lib/types/common';

export type SovellettuTilanneProps = {
  perusteluUoRo?: PerusteluUoRo;
  updatePerusteluUoRoAction: (
    field: string,
    value: boolean | string | object,
  ) => void;
  t: TFunction;
};

function hasChecked(value: unknown): value is { checked: boolean } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'checked' in value &&
    typeof (value as { checked?: unknown }).checked === 'boolean'
  );
}

function hasValueProp(v: unknown): v is { value: string | number } {
  return (
    typeof v === 'object' &&
    v !== null &&
    'value' in v &&
    typeof (v as { value: unknown }).value === 'string'
  );
}

export const SovellettuTilanne = ({
  perusteluUoRo,
  updatePerusteluUoRoAction,
  t,
}: SovellettuTilanneProps) => {
  const sovellettuTilanneRadioOptions: OphRadioOption<string>[] = [
    { value: 'A', label: 'A' },
    { value: 'B', label: 'B' },
    { value: 'C', label: 'C' },
    { value: 'D', label: 'D' },
  ];

  return sovellettuTilanneBooleanFields.map(({ type, key, labelKey }) => {
    const fieldValue =
      perusteluUoRo?.perustelunSisalto?.[key as keyof PerusteluUoRoSisalto];

    const checked =
      type === 'boolean'
        ? Boolean(fieldValue)
        : hasChecked(fieldValue)
          ? fieldValue.checked
          : false;

    const radioValue = hasValueProp(fieldValue)
      ? String(fieldValue.value)
      : null;

    return (
      <React.Fragment key={key as string}>
        <OphCheckbox
          label={t(labelKey)}
          data-testid={`checkbox-${key as string}`}
          checked={checked}
          //todo: väliaikaisesti disabloitu, tehdään seuraavassa tiketissä.
          disabled={key === 'sovellettuOpetettavanAineenOpinnot'}
          onChange={(e) =>
            type === 'boolean'
              ? updatePerusteluUoRoAction(key, !checked)
              : updatePerusteluUoRoAction(
                  key,
                  e.target.checked
                    ? {
                        checked: true,
                        value: e.target.value,
                      }
                    : { checked: false, value: null },
                )
          }
        />
        {checked && typeof fieldValue !== 'boolean' && (
          <OphRadioGroup
            labelId="imiPyynto-radio-group-label"
            data-testid={`radio-group-${key as string}`}
            sx={{ paddingLeft: 4 }}
            options={sovellettuTilanneRadioOptions}
            row
            value={radioValue || ''}
            onChange={(e) =>
              updatePerusteluUoRoAction(key, {
                checked: true,
                value: e.target.value,
              })
            }
          />
        )}
        {perusteluUoRo?.perustelunSisalto.sovellettuMuuTilanne && (
          <OphInputFormField
            data-testid="otmMuuEroSelite"
            sx={{ paddingLeft: 4 }}
            multiline={true}
            minRows={5}
            label={t('yleiset.tasmenna')}
            value={
              perusteluUoRo?.perustelunSisalto.sovellettuMuuTilanneSelite || ''
            }
            onChange={(event) =>
              updatePerusteluUoRoAction(
                'sovellettuMuuTilanneSelite',
                event.target.value,
              )
            }
          />
        )}
      </React.Fragment>
    );
  });
};
