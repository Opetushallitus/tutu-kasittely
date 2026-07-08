import { Navigate, useLocation } from 'react-router-dom';

import { HakemusList } from '@/src/app/components/HakemusList';
import HakemusListFilters from '@/src/app/components/HakemusListFilters';
import MainPageLayout from '@/src/app/components/MainPageLayout';
import { useAuthorizedUser } from '@/src/components/providers/AuthorizedUserProvider';
import { BASE_NAME } from '@/src/lib/configuration/configuration';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import { hasTutuRole } from '@/src/lib/utils';

export default function MainPage() {
  const { t } = useTranslations();
  const user = useAuthorizedUser();
  const userRoles = user?.authorities;
  const hasTutuUserRights = hasTutuRole(userRoles);
  const location = useLocation();

  if (!location.search) {
    const localStorageSearchParams = localStorage.getItem('tutu-query-string');
    if (localStorageSearchParams && localStorageSearchParams !== '') {
      return <Navigate to={`?${localStorageSearchParams}`} replace />;
    }
  }

  return (
    <MainPageLayout
      t={t}
      hasTutuUserRights={hasTutuUserRights}
      tabsButtons={[
        { tabName: 'hakemukset', active: true },
        {
          linkPath: `${BASE_NAME}/filemaker`,
          tabName: 'filemakerHakemukset',
          active: false,
        },
      ]}
    >
      <HakemusListFilters />
      <HakemusList user={user} />
    </MainPageLayout>
  );
}
