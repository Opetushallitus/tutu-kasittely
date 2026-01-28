import { Stack } from '@mui/material';
import { Theme } from '@mui/material/styles';
import {
  OphCheckbox,
  OphInputFormField,
  OphTypography,
} from '@opetushallitus/oph-design-system';
import React from 'react';

import { KorvaavaToimenpideComponent } from '@/src/app/hakemus/[oid]/paatostiedot/components/kelpoisuus/KorvaavaToimenpide';
import {
  ammattikokemusElinikainenOppiminenKorvaavuusOptions,
  ammattikokemusJaElinikainenOppiminenOptions,
} from '@/src/app/hakemus/[oid]/paatostiedot/constants';
import { OphRadioGroupWithClear } from '@/src/components/OphRadioGroupWithClear';
import { TFunction } from '@/src/lib/localization/hooks/useTranslations';
import {
  AmmattikokemusJaElinikainenOppiminen,
  AmmattikokemusJaElinikainenOppiminenKorvaavuus,
  KorvaavaToimenpide,
} from '@/src/lib/types/paatos';

export type AmmattikokemusJaElinikainenOppiminenProps = {
  data: AmmattikokemusJaElinikainenOppiminen;
  updateDataAction: (updatedData: AmmattikokemusJaElinikainenOppiminen) => void;
  t: TFunction;
  theme: Theme;
};

export const AmmattikokemusJaElinikainenOppiminenComponent = ({
  data,
  updateDataAction,
  t,
  theme,
}: AmmattikokemusJaElinikainenOppiminenProps) => {
  return (
    <>
      <Stack gap={theme.spacing(2)}>
        <OphTypography variant="h5">
          {t(
            'hakemus.paatos.paatostyyppi.kelpoisuus.paatos.ammattikokemusElinikainenOppiminen.otsikko',
          )}
        </OphTypography>
        <Stack gap={theme.spacing(1)}>
          {ammattikokemusJaElinikainenOppiminenOptions.map((option) => (
            <OphCheckbox
              key={option}
              data-testid={`ammattikokemusElinikainenOppiminen-${option}`}
              label={t(
                `hakemus.paatos.paatostyyppi.kelpoisuus.paatos.ammattikokemusElinikainenOppiminen.${option}`,
              )}
              checked={data[option]}
              onChange={(e) =>
                updateDataAction({
                  ...data,
                  [option]: e.target.checked,
                })
              }
            />
          ))}
        </Stack>
      </Stack>
      {(data.ammattikokemus || data.elinikainenOppiminen) && (
        <Stack gap={theme.spacing(2)} paddingLeft={theme.spacing(3)}>
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
          <OphRadioGroupWithClear
            label={t(
              'hakemus.paatos.paatostyyppi.kelpoisuus.paatos.ammattikokemusElinikainenOppiminen.korvaavuus.otsikko',
            )}
            labelId={
              'kelpoisuus-myonteinenPaatos-ammattikokemusElinikainenOppiminen-korvaavuus-radio-group-label'
            }
            data-testid={
              'ammattikokemusElinikainenOppiminen-korvaavuus-radio-group'
            }
            options={ammattikokemusElinikainenOppiminenKorvaavuusOptions(t)}
            value={data.korvaavuus?.toString() || ''}
            onChange={(e) =>
              updateDataAction({
                ...data,
                korvaavuus: e.target
                  .value as AmmattikokemusJaElinikainenOppiminenKorvaavuus,
              })
            }
            onClear={() => updateDataAction({ ...data, korvaavuus: null })}
          />
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
            />
          )}
        </Stack>
      )}
    </>
  );
};
