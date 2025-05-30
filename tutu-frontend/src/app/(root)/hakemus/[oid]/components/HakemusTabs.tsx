'use client';

import { Box, styled, Tab, Tabs } from '@mui/material';
import { ophColors } from '@opetushallitus/oph-design-system';
import { DEFAULT_BOX_BORDER } from '@/src/lib/theme';
import { useTranslations } from '@/src/lib/localization/useTranslations';
import React from 'react';
import Link, { LinkProps } from 'next/link';

type LinkRefProps = LinkProps & React.AnchorHTMLAttributes<HTMLAnchorElement>;

const InnerBoxWrapper = styled(Box)(() => ({
  border: DEFAULT_BOX_BORDER,
  backgroundColor: ophColors.white,
}));

const LinkRef = React.forwardRef<HTMLAnchorElement, LinkRefProps>(
  ({ href, children, ...rest }, ref) => (
    <Link href={href} passHref legacyBehavior>
      <a ref={ref} {...rest}>
        {children}
      </a>
    </Link>
  ),
);

LinkRef.displayName = 'NextLinkTab';

export const HakemusTabs = ({ hakemusOid }: { hakemusOid: string }) => {
  const { t } = useTranslations();

  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <InnerBoxWrapper>
      <Tabs
        value={value}
        onChange={handleChange}
        orientation="vertical"
        aria-label={t('hakemus-tabs.navigaatio')}
        role="navigation"
      >
        <Tab
          label={t('hakemus-tabs.perustiedot')}
          href={`/hakemus/${hakemusOid}/perustiedot`}
          component={LinkRef}
          sx={{ whiteSpace: 'nowrap' }}
        />
        <Tab
          label={t('hakemus-tabs.asiakirjat')}
          href={`/hakemus/${hakemusOid}/asiakirjat`}
          component={LinkRef}
        />
        <Tab
          label={t('hakemus-tabs.tutkinnot')}
          href={`/hakemus/${hakemusOid}/tutkinnot`}
          component={LinkRef}
        />
        <Tab
          label={t('hakemus-tabs.perustelu')}
          href={`/hakemus/${hakemusOid}/perustelu`}
          component={LinkRef}
        />
        <Tab
          label={t('hakemus-tabs.paatostiedot')}
          href={`/hakemus/${hakemusOid}/paatostiedot`}
          component={LinkRef}
        />
        <Tab
          label={t('hakemus-tabs.valitustiedot')}
          href={`/hakemus/${hakemusOid}/valitustiedot`}
          component={LinkRef}
        />
      </Tabs>
    </InnerBoxWrapper>
  );
};
