import { Stack } from '@mui/material';
import { Theme } from '@mui/material/styles';
import { OphCheckbox, OphTypography } from '@opetushallitus/oph-design-system';
import * as dateFns from 'date-fns';
import React from 'react';

import { CalendarComponent } from '@/src/components/calendar-component';
import { Muistio } from '@/src/components/Muistio';
import { TFunction } from '@/src/lib/localization/hooks/useTranslations';
import { Hakemus } from '@/src/lib/types/hakemus';

export type PeruutusProps = {
  hakemus: Hakemus;
  updateHakemus: (newData: Partial<Hakemus>) => void;
  t: TFunction;
  theme: Theme;
};

export const Peruutus = ({
  hakemus,
  updateHakemus,
  t,
  theme,
}: PeruutusProps) => {
  const peruutusPvm = hakemus.peruutusPvm
    ? new Date(hakemus.peruutusPvm)
    : null;
  const updatePeruutusPvm = (date: Date | null) => {
    updateHakemus({
      peruutusPvm: date ? dateFns.format(date, "yyyy-MM-dd'T'HH:mm") : '',
    });
  };

  return (
    <Stack gap={theme.spacing(2)}>
      <OphTypography variant="h3">
        {t('hakemus.perustiedot.peruutus.otsikko')}
      </OphTypography>
      <OphCheckbox
        data-testid="peruutus-checkbox"
        label={t('hakemus.perustiedot.peruutus.peruutettu')}
        checked={hakemus.peruutettu}
        onChange={() => {
          updateHakemus({ peruutettu: !hakemus.peruutettu });
        }}
      />
      <CalendarComponent
        setDate={updatePeruutusPvm}
        selectedValue={peruutusPvm}
        label={t('hakemus.perustiedot.peruutus.paivamaara')}
        dataTestId="peruutus-calendar"
      />
      {hakemus.peruutettu && (
        <Muistio
          label={t('hakemus.perustiedot.peruutus.lisatieto')}
          helperText={t('hakemus.perustiedot.peruutus.lisatietoTarkenne')}
          sisalto={hakemus.peruutusLisatieto}
          testId="peruutus-lisatieto"
          updateMuistio={(value) => {
            updateHakemus({ peruutusLisatieto: value });
          }}
        />
      )}
    </Stack>
  );
};
