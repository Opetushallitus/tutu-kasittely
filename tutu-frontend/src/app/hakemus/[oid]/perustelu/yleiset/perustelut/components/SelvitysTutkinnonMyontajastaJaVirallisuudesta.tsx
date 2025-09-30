import { useState } from 'react';
import { OphInputFormField } from '@opetushallitus/oph-design-system';
import { Perustelu } from '@/src/lib/types/perustelu';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';

interface Props {
  perustelu: Perustelu | undefined;
  updatePerustelu: (perustelu: Partial<Perustelu>) => void;
}

export const SelvitysTutkinnonMyontajastaJaVirallisuudesta = ({
  perustelu: maybePerustelu,
  updatePerustelu,
}: Props) => {
  const { t } = useTranslations();

  const [currentValue, setValue] = useState(
    maybePerustelu?.selvitysTutkinnonMyontajastaJaTutkinnonVirallisuudesta ||
      '',
  );

  const updatePerusteluWithValue = (newValue: string) => {
    const newPerustelu = {
      selvitysTutkinnonMyontajastaJaTutkinnonVirallisuudesta: newValue,
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
