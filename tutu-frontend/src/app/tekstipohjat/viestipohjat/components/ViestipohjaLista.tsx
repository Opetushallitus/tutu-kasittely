'use client';

import { Add, Edit } from '@mui/icons-material';
import { List, ListItem, Stack } from '@mui/material';
import { OphButton, OphTypography } from '@opetushallitus/oph-design-system';
import { useState } from 'react';

import { KategoriaEditori } from '@/src/app/tekstipohjat/viestipohjat/components/KategoriaEditori';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import { ophColors } from '@/src/lib/theme';
import {
  ViestipohjaKategoria,
  ViestipohjaListItem,
} from '@/src/lib/types/viesti';

export default function ViestipohjaLista({
  kategoriat,
  viestipohjat,
  setValittuViestipohjaId,
  tallennaKategoria,
}: {
  viestipohjat: Array<ViestipohjaListItem>;
  kategoriat: Array<ViestipohjaKategoria>;
  setValittuViestipohjaId: (viestipohjaId: string | null | undefined) => void;
  tallennaKategoria: (viestipohjaKategoria: ViestipohjaKategoria) => void;
}) {
  const { t } = useTranslations();

  const [kategoriaModalOpen, setKategoriaModalOpen] = useState(false);
  const [selectedKategoria, setSelectedKategoria] = useState<
    ViestipohjaKategoria | undefined
  >();

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
          {t('tekstipohjat.viestipohjat')}
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
            {t('tekstipohjat.viestipohjat.kategoriat.lisaa')}
          </OphButton>
          <OphButton
            variant={'outlined'}
            startIcon={<Add />}
            onClick={() => {
              setValittuViestipohjaId(undefined);
            }}
          >
            {t('tekstipohjat.viestipohjat.lisaa')}
          </OphButton>
        </Stack>
        {kategoriat.map((kategoria, index) => (
          <List
            subheader={
              <ListItem
                sx={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'space-between',
                  '&:hover *': {
                    color: ophColors.blue2,
                  },
                  '&:hover .MuiSvgIcon-root': {
                    display: 'block',
                  },
                }}
                onClick={() => {
                  setKategoriaModalOpen(true);
                  setSelectedKategoria(kategoria);
                }}
              >
                <OphTypography variant={'label'}>
                  {`${index + 1}. ${kategoria.nimi}`}
                </OphTypography>
                <Edit sx={{ marginRight: '12px', display: 'none' }} />
              </ListItem>
            }
            key={kategoria.id}
          >
            {viestipohjat
              .filter((vp) => vp.kategoriaId === kategoria.id)
              .map((vp) => (
                <ListItem
                  key={vp.id}
                  onClick={() => {
                    setValittuViestipohjaId(vp.id);
                  }}
                  sx={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'space-between',
                    backgroundColor: ophColors.grey50,
                    margin: '4px',
                    fontWeight: 500,
                    '&:hover *': {
                      color: ophColors.blue2,
                    },
                    '&:hover .MuiSvgIcon-root': {
                      display: 'block',
                    },
                  }}
                >
                  <OphTypography variant={'body1'}>{vp.nimi}</OphTypography>
                  <Edit sx={{ display: 'none' }} />
                </ListItem>
              ))}
          </List>
        ))}
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
