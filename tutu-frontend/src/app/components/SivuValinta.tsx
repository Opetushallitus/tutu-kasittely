import ErrorIcon from '@mui/icons-material/Error';
import { Stack } from '@mui/material';
import { OphButton, ophColors } from '@opetushallitus/oph-design-system';
import { Link, useLocation } from 'react-router-dom';

import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import { styled } from '@/src/lib/theme';

const TAB_BUTTON_HEIGHT = '48px';

export enum SelectedPage {
  Hakemukset,
  YhteinenKasittely,
}

const InactiveButton = styled(OphButton)({
  borderRadius: 0,
  fontWeight: 'normal',
  height: TAB_BUTTON_HEIGHT,
  color: ophColors.blue2,
  textDecoration: 'none',
  borderColor: 'transparent',
  backgroundColor: 'transparent',
  '&:hover': {
    borderColor: ophColors.blue2,
  },
});

const ActiveButton = styled(OphButton)({
  borderRadius: 0,
  fontWeight: 'normal',
  height: TAB_BUTTON_HEIGHT,
  color: ophColors.white,
  textDecoration: 'none',
  borderColor: ophColors.blue2,
  backgroundColor: ophColors.blue2,
  '&:hover': {
    backgroundColor: ophColors.blue3,
    color: ophColors.white,
  },
});

const InfoBadge = styled(ErrorIcon)({
  position: 'absolute',
  left: '93%',
  top: '5%',
  width: 25,
  height: 25,
  color: `${ophColors.orange3} `,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  // This places a white circle right behind the transparent "!"
  background: 'radial-gradient(circle, #ffffff 40%, transparent 40%)',
});

const useActiveHakuTabName = () => {
  const { pathname } = useLocation();
  return pathname.split('/').at(-1);
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

  return (
    <>
      {isActive ? (
        <ActiveButton {...rest}>
          {t(tabName)}
          {showNotification && <InfoBadge />}
        </ActiveButton>
      ) : (
        <InactiveButton {...{ component: Link, to: linkPath }}>
          {t(tabName)}
          {showNotification && <InfoBadge />}
        </InactiveButton>
      )}
    </>
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
        height: TAB_BUTTON_HEIGHT,
        p: 0,
        m: 0,
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
