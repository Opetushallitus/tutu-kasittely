'use client';

import { PerusteluLayout } from '@/src/app/hakemus/[oid]/perustelu/components/PerusteluLayout';

export default function UoroPage() {
  return (
    <PerusteluLayout showTabs={false}>
      <span>
        Tämä on tiettyä kelpoisuutta koskevan UO/RO -päätöksen perustelusivu
      </span>
    </PerusteluLayout>
  );
}
