'use client';

import { OphTypography } from '@opetushallitus/oph-design-system';

import { usePerustelu } from '@/src/hooks/usePerustelu';
import { useEditableState } from '@/src/hooks/useEditableState';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import { useHakemus } from '@/src/context/HakemusContext';

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
  const {
    hakemus,
    tallennaHakemus,
    updateLocal: updateHakemusLocal,
    hasChanges: hakemusHasChanges,
    isLoading,
    error,
  } = useHakemus();

  const { perustelu, tallennaPerustelu, isPerusteluLoading, isSaving } =
    usePerustelu(hakemus?.hakemusOid);

  // Manage editable state for both perustelu and hakemus with automatic change tracking
  const perusteluState = useEditableState(perustelu, tallennaPerustelu);

  // Combined change tracking and save handler
  const hasChanges = perusteluState.hasChanges || hakemusHasChanges;

  const handleSave = () => {
    perusteluState.save();
    tallennaHakemus();
  };

  return (
    <PerusteluLayout
      showTabs={true}
      title="hakemus.perustelu.yleiset.otsikko"
      t={t}
      hakemus={hakemus}
      isHakemusLoading={isLoading}
      hakemusError={error}
    >
      {isPerusteluLoading || !perusteluState.editedData ? (
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
            hakemus={hakemus}
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
      )}
    </PerusteluLayout>
  );
}
