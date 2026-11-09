import { Divider, Stack, useTheme } from '@mui/material';
import {
  OphTypography,
  OphButton,
  ophColors,
} from '@opetushallitus/oph-design-system';
import { ReactNode, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { FullSpinner } from '@/src/components/FullSpinner';
import { Muistio } from '@/src/components/Muistio';
import { EditableState } from '@/src/hooks/useEditableState';
import useToaster, { TALLENNA_TOAST_DURATION } from '@/src/hooks/useToaster';
import {
  TFunction,
  useTranslations,
} from '@/src/lib/localization/hooks/useTranslations';
import { DEFAULT_BOX_BORDER, styled } from '@/src/lib/theme';
import { Hakemus } from '@/src/lib/types/hakemus';
import { Perustelu } from '@/src/lib/types/perustelu';
import { handleFetchError } from '@/src/lib/utils';

const TAB_BUTTON_HEIGHT = '48px';

const InactiveButton = styled(OphButton)({
  borderRadius: 0,
  fontWeight: 'normal',
  height: TAB_BUTTON_HEIGHT,
  color: 'black',
}) as typeof OphButton;

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
  const { pathname } = useLocation();
  return pathname.split('/').at(-1);
};

const TabButton = ({
  linkPath,
  tabName,
}: {
  linkPath: string;
  tabName: string;
}) => {
  const { t } = useTranslations();
  const { search } = useLocation();
  const activeTabName = useActiveHakuTabName();
  const label = t(`hakemus.perustelu.yleiset.tab.${tabName}`);

  if (activeTabName === tabName) {
    return <ActiveButton>{label}</ActiveButton>;
  }

  return (
    <InactiveButton
      component={Link}
      to={{ pathname: linkPath, search }}
      relative="path"
    >
      {label}
    </InactiveButton>
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
      <TabButton linkPath="../perustelut" tabName="perustelut" />
      <TabButton linkPath="../lausunto" tabName="lausunto" />
    </Stack>
  );
};

interface PerusteluYleisetLayoutProps {
  showTabs: boolean;
  title: string;
  t: TFunction;
  hakemus?: Hakemus;
  perusteluState: EditableState<Perustelu>;
  isLoading: boolean;
  hakemusError: Error | null;
  perusteluError: Error | null;
  updatePerusteluError: Error | null;
  tutkintoUpdateError?: Error | null;
  isHakemusUpdateSuccess?: boolean;
  isPerusteluUpdateSuccess?: boolean;
  isTutkinnotUpdateSuccess?: boolean;
  children: ReactNode;
}

export const PerusteluLayout = ({
  showTabs,
  title,
  t,
  hakemus,
  perusteluState,
  isLoading,
  hakemusError,
  perusteluError,
  updatePerusteluError,
  tutkintoUpdateError,
  isHakemusUpdateSuccess,
  isPerusteluUpdateSuccess,
  isTutkinnotUpdateSuccess,
  children,
}: PerusteluYleisetLayoutProps) => {
  const theme = useTheme();
  const { addToast } = useToaster();

  useEffect(() => {
    handleFetchError(addToast, hakemusError, 'virhe.hakemuksenLataus', t);
    handleFetchError(addToast, perusteluError, 'virhe.perustelunLataus', t);
    handleFetchError(addToast, updatePerusteluError, 'virhe.tallennus', t);
    handleFetchError(addToast, tutkintoUpdateError, 'virhe.tallennus', t);
  }, [
    hakemusError,
    perusteluError,
    updatePerusteluError,
    tutkintoUpdateError,
    addToast,
    t,
  ]);

  useEffect(() => {
    if (
      isHakemusUpdateSuccess ||
      isPerusteluUpdateSuccess ||
      isTutkinnotUpdateSuccess
    ) {
      addToast({
        key: 'yleiset.tallennusOnnistui',
        type: 'success',
        message: t('yleiset.tallennusOnnistui'),
        timeMs: TALLENNA_TOAST_DURATION,
      });
    }
  }, [
    isHakemusUpdateSuccess,
    isPerusteluUpdateSuccess,
    isTutkinnotUpdateSuccess,
    addToast,
    t,
  ]);

  if (hakemusError) {
    return null;
  }

  if (isLoading || !hakemus || !perusteluState.editedData)
    return <FullSpinner></FullSpinner>;

  return (
    <Stack spacing={3} sx={{ flexGrow: 1, marginRight: theme.spacing(3) }}>
      <OphTypography variant={'h2'} data-testid="perustelu-otsikko">
        {t(title)}
      </OphTypography>

      {showTabs && <Tabs />}

      {children}

      <Divider orientation={'horizontal'} />
      <Muistio
        label={t('hakemus.perustelu.muistio.sisainenOtsake')}
        sisalto={perusteluState.editedData?.tarkempiaSelvityksia}
        updateMuistio={(value) => {
          perusteluState?.updateLocal({ tarkempiaSelvityksia: value });
        }}
      />
    </Stack>
  );
};
