'use client';

import { OphTypography } from '@opetushallitus/oph-design-system';

import { usePerustelu } from '@/src/hooks/usePerustelu';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import { useHakemus } from '@/src/context/HakemusContext';
import { Hakemus } from '@/src/lib/types/hakemus';

import { PerusteluLayout } from '@/src/app/hakemus/[oid]/perustelu/components/PerusteluLayout';
import { FullSpinner } from '@/src/components/FullSpinner';

import { VirallinenTutkinnonMyontaja } from '@/src/app/hakemus/[oid]/perustelu/yleiset/perustelut/components/VirallinenTutkinnonMyontaja';
import { VirallinenTutkinto } from '@/src/app/hakemus/[oid]/perustelu/yleiset/perustelut/components/VirallinenTutkinto';
import { Lahde } from '@/src/app/hakemus/[oid]/perustelu/yleiset/perustelut/components/Lahde';
import { YlimmanTutkinnonAsema } from '@/src/app/hakemus/[oid]/perustelu/yleiset/perustelut/components/YlimmanTutkinnonAsema';
import { Muistio } from '@/src/components/Muistio';
import { JatkoOpintoKelpoisuus } from '@/src/app/hakemus/[oid]/perustelu/yleiset/perustelut/components/JatkoOpintoKelpoisuus';
import { AikaisemmatPaatokset } from '@/src/app/hakemus/[oid]/perustelu/yleiset/perustelut/components/AikaisemmatPaatokset';

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
  const { t } = useTranslations();
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
      <Muistio
        label={t(
          'hakemus.perustelu.yleiset.muistio.selvitysTutkinnonMyontajastaJaVirallisuudesta',
        )}
        hakemus={hakemus}
        sisainen={false}
        hakemuksenOsa={'perustelut-yleiset--selvitys-tutkinnon-myontajasta'}
      />
      <YlimmanTutkinnonAsema
        perustelu={perustelu}
        updatePerustelu={updatePerustelu}
      />
      <Muistio
        label={t('hakemus.perustelu.yleiset.muistio.selvitysTutkinnonAsemasta')}
        hakemus={hakemus}
        sisainen={false}
        hakemuksenOsa={'perustelut-yleiset--selvitys-tutkinnon-asemasta'}
      />

      {/* Tutkintokohtaiset tiedot */}

      <OphTypography variant={'h2'}>
        {t('hakemus.perustelu.yleiset.muutPerustelut.otsikko')}
      </OphTypography>
      <JatkoOpintoKelpoisuus
        perustelu={perustelu}
        updatePerustelu={updatePerustelu}
      />
      <AikaisemmatPaatokset
        perustelu={perustelu}
        updatePerustelu={updatePerustelu}
      />
      <Muistio
        label={t('hakemus.perustelu.yleiset.muistio.muuPerustelu')}
        hakemus={hakemus}
        sisainen={false}
        hakemuksenOsa={'perustelut-yleiset--muu-perustelu'}
      />
    </>
  );

  return content;
};
