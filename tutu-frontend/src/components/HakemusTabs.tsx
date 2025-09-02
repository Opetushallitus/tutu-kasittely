'use client';

import { omit } from 'remeda';
import { Box, styled, Tab, Tabs, useTheme } from '@mui/material';
import { ophColors } from '@opetushallitus/oph-design-system';
import {
  DEFAULT_BOX_BORDER,
  SMALL_FONT,
  THIN_BOX_BORDER,
} from '@/src/lib/theme';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import React, { useRef } from 'react';
import Link, { LinkProps } from 'next/link';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

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

export const HakemusTabs = ({ hakemusOid }: { hakemusOid: string }) => {
  const { t } = useTranslations();

  const [selectedTabName, setSelectedTabName] = React.useState('perustiedot');

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setSelectedTabName(
      newValue === 'perustelu.ylataso' ? 'perustelu.yleiset' : newValue,
    ); // When selecting 'Perustelu' -> select first subitem instead
  };

  const showSubTabs = SUB_TAB_NAMES.includes(selectedTabName);

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
        <LinkedTab value="perustiedot" hakemusOid={hakemusOid} />
        <LinkedTab value="asiakirjat" hakemusOid={hakemusOid} />
        <LinkedTab value="tutkinnot" hakemusOid={hakemusOid} />
        <LinkedTab
          value="perustelu.ylataso"
          targetPage="perustelu.yleiset.lausuntotiedot"
          hakemusOid={hakemusOid}
          expandable={true}
          expanded={showSubTabs}
        />
        {showSubTabs && (
          <LinkedTab
            value="perustelu.yleiset"
            hakemusOid={hakemusOid}
            isSubTab={true}
          />
        )}
        {showSubTabs && (
          <LinkedTab
            value="perustelu.uoro"
            hakemusOid={hakemusOid}
            wrapText={true}
            isSubTab={true}
          />
        )}
        {showSubTabs && (
          <LinkedTab
            value="perustelu.ap"
            hakemusOid={hakemusOid}
            isSubTab={true}
          />
        )}
        <LinkedTab value="paatostiedot" hakemusOid={hakemusOid} />
        <LinkedTab value="valitustiedot" hakemusOid={hakemusOid} />
      </Tabs>
    </InnerBoxWrapper>
  );
};
