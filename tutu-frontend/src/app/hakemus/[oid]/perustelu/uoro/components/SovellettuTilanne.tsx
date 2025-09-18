'use client';

import { TFunction } from '@/src/lib/localization/hooks/useTranslations';
import {
  OphCheckbox,
  OphInputFormField,
  OphRadioGroup,
  OphTypography,
} from '@opetushallitus/oph-design-system';
import {
  PerusteluUoRo,
  PerusteluUoRoSisalto,
} from '@/src/lib/types/perusteluUoRo';
import { sovellettuTilanneBooleanFields } from '@/src/app/hakemus/[oid]/perustelu/uoro/constants/perusteluUoRoBooleanFields';
import React from 'react';
import {
  SovellettuTilanneOpetettavatAineetOptions,
  sovellettuTilanneOpetettavatAineetVieraatKieletOptions,
  sovellettuTilanneOptions,
} from '@/src/app/hakemus/[oid]/perustelu/uoro/constants/SovellettuTilanneOptions';
import { Stack } from '@mui/material';

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

    const updatePerusteluUoRoChecked = (
      type: string,
      key: string,
      e: React.ChangeEvent<HTMLInputElement>,
    ) => {
      switch (type) {
        case 'boolean':
          updatePerusteluUoRoAction(key, !checked);
          break;
        case 'sovellettuTilanneOpetettavatAineet':
          if (e.target.checked) {
            updatePerusteluUoRoAction(key, {
              checked: true,
              kieliAine: [],
              aineet: [],
            });
          } else
            updatePerusteluUoRoAction(key, {
              checked: false,
              kieliAine: null,
              aineet: null,
            });
          break;
        default:
          if (e.target.checked) {
            updatePerusteluUoRoAction(key, {
              checked: true,
              value: e.target.value,
            });
          } else
            updatePerusteluUoRoAction(key, {
              checked: false,
              value: null,
            });
      }
    };

    const updatePerusteluUoRoKieliAine = (
      e: React.ChangeEvent<HTMLInputElement>,
      value: string,
    ) => {
      const kieliAineet =
        perusteluUoRo?.perustelunSisalto?.sovellettuOpetettavanAineenOpinnot
          ?.kieliAine || [];
      const kieliAineetToUpdate = e.target.checked
        ? [...kieliAineet, value]
        : kieliAineet.filter((kieli) => kieli !== value);
      updatePerusteluUoRoAction('sovellettuOpetettavanAineenOpinnot', {
        checked: true,
        kieliAine: kieliAineetToUpdate,
        aineet:
          perusteluUoRo?.perustelunSisalto?.sovellettuOpetettavanAineenOpinnot
            ?.aineet,
      });
    };

    return (
      <React.Fragment key={key as string}>
        <OphCheckbox
          label={t(labelKey)}
          data-testid={`checkbox-${key as string}`}
          checked={checked}
          onChange={(e) => updatePerusteluUoRoChecked(type, key, e)}
        />
        {checked && type === 'sovellettuTilanne' && (
          <OphRadioGroup
            labelId="sovellettu-tilanne-radio-group-label"
            data-testid={`radio-group-${key as string}`}
            sx={{ paddingLeft: 4 }}
            options={sovellettuTilanneOptions}
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
        {checked && type === 'sovellettuTilanneOpetettavatAineet' && (
          <>
            <Stack direction="row" sx={{ paddingLeft: 4 }} spacing={2}>
              <OphTypography variant="body1" sx={{ minWidth: 150 }}>
                {t('hakemus.perustelu.uoro.sovellettuTilanne.vieraatKielet')}
              </OphTypography>
              {sovellettuTilanneOpetettavatAineetVieraatKieletOptions.map(
                (option) => (
                  <OphCheckbox
                    key={option.value}
                    label={option.label}
                    data-testid={`opetettavatAineetVieraatKielet-${option.value}-checkBox`}
                    checked={
                      !!(
                        perusteluUoRo?.perustelunSisalto
                          ?.sovellettuOpetettavanAineenOpinnot?.kieliAine &&
                        perusteluUoRo?.perustelunSisalto.sovellettuOpetettavanAineenOpinnot?.kieliAine?.includes?.(
                          option.value,
                        )
                      )
                    }
                    onChange={(e) =>
                      updatePerusteluUoRoKieliAine(e, option.value)
                    }
                  />
                ),
              )}
            </Stack>
            {Object.entries(SovellettuTilanneOpetettavatAineetOptions).map(
              ([subject, options]) => (
                <Stack
                  key={subject}
                  direction="row"
                  sx={{ paddingLeft: 4 }}
                  spacing={2}
                >
                  <OphTypography variant="body1" sx={{ minWidth: 150 }}>
                    {t(
                      `hakemus.perustelu.uoro.sovellettuTilanne.aineet.${subject}`,
                    )}
                  </OphTypography>
                  <OphRadioGroup
                    key={subject}
                    labelId={`sovellettu-tilanne-radio-group-label-${subject}`}
                    data-testid={`radio-group-${subject}`}
                    options={options}
                    row
                    value={radioValue || ''}
                    onChange={(e) =>
                      updatePerusteluUoRoAction(subject, {
                        checked: true,
                        value: e.target.value,
                      })
                    }
                  />
                </Stack>
              ),
            )}
          </>
        )}
        {checked && type == 'boolean' && (
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
