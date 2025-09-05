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
import { LausuntopyyntoComponent } from '@/src/app/hakemus/[oid]/perustelu/yleiset/lausuntotiedot/components/LausuntopyyntoComponent';
import useToaster from '@/src/hooks/useToaster';
import { useHakemus } from '@/src/context/HakemusContext';
import { handleFetchError } from '@/src/lib/utils';
import { FullSpinner } from '@/src/components/FullSpinner';
import { Add } from '@mui/icons-material';

const emptyLausuntoTiedot: Lausuntotieto = {
  lausuntopyynnot: [
    {
      jarjestys: 1,
      lahetetty: null,
      saapunut: null,
      lausunnonAntaja: null,
    },
  ],
  pyyntojenLisatiedot: null,
  sisalto: null,
};

const emptyLausuntopyynto = (jarjestys: number): Lausuntopyynto => ({
  jarjestys: jarjestys,
  lahetetty: null,
  saapunut: null,
  lausunnonAntaja: null,
});

export default function Lausuntotiedot() {
  const { t } = useTranslations();
  const theme = useTheme();

  const { addToast } = useToaster();
  const { isLoading, hakemus, error /*updateHakemus*/ } = useHakemus();

  const [lausuntotiedot, setLausuntotiedot] =
    useState<Lausuntotieto>(emptyLausuntoTiedot);

  useEffect(() => {
    if (!hakemus) return;
    const receivedLausuntotiedot =
      hakemus.perustelu?.lausuntotieto || emptyLausuntoTiedot;
    const indexedLausuntopyynnot = receivedLausuntotiedot.lausuntopyynnot.map(
      (pyynto, index) => ({
        ...pyynto,
        jarjestys: index + 1,
      }),
    );

    setLausuntotiedot({
      ...receivedLausuntotiedot,
      lausuntopyynnot: indexedLausuntopyynnot,
    });
  }, [hakemus]);

  useEffect(() => {
    handleFetchError(addToast, error, 'virhe.hakemuksenLataus', t);
  }, [error, addToast, t]);

  const addLausuntopyynto = () => {
    const newJarjestys =
      lausuntotiedot.lausuntopyynnot.length > 0
        ? Math.max(
            ...lausuntotiedot.lausuntopyynnot.map((p) => p.jarjestys || 0),
          ) + 1
        : 1;
    const newLausuntopyynto = emptyLausuntopyynto(newJarjestys);
    setLausuntotiedot({
      ...lausuntotiedot,
      lausuntopyynnot: [...lausuntotiedot.lausuntopyynnot, newLausuntopyynto],
    });
  };

  const updateLausuntotiedot = () =>
    /* updatedLausuntotieto: Partial<Lausuntotieto>,*/
    {};
  const deleteLausuntopyynto = (jarjestysNumberToBeDeleted: number) => {
    lausuntotiedot.lausuntopyynnot.filter(
      (p) => p.jarjestys !== jarjestysNumberToBeDeleted,
    );
    updateLausuntotiedot(/*{
      lausuntopyynnot: updatedLausuntopyynnot,
    }*/);
  };

  if (error) {
    return null;
  }

  if (isLoading || !hakemus) return <FullSpinner></FullSpinner>;

  return (
    <Stack
      gap={theme.spacing(3)}
      sx={{ flexGrow: 1, marginRight: theme.spacing(3) }}
    >
      <OphTypography variant={'h3'}>
        {t('hakemus.perustelu.yleiset.lausuntotiedot.lausuntopyynnot')}
      </OphTypography>
      {lausuntotiedot.lausuntopyynnot.map((lausuntopyynto, index) => (
        <LausuntopyyntoComponent
          lausuntopyynto={lausuntopyynto}
          updateLausuntopyyntoAction={
            (/*pyynto: Lausuntopyynto*/) =>
              updateLausuntotiedot(/*{ lausuntopyynnot: [pyynto] }*/)
          }
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
        {t('hakemus.perustelu.yleiset.lausuntotiedot.lisaaLausuntopyynto')}
      </OphButton>
      <OphInputFormField
        label={t(
          'hakemus.perustelu.yleiset.lausuntotiedot.pyyntojenLisatiedot',
        )}
        value={lausuntotiedot.pyyntojenLisatiedot || ''}
        onChange={
          (/*e*/) =>
            updateLausuntotiedot(/*{ pyyntojenLisatiedot: e.target.value }*/)
        }
        multiline
        minRows={4}
        inputProps={{ 'data-testid': 'pyyntojenLisatiedot-input' }}
      />
      <Divider orientation={'horizontal'} />
      <OphTypography variant={'h3'}>
        {t('hakemus.perustelu.yleiset.lausuntotiedot.lausunto')}
      </OphTypography>
      <OphInputFormField
        label={t('hakemus.perustelu.yleiset.lausuntotiedot.sisalto')}
        value={lausuntotiedot.sisalto || ''}
        onChange={
          (/*e*/) => updateLausuntotiedot(/*{ sisalto: e.target.value }*/)
        }
        multiline
        minRows={4}
        inputProps={{ 'data-testid': 'lausunnonSisalto-input' }}
      />
      <Divider orientation={'horizontal'} />
    </Stack>
  );
}
