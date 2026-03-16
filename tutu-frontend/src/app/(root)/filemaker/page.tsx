'use client';

import MainPageLayout from '@/src/app/(root)/components/MainPageLayout';
import { useAuthorizedUser } from '@/src/components/providers/AuthorizedUserProvider';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import { hasTutuRole } from '@/src/lib/utils';

import FilemakerFilters from '../components/FilemakerFilters';
import { FilemakerList } from '../components/FilemakerList';

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
