import { Navigate, useLocation } from 'react-router-dom';

import FilemakerFilters from '@/src/app/components/FilemakerFilters';
import { FilemakerList } from '@/src/app/components/FilemakerList';
import MainPageLayout from '@/src/app/components/MainPageLayout';
import { useAuthorizedUser } from '@/src/components/providers/AuthorizedUserProvider';
import { BASE_NAME } from '@/src/lib/configuration/configuration';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import { hasTutuRole } from '@/src/lib/utils';

export default function FilemakerListViewPage() {
  const { t } = useTranslations();
  const user = useAuthorizedUser();
  const userRoles = user?.authorities;
  const hasTutuUserRights = hasTutuRole(userRoles);
  const location = useLocation();

  if (!location.search) {
    const localStorageSearchParams = localStorage.getItem(
      'tutu-filemaker-query-string',
    );
    if (localStorageSearchParams && localStorageSearchParams !== '') {
      return <Navigate to={`?${localStorageSearchParams}`} replace />;
    }
  }

  return (
    <MainPageLayout
      t={t}
      hasTutuUserRights={hasTutuUserRights}
      tabsButtons={[
        { linkPath: BASE_NAME, tabName: 'hakemukset', active: false },
        { tabName: 'filemakerHakemukset', active: true },
      ]}
    >
      <FilemakerFilters />
      <FilemakerList />
    </MainPageLayout>
  );
}
