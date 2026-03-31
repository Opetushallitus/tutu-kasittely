'use client';

import { useEffect, useState } from 'react';

import { Tabs } from '@/src/app/(root)/components/Tabs';
import ReceivedMessages from '@/src/app/(root)/yhteinenKasittely/ReceivedMessages';
import SentMessages from '@/src/app/(root)/yhteinenKasittely/SentMessages';
import { BoxWrapper } from '@/src/components/BoxWrapper';
import { FullSpinner } from '@/src/components/FullSpinner';
import { useAuthorizedUser } from '@/src/components/providers/AuthorizedUserProvider';
import useToaster from '@/src/hooks/useToaster';
import {
  useYkGetReceivedMessages,
  useYkGetSentMessages,
} from '@/src/hooks/useYkViestilista';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import { YhteisenKasittelynViesti } from '@/src/lib/types/yhteisenKasittelynViesti';
import { handleFetchError } from '@/src/lib/utils';

const countNotResponded = (messages: YhteisenKasittelynViesti[]) =>
  messages.filter((message) => message.status === 'vastaamatta').length;

const countNotRead = (messages: YhteisenKasittelynViesti[]) =>
  messages.filter((message) => message.status === 'uusiVastaus').length;

export default function YkMainPage() {
  const { t } = useTranslations();
  const { addToast } = useToaster();
  const user = useAuthorizedUser();
  const [tab, setTab] = useState<string>('saapuneet');

  const {
    isLoading: receivedLoading,
    data: receivedMessages,
    error: receivedError,
  } = useYkGetReceivedMessages();

  const {
    isLoading: sentLoading,
    data: sentMessages,
    error: sentError,
  } = useYkGetSentMessages();

  useEffect(() => {
    handleFetchError(
      addToast,
      sentError || receivedError,
      'virhe.yhteisenkasittelynListanLataus',
      t,
    );
  }, [receivedError, sentError, addToast, t]);

  const handleTabChange = (newTab: string) => () => {
    if (newTab !== tab) {
      setTab(newTab);
    }
  };

  if (receivedLoading || sentLoading) return <FullSpinner />;

  return (
    <BoxWrapper>
      <Tabs
        tPrefix="yhteinenKasittely"
        buttons={[
          {
            onClick: handleTabChange('saapuneet'),
            tabName: 'saapuneet',
            active: tab === 'saapuneet',
            value: countNotResponded(receivedMessages || []),
          },
          {
            onClick: handleTabChange('lahetetyt'),
            tabName: 'lahetetyt',
            active: tab === 'lahetetyt',
            value: countNotRead(sentMessages || []),
          },
        ]}
      />
      {tab === 'lahetetyt' ? (
        <SentMessages messageList={sentMessages || []} user={user} />
      ) : (
        <ReceivedMessages messageList={receivedMessages || []} user={user} />
      )}
    </BoxWrapper>
  );
}
