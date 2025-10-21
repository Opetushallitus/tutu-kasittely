import { TFunction } from '@/src/lib/localization/hooks/useTranslations';
import { TutkintoTaiOpinto } from '@/src/lib/types/paatos';
import { Divider, Stack, useTheme } from '@mui/material';
import {
  OphButton,
  OphSelectFormField,
  OphTypography,
} from '@opetushallitus/oph-design-system';
import React from 'react';
import { MyonteinenPaatos } from '@/src/app/hakemus/[oid]/paatostiedot/components/MyonteinenPaatos';
import { DeleteOutline } from '@mui/icons-material';

interface RinnastettavaTutkintoTaiOpintoComponentProps {
  t: TFunction;
  index: number;
  tutkintoTaiOpinto: TutkintoTaiOpinto;
  paatosTyyppi: string;
  updateTutkintoTaiOpintoAction: (
    updatedTutkintoTaiOpinto: TutkintoTaiOpinto,
    index: number,
  ) => void;
  setDeleteModalOpen: (value: React.SetStateAction<boolean>) => void;
}

export const RinnastettavaTutkintoTaiOpintoComponent = ({
  t,
  index,
  tutkintoTaiOpinto,
  paatosTyyppi,
  updateTutkintoTaiOpintoAction,
  setDeleteModalOpen,
}: RinnastettavaTutkintoTaiOpintoComponentProps) => {
  const updateMyonteinenPaatos = (myonteinenPaatos: boolean) => {
    updateTutkintoTaiOpintoAction(
      { ...tutkintoTaiOpinto, myonteinenPaatos: myonteinenPaatos },
      index,
    );
  };
  const theme = useTheme();

  return (
    <Stack direction={'column'} gap={2} sx={{ width: '100%' }}>
      <Stack
        key={`stack-${index}`}
        direction={'row'}
        gap={theme.spacing(2)}
        sx={{ justifyContent: 'space-between', alignItems: 'center' }}
      >
        <OphTypography variant={'h3'}>
          {t(`hakemus.paatos.paatostyyppi.${paatosTyyppi}.otsikko`) +
            (index + 1)}
        </OphTypography>
        <OphButton
          sx={{
            alignSelf: 'flex-end',
          }}
          data-testid={`poista-tutkinto-tai-opinto-button`}
          variant="text"
          startIcon={<DeleteOutline />}
          onClick={() => setDeleteModalOpen(true)}
        >
          {t(`hakemus.paatos.paatostyyppi.${paatosTyyppi}.poista`)}
        </OphButton>
      </Stack>

      <OphSelectFormField
        placeholder={t('yleiset.valitse')}
        label={t(
          t(
            `hakemus.paatos.paatostyyppi.${paatosTyyppi}.rinnastettavaTutkintoTaiOpinnot`,
          ),
        )}
        sx={{ width: '100%' }}
        //TODO seuraavassa vaiheessa oikeat optionsit
        options={[{ value: 'testi', label: 'TODO' }]}
        onChange={(e) =>
          updateTutkintoTaiOpintoAction(
            { ...tutkintoTaiOpinto, tutkintoTaiOpinto: e.target.value },
            index,
          )
        }
        value={tutkintoTaiOpinto.tutkintoTaiOpinto || ''}
        data-testid={`rinnastettava-tutkinto-tai-opinto-select`}
      />
      <MyonteinenPaatos
        t={t}
        myonteinenPaatos={tutkintoTaiOpinto.myonteinenPaatos}
        updateMyonteinenPaatosAction={updateMyonteinenPaatos}
      />
      <Divider orientation={'horizontal'} />
    </Stack>
  );
};
