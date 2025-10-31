import { TFunction } from '@/src/lib/localization/hooks/useTranslations';
import {
  PaatosTietoOptionGroup,
  TutkintoTaiOpinto,
} from '@/src/lib/types/paatos';
import {
  Divider,
  ListSubheader,
  MenuItem,
  Select,
  Stack,
  useTheme,
} from '@mui/material';
import {
  OphButton,
  ophColors,
  OphFormFieldWrapper,
  OphTypography,
} from '@opetushallitus/oph-design-system';
import React, { useEffect, useState } from 'react';
import { OphRadioGroupWithClear } from '@/src/components/OphRadioGroupWithClear';
import { myonteinenPaatosOptions } from '@/src/app/hakemus/[oid]/paatostiedot/constants';
import { DeleteOutline } from '@mui/icons-material';
import { useGlobalConfirmationModal } from '@/src/components/ConfirmationModal';
import { getPaatosTietoDropdownOptions } from '@/src/app/hakemus/[oid]/paatostiedot/paatostietoUtils';
import { useAsiointiKieli } from '@/src/hooks/useAsiointikieli';

interface RinnastettavaTutkintoTaiOpintoComponentProps {
  t: TFunction;
  index: number;
  tutkintoTaiOpinto: TutkintoTaiOpinto;
  paatosTyyppi: string;
  paatosTietoOptions: PaatosTietoOptionGroup;
  updateTutkintoTaiOpintoAction: (
    updatedTutkintoTaiOpinto: TutkintoTaiOpinto,
    index: number,
  ) => void;
  deleteTutkintoTaiOpintoAction: (id: string | undefined) => void;
  tyyppi: string;
}

