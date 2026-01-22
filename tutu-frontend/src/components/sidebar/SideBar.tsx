import { Stack, styled, useTheme } from '@mui/material';
import { ophColors } from '@opetushallitus/oph-design-system';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';

import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import { usePathname } from 'next/navigation';
import React from 'react';
import { KasittelyVaihe } from '@/src/components/sidebar/KasittelyVaihe';
import { Paatos } from '@/src/components/sidebar/Paatos';
import { Taydennyspyynto } from '@/src/components/sidebar/Taydennyspyynto';
import { ToimintoLinkki } from '@/src/components/sidebar/ToimintoLinkki';
import { AvaaPerusteluMuistioButton } from '@/src/components/sidebar/PerusteluMuistio';
import { HakemusKoskee } from '@/src/components/sidebar/HakemusKoskee';

const MailOutlineIconBlue = styled(MailOutlineIcon)({
  color: ophColors.blue2,
  paddingTop: '3px',
});

const CheckCircleIconBlue = styled(CheckCircleOutlineRoundedIcon)({
  color: ophColors.blue2,
  paddingTop: '3px',
});

const SHOW_EXTENDED_KASITTELYVAIHE_PATHS: string[] | [] = [];
const SHOW_TAYDENNYSPYYNTO_PATHS = ['/asiakirjat', '/tutkinnot'];

const pathContainsOneOf = (options: string[], path: string) => {
  return options.some((opt) => path.includes(opt));
};

const showExtendedKasittelyvaihe = (pathName: string) => {
  return pathContainsOneOf(SHOW_EXTENDED_KASITTELYVAIHE_PATHS, pathName);
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
  const pathName = usePathname();

  return (
    <Stack
      data-testid={'hakemus-sidebar'}
      direction="column"
      gap={theme.spacing(1)}
      sx={{ maxWidth: '20%' }}
    >
      <KasittelyVaihe showExtended={showExtendedKasittelyvaihe(pathName)} />
      <SidebarInfoStack direction="column" gap={theme.spacing(2)}>
        <HakemusKoskee />
        <Paatos />
      </SidebarInfoStack>
      {showTaydennyspyynto(pathName) && (
        <SidebarInfoStack direction="column" gap={theme.spacing(2)}>
          <Taydennyspyynto />
        </SidebarInfoStack>
      )}
      <ToimintoLinkki
        href="/"
        gap={theme.spacing(1)}
        icon={<MailOutlineIconBlue />}
        label={t('hakemus.sivupalkki.kirjoitaViesti')}
      />
      <AvaaPerusteluMuistioButton />
      <ToimintoLinkki
        href="/"
        gap={theme.spacing(1)}
        icon={<CheckCircleIconBlue />}
        label={t('hakemus.sivupalkki.kirjoitaPaatos')}
      />
    </Stack>
  );
};
