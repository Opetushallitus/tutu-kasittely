'use client';

import { useTheme } from '@mui/material';
import { Stack } from '@mui/system';
import { OphTypography } from '@opetushallitus/oph-design-system';
import React, { useEffect } from 'react';

import { KieliSelect } from '@/src/app/hakemus/[oid]/editori/viesti/components/KieliSelect';
import { FullSpinner } from '@/src/components/FullSpinner';
import { SaveRibbon } from '@/src/components/SaveRibbon';
import { useHakemus } from '@/src/context/HakemusContext';
import { useEditableState } from '@/src/hooks/useEditableState';
import useToaster from '@/src/hooks/useToaster';
import { useUnsavedChanges } from '@/src/hooks/useUnsavedChanges';
import { useViesti } from '@/src/hooks/useViesti';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import { Viesti } from '@/src/lib/types/viesti';
import { handleFetchError } from '@/src/lib/utils';

export default function ViestiPage() {
  const { t } = useTranslations();
  const theme = useTheme();

  const {
    isLoading: isHakemusLoading,
    hakemusState,
    error: hakemusError,
  } = useHakemus();

  const hakemus = hakemusState.editedData;

  const {
    isViestiLoading,
    viesti,
    error: viestiError,
    updateViesti,
    updateOngoing,
  } = useViesti(hakemus?.hakemusOid);

  const viestiState = useEditableState(viesti, (viesti) =>
    updateViesti(viesti, false),
  );
  const currentViesti = viestiState.editedData;

  useUnsavedChanges(viestiState.hasChanges);

  const { addToast } = useToaster();

  useEffect(() => {
    handleFetchError(addToast, hakemusError, 'virhe.hakemuksenLataus', t);
    handleFetchError(addToast, viestiError, 'virhe.viestinLataus', t);
  }, [hakemusError, viestiError, addToast, t]);

  if (hakemusError || viestiError) {
    return null;
  }

  if (isHakemusLoading || isViestiLoading || !hakemus || !currentViesti) {
    return <FullSpinner></FullSpinner>;
  }

  const updateViestiField = (updatedViesti: Partial<Viesti>) => {
    const newViesti = { ...viesti, ...updatedViesti };
    viestiState.updateLocal(newViesti);
  };

  return (
    <Stack
      gap={theme.spacing(3)}
      sx={{
        flexGrow: 1,
        marginRight: theme.spacing(3),
      }}
    >
      <OphTypography variant={'h2'}>
        {t('hakemus.viesti.otsikko')}
      </OphTypography>
      <KieliSelect
        oletusKieli={currentViesti.kieli || 'fi'}
        updateKieli={(kieli) => updateViestiField({ kieli: kieli })}
        t={t}
        theme={theme}
      />
      <SaveRibbon
        onSave={() => {
          viestiState.save();
        }}
        isSaving={updateOngoing}
        hasChanges={viestiState.hasChanges}
        lastSaved={hakemus.muokattu}
        modifier={hakemus.muokkaaja}
      />
    </Stack>
  );
}
