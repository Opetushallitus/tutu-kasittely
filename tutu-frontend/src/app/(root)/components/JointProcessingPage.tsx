import { useState } from 'react';

import ReceivedMessages from '@/src/app/(root)/components/JointProcessing/ReceivedMessages';
import SentMessages from '@/src/app/(root)/components/JointProcessing/SentMessages';
import { Tabs } from '@/src/app/(root)/components/Tabs';
import { BoxWrapper } from '@/src/components/BoxWrapper';
import { FullSpinner } from '@/src/components/FullSpinner';
import { useYkViestilista } from '@/src/hooks/useYkViestilista';
import { User } from '@/src/lib/types/user';
import { YhteisenKasittelynViesti } from '@/src/lib/types/yhteisenKasittelynViesti';

const countNotResponded = (messages: YhteisenKasittelynViesti[]) =>
  messages.filter((message) => message.vastaus === null).length;

const countNotRead = (messages: YhteisenKasittelynViesti[]) =>
  messages.filter((message) => message.luettu === null).length;

export default function JointProcessingPage({ user }: { user: User | null }) {
  const [tab, setTab] = useState<string>('saapuneet');

  const { isLoading, data, error } = useYkViestilista();

  const handleTabChange = (newTab: string) => () => {
    if (newTab !== tab) {
      setTab(newTab);
    }
  };

  const receivedMessages = data
    ? data.filter((item) => item.vastaanottajaOid === user?.userOid)
    : [];
  const sentMesssages = data
    ? data.filter((item) => item.lahettajaOid === user?.userOid)
    : [];

  if (isLoading) return <FullSpinner />;
  console.log('DATA: ', data, error);

  return (
    <BoxWrapper>
      <Tabs
        tPrefix="yhteinenKasittely"
        buttons={[
          {
            onClick: handleTabChange('saapuneet'),
            tabName: 'saapuneet',
            active: tab === 'saapuneet',
            value: countNotResponded(receivedMessages),
          },
          {
            onClick: handleTabChange('lahetetyt'),
            tabName: 'lahetetyt',
            active: tab === 'lahetetyt',
            value: countNotRead(sentMesssages),
          },
        ]}
      />
      {tab === 'lahetetyt' ? (
        <SentMessages messageList={sentMesssages} user={user} />
      ) : (
        <ReceivedMessages messageList={receivedMessages} user={user} />
      )}
    </BoxWrapper>
  );
}
