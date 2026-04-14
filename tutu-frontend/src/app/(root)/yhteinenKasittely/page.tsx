'use client';

import { Box } from '@mui/material';
import { OphButton, OphTypography } from '@opetushallitus/oph-design-system';
import Link from 'next/link';

import SivuValinta, {
  SelectedPage,
} from '@/src/app/(root)/components/SivuValinta';
import YkMainPage from '@/src/app/(root)/yhteinenKasittely/YkMainPage';
import { BoxWrapper } from '@/src/components/BoxWrapper';
import { PageLayout } from '@/src/components/PageLayout';
import { useAuthorizedUser } from '@/src/components/providers/AuthorizedUserProvider';
import { useOnkoYkViesteja } from '@/src/hooks/useOnkoYkViesteja';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import { hasTutuRole } from '@/src/lib/utils';

export default function YkPage() {
  const { t } = useTranslations();
  const user = useAuthorizedUser();
  const userRoles = user?.authorities;
  const hasTutuUserRights = hasTutuRole(userRoles);
  const { data: hasMessages } = useOnkoYkViesteja();

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
              <SivuValinta
                active={SelectedPage.YhteinenKasittely}
                showNotification={hasMessages}
              />
              <Link href="/maajako" style={{ textDecoration: 'none' }}>
                <OphButton variant="text">{t('maajako.otsikko')}</OphButton>
              </Link>
            </Box>
          </BoxWrapper>
          <YkMainPage />
        </>
      ) : (
        <OphTypography variant={'body1'} component={'p'}>
          {t('virhe.eiTutuOikeuksia')}
        </OphTypography>
      )}
    </PageLayout>
  );
}
