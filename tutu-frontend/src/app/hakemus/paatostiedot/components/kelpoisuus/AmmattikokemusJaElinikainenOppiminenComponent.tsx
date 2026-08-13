import { Stack } from '@mui/material';
import { Theme } from '@mui/material/styles';
import {
  OphCheckbox,
  OphInputFormField,
} from '@opetushallitus/oph-design-system';
import React from 'react';

import { KorvaavaToimenpideComponent } from '@/src/app/hakemus/paatostiedot/components/kelpoisuus/KorvaavaToimenpide';
import { ammattikokemusElinikainenOppiminenKorvaavuusOptions } from '@/src/app/hakemus/paatostiedot/constants';
import { OphRadioGroupWithClear } from '@/src/components/OphRadioGroupWithClear';
import { TFunction } from '@/src/lib/localization/hooks/useTranslations';
import {
  AmmattikokemusJaElinikainenOppiminen,
  AmmattikokemusJaElinikainenOppiminenKorvaavuus,
  KorvaavaToimenpide,
} from '@/src/lib/types/paatos';

const osittainenKorvaavuus = (
  data: AmmattikokemusJaElinikainenOppiminen,
): boolean => {
  return (
    data.korvaavuusAmmattikokemus === 'Osittainen' ||
    data.korvaavuusAmmattikokemus === 'Ei' ||
    data.korvaavuusElinikainenOppiminen === 'Osittainen' ||
    data.korvaavuusElinikainenOppiminen === 'Ei'
  );
};

export type AmmattikokemusJaElinikainenOppiminenProps = {
  data: AmmattikokemusJaElinikainenOppiminen;
  updateDataAction: (updatedData: AmmattikokemusJaElinikainenOppiminen) => void;
  kelpoisuuskoeFieldLabelPrefix?: string;
  t: TFunction;
  theme: Theme;
};

export const AmmattikokemusJaElinikainenOppiminenComponent = ({
  data,
  updateDataAction,
  kelpoisuuskoeFieldLabelPrefix,
  t,
  theme,
}: AmmattikokemusJaElinikainenOppiminenProps) => {
  return (
    <>
      <Stack gap={theme.spacing(2)}>
        <OphRadioGroupWithClear
          label={t(
            'perustelumuistio.kelpoisuudenLisavaatimukset.ammattikokemusJaElinikainenOppiminen.korvaavuus.ammattikokemus.title',
          )}
          labelId={
            'kelpoisuus-myonteinenPaatos-ammattikokemus-korvaavuus-radio-group-label'
          }
          data-testid={'ammattikokemus-korvaavuus-radio-group'}
          options={ammattikokemusElinikainenOppiminenKorvaavuusOptions(t)}
          value={data.korvaavuusAmmattikokemus?.toString() || ''}
          onChange={(e) =>
            updateDataAction({
              ...data,
              korvaavuusAmmattikokemus: e.target
                .value as AmmattikokemusJaElinikainenOppiminenKorvaavuus,
            })
          }
          onClear={() =>
            updateDataAction({ ...data, korvaavuusAmmattikokemus: null })
          }
        />

        <OphRadioGroupWithClear
          label={t(
            'perustelumuistio.kelpoisuudenLisavaatimukset.ammattikokemusJaElinikainenOppiminen.korvaavuus.elinikainenOppiminen.title',
          )}
          labelId={
            'kelpoisuus-myonteinenPaatos-elinikainenOppiminen-korvaavuus-radio-group-label'
          }
          data-testid={'elinikainenOppiminen-korvaavuus-radio-group'}
          options={ammattikokemusElinikainenOppiminenKorvaavuusOptions(t)}
          value={data.korvaavuusElinikainenOppiminen?.toString() || ''}
          onChange={(e) =>
            updateDataAction({
              ...data,
              korvaavuusElinikainenOppiminen: e.target
                .value as AmmattikokemusJaElinikainenOppiminenKorvaavuus,
            })
          }
          onClear={() =>
            updateDataAction({ ...data, korvaavuusElinikainenOppiminen: null })
          }
        />
        <Stack gap={2}>
          <OphCheckbox
            data-testid={`ammattikokemusJalinikainenOppiminenYhdessa-checkbox`}
            label={t(
              'perustelumuistio.kelpoisuudenLisavaatimukset.ammattikokemusJaElinikainenOppiminen.korvaavuus.ammattikokemusJaElinikainenOppiminenYhdessa.title',
            )}
            checked={
              data['korvaavuusAmmattikokemusJaElinikainenOppiminenYhdessa']
            }
            onChange={(e) =>
              updateDataAction({
                ...data,
                ['korvaavuusAmmattikokemusJaElinikainenOppiminenYhdessa']:
                  e.target.checked,
              })
            }
          />
        </Stack>

        {osittainenKorvaavuus(data) && (
          <OphInputFormField
            label={t(
              'hakemus.paatos.paatostyyppi.kelpoisuus.paatos.ammattikokemusElinikainenOppiminen.ohje',
            )}
            multiline={true}
            minRows={3}
            value={data.lisatieto || ''}
            onChange={(e) =>
              updateDataAction({
                ...data,
                lisatieto: e.target.value,
              })
            }
            data-testid={`ammattikokemusElinikainenOppiminen-lisatieto-input`}
          />
        )}
      </Stack>

      {osittainenKorvaavuus(data) && (
        <Stack gap={theme.spacing(2)} paddingLeft={theme.spacing(3)}>
          {data.korvaavaToimenpide && (
            <KorvaavaToimenpideComponent
              korvaavaToimenpide={data.korvaavaToimenpide}
              label={t(
                'hakemus.paatos.paatostyyppi.kelpoisuus.paatos.ammattikokemusElinikainenOppiminen.korvaavuus.korvaavaToimenpide',
              )}
              updateKorvaavaToimenpide={(
                korvaavaToimenpide: KorvaavaToimenpide,
              ) =>
                updateDataAction({
                  ...data,
                  korvaavaToimenpide: korvaavaToimenpide,
                })
              }
              t={t}
              theme={theme}
              testIdPrefix={'ammattikokemusElinikainenOppiminen'}
              kelpoisuuskoeFieldLabelPrefix={kelpoisuuskoeFieldLabelPrefix}
              showKelpoisuuskoeJaSopeutumisaika
              showLisatieto
            />
          )}
        </Stack>
      )}
    </>
  );
};
