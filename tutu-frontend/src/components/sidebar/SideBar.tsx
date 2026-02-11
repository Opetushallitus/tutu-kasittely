import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import { Stack, styled, useTheme } from '@mui/material';
import { ophColors } from '@opetushallitus/oph-design-system';
import { usePathname } from 'next/navigation';
import React from 'react';

import { HakemusKoskee } from '@/src/components/sidebar/HakemusKoskee';
import { KasittelyVaihe } from '@/src/components/sidebar/KasittelyVaihe';
import { Paatos } from '@/src/components/sidebar/Paatos';
import { AvaaPerusteluMuistioButton } from '@/src/components/sidebar/PerusteluMuistio';
import { Taydennyspyynto } from '@/src/components/sidebar/Taydennyspyynto';
import { ToimintoLinkki } from '@/src/components/sidebar/ToimintoLinkki';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';

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

export type SideBarProps = {
  hakemusOid: string;
};

export const SideBar = ({ hakemusOid }: SideBarProps) => {
  const theme = useTheme();
  const { t } = useTranslations();
  const pathName = usePathname();

  return (
    <Stack
      data-testid={'hakemus-sidebar'}
      direction="column"
      gap={theme.spacing(1)}
      sx={{
        maxWidth: '20%',
        position: 'sticky',
        top: theme.spacing(2),
        alignSelf: 'flex-start',
        flexShrink: 0,
      }}
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
        href={`/hakemus/${hakemusOid}/editori/viesti`}
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
