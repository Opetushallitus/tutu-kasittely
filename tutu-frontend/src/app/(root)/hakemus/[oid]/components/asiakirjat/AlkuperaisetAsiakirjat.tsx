import { useEffect, useState } from 'react';

import {
  OphCheckbox,
  OphInputFormField,
} from '@opetushallitus/oph-design-system';
import {
  useTranslations,
  TFunction,
} from '@/src/lib/localization/hooks/useTranslations';

import { isDefined } from '@/src/lib/utils';
import { Hakemus, HakemusUpdateCallback } from '@/src/lib/types/hakemus';

interface StatelessAlkuperaisetAsiakirjatProps {
  lisatieto: string | null | undefined;
  setLisatieto: (lisatieto: string | null) => void;
  t: TFunction;
}

const StatelessAlkuperaisetAsiakirjat = ({
  lisatieto,
  setLisatieto,
  t,
}: StatelessAlkuperaisetAsiakirjatProps) => {
  const checked = isDefined(lisatieto);

  return (
    <>
      <OphCheckbox
        label={t('hakemus.asiakirjat.alkuperaisetAsiakirjatSaatuNahtavaksi')}
        checked={checked}
        onChange={() => setLisatieto(checked ? null : '')}
      />
      {checked ? (
        <OphInputFormField
          multiline={true}
          label={t(
            'hakemus.asiakirjat.alkuperaisetAsiakirjatSaatuNahtavaksiLisatiedot',
          )}
          value={lisatieto}
          onChange={(event) => setLisatieto(event.target.value)}
        />
      ) : null}
    </>
  );
};

interface AlkuperaisetAsiakirjatProps {
  hakemus: Hakemus;
  updateHakemus: HakemusUpdateCallback;
}

export const AlkuperaisetAsiakirjat = ({
  hakemus,
  updateHakemus,
}: AlkuperaisetAsiakirjatProps) => {
  const { t } = useTranslations();

  const [lisatieto, setLisatieto] = useState<string | null | undefined>(
    hakemus.alkuperaisetAsiakirjatSaatuNahtavaksi
      ? hakemus.alkuperaisetAsiakirjatSaatuNahtavaksiLisatiedot
      : null,
  );

  useEffect(() => {
    const lisatieto = hakemus.alkuperaisetAsiakirjatSaatuNahtavaksi
      ? hakemus.alkuperaisetAsiakirjatSaatuNahtavaksiLisatiedot
      : null;
    setLisatieto(lisatieto);
  }, [
    hakemus.alkuperaisetAsiakirjatSaatuNahtavaksi,
    hakemus.alkuperaisetAsiakirjatSaatuNahtavaksiLisatiedot,
    setLisatieto,
  ]);

  return (
    <StatelessAlkuperaisetAsiakirjat
      lisatieto={lisatieto}
      setLisatieto={(lisatieto: string | null) => {
        setLisatieto(lisatieto);
        updateHakemus({
          alkuperaisetAsiakirjatSaatuNahtavaksi: isDefined(lisatieto),
          alkuperaisetAsiakirjatSaatuNahtavaksiLisatiedot: lisatieto,
        });
      }}
      t={t}
    />
  );
};
