import { useEffect } from 'react';

import { OphCheckbox } from '@opetushallitus/oph-design-system';
import {
  useTranslations,
  TFunction,
} from '@/src/lib/localization/hooks/useTranslations';

import { useObservable } from 'react-rx';

import {
  useDebounced,
  DebounceSetValue,
  Observable,
} from '@/src/hooks/useDebounced';

import { Hakemus } from '@/src/lib/types/hakemus';
import { isDefined } from 'remeda';

interface StatelessKaikkiSelvityksetSaatuProps {
  selvityksetSaatuObservable: Observable<boolean>;
  setSelvityksetSaatu: DebounceSetValue<boolean>;
  t: TFunction;
}

const StatelessKaikkiSelvityksetSaatu = ({
  selvityksetSaatuObservable,
  setSelvityksetSaatu,
  t,
}: StatelessKaikkiSelvityksetSaatuProps) => {
  const selvityksetSaatu = useObservable(selvityksetSaatuObservable);

  return (
    <OphCheckbox
      label={t('hakemus.asiakirjat.kaikkiSelvityksetSaatu')}
      checked={selvityksetSaatu || false}
      onChange={() => setSelvityksetSaatu(!selvityksetSaatu)}
    />
  );
};

interface KaikkiSelvityksetSaatuProps {
  hakemus: Hakemus | undefined;
  updateHakemus: (patch: Partial<Hakemus>) => void;
}

export const KaikkiSelvityksetSaatu = ({
  hakemus,
  updateHakemus,
}: KaikkiSelvityksetSaatuProps) => {
  const { t } = useTranslations();

  const [selvityksetSaatuObservable, setSelvityksetSaatu] =
    useDebounced<boolean>((val) => {
      updateHakemus({
        ...hakemus,
        selvityksetSaatu: val,
      });
    });

  useEffect(() => {
    if (hakemus?.hakemusOid) {
      const selvityksetSaatu = hakemus?.selvityksetSaatu;
      if (isDefined(selvityksetSaatu)) {
        setSelvityksetSaatu(selvityksetSaatu, { debounce: false });
      }
    }
  }, [hakemus?.hakemusOid, hakemus?.selvityksetSaatu, setSelvityksetSaatu]);

  return (
    <StatelessKaikkiSelvityksetSaatu
      selvityksetSaatuObservable={selvityksetSaatuObservable}
      setSelvityksetSaatu={setSelvityksetSaatu}
      t={t}
    />
  );
};
