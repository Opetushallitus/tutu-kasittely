'use client';

import { Hakemus, ImiPyynto } from '@/src/lib/types/hakemus';
import { Stack } from '@mui/material';
import EditOffIcon from '@mui/icons-material/EditOff';
import {
  ophColors,
  OphRadioGroup,
  OphTypography,
} from '@opetushallitus/oph-design-system';
import React from 'react';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import { styled } from '@/src/lib/theme';
import { IconButton } from '@/src/components/IconButton';

interface ImiPyyntoProps {
  imiPyynto: ImiPyynto;
  updateHakemusAction: (hakemus: Partial<Hakemus>) => void;
}
// TODO importoi oph-design-systemistä kun siellä valmista
interface OphRadioOption<T> {
  value: T;
  label: string;
}

const StyledEditOffIcon = styled(EditOffIcon)({
  color: ophColors.blue2,
});

export const ImiPyyntoComponent = ({
  imiPyynto,
  updateHakemusAction,
}: ImiPyyntoProps) => {
  const { t } = useTranslations();
  const imiPyyntoOptions: OphRadioOption<string>[] = [
    {
      value: 'true',
      label: t(`yleiset.kylla`),
    },
    {
      value: 'false',
      label: t(`yleiset.ei`),
    },
  ];

  return (
    <Stack direction="column" spacing={2}>
      <OphTypography variant={'h2'}>
        {t('hakemus.asiakirjat.imiPyynnot.otsikko')}
      </OphTypography>
      <Stack direction="row">
        <OphTypography variant={'label'}>
          {t('hakemus.asiakirjat.imiPyynnot.imiPyyntoQuestion')}
        </OphTypography>
        <IconButton
          onClick={() =>
            updateHakemusAction({
              imiPyynto: {
                ...imiPyynto,
                imiPyynto: null,
              },
            })
          }
        >
          <StyledEditOffIcon />
        </IconButton>
      </Stack>
      <Stack direction="column" spacing={2}>
        <OphRadioGroup
          labelId="imiPyynto-radio-group-label"
          sx={{ width: '100%' }}
          options={imiPyyntoOptions}
          row
          defaultValue={imiPyynto.imiPyynto?.toString() ?? ''}
          onChange={(e) =>
            updateHakemusAction({
              imiPyynto: {
                ...imiPyynto,
                imiPyynto: e.target.value === 'true',
              },
            })
          }
          value={imiPyynto.imiPyynto?.toString() ?? ''}
        />
      </Stack>
    </Stack>
  );
};
