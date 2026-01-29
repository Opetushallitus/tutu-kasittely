'use client';

import { Stack } from '@mui/material';
import {
  OphCheckbox,
  OphInputFormField,
  OphTypography,
} from '@opetushallitus/oph-design-system';
import React from 'react';

import { PerusteluLayout } from '@/src/app/hakemus/[oid]/perustelu/components/PerusteluLayout';
import { SovellettuTilanne } from '@/src/app/hakemus/[oid]/perustelu/uoro/components/SovellettuTilanne';
import {
  opettajatBooleanFields,
  otmBooleanFields,
  vkBooleanFields,
} from '@/src/app/hakemus/[oid]/perustelu/uoro/constants/perusteluUoRoBooleanFields';
import { Muistio } from '@/src/components/Muistio';
import { SaveRibbon } from '@/src/components/SaveRibbon';
import { useHakemus } from '@/src/context/HakemusContext';
import { useEditableState } from '@/src/hooks/useEditableState';
import { usePerustelu } from '@/src/hooks/usePerustelu';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';

export default function UoroPage() {
  const { t } = useTranslations();
  const {
    hakemusState: { editedData: hakemus },
    isLoading,
    error,
  } = useHakemus();
  const {
    perustelu,
    tallennaPerustelu,
    isPerusteluLoading,
    perusteluIsSaving,
  } = usePerustelu(hakemus?.hakemusOid);

  // Use editable state hook for automatic change tracking and save handling
  const perusteluState = useEditableState(perustelu, tallennaPerustelu);

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
  return (
    <>
      <PerusteluLayout
        showTabs={false}
        title="hakemus.perustelu.uoro.otsikko"
        t={t}
        hakemus={hakemus}
        perusteluState={perusteluState}
        isLoading={isLoading || isPerusteluLoading}
        hakemusError={error}
      >
        <Stack direction="column" spacing={2}>
          <Muistio
            label={t('hakemus.perustelu.uoro.koulutuksenSisalto')}
            helperText={t('hakemus.perustelu.uoro.koulutuksenSisaltoSelite')}
            sisalto={uoRoSisalto?.koulutuksenSisalto}
            updateMuistio={(value) => {
              updatePerusteluUoRo('koulutuksenSisalto', value);
            }}
          />
          <OphTypography variant={'h3'}>
            {t('hakemus.perustelu.uoro.erotKoulutuksenSisallossa')}
          </OphTypography>
          <OphTypography variant={'label'}>
            {t('hakemus.perustelu.uoro.opettajat.otsikko')}
          </OphTypography>
          {opettajatBooleanFields.map(({ key, labelKey }) => (
            <OphCheckbox
              key={key as string}
              label={t(labelKey)}
              data-testid={`checkbox-${key as string}`}
              checked={!!uoRoSisalto?.[key]}
              onChange={() => updatePerusteluUoRo(key, !uoRoSisalto?.[key])}
            />
          ))}
          {uoRoSisalto?.opettajatMuuEro && (
            <OphInputFormField
              data-testid="opettajatMuuEroSelite"
              sx={{ paddingLeft: 4 }}
              multiline={true}
              minRows={5}
              label={t('yleiset.tasmenna')}
              value={uoRoSisalto?.opettajatMuuEroSelite || ''}
              onChange={(event) =>
                updatePerusteluUoRo('opettajatMuuEroSelite', event.target.value)
              }
            />
          )}
          <OphTypography variant={'label'}>
            {t('hakemus.perustelu.uoro.opettajatVk.otsikko')}
          </OphTypography>
          {vkBooleanFields.map(({ key, labelKey }) => (
            <OphCheckbox
              key={key as string}
              label={t(labelKey)}
              data-testid={`checkbox-${key as string}`}
              checked={!!uoRoSisalto?.[key]}
              onChange={() => updatePerusteluUoRo(key, !uoRoSisalto?.[key])}
            />
          ))}
          {uoRoSisalto?.vkOpettajatMuuEro && (
            <OphInputFormField
              sx={{ paddingLeft: 4 }}
              multiline={true}
              minRows={5}
              label={t('yleiset.tasmenna')}
              value={uoRoSisalto?.vkOpettajatMuuEroSelite || ''}
              onChange={(event) =>
                updatePerusteluUoRo(
                  'vkOpettajatMuuEroSelite',
                  event.target.value,
                )
              }
            />
          )}
          <OphTypography variant={'label'}>
            {t('hakemus.perustelu.uoro.otm.otsikko')}
          </OphTypography>
          {otmBooleanFields.map(({ key, labelKey }) => (
            <OphCheckbox
              key={key as string}
              label={t(labelKey)}
              data-testid={`checkbox-${key as string}`}
              checked={!!uoRoSisalto?.[key]}
              onChange={() => updatePerusteluUoRo(key, !uoRoSisalto?.[key])}
            />
          ))}
          {uoRoSisalto?.otmMuuEro && (
            <OphInputFormField
              data-testid="otmMuuEroSelite"
              sx={{ paddingLeft: 4 }}
              multiline={true}
              minRows={5}
              label={t('yleiset.tasmenna')}
              value={uoRoSisalto?.otmMuuEroSelite || ''}
              onChange={(event) =>
                updatePerusteluUoRo('otmMuuEroSelite', event.target.value)
              }
            />
          )}
          <Muistio
            label={t('hakemus.perustelu.uoro.muuTutkinto')}
            sisalto={uoRoSisalto?.muuTutkinto}
            updateMuistio={(value) => {
              updatePerusteluUoRo('muuTutkinto', value);
            }}
          />
          <OphTypography variant={'h3'}>
            {t('hakemus.perustelu.uoro.sovellettuTilanne.otsikko')}
          </OphTypography>
          <SovellettuTilanne
            uoRoSisalto={uoRoSisalto}
            updatePerusteluUoRoAction={updatePerusteluUoRo}
            t={t}
          />
        </Stack>
      </PerusteluLayout>
      <SaveRibbon
        onSave={perusteluState.save}
        isSaving={perusteluIsSaving || false}
        hasChanges={perusteluState.hasChanges}
      />
    </>
  );
}
