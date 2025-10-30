'use client';

import { OphTypography } from '@opetushallitus/oph-design-system';

import { usePerustelu } from '@/src/hooks/usePerustelu';
import { useEditableState } from '@/src/hooks/useEditableState';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import { useHakemus } from '@/src/context/HakemusContext';
import { Hakemus } from '@/src/lib/types/hakemus';

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
import { SaveRibbon } from '@/src/components/SaveRibbon';

export default function YleisetPage() {
  const { t } = useTranslations();
  const { hakemus, tallennaHakemus, isLoading, error } = useHakemus();

  return (
    <PerusteluLayout
      showTabs={true}
      title="hakemus.perustelu.yleiset.otsikko"
      t={t}
      hakemus={hakemus}
      isHakemusLoading={isLoading}
      hakemusError={error}
    >
      <YleisetPerustelut hakemus={hakemus} tallennaHakemus={tallennaHakemus} />
    </PerusteluLayout>
  );
}

interface YleisetPerustelutProps {
  hakemus: Hakemus | undefined;
  tallennaHakemus: (hakemus: Hakemus) => void;
}

const YleisetPerustelut = ({
  hakemus,
  tallennaHakemus,
}: YleisetPerustelutProps) => {
  const { t } = useTranslations();

  const { perustelu, tallennaPerustelu, isPerusteluLoading, isSaving } =
    usePerustelu(hakemus?.hakemusOid);

  // Manage editable state for both perustelu and hakemus with automatic change tracking
  const perusteluState = useEditableState(perustelu, tallennaPerustelu);
  const hakemusState = useEditableState(hakemus, tallennaHakemus);

  // Paikallinen päivitys hakemukselle (vain tutkinnot)
  const updateHakemusLocal = (part: Partial<Hakemus>) => {
    hakemusState.updateLocal(part);
  };

  // Combined change tracking and save handler
  const hasChanges = perusteluState.hasChanges || hakemusState.hasChanges;

  const handleSave = () => {
    perusteluState.save();
    hakemusState.save();
  };

  return isPerusteluLoading || !perusteluState.editedData ? (
    <FullSpinner></FullSpinner>
  ) : (
    <>
      <VirallinenTutkinnonMyontaja
        perustelu={perusteluState.editedData}
        updatePerustelu={perusteluState.updateLocal}
      />
      <VirallinenTutkinto
        perustelu={perusteluState.editedData}
        updatePerustelu={perusteluState.updateLocal}
      />
      <Lahde
        perustelu={perusteluState.editedData}
        updatePerustelu={perusteluState.updateLocal}
      />
      <SelvitysTutkinnonMyontajastaJaVirallisuudesta
        perustelu={perusteluState.editedData}
        updatePerustelu={perusteluState.updateLocal}
      />
      <YlimmanTutkinnonAsema
        perustelu={perusteluState.editedData}
        updatePerustelu={perusteluState.updateLocal}
      />
      <SelvitysTutkinnonAsemasta
        perustelu={perusteluState.editedData}
        updatePerustelu={perusteluState.updateLocal}
      />
      <TutkintokohtaisetTiedot
        hakemus={hakemusState.editedData}
        updateHakemus={updateHakemusLocal}
      />
      <OphTypography variant={'h3'}>
        {t('hakemus.perustelu.yleiset.muutPerustelut.otsikko')}
      </OphTypography>
      <JatkoOpintoKelpoisuus
        perustelu={perusteluState.editedData}
        updatePerustelu={perusteluState.updateLocal}
      />
      <AikaisemmatPaatokset
        perustelu={perusteluState.editedData}
        updatePerustelu={perusteluState.updateLocal}
      />
      <MuuPerustelu
        perustelu={perusteluState.editedData}
        updatePerustelu={perusteluState.updateLocal}
      />
      <SaveRibbon
        onSave={handleSave}
        isSaving={isSaving || false}
        hasChanges={hasChanges}
      />
    </>
  );
};
