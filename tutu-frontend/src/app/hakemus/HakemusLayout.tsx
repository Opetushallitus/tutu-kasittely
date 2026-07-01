import React from 'react';
import { useParams } from 'react-router-dom';

import { HakemusDetailLayout } from '@/src/components/HakemusDetailLayout';
import { PageHeaderRow } from '@/src/components/PageHeaderRow';
import { PageLayout } from '@/src/components/PageLayout';
import { SearchResultsRibbon } from '@/src/components/SearchResultsRibbon';
import { HakemusProvider } from '@/src/context/HakemusContext';
import { SearchRibbonProvider } from '@/src/context/SearchRibbonContext';
import { ShowPreviewProvider } from '@/src/context/ShowPreviewContext';
import { ShowTekstipohjaContextProvider } from '@/src/context/TekstipohjaContext';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';

const Header = () => {
  const { t } = useTranslations();

  return <PageHeaderRow header={t('hakemus.otsikko')} showSearchBar={true} />;
};

export default function HakemusLayout() {
  const { oid } = useParams<{ oid: string }>();
  const hakemusOid = oid ?? '';

  return (
    <SearchRibbonProvider originalOid={hakemusOid}>
      <HakemusProvider hakemusOid={hakemusOid}>
        <ShowPreviewProvider>
          <ShowTekstipohjaContextProvider>
            <PageLayout header={<Header />} ribbon={<SearchResultsRibbon />}>
              <HakemusDetailLayout hakemusOid={hakemusOid} />
            </PageLayout>
          </ShowTekstipohjaContextProvider>
        </ShowPreviewProvider>
      </HakemusProvider>
    </SearchRibbonProvider>
  );
}
