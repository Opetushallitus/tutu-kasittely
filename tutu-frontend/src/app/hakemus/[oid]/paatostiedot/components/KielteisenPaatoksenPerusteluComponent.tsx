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
  const { hakemus } = useHakemus();

  return (
    <Stack direction="column" gap={theme.spacing(2)}>
      <OphTypography variant="h4">
        {t('hakemus.paatos.kielteisenPaatoksenPerustelut.otsikko')}
      </OphTypography>

      <OphTypography variant="h5">
        {t('hakemus.paatos.myonteinenPaatos.otsikko')}
      </OphTypography>
      <OphCheckbox
        data-testid="kielteinenPaatos-epavirallinenKorkeakoulu"
        label={t(
          'hakemus.paatos.kielteisenPaatoksenPerustelut.epavirallinenKorkeakoulu',
        )}
        checked={
          paatosTieto.kielteisenPaatoksenPerustelut?.epavirallinenKorkeakoulu ||
          false
        }
        onChange={(e) =>
          updatePaatosTietoAction({
            ...paatosTieto,
            kielteisenPaatoksenPerustelut: {
              ...paatosTieto.kielteisenPaatoksenPerustelut,
              epavirallinenKorkeakoulu: e.target.checked,
            } as KielteisenPaatoksenPerustelut,
          })
        }
      />
      <OphCheckbox
        data-testid="kielteinenPaatos-epavirallinenTutkinto"
        label={t(
          'hakemus.paatos.kielteisenPaatoksenPerustelut.epavirallinenTutkinto',
        )}
        checked={
          paatosTieto.kielteisenPaatoksenPerustelut?.epavirallinenTutkinto ||
          false
        }
        onChange={(e) =>
          updatePaatosTietoAction({
            ...paatosTieto,
            kielteisenPaatoksenPerustelut: {
              ...paatosTieto.kielteisenPaatoksenPerustelut,
              epavirallinenTutkinto: e.target.checked,
            } as KielteisenPaatoksenPerustelut,
          })
        }
      />
      <OphCheckbox
        data-testid="kielteinenPaatos-eiVastaaSuomessaSuoritettavaaTutkintoa"
        label={t(
          'hakemus.paatos.kielteisenPaatoksenPerustelut.eiVastaaSuomessaSuoritettavaaTutkintoa',
        )}
        checked={
          paatosTieto.kielteisenPaatoksenPerustelut
            ?.eiVastaaSuomessaSuoritettavaaTutkintoa || false
        }
        onChange={(e) =>
          updatePaatosTietoAction({
            ...paatosTieto,
            kielteisenPaatoksenPerustelut: {
              ...paatosTieto.kielteisenPaatoksenPerustelut,
              eiVastaaSuomessaSuoritettavaaTutkintoa: e.target.checked,
            } as KielteisenPaatoksenPerustelut,
          })
        }
      />
      <OphCheckbox
        data-testid="kielteinenPaatos-muuPerustelu"
        label={t('hakemus.paatos.kielteisenPaatoksenPerustelut.muuPerustelu')}
        checked={
          paatosTieto.kielteisenPaatoksenPerustelut?.muuPerustelu || false
        }
        onChange={(e) =>
          updatePaatosTietoAction({
            ...paatosTieto,
            kielteisenPaatoksenPerustelut: {
              ...paatosTieto.kielteisenPaatoksenPerustelut,
              muuPerustelu: e.target.checked,
            } as KielteisenPaatoksenPerustelut,
          })
        }
      />
      {paatosTieto.kielteisenPaatoksenPerustelut?.muuPerustelu && (
        <Muistio
          label={t('hakemus.paatos.kielteisenPaatoksenPerustelut.muuPerustelu')}
          hakemus={hakemus}
          sisainen={false}
          hakemuksenOsa={'paatos'}
        />
      )}
    </Stack>
  );
};
