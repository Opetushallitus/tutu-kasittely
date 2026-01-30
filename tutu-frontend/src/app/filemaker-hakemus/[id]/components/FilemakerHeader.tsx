'use client';

import { Divider } from '@mui/material';
import { Stack, useTheme } from '@mui/system';
import { OphTypography } from '@opetushallitus/oph-design-system';

import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';

import {
  getters,
  FilemakerHakemus,
} from '../../../../lib/utils/filemakerDataUtils';

const FilemakerHeader = ({ hakemus }: { hakemus: FilemakerHakemus }) => {
  const theme = useTheme();
  const { t } = useTranslations();

  return (
    <Stack
      direction="row"
      divider={<Divider orientation="vertical" flexItem />}
      spacing={5}
    >
      <Stack direction="column" width="100%" spacing={theme.spacing(2, 3)}>
        <OphTypography variant="label" data-testid="hakemusotsikko-hakija">
          {`${getters.kokonimi(hakemus)} ${getters.hetu(hakemus)}`}
        </OphTypography>
        <OphTypography data-testid="hakemusotsikko-asiatunnus">
          {getters.asiatunnus(hakemus) || t('hakemusotsikko.asiatunnusPuuttuu')}
        </OphTypography>
        <OphTypography data-testid="hakemusotsikko-hakemusKoskee">
          {`${t('filemaker.hakemuskoskee')}: ${getters.hakemusKoskee(hakemus)}`}
        </OphTypography>
      </Stack>
      <Stack direction="column" width="100%" spacing={theme.spacing(2, 3)}>
        <OphTypography data-testid="hakemusotsikko-kirjauspvm">
          {`${t('filemaker.kirjauspvm')}: ${getters.kirjauspvm(hakemus)}`}
        </OphTypography>
        <OphTypography data-testid="hakemusotsikko-esittelypvm">
          {`${t('filemaker.esittelypvm')}: ${getters.esittelypvm(hakemus)}`}
        </OphTypography>
      </Stack>
      <Stack
        direction="column"
        width="100%"
        spacing={theme.spacing(2, 3)}
      ></Stack>
    </Stack>
  );
};

export default FilemakerHeader;
