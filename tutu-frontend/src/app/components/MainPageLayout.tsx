'use client';

import { Box, Stack } from '@mui/material';
import { OphButton, OphTypography } from '@opetushallitus/oph-design-system';
import { Link } from 'react-router-dom';

import SivuValinta, { SelectedPage } from '@/src/app/components/SivuValinta';
import { Tabs } from '@/src/app/components/Tabs';
import { BoxWrapper } from '@/src/components/BoxWrapper';
import { PageLayout } from '@/src/components/PageLayout';
import { useOnkoYkViesteja } from '@/src/hooks/useOnkoYkViesteja';
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
  const { data: hasNewMessages } = useOnkoYkViesteja();
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
          <BoxWrapper sx={{ borderBottom: 'none', p: 0 }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <SivuValinta
                active={SelectedPage.Hakemukset}
                showNotification={hasNewMessages}
              />
              <Stack direction={'row'}>
                <OphButton
                  component={Link}
                  to="/tekstipohjat/viestipohjat"
                  variant="text"
                  sx={{ fontWeight: 400 }}
                >
                  {t('tekstipohjat.muokkausOtsikko')}
                </OphButton>
                <OphButton
                  component={Link}
                  to="/maajako"
                  variant="text"
                  sx={{ fontWeight: 400 }}
                >
                  {t('maajako.otsikko')}
                </OphButton>
              </Stack>
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
