import { Stack } from '@mui/material';
import {
  OphCheckbox,
  OphInputFormField,
} from '@opetushallitus/oph-design-system';
import React from 'react';

import { OpintoOptionWithLaajuusInput } from '@/src/app/hakemus/paatostiedot/components/tutkintotaiopinto/oikeustieteenmaisteri/OpintoOptionWithLaajuusInput';
import { newLaajuusValue } from '@/src/app/hakemus/paatostiedot/components/tutkintotaiopinto/tutkintoTaiOpintoUtils';
import { TFunction } from '@/src/lib/localization/hooks/useTranslations';
import { OikeustieteenMaisteriLisavaatimukset } from '@/src/lib/types/paatos';

export const EurooppaOpinnot = ({
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
          'hakemus.paatos.myonteinenPaatos.uo.sovellettuTilanne.eurooppaOpinnotSisallossa',
        )}
        checked={vaatimukset.eurooppaOpintojaSisallossa}
        onChange={(e) => {
          updateAction({
            eurooppaOpintojaSisallossa: e.target.checked,
          });
        }}
        data-testid={
          'sovellettuTilanne-oikeustieteenMaisteri-eurooppaOpinnotSisallossa'
        }
      />
      {vaatimukset.eurooppaOpintojaSisallossa && (
        <OphInputFormField
          sx={{ paddingLeft: 4 }}
          label={t(
            'hakemus.paatos.myonteinenPaatos.uo.sovellettuTilanne.oikeustieteenMaisteri.opinnotLisatieto',
          )}
          multiline={true}
          minRows={4}
          value={vaatimukset.eurooppaOpintojenSisallonLisatieto ?? ''}
          onChange={(e) => {
            updateAction({
              eurooppaOpintojenSisallonLisatieto: e.target.value,
            });
          }}
          data-testid={
            'sovellettuTilanne-oikeustieteenMaisteri-eurooppaOpintojenSisallonLisatieto'
          }
        />
      )}
      <OpintoOptionWithLaajuusInput
        checkboxLabel={
          'hakemus.paatos.myonteinenPaatos.uo.sovellettuTilanne.eurooppaOpinnotKokonaismaarassa'
        }
        laajuusLabel={
          'hakemus.paatos.myonteinenPaatos.uo.sovellettuTilanne.eurooppaOpintojenLaajuus'
        }
        checkboxDataTestId={
          'sovellettuTilanne-oikeustieteenMaisteri-eurooppaOpinnotKokonaismaarassa'
        }
        laajuusDataTestId={
          'sovellettuTilanne-oikeustieteenMaisteri-eurooppaOpintojenLaajuus'
        }
        isChecked={vaatimukset.eurooppaOpintojaKokonaismaarassa}
        laajuus={vaatimukset.eurooppaOpintojenLaajuus}
        updateCb={(checked?: boolean, val?: number | null) => {
          updateAction({
            eurooppaOpintojaKokonaismaarassa:
              checked ?? vaatimukset.eurooppaOpintojaKokonaismaarassa,
            eurooppaOpintojenLaajuus: newLaajuusValue(
              vaatimukset.eurooppaOpintojenLaajuus,
              val,
            ),
          });
        }}
        t={t}
      />
    </Stack>
  );
};
