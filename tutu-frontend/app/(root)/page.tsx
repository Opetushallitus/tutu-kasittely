'use client';

import { PageLayout } from '@/components/PageLayout';
import { OphTypography } from '@opetushallitus/oph-design-system';
import { HakemusList } from '@/app/(root)/components/HakemusList';
import { useTranslations } from '@/lib/localization/useTranslations';
import { hasTutuRole } from '@/lib/utils';
import HakemusListFilters from '@/app/(root)/components/HakemusListFilters';
import { BoxWrapper } from '@/components/BoxWrapper';
import { useAuthorizedUser } from '@/components/providers/AuthorizedUserProvider';

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
          {t('hakemuslista.eiOikeuksia')}
        </OphTypography>
      )}
    </PageLayout>
  );
}
