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

interface StatelessAlkuperaisetAsiakirjatProps {
  lisatietoObservable: Observable<string | null>;
  setLisatieto: DebounceSetValue<string | null>;
  t: TFunction;
}

const StatelessAlkuperaisetAsiakirjat = ({
  lisatietoObservable,
  setLisatieto,
  t,
}: StatelessAlkuperaisetAsiakirjatProps) => {
  const lisatieto = useObservable(lisatietoObservable);
  const checked = isDefined(lisatieto);

  return (
    <>
      <OphCheckbox
        label={t('hakemus.asiakirjat.alkuperaisetAsiakirjatSaatuNahtavaksi')}
        checked={checked}
        onChange={() => setLisatieto(checked ? null : '')}
      />
      {checked ? (
        <OphInput
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
  hakemus: Hakemus | undefined;
  updateHakemus: (patch: Partial<Hakemus>) => void;
}

export const AlkuperaisetAsiakirjat = ({
  hakemus,
  updateHakemus,
}: AlkuperaisetAsiakirjatProps) => {
  const { t } = useTranslations();

  const [lisatietoObservable, setLisatieto] = useDebounced((val) => {
    updateHakemus({
      ...hakemus,
      alkuperaisetAsiakirjatSaatuNahtavaksi: isDefined(val),
      alkuperaisetAsiakirjatSaatuNahtavaksiLisatiedot: val,
    });
  });

  useEffect(() => {
    if (hakemus?.hakemusOid) {
      const lisatieto = hakemus?.alkuperaisetAsiakirjatSaatuNahtavaksi
        ? hakemus.alkuperaisetAsiakirjatSaatuNahtavaksiLisatiedot
        : null;
      setLisatieto(lisatieto, { debounce: false });
    }
  }, [
    hakemus?.hakemusOid,
    hakemus?.alkuperaisetAsiakirjatSaatuNahtavaksi,
    hakemus.alkuperaisetAsiakirjatSaatuNahtavaksiLisatiedot,
    setLisatieto,
  ]);

  return (
    <StatelessAlkuperaisetAsiakirjat
      lisatietoObservable={lisatietoObservable}
      setLisatieto={setLisatieto}
      t={t}
    />
  );
};
