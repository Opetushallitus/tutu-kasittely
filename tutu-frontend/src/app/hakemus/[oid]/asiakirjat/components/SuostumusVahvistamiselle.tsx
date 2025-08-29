import {
  AsiakirjaTieto,
  AsiakirjaTietoUpdateCallback,
} from '@/src/lib/types/hakemus';
import { OphCheckbox } from '@opetushallitus/oph-design-system';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import { useEffect, useState } from 'react';

export const SuostumusVahvistamiselle = ({
  asiakirjaTieto,
  updateAsiakirjaTieto,
}: {
  asiakirjaTieto: AsiakirjaTieto;
  updateAsiakirjaTieto: AsiakirjaTietoUpdateCallback;
}) => {
  const { t } = useTranslations();

  const [suostumusVahvistamiselleSaatu, setSuostumusVahvistamiselleSaatu] =
    useState<boolean>(asiakirjaTieto.suostumusVahvistamiselleSaatu);

  useEffect(() => {
    setSuostumusVahvistamiselleSaatu(
      asiakirjaTieto.suostumusVahvistamiselleSaatu,
    );
  }, [asiakirjaTieto.suostumusVahvistamiselleSaatu]);

  return (
    <OphCheckbox
      data-testid="suostumus-vahvistamiselle-saatu-checkbox"
      label={t('hakemus.asiakirjat.suostumusVahvistamiselleSaatu')}
      checked={suostumusVahvistamiselleSaatu}
      onChange={() => {
        setSuostumusVahvistamiselleSaatu(!suostumusVahvistamiselleSaatu);
        updateAsiakirjaTieto({
          suostumusVahvistamiselleSaatu: !suostumusVahvistamiselleSaatu,
        });
      }}
    />
  );
};
