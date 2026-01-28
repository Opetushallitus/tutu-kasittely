'use client';

import { Box, Chip, Divider, Stack, useTheme } from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import {
  OphButton,
  OphSelectFormField,
  OphTypography,
} from '@opetushallitus/oph-design-system';
import React, { useEffect, useState } from 'react';

import { AlertBox } from '@/src/components/AlertBox';
import { BoxWrapper } from '@/src/components/BoxWrapper';
import { EsittelijaSection } from '@/src/components/EsittelijaSection';
import { FullSpinner } from '@/src/components/FullSpinner';
import { SelectedMaakoodiInfo } from '@/src/components/SelectedMaakoodiInfo';
import { SuccessBox } from '@/src/components/SuccessBox';
import { useEsittelijat } from '@/src/hooks/useEsittelijat';
import { useMaakoodit, useUpdateMaakoodi } from '@/src/hooks/useMaakoodit';
import useToaster from '@/src/hooks/useToaster';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import { Maakoodi } from '@/src/lib/types/maakoodi';
import { handleFetchError } from '@/src/lib/utils';

const sortMaakoodit = (maakoodit: Maakoodi[] | undefined) =>
  maakoodit?.slice().sort((a, b) => a.fi.localeCompare(b.fi)) || [];

export default function MaajakoPage() {
  const { t } = useTranslations();
  const theme = useTheme();
  const { addToast } = useToaster();

  const {
    data: maakoodit,
    isLoading: maakooditIsLoading,
    error: maakooditError,
  } = useMaakoodit();
  const {
    data: esittelijat,
    isLoading: esittelijatIsLoading,
    error: esittelijatError,
  } = useEsittelijat();

  const [maakoodiToUpdate, setMaakoodiToUpdate] = useState<{
    id: string;
    esittelijaId?: string;
  }>();

  const updateMaakoodi = useUpdateMaakoodi(
    maakoodiToUpdate?.id,
    maakoodiToUpdate?.esittelijaId,
    {
      enabled: !!maakoodiToUpdate,
      onSuccess: () => {
        setMaakoodiToUpdate(undefined);
      },
    },
  );

  const [selectedMaakoodi, setSelectedMaakoodi] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    handleFetchError(addToast, maakooditError, 'virhe.maakoodiLataus', t);
  }, [maakooditError, addToast, t]);

  useEffect(() => {
    handleFetchError(addToast, esittelijatError, 'virhe.esittelijatLataus', t);
  }, [esittelijatError, addToast, t]);

  if (maakooditIsLoading || esittelijatIsLoading) {
    return <FullSpinner />;
  }

  // Sortataan maakoodit kerran per render
  const sortedMaakoodit = sortMaakoodit(maakoodit);
  const maakooditWithoutEsittelija = sortedMaakoodit.filter(
    (maakoodi) => maakoodi.esittelijaId == null,
  );
  const sortedMaakooditOptions = sortedMaakoodit.map((maakoodi) => ({
    label: maakoodi.fi,
    value: maakoodi.koodiUri,
  }));

  return (
    <BoxWrapper sx={{ borderBottom: 'none' }}>
      <Stack
        gap={theme.spacing(2)}
        sx={{ flexGrow: 1, marginRight: theme.spacing(3) }}
      >
        <OphTypography variant={'h3'}>
          {t('maajako.kenellevalittu')}
        </OphTypography>
        <OphSelectFormField
          placeholder={t('yleiset.valitse')}
          label={t('maajako.suoritusmaa')}
          sx={{ width: '50%', marginBottom: theme.spacing(1) }}
          options={sortedMaakooditOptions}
          value={selectedMaakoodi}
          onChange={(event: SelectChangeEvent) =>
            setSelectedMaakoodi(event.target.value)
          }
          data-testid={'suoritusmaa'}
        ></OphSelectFormField>

        <SelectedMaakoodiInfo
          maakoodit={sortedMaakoodit}
          selectedMaakoodi={selectedMaakoodi}
          esittelijat={esittelijat}
        />
        <Divider sx={{ marginBottom: theme.spacing(1) }} />

        <OphTypography variant={'h3'}>{t('maajako.maajako')}</OphTypography>
        <OphTypography variant={'body1'}>{t('maajako.kuvaus')}</OphTypography>

        {maakooditWithoutEsittelija.length === 0 ? (
          <SuccessBox infoText={t('maajako.kaikkiValittu')} />
        ) : (
          <AlertBox
            infoText={maakooditWithoutEsittelija
              .map((maakoodi) => maakoodi.fi)
              .join(', ')}
            headingText={t('maajako.varoitus')}
          />
        )}

        <OphButton
          sx={{
            width: '15%',
            marginBottom: theme.spacing(1),
            marginTop: theme.spacing(1),
          }}
          variant="outlined"
          color="primary"
          data-testid="toggle-edit"
          onClick={() => {
            setIsEditing((prev) => !prev);
          }}
        >
          {isEditing
            ? t('maajako.poistumuokkaustilasta')
            : t('maajako.muokkaamaajakoa')}
        </OphButton>

        {esittelijat?.map((esittelija, index) => (
          <React.Fragment key={index}>
            {isEditing ? (
              <>
                <OphTypography variant={'h4'}>
                  {esittelija.etunimi} {esittelija.sukunimi}
                </OphTypography>
                <OphSelectFormField
                  placeholder="yleiset.valitse"
                  label={t('maajako.tutkinnonsuoritusmaat')}
                  multiple
                  data-testid={`esittelija-maaselection-${esittelija.id ?? index}`}
                  options={maakooditWithoutEsittelija.map((maakoodi) => ({
                    label: maakoodi.fi,
                    value: maakoodi.koodiUri,
                  }))}
                  value={
                    (sortedMaakoodit
                      .filter(
                        (maakoodi) => maakoodi.esittelijaId === esittelija.id,
                      )
                      .map((maakoodi) => maakoodi.koodiUri) as never) || ''
                  }
                  onChange={(event: SelectChangeEvent) => {
                    const selectedValues = Array.isArray(event.target.value)
                      ? event.target.value
                      : [event.target.value];

                    const newMaakoodi = maakoodit?.find(
                      (maakoodi) =>
                        selectedValues.includes(maakoodi.koodiUri) &&
                        maakoodi.esittelijaId === null,
                    );

                    if (newMaakoodi && esittelija.id) {
                      setMaakoodiToUpdate({
                        id: newMaakoodi.id,
                        esittelijaId: esittelija.id,
                      });
                    }
                  }}
                  sx={{ width: '100%' }}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {Array.isArray(selected) &&
                        sortedMaakoodit
                          .filter((maakoodi) =>
                            selected.includes(maakoodi.koodiUri),
                          )
                          .map((maakoodi) => (
                            <Chip
                              key={maakoodi.koodiUri}
                              label={maakoodi.fi}
                              sx={{ borderRadius: '0px' }}
                              data-testid={`maakoodi-chip-${maakoodi.koodiUri}`}
                              onDelete={() => {
                                if (maakoodi && esittelija.id) {
                                  setMaakoodiToUpdate({
                                    id: maakoodi.id,
                                    esittelijaId: undefined,
                                  });
                                  updateMaakoodi();
                                }
                              }}
                              onMouseDown={(event) => {
                                event.stopPropagation();
                              }}
                            />
                          ))}
                    </Box>
                  )}
                ></OphSelectFormField>
              </>
            ) : (
              <EsittelijaSection
                esittelija={esittelija}
                maakoodit={sortedMaakoodit}
                t={t}
              />
            )}
            <Divider
              sx={{
                marginTop: theme.spacing(2),
                marginBottom: theme.spacing(2),
              }}
            />
          </React.Fragment>
        ))}
      </Stack>
    </BoxWrapper>
  );
}
