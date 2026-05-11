import React from 'react';

import { Tabs } from '@/src/app/(root)/components/Tabs';
import { BoxWrapper } from '@/src/components/BoxWrapper';
import { PageLayout } from '@/src/components/PageLayout';

export default function TekstipohjatLayout(props: {
  children: React.ReactNode;
  header: React.ReactNode;
}) {
  const { children, header } = props;

  return (
    <PageLayout header={header}>
      <BoxWrapper>
        <Tabs
          buttons={[
            { tabName: 'viestipohjat', linkPath: '/viestipohjat' },
            { tabName: 'paatospohjat' },
          ]}
          tPrefix={'tekstipohjat'}
        />
        {children}
      </BoxWrapper>
    </PageLayout>
  );
}
