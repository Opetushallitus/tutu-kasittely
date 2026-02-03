'use client';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Box, styled, Tab, Tabs, useTheme } from '@mui/material';
import { ophColors } from '@opetushallitus/oph-design-system';
import Link, { LinkProps } from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useRef, useEffect } from 'react';
import { omit } from 'remeda';

import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import {
  DEFAULT_BOX_BORDER,
  SMALL_FONT,
  THIN_BOX_BORDER,
} from '@/src/lib/theme';
import { HakemusKoskee } from '@/src/lib/types/hakemus';

const InnerBoxWrapper = styled(Box)(() => ({
  border: DEFAULT_BOX_BORDER,
  backgroundColor: ophColors.white,
}));

type TabLinkProps = {
  href?: string;
  value?: string;
  targetPage?: string;
  hakemusOid?: string;
  selected?: boolean;
  isSubTab?: boolean;
  expandable?: boolean;
  expanded?: boolean;
  wrapText?: boolean;
} & Omit<LinkProps, 'href'>;

const SUB_TAB_NAMES = ['perustelu.yleiset', 'perustelu.uoro', 'perustelu.ap'];

const TAB_ROUTES = {
  perustiedot: 'perustiedot',
  asiakirjat: 'asiakirjat',
  tutkinnot: 'tutkinnot',
  paatostiedot: 'paatostiedot',
  valitustiedot: 'valitustiedot',
  'perustelu.yleiset': 'perustelu/yleiset/perustelut',
  'perustelu.uoro': 'perustelu/uoro',
  'perustelu.ap': 'perustelu/ap',
} as const;

const useActiveTabFromPath = () => {
  const pathname = usePathname();

  if (pathname.includes('/perustelu/')) {
    if (pathname.includes('/perustelu/yleiset')) {
      return 'perustelu.yleiset';
    } else if (pathname.includes('/perustelu/uoro')) {
      return 'perustelu.uoro';
    } else if (pathname.includes('/perustelu/ap')) {
      return 'perustelu.ap';
    } else {
      return 'perustelu.yleiset';
    }
  }

  const lastPart = pathname.split('/').at(-1);

  for (const [tabName, route] of Object.entries(TAB_ROUTES)) {
    if (route === lastPart) {
      return tabName;
    }
  }

  return 'perustiedot';
};

const TabLink = (props: TabLinkProps) => {
  const ref = useRef<HTMLAnchorElement>(null);

  const { href = '', ...rest } = props;
  return <Link ref={ref} href={href} {...rest}></Link>;
};

const LinkedTab = (props: TabLinkProps) => {
  const { t } = useTranslations();
  const theme = useTheme();
  const {
    value,
    targetPage,
    hakemusOid,
    wrapText,
    isSubTab,
    expanded,
    expandable,
  } = props;
  const pagePath = (targetPage || value!).replace(/\./g, '/');
  const href = `/hakemus/${hakemusOid}/${pagePath}`;
  const subTabSx = { marginLeft: theme.spacing(3), ...SMALL_FONT };
  const sx = {
    whiteSpace: wrapText ? 'normal' : 'nowrap',
    textAlign: 'left',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    pointerEvents: expanded ? 'none' : 'auto',
    minHeight: 'unset',
    ...(isSubTab ? subTabSx : {}),
  };
  const tabProps = {
    href,
    ...omit(props, [
      'targetPage',
      'hakemusOid',
      'wrapText',
      'isSubTab',
      'expandable',
      'expanded',
      'href',
    ]),
  };
  return (
    <Tab
      value={value}
      {...tabProps}
      {...(expandable && {
        icon: (
          <ExpandMoreIcon
            sx={{
              transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.3s ease',
            }}
          />
        ),
        iconPosition: 'end',
      })}
      label={t(`hakemusTabs.${value}`)}
      component={TabLink}
      sx={sx}
    />
  );
};

export const HakemusTabs = ({
  hakemusOid,
  hakemusKoskee,
}: {
  hakemusOid: string;
  hakemusKoskee: HakemusKoskee;
}) => {
  const { t } = useTranslations();
  const activeTab = useActiveTabFromPath();
  const [selectedTabName, setSelectedTabName] = React.useState(activeTab);

  useEffect(() => {
    setSelectedTabName(activeTab);
  }, [activeTab]);

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    const newTabName =
      newValue === 'perustelu.ylataso' ? 'perustelu.yleiset' : newValue;
    setSelectedTabName(newTabName);
    // When selecting 'Perustelu' -> select first subitem instead
  };

  const showSubTabs = SUB_TAB_NAMES.includes(selectedTabName);
  const isEhdollinen = hakemusKoskee !== HakemusKoskee.LOPULLINEN_PAATOS;

  const tabProps = [
    {
      value: 'perustiedot',
    },
    {
      value: 'asiakirjat',
    },
    isEhdollinen && { value: 'tutkinnot' },
    isEhdollinen && {
      value: 'perustelu.ylataso',
      targetPage: 'perustelu/yleiset/perustelut',
      expandable: true,
      expanded: showSubTabs,
    },
    isEhdollinen &&
      showSubTabs && {
        value: 'perustelu.yleiset',
        targetPage: 'perustelu/yleiset/perustelut',
        isSubTab: true,
      },
    isEhdollinen && showSubTabs && { value: 'perustelu.uoro', isSubTab: true },
    isEhdollinen && showSubTabs && { value: 'perustelu.ap', isSubTab: true },
    { value: 'paatostiedot' },
    { value: 'valitustiedot' },
  ]
    .filter(Boolean)
    .map((prop) => ({ ...prop, hakemusOid: hakemusOid })) as TabLinkProps[];

  return (
    <InnerBoxWrapper>
      <Tabs
        value={selectedTabName}
        onChange={handleChange}
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
        {tabProps.map((prop) => (
          <LinkedTab key={prop.value} {...prop} />
        ))}
      </Tabs>
    </InnerBoxWrapper>
  );
};
