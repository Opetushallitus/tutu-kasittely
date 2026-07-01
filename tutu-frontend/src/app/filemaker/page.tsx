'use client';

import FilemakerFilters from '@/src/app/components/FilemakerFilters';
import { FilemakerList } from '@/src/app/components/FilemakerList';
import MainPageLayout from '@/src/app/components/MainPageLayout';
import { useAuthorizedUser } from '@/src/components/providers/AuthorizedUserProvider';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import { hasTutuRole } from '@/src/lib/utils';

export default function FilemakerListViewPage() {
  const { t } = useTranslations();
  const user = useAuthorizedUser();
  const userRoles = user?.authorities;
  const hasTutuUserRights = hasTutuRole(userRoles);

  return (
    <MainPageLayout
      t={t}
      hasTutuUserRights={hasTutuUserRights}
      tabsButtons={[
        { linkPath: '/', tabName: 'hakemukset', active: false },
        { tabName: 'filemakerHakemukset', active: true },
      ]}
    >
      <FilemakerFilters />
      <FilemakerList />
    </MainPageLayout>
  );
}
