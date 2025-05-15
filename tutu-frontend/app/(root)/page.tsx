'use client';

import { PageLayout } from '@/components/page-layout';
import { OphTypography } from '@opetushallitus/oph-design-system';
import { HakemusList } from '@/app/(root)/components/hakemus-list';
import { useTranslations } from '@/lib/localization/useTranslations';
import { useAuthorizedUser } from '@/app/contexts/AuthorizedUserProvider';
import { hasTutuRole } from '@/lib/utils';
import HakemusListFilters from '@/app/(root)/components/hakemus-list-filters';
import { BoxWrapper } from '@/components/box-wrapper';

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
            <HakemusList></HakemusList>
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
