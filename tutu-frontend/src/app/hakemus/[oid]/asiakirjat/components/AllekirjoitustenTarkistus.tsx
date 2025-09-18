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
  setLisatieto: (lisatieto: string | null) => void;
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
        onChange={() => setLisatieto(checked ? null : '')}
      />
      {checked && (
        <OphInputFormField
          multiline={true}
          label={t('hakemus.asiakirjat.allekirjoituksetTarkistettuLisatietoja')}
          value={lisatieto}
          onChange={(event) => setLisatieto(event.target.value)}
        />
      )}
    </>
  );
};

interface AllekirjoitustenTarkistusProps {
  asiakirjaTieto: AsiakirjaTieto;
  updateAsiakirjaTieto: AsiakirjaTietoUpdateCallback;
}

export const AllekirjoitustenTarkistus = ({
  asiakirjaTieto,
  updateAsiakirjaTieto,
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
    setLisatieto,
  ]);

  return (
    <StatelessAllekirjoitustenTarkistus
      lisatieto={lisatieto}
      setLisatieto={(lisatieto: string | null) => {
        setLisatieto(lisatieto);
        updateAsiakirjaTieto({
          allekirjoituksetTarkistettu: isDefined(lisatieto),
          allekirjoituksetTarkistettuLisatiedot: lisatieto,
        });
      }}
      t={t}
    />
  );
};
