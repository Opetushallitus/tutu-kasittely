import {
  KielteisenPaatoksenPerustelut,
  PaatosTieto,
} from '@/src/lib/types/paatos';
import { TFunction } from '@/src/lib/localization/hooks/useTranslations';
import { OphCheckbox, OphTypography } from '@opetushallitus/oph-design-system';
import React from 'react';
import { Stack, useTheme } from '@mui/material';
import { Muistio } from '@/src/components/Muistio';
import { useHakemus } from '@/src/context/HakemusContext';

interface KielteisenPaatoksenPerusteluComponentProps {
  paatosTieto: PaatosTieto;
  updatePaatosTietoAction: (updatedPaatosTieto: PaatosTieto) => void;
  t: TFunction;
}

export const KielteisenPaatoksenPerusteluComponent = ({
  paatosTieto,
  updatePaatosTietoAction,
  t,
}: KielteisenPaatoksenPerusteluComponentProps) => {
  const theme = useTheme();
  const { hakemusState } = useHakemus();

  const kielteisenPaatoksenPerustelutKeys = [
    'epavirallinenKorkeakoulu',
    'epavirallinenTutkinto',
    'eiVastaaSuomessaSuoritettavaaTutkintoa',
    'muuPerustelu',
  ] as const satisfies (keyof KielteisenPaatoksenPerustelut)[];

  return (
    <Stack direction="column" gap={theme.spacing(2)}>
      <OphTypography variant="h5">
        {t('hakemus.paatos.kielteisenPaatoksenPerustelut.otsikko')}
      </OphTypography>
      {kielteisenPaatoksenPerustelutKeys.map((key) => (
        <OphCheckbox
          key={key}
          data-testid={`kielteinenPaatos-${key}`}
          label={t(`hakemus.paatos.kielteisenPaatoksenPerustelut.${key}`)}
          checked={paatosTieto.kielteisenPaatoksenPerustelut?.[key] || false}
          onChange={(e) =>
            updatePaatosTietoAction({
              ...paatosTieto,
              kielteisenPaatoksenPerustelut: {
                ...paatosTieto.kielteisenPaatoksenPerustelut,
                [key]: e.target.checked,
              } as KielteisenPaatoksenPerustelut,
            })
          }
        />
      ))}
      {paatosTieto.kielteisenPaatoksenPerustelut?.muuPerustelu && (
        <Muistio
          label={t('hakemus.paatos.kielteisenPaatoksenPerustelut.muuPerustelu')}
          hakemus={hakemusState.editedData}
          sisainen={false}
          hakemuksenOsa={'paatos'}
        />
      )}
    </Stack>
  );
};
