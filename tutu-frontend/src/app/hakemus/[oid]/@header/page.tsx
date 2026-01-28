'use client';

import { OphTypography } from '@opetushallitus/oph-design-system';

import { HomeIcon, HomeStyledChevron } from '@/src/components/HomeLink';
import { PageHeaderRow } from '@/src/components/PageHeaderRow';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';

export default function HeaderPage() {
  const { t } = useTranslations();

  return (
    <PageHeaderRow>
      <HomeIcon href={`/`} />
      <HomeStyledChevron />
      <OphTypography variant={'h2'} component={'h1'}>
        {t('hakemus.otsikko')}
      </OphTypography>
    </PageHeaderRow>
  );
}