export const RinnastettavaTutkintoTaiOpintoComponent = ({
  t,
  index,
  tutkintoTaiOpinto,
  paatosTyyppi,
  paatosTietoOptions,
  updateTutkintoTaiOpintoAction,
  deleteTutkintoTaiOpintoAction,
  tyyppi,
}: RinnastettavaTutkintoTaiOpintoComponentProps) => {
  const theme = useTheme();

  // Local optimistic state for immediate UI feedback
  const [optimisticValue, setOptimisticValue] = useState<
    boolean | null | undefined
  >(undefined);

  // Use optimistic value if set, otherwise use prop value
  const currentMyonteinenPaatos =
    optimisticValue !== undefined
      ? optimisticValue
      : tutkintoTaiOpinto?.myonteinenPaatos;

  // Clear optimistic state when prop value catches up
  useEffect(() => {
    if (optimisticValue !== undefined) {
      if (tutkintoTaiOpinto?.myonteinenPaatos === optimisticValue) {
        setOptimisticValue(undefined);
      }
    }
  }, [tutkintoTaiOpinto?.myonteinenPaatos, optimisticValue]);

  const updateMyonteinenPaatos = (value: boolean | null) => {
    // Set local optimistic value immediately
    setOptimisticValue(value);

    // Send update to server
    updateTutkintoTaiOpintoAction(
      {
        ...tutkintoTaiOpinto,
        myonteinenPaatos: value,
      },
      index,
    );
  };

  const asiointikieli = useAsiointiKieli();
  const { showConfirmation } = useGlobalConfirmationModal();

  const rinnastettavaTutkintoTaiOpinnotOptions =
    tyyppi === 'riittavatOpinnot'
      ? getPaatosTietoDropdownOptions(
          asiointikieli,
          paatosTietoOptions.riittavatOpinnotOptions,
        )
      : getPaatosTietoDropdownOptions(
          asiointikieli,
          paatosTietoOptions.tiettyTutkintoTaiOpinnotOptions,
        );

  const renderOptionsRecursively = (
    options: typeof rinnastettavaTutkintoTaiOpinnotOptions,
    level: number = 1,
  ): React.ReactNode[] => {
    return options.flatMap((option) => {
      const isTopLevel =
        'children' in option && option.children && option.children.length > 0;

      if (isTopLevel) {
        return [
          <ListSubheader
            key={`header-${option.value}`}
            sx={{ paddingLeft: level }}
          >
            <OphTypography sx={{ paddingLeft: level + 1 }} variant="h5">
              {option.label}
            </OphTypography>
          </ListSubheader>,
          ...renderOptionsRecursively(option.children!, level + 1),
        ];
      }

      return (
        <MenuItem key={option.value} value={option.value}>
          <OphTypography sx={{ paddingLeft: level === 1 ? level : level + 1 }}>
            {option.label}
          </OphTypography>
        </MenuItem>
      );
    });
  };

  const rinnastettavaTutkintoTaiOpinnotGroupedOptions =
    renderOptionsRecursively(rinnastettavaTutkintoTaiOpinnotOptions);

  const getRinnastettavaTutkintoTaiOpinnotValueWithPath = (
    value: string | null,
  ) => {
    if (!value) return '';
    const parts = value.split('_');
    if (parts.length == 1) return value;
    return `${parts.join(', ')}`;
  };

  return (
    <Stack
      direction={'column'}
      gap={theme.spacing(2)}
      sx={{ width: '100%', padding: 2, backgroundColor: ophColors.grey50 }}
    >
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
        {index > 0 && (
          <OphButton
            sx={{
              alignSelf: 'flex-end',
            }}
            data-testid={`poista-tutkinto-tai-opinto-button`}
            variant="text"
            startIcon={<DeleteOutline />}
            onClick={() =>
              showConfirmation({
                header: t(
                  `hakemus.paatos.paatostyyppi.${tyyppi}.modal.otsikko`,
                ),
                content: t(
                  `hakemus.paatos.paatostyyppi.${tyyppi}.modal.teksti`,
                ),
                confirmButtonText: t(
                  `hakemus.paatos.paatostyyppi.${tyyppi}.modal.poistaTutkintoTaiOpinnot`,
                ),
                handleConfirmAction: () =>
                  deleteTutkintoTaiOpintoAction(tutkintoTaiOpinto.id),
              })
            }
          >
            {t(`hakemus.paatos.paatostyyppi.${paatosTyyppi}.poista`)}
          </OphButton>
        )}{' '}
      </Stack>
      <OphFormFieldWrapper
        label={t(
          `hakemus.paatos.paatostyyppi.${paatosTyyppi}.rinnastettavaTutkintoTaiOpinnot`,
        )}
        sx={{ width: '100%' }}
        renderInput={() => (
          <Select
            sx={{ width: '100%' }}
            data-testid="rinnastettava-tutkinto-tai-opinto-select"
            value={tutkintoTaiOpinto.tutkintoTaiOpinto || ''}
            onChange={(e) =>
              updateTutkintoTaiOpintoAction(
                {
                  ...tutkintoTaiOpinto,
                  tutkintoTaiOpinto: e.target.value,
                },
                index,
              )
            }
            renderValue={(value: string | null) =>
              getRinnastettavaTutkintoTaiOpinnotValueWithPath(value)
            }
          >
            {rinnastettavaTutkintoTaiOpinnotGroupedOptions}
          </Select>
        )}
      />

      <OphRadioGroupWithClear
        label={t('hakemus.paatos.tutkinto.myonteinenPaatos')}
        labelId={`myonteinenPaatos-radio-group-${index}-label`}
        data-testid={`paatos-myonteinenPaatos-radio-group-${index}`}
        labelVariant="h4"
        options={myonteinenPaatosOptions(t)}
        row
        value={currentMyonteinenPaatos?.toString() ?? ''}
        onChange={(e) => updateMyonteinenPaatos(e.target.value === 'true')}
        onClear={() => updateMyonteinenPaatos(null)}
      />

      <Divider orientation={'horizontal'} />
    </Stack>
  );
};
