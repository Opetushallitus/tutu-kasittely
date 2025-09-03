'use client';

import { PageHeaderRow } from '@/src/components/PageHeaderRow';
import { OphTypography } from '@opetushallitus/oph-design-system';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import { HomeIcon } from '@/src/components/HomeLink';
import { HomeStyledChevron } from '@/src/components/HomeLink';

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
