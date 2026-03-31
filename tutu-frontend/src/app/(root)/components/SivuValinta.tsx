import ErrorIcon from '@mui/icons-material/Error';
import { Box, Button, Stack } from '@mui/material';
import { ophColors } from '@opetushallitus/oph-design-system';
import { usePathname } from 'next/navigation';

import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import { DEFAULT_BOX_BORDER, styled } from '@/src/lib/theme';

const TAB_BUTTON_HEIGHT = '48px';

export enum SelectedPage {
  Hakemukset,
  YhteinenKasittely,
}

const ActiveInfoIcon = styled(ErrorIcon)({
  color: ophColors.orange3,
  position: 'absolute',
  left: '23.1%',
});

const InactiveInfoIcon = styled(ErrorIcon)({
  color: ophColors.orange3,
  position: 'absolute',
  left: '94%',
});

const InactiveButton = styled(Button)({
  borderRadius: 0,
  fontWeight: 'normal',
  height: TAB_BUTTON_HEIGHT,
  color: 'black',
  padding: '10px',
  textDecoration: 'none',
  borderColor: ophColors.blue2,
});

const ActiveButton = styled(Box)({
  borderRadius: 0,
  fontWeight: 'normal',
  height: TAB_BUTTON_HEIGHT,
  color: ophColors.white,
  padding: '10px',
  textDecoration: 'none',
  borderColor: ophColors.blue2,
  backgroundColor: ophColors.blue2,
});

const useActiveHakuTabName = () => {
  const pathName = usePathname();
  return pathName.split('/').at(-1);
};

interface TabButtonProps {
  tabName: string;
  linkPath?: string;
  onClick?: VoidFunction;
  active?: boolean;
  showNotification?: boolean;
}

const TabButton = ({
  linkPath,
  onClick,
  tabName,
  active,
  showNotification,
  ...rest
}: TabButtonProps) => {
  const { t } = useTranslations();
  const activeTabName = useActiveHakuTabName();

  const isActive = active || activeTabName === tabName;

  const StyledButton = isActive ? ActiveButton : InactiveButton;
  const InfoIcon = isActive ? ActiveInfoIcon : InactiveInfoIcon;

  return (
    <StyledButton href={linkPath || ''} {...rest}>
      {t(tabName)}
      {showNotification && <InfoIcon />}
    </StyledButton>
  );
};

export default function SivuValinta({
  active,
  showNotification,
}: {
  active: SelectedPage;
  showNotification?: boolean;
}) {
  return (
    <Stack
      component="nav"
      direction="row"
      sx={{
        justifyContent: 'flex-start',
        borderBottom: DEFAULT_BOX_BORDER,
        height: TAB_BUTTON_HEIGHT,
      }}
    >
      <TabButton
        tabName={'sivuValinta.hakemukset'}
        active={active === SelectedPage.Hakemukset}
        linkPath="/"
      />
      <TabButton
        tabName={'sivuValinta.yhteinenKasittely'}
        active={active === SelectedPage.YhteinenKasittely}
        linkPath="/yhteinenKasittely"
        showNotification={showNotification}
      />
    </Stack>
  );
}
