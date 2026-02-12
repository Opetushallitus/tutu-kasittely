import { Box, Button, AccordionDetails, useTheme } from '@mui/material';
import {
  OphTypography,
  OphInputFormField,
} from '@opetushallitus/oph-design-system';
import React from 'react';

import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import { DEFAULT_BOX_BORDER } from '@/src/lib/theme';
import { YhteinenKasittely } from '@/src/lib/types/yhteinenkasittely';

interface KasittelyDetailsProps {
  kasittely: YhteinenKasittely;
  answers: Record<string, string>;
  handleChange: (id: string, value: string) => void;
  handleSend: (id: string) => void;
}

export const KasittelyDetails: React.FC<KasittelyDetailsProps> = ({
  kasittely,
  answers,
  handleChange,
  handleSend,
}) => {
  const theme = useTheme();
  const { t } = useTranslations();

  return (
    <AccordionDetails>
      <Box sx={{ paddingLeft: theme.spacing(0.5) }}>
        <OphTypography variant="body1" sx={{ fontWeight: 600 }}>
          {t('hakemus.yhteinenkasittely.kysymysTyoparille')}
        </OphTypography>
        <OphTypography
          variant="body1"
          sx={{ marginBottom: theme.spacing(4) }}
          data-testid={`kysymys-details-${kasittely.id}`}
        >
          {kasittely.kysymys}
        </OphTypography>
        <OphTypography variant="body1" sx={{ fontWeight: 600 }}>
          {t('hakemus.yhteinenkasittely.tyopari')}
        </OphTypography>
        <OphTypography variant="body1" sx={{ marginBottom: theme.spacing(4) }}>
          {kasittely.vastaanottaja}
        </OphTypography>
        <OphInputFormField
          label={`${t('hakemus.yhteinenkasittely.tyoparinVastaus')} *`}
          fullWidth
          multiline
          minRows={4}
          value={kasittely.vastaus ?? answers[kasittely.id!] ?? ''}
          disabled={Boolean(kasittely.vastaus)}
          onChange={(e) => handleChange(kasittely.id!, e.target.value)}
          sx={{ width: '90%' }}
        />
        <Box sx={{ marginTop: theme.spacing(4) }}>
          <Button variant="contained" onClick={() => handleSend(kasittely.id!)}>
            {t('hakemus.yhteinenkasittely.lahetaVastaus')}
          </Button>
        </Box>
      </Box>

      {kasittely.jatkoKasittelyt?.map((jatkoKasittely) => (
        <Box
          key={jatkoKasittely.id}
          sx={{
            borderTop: DEFAULT_BOX_BORDER,
            marginTop: theme.spacing(4),
            paddingTop: theme.spacing(4),
            paddingLeft: theme.spacing(0.5),
          }}
        >
          <OphTypography variant="body1" sx={{ fontWeight: 600 }}>
            {t('hakemus.yhteinenkasittely.kysymysTyoparille')}
          </OphTypography>
          <OphTypography
            variant="body1"
            sx={{ marginBottom: theme.spacing(4) }}
          >
            {jatkoKasittely.kysymys}
          </OphTypography>
          <OphTypography variant="body1" sx={{ fontWeight: 600 }}>
            {t('hakemus.yhteinenkasittely.tyopari')}
          </OphTypography>
          <OphTypography
            variant="body1"
            sx={{ marginBottom: theme.spacing(4) }}
          >
            {jatkoKasittely.vastaanottaja}
          </OphTypography>
          <OphInputFormField
            label={`${t('hakemus.yhteinenkasittely.tyoparinVastaus')} *`}
            fullWidth
            multiline
            minRows={4}
            value={jatkoKasittely.vastaus ?? answers[jatkoKasittely.id!] ?? ''}
            disabled={Boolean(jatkoKasittely.vastaus)}
            onChange={(e) => handleChange(jatkoKasittely.id!, e.target.value)}
            sx={{ width: '90%' }}
          />
          <Box sx={{ marginTop: theme.spacing(4) }}>
            <Button
              variant="contained"
              onClick={() => handleSend(jatkoKasittely.id!)}
            >
              {t('hakemus.yhteinenkasittely.lahetaVastaus')}
            </Button>
          </Box>
        </Box>
      ))}
      <Box
        sx={{
          borderTop: DEFAULT_BOX_BORDER,
          marginTop: theme.spacing(4),
          marginBottom: theme.spacing(2),
          paddingTop: theme.spacing(4),
          paddingLeft: theme.spacing(0.5),
        }}
      >
        <Button
          variant="outlined"
          onClick={() => console.log('Kysy toiselta työparilta')}
        >
          {t('hakemus.yhteinenkasittely.kysyToiseltaTyoparilta')}
        </Button>
      </Box>
    </AccordionDetails>
  );
};
