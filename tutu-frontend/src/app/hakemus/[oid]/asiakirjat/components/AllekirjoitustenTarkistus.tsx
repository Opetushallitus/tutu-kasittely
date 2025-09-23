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

interface StatelessAllekirjoitustenTarkistusProps {
  lisatieto: string | null | undefined;
  setLisatieto: (lisatieto: string | null, useDebounce: boolean) => void;
  t: TFunction;
}

const StatelessAllekirjoitustenTarkistus = ({
  lisatieto,
  setLisatieto,
  t,
}: StatelessAllekirjoitustenTarkistusProps) => {
  const checked = isDefined(lisatieto);

  return (
    <>
      <OphCheckbox
        label={t('hakemus.asiakirjat.allekirjoituksetTarkistettu')}
        checked={checked}
        onChange={() => setLisatieto(checked ? null : '', false)}
      />
      {checked && (
        <OphInputFormField
          multiline={true}
          label={t('hakemus.asiakirjat.allekirjoituksetTarkistettuLisatietoja')}
          value={lisatieto}
          onChange={(event) => setLisatieto(event.target.value, true)}
        />
      )}
    </>
  );
};

interface AllekirjoitustenTarkistusProps {
  asiakirjaTieto: AsiakirjaTieto;
  instantUpdateAsiakirjaTietoAction: AsiakirjaTietoUpdateCallback;
  debouncedUpdateAsiakirjaTietoAction: AsiakirjaTietoUpdateCallback;
}

export const AllekirjoitustenTarkistus = ({
  asiakirjaTieto,
  instantUpdateAsiakirjaTietoAction,
  debouncedUpdateAsiakirjaTietoAction,
}: AllekirjoitustenTarkistusProps) => {
  const { t } = useTranslations();

  const [lisatieto, setLisatieto] = useState<string | null | undefined>(
    asiakirjaTieto.allekirjoituksetTarkistettu
      ? asiakirjaTieto.allekirjoituksetTarkistettuLisatiedot
      : null,
  );

  useEffect(() => {
    const lisatieto = asiakirjaTieto.allekirjoituksetTarkistettu
      ? asiakirjaTieto.allekirjoituksetTarkistettuLisatiedot
      : null;
    setLisatieto(lisatieto);
  }, [
    asiakirjaTieto.allekirjoituksetTarkistettu,
    asiakirjaTieto.allekirjoituksetTarkistettuLisatiedot,
  ]);

  return (
    <StatelessAllekirjoitustenTarkistus
      lisatieto={lisatieto}
      setLisatieto={(lisatieto: string | null, useDebounce) => {
        setLisatieto(lisatieto);
        const toBeAsiakirjaTieto: Partial<AsiakirjaTieto> = {
          allekirjoituksetTarkistettu: isDefined(lisatieto),
          allekirjoituksetTarkistettuLisatiedot: lisatieto,
        };
        if (useDebounce) {
          debouncedUpdateAsiakirjaTietoAction(toBeAsiakirjaTieto);
        } else {
          instantUpdateAsiakirjaTietoAction(toBeAsiakirjaTieto);
        }
      }}
      t={t}
    />
  );
};
