import { Stack } from '@mui/material';
import {
  OphCheckbox,
  OphInputFormField,
  OphTypography,
} from '@opetushallitus/oph-design-system';
import React from 'react';

import { ValitusHaOValittajanVaatimusComponent } from '@/src/app/hakemus/valitustiedot/components/ValitusHaOValittajanVaatimusComponent';
import { ValitusLausuntopyyntoComponent } from '@/src/app/hakemus/valitustiedot/components/ValitusLausuntopyyntoComponent';
import { CalendarComponent } from '@/src/components/calendar-component';
import { OphRadioGroupWithClear } from '@/src/components/OphRadioGroupWithClear';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import { ValitusHaORatkaisu, ValitusHaO } from '@/src/lib/types/valitustiedot';
import { collapseIfEmpty } from '@/src/lib/utils';

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
        data-testid="valitushao-valitettu-checkbox"
        label={t('hakemus.valitustiedot.valitushao.haoValitettu')}
        checked={valitusHaO?.valitettu ?? false}
        onChange={() => {
          if (valitusHaO?.valitettu) {
            updateValitusHaO({
              valitettu: false,
              valitusPvm: null,
              ratkaisuPvm: null,
              lausuntopyyntoValittu: false,
              lausuntopyynto: null,
              valittajanVaatimus: null,
              ratkaisu: null,
              ratkaisuLisatieto: null,
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
                  valitusPvm: date ? date.toISOString() : null,
                  ratkaisuPvm:
                    !date || (ratkaisuPvm && date > ratkaisuPvm)
                      ? null
                      : valitusHaO?.ratkaisuPvm,
                })
              }
              maxDate={new Date()}
              selectedValue={valitusPvm}
              label={t('hakemus.valitustiedot.valitushao.haoValitusPvm')}
              dataTestId="valitushao-valituspvm-calendar"
            />
            <CalendarComponent
              setDate={(date: Date | null) =>
                updateValitusHaO({
                  ratkaisuPvm: date ? date.toISOString() : null,
                })
              }
              disabled={!valitusPvm}
              minDate={valitusPvm}
              selectedValue={ratkaisuPvm}
              label={t('hakemus.valitustiedot.valitushao.haoRatkaisuPvm')}
              dataTestId="valitushao-ratkaisupvm-calendar"
            />
          </Stack>
          <OphCheckbox
            label={t('hakemus.valitustiedot.valitushao.haoLausuntopyynto')}
            checked={valitusHaO?.lausuntopyyntoValittu ?? false}
            onChange={() => {
              if (valitusHaO?.lausuntopyyntoValittu) {
                updateValitusHaO({
                  lausuntopyyntoValittu: false,
                  lausuntopyynto: null,
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
                    lausuntopyynto: collapseIfEmpty({
                      ...valitusHaO?.lausuntopyynto,
                      ...lausuntopyynto,
                    }),
                  })
                }
              />
            </>
          )}
          <ValitusHaOValittajanVaatimusComponent
            valittajanVaatimus={valitusHaO.valittajanVaatimus}
            updateValittajanVaatimus={(valittajanVaatimus) =>
              updateValitusHaO({
                valittajanVaatimus: collapseIfEmpty({
                  ...valitusHaO?.valittajanVaatimus,
                  ...valittajanVaatimus,
                }),
              })
            }
          />
          <Stack>
            <OphRadioGroupWithClear
              labelId={
                'hakemus-valitustiedot-valitushao-ratkaisu-radio-group-label'
              }
              label={t('hakemus.valitustiedot.valitushao.ratkaisu')}
              data-testid={'valitushao-ratkaisu-radio-group'}
              options={ratkaisuOptions.map((ratkaisutyyppi) => ({
                value: ratkaisutyyppi,
                label: t(
                  `hakemus.valitustiedot.valitushao.ratkaisu.${ratkaisutyyppi}`,
                ),
              }))}
              row={false}
              value={valitusHaO.ratkaisu ?? ''}
              onChange={(e) =>
                updateValitusHaO({
                  ratkaisu: e.target.value as ValitusHaORatkaisu,
                })
              }
              onClear={() => {
                updateValitusHaO({
                  ratkaisu: null,
                  ratkaisuLisatieto: null,
                });
              }}
            />
          </Stack>
          {valitusHaO.ratkaisu && (
            <OphInputFormField
              multiline
              rows={5}
              label={t('hakemus.valitustiedot.valitushao.ratkaisu.lisatieto')}
              value={valitusHaO.ratkaisuLisatieto ?? ''}
              onChange={(e) => {
                updateValitusHaO({ ratkaisuLisatieto: e.target.value });
              }}
              data-testid="valitushao-ratkaisulisatieto-input"
            />
          )}
        </>
      )}
    </Stack>
  );
};
