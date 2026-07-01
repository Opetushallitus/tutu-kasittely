import React from 'react';
import { Outlet } from 'react-router-dom';

import { Tabs } from '@/src/app/components/Tabs';
import { BoxWrapper } from '@/src/components/BoxWrapper';
import { PageHeaderRow } from '@/src/components/PageHeaderRow';
import { PageLayout } from '@/src/components/PageLayout';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';

const Header = () => {
  const { t } = useTranslations();

  return <PageHeaderRow header={t('hakemus.otsikko')} />;
};

export default function TekstipohjatLayout() {
  return (
    <PageLayout header={<Header />}>
      <BoxWrapper>
        <Tabs
          buttons={[
            { tabName: 'viestipohjat', linkPath: '/tekstipohjat/viestipohjat' },
            { tabName: 'paatospohjat', linkPath: '/tekstipohjat/paatospohjat' },
          ]}
          tPrefix={'tekstipohjat'}
        />
        <Outlet />
      </BoxWrapper>
    </PageLayout>
  );
}
