'use client';

import {
  OphSelectFormField,
  OphTypography,
} from '@opetushallitus/oph-design-system';
import { useEffect, useState } from 'react';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import { BoxWrapper } from '@/src/components/BoxWrapper';
import { useMaakoodit } from '@/src/hooks/useMaakoodit';
import { useEsittelijat } from '@/src/hooks/useEsittelijat';
import useToaster from '@/src/hooks/useToaster';
import { handleFetchError } from '@/src/lib/utils';
import { FullSpinner } from '@/src/components/FullSpinner';
import { Divider, Stack, useTheme } from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import { SuccessBox } from '@/src/components/SuccessBox';
import { AlertBox } from '@/src/components/AlertBox';
import { SelectedMaakoodiInfo } from '@/src/components/SelectedMaakoodiInfo';
import { EsittelijaSection } from '@/src/components/EsittelijaSection';

interface Maakoodi {
  koodi: string;
  nimi: string;
  esittelijaId: string | null;
}

const sortMaakoodit = (maakoodit: Maakoodi[] | undefined) =>
  maakoodit?.slice().sort((a, b) => a.nimi.localeCompare(b.nimi)) || [];

export default function MaajakoPage() {
  const { t } = useTranslations();
  const theme = useTheme();
  const { addToast } = useToaster();
  const { data: maakoodit, isLoading, error } = useMaakoodit();
  const {
    data: esittelijat,
    isLoading: esittelijatLoading,
    error: esittelijatError,
  } = useEsittelijat();
  const [selectedMaakoodi, setSelectedMaakoodi] = useState<string>('');

  useEffect(() => {
    handleFetchError(addToast, error, 'virhe.maakoodiLataus', t);
  }, [error, addToast, t]);

  useEffect(() => {
    handleFetchError(addToast, esittelijatError, 'virhe.esittelijatLataus', t);
  }, [esittelijatError, addToast, t]);

  if (isLoading || esittelijatLoading) {
    return <FullSpinner />;
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
        <OphTypography variant={'h3'}>
          {t('maajako.kenellevalittu')}
        </OphTypography>
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

        <OphTypography variant={'h3'}>{t('maajako.maajako')}</OphTypography>
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
