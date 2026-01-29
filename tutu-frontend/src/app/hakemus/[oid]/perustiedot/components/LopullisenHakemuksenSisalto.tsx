import { Divider, Stack } from '@mui/material';
import { Theme } from '@mui/material/styles';
import {
  OphInputFormField,
  OphSelectFormField,
} from '@opetushallitus/oph-design-system';
import React, { useEffect, useMemo, useState } from 'react';

import { Sisalto } from '@/src/app/hakemus/[oid]/perustiedot/components/Sisalto';
import { lopullinenPaatosSuoritukset } from '@/src/constants/hakemuspalveluSisalto';
import { useKoodistoOptions } from '@/src/hooks/useKoodistoOptions';
import {
  buildLopullinenPaatosSuoritusItems,
  sisaltoItemMatches,
} from '@/src/lib/hakemuspalveluUtils';
import { TFunction } from '@/src/lib/localization/hooks/useTranslations';
import { useTranslationsOfLanguage } from '@/src/lib/localization/hooks/useTranslationsOfLanguage';
import { Hakemus } from '@/src/lib/types/hakemus';

export type LopullisenHakemuksenSisaltoProps = {
  hakemus: Hakemus;
  updateHakemus: (newData: Partial<Hakemus>) => void;
  t: TFunction;
  theme: Theme;
};

export const LopullisenHakemuksenSisalto = ({
  hakemus,
  updateHakemus,
  t,
  theme,
}: LopullisenHakemuksenSisaltoProps) => {
  const { maatJaValtiotOptions } = useKoodistoOptions();

  const { tAsync } = useTranslationsOfLanguage(hakemus.lomakkeenKieli);

  const [suoritusOtsikko, setSuoritusOtsikko] = useState('');

  useEffect(() => {
    tAsync('hakemus.perustiedot.lopullinenPaatos.suoritusotsikko').then(
      setSuoritusOtsikko,
    );
  }, [tAsync]);

  const suoritusSisallot = useMemo(() => {
    const sisaltoTopLevelItem = hakemus.sisalto.find((item) =>
      sisaltoItemMatches(item, lopullinenPaatosSuoritukset),
    );
    return sisaltoTopLevelItem
      ? buildLopullinenPaatosSuoritusItems(
          sisaltoTopLevelItem,
          hakemus.lomakkeenKieli,
          suoritusOtsikko,
        )
      : [];
  }, [hakemus.sisalto, hakemus.lomakkeenKieli, suoritusOtsikko]);

  return (
    <Stack gap={theme.spacing(2)}>
      <Divider orientation={'horizontal'} />
      <OphInputFormField
        label={t(
          `hakemus.perustiedot.lopullinenPaatos.vastaavaEhdollinenPaatos`,
        )}
        sx={{ width: '50%' }}
        value={hakemus.lopullinenPaatosVastaavaEhdollinenAsiatunnus || ''}
        onChange={(e) =>
          updateHakemus({
            lopullinenPaatosVastaavaEhdollinenAsiatunnus: e.target.value,
          })
        }
        inputProps={{
          'data-testid': `vastaavaEhdollinenPaatos-input`,
        }}
      />
      <OphSelectFormField
        placeholder={t('yleiset.valitse')}
        label={t('hakemus.perustiedot.lopullinenPaatos.suoritusmaa')}
        sx={{ width: '50%' }}
        options={maatJaValtiotOptions}
        value={
          hakemus.lopullinenPaatosVastaavaEhdollinenSuoritusmaaKoodiUri || ''
        }
        onChange={(event) =>
          updateHakemus({
            lopullinenPaatosVastaavaEhdollinenSuoritusmaaKoodiUri:
              event.target.value,
          })
        }
        inputProps={{
          'aria-label': t('hakemus.perustiedot.lopullinenPaatos.suoritusmaa'),
        }}
        data-testid={'suoritusmaa-select'}
      />
      <Divider orientation={'horizontal'} />
      {suoritusSisallot.map((item) => (
        <Stack key={item.key} gap={theme.spacing(2)}>
          <Sisalto
            sisalto={[item]}
            osiot={[]}
            lomakkeenKieli={hakemus.lomakkeenKieli}
            filterEmpty={true}
          />
          <Divider orientation={'horizontal'} />
        </Stack>
      ))}
    </Stack>
  );
};
