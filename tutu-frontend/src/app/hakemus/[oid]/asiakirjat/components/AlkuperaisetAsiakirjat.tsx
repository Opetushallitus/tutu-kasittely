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
import {
  AsiakirjaTieto,
  AsiakirjaTietoUpdateCallback,
} from '@/src/lib/types/hakemus';

interface StatelessAlkuperaisetAsiakirjatProps {
  lisatieto: string | null | undefined;
  setLisatieto: (lisatieto: string | null, useDebounce: boolean) => void;
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
        onChange={() => setLisatieto(checked ? null : '', false)}
      />
      {checked && (
        <OphInputFormField
          multiline={true}
          label={t(
            'hakemus.asiakirjat.alkuperaisetAsiakirjatSaatuNahtavaksiLisatiedot',
          )}
          value={lisatieto}
          onChange={(event) => setLisatieto(event.target.value, true)}
        />
      )}
    </>
  );
};

interface AlkuperaisetAsiakirjatProps {
  asiakirja: AsiakirjaTieto;
  instantUpdateAsiakirjaTietoAction: AsiakirjaTietoUpdateCallback;
  debouncedUpdateAsiakirjaTietoAction: AsiakirjaTietoUpdateCallback;
}

export const AlkuperaisetAsiakirjat = ({
  asiakirja,
  instantUpdateAsiakirjaTietoAction,
  debouncedUpdateAsiakirjaTietoAction,
}: AlkuperaisetAsiakirjatProps) => {
  const { t } = useTranslations();

  const [lisatieto, setLisatieto] = useState<string | null | undefined>(
    asiakirja.alkuperaisetAsiakirjatSaatuNahtavaksi
      ? asiakirja.alkuperaisetAsiakirjatSaatuNahtavaksiLisatiedot
      : null,
  );

  useEffect(() => {
    const lisatieto = asiakirja.alkuperaisetAsiakirjatSaatuNahtavaksi
      ? asiakirja.alkuperaisetAsiakirjatSaatuNahtavaksiLisatiedot
      : null;
    setLisatieto(lisatieto);
  }, [
    asiakirja.alkuperaisetAsiakirjatSaatuNahtavaksi,
    asiakirja.alkuperaisetAsiakirjatSaatuNahtavaksiLisatiedot,
    setLisatieto,
  ]);

  return (
    <StatelessAlkuperaisetAsiakirjat
      lisatieto={lisatieto}
      setLisatieto={(lisatieto: string | null, useDebounce: boolean) => {
        setLisatieto(lisatieto);
        const toBeAsiakirjatieto: Partial<AsiakirjaTieto> = {
          alkuperaisetAsiakirjatSaatuNahtavaksi: isDefined(lisatieto),
          alkuperaisetAsiakirjatSaatuNahtavaksiLisatiedot: lisatieto,
        };
        if (useDebounce) {
          debouncedUpdateAsiakirjaTietoAction(toBeAsiakirjatieto);
        } else {
          instantUpdateAsiakirjaTietoAction(toBeAsiakirjatieto);
        }
      }}
      t={t}
    />
  );
};
