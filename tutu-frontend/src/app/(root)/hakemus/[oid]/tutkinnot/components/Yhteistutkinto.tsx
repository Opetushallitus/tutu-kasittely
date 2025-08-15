import React, { useEffect, useState } from 'react';
import { Hakemus } from '@/src/lib/types/hakemus';
import { OphCheckbox } from '@opetushallitus/oph-design-system';
import { useDebounce } from '@/src/hooks/useDebounce';
import { isDefined } from 'remeda';
import { TFunction } from '@/src/lib/localization/hooks/useTranslations';

export type YhteistutkintoProps = {
  hakemus: Hakemus;
  updateHakemus: (patch: Partial<Hakemus>) => void;
  t: TFunction;
};

export const Yhteistutkinto = ({
  hakemus,
  updateHakemus,
  t,
}: YhteistutkintoProps) => {
  const [isYhteistutkinto, setIsYhteistutkinto] = useState<boolean>(false);

  const debouncedYhteistutkintoUpdateAction = useDebounce((value: boolean) => {
    updateHakemus({
      ...hakemus,
      yhteistutkinto: value,
    });
  }, 1500);

  useEffect(() => {
    const yhteistutkinto = hakemus?.yhteistutkinto;
    if (isDefined(yhteistutkinto)) {
      setIsYhteistutkinto(yhteistutkinto);
    }
  }, [hakemus?.yhteistutkinto]);

  const updateYhteistutkinto = (value: boolean) => {
    if (value !== isYhteistutkinto) {
      debouncedYhteistutkintoUpdateAction(value);
      setIsYhteistutkinto(value);
    }
  };
  return (
    <OphCheckbox
      name="yhteistutkinto"
      label={t('hakemus.tutkinnot.yhteistutkinto')}
      checked={isYhteistutkinto}
      onChange={(e) => updateYhteistutkinto(e.target.checked)}
    ></OphCheckbox>
  );
};
