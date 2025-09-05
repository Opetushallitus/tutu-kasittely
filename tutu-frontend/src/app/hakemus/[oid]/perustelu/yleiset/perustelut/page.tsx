'use client';

import { usePerustelu } from '@/src/hooks/usePerustelu';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import { useHakemus } from '@/src/context/HakemusContext';
import { Hakemus } from '@/src/lib/types/hakemus';

import { PerusteluLayout } from '@/src/app/hakemus/[oid]/perustelu/components/PerusteluLayout';
import { FullSpinner } from '@/src/components/FullSpinner';

import { VirallinenTutkinnonMyontaja } from '@/src/app/hakemus/[oid]/perustelu/yleiset/perustelut/components/VirallinenTutkinnonMyontaja';
import { VirallinenTutkinto } from '@/src/app/hakemus/[oid]/perustelu/yleiset/perustelut/components/VirallinenTutkinto';
import { Lahde } from '@/src/app/hakemus/[oid]/perustelu/yleiset/perustelut/components/Lahde';
import { SelvitysTutkinnonMyontajastaJaVirallisuudesta } from '@/src/app/hakemus/[oid]/perustelu/yleiset/perustelut/components/SelvitysTutkinnonMyontajastaJaVirallisuudesta';
import { YlimmanTutkinnonAsema } from '@/src/app/hakemus/[oid]/perustelu/yleiset/perustelut/components/YlimmanTutkinnonAsema';
import { SelvitysTutkinnonAsemasta } from '@/src/app/hakemus/[oid]/perustelu/yleiset/perustelut/components/SelvitysTutkinnonAsemasta';

export default function YleisetPage() {
  const { t } = useTranslations();
  const { hakemus, isLoading, error } = useHakemus();

  return (
    <PerusteluLayout
      showTabs={true}
      title="hakemus.perustelu.yleiset.otsikko"
      t={t}
      hakemus={hakemus}
      isHakemusLoading={isLoading}
      hakemusError={error}
    >
      <YleisetPerustelut hakemus={hakemus} />
    </PerusteluLayout>
  );
}

interface YleisetPerustelutProps {
  hakemus: Hakemus | undefined;
}

const YleisetPerustelut = ({ hakemus }: YleisetPerustelutProps) => {
  const { perustelu, updatePerustelu, isPerusteluLoading } = usePerustelu(
    hakemus?.hakemusOid,
  );

  const content = isPerusteluLoading ? (
    <FullSpinner></FullSpinner>
  ) : (
    <>
      <VirallinenTutkinnonMyontaja
        perustelu={perustelu}
        updatePerustelu={updatePerustelu}
      />
      <VirallinenTutkinto
        perustelu={perustelu}
        updatePerustelu={updatePerustelu}
      />
      <Lahde perustelu={perustelu} updatePerustelu={updatePerustelu} />
      <SelvitysTutkinnonMyontajastaJaVirallisuudesta />
      <YlimmanTutkinnonAsema
        perustelu={perustelu}
        updatePerustelu={updatePerustelu}
      />
      <SelvitysTutkinnonAsemasta />

      {/* Tutkintokohtaiset tiedot */}

      {/* Jatko-opintokelpoisuus ja muut perustelut */}
    </>
  );

  return content;
};
