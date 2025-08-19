import { useEffect, useState } from 'react';

import { OphCheckbox } from '@opetushallitus/oph-design-system';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';

import { Hakemus, HakemusUpdateCallback } from '@/src/lib/types/hakemus';

interface KaikkiSelvityksetSaatuProps {
  hakemus: Hakemus;
  updateHakemus: HakemusUpdateCallback;
}

export const KaikkiSelvityksetSaatu = ({
  hakemus,
  updateHakemus,
}: KaikkiSelvityksetSaatuProps) => {
  const { t } = useTranslations();

  const [selvityksetSaatu, setSelvityksetSaatu] = useState<boolean>(
    hakemus.selvityksetSaatu,
  );

  useEffect(() => {
    setSelvityksetSaatu(hakemus?.selvityksetSaatu || false);
  }, [hakemus.selvityksetSaatu]);

  return (
    <OphCheckbox
      label={t('hakemus.asiakirjat.kaikkiSelvityksetSaatu')}
      checked={selvityksetSaatu || false}
      onChange={() => {
        setSelvityksetSaatu(!selvityksetSaatu);
        updateHakemus({
          selvityksetSaatu: !selvityksetSaatu,
        });
      }}
    />
  );
};
