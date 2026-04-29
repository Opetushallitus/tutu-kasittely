'use client';

import { PageHeaderRow } from '@/src/components/PageHeaderRow';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';

export default function HeaderPage() {
  const { t } = useTranslations();

  return <PageHeaderRow header={t('hakemus.otsikko')} />;
}
