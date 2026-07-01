import { HakemusList } from '@/src/app/components/HakemusList';
import HakemusListFilters from '@/src/app/components/HakemusListFilters';
import MainPageLayout from '@/src/app/components/MainPageLayout';
import { useAuthorizedUser } from '@/src/components/providers/AuthorizedUserProvider';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import { hasTutuRole } from '@/src/lib/utils';

export default function MainPage() {
  const { t } = useTranslations();
  const user = useAuthorizedUser();
  const userRoles = user?.authorities;
  const hasTutuUserRights = hasTutuRole(userRoles);

  return (
    <MainPageLayout
      t={t}
      hasTutuUserRights={hasTutuUserRights}
      tabsButtons={[
        { tabName: 'hakemukset', active: true },
        {
          linkPath: '/filemaker',
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
