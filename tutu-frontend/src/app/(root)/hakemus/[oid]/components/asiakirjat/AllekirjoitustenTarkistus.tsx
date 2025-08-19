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
      {checked ? (
        <OphInputFormField
          multiline={true}
          label={t('hakemus.asiakirjat.allekirjoituksetTarkistettuLisatietoja')}
          value={lisatieto}
          onChange={(event) => setLisatieto(event.target.value)}
        />
      ) : null}
    </>
  );
};

interface AllekirjoitustenTarkistusProps {
  hakemus: Hakemus;
  updateHakemus: HakemusUpdateCallback;
}

export const AllekirjoitustenTarkistus = ({
  hakemus,
  updateHakemus,
}: AllekirjoitustenTarkistusProps) => {
  const { t } = useTranslations();

  const [lisatieto, setLisatieto] = useState<string | null | undefined>(
    hakemus.allekirjoituksetTarkistettu
      ? hakemus.allekirjoituksetTarkistettuLisatiedot
      : null,
  );

  useEffect(() => {
    const lisatieto = hakemus.allekirjoituksetTarkistettu
      ? hakemus.allekirjoituksetTarkistettuLisatiedot
      : null;
    setLisatieto(lisatieto);
  }, [
    hakemus?.allekirjoituksetTarkistettu,
    hakemus.allekirjoituksetTarkistettuLisatiedot,
    setLisatieto,
  ]);

  return (
    <StatelessAllekirjoitustenTarkistus
      lisatieto={lisatieto}
      setLisatieto={(lisatieto: string | null) => {
        setLisatieto(lisatieto);
        updateHakemus({
          allekirjoituksetTarkistettu: isDefined(lisatieto),
          allekirjoituksetTarkistettuLisatiedot: lisatieto,
        });
      }}
      t={t}
    />
  );
};
