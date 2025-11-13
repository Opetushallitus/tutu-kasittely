import { PageLayout } from '@/src/components/PageLayout';
import { HakemusDetailLayout } from '@/src/components/HakemusDetailLayout';
import { HakemusProvider } from '@/src/context/HakemusContext';
import { ShowPaatosTekstiPreviewProvider } from '@/src/context/ShowPaatosTekstiPreviewContext';

export default async function HakemusLayout(props: {
  children: React.ReactNode;
  header: React.ReactNode;
  params: Promise<{ oid: string }>;
}) {
  const params = await props.params;

  const { children, header } = props;

  return (
    <HakemusProvider hakemusOid={params.oid}>
      <ShowPaatosTekstiPreviewProvider>
        <PageLayout header={header}>
          <HakemusDetailLayout hakemusOid={params.oid}>
            {children}
          </HakemusDetailLayout>
        </PageLayout>
      </ShowPaatosTekstiPreviewProvider>
    </HakemusProvider>
  );
}
