'use client';

import { useTheme } from '@mui/material';
import { Stack } from '@mui/system';
import {
  OphInputFormField,
  OphTypography,
} from '@opetushallitus/oph-design-system';
import { LexicalEditor } from 'lexical';
import React, { RefObject, useEffect, useRef } from 'react';

import { Editor } from '@/src/app/hakemus/[oid]/editori/components/Editor';
import {
  exportHtml,
  importHtml,
} from '@/src/app/hakemus/[oid]/editori/components/editor-utils';
import { KieliSelect } from '@/src/app/hakemus/[oid]/editori/viesti/components/KieliSelect';
import { ViestityyppiComponent } from '@/src/app/hakemus/[oid]/editori/viesti/components/Viestityyppi';
import { FullSpinner } from '@/src/components/FullSpinner';
import { SaveRibbon } from '@/src/components/SaveRibbon';
import { useHakemus } from '@/src/context/HakemusContext';
import { useEditableState } from '@/src/hooks/useEditableState';
import useToaster from '@/src/hooks/useToaster';
import { useUnsavedChanges } from '@/src/hooks/useUnsavedChanges';
import { useViesti } from '@/src/hooks/useViesti';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import { Viesti, Viestityyppi } from '@/src/lib/types/viesti';
import { handleFetchError } from '@/src/lib/utils';

const Editori = ({
  editorRef,
  viesti,
}: {
  editorRef: RefObject<LexicalEditor | null>;
  viesti: string;
}) => {
  useEffect(() => {
    importHtml(editorRef.current, viesti);
  }, [editorRef, viesti]);

  return <Editor editorRef={editorRef}></Editor>;
};

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

  const editorRef = useRef<LexicalEditor | null>(null);

  if (hakemusError || viestiError) {
    return null;
  }

  if (isHakemusLoading || isViestiLoading || !hakemus || !currentViesti) {
    return <FullSpinner></FullSpinner>;
  }

  const updateViestiField = (updatedViesti: Partial<Viesti>) => {
    const newViesti = {
      ...currentViesti,
      ...updatedViesti,
      viesti: exportHtml(editorRef.current),
    };
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
        {t('hakemus.viesti.sivunOtsikko')}
      </OphTypography>
      <KieliSelect
        oletusKieli={currentViesti.kieli || 'fi'}
        updateKieli={(kieli) => updateViestiField({ kieli: kieli })}
        t={t}
        theme={theme}
      />
      <ViestityyppiComponent
        viestityyppi={currentViesti.tyyppi}
        updateViestityyppi={(tyyppi: Viestityyppi) =>
          updateViestiField({ tyyppi: tyyppi })
        }
        t={t}
      />
      <OphInputFormField
        label={t('hakemus.viesti.otsikko')}
        value={currentViesti.otsikko || ''}
        onChange={(event) =>
          updateViestiField({
            otsikko: event.target.value,
          })
        }
        data-testid={'viesti-otsikko-input'}
      />
      <Editori editorRef={editorRef} viesti={currentViesti.viesti || ''} />
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
