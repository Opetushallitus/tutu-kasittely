import { PageLayout } from '@/src/components/PageLayout';

export default function MaajakoLayout(props: {
  children: React.ReactNode;
  header: React.ReactNode;
}) {
  const { children, header } = props;

  return <PageLayout header={header}>{children}</PageLayout>;
}
