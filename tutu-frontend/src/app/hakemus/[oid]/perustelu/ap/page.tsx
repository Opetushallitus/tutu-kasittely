'use client';

import { PerusteluLayout } from '@/src/app/hakemus/[oid]/perustelu/components/PerusteluLayout';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import { useHakemus } from '@/src/context/HakemusContext';

export default function ApPage() {
  const { t } = useTranslations();
  const { hakemus, isLoading, error } = useHakemus();
  return (
    <PerusteluLayout
      showTabs={false}
      title="hakemus.perustelu.ap.otsikko"
      t={t}
      hakemus={hakemus}
      isHakemusLoading={isLoading}
      hakemusError={error}
    >
      <span>Tämä on AP -päätöksen perustelusivu</span>
    </PerusteluLayout>
  );
}
