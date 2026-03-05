import { useState } from 'react';

import ReceivedMessages from '@/src/app/(root)/components/JointProcessing/ReceivedMessages';
import SentMessages from '@/src/app/(root)/components/JointProcessing/SentMessages';
import { Tabs } from '@/src/app/(root)/components/Tabs';
import { BoxWrapper } from '@/src/components/BoxWrapper';
import { User } from '@/src/lib/types/user';
import { YhteisenKasittelynViesti } from '@/src/lib/types/yhteisenKasittelynViesti';

const mockViestit: YhteisenKasittelynViesti[] = [
  {
    hakemusOid: '123192',
    asiatunnus: 'OPH-666-1234',
    lahetysPvm: '2.2.2026',
    lahettajaOid: '123123',
    lahettaja: 'Ossi Orava',
    vastaanottajaOid: '321312',
    vastaanottaja: 'Kalle Kaniini',
    hakijanNimi: 'Hessu Hirvi',
    viesti: 'Lore ipsum',
  },
  {
    hakemusOid: '123193',
    asiatunnus: 'OPH-666-1235',
    lahetysPvm: '2.2.2026',
    lahettajaOid: '123123',
    lahettaja: 'Ossi Orava',
    vastaanottajaOid: '321312',
    vastaanottaja: 'Kalle Kaniini',
    hakijanNimi: 'Hessu Hirvi',
    viesti: 'Lore ipsum',
    luettu: '3.2.2026',
  },
  {
    hakemusOid: '123191',
    asiatunnus: 'OPH-666-1233',
    lahetysPvm: '1.2.2026',
    lahettajaOid: '123123',
    lahettaja: 'Ossi Orava',
    vastaanottajaOid: '321312',
    vastaanottaja: 'Kalle Kaniini',
    hakijanNimi: 'Jaakko Jänö',
    viesti: 'Lore ipsum',
    vastaus: 'dolor sit',
  },
];

const countNotResponded = (messages: YhteisenKasittelynViesti[]) =>
  messages.filter((message) => message.vastaus === undefined).length;

const countNotRead = (messages: YhteisenKasittelynViesti[]) =>
  messages.filter((message) => message.luettu === undefined && message.vastaus)
    .length;

export default function JointProcessingPage({ user }: { user: User | null }) {
  const [tab, setTab] = useState<string>('saapuneet');

  const handleTabChange = (newTab: string) => () => {
    if (newTab !== tab) {
      setTab(newTab);
    }
  };

  const receivedMessages = mockViestit;
  const sentMesssages = mockViestit;

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
