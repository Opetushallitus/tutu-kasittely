'use client';

import { OphTypography } from '@opetushallitus/oph-design-system';

import { PerusteluLayout } from '@/src/app/hakemus/[oid]/perustelu/components/PerusteluLayout';
import { AikaisemmatPaatokset } from '@/src/app/hakemus/[oid]/perustelu/yleiset/perustelut/components/AikaisemmatPaatokset';
import { JatkoOpintoKelpoisuus } from '@/src/app/hakemus/[oid]/perustelu/yleiset/perustelut/components/JatkoOpintoKelpoisuus';
import { Lahde } from '@/src/app/hakemus/[oid]/perustelu/yleiset/perustelut/components/Lahde';
import { MuuPerustelu } from '@/src/app/hakemus/[oid]/perustelu/yleiset/perustelut/components/MuuPerustelu';
import { SelvitysTutkinnonAsemasta } from '@/src/app/hakemus/[oid]/perustelu/yleiset/perustelut/components/SelvitysTutkinnonAsemasta';
import { SelvitysTutkinnonMyontajastaJaVirallisuudesta } from '@/src/app/hakemus/[oid]/perustelu/yleiset/perustelut/components/SelvitysTutkinnonMyontajastaJaVirallisuudesta';
import { TutkintokohtaisetTiedot } from '@/src/app/hakemus/[oid]/perustelu/yleiset/perustelut/components/TutkintokohtaisetTiedot';
import { VirallinenTutkinnonMyontaja } from '@/src/app/hakemus/[oid]/perustelu/yleiset/perustelut/components/VirallinenTutkinnonMyontaja';
import { VirallinenTutkinto } from '@/src/app/hakemus/[oid]/perustelu/yleiset/perustelut/components/VirallinenTutkinto';
import { YlimmanTutkinnonAsema } from '@/src/app/hakemus/[oid]/perustelu/yleiset/perustelut/components/YlimmanTutkinnonAsema';
import { SaveRibbon } from '@/src/components/SaveRibbon';
import { useHakemus } from '@/src/context/HakemusContext';
import { EditableState, useEditableState } from '@/src/hooks/useEditableState';
import { usePerustelu } from '@/src/hooks/usePerustelu';
import { useTutkinnot } from '@/src/hooks/useTutkinnot';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import { Hakemus } from '@/src/lib/types/hakemus';
import { Perustelu } from '@/src/lib/types/perustelu';

export default function YleisetPage() {
  const { t } = useTranslations();
  const { hakemusState, isLoading, error, isSaving } = useHakemus();

  const {
    perustelu,
    tallennaPerustelu,
    isPerusteluLoading,
    perusteluIsSaving,
  } = usePerustelu(hakemusState.editedData?.hakemusOid);
  const perusteluState = useEditableState(perustelu, tallennaPerustelu);

  return (
    <PerusteluLayout
      showTabs={true}
      title="hakemus.perustelu.yleiset.otsikko"
      t={t}
      hakemus={hakemusState.editedData}
      perusteluState={perusteluState}
      isLoading={isLoading || isPerusteluLoading}
      hakemusError={error}
    >
      <YleisetPerustelut
        hakemusState={hakemusState}
        perusteluState={perusteluState}
        isSaving={perusteluIsSaving || isSaving}
      />
    </PerusteluLayout>
  );
}

interface YleisetPerustelutProps {
  hakemusState: EditableState<Hakemus>;
  perusteluState: EditableState<Perustelu>;
  isSaving: boolean;
}

const YleisetPerustelut = ({
  hakemusState,
  perusteluState,
  isSaving,
}: YleisetPerustelutProps) => {
  const { t } = useTranslations();

  const { tutkintoState, isSaving: isTutkintoSaving } = useTutkinnot(
    hakemusState.editedData?.hakemusOid,
  );
  // Combined change tracking and save handler
  const hasChanges =
    perusteluState.hasChanges ||
    hakemusState.hasChanges ||
    tutkintoState.hasChanges;

  const handleSave = () => {
    perusteluState.save();
    tutkintoState.save();
    hakemusState.save();
  };

  return (
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
        tutkinnot={tutkintoState.editedData ?? []}
        updateTutkinnot={tutkintoState.updateLocal}
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
        isSaving={isSaving || isTutkintoSaving}
        hasChanges={hasChanges}
        lastSaved={hakemusState?.editedData?.muokattu}
        modifierFirstName={hakemusState?.editedData?.muokkaajaKutsumanimi}
        modifierLastName={hakemusState?.editedData?.muokkaajaSukunimi}
      />
    </>
  );
};
