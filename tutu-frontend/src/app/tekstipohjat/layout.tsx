import React from 'react';
import { Outlet } from 'react-router-dom';

import { Tabs } from '@/src/app/components/Tabs';
import { BoxWrapper } from '@/src/components/BoxWrapper';
import { PageHeaderRow } from '@/src/components/PageHeaderRow';
import { PageLayout } from '@/src/components/PageLayout';
import { BASE_NAME } from '@/src/lib/configuration/configuration';
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
            {
              tabName: 'viestipohjat',
              linkPath: `${BASE_NAME}/tekstipohjat/viestipohjat`,
            },
            {
              tabName: 'paatospohjat',
              linkPath: `${BASE_NAME}/tekstipohjat/paatospohjat`,
            },
          ]}
          tPrefix={'tekstipohjat'}
        />
        <Outlet />
      </BoxWrapper>
    </PageLayout>
  );
}
