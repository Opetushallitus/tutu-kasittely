'use client';

import { Stack } from '@mui/material';
import { OphButton, ophColors } from '@opetushallitus/oph-design-system';
import { usePathname } from 'next/navigation';

import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import { DEFAULT_BOX_BORDER, styled } from '@/src/lib/theme';

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

interface TabButtonProps {
  tabName: string;
  tPrefix: string;
  linkPath?: string;
  onClick?: VoidFunction;
  active?: boolean;
}

const TabButton = ({
  linkPath,
  onClick,
  tabName,
  tPrefix,
  active,
  ...rest
}: TabButtonProps) => {
  const { t } = useTranslations();
  const activeTabName = useActiveHakuTabName();

  const isActive = active || activeTabName === tabName;

  const StyledButton = isActive ? ActiveButton : InactiveButton;

  const clickHandlers = {
    href: !!onClick || isActive ? undefined : linkPath,
    onClick: onClick,
  };

  return (
    <StyledButton {...clickHandlers} {...rest}>
      {t(`${tPrefix}.${tabName}`)}
    </StyledButton>
  );
};

interface ButtonParams {
  tabName: string;
  linkPath?: string;
  onClick?: VoidFunction;
  active?: boolean;
}

interface TabsParams {
  buttons: ButtonParams[];
  tPrefix: string;
}

const Tabs = ({ buttons, tPrefix }: TabsParams) => {
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
      aria-label={t(`${tPrefix}.tabs`)}
    >
      {buttons.map((button) => {
        const { tabName } = button;
        return (
          <TabButton
            key={`${tPrefix}.${tabName}`}
            data-testid={`hakemuslista-tab--${tabName}`}
            tPrefix={tPrefix}
            {...button}
          />
        );
      })}
    </Stack>
  );
};

export { Tabs };
