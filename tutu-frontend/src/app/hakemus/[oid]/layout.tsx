import { HakemusDetailLayout } from '@/src/components/HakemusDetailLayout';
import { PageLayout } from '@/src/components/PageLayout';
import { SearchResultsRibbon } from '@/src/components/SearchResultsRibbon';
import { HakemusProvider } from '@/src/context/HakemusContext';
import { SearchRibbonProvider } from '@/src/context/SearchRibbonContext';
import { ShowPreviewProvider } from '@/src/context/ShowPreviewContext';

export default async function HakemusLayout(props: {
  children: React.ReactNode;
  header: React.ReactNode;
  params: Promise<{ oid: string }>;
}) {
  const params = await props.params;
  const { children, header } = props;

  return (
    <SearchRibbonProvider originalOid={params.oid}>
      <HakemusProvider hakemusOid={params.oid}>
        <ShowPreviewProvider>
          <PageLayout header={header} ribbon={<SearchResultsRibbon />}>
            <HakemusDetailLayout hakemusOid={params.oid}>
              {children}
            </HakemusDetailLayout>
          </PageLayout>
        </ShowPreviewProvider>
      </HakemusProvider>
    </SearchRibbonProvider>
  );
}
