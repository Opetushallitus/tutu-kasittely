import { PerusteluLayout } from '@/src/app/hakemus/[oid]/perustelu/components/PerusteluLayout';

export default function ArPage() {
  return (
    <PerusteluLayout showTabs={false}>
      <span>Tämä on AR -päätöksen perustelusivu</span>
    </PerusteluLayout>
  );
}
