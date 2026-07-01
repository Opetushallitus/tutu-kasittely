import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import { Stack, styled, useTheme } from '@mui/material';
import { ophColors } from '@opetushallitus/oph-design-system';
import React from 'react';
import { useLocation } from 'react-router-dom';

import { HakemusKoskee } from '@/src/components/sidebar/HakemusKoskee';
import { Paatos } from '@/src/components/sidebar/Paatos';
import { AvaaPerusteluMuistioButton } from '@/src/components/sidebar/PerusteluMuistio';
import { Taydennyspyynto } from '@/src/components/sidebar/Taydennyspyynto';
import { ToimintoLinkki } from '@/src/components/sidebar/ToimintoLinkki';
import { useHakemus } from '@/src/context/HakemusContext';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';

const MailOutlineIconBlue = styled(MailOutlineIcon)({
  color: ophColors.blue2,
  paddingTop: '3px',
});

const CheckCircleIconBlue = styled(CheckCircleOutlineRoundedIcon)({
  color: ophColors.blue2,
  paddingTop: '3px',
});

const SHOW_TAYDENNYSPYYNTO_PATHS = ['/asiakirjat', '/tutkinnot'];

const pathContainsOneOf = (options: string[], path: string) => {
  return options.some((opt) => path.includes(opt));
};

const showTaydennyspyynto = (pathName: string) => {
  return pathContainsOneOf(SHOW_TAYDENNYSPYYNTO_PATHS, pathName);
};

const SidebarInfoStack = styled(Stack)(({ theme }) => ({
  backgroundColor: ophColors.grey50,
  padding: theme.spacing(1, 1),
}));

export const SideBar = () => {
  const theme = useTheme();
  const { t } = useTranslations();
  const { pathname } = useLocation();
  const {
    hakemusState: { editedData: hakemus },
  } = useHakemus();
  const hakemusOid = hakemus?.hakemusOid;

  return (
    <Stack
      data-testid={'hakemus-sidebar'}
      direction="column"
      gap={theme.spacing(1)}
      sx={{
        width: '250px',
        position: 'sticky',
        top: theme.spacing(2),
        alignSelf: 'flex-start',
        flexShrink: 0,
      }}
    >
      <SidebarInfoStack direction="column" gap={theme.spacing(2)}>
        <HakemusKoskee />
        <Paatos />
      </SidebarInfoStack>
      {showTaydennyspyynto(pathname) && (
        <SidebarInfoStack direction="column" gap={theme.spacing(2)}>
          <Taydennyspyynto />
        </SidebarInfoStack>
      )}
      <ToimintoLinkki
        path={`/hakemus/${hakemusOid}/editori/viesti`}
        gap={theme.spacing(1)}
        icon={<MailOutlineIconBlue />}
        label={t('hakemus.sivupalkki.kirjoitaViesti')}
      />
      <AvaaPerusteluMuistioButton />
      <ToimintoLinkki
        path={`/hakemus/${hakemusOid}/editori/paatos`}
        gap={theme.spacing(1)}
        icon={<CheckCircleIconBlue />}
        label={t('hakemus.sivupalkki.kirjoitaPaatos')}
      />
    </Stack>
  );
};
