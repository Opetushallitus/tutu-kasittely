import { PageLayout } from '@/src/components/PageLayout';
import { HakemusDetailLayout } from '@/src/components/HakemusDetailLayout';
import { HakemusProvider } from '@/src/context/HakemusContext';

export default async function HakemusLayout(props: {
  children: React.ReactNode;
  header: React.ReactNode;
  params: Promise<{ oid: string }>;
}) {
  const params = await props.params;

  const { children, header } = props;

  return (
    <HakemusProvider hakemusOid={params.oid}>
      <PageLayout header={header}>
        <HakemusDetailLayout hakemusOid={params.oid}>
          {children}
        </HakemusDetailLayout>
      </PageLayout>
    </HakemusProvider>
  );
}
