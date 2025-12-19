'use client';

import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import { Divider, Stack, useTheme } from '@mui/material';
import {
  OphButton,
  OphInputFormField,
  OphTypography,
} from '@opetushallitus/oph-design-system';
import React, { useEffect } from 'react';
import { Lausuntopyynto } from '@/src/lib/types/lausuntotieto';
import { LausuntopyyntoComponent } from '@/src/app/hakemus/[oid]/perustelu/yleiset/lausunto/components/LausuntopyyntoComponent';
import { useHakemus } from '@/src/context/HakemusContext';
import { Add } from '@mui/icons-material';
import { usePerustelu } from '@/src/hooks/usePerustelu';
import { PerusteluLayout } from '@/src/app/hakemus/[oid]/perustelu/components/PerusteluLayout';
import { SaveRibbon } from '@/src/components/SaveRibbon';
import { FullSpinner } from '@/src/components/FullSpinner';
import { useEditableState } from '@/src/hooks/useEditableState';
import { omit } from 'remeda';
import { useKoodistoOptions } from '@/src/hooks/useKoodistoOptions';

const emptyLausuntopyynto = (jarjestys: number): Lausuntopyynto => ({
  jarjestys: jarjestys,
  lahetetty: null,
  saapunut: null,
  lausunnonAntajaKoodiUri: null,
  lausunnonAntajaMuu: null,
});

export default function Lausuntotiedot() {
  const { t } = useTranslations();
  const theme = useTheme();

  const {
    isLoading,
    hakemusState: { editedData: hakemus },
    error,
  } = useHakemus();
  const { perustelu, isPerusteluLoading, tallennaPerustelu, isSaving } =
    usePerustelu(hakemus?.hakemusOid);
  const { korkeakouluOptions, isLoading: isKoodistoLoading } =
    useKoodistoOptions();

  // Use editableState hook for perustelu management
  const {
    editedData: editedPerustelu,
    hasChanges,
    updateLocal,
    updateImmediately,
    save,
  } = useEditableState(perustelu, tallennaPerustelu);

  // Separate state for indexed lausuntopyynnot (UI-specific)
  const [lausuntopyynnot, setLausuntopyynnot] = React.useState<
    Lausuntopyynto[]
  >([]);

  // Sync indexed lausuntopyynnot from editedPerustelu
  useEffect(() => {
    if (!editedPerustelu) return;

    const indexedLausuntopyynnot = editedPerustelu.lausuntopyynnot.map(
      (pyynto, index) => ({
        ...pyynto,
        jarjestys: index + 1,
      }),
    );
    setLausuntopyynnot(indexedLausuntopyynnot);
  }, [editedPerustelu, editedPerustelu?.lausuntopyynnot]);

  const addLausuntopyynto = () => {
    const newJarjestys =
      lausuntopyynnot.length > 0
        ? lausuntopyynnot.reduce(
            (max, p) => Math.max(max, p.jarjestys || 0),
            0,
          ) + 1
        : 1;
    const newLausuntopyynto: Lausuntopyynto = emptyLausuntopyynto(newJarjestys);
    const updatedLausuntopyynnot = [...lausuntopyynnot, newLausuntopyynto];
    setLausuntopyynnot(updatedLausuntopyynnot);
    // Strip jarjestys field before saving to editedPerustelu
    const lausuntopyynnotWithoutJarjestys = updatedLausuntopyynnot.map((p) =>
      omit(p, ['jarjestys']),
    );
    updateLocal({ lausuntopyynnot: lausuntopyynnotWithoutJarjestys });
  };

  const deleteLausuntopyynto = (jarjestysNumberToBeDeleted: number) => {
    const updatedLausuntopyynnot = lausuntopyynnot
      .filter((p) => p.jarjestys !== jarjestysNumberToBeDeleted)
      .map((pyynto, index) => ({
        ...pyynto,
        jarjestys: index + 1,
      }));
    setLausuntopyynnot(updatedLausuntopyynnot);
    // Strip jarjestys field before saving to editedPerustelu
    const lausuntopyynnotWithoutJarjestys = updatedLausuntopyynnot.map((p) =>
      omit(p, ['jarjestys']),
    );
    updateImmediately({ lausuntopyynnot: lausuntopyynnotWithoutJarjestys });
  };

  if (isPerusteluLoading || !editedPerustelu) {
    return <FullSpinner />;
  }

  return (
    <PerusteluLayout
      showTabs={true}
      title="hakemus.perustelu.lausuntotiedot.lausuntopyynnot"
      t={t}
      hakemus={hakemus}
      isHakemusLoading={isLoading || isPerusteluLoading || !perustelu}
      hakemusError={error}
    >
      <Stack
        gap={theme.spacing(3)}
        sx={{ flexGrow: 1, marginRight: theme.spacing(3) }}
      >
        {lausuntopyynnot.map((lausuntopyynto, index) => (
          <LausuntopyyntoComponent
            lausuntopyynto={lausuntopyynto}
            updateLausuntopyyntoAction={(pyynto: Lausuntopyynto) => {
              const updatedLausuntopyynnot = lausuntopyynnot.map((p) =>
                p.jarjestys === pyynto.jarjestys ? pyynto : p,
              );
              setLausuntopyynnot(updatedLausuntopyynnot);
              // Strip jarjestys field before saving to editedPerustelu
              // jarjestys is only used for UI, not persisted to server
              const lausuntopyynnotWithoutJarjestys =
                updatedLausuntopyynnot.map((p) => omit(p, ['jarjestys']));
              updateLocal({ lausuntopyynnot: lausuntopyynnotWithoutJarjestys });
            }}
            deleteLausuntopyyntoAction={deleteLausuntopyynto}
            korkeakouluOptions={korkeakouluOptions}
            isKoodistoLoading={isKoodistoLoading}
            t={t}
            theme={theme}
            key={index}
          />
        ))}
        {lausuntopyynnot.length > 0 && <Divider orientation={'horizontal'} />}
        <OphButton
          sx={{
            alignSelf: 'flex-start',
          }}
          data-testid={`lisaa-lausuntopyynto-button`}
          variant="outlined"
          startIcon={<Add />}
          onClick={addLausuntopyynto}
        >
          {t('hakemus.perustelu.lausuntotiedot.lisaaLausuntopyynto')}
        </OphButton>
        <OphInputFormField
          label={t('hakemus.perustelu.lausuntotiedot.pyyntojenLisatiedot')}
          value={editedPerustelu.lausuntoPyyntojenLisatiedot || ''}
          onChange={(e) =>
            updateLocal({ lausuntoPyyntojenLisatiedot: e.target.value })
          }
          multiline
          minRows={4}
          inputProps={{ 'data-testid': 'pyyntojenLisatiedot-input' }}
        />
        <Divider orientation={'horizontal'} />
        <OphTypography variant={'h3'}>
          {t('hakemus.perustelu.lausuntotiedot.lausunto')}
        </OphTypography>
        <OphInputFormField
          label={t('hakemus.perustelu.lausuntotiedot.sisalto')}
          value={editedPerustelu.lausunnonSisalto || ''}
          onChange={(e) => updateLocal({ lausunnonSisalto: e.target.value })}
          multiline
          minRows={4}
          inputProps={{ 'data-testid': 'lausunnonSisalto-input' }}
        />
        <SaveRibbon
          onSave={save}
          isSaving={isSaving || false}
          hasChanges={hasChanges}
        />
      </Stack>
    </PerusteluLayout>
  );
}
