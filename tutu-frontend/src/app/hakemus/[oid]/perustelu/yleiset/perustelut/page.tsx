'use client';

import { useEffect, useState } from 'react';

import { OphTypography } from '@opetushallitus/oph-design-system';

import { usePerustelu } from '@/src/hooks/usePerustelu';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import { useHakemus } from '@/src/context/HakemusContext';
import { Hakemus, PartialHakemus } from '@/src/lib/types/hakemus';

import { PerusteluLayout } from '@/src/app/hakemus/[oid]/perustelu/components/PerusteluLayout';
import { FullSpinner } from '@/src/components/FullSpinner';

import { VirallinenTutkinnonMyontaja } from '@/src/app/hakemus/[oid]/perustelu/yleiset/perustelut/components/VirallinenTutkinnonMyontaja';
import { VirallinenTutkinto } from '@/src/app/hakemus/[oid]/perustelu/yleiset/perustelut/components/VirallinenTutkinto';
import { Lahde } from '@/src/app/hakemus/[oid]/perustelu/yleiset/perustelut/components/Lahde';
import { YlimmanTutkinnonAsema } from '@/src/app/hakemus/[oid]/perustelu/yleiset/perustelut/components/YlimmanTutkinnonAsema';
import { JatkoOpintoKelpoisuus } from '@/src/app/hakemus/[oid]/perustelu/yleiset/perustelut/components/JatkoOpintoKelpoisuus';
import { AikaisemmatPaatokset } from '@/src/app/hakemus/[oid]/perustelu/yleiset/perustelut/components/AikaisemmatPaatokset';
import { TutkintokohtaisetTiedot } from '@/src/app/hakemus/[oid]/perustelu/yleiset/perustelut/components/TutkintokohtaisetTiedot';
import { SelvitysTutkinnonMyontajastaJaVirallisuudesta } from '@/src/app/hakemus/[oid]/perustelu/yleiset/perustelut/components/SelvitysTutkinnonMyontajastaJaVirallisuudesta';
import { SelvitysTutkinnonAsemasta } from '@/src/app/hakemus/[oid]/perustelu/yleiset/perustelut/components/SelvitysTutkinnonAsemasta';
import { MuuPerustelu } from '@/src/app/hakemus/[oid]/perustelu/yleiset/perustelut/components/MuuPerustelu';
import { Perustelu } from '@/src/lib/types/perustelu';
import { useDebounce } from '@/src/hooks/useDebounce';

export default function YleisetPage() {
  const { t } = useTranslations();
  const { hakemus, updateHakemus, isLoading, error } = useHakemus();

  return (
    <PerusteluLayout
      showTabs={true}
      title="hakemus.perustelu.yleiset.otsikko"
      t={t}
      hakemus={hakemus}
      isHakemusLoading={isLoading}
      hakemusError={error}
    >
      <YleisetPerustelut hakemus={hakemus} updateHakemus={updateHakemus} />
    </PerusteluLayout>
  );
}

interface YleisetPerustelutProps {
  hakemus: Hakemus | undefined;
  updateHakemus: (patchHakemus: PartialHakemus) => void;
}

const YleisetPerustelut = ({
  hakemus,
  updateHakemus,
}: YleisetPerustelutProps) => {
  const { t } = useTranslations();

  const [parts, setParts] = useState<Partial<Perustelu>[]>([]);

  const { perustelu, updatePerustelu, isPerusteluLoading } = usePerustelu(
    hakemus?.hakemusOid,
  );

  useEffect(() => {
    setParts([]);
  }, [perustelu]);

  const debouncedUpdatePerustelu = useDebounce((newPerustelu: Perustelu) => {
    updatePerustelu(newPerustelu);
  }, 1000);

  const updatePerusteluWithPartial = (part: Partial<Perustelu>) => {
    const newParts = [...parts, part];
    setParts(newParts);
    const combinedParts = newParts.reduce(
      (currentPerustelu, nextPart) => ({ ...currentPerustelu, ...nextPart }),
      perustelu as Partial<Perustelu>,
    );
    debouncedUpdatePerustelu(combinedParts);
  };

  return isPerusteluLoading ? (
    <FullSpinner></FullSpinner>
  ) : (
    <>
      <VirallinenTutkinnonMyontaja
        perustelu={perustelu}
        updatePerustelu={updatePerusteluWithPartial}
      />
      <VirallinenTutkinto
        perustelu={perustelu}
        updatePerustelu={updatePerusteluWithPartial}
      />
      <Lahde
        perustelu={perustelu}
        updatePerustelu={updatePerusteluWithPartial}
      />
      <SelvitysTutkinnonMyontajastaJaVirallisuudesta
        perustelu={perustelu}
        updatePerustelu={updatePerusteluWithPartial}
      />
      <YlimmanTutkinnonAsema
        perustelu={perustelu}
        updatePerustelu={updatePerusteluWithPartial}
      />
      <SelvitysTutkinnonAsemasta
        perustelu={perustelu}
        updatePerustelu={updatePerusteluWithPartial}
      />
      <TutkintokohtaisetTiedot
        hakemus={hakemus}
        updateHakemus={updateHakemus}
      />
      <OphTypography variant={'h3'}>
        {t('hakemus.perustelu.yleiset.muutPerustelut.otsikko')}
      </OphTypography>
      <JatkoOpintoKelpoisuus
        perustelu={perustelu}
        updatePerustelu={updatePerusteluWithPartial}
      />
      <AikaisemmatPaatokset
        perustelu={perustelu}
        updatePerustelu={updatePerusteluWithPartial}
      />
      <MuuPerustelu
        perustelu={perustelu}
        updatePerustelu={updatePerusteluWithPartial}
      />
    </>
  );
};
