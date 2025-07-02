'use client';

import { PageLayout } from '@/src/components/PageLayout';
import { OphTypography } from '@opetushallitus/oph-design-system';
import { HakemusList } from '@/src/app/(root)/components/HakemusList';
import { useTranslations } from '@/src/lib/localization/useTranslations';
import { hasTutuRole } from '@/src/lib/utils';
import HakemusListFilters from '@/src/app/(root)/components/HakemusListFilters';
import { BoxWrapper } from '@/src/components/BoxWrapper';
import { useAuthorizedUser } from '@/src/components/providers/AuthorizedUserProvider';

export default function ListViewPage() {
  const { t } = useTranslations();
  const user = useAuthorizedUser();
  const userRoles = user?.authorities;
  const hasTutuUserRights = hasTutuRole(userRoles);

  return (
    <PageLayout
      header={
        <OphTypography variant={'h2'} component={'h1'}>
          {t('hakemuslista.otsikko')}
        </OphTypography>
      }
    >
      {hasTutuUserRights ? (
        <>
          <BoxWrapper sx={{ borderBottom: 'none' }}>
            <OphTypography variant={'h2'}>
              {t('hakemuslista.hakemukset')}
            </OphTypography>
          </BoxWrapper>
          <BoxWrapper>
            <HakemusListFilters></HakemusListFilters>
            <HakemusList user={user}></HakemusList>
          </BoxWrapper>
        </>
      ) : (
        <OphTypography variant={'body1'} component={'p'}>
          {t('virhe.ei-tutu-oikeuksia')}
        </OphTypography>
      )}
    </PageLayout>
  );
}
