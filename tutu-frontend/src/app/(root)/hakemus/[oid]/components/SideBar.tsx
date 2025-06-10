import { Box, Stack, styled, useTheme } from '@mui/material';
import {
  OphCheckbox,
  ophColors,
  OphInputFormField,
  OphSelectFormField,
  OphTypography,
} from '@opetushallitus/oph-design-system';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import PreviewIcon from '@mui/icons-material/Preview';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

import {
  TFunction,
  useTranslations,
} from '@/src/lib/localization/useTranslations';
import Link from 'next/link';
import { Theme } from '@mui/material/styles';
import { usePathname } from 'next/navigation';
import * as R from 'remeda';
import React from 'react';
import { kasittelyTilat } from '@/src/app/(root)/components/types';

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

const OpenInNewIconBlue = styled(OpenInNewIcon)({
  color: ophColors.blue2,
  paddingTop: '3px',
});

const KasittelyvaiheStack = styled(Stack)(({ theme }) => ({
  backgroundColor: ophColors.green5,
  padding: theme.spacing(1, 1),
}));

const PaatosTaydennyspyyntoStack = styled(Stack)(({ theme }) => ({
  backgroundColor: ophColors.grey100,
  padding: theme.spacing(1, 1),
}));

const SidebarLink = styled(Link)({
  color: ophColors.blue2,
  fontWeight: 600,
  pointerEvents: 'none',
  textDecoration: 'none',
});

type SubcomponentProps = {
  t: TFunction;
  theme: Theme;
};

const DATE_PLACEHOLDER = 'dd.mm.yyyy';
const SHOW_EXTENDED_KASITTELYVAIHE_PATHS = ['asiakirjat'];
const SHOW_TAYDENNYSPYYNTO_PATHS = ['/asiakirjat', '/tutkinnot'];

const Row = ({ gap, children }: { gap: string; children: React.ReactNode }) => {
  return (
    <Stack direction="row" gap={gap} alignItems="center">
      {children}
    </Stack>
  );
};

const KasittelyVaihe = (
  props: SubcomponentProps & { showExtended: boolean },
) => {
  const { t, theme, showExtended } = props;
  return (
    <KasittelyvaiheStack gap={theme.spacing(2)}>
      <Stack direction="column" gap={theme.spacing(1)}>
        <OphTypography variant={'h4'}>
          {t('hakemus.sivupalkki.kasittelyvaihe')}
        </OphTypography>
        {showExtended ? (
          <OphSelectFormField
            options={R.map(kasittelyTilat, (tila) => ({
              label: tila,
              value: tila,
            }))}
            defaultValue={kasittelyTilat[0]}
          ></OphSelectFormField>
        ) : (
          <OphTypography variant={'label'}>Alkukäsittely kesken</OphTypography>
        )}
      </Stack>
      <Stack direction="column" gap={theme.spacing(1)}>
        <OphTypography variant={'h4'}>
          {t('hakemus.sivupalkki.hakemuspalvelunvaihe')}
        </OphTypography>
        <OphTypography variant={'label'}>Käsittelyssä</OphTypography>
      </Stack>
      {showExtended && (
        <SidebarLink href="/">
          <Row gap={theme.spacing(1)}>
            {t('hakemus.sivupalkki.muokkaa')}
            <OpenInNewIconBlue />
          </Row>
        </SidebarLink>
      )}
    </KasittelyvaiheStack>
  );
};
const AikaisempiPaatos = ({
  t,
  asiatunnus,
  gap,
}: {
  t: TFunction;
  asiatunnus: string;
  gap: string;
}) => {
  return (
    <Stack direction="column" gap={gap}>
      <OphTypography variant={'h4'}>
        {t('hakemus.sivupalkki.paatos.otsikkoAikaisempi')}
      </OphTypography>
      <OphTypography variant={'body1'}>
        {t('hakemus.sivupalkki.paatos.seliteAikaisempi')}
      </OphTypography>
      <SidebarLink href={'/'}>{asiatunnus}</SidebarLink>
    </Stack>
  );
};

const Taydennyspyynto = (props: SubcomponentProps) => {
  const { t, theme } = props;

  return (
    <PaatosTaydennyspyyntoStack direction="column" gap={theme.spacing(2)}>
      <OphTypography variant={'h4'}>
        {t('hakemus.sivupalkki.taydennysPyynto.otsikko')}
      </OphTypography>
      <OphCheckbox
        sx={{
          '& svg': { marginTop: '1px' },
        }}
        label={t('hakemus.sivupalkki.taydennysPyynto.lahetetty')}
      />
      <OphInputFormField
        label={t('hakemus.sivupalkki.taydennysPyynto.maaraaika')}
        placeholder={DATE_PLACEHOLDER}
      ></OphInputFormField>
    </PaatosTaydennyspyyntoStack>
  );
};

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
      <SidebarLink href={href}>
        <Row gap={gap}>
          {icon}
          {label}
        </Row>
      </SidebarLink>
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
      <KasittelyVaihe
        t={t}
        theme={theme}
        showExtended={showExtendedKasittelyvaihe(pathName)}
      />
      <PaatosTaydennyspyyntoStack gap={theme.spacing(2)}>
        <OphTypography variant={'h4'}>
          {t('hakemus.sivupalkki.paatos.otsikko', '', {
            numero: 1,
          })}
        </OphTypography>
        <AikaisempiPaatos
          t={t}
          asiatunnus="OPH-1234-5678"
          gap={theme.spacing(1)}
        ></AikaisempiPaatos>
      </PaatosTaydennyspyyntoStack>
      {showTaydennyspyynto(pathName) && <Taydennyspyynto t={t} theme={theme} />}
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
