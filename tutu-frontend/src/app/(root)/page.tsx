'use client';

import { HakemusList } from '@/src/app/(root)/components/HakemusList';
import HakemusListFilters from '@/src/app/(root)/components/HakemusListFilters';
import MainPageLayout from '@/src/app/(root)/components/MainPageLayout';
import { useAuthorizedUser } from '@/src/components/providers/AuthorizedUserProvider';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import { hasTutuRole } from '@/src/lib/utils';

const StyledInfoIcon = styled(ErrorIcon)({
  color: ophColors.orange3,
  position: 'absolute',
  left: '93%',
  top: '10%',
});

export default function ListViewPage() {
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
