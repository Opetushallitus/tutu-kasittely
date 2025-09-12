'use client';

import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import { Divider, Stack, useTheme } from '@mui/material';
import {
  OphButton,
  OphInputFormField,
  OphTypography,
} from '@opetushallitus/oph-design-system';
import React, { useEffect, useState } from 'react';
import { Lausuntopyynto, Lausuntotieto } from '@/src/lib/types/lausuntotieto';
import { LausuntopyyntoComponent } from '@/src/app/hakemus/[oid]/perustelu/yleiset/lausunto/components/LausuntopyyntoComponent';
import { useHakemus } from '@/src/context/HakemusContext';
import { Add } from '@mui/icons-material';
import { usePerustelu } from '@/src/hooks/usePerustelu';
import { useDebounce } from '@/src/hooks/useDebounce';
import { PerusteluLayout } from '@/src/app/hakemus/[oid]/perustelu/components/PerusteluLayout';

const emptyLausuntopyynto = (jarjestys: number): Lausuntopyynto => ({
  jarjestys: jarjestys,
  lahetetty: null,
  saapunut: null,
  lausunnonAntaja: null,
});

const emptyLausuntoTieto: Lausuntotieto = {
  lausuntopyynnot: [emptyLausuntopyynto(1)],
  pyyntojenLisatiedot: null,
  sisalto: null,
};

export default function Lausuntotiedot() {
  const { t } = useTranslations();
  const theme = useTheme();

  const { isLoading, hakemus, error } = useHakemus();
  const { perustelu, isPerusteluLoading, updatePerustelu } = usePerustelu(
    hakemus?.hakemusOid,
  );

  const [lausuntotieto, setLausuntotieto] =
    useState<Lausuntotieto>(emptyLausuntoTieto);

  useEffect(() => {
    if (!perustelu) return;
    const receivedLausuntotieto =
      perustelu!.lausuntotieto || emptyLausuntoTieto;
    const indexedLausuntopyynnot = receivedLausuntotieto.lausuntopyynnot.map(
      (pyynto, index) => ({
        ...pyynto,
        jarjestys: index + 1,
      }),
    );

    setLausuntotieto({
      ...receivedLausuntotieto,
      lausuntopyynnot: indexedLausuntopyynnot,
    });
  }, [perustelu, perustelu?.lausuntotieto]);

  const debouncedUpdatePerusteluLausuntotieto = useDebounce(
    (next: Lausuntotieto) => {
      updatePerustelu({
        ...perustelu!,
        lausuntotieto: next,
      });
    },
    1000,
  );

  const updateLausuntotieto = (
    field: string,
    value: string | Lausuntopyynto[] | null,
  ) => {
    const updatedLausuntotieto: Lausuntotieto = {
      ...lausuntotieto,
      [field]: value,
    };
    setLausuntotieto(updatedLausuntotieto);
    debouncedUpdatePerusteluLausuntotieto({
      ...perustelu!.lausuntotieto,
      [field]: value,
    });
  };

  const addLausuntopyynto = () => {
    const newJarjestys =
      lausuntotieto.lausuntopyynnot.length > 0
        ? lausuntotieto.lausuntopyynnot.reduce(
            (max, p) => Math.max(max, p.jarjestys || 0),
            0,
          ) + 1
        : 1;
    const newLausuntopyynto = emptyLausuntopyynto(newJarjestys);
    setLausuntotieto({
      ...lausuntotieto,
      lausuntopyynnot: [...lausuntotieto.lausuntopyynnot, newLausuntopyynto],
    });
  };

  const deleteLausuntopyynto = (jarjestysNumberToBeDeleted: number) => {
    const updatedLausuntopyynnot = lausuntotieto.lausuntopyynnot
      .filter((p) => p.jarjestys !== jarjestysNumberToBeDeleted)
      .map((pyynto, index) => ({
        ...pyynto,
        jarjestys: index + 1,
      }));
    updateLausuntotieto('lausuntopyynnot', updatedLausuntopyynnot);
  };

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
        {lausuntotieto.lausuntopyynnot.map((lausuntopyynto, index) => (
          <LausuntopyyntoComponent
            lausuntopyynto={lausuntopyynto}
            updateLausuntopyyntoAction={(pyynto: Lausuntopyynto) => {
              const updatedLausuntopyynnot = lausuntotieto.lausuntopyynnot.map(
                (p) => (p.jarjestys === pyynto.jarjestys ? pyynto : p),
              );
              updateLausuntotieto('lausuntopyynnot', updatedLausuntopyynnot);
            }}
            deleteLausuntopyyntoAction={deleteLausuntopyynto}
            t={t}
            theme={theme}
            key={index}
          />
        ))}
        <Divider orientation={'horizontal'} />
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
          value={lausuntotieto.pyyntojenLisatiedot || ''}
          onChange={(e) =>
            updateLausuntotieto('pyyntojenLisatiedot', e.target.value)
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
          value={lausuntotieto.sisalto || ''}
          onChange={(e) => updateLausuntotieto('sisalto', e.target.value)}
          multiline
          minRows={4}
          inputProps={{ 'data-testid': 'lausunnonSisalto-input' }}
        />
        <Divider orientation={'horizontal'} />
      </Stack>
    </PerusteluLayout>
  );
}
