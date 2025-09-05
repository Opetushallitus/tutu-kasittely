'use client';

import {
  OphSelectFormField,
  OphTypography,
} from '@opetushallitus/oph-design-system';
import { useState } from 'react';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import { BoxWrapper } from '@/src/components/BoxWrapper';
import { useMaakoodit } from '@/src/hooks/useMaakoodit';
import { useEsittelijat } from '@/src/hooks/useEsittelijat';
import { FullSpinner } from '@/src/components/FullSpinner';
import { Divider, Stack, Theme, useTheme } from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import { SuccessBox } from '@/src/components/SuccessBox';
import { AlertBox } from '@/src/components/AlertBox';

import { Esittelija } from '@/src/lib/types/esittelija';

interface Maakoodi {
  koodi: string;
  nimi: string;
  esittelijaId: string | null;
}

const filterMaakooditByEsittelija = (
  maakoodit: Maakoodi[] | undefined,
  esittelijaId: string | null | undefined,
) =>
  maakoodit
    ?.filter((maakoodi) => maakoodi.esittelijaId === esittelijaId)
    .map((maakoodi) => maakoodi.nimi) || [];

const sortMaakoodit = (maakoodit: Maakoodi[] | undefined) =>
  maakoodit?.slice().sort((a, b) => a.nimi.localeCompare(b.nimi)) || [];

const SelectedMaakoodiInfo = ({
  maakoodit,
  selectedMaakoodi,
  esittelijat,
}: {
  maakoodit: Maakoodi[] | undefined;
  selectedMaakoodi: string;
  esittelijat: Esittelija[] | undefined;
}) => {
  const filteredMaakoodit =
    maakoodit?.filter(
      (maakoodi) =>
        maakoodi.esittelijaId != null && maakoodi.koodi === selectedMaakoodi,
    ) || [];

  if (filteredMaakoodit.length > 0) {
    const esittelijaId = filteredMaakoodit[0].esittelijaId;
    const esittelija = esittelijat?.find((e) => e.id === esittelijaId);

    if (esittelija) {
      return (
        <div>
          <OphTypography variant={'h4'}>Esittelijä</OphTypography>
          <OphTypography variant={'body1'}>
            {esittelija.etunimi} {esittelija.sukunimi}
          </OphTypography>
        </div>
      );
    }
  }
  return null;
};

const EsittelijaSection = ({
  esittelija,
  maakoodit,
  t,
  theme,
}: {
  esittelija: Esittelija;
  maakoodit: Maakoodi[] | undefined;
  t: (key: string) => string;
  theme: Theme;
}) => {
  const maakooditForEsittelija = filterMaakooditByEsittelija(
    maakoodit,
    esittelija.id,
  );

  return (
    <div>
      <OphTypography variant={'h4'} sx={{ marginBottom: theme.spacing(2) }}>
        {esittelija.etunimi} {esittelija.sukunimi}
      </OphTypography>

      <OphTypography variant={'label'}>
        {t('maajako.tutkinnonsuoritusmaat')}
      </OphTypography>

      <OphTypography variant={'body1'} sx={{ marginBottom: theme.spacing(1) }}>
        {maakooditForEsittelija.length > 0
          ? maakooditForEsittelija.join(', ')
          : '-'}
      </OphTypography>

      <Divider
        sx={{ marginTop: theme.spacing(3), marginBottom: theme.spacing(3) }}
      />
    </div>
  );
};

export default function MaajakoPage() {
  const { t } = useTranslations();
  const theme = useTheme();
  const { data: maakoodit, isLoading, error } = useMaakoodit();
  const {
    data: esittelijat,
    isLoading: esittelijatLoading,
    error: esittelijatError,
  } = useEsittelijat();
  const [selectedMaakoodi, setSelectedMaakoodi] = useState<string>('');

  if (isLoading || esittelijatLoading) {
    return <FullSpinner />;
  }

  if (error || esittelijatError) {
    return (
      <BoxWrapper sx={{ borderBottom: 'none' }}>
        <OphTypography variant={'body2'} color="error">
          {t('virhe.maakoodi')}
        </OphTypography>
      </BoxWrapper>
    );
  }

  const sortedMaakooditOptions = sortMaakoodit(maakoodit).map((maakoodi) => ({
    label: maakoodi.nimi,
    value: maakoodi.koodi,
  }));

  return (
    <BoxWrapper sx={{ borderBottom: 'none' }}>
      <Stack
        gap={theme.spacing(3)}
        sx={{ flexGrow: 1, marginRight: theme.spacing(3) }}
      >
        <OphTypography variant={'h3'}>{t('maajako.otsikko2')}</OphTypography>
        <OphSelectFormField
          placeholder={t('yleiset.valitse')}
          label={t('maajako.suoritusmaa')}
          sx={{ width: '50%' }}
          options={sortedMaakooditOptions}
          value={selectedMaakoodi}
          onChange={(event: SelectChangeEvent) =>
            setSelectedMaakoodi(event.target.value)
          }
          data-testid={'suoritusmaa'}
        ></OphSelectFormField>

        <SelectedMaakoodiInfo
          maakoodit={maakoodit}
          selectedMaakoodi={selectedMaakoodi}
          esittelijat={esittelijat}
        />
        <Divider />

        <OphTypography variant={'h3'}>{t('maajako.otsikko3')}</OphTypography>
        <OphTypography variant={'body1'}>{t('maajako.kuvaus')}</OphTypography>

        {(() => {
          const maakooditWithoutEsittelija =
            maakoodit?.filter((maakoodi) => maakoodi.esittelijaId == null) ||
            [];

          if (maakooditWithoutEsittelija.length === 0) {
            return <SuccessBox infoText={t('maajako.kaikkiValittu')} />;
          }

          return (
            <AlertBox
              infoText={maakooditWithoutEsittelija
                .map((maakoodi) => maakoodi.nimi)
                .join(', ')}
              headingText={t('maajako.varoitus')}
            />
          );
        })()}

        {esittelijat?.map((esittelija, index) => (
          <EsittelijaSection
            key={`${esittelija.id}-${index}`}
            esittelija={esittelija}
            maakoodit={maakoodit}
            t={t}
            theme={theme}
          />
        ))}
      </Stack>
    </BoxWrapper>
  );
}
