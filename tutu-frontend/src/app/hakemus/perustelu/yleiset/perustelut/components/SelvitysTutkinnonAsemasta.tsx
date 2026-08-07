import { OphInputFormField } from '@opetushallitus/oph-design-system';
import { useState } from 'react';

import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import { Perustelu } from '@/src/lib/types/perustelu';

interface Props {
  perustelu: Perustelu | undefined;
  updatePerustelu: (perustelu: Partial<Perustelu>) => void;
}

export const SelvitysTutkinnonAsemasta = ({
  perustelu: maybePerustelu,
  updatePerustelu,
}: Props) => {
  const { t } = useTranslations();

  const [currentValue, setValue] = useState(
    maybePerustelu?.selvitysTutkinnonAsemastaLahtomaanJarjestelmassa || '',
  );

  const updatePerusteluWithValue = (newValue: string) => {
    const newPerustelu = {
      selvitysTutkinnonAsemastaLahtomaanJarjestelmassa: newValue,
    };
    setValue(newValue);
    updatePerustelu(newPerustelu);
  };

  return (
    <OphInputFormField
      multiline={true}
      data-testid={`yleiset-perustelut__selvitys-tutkinnon-asemqasta`}
      label={t(
        'hakemus.perustelu.yleiset.perustelut.selvitysTutkinnonAsemasta',
      )}
      value={currentValue}
      onChange={(event) => updatePerusteluWithValue(event.target.value)}
      minRows={3}
    />
  );
};
