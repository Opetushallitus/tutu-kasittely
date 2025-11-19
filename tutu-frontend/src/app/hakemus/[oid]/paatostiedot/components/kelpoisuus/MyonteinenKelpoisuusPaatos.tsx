import {
  AmmattikokemusJaElinikainenOppiminen,
  KelpoisuudenLisavaatimukset,
  KorvaavaToimenpide,
  MyonteisenPaatoksenLisavaatimusUpdateCallback,
} from '@/src/lib/types/paatos';
import { TFunction } from '@/src/lib/localization/hooks/useTranslations';
import { Theme } from '@mui/material/styles';
import { Stack } from '@mui/material';
import { OphRadioGroupWithClear } from '@/src/components/OphRadioGroupWithClear';
import {
  erotKoulutuksessaAineenopettajaFields,
  olennaisiaErojaOptions,
} from '@/src/app/hakemus/[oid]/paatostiedot/constants';
import {
  OphCheckbox,
  OphInputFormField,
  OphTypography,
} from '@opetushallitus/oph-design-system';
import React from 'react';
import { KorvaavaToimenpideComponent } from '@/src/app/hakemus/[oid]/paatostiedot/components/kelpoisuus/KorvaavaToimenpide';
import { initOrUpdateMyonteinenKelpoisuusPaatos } from '@/src/app/hakemus/[oid]/paatostiedot/paatostietoUtils';
import { AmmattikokemusJaElinikainenOppiminenComponent } from '@/src/app/hakemus/[oid]/paatostiedot/components/kelpoisuus/AmmattikokemusJaElinikainenOppiminenComponent';

export type MyonteinenKelpoisuusPaatosProps = {
  lisavaatimukset?: KelpoisuudenLisavaatimukset | null;
  updateLisavaatimukset: MyonteisenPaatoksenLisavaatimusUpdateCallback;
  t: TFunction;
  theme: Theme;
};

export const MyonteinenKelpoisuusPaatos: React.FC<
  MyonteinenKelpoisuusPaatosProps
> = ({
  lisavaatimukset,
  updateLisavaatimukset,
  t,
  theme,
}: MyonteinenKelpoisuusPaatosProps) => {
  const selectedKelpoisuus = t(
    'hakemus.paatos.paatostyyppi.kelpoisuus.paatos.aineenopetus',
  );

  const updateKelpoisuudenLisavaatimukset = (
    updatedLisavaatimukset: Partial<KelpoisuudenLisavaatimukset>,
  ) => {
    const tobeVaatimukset = initOrUpdateMyonteinenKelpoisuusPaatos(
      { ...lisavaatimukset },
      { ...updatedLisavaatimukset },
    );
    updateLisavaatimukset(tobeVaatimukset);
  };

  return (
    <Stack gap={theme.spacing(3)}>
      <OphRadioGroupWithClear
        label={t(
          'hakemus.paatos.paatostyyppi.kelpoisuus.paatos.olennaisiaEroja',
        )}
        labelId={
          'kelpoisuus-myonteinenPaatos-olennaisiaEroja-radio-group-label'
        }
        data-testid={'kelpoisuus-myonteinenPaatos-olennaisiaEroja-radio-group'}
        options={olennaisiaErojaOptions(t)}
        value={lisavaatimukset?.olennaisiaEroja?.toString() || ''}
        onChange={(e) =>
          updateKelpoisuudenLisavaatimukset({
            olennaisiaEroja: e.target.value === 'true',
          })
        }
        onClear={() => updateLisavaatimukset({ olennaisiaEroja: null })}
      />
      {lisavaatimukset?.erotAineenopettajanKoulutuksessa && (
        <Stack gap={theme.spacing(2)}>
          <OphTypography variant="h5">
            {t(
              'hakemus.paatos.paatostyyppi.kelpoisuus.paatos.erotKoulutuksessa',
              { kelpoisuus: selectedKelpoisuus },
            )}
          </OphTypography>
          <Stack gap={theme.spacing(1)}>
            {erotKoulutuksessaAineenopettajaFields.map((key) => (
              <OphCheckbox
                key={key}
                data-testid={`erotKoulutuksessa-aineenopettaja-${key}`}
                label={t(
                  `hakemus.paatos.paatostyyppi.kelpoisuus.paatos.${key}`,
                )}
                checked={lisavaatimukset.erotAineenopettajanKoulutuksessa![key]}
                onChange={(e) => {
                  updateKelpoisuudenLisavaatimukset({
                    ...lisavaatimukset,
                    erotAineenopettajanKoulutuksessa: {
                      ...lisavaatimukset.erotAineenopettajanKoulutuksessa,
                      [key]: e.target.checked,
                    },
                  });
                }}
              />
            ))}
          </Stack>
          {lisavaatimukset?.erotAineenopettajanKoulutuksessa?.muu && (
            <OphInputFormField
              label={t('hakemus.paatos.paatostyyppi.kelpoisuus.paatos.muuEro')}
              multiline={true}
              minRows={3}
              value={
                lisavaatimukset.erotAineenopettajanKoulutuksessa.muuKuvaus || ''
              }
              onChange={(e) =>
                updateKelpoisuudenLisavaatimukset({
                  ...lisavaatimukset,
                  erotAineenopettajanKoulutuksessa: {
                    ...lisavaatimukset.erotAineenopettajanKoulutuksessa,
                    muuKuvaus: e.target.value,
                  },
                })
              }
              data-testid={`erorotKoulutuksessa-aineenopettaja-muuKuvaus`}
            />
          )}
        </Stack>
      )}
      {lisavaatimukset?.korvaavaToimenpide && (
        <KorvaavaToimenpideComponent
          korvaavaToimenpide={lisavaatimukset?.korvaavaToimenpide}
          label={t(
            'hakemus.paatos.paatostyyppi.kelpoisuus.paatos.lahtokohtainenKorvaavaToimenpide',
          )}
          updateKorvaavaToimenpide={(
            korvaavaToimenpide: KorvaavaToimenpide,
          ) => {
            updateKelpoisuudenLisavaatimukset({
              ...lisavaatimukset,
              korvaavaToimenpide: korvaavaToimenpide,
            });
          }}
          t={t}
          theme={theme}
        />
      )}
      {lisavaatimukset?.ammattikokemusJaElinikainenOppiminen && (
        <AmmattikokemusJaElinikainenOppiminenComponent
          data={lisavaatimukset.ammattikokemusJaElinikainenOppiminen}
          updateDataAction={(
            updatedData: AmmattikokemusJaElinikainenOppiminen,
          ) => {
            updateKelpoisuudenLisavaatimukset({
              ...lisavaatimukset,
              ammattikokemusJaElinikainenOppiminen: updatedData,
            });
          }}
          t={t}
          theme={theme}
        />
      )}
    </Stack>
  );
};
