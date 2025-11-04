import { Direktiivitaso } from '@/src/lib/types/paatos';
import { TFunction } from '@/src/lib/localization/hooks/useTranslations';
import { OphSelectFormField } from '@opetushallitus/oph-design-system';
import { direktiivitasoOptions } from '@/src/app/hakemus/[oid]/paatostiedot/constants';
import React from 'react';

export type DirektiivitasoProps = {
  t: TFunction;
  label: string;
  direktiivitaso?: Direktiivitaso;
  updateDirektiivitaso: (updatedDirektiivitaso: Direktiivitaso) => void;
  dataTestId?: string;
};

export const DirektiivitasoComponent = (props: DirektiivitasoProps) => {
  const { t, label, direktiivitaso, updateDirektiivitaso, dataTestId } = props;
  return (
    <OphSelectFormField
      placeholder={t('yleiset.valitse')}
      label={label}
      sx={{ width: '100%' }}
      options={direktiivitasoOptions(t)}
      onChange={(e) => updateDirektiivitaso(e.target.value as Direktiivitaso)}
      value={direktiivitaso || ''}
      data-testid={dataTestId}
    />
  );
};
