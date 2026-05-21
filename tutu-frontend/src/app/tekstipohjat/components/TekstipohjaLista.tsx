'use client';

import { Add } from '@mui/icons-material';
import { Box, List, ListSubheader, Stack } from '@mui/material';
import { OphButton, OphTypography } from '@opetushallitus/oph-design-system';
import { useState } from 'react';

import { KategoriaSubHeader } from '@/src/app/tekstipohjat/components/KategoriaSubHeader';
import { TekstipohjaListItem } from '@/src/app/tekstipohjat/components/TekstipohjaListItem';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import { ophColors } from '@/src/lib/theme';
import {
  PaatospohjaKategoria,
  PaatospohjaListItem,
} from '@/src/lib/types/paatosteksti';
import {
  ViestipohjaKategoria,
  ViestipohjaListItem,
} from '@/src/lib/types/viesti';

import { KategoriaEditori } from './KategoriaEditori';

export default function TekstipohjaLista<
  T extends ViestipohjaListItem | PaatospohjaListItem,
  K extends ViestipohjaKategoria | PaatospohjaKategoria,
>({
  kategoriat,
  pohjat,
  setValittuId,
  tallennaKategoria,
  tPrefix,
}: {
  pohjat: Array<T>;
  kategoriat: Array<K>;
  setValittuId: (id: string | null | undefined) => void;
  tallennaKategoria: (
    katergoria: ViestipohjaKategoria | PaatospohjaKategoria,
  ) => void;
  tPrefix: string;
}) {
  const { t } = useTranslations();

  const [kategoriaModalOpen, setKategoriaModalOpen] = useState(false);
  const [selectedKategoria, setSelectedKategoria] = useState<
    ViestipohjaKategoria | undefined
  >();

  const eiKategoriaa = pohjat.filter((vp) => !vp.kategoriaId);

  return (
    <>
      <Stack
        direction={'column'}
        gap={2}
        sx={{
          width: '30%',
          backgroundColor: 'white',
          boxShadow: `-5px 0 8px ${ophColors.grey200}`,
          paddingLeft: 2,
        }}
      >
        <OphTypography variant={'h3'} sx={{ marginTop: 3 }}>
          {t(`${tPrefix}.lista.otsikko`)}
        </OphTypography>
        <Stack direction={'row'} gap={1}>
          <OphButton
            variant={'outlined'}
            startIcon={<Add />}
            onClick={() => {
              setSelectedKategoria(undefined);
              setKategoriaModalOpen(true);
            }}
          >
            {t('tekstipohjat.kategoriat.lisaa')}
          </OphButton>
          <OphButton
            variant={'outlined'}
            startIcon={<Add />}
            onClick={() => {
              setValittuId(undefined);
            }}
          >
            {t(`${tPrefix}.lisaa`)}
          </OphButton>
        </Stack>
        <Box
          sx={{
            '& ul': {
              padding: 0,
            },
          }}
        >
          {kategoriat.map((kategoria, index) => (
            <List
              subheader={
                <KategoriaSubHeader
                  index={index}
                  nimi={kategoria.nimi}
                  onClick={() => {
                    setKategoriaModalOpen(true);
                    setSelectedKategoria(kategoria);
                  }}
                />
              }
              key={kategoria.id}
            >
              {pohjat
                .filter((pohja) => pohja.kategoriaId === kategoria.id)
                .map((pohja) => (
                  <TekstipohjaListItem
                    key={pohja.id}
                    id={pohja.id}
                    nimi={pohja.nimi}
                    onClick={() => setValittuId(pohja.id)}
                  />
                ))}
            </List>
          ))}
          {eiKategoriaa.length > 0 && (
            <List
              subheader={
                <ListSubheader
                  sx={{
                    width: '100%',
                    display: 'flex',
                  }}
                >
                  <OphTypography variant={'label'}>
                    {t('tekstipohjat.eiKategoriaa')}
                  </OphTypography>
                </ListSubheader>
              }
            >
              {eiKategoriaa.map((pohja) => (
                <TekstipohjaListItem
                  key={pohja.id}
                  id={pohja.id}
                  nimi={pohja.nimi}
                  onClick={() => setValittuId(pohja.id)}
                />
              ))}
            </List>
          )}
        </Box>
      </Stack>
      {kategoriaModalOpen && (
        <KategoriaEditori
          handleClose={() => {
            setKategoriaModalOpen(false);
            setSelectedKategoria(undefined);
          }}
          handleSubmit={tallennaKategoria}
          kategoria={selectedKategoria}
        />
      )}
    </>
  );
}
