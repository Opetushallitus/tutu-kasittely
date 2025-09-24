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
import { useDebounce } from '@/src/hooks/useDebounce';
import { PerusteluLayout } from '@/src/app/hakemus/[oid]/perustelu/components/PerusteluLayout';
import { Perustelu } from '@/src/lib/types/perustelu';

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
  const { perustelu, isPerusteluLoading, updatePerustelu } = usePerustelu(
    hakemus?.hakemusOid,
  );

  const [lausuntoPyyntojenLisatiedot, setLausuntoPyyntojenLisatiedot] =
    React.useState<string | undefined>(undefined);
  const [lausunnonSisalto, setLausunnonSisalto] = React.useState<
    string | undefined
  >(undefined);
  const [lausuntopyynnot, setLausuntopyynnot] = React.useState<
    Lausuntopyynto[]
  >([]);

  useEffect(() => {
    if (!perustelu) return;
    const indexedLausuntopyynnot = perustelu.lausuntopyynnot.map(
      (pyynto, index) => ({
        ...pyynto,
        jarjestys: index + 1,
      }),
    );

    setLausunnonSisalto(perustelu!.lausunnonSisalto);
    setLausuntoPyyntojenLisatiedot(perustelu!.lausuntoPyyntojenLisatiedot);
    setLausuntopyynnot(indexedLausuntopyynnot);
  }, [perustelu, setLausuntopyynnot]);

  const debouncedUpdatePerusteluLausuntotieto = useDebounce(
    (next: Perustelu) => {
      updatePerustelu(next);
    },
    1000,
  );

  const updateLausuntotieto = (
    field: string,
    value: string | Lausuntopyynto[] | null,
  ) => {
    switch (field) {
      case 'lausuntoPyyntojenLisatiedot':
        setLausuntoPyyntojenLisatiedot(value as string);
        break;
      case 'lausunnonSisalto':
        setLausunnonSisalto(value as string);
        break;
      case 'lausuntopyynnot':
        setLausuntopyynnot(value as Lausuntopyynto[]);
    }
    debouncedUpdatePerusteluLausuntotieto({
      ...perustelu!,
      [field]: value,
    });
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
    setLausuntopyynnot([...lausuntopyynnot, newLausuntopyynto]);
  };

  const deleteLausuntopyynto = (jarjestysNumberToBeDeleted: number) => {
    const updatedLausuntopyynnot = lausuntopyynnot
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
        {lausuntopyynnot.map((lausuntopyynto, index) => (
          <LausuntopyyntoComponent
            lausuntopyynto={lausuntopyynto}
            updateLausuntopyyntoAction={(pyynto: Lausuntopyynto) => {
              const updatedLausuntopyynnot = lausuntopyynnot.map((p) =>
                p.jarjestys === pyynto.jarjestys ? pyynto : p,
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
          value={lausuntoPyyntojenLisatiedot || ''}
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
          value={lausunnonSisalto || ''}
          onChange={(e) =>
            updateLausuntotieto('lausunnonSisalto', e.target.value)
          }
          multiline
          minRows={4}
          inputProps={{ 'data-testid': 'lausunnonSisalto-input' }}
        />
        <Divider orientation={'horizontal'} />
      </Stack>
    </PerusteluLayout>
  );
}
