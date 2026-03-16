'use client';

import { Box } from '@mui/material';
import { OphTypography, OphButton } from '@opetushallitus/oph-design-system';
import Link from 'next/link';

import { Tabs } from '@/src/app/(root)/components/Tabs';
import { BoxWrapper } from '@/src/components/BoxWrapper';
import { PageLayout } from '@/src/components/PageLayout';
import { TFunction } from '@/src/lib/localization/hooks/useTranslations';

type TabButton = {
  linkPath?: string;
  tabName: string;
  active: boolean;
};

export default function MainPageLayout({
  t,
  hasTutuUserRights,
  tabsButtons,
  children,
}: {
  t: TFunction;
  hasTutuUserRights?: boolean;
  tabsButtons: TabButton[];
  children: React.ReactNode;
}) {
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
            <Tabs tPrefix="hakemuslista.tyyppi" buttons={tabsButtons} />
            {children}
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
