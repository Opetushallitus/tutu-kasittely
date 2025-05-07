'use client';

import { PageLayout } from '@/components/page-layout';
import { OphTypography } from '@opetushallitus/oph-design-system';
import { ListView } from '@/app/(root)/components/list-view';
import { useTranslations } from '@/lib/localization/useTranslations';
import { useAuthorizedUser } from '@/app/contexts/AuthorizedUserProvider';
import { hasTutuRole } from '@/lib/utils';

export default function ListViewPage() {
  const { t } = useTranslations();
  const user = useAuthorizedUser();
  const userRoles = user?.authorities;
  const hasTutuUserRights = hasTutuRole(userRoles);

  console.log({ user });
  return (
    <PageLayout
      header={
        <OphTypography variant={'h2'} component={'h1'}>
          {t('hakemuslista.otsikko')}
        </OphTypography>
      }
    >
      {hasTutuUserRights ? <ListView></ListView> : null}
    </PageLayout>
  );
}
