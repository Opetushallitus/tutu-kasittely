import { Stack } from '@mui/material';
import {
  OphCheckbox,
  OphFormFieldWrapper,
  OphInputFormField,
  OphRadioGroup,
  OphTypography,
} from '@opetushallitus/oph-design-system';
import React from 'react';

import { ValitusHaOValittajanVaatimusComponent } from '@/src/app/hakemus/valitustiedot/components/ValitusHaOValittajanVaatimusComponent';
import { ValitusLausuntopyyntoComponent } from '@/src/app/hakemus/valitustiedot/components/ValitusLausuntopyyntoComponent';
import { CalendarComponent } from '@/src/components/calendar-component';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import { ValitusHaORatkaisu, ValitusHaO } from '@/src/lib/types/valitustiedot';

export const ValitusHaOComponent = ({
  valitusHaO,
  updateValitusHaO,
}: {
  valitusHaO?: ValitusHaO;
  updateValitusHaO: (valitusHaO: Partial<ValitusHaO>) => void;
}) => {
  const { t } = useTranslations();

  const valitusPvm = valitusHaO?.valitusPvm
    ? new Date(valitusHaO.valitusPvm)
    : null;
  const ratkaisuPvm = valitusHaO?.ratkaisuPvm
    ? new Date(valitusHaO.ratkaisuPvm)
    : null;

  const ratkaisuOptions: Array<ValitusHaORatkaisu> = [
    'VaatimusHylatty',
    'UudelleenKasittely',
    'ErilainenPaatos',
    'KasittelyRauennut',
  ];

  return (
    <Stack spacing={3}>
      <OphTypography variant={'h3'}>
        {t('hakemus.valitustiedot.valitushao.otsikko')}
      </OphTypography>
      <OphCheckbox
        label={t('hakemus.valitustiedot.valitushao.haoValitettu')}
        checked={valitusHaO?.valitettu ?? false}
        onChange={() => {
          if (valitusHaO?.valitettu) {
            updateValitusHaO({
              valitettu: false,
              valitusPvm: undefined,
              ratkaisuPvm: undefined,
              lausuntopyyntoValittu: undefined,
              lausuntopyynto: undefined,
              valittajanVaatimus: undefined,
              ratkaisu: undefined,
              ratkaisuLisatieto: undefined,
            });
          } else {
            updateValitusHaO({ valitettu: true });
          }
        }}
      />
      {valitusHaO?.valitettu && (
        <>
          <Stack spacing={1} direction={'row'}>
            <CalendarComponent
              setDate={(date: Date | null) =>
                updateValitusHaO({
                  valitusPvm: date ? date.toISOString() : undefined,
                })
              }
              maxDate={new Date()}
              selectedValue={valitusPvm}
              label={t('hakemus.valitustiedot.valitushao.haoValitusPvm')}
            />
            <CalendarComponent
              setDate={(date: Date | null) =>
                updateValitusHaO({
                  ratkaisuPvm: date ? date.toISOString() : undefined,
                })
              }
              minDate={valitusPvm}
              selectedValue={ratkaisuPvm}
              label={t('hakemus.valitustiedot.valitushao.haoRatkaisuPvm')}
            />
          </Stack>
          <OphCheckbox
            label={t('hakemus.valitustiedot.valitushao.haoLausuntopyynto')}
            checked={valitusHaO?.lausuntopyyntoValittu ?? false}
            onChange={() => {
              if (valitusHaO?.lausuntopyyntoValittu) {
                updateValitusHaO({
                  lausuntopyyntoValittu: false,
                  lausuntopyynto: undefined,
                });
              } else {
                updateValitusHaO({ lausuntopyyntoValittu: true });
              }
            }}
          />
          {valitusHaO?.lausuntopyyntoValittu && (
            <>
              <ValitusLausuntopyyntoComponent
                namespace={'valitushao'}
                lausuntopyynto={valitusHaO.lausuntopyynto}
                updateLausuntopyynto={(lausuntopyynto) =>
                  updateValitusHaO({
                    lausuntopyynto: {
                      ...valitusHaO?.lausuntopyynto,
                      ...lausuntopyynto,
                    },
                  })
                }
              />
            </>
          )}
          <ValitusHaOValittajanVaatimusComponent
            valittajanVaatimus={valitusHaO.valittajanVaatimus}
            updateValittajanVaatimus={(valittajanVaatimus) =>
              updateValitusHaO({
                valittajanVaatimus: {
                  ...valitusHaO?.valittajanVaatimus,
                  ...valittajanVaatimus,
                },
              })
            }
          />
          <OphFormFieldWrapper
            label={t('hakemus.valitustiedot.valitushao.ratkaisu')}
            renderInput={({ labelId }) => (
              <OphRadioGroup
                labelId={labelId}
                options={ratkaisuOptions.map((ratkaisutyyppi) => ({
                  value: ratkaisutyyppi,
                  label: t(
                    `hakemus.valitustiedot.valitushao.ratkaisu.${ratkaisutyyppi}`,
                  ),
                }))}
                onChange={(_, value) =>
                  updateValitusHaO({ ratkaisu: value as ValitusHaORatkaisu })
                }
                value={valitusHaO.ratkaisu ?? ''}
              />
            )}
          />
          {valitusHaO.ratkaisu && (
            <OphInputFormField
              multiline
              rows={5}
              label={t('hakemus.valitustiedot.valitushao.ratkaisu.lisatieto')}
              value={valitusHaO.ratkaisuLisatieto ?? ''}
              onChange={(e) => {
                updateValitusHaO({ ratkaisuLisatieto: e.target.value });
              }}
            />
          )}
        </>
      )}
    </Stack>
  );
};
