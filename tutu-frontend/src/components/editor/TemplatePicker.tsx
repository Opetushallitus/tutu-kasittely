import CloseIcon from '@mui/icons-material/Close';
import { Stack } from '@mui/material';
import { OphButton, OphTypography } from '@opetushallitus/oph-design-system';

import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';

export function TemplatePicker({
  toggleTemplates,
}: {
  toggleTemplates: () => void;
}) {
  const { t } = useTranslations();

  return (
    <div>
      <Stack direction="row">
        <OphTypography variant={'h3'}>
          {t('hakemus.editori.paatos.valitse.paatospohja')}
        </OphTypography>
        <OphButton
          variant={'text'}
          onClick={toggleTemplates}
          startIcon={<CloseIcon />}
        >
          {t('yleiset.sulje')}
        </OphButton>
      </Stack>
    </div>
  );
}
