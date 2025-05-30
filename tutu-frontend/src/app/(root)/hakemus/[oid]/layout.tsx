import { PageLayout } from '@/src/components/PageLayout';
import { HakemusDetailLayout } from '@/src/app/(root)/hakemus/[oid]/components/HakemusDetailLayout';

export default async function HakemusLayout(props: {
  children: React.ReactNode;
  header: React.ReactNode;
  params: Promise<{ oid: string }>;
}) {
  const params = await props.params;

  const { children, header } = props;

  return (
    <PageLayout header={header}>
      <HakemusDetailLayout hakemusOid={params.oid}>
        {children}
      </HakemusDetailLayout>
    </PageLayout>
  );
}
