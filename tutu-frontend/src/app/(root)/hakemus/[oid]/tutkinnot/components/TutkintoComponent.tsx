import { Hakemus } from '@/src/lib/types/hakemus';
import { TFunction } from '@/src/lib/localization/hooks/useTranslations';
import { Tutkinto } from '@/src/lib/types/hakemus';
import {
  OphInputFormField,
  OphSelectFormField,
  OphTypography,
} from '@opetushallitus/oph-design-system';
import React from 'react';
import { Stack } from '@mui/material';

export type TutkintoProps = {
  tutkinto: Tutkinto;
  updateHakemus: (patch: Partial<Hakemus>) => void;
  t: TFunction;
};
export const TutkintoComponent = ({
  tutkinto,
  // updateHakemus,
  t,
}: TutkintoProps) => {
  console.log(tutkinto.jarjestys);

  return (
    <Stack direction="column" gap={2}>
      <OphTypography variant={'h2'}>
        {t('hakemus.tutkinnot.tutkinto.tutkinto1')}
      </OphTypography>
      {tutkinto.jarjestys === 'MUU' ? (
        'muu'
      ) : (
        <>
          <OphSelectFormField
            label={t('hakemus.tutkinnot.tutkinto.tutkintoTodistusOtsikko')}
            options={[]}
            defaultValue={''}
          />
          <OphInputFormField
            label={t('hakemus.tutkinnot.tutkinto.tutkinnonNimi')}
            // onChange={(event) => null}
            value={tutkinto.nimi}
            minRows={3}
          />
          <OphInputFormField
            label={t(
              'hakemus.tutkinnot.tutkinto.tutkinnonPaaaineTaiErikoisala',
            )}
            // onChange={(event) => null}
            value={'Todo pääaine'}
            minRows={3}
          />
          <OphSelectFormField
            label={t('hakemus.tutkinnot.tutkinto.tutkinnonMaa')}
            sx={{ width: '50%' }}
            options={[]}
            defaultValue={''}
          />
          <Stack direction="row" gap={2}>
            <OphInputFormField
              sx={{ width: '25%' }}
              label={t('hakemus.tutkinnot.tutkinto.opintojenAloitusVuosi')}
              // onChange={(event) => null}
              value={tutkinto.aloitusVuosi}
              minRows={3}
            />
            <OphInputFormField
              sx={{ width: '25%' }}
              label={t('hakemus.tutkinnot.tutkinto.opintojenPaattymisVuosi')}
              // onChange={(event) => null}
              value={tutkinto.paattymisVuosi}
              minRows={3}
            />
          </Stack>
          <OphInputFormField
            sx={{ width: '25%' }}
            label={t('hakemus.tutkinnot.tutkinto.todistuksenPvm')}
            // onChange={(event) => null}
            value={'Todo todistuksen pvm'}
            minRows={3}
          />
          <OphSelectFormField
            label={t('hakemus.tutkinnot.tutkinto.tutkinnonKoulutusala')}
            sx={{ width: '25%' }}
            options={[]}
            defaultValue={''}
          />
        </>
      )}
    </Stack>
  );
};
