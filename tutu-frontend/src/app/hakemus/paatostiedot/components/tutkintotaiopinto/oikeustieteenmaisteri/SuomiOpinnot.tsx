import { Stack } from '@mui/material';
import {
  OphCheckbox,
  OphInputFormField,
  OphTypography,
} from '@opetushallitus/oph-design-system';
import React from 'react';

import { OpintoOptionWithLaajuusInput } from '@/src/app/hakemus/paatostiedot/components/tutkintotaiopinto/oikeustieteenmaisteri/OpintoOptionWithLaajuusInput';
import { oikeustieteenSuomiOpintojenAihealueOptions } from '@/src/app/hakemus/paatostiedot/constants';
import {
  emptySuomiOpintojenAihealue,
  newLaajuusValue,
} from '@/src/app/hakemus/paatostiedot/paatostietoUtils';
import { TFunction } from '@/src/lib/localization/hooks/useTranslations';
import { OikeustieteenMaisteriLisavaatimukset } from '@/src/lib/types/paatos';

export const SuomiOpinnot = ({
  t,
  vaatimukset,
  updateAction,
}: {
  t: TFunction;
  vaatimukset: OikeustieteenMaisteriLisavaatimukset;
  updateAction: (
    vaatimukset: Partial<OikeustieteenMaisteriLisavaatimukset>,
  ) => void;
}) => {
  return (
    <Stack direction="column" gap={3}>
      <OphCheckbox
        label={t(
          'hakemus.paatos.myonteinenPaatos.uo.sovellettuTilanne.suomiOpinnotSisallossa',
        )}
        checked={vaatimukset.suomiOpintojaSisallossa ?? false}
        onChange={(e) => {
          updateAction({
            suomiOpintojaSisallossa: e.target.checked,
          });
        }}
        data-testid={
          'sovellettuTilanne-oikeustieteenMaisteri-suomiOpinnotSisallossa'
        }
      />
      {vaatimukset.suomiOpintojaSisallossa && (
        <>
          <Stack gap={1} paddingLeft={4}>
            <OphTypography variant="h5">
              {t(
                'hakemus.paatos.myonteinenPaatos.uo.sovellettuTilanne.suomiOpinnot.aihealue',
              )}
            </OphTypography>
            {oikeustieteenSuomiOpintojenAihealueOptions.map((option) => (
              <OphCheckbox
                key={option}
                label={t(
                  `hakemus.paatos.myonteinenPaatos.uo.sovellettuTilanne.suomiOpinnot.aihealue.${option}`,
                )}
                checked={vaatimukset.suomiOpintojenAihealueet?.[option]}
                onChange={(e) => {
                  vaatimukset.suomiOpintojenAihealueet =
                    vaatimukset.suomiOpintojenAihealueet ??
                    emptySuomiOpintojenAihealue();
                  updateAction({
                    suomiOpintojenAihealueet: {
                      ...vaatimukset.suomiOpintojenAihealueet,
                      [option]: e.target.checked,
                    },
                  });
                }}
                data-testid={`sovellettuTilanne-oikeustieteenMaisteri-suomiOpinnot-aihealue-${option}`}
              />
            ))}
          </Stack>
          <OphInputFormField
            sx={{ paddingLeft: 4 }}
            label={t(
              'hakemus.paatos.myonteinenPaatos.uo.sovellettuTilanne.oikeustieteenMaisteri.opinnotLisatieto',
            )}
            multiline={true}
            minRows={4}
            value={vaatimukset.suomiOpintojenSisallonLisatieto ?? ''}
            onChange={(e) => {
              updateAction({
                suomiOpintojenSisallonLisatieto: e.target.value,
              });
            }}
            data-testid={
              'sovellettuTilanne-oikeustieteenMaisteri-suomiOpintojenSisallonLisatieto'
            }
          />
        </>
      )}
      <OpintoOptionWithLaajuusInput
        checkboxLabel={
          'hakemus.paatos.myonteinenPaatos.uo.sovellettuTilanne.suomiOpinnotLaajuudessa'
        }
        laajuusLabel={
          'hakemus.paatos.myonteinenPaatos.uo.sovellettuTilanne.suomiOpintojenLaajuus'
        }
        checkboxDataTestId={
          'sovellettuTilanne-oikeustieteenMaisteri-suomiOpinnotLaajuudessa'
        }
        laajuusDataTestId={
          'sovellettuTilanne-oikeustieteenMaisteri-suomiOpintojenLaajuus'
        }
        isChecked={vaatimukset.suomiOpintojaLaajuudessa}
        laajuus={vaatimukset.suomiOpintojenLaajuus}
        updateCb={(checked?: boolean, val?: number | null) => {
          updateAction({
            suomiOpintojaLaajuudessa:
              checked ?? vaatimukset.suomiOpintojaLaajuudessa,
            suomiOpintojenLaajuus: newLaajuusValue(
              vaatimukset.suomiOpintojenLaajuus,
              val,
            ),
          });
        }}
        t={t}
      />
    </Stack>
  );
};
