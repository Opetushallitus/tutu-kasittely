import { Hakemus, HakemusUpdateCallback } from '@/src/lib/types/hakemus';
import { OphCheckbox } from '@opetushallitus/oph-design-system';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import { useEffect, useState } from 'react';

export const SuostumusVahvistamiselle = ({
  hakemus,
  updateHakemus,
}: {
  hakemus: Hakemus;
  updateHakemus: HakemusUpdateCallback;
}) => {
  const { t } = useTranslations();

  const [suostumusVahvistamiselleSaatu, setSuostumusVahvistamiselleSaatu] =
    useState<boolean>(hakemus.suostumusVahvistamiselleSaatu);

  useEffect(() => {
    setSuostumusVahvistamiselleSaatu(hakemus.suostumusVahvistamiselleSaatu);
  }, [hakemus.suostumusVahvistamiselleSaatu]);

  return (
    <OphCheckbox
      data-testid="suostumus-vahvistamiselle-saatu-checkbox"
      label={t('hakemus.asiakirjat.suostumusVahvistamiselleSaatu')}
      checked={suostumusVahvistamiselleSaatu}
      onChange={() => {
        setSuostumusVahvistamiselleSaatu(!suostumusVahvistamiselleSaatu);
        updateHakemus({
          suostumusVahvistamiselleSaatu: !suostumusVahvistamiselleSaatu,
        });
      }}
    />
  );
};
