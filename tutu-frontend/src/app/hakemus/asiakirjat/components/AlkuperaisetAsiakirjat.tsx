import {
  OphCheckbox,
  OphInputFormField,
} from '@opetushallitus/oph-design-system';
import { useEffect, useState } from 'react';

import {
  useTranslations,
  TFunction,
} from '@/src/lib/localization/hooks/useTranslations';
import {
  AsiakirjaTieto,
  AsiakirjaTietoUpdateCallback,
} from '@/src/lib/types/hakemus';
import { isDefined } from '@/src/lib/utils';

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
      {checked && (
        <OphInputFormField
          multiline={true}
          label={t(
            'hakemus.asiakirjat.alkuperaisetAsiakirjatSaatuNahtavaksiLisatiedot',
          )}
          value={lisatieto}
          onChange={(event) => setLisatieto(event.target.value)}
        />
      )}
    </>
  );
};

interface AlkuperaisetAsiakirjatProps {
  asiakirja: AsiakirjaTieto;
  updateAsiakirjaTieto: AsiakirjaTietoUpdateCallback;
}

export const AlkuperaisetAsiakirjat = ({
  asiakirja,
  updateAsiakirjaTieto,
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
      setLisatieto={(lisatieto: string | null) => {
        setLisatieto(lisatieto);
        const toBeAsiakirjatieto: Partial<AsiakirjaTieto> = {
          alkuperaisetAsiakirjatSaatuNahtavaksi: isDefined(lisatieto),
          alkuperaisetAsiakirjatSaatuNahtavaksiLisatiedot: lisatieto,
        };
        updateAsiakirjaTieto(toBeAsiakirjatieto);
      }}
      t={t}
    />
  );
};
