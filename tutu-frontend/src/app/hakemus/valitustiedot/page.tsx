'use client';

import { OphTypography } from '@opetushallitus/oph-design-system';

import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';

export default function ValitustietoPage() {
  const { t } = useTranslations();
  return (
    <OphTypography variant={'h2'} data-testid="valitustiedot-otsikko">
      {t('hakemus.valitustiedot.otsikko')}
    </OphTypography>
  );
}
