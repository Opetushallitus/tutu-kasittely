import { Box, Button, AccordionDetails, useTheme } from '@mui/material';
import {
  OphTypography,
  OphInputFormField,
} from '@opetushallitus/oph-design-system';
import React from 'react';

import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import { DEFAULT_BOX_BORDER } from '@/src/lib/theme';

export type Kysymys = {
  id: string;
  sender: string;
  question: string;
  timestamp: string;
  relatedQuestions?: Kysymys[];
};

interface KysymysDetailsProps {
  kysymys: Kysymys;
  answers: Record<string, string>;
  handleChange: (id: string, value: string) => void;
  handleSend: (id: string) => void;
}

export const KysymysDetails: React.FC<KysymysDetailsProps> = ({
  kysymys,
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
          data-testid={`kysymys-details-${kysymys.id}`}
        >
          {kysymys.question}
        </OphTypography>
        <OphTypography variant="body1" sx={{ fontWeight: 600 }}>
          {t('hakemus.yhteinenkasittely.tyopari')}
        </OphTypography>
        <OphTypography variant="body1" sx={{ marginBottom: theme.spacing(4) }}>
          {kysymys.sender}
        </OphTypography>
        <OphInputFormField
          label={`${t('hakemus.yhteinenkasittely.tyoparinVastaus')} *`}
          fullWidth
          multiline
          minRows={4}
          value={answers[kysymys.id] || ''}
          onChange={(e) => handleChange(kysymys.id, e.target.value)}
          sx={{ width: '90%' }}
        />
        <Box sx={{ marginTop: theme.spacing(4) }}>
          <Button variant="contained" onClick={() => handleSend(kysymys.id)}>
            {t('hakemus.yhteinenkasittely.lahetaVastaus')}
          </Button>
        </Box>
      </Box>

      {kysymys.relatedQuestions?.map((relatedQuestion) => (
        <Box
          key={relatedQuestion.id}
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
            {relatedQuestion.question}
          </OphTypography>
          <OphTypography variant="body1" sx={{ fontWeight: 600 }}>
            {t('hakemus.yhteinenkasittely.tyopari')}
          </OphTypography>
          <OphTypography
            variant="body1"
            sx={{ marginBottom: theme.spacing(4) }}
          >
            {relatedQuestion.sender}
          </OphTypography>
          <OphInputFormField
            label={`${t('hakemus.yhteinenkasittely.tyoparinVastaus')} *`}
            fullWidth
            multiline
            minRows={4}
            value={answers[relatedQuestion.id] || ''}
            onChange={(e) => handleChange(relatedQuestion.id, e.target.value)}
            sx={{ width: '90%' }}
          />
          <Box sx={{ marginTop: theme.spacing(4) }}>
            <Button
              variant="contained"
              onClick={() => handleSend(relatedQuestion.id)}
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
