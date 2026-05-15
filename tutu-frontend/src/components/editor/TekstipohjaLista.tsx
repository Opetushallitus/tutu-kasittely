import CloseIcon from '@mui/icons-material/Close';
import { useTheme } from '@mui/material';
import { Theme } from '@mui/material/styles';
import { Stack } from '@mui/system';
import {
  OphButton,
  ophColors,
  OphTypography,
} from '@opetushallitus/oph-design-system';
import React, { useEffect } from 'react';
import * as R from 'remeda';

import { FullSpinner } from '@/src/components/FullSpinner';
import {
  useTekstipohjaSelect,
  useTekstipohjat,
} from '@/src/hooks/useTekstipohjat';
import useToaster from '@/src/hooks/useToaster';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import { KategorianTekstipohjat, Viestipohja } from '@/src/lib/types/viesti';
import { handleFetchError } from '@/src/lib/utils';

interface TekstipohjaListaProps {
  headerText: string;
  close: () => void;
  selectPohja: (pohja: Viestipohja) => void;
}

export const TekstipohjaLista = ({
  headerText,
  close,
  selectPohja,
}: TekstipohjaListaProps) => {
  const { t } = useTranslations();
  const theme = useTheme();
  const { tekstipohjat, isLoadingPohjat, pohjatLoadError } = useTekstipohjat();
  const { selectTekstipohja, isLoadingPohja, pohjaLoadError } =
    useTekstipohjaSelect(selectPohja);
  const { addToast } = useToaster();

  useEffect(() => {
    handleFetchError(
      addToast,
      pohjatLoadError,
      'virhe.viestipohjaListanLataus',
      t,
    );
    handleFetchError(addToast, pohjaLoadError, 'virhe.viestipohjanLataus', t);
  }, [addToast, pohjatLoadError, pohjaLoadError, t]);

  return (
    <Stack
      sx={{
        width: '50%',
        height: '100%',
        backgroundColor: 'white',
        borderLeft: '1px solid',
        borderColor: 'divider',
        paddingLeft: theme.spacing(2),
      }}
      gap={theme.spacing(2)}
      data-testid="tekstipohja-lista"
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <OphTypography variant="h2">{headerText}</OphTypography>
        <OphButton
          data-testid="close-lista-button"
          onClick={() => close()}
          startIcon={<CloseIcon />}
        >
          {t('yleiset.sulje')}
        </OphButton>
      </Stack>
      <ListaSisalto
        theme={theme}
        error={pohjatLoadError}
        isLoading={isLoadingPohjat || isLoadingPohja}
        lista={tekstipohjat || []}
        selectTekstipohja={selectTekstipohja}
      />
    </Stack>
  );
};

const ListaSisalto = ({
  theme,
  error,
  isLoading,
  lista,
  selectTekstipohja,
}: {
  theme: Theme;
  error: Error | null;
  isLoading: boolean;
  lista: KategorianTekstipohjat[];
  selectTekstipohja: (pohjaId: string) => void;
}) => {
  if (error) {
    return null;
  }

  if (isLoading) {
    return <FullSpinner></FullSpinner>;
  }
  return (
    <Stack gap={theme.spacing(1)} data-testid="tekstipohja-lista-sisalto">
      {R.map(lista, (kategoria, kategoriaIndex) => (
        <Stack key={`kategoriaItem_${kategoriaIndex}`} gap={theme.spacing(1)}>
          <OphTypography variant="h3">
            {`${kategoriaIndex + 1}. ${kategoria.kategoriaNimi}`}
          </OphTypography>
          {R.map(kategoria.pohjat, (pohja, pohjaIndex) => (
            <OphButton
              key={`pohjaItem_${pohjaIndex}`}
              onClick={() => {
                selectTekstipohja(pohja.id);
              }}
              variant="text"
              sx={{
                justifyContent: 'flex-start',
                textAlign: 'left',
                backgroundColor: ophColors.grey50,
                fontWeight: 300,
                paddingTop: '2px',
                paddingBottom: '2px',
                paddingLeft: '2px',
                width: '100%',
              }}
            >
              {pohja.nimi}
            </OphButton>
          ))}
        </Stack>
      ))}
    </Stack>
  );
};
