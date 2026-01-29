'use client';

import { Box } from '@mui/material';
import { OphTypography, OphButton } from '@opetushallitus/oph-design-system';
import Link from 'next/link';
import { useState } from 'react';

import { HakemusList } from '@/src/app/(root)/components/HakemusList';
import HakemusListFilters from '@/src/app/(root)/components/HakemusListFilters';
import { Tabs } from '@/src/app/(root)/components/Tabs';
import { BoxWrapper } from '@/src/components/BoxWrapper';
import { PageLayout } from '@/src/components/PageLayout';
import { useAuthorizedUser } from '@/src/components/providers/AuthorizedUserProvider';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import { User } from '@/src/lib/types/user';
import { hasTutuRole } from '@/src/lib/utils';

import FilemakerFilters from './components/FilemakerFilters';
import { FilemakerList } from './components/FilemakerList';

export default function ListViewPage() {
  const { t } = useTranslations();
  const user = useAuthorizedUser();
  const userRoles = user?.authorities;
  const hasTutuUserRights = hasTutuRole(userRoles);

  const [tab, setTab] = useState<string>('hakemukset');

  const handleTabChange = (newTab: string) => () => {
    if (newTab !== tab) {
      setTab(newTab);
    }
  };

  return (
    <PageLayout
      header={
        <OphTypography
          variant={'h2'}
          component={'h1'}
          data-testid="hakemuslista-otsikko"
        >
          {t('hakemuslista.otsikko')}
        </OphTypography>
      }
    >
      {hasTutuUserRights ? (
        <>
          <BoxWrapper sx={{ borderBottom: 'none' }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <OphTypography variant={'h2'}>
                {t('hakemuslista.hakemukset')}
              </OphTypography>
              <Link href="/maajako" style={{ textDecoration: 'none' }}>
                <OphButton variant="text">{t('maajako.otsikko')}</OphButton>
              </Link>
            </Box>
          </BoxWrapper>
          <BoxWrapper>
            <Tabs
              tPrefix="hakemuslista.tyyppi"
              buttons={[
                {
                  onClick: handleTabChange('hakemukset'),
                  tabName: 'hakemukset',
                  active: tab === 'hakemukset',
                },
                {
                  onClick: handleTabChange('filemakerHakemukset'),
                  tabName: 'filemakerHakemukset',
                  active: tab === 'filemakerHakemukset',
                },
              ]}
            />
            {tab === 'filemakerHakemukset' ? (
              <FilemakerHakemukset />
            ) : (
              <UudetHakemukset user={user} />
            )}
          </BoxWrapper>
        </>
      ) : (
        <OphTypography variant={'body1'} component={'p'}>
          {t('virhe.eiTutuOikeuksia')}
        </OphTypography>
      )}
    </PageLayout>
  );
}

const UudetHakemukset = ({ user }: { user: User | null }) => (
  <>
    <HakemusListFilters />
    <HakemusList user={user}></HakemusList>
  </>
);

const FilemakerHakemukset = () => (
  <>
    <FilemakerFilters />
    <FilemakerList />
  </>
);
