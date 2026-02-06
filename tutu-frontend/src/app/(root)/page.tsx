'use client';

import InfoIcon from '@mui/icons-material/Info';
import { Box, styled, ToggleButton, ToggleButtonGroup } from '@mui/material';
import {
  OphTypography,
  OphButton,
  ophColors,
} from '@opetushallitus/oph-design-system';
import Link from 'next/link';
import { useState } from 'react';

import HakemusListPage from '@/src/app/(root)/components/HakemusListPage';
import JointProcessingPage from '@/src/app/(root)/components/JointProcessingPage';
import { BoxWrapper } from '@/src/components/BoxWrapper';
import { PageLayout } from '@/src/components/PageLayout';
import { useAuthorizedUser } from '@/src/components/providers/AuthorizedUserProvider';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import { hasTutuRole } from '@/src/lib/utils';

const StyledInfoIcon = styled(InfoIcon)({
  color: ophColors.red1,
});

export default function ListViewPage() {
  const { t } = useTranslations();
  const user = useAuthorizedUser();
  const userRoles = user?.authorities;
  const hasTutuUserRights = hasTutuRole(userRoles);

  const [page, setPage] = useState<string>('hakemukset');

  const TitleYhteinen = ({ unreadAnswers }: { unreadAnswers?: boolean }) => {
    return (
      <>
        <OphTypography
          variant={'body1'}
          color={page === 'hakemukset' ? 'blue' : 'white'}
        >
          {t('sivuValinta.yhteinenKasittely')}
        </OphTypography>
        {unreadAnswers && <StyledInfoIcon />}
      </>
    );
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
              <ToggleButtonGroup>
                <ToggleButton
                  selected={page === 'hakemukset'}
                  value={'hakemukset'}
                  onClick={() => setPage('hakemukset')}
                >
                  {t('sivuValinta.hakemukset')}
                </ToggleButton>
                <ToggleButton
                  selected={page !== 'hakemukset'}
                  value={'yhteinenKasittely'}
                  onClick={() => setPage('yhteinenKasittely')}
                >
                  <TitleYhteinen unreadAnswers={false} />
                </ToggleButton>
              </ToggleButtonGroup>
              <Link href="/maajako" style={{ textDecoration: 'none' }}>
                <OphButton variant="text">{t('maajako.otsikko')}</OphButton>
              </Link>
            </Box>
            {page === 'hakemukset' ? (
              <HakemusListPage user={user} />
            ) : (
              <JointProcessingPage user={user} />
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
