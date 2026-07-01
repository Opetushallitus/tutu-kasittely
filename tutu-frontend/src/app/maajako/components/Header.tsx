import React from 'react';

import { PageHeaderRow } from '@/src/components/PageHeaderRow';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';

export default function Header() {
  const { t } = useTranslations();

  return <PageHeaderRow header={t('maajako.otsikko')} />;
}
