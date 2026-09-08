import CloseIcon from '@mui/icons-material/Close';
import { useTheme } from '@mui/material';
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
import { Paatospohja } from '@/src/lib/types/paatosteksti';
import { KategorianTekstipohjat, Viestipohja } from '@/src/lib/types/viesti';
import { handleFetchError } from '@/src/lib/utils';

interface TekstipohjaListaProps {
  url: 'paatospohja' | 'viestipohja';
  headerText: string;
  close: () => void;
  selectPohja: (pohja: Viestipohja | Paatospohja) => void;
}

export const TekstipohjaLista = ({
  url,
  headerText,
  close,
  selectPohja,
}: TekstipohjaListaProps) => {
  const { t } = useTranslations();
  const theme = useTheme();
  const { tekstipohjat, isLoadingPohjat, pohjatLoadError } =
    useTekstipohjat(url);
  const { selectTekstipohja, isLoadingPohja, pohjaLoadError } =
    useTekstipohjaSelect(selectPohja, url);
  const { addToast } = useToaster();

  useEffect(() => {
    handleFetchError(
      addToast,
      pohjatLoadError,
      'virhe.viestipohjaListanLataus',
      t,
    );
    handleFetchError(addToast, pohjaLoadError, 'virhe.viestipohjaLataus', t);
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
      spacing={2}
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
        error={pohjatLoadError}
        isLoading={isLoadingPohjat || isLoadingPohja}
        lista={tekstipohjat ?? []}
        selectTekstipohja={selectTekstipohja}
      />
    </Stack>
  );
};

const ListaSisalto = ({
  error,
  isLoading,
  lista,
  selectTekstipohja,
}: {
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
    <Stack spacing={1} data-testid="tekstipohja-lista-sisalto">
      {R.map(lista, (kategoria, kategoriaIndex) => (
        <Stack key={`kategoriaItem_${kategoriaIndex}`} spacing={1}>
          <OphTypography variant="h5">
            {`${kategoriaIndex + 1}. ${kategoria.kategoriaNimi}`}
          </OphTypography>
          {R.map(kategoria.pohjat ?? [], (pohja, pohjaIndex) => (
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
