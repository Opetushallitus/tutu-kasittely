'use client';

import { Add, Edit } from '@mui/icons-material';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListSubheader,
  Stack,
} from '@mui/material';
import { OphButton, OphTypography } from '@opetushallitus/oph-design-system';
import { useState } from 'react';

import { KategoriaEditori } from '@/src/app/tekstipohjat/viestipohjat/components/KategoriaEditori';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import { ophColors } from '@/src/lib/theme';
import {
  ViestipohjaKategoria,
  ViestipohjaListItem,
} from '@/src/lib/types/viesti';

const ViestipohjaListItemComponent = ({
  viestipohja,
  onClick,
}: {
  viestipohja: ViestipohjaListItem;
  onClick: () => void;
}) => {
  return (
    <ListItem
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
      <ListItemButton onClick={onClick}>
        <OphTypography variant={'body1'}>{viestipohja.nimi}</OphTypography>
        <Edit sx={{ display: 'none' }} />
      </ListItemButton>
    </ListItem>
  );
};

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

  const eiKategoriaa = viestipohjat.filter((vp) => !vp.kategoriaId);

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
                <ListSubheader
                  sx={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'space-between',
                    '&:hover *': {
                      color: ophColors.blue2,
                    },
                    '&:hover button': {
                      display: 'block',
                    },
                  }}
                >
                  <OphTypography variant={'label'}>
                    {`${index + 1}. ${kategoria.nimi}`}
                  </OphTypography>
                  <OphButton
                    sx={{
                      marginRight: '12px',
                      display: 'none',
                      height: '24px',
                    }}
                    startIcon={<Edit />}
                    onClick={() => {
                      setKategoriaModalOpen(true);
                      setSelectedKategoria(kategoria);
                    }}
                  ></OphButton>
                </ListSubheader>
              }
              key={kategoria.id}
            >
              {viestipohjat
                .filter((vp) => vp.kategoriaId === kategoria.id)
                .map((vp) => (
                  <ViestipohjaListItemComponent
                    key={vp.id}
                    viestipohja={vp}
                    onClick={() => setValittuViestipohjaId(vp.id)}
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
                    {t('tekstipohjat.viestipohjat.eiKategoriaa')}
                  </OphTypography>
                </ListSubheader>
              }
            >
              {eiKategoriaa.map((vp) => (
                <ViestipohjaListItemComponent
                  key={vp.id}
                  viestipohja={vp}
                  onClick={() => setValittuViestipohjaId(vp.id)}
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
