'use client';

import { ReactNode, useEffect } from 'react';

import { Divider, Stack, useTheme } from '@mui/material';
import {
  TFunction,
  useTranslations,
} from '@/src/lib/localization/hooks/useTranslations';
import { handleFetchError } from '@/src/lib/utils';
import useToaster from '@/src/hooks/useToaster';
import { DEFAULT_BOX_BORDER, styled } from '@/src/lib/theme';
import { usePathname } from 'next/navigation';

import {
  OphTypography,
  OphButton,
  ophColors,
} from '@opetushallitus/oph-design-system';
import { FullSpinner } from '@/src/components/FullSpinner';
import { Muistio } from '@/src/components/Muistio';
import { Hakemus } from '@/src/lib/types/hakemus';

const TAB_BUTTON_HEIGHT = '48px';

const InactiveButton = styled(OphButton)({
  borderRadius: 0,
  fontWeight: 'normal',
  height: TAB_BUTTON_HEIGHT,
  color: 'black',
});

const ActiveButton = styled(OphButton)({
  borderRadius: 0,
  fontWeight: 'bold',
  height: TAB_BUTTON_HEIGHT,
  borderColor: ophColors.blue2,
  borderWidth: 0,
  borderBottomWidth: 2,
  cursor: 'default',
});

const useActiveHakuTabName = () => {
  const pathName = usePathname();
  return pathName.split('/').at(-1);
};

const TabButton = ({
  linkPath,
  tabName,
}: {
  linkPath: string;
  tabName: string;
}) => {
  const { t } = useTranslations();
  const activeTabName = useActiveHakuTabName();

  const StyledButton =
    activeTabName === tabName ? ActiveButton : InactiveButton;
  const useLinkPath = activeTabName === tabName ? undefined : linkPath;

  return (
    <StyledButton href={useLinkPath}>
      {t(`hakemus.perustelu.yleiset.tab.${tabName}`)}
    </StyledButton>
  );
};

const Tabs = () => {
  const { t } = useTranslations();
  return (
    <Stack
      component="nav"
      direction="row"
      sx={{
        justifyContent: 'flex-start',
        width: '100%',
        borderBottom: DEFAULT_BOX_BORDER,
        height: TAB_BUTTON_HEIGHT,
      }}
      aria-label={t('haku-tabs.navigaatio')}
    >
      <TabButton linkPath="../yleiset/perustelut" tabName="perustelut" />
      <TabButton linkPath="../yleiset/lausunto" tabName="lausunto" />
    </Stack>
  );
};

interface PerusteluYleisetLayoutProps {
  showTabs: boolean;
  title: string;
  t: TFunction;
  hakemus: Hakemus | undefined;
  isHakemusLoading: boolean;
  hakemusError: Error | null;
  children: ReactNode;
}

export const PerusteluLayout = ({
  showTabs,
  title,
  t,
  hakemus,
  isHakemusLoading,
  hakemusError,
  children,
}: PerusteluYleisetLayoutProps) => {
  const theme = useTheme();
  const { addToast } = useToaster();

  useEffect(() => {
    handleFetchError(addToast, hakemusError, 'virhe.hakemuksenLataus', t);
  }, [hakemusError, addToast, t]);

  if (hakemusError) {
    return null;
  }

  if (isHakemusLoading || !hakemus) return <FullSpinner></FullSpinner>;

  return (
    <Stack
      gap={theme.spacing(3)}
      sx={{ flexGrow: 1, marginRight: theme.spacing(3) }}
    >
      <OphTypography variant={'h2'} data-testid="perustelu-layout-otsikko">
        {t(title)}
      </OphTypography>

      {showTabs && <Tabs />}

      {children}

      <Divider orientation={'horizontal'} />
      <Muistio
        label={t('hakemus.perustelu.muistio.sisainenOtsake')}
        hakemus={hakemus}
        sisainen={true}
        hakemuksenOsa={'perustelut-yleiset'}
      />
    </Stack>
  );
};
