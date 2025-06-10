import { Box, Stack, styled, useTheme } from '@mui/material';
import { ophColors } from '@opetushallitus/oph-design-system';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import PreviewIcon from '@mui/icons-material/Preview';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';

import { useTranslations } from '@/src/lib/localization/useTranslations';
import { usePathname } from 'next/navigation';
import React from 'react';
import { KasittelyVaihe } from '@/src/app/(root)/hakemus/[oid]/components/sidebar/KasittelyVaihe';
import { CenteredRow } from '@/src/app/(root)/hakemus/[oid]/components/CenteredRow';
import { StyledLink } from '@/src/app/(root)/hakemus/[oid]/components/StyledLink';
import { Paatos } from '@/src/app/(root)/hakemus/[oid]/components/sidebar/Paatos';
import { Taydennyspyynto } from '@/src/app/(root)/hakemus/[oid]/components/sidebar/Taydennyspyynto';

const MailOutlineIconBlue = styled(MailOutlineIcon)({
  color: ophColors.blue2,
  paddingTop: '3px',
});

const PreviewIconBlue = styled(PreviewIcon)({
  color: ophColors.blue2,
  paddingTop: '3px',
});

const CheckCircleIconBlue = styled(CheckCircleOutlineRoundedIcon)({
  color: ophColors.blue2,
  paddingTop: '3px',
});

const SHOW_EXTENDED_KASITTELYVAIHE_PATHS = ['asiakirjat'];
const SHOW_TAYDENNYSPYYNTO_PATHS = ['/asiakirjat', '/tutkinnot'];

const LinkBox = styled(Box)(({ theme }) => ({
  border: `2px solid ${ophColors.blue2}`,
  padding: theme.spacing(1, 1),
}));

const ToimintoLinkki = ({
  href,
  gap,
  icon,
  label,
}: {
  href: string;
  gap: string;
  icon: React.ReactNode;
  label: string;
}) => {
  return (
    <LinkBox>
      <StyledLink href={href}>
        <CenteredRow gap={gap}>
          {icon}
          {label}
        </CenteredRow>
      </StyledLink>
    </LinkBox>
  );
};

const pathContainsOneOf = (options: string[], path: string) => {
  return options.some((opt) => path.includes(opt));
};

const showExtendedKasittelyvaihe = (pathName: string) => {
  return pathContainsOneOf(SHOW_EXTENDED_KASITTELYVAIHE_PATHS, pathName);
};

const showTaydennyspyynto = (pathName: string) => {
  return pathContainsOneOf(SHOW_TAYDENNYSPYYNTO_PATHS, pathName);
};

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
      <Paatos />
      {showTaydennyspyynto(pathName) && <Taydennyspyynto />}
      <ToimintoLinkki
        href="/"
        gap={theme.spacing(1)}
        icon={<MailOutlineIconBlue />}
        label={t('hakemus.sivupalkki.kirjoitaViesti')}
      />
      <ToimintoLinkki
        href="/"
        gap={theme.spacing(1)}
        icon={<PreviewIconBlue />}
        label={t('hakemus.sivupalkki.perustelumuistio')}
      />
      <ToimintoLinkki
        href="/"
        gap={theme.spacing(1)}
        icon={<CheckCircleIconBlue />}
        label={t('hakemus.sivupalkki.kirjoitaPaatos')}
      />
    </Stack>
  );
};
