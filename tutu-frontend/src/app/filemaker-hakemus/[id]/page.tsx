'use client';

import { useParams } from 'next/navigation';
import {
  Box,
  Divider,
  Link,
  LinkProps,
  Stack,
  styled,
  Tab,
  Tabs,
  useTheme,
} from '@mui/material';
import { ophColors, OphTypography } from '@opetushallitus/oph-design-system';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import { useFilemakerHakemus } from '@/src/hooks/useFilemakerHakemus';
import { FullSpinner } from '@/src/components/FullSpinner';
import useToaster from '@/src/hooks/useToaster';
import React, { useEffect, useState } from 'react';
import { handleFetchError } from '@/src/lib/utils';
import FilemakerHeader from './components/FilemakerHeader';
import { BoxWrapper } from '@/src/components/BoxWrapper';
import { DEFAULT_BOX_BORDER, THIN_BOX_BORDER } from '@/src/lib/theme';
import { HeaderWrapper, PageContent } from '@/src/components/PageLayout';
import { PageHeaderRow } from '@/src/components/PageHeaderRow';
import { HomeIcon, HomeStyledChevron } from '@/src/components/HomeLink';

import { getters } from '../../../lib/utils/filemakerDataUtils';

const InnerBoxWrapper = styled(Box)(() => ({
  border: DEFAULT_BOX_BORDER,
  backgroundColor: ophColors.white,
}));

const Content = styled('pre')({
  fontFamily: "'Open Sans','Open Sans Fallback'",
});

const TabLink = (props: LinkProps & { selected?: boolean }) => {
  return (
    <Link
      {...props}
      href="#"
      sx={{
        '&:hover': {
          textDecoration: 'none',
        },
        '&.Mui-selected': {
          color: ophColors.blue2,
        },
      }}
    />
  );
};

type LinkedTabLinkProps = {
  value?: string;
  setTab: (_?: string) => void;
  selected?: boolean;
} & Omit<LinkProps, 'href'>;

const LinkedTab = (props: LinkedTabLinkProps) => {
  const { t } = useTranslations();
  const { value, setTab, selected } = props;
  const sx = {
    textAlign: 'left',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    minHeight: 'unset',
  };
  return (
    <Tab
      value={value}
      onClick={() => setTab(value)}
      selected={selected}
      label={t(`filemakerTabs.${value}`)}
      component={TabLink}
      sx={sx}
    />
  );
};

export default function FilemakerHakemus() {
  const theme = useTheme();
  const { t } = useTranslations();
  const { addToast } = useToaster();
  const params = useParams<{ id: string }>();
  const { isLoading, data: hakemus, error } = useFilemakerHakemus(params.id);

  useEffect(() => {
    handleFetchError(addToast, error, 'virhe.hakemuksenLataus', t);
  }, [error, addToast, t]);

  const [tab, _setTab] = useState<string>('perustelumuistio');

  const setTab = (newTab?: string) => {
    if (newTab !== null) {
      _setTab(newTab!);
    }
  };

  if (error) {
    return <></>;
  }

  if (isLoading || !hakemus) return <FullSpinner></FullSpinner>;

  return (
    <Stack
      sx={{
        width: '100%',
        alignItems: 'stretch',
      }}
      gap={theme.spacing(2)}
    >
      <HeaderWrapper>
        <PageContent>
          <PageHeaderRow>
            <HomeIcon href={`/`} />
            <HomeStyledChevron />
            <OphTypography variant={'h2'} component={'h1'}>
              {t('hakemus.otsikko')}
            </OphTypography>
          </PageHeaderRow>
        </PageContent>
      </HeaderWrapper>
      <PageContent>
        <Stack direction="row" spacing={theme.spacing(3, 3)}>
          <InnerBoxWrapper>
            <Tabs
              value={tab}
              onChange={(_, value) => {
                console.log(value);
                setTab(value);
              }}
              orientation="vertical"
              aria-label={t('hakemusTabs.navigaatio')}
              role="navigation"
              sx={{
                '.MuiTabs-indicator': {
                  left: 0,
                  right: 'auto',
                },
                '& .MuiTab-root:not(:last-child)': {
                  borderBottom: THIN_BOX_BORDER,
                },
              }}
            >
              <LinkedTab
                value={'perustelumuistio'}
                selected={true}
                setTab={setTab}
              />
              <LinkedTab value={'paatos'} selected={false} setTab={setTab} />
            </Tabs>
          </InnerBoxWrapper>
          <Stack
            direction="column"
            spacing={theme.spacing(0, 3)}
            width={'100%'}
          >
            <BoxWrapper sx={{ borderBottom: 0, paddingBottom: 0 }}>
              <FilemakerHeader hakemus={hakemus} />
            </BoxWrapper>
            <BoxWrapper sx={{ borderTop: 0 }}>
              <Divider orientation="horizontal" flexItem />
              <Stack
                direction="row"
                justifyContent="space-between"
                sx={{ paddingTop: 2 }}
              >
                <Stack
                  gap={theme.spacing(2)}
                  sx={{ marginRight: theme.spacing(3) }}
                >
                  <OphTypography variant={'h2'}>
                    {t('hakemus.filemaker.otsikko')}
                  </OphTypography>
                  <Content>
                    {tab === 'perustelumuistio'
                      ? (getters.perustelumuistioteksti(hakemus) ?? '-')
                      : (getters.paatosteksti(hakemus) ?? '-')}
                  </Content>
                </Stack>
              </Stack>
            </BoxWrapper>
          </Stack>
        </Stack>
      </PageContent>
    </Stack>
  );
}
