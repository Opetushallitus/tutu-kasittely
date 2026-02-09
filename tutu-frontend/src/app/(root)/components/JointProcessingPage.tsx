import { useState } from 'react';

import { Tabs } from '@/src/app/(root)/components/Tabs';
import { BoxWrapper } from '@/src/components/BoxWrapper';
import { User } from '@/src/lib/types/user';

export default function JointProcessingPage({ user }: { user: User | null }) {
  const [tab, setTab] = useState<string>('saapuneet');

  const handleTabChange = (newTab: string) => () => {
    if (newTab !== tab) {
      setTab(newTab);
    }
  };

  console.log('User: ', user);

  return (
    <BoxWrapper>
      <Tabs
        tPrefix="yhteinenKasittely"
        buttons={[
          {
            onClick: handleTabChange('saapuneet'),
            tabName: 'saapuneet',
            active: tab === 'saapuneet',
            value: 3,
          },
          {
            onClick: handleTabChange('lahetetyt'),
            tabName: 'lahetetyt',
            active: tab === 'lahetetyt',
            value: 2,
          },
        ]}
      />
    </BoxWrapper>
  );
}
