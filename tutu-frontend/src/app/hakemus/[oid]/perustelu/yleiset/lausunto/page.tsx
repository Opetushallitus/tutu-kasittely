'use client';

import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import { Divider, Stack, useTheme } from '@mui/material';
import {
  OphButton,
  OphInputFormField,
  OphTypography,
} from '@opetushallitus/oph-design-system';
import React, { useEffect, useMemo } from 'react';
import { Lausuntopyynto } from '@/src/lib/types/lausuntotieto';
import { LausuntopyyntoComponent } from '@/src/app/hakemus/[oid]/perustelu/yleiset/lausunto/components/LausuntopyyntoComponent';
import { useHakemus } from '@/src/context/HakemusContext';
import { Add } from '@mui/icons-material';
import { usePerustelu } from '@/src/hooks/usePerustelu';
import { PerusteluLayout } from '@/src/app/hakemus/[oid]/perustelu/components/PerusteluLayout';
import { Perustelu } from '@/src/lib/types/perustelu';
import { SaveRibbon } from '@/src/components/SaveRibbon';
import { FullSpinner } from '@/src/components/FullSpinner';

const emptyLausuntopyynto = (jarjestys: number): Lausuntopyynto => ({
  jarjestys: jarjestys,
  lahetetty: null,
  saapunut: null,
  lausunnonAntaja: null,
});

export default function Lausuntotiedot() {
  const { t } = useTranslations();
  const theme = useTheme();

  const { isLoading, hakemus, error } = useHakemus();
  const { perustelu, isPerusteluLoading, tallennaPerustelu, isSaving } =
    usePerustelu(hakemus?.hakemusOid);

  // Local editable state
  const [editedPerustelu, setEditedPerustelu] = React.useState<
    Perustelu | undefined
  >();
  const [lausuntopyynnot, setLausuntopyynnot] = React.useState<
    Lausuntopyynto[]
  >([]);

  // Sync server data to local state when loaded
  useEffect(() => {
    if (!perustelu) return;
    setEditedPerustelu(perustelu);

    const indexedLausuntopyynnot = perustelu.lausuntopyynnot.map(
      (pyynto, index) => ({
        ...pyynto,
        jarjestys: index + 1,
      }),
    );
    setLausuntopyynnot(indexedLausuntopyynnot);
  }, [perustelu]);

  // Track if there are unsaved changes
  const hasChanges = useMemo(() => {
    return JSON.stringify(perustelu) !== JSON.stringify(editedPerustelu);
  }, [perustelu, editedPerustelu]);

  // Save handler
  const handleSave = () => {
    if (!hasChanges || !editedPerustelu) return;
    tallennaPerustelu(editedPerustelu);
  };

  // Update local state only
  const updateLausuntotieto = (
    field: string,
    value: string | Lausuntopyynto[] | null,
  ) => {
    setEditedPerustelu((prev) => ({
      ...prev!,
      [field]: value,
    }));
  };

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
    updateLausuntotieto('lausuntopyynnot', updatedLausuntopyynnot);
  };

  const deleteLausuntopyynto = (jarjestysNumberToBeDeleted: number) => {
    const updatedLausuntopyynnot = lausuntopyynnot
      .filter((p) => p.jarjestys !== jarjestysNumberToBeDeleted)
      .map((pyynto, index) => ({
        ...pyynto,
        jarjestys: index + 1,
      }));
    setLausuntopyynnot(updatedLausuntopyynnot);
    updateLausuntotieto('lausuntopyynnot', updatedLausuntopyynnot);
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
              updateLausuntotieto('lausuntopyynnot', updatedLausuntopyynnot);
            }}
            deleteLausuntopyyntoAction={deleteLausuntopyynto}
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
            updateLausuntotieto('lausuntoPyyntojenLisatiedot', e.target.value)
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
          onChange={(e) =>
            updateLausuntotieto('lausunnonSisalto', e.target.value)
          }
          multiline
          minRows={4}
          inputProps={{ 'data-testid': 'lausunnonSisalto-input' }}
        />
        <SaveRibbon
          onSave={handleSave}
          isSaving={isSaving || false}
          hasChanges={hasChanges}
        />
      </Stack>
    </PerusteluLayout>
  );
}
