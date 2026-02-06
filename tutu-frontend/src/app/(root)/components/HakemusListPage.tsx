import { useState } from 'react';

import FilemakerFilters from '@/src/app/(root)/components/FilemakerFilters';
import { FilemakerList } from '@/src/app/(root)/components/FilemakerList';
import { HakemusList } from '@/src/app/(root)/components/HakemusList';
import HakemusListFilters from '@/src/app/(root)/components/HakemusListFilters';
import { Tabs } from '@/src/app/(root)/components/Tabs';
import { BoxWrapper } from '@/src/components/BoxWrapper';
import { User } from '@/src/lib/types/user';

export default function HakemusListPage({ user }: { user: User | null }) {
  const [tab, setTab] = useState<string>('hakemukset');

  const handleTabChange = (newTab: string) => () => {
    if (newTab !== tab) {
      setTab(newTab);
    }
  };

  return (
    <BoxWrapper>
      <Tabs
        tPrefix="hakemuslista.tyyppi"
        buttons={[
          {
            onClick: handleTabChange('hakemukset'),
            tabName: 'hakemukset',
            active: tab === 'hakemukset',
          },
          {
            onClick: handleTabChange('filemakerHakemukset'),
            tabName: 'filemakerHakemukset',
            active: tab === 'filemakerHakemukset',
          },
        ]}
      />
      {tab === 'filemakerHakemukset' ? (
        <FilemakerHakemukset />
      ) : (
        <UudetHakemukset user={user} />
      )}
    </BoxWrapper>
  );
}

const UudetHakemukset = ({ user }: { user: User | null }) => (
  <>
    <HakemusListFilters />
    <HakemusList user={user}></HakemusList>
  </>
);

const FilemakerHakemukset = () => (
  <>
    <FilemakerFilters />
    <FilemakerList />
  </>
);
