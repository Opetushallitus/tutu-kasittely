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
  handleSend: (id: string, laheta?: boolean) => void;
  user: User | null;
}

const vastaamatonKysymysMinulle = (
  user: User | null,
  kasittely: YhteinenKasittely,
) => {
  if (!user) {
    return false;
  }
  return !kasittely.vastattu && user.userOid === kasittely.vastaanottajaOid;
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
      <KysymysJaVastaus
        kasittely={kasittely}
        answers={answers}
        handleChange={handleChange}
        handleSend={handleSend}
        user={user}
      />
      {kasittely.jatkoKasittelyt?.map((jatkoKasittely) => (
        <KysymysJaVastaus
          key={jatkoKasittely.id}
          kasittely={jatkoKasittely}
          answers={answers}
          handleChange={handleChange}
          handleSend={handleSend}
          user={user}
        />
      ))}
      <Box
        sx={{
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

interface KysymysJaVastausProps {
  kasittely: YhteinenKasittely;
  answers: Record<string, string>;
  handleChange: (id: string, value: string) => void;
  handleSend: (id: string, laheta?: boolean) => void;
  user: User | null;
}

const KysymysJaVastaus: React.FC<KysymysJaVastausProps> = ({
  kasittely,
  answers,
  handleChange,
  handleSend,
  user,
}) => {
  const theme = useTheme();
  const { t } = useTranslations();

  const vastausToShow: string | undefined =
    answers[kasittely.id!] ?? kasittely.vastaus;

  return (
    <React.Fragment key={kasittely.id}>
      <Box
        sx={{
          borderBottom: DEFAULT_BOX_BORDER,
          paddingBottom: theme.spacing(4),
          paddingLeft: theme.spacing(0.5),
        }}
      >
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
        <OphTypography variant="body1">{kasittely.vastaanottaja}</OphTypography>
        {vastaamatonKysymysMinulle(user, kasittely) ? (
          <OphInputFormField
            label={`${t('hakemus.yhteinenkasittely.tyoparinVastaus')} *`}
            fullWidth
            multiline
            minRows={4}
            value={vastausToShow ?? ''}
            onChange={(e) => handleChange(kasittely.id!, e.target.value)}
            sx={{ width: '90%', marginTop: theme.spacing(4) }}
            data-testid={`kysymys-details-${kasittely.id}__vastaus-field`}
          />
        ) : (
          kasittely.vastattu && (
            <>
              <Typography sx={{ marginTop: theme.spacing(4) }}>
                {kasittely.vastaus ?? ''}
              </Typography>
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
          )
        )}

        {vastaamatonKysymysMinulle(user, kasittely) ? (
          <Box sx={{ marginTop: theme.spacing(4) }}>
            <Button
              variant="contained"
              disabled={!vastausToShow}
              onClick={() => handleSend(kasittely.id!)}
              data-testid={`kysymys-details-${kasittely.id}__vastaus-send`}
            >
              {t('hakemus.yhteinenkasittely.lahetaVastaus')}
            </Button>
          </Box>
        ) : null}
      </Box>
    </React.Fragment>
  );
};
