'use client';

import { PerusteluLayout } from '@/src/app/hakemus/[oid]/perustelu/components/PerusteluLayout';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import { Stack } from '@mui/material';
import { Muistio } from '@/src/components/Muistio';
import { useHakemus } from '@/src/context/HakemusContext';
import { usePerustelu } from '@/src/hooks/usePerustelu';
import { useEditableState } from '@/src/hooks/useEditableState';
import React from 'react';
import {
  OphCheckbox,
  OphInputFormField,
  OphTypography,
} from '@opetushallitus/oph-design-system';
import {
  opettajatBooleanFields,
  otmBooleanFields,
  vkBooleanFields,
} from '@/src/app/hakemus/[oid]/perustelu/uoro/constants/perusteluUoRoBooleanFields';
import { SovellettuTilanne } from '@/src/app/hakemus/[oid]/perustelu/uoro/components/SovellettuTilanne';
import { SaveRibbon } from '@/src/components/SaveRibbon';
import { FullSpinner } from '@/src/components/FullSpinner';

export default function UoroPage() {
  const { t } = useTranslations();
  const { hakemus, isLoading, error } = useHakemus();
  const { perustelu, tallennaPerustelu, isPerusteluLoading, isSaving } =
    usePerustelu(hakemus?.hakemusOid);

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

  if (isPerusteluLoading || !perusteluState.editedData) {
    return <FullSpinner />;
  }

  const uoRoSisalto = perusteluState.editedData.uoRoSisalto;
  return (
    <>
      <PerusteluLayout
        showTabs={false}
        title="hakemus.perustelu.uoro.otsikko"
        t={t}
        hakemus={hakemus}
        isHakemusLoading={isLoading}
        hakemusError={error}
      >
        <Stack direction="column" spacing={2}>
          <Muistio
            label={t('hakemus.perustelu.uoro.koulutuksenSisalto')}
            helperText={t('hakemus.perustelu.uoro.koulutuksenSisaltoSelite')}
            hakemus={hakemus}
            sisainen={false}
            hakemuksenOsa={'perustelut-ro-uo'}
          />
          <OphTypography variant={'h3'}>
            {t('hakemus.perustelu.uoro.erotKoulutuksenSisallossa')}
          </OphTypography>
          <OphTypography variant={'h4'}>
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
          <OphTypography variant={'h4'}>
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
          <OphTypography variant={'h4'}>
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
            hakemus={hakemus}
            sisainen={false}
            hakemuksenOsa={'perustelut-uo-ro-muu-tutkinto'}
          />
          <OphTypography variant={'h4'}>
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
        isSaving={isSaving || false}
        hasChanges={perusteluState.hasChanges}
      />
    </>
  );
}
