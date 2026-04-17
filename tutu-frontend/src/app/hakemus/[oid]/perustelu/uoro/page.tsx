'use client';

import { Stack } from '@mui/material';

import { PerusteluLayout } from '@/src/app/hakemus/[oid]/perustelu/components/PerusteluLayout';
import { Muistio } from '@/src/components/Muistio';
import { SaveRibbon } from '@/src/components/SaveRibbon';
import { useHakemus } from '@/src/context/HakemusContext';
import { useEditableState } from '@/src/hooks/useEditableState';
import { usePerustelu } from '@/src/hooks/usePerustelu';
import { useUnsavedChanges } from '@/src/hooks/useUnsavedChanges';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';

export default function UoroPage() {
  const { t } = useTranslations();

  const { hakemusState, isLoading, error: hakemusError } = useHakemus();
  const { editedData: hakemus } = hakemusState;

  const {
    perustelu,
    tallennaPerustelu,
    isPerusteluLoading,
    isPerusteluSaving,
    error: perusteluError,
    updatePerusteluError,
  } = usePerustelu(hakemus?.hakemusOid);

  // Use editable state hook for automatic change tracking and save handling
  const perusteluState = useEditableState(perustelu, tallennaPerustelu);

  const {
    hasChanges: hasPerusteluChanges,
    save: savePerustelu,
    discard: discardPerustelu,
  } = perusteluState;

  // Update local state with custom logic for nested uoRoSisalto
  const updatePerusteluUoRo = (
    field: string,
    value: boolean | string | object,
  ) => {
    if (!perusteluState.editedData) return;

    const isMuuUnchecked =
      value === false &&
      (field.endsWith('MuuEro') || field === 'sovellettuMuuTilanne');

    const currentUoRoSisalto = perusteluState.editedData.uoRoSisalto;

    const modifiedUoRoSisalto = currentUoRoSisalto
      ? {
          ...currentUoRoSisalto,
          [field]: value,
          ...(isMuuUnchecked ? { [`${field}Selite`]: '' } : {}),
        }
      : { [field]: value };

    perusteluState.updateLocal({
      uoRoSisalto: modifiedUoRoSisalto,
    });
  };

  const uoRoSisalto = perusteluState.editedData?.uoRoSisalto;

  const handleSave = () => {
    savePerustelu();
  };

  useUnsavedChanges(hasPerusteluChanges, discardPerustelu);

  return (
    <>
      <PerusteluLayout
        showTabs={false}
        title="hakemus.perustelu.uoro.otsikko"
        t={t}
        hakemus={hakemus}
        perusteluState={perusteluState}
        isLoading={isLoading || isPerusteluLoading}
        hakemusError={hakemusError}
        perusteluError={perusteluError}
        updatePerusteluError={updatePerusteluError}
      >
        <Stack direction="column" spacing={2}>
          <Muistio
            label={t('hakemus.perustelu.uoro.koulutuksenSisalto')}
            testId="koulutuksenSisalto"
            helperText={t('hakemus.perustelu.uoro.koulutuksenSisaltoSelite')}
            sisalto={uoRoSisalto?.koulutuksenSisalto}
            updateMuistio={(value) => {
              updatePerusteluUoRo('koulutuksenSisalto', value);
            }}
          />
        </Stack>
      </PerusteluLayout>
      <SaveRibbon
        onSave={handleSave}
        isSaving={isPerusteluSaving}
        hasChanges={hasPerusteluChanges}
        lastSaved={perusteluState.editedData?.muokattu}
        modifier={perusteluState.editedData?.muokkaaja}
      />
    </>
  );
}
