import { Stack, useTheme } from '@mui/material';
import {
  OphCheckbox,
  OphInputFormField,
  OphTypography,
} from '@opetushallitus/oph-design-system';
import React from 'react';

import { CalendarComponent } from '@/src/components/calendar-component';
import { OphRadioGroupWithClear } from '@/src/components/OphRadioGroupWithClear';
import {
  TFunction,
  useTranslations,
} from '@/src/lib/localization/hooks/useTranslations';
import { ValitusKHO, ValitusKHORatkaisu } from '@/src/lib/types/valitustiedot';

const ratkaisuOptions = (t: TFunction) =>
  [
    {
      value: 'EiValituslupaa',
      label: t('hakemus.valitustiedot.valituskho.ratkaisu.eiValituslupaa'),
    },
    {
      value: 'HakijanVaatimusHylatty',
      label: t(
        'hakemus.valitustiedot.valituskho.ratkaisu.hakijanVaatimusHylatty',
      ),
    },
    {
      value: 'UudelleenOPHKasittelyyn',
      label: t(
        'hakemus.valitustiedot.valituskho.ratkaisu.uudelleenOPHKasittelyyn',
      ),
    },
    {
      value: 'KhoErilainenPaatos',
      label: t('hakemus.valitustiedot.valituskho.ratkaisu.khoErilainenPaatos'),
    },
    {
      value: 'KhoKasittelyRauennut',
      label: t(
        'hakemus.valitustiedot.valituskho.ratkaisu.khoKasittelyRauennut',
      ),
    },
  ].map((option, index) => ({
    ...option,
    label: `${index + 1} ${option.label}`,
  }));

export const ValitusKHOComponent = ({
  valitusKHO,
  updateValitusKHO,
}: {
  valitusKHO?: ValitusKHO;
  updateValitusKHO: (valitustiedot: Partial<ValitusKHO>) => void;
}) => {
  const { t } = useTranslations();
  const theme = useTheme();

  const khoValitusPvm = valitusKHO?.valitusPvm
    ? new Date(valitusKHO.valitusPvm)
    : null;
  const khoRatkaisuPvm = valitusKHO?.ratkaisuPvm
    ? new Date(valitusKHO.ratkaisuPvm)
    : null;

  return (
    <Stack gap={theme.spacing(2)}>
      <OphTypography variant={'h3'}>
        {t('hakemus.valitustiedot.valituskho.otsikko')}
      </OphTypography>
      <Stack gap={theme.spacing(4)}>
        <OphCheckbox
          data-testid="valituskho-valitettu-checkbox"
          label={t('hakemus.valitustiedot.valituskho.valitettu')}
          checked={valitusKHO?.valitettu ?? false}
          onChange={() => {
            if (valitusKHO?.valitettu) {
              updateValitusKHO({
                valitettu: false,
                valitusPvm: undefined,
                ratkaisuPvm: undefined,
                ratkaisu: undefined,
                ratkaisuLisatieto: undefined,
              });
            } else {
              updateValitusKHO({ valitettu: true });
            }
          }}
        />
        {valitusKHO?.valitettu && (
          <>
            <Stack direction={'row'} gap={theme.spacing(3)}>
              <CalendarComponent
                label={t('hakemus.valitustiedot.valituskho.valituspvm')}
                selectedValue={khoValitusPvm}
                minDate={null}
                maxDate={new Date()}
                setDate={(date) => {
                  updateValitusKHO({
                    valitusPvm: date ? date.toISOString() : undefined,
                    ratkaisuPvm:
                      !date || (khoRatkaisuPvm && date > khoRatkaisuPvm)
                        ? undefined
                        : valitusKHO?.ratkaisuPvm,
                  });
                }}
                dataTestId="valituskho-valituspvm-calendar"
              />
              <CalendarComponent
                label={t('hakemus.valitustiedot.valituskho.ratkaisupvm')}
                selectedValue={khoRatkaisuPvm}
                disabled={!khoValitusPvm}
                minDate={khoValitusPvm}
                maxDate={null}
                setDate={(date) => {
                  updateValitusKHO({
                    ratkaisuPvm: date ? date.toISOString() : undefined,
                  });
                }}
                dataTestId="valituskho-ratkaisupvm-calendar"
              />
            </Stack>
            <Stack>
              <OphRadioGroupWithClear
                labelId={
                  'hakemus-valitustiedot-valituskho-ratkaisu-radio-group-label'
                }
                label={t('hakemus.valitustiedot.valituskho.ratkaisu')}
                data-testid={'valituskho-ratkaisu-radio-group'}
                options={ratkaisuOptions(t)}
                row={false}
                value={valitusKHO?.ratkaisu ?? ''}
                onChange={(e) => {
                  updateValitusKHO({
                    ratkaisu: e.target.value as ValitusKHORatkaisu,
                  });
                }}
                onClear={() => {
                  updateValitusKHO({
                    ratkaisu: undefined,
                    ratkaisuLisatieto: undefined,
                  });
                }}
              />
            </Stack>
            {valitusKHO?.ratkaisu && (
              <OphInputFormField
                label={t('hakemus.valitustiedot.valituskho.ratkaisuLisatieto')}
                multiline
                value={valitusKHO?.ratkaisuLisatieto ?? ''}
                onChange={(e) => {
                  updateValitusKHO({ ratkaisuLisatieto: e.target.value });
                }}
                rows={5}
                data-testid="valituskho-ratkaisulisatieto-input"
              />
            )}
          </>
        )}
      </Stack>
    </Stack>
  );
};
