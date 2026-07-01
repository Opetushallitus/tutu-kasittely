import { OphCheckbox } from '@opetushallitus/oph-design-system';
import React, { useEffect, useState } from 'react';
import { isDefined } from 'remeda';

import { TFunction } from '@/src/lib/localization/hooks/useTranslations';
import { Hakemus } from '@/src/lib/types/hakemus';

export type YhteistutkintoProps = {
  hakemus: Hakemus;
  updateHakemus: (update: { yhteistutkinto: boolean }) => void;
  t: TFunction;
};

export const Yhteistutkinto = ({
  hakemus,
  updateHakemus,
  t,
}: YhteistutkintoProps) => {
  const [isYhteistutkinto, setIsYhteistutkinto] = useState<boolean>(false);

  useEffect(() => {
    const yhteistutkinto = hakemus?.yhteistutkinto;
    if (isDefined(yhteistutkinto)) {
      setIsYhteistutkinto(yhteistutkinto);
    }
  }, [hakemus?.yhteistutkinto]);

  const updateYhteistutkinto = (value: boolean) => {
    if (value !== isYhteistutkinto) {
      updateHakemus({ yhteistutkinto: value });
      setIsYhteistutkinto(value);
    }
  };

  return (
    <OphCheckbox
      data-testid="yhteistutkinto-checkbox"
      name="yhteistutkinto"
      label={t('hakemus.tutkinnot.yhteistutkinto')}
      checked={isYhteistutkinto}
      onChange={(e) => updateYhteistutkinto(e.target.checked)}
    ></OphCheckbox>
  );
};
