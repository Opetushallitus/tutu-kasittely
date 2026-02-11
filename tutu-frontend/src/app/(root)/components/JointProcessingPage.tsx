import { useState } from 'react';

import ReceivedMessages from '@/src/app/(root)/components/JointProcessing/ReceivedMessages';
import SentMessages from '@/src/app/(root)/components/JointProcessing/SentMessages';
import { Tabs } from '@/src/app/(root)/components/Tabs';
import { BoxWrapper } from '@/src/components/BoxWrapper';
import { User } from '@/src/lib/types/user';
import { YhteisenKasittelynViesti } from '@/src/lib/types/yhteisenKasittelynViesti';

const mockReceived: YhteisenKasittelynViesti[] = [
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
    vastaus: undefined,
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
export default function JointProcessingPage({ user }: { user: User | null }) {
  const [tab, setTab] = useState<string>('saapuneet');

  const handleTabChange = (newTab: string) => () => {
    if (newTab !== tab) {
      setTab(newTab);
    }
  };

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
      {tab === 'lahetetyt' ? (
        <SentMessages messageList={mockReceived} user={user} />
      ) : (
        <ReceivedMessages messageList={mockReceived} user={user} />
      )}
    </BoxWrapper>
  );
}
