import { TFunction } from '@/src/lib/localization/hooks/useTranslations';
import { TutkintoTaiOpinto } from '@/src/lib/types/paatos';
import { Divider, Stack, useTheme } from '@mui/material';
import {
  OphButton,
  OphSelectFormField,
  OphTypography,
} from '@opetushallitus/oph-design-system';
import React from 'react';
import { OphRadioGroupWithClear } from '@/src/components/OphRadioGroupWithClear';
import { myonteinenPaatosOptions } from '@/src/app/hakemus/[oid]/paatostiedot/constants';
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
  deleteTutkintoTaiOpintoAction: (id: string | undefined) => void;
}

export const RinnastettavaTutkintoTaiOpintoComponent = ({
  t,
  index,
  tutkintoTaiOpinto,
  paatosTyyppi,
  updateTutkintoTaiOpintoAction,
  deleteTutkintoTaiOpintoAction,
}: RinnastettavaTutkintoTaiOpintoComponentProps) => {
  const theme = useTheme();

  const updateMyonteinenPaatos = (value: boolean | null) => {
    updateTutkintoTaiOpintoAction(
      {
        ...tutkintoTaiOpinto,
        myonteinenPaatos: value,
      },
      index,
    );
  };

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
          onClick={() => deleteTutkintoTaiOpintoAction(tutkintoTaiOpinto.id)}
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

      <OphRadioGroupWithClear
        label={t('hakemus.paatos.tutkinto.myonteinenPaatos')}
        labelId={`myonteinenPaatos-radio-group-${index}-label`}
        data-testid={`paatos-myonteinenPaatos-radio-group-${index}`}
        labelVariant="h4"
        options={myonteinenPaatosOptions(t)}
        row
        value={tutkintoTaiOpinto.myonteinenPaatos?.toString() ?? ''}
        onChange={(e) => updateMyonteinenPaatos(e.target.value === 'true')}
        onClear={() => updateMyonteinenPaatos(null)}
      />

      <Divider orientation={'horizontal'} />
    </Stack>
  );
};
