'use client';

import { PageLayout } from '@/components/page-layout';
import { OphTypography } from '@opetushallitus/oph-design-system';
import { ListView } from '@/app/(root)/components/list-view';
import { useTranslations } from '@/lib/localization/useTranslations';

export default function ListViewPage() {
  const { t } = useTranslations();
  return (
    <PageLayout
      header={
        <OphTypography variant={'h2'} component={'h1'}>
          {t('hakemuslista.otsikko')}
        </OphTypography>
      }
    >
      <ListView></ListView>
    </PageLayout>
  );
}
