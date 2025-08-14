import { useEffect } from 'react';

import { OphCheckbox, OphInput } from '@opetushallitus/oph-design-system';
import {
  useTranslations,
  TFunction,
} from '@/src/lib/localization/hooks/useTranslations';

import { useObservable } from 'react-rx';

import { isDefined } from '@/src/lib/utils';
import {
  useDebounced,
  Observable,
  DebounceSetValue,
} from '@/src/hooks/useDebounced';

interface StatelessAllekirjoitustenTarkistusProps {
  lisatietoObservable: Observable<string | null>;
  setLisatieto: DebounceSetValue<string | null>;
  t: TFunction;
}

const StatelessAllekirjoitustenTarkistus = ({
  lisatietoObservable,
  setLisatieto,
  t,
}: StatelessAllekirjoitustenTarkistusProps) => {
  const lisatieto = useObservable(lisatietoObservable);
  const checked = isDefined(lisatieto);

  return (
    <>
      <OphCheckbox
        label={t('hakemus.asiakirjat.allekirjoituksetTarkistettu')}
        checked={checked}
        onChange={() => setLisatieto(checked ? null : '')}
      />
      {checked ? (
        <OphInput
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
  hakemus: Hakemus | undefined;
  updateHakemus: (patch: Partial<Hakemus>) => void;
}

export const AllekirjoitustenTarkistus = ({
  hakemus,
  updateHakemus,
}: AllekirjoitustenTarkistusProps) => {
  const { t } = useTranslations();

  const [lisatietoObservable, setLisatieto] = useDebounced((val) => {
    updateHakemus({
      ...hakemus,
      allekirjoituksetTarkistettu: isDefined(val),
      allekirjoituksetTarkistettuLisatiedot: val,
    });
  });

  useEffect(() => {
    if (hakemus?.hakemusOid) {
      const lisatieto = hakemus?.allekirjoituksetTarkistettu
        ? hakemus.allekirjoituksetTarkistettuLisatiedot
        : null;
      setLisatieto(lisatieto, { debounce: false });
    }
  }, [
    hakemus?.hakemusOid,
    hakemus?.allekirjoituksetTarkistettu,
    hakemus.allekirjoituksetTarkistettuLisatiedot,
    setLisatieto,
  ]);

  return (
    <StatelessAllekirjoitustenTarkistus
      lisatietoObservable={lisatietoObservable}
      setLisatieto={setLisatieto}
      t={t}
    />
  );
};
