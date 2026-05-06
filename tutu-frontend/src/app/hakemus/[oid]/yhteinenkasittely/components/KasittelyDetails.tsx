import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import {
  Box,
  Button,
  AccordionDetails,
  useTheme,
  Typography,
  Stack,
} from '@mui/material';
import {
  OphTypography,
  OphInputFormField,
} from '@opetushallitus/oph-design-system';
import React from 'react';

import { formatHelsinki } from '@/src/lib/dateUtils';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import { DEFAULT_BOX_BORDER } from '@/src/lib/theme';
import { User } from '@/src/lib/types/user';
import { YhteinenKasittely } from '@/src/lib/types/yhteinenkasittely';

interface KasittelyDetailsProps {
  kasittely: YhteinenKasittely;
  answers: Record<string, string>;
  handleOpenModal: (parent?: YhteinenKasittely) => void;
  handleChange: (id: string, value: string) => void;
  handleSend: (id: string) => void;
  user: User | null;
}

const vastaamatonKysymysMinulle = (
  user: User | null,
  kasittely: YhteinenKasittely,
) => {
  if (!user) {
    return false;
  }
  return !kasittely.vastaus && user.userOid === kasittely.vastaanottajaOid;
};

export const KasittelyDetails: React.FC<KasittelyDetailsProps> = ({
  kasittely,
  answers,
  handleOpenModal,
  handleChange,
  handleSend,
  user,
}) => {
  const theme = useTheme();
  const { t } = useTranslations();

  return (
    <AccordionDetails data-testid={`kasittely-details-${kasittely.id}`}>
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
        {vastaamatonKysymysMinulle(user, kasittely) ? (
          <OphInputFormField
            label={`${t('hakemus.yhteinenkasittely.tyoparinVastaus')} *`}
            fullWidth
            multiline
            minRows={4}
            value={answers[kasittely.id!] ?? ''}
            disabled={Boolean(kasittely.vastaus)}
            onChange={(e) => handleChange(kasittely.id!, e.target.value)}
            sx={{ width: '90%' }}
            data-testid={`kysymys-details-${kasittely.id}__vastaus-field`}
          />
        ) : (
          <>
            <Typography>{kasittely.vastaus ?? ''}</Typography>
            <Stack direction="row" sx={{ mt: 2 }}>
              <InfoOutlinedIcon sx={{ mr: 1 }} />
              <Typography sx={{ mr: 1 }}>
                {t('hakemus.yhteinenkasittely.vastauksenLahetti.label')}
              </Typography>
              <Typography
                sx={{ mr: 1 }}
              >{`${kasittely.vastaanottaja},`}</Typography>
              <Typography sx={{ mr: 1 }}>
                {kasittely.vastattu
                  ? formatHelsinki(kasittely.vastattu, 'd.M.yyyy HH:mm')
                  : ''}
              </Typography>
            </Stack>
          </>
        )}

        <Box sx={{ marginTop: theme.spacing(4) }}>
          {vastaamatonKysymysMinulle(user, kasittely) ? (
            <Button
              variant="contained"
              disabled={!answers[kasittely.id!]}
              onClick={() => handleSend(kasittely.id!)}
              data-testid={`kysymys-details-${kasittely.id}__vastaus-send`}
            >
              {t('hakemus.yhteinenkasittely.lahetaVastaus')}
            </Button>
          ) : null}
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
            data-testid={`kysymys-details-${jatkoKasittely.id}`}
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
          {vastaamatonKysymysMinulle(user, jatkoKasittely) ? (
            <OphInputFormField
              label={`${t('hakemus.yhteinenkasittely.tyoparinVastaus')} *`}
              fullWidth
              multiline
              minRows={4}
              value={
                jatkoKasittely.vastaus ?? answers[jatkoKasittely.id!] ?? ''
              }
              disabled={Boolean(jatkoKasittely.vastaus)}
              onChange={(e) => handleChange(jatkoKasittely.id!, e.target.value)}
              sx={{ width: '90%' }}
              data-testid={`kysymys-details-${jatkoKasittely.id}__vastaus-field`}
            />
          ) : (
            <>
              <Typography>{jatkoKasittely.vastaus ?? ''}</Typography>
              <Stack direction="row" sx={{ mt: 2 }}>
                <InfoOutlinedIcon sx={{ mr: 1 }} />
                <Typography sx={{ mr: 1 }}>
                  {t('hakemus.yhteinenkasittely.vastauksenLahetti.label')}
                </Typography>
                <Typography
                  sx={{ mr: 1 }}
                >{`${jatkoKasittely.vastaanottaja},`}</Typography>
                <Typography sx={{ mr: 1 }}>
                  {jatkoKasittely.vastattu
                    ? formatHelsinki(jatkoKasittely.vastattu, 'd.M.yyyy HH:mm')
                    : ''}
                </Typography>
              </Stack>
            </>
          )}

          <Box sx={{ marginTop: theme.spacing(4) }}>
            {vastaamatonKysymysMinulle(user, jatkoKasittely) ? (
              <Button
                variant="contained"
                disabled={!answers[jatkoKasittely.id!]}
                onClick={() => handleSend(jatkoKasittely.id!)}
                data-testid={`kysymys-details-${jatkoKasittely.id}__vastaus-send`}
              >
                {t('hakemus.yhteinenkasittely.lahetaVastaus')}
              </Button>
            ) : null}
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
        <Button variant="outlined" onClick={() => handleOpenModal(kasittely)}>
          {t('hakemus.yhteinenkasittely.kysyToiseltaTyoparilta')}
        </Button>
      </Box>
    </AccordionDetails>
  );
};
