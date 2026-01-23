import { Stack } from '@mui/material';
import { Theme } from '@mui/material/styles';
import {
  OphCheckbox,
  OphInputFormField,
  OphTypography,
} from '@opetushallitus/oph-design-system';
import React, { useMemo } from 'react';

import { AmmattikokemusJaElinikainenOppiminenComponent } from '@/src/app/hakemus/[oid]/paatostiedot/components/kelpoisuus/AmmattikokemusJaElinikainenOppiminenComponent';
import { KorvaavaToimenpideComponent } from '@/src/app/hakemus/[oid]/paatostiedot/components/kelpoisuus/KorvaavaToimenpide';
import { olennaisiaErojaOptions } from '@/src/app/hakemus/[oid]/paatostiedot/constants';
import {
  emptyErotKoulutuksessa,
  initOrUpdateMyonteinenKelpoisuusPaatos,
  koulutusEroModel,
  yleinenKoulutusEroTranslation,
} from '@/src/app/hakemus/[oid]/paatostiedot/paatostietoUtils';
import { OphRadioGroupWithClear } from '@/src/components/OphRadioGroupWithClear';
import { TFunction } from '@/src/lib/localization/hooks/useTranslations';
import { NamedBoolean } from '@/src/lib/types/common';
import {
  AmmattikokemusJaElinikainenOppiminen,
  KelpoisuudenLisavaatimukset,
  KorvaavaToimenpide,
  MyonteisenPaatoksenLisavaatimusUpdateCallback,
} from '@/src/lib/types/paatos';

export type MyonteinenKelpoisuusPaatosProps = {
  lisavaatimukset?: KelpoisuudenLisavaatimukset | null;
  updateLisavaatimukset: MyonteisenPaatoksenLisavaatimusUpdateCallback;
  kelpoisuusKey?: string;
  t: TFunction;
  theme: Theme;
};

const setKoulutusEroValues = (
  current: NamedBoolean[],
  ero: string,
  val: boolean,
): NamedBoolean[] => {
  return current.map((named) =>
    named.name === ero ? { name: ero, value: val } : named,
  );
};

export const MyonteinenKelpoisuusPaatos: React.FC<
  MyonteinenKelpoisuusPaatosProps
> = ({
  lisavaatimukset,
  updateLisavaatimukset,
  kelpoisuusKey,
  t,
  theme,
}: MyonteinenKelpoisuusPaatosProps) => {
  const updateKelpoisuudenLisavaatimukset = (
    updatedLisavaatimukset: Partial<KelpoisuudenLisavaatimukset>,
  ) => {
    const tobeVaatimukset = initOrUpdateMyonteinenKelpoisuusPaatos(
      { ...lisavaatimukset },
      { ...updatedLisavaatimukset },
      kelpoisuusKey,
    );
    updateLisavaatimukset(tobeVaatimukset);
  };

  const eroModel = useMemo(
    () => koulutusEroModel(kelpoisuusKey),
    [kelpoisuusKey],
  );

  const erotKoulutuksessa = useMemo(() => {
    const erotKoulutuksessa = lisavaatimukset?.olennaisiaEroja
      ? emptyErotKoulutuksessa(kelpoisuusKey)
      : undefined;
    if (erotKoulutuksessa && lisavaatimukset?.erotKoulutuksessa) {
      const currentlySelectedErot =
        lisavaatimukset.erotKoulutuksessa.erot || [];
      const erot = (erotKoulutuksessa.erot || []).map((ero) => ({
        name: ero.name,
        value:
          currentlySelectedErot.find((eroObj) => eroObj.name === ero.name)
            ?.value || false,
      }));
      return { ...erotKoulutuksessa, erot };
    }
    return erotKoulutuksessa;
  }, [
    lisavaatimukset?.olennaisiaEroja,
    lisavaatimukset?.erotKoulutuksessa,
    kelpoisuusKey,
  ]);

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
        onClear={() =>
          updateKelpoisuudenLisavaatimukset({ olennaisiaEroja: null })
        }
      />
      {erotKoulutuksessa && lisavaatimukset?.erotKoulutuksessa && (
        <Stack gap={theme.spacing(2)}>
          <OphTypography variant="h5">
            {eroModel.lyhytNimiKaannosAvain
              ? t(
                  'hakemus.paatos.paatostyyppi.kelpoisuus.paatos.erotKoulutuksessa.otsikkoTiettyKelpoisuus',
                  { kelpoisuus: t(eroModel.lyhytNimiKaannosAvain) },
                )
              : t(
                  'hakemus.paatos.paatostyyppi.kelpoisuus.paatos.erotKoulutuksessa.otsikko',
                )}
          </OphTypography>
          <Stack gap={theme.spacing(1)}>
            {erotKoulutuksessa.erot!.map((ero: NamedBoolean) => (
              <OphCheckbox
                key={ero.name}
                data-testid={`erotKoulutuksessa-${ero.name}`}
                label={
                  yleinenKoulutusEroTranslation(ero.name, t) ||
                  t(
                    `hakemus.paatos.paatostyyppi.kelpoisuus.paatos.erotKoulutuksessa.${eroModel.id}.${ero.name}`,
                  )
                }
                checked={ero.value}
                onChange={(e) => {
                  updateKelpoisuudenLisavaatimukset({
                    ...lisavaatimukset,
                    erotKoulutuksessa: {
                      ...lisavaatimukset.erotKoulutuksessa,
                      erot: setKoulutusEroValues(
                        lisavaatimukset?.erotKoulutuksessa?.erot || [],
                        ero.name,
                        e.target.checked,
                      ),
                    },
                  });
                }}
              />
            ))}
            {eroModel.sisaltaaMuuEro && (
              <OphCheckbox
                key={'muuEro'}
                data-testid={'erotKoulutuksessa-muuEro'}
                label={t(
                  'hakemus.paatos.paatostyyppi.kelpoisuus.paatos.erotKoulutuksessa.muuEro',
                )}
                checked={lisavaatimukset.erotKoulutuksessa.muuEro || false}
                onChange={(e) => {
                  updateKelpoisuudenLisavaatimukset({
                    ...lisavaatimukset,
                    erotKoulutuksessa: {
                      ...lisavaatimukset.erotKoulutuksessa,
                      muuEro: e.target.checked,
                    },
                  });
                }}
              />
            )}
          </Stack>
          {lisavaatimukset?.erotKoulutuksessa?.muuEro && (
            <OphInputFormField
              label={t(
                'hakemus.paatos.paatostyyppi.kelpoisuus.paatos.erotKoulutuksessa.muuEroKuvaus',
              )}
              multiline={true}
              minRows={3}
              value={lisavaatimukset.erotKoulutuksessa.muuEroKuvaus || ''}
              onChange={(e) =>
                updateKelpoisuudenLisavaatimukset({
                  ...lisavaatimukset,
                  erotKoulutuksessa: {
                    ...lisavaatimukset.erotKoulutuksessa,
                    muuEroKuvaus: e.target.value,
                  },
                })
              }
              data-testid={`erotKoulutuksessa-muuEroKuvaus`}
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
          testIdPrefix={'lahtokohtainen'}
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
