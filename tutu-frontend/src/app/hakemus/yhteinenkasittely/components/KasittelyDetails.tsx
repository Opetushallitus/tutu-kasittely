import AccessTimeFilledIcon from '@mui/icons-material/AccessTimeFilled';
import { Box, Button, AccordionDetails, useTheme } from '@mui/material';
import {
  OphTypography,
  ophColors,
  OphInputFormField,
} from '@opetushallitus/oph-design-system';
import React from 'react';

import { useEsittelijat } from '@/src/hooks/useEsittelijat';
import { formatHelsinki } from '@/src/lib/dateUtils';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import { DEFAULT_BOX_BORDER } from '@/src/lib/theme';
import { User } from '@/src/lib/types/user';
import { Viesti, YhteinenKasittely } from '@/src/lib/types/yhteinenkasittely';

interface KasittelyDetailsProps {
  kasittely: YhteinenKasittely;
  answers: Record<string, string>;
  handleOpenModal: (parent?: YhteinenKasittely) => void;
  handleChange: (id: string, value: string) => void;
  handleSend: (id: string, laheta?: boolean) => void;
  user: User | null;
}

enum ViestinYTyyppi {
  kysymys,
  vastaus,
  lisakysymys,
}

const vastaamatonKysymysMinulle = (
  user: User | null,
  kasittely: YhteinenKasittely,
) => {
  if (!user) {
    return false;
  }
  const viimeinenViestiOnKysymys =
    kasittely.jatkoKasittelyt?.length === 0 &&
    kasittely.jatkoKasittelyt?.length % 2 === 0;

  const viimeisinViesti =
    kasittely.jatkoKasittelyt?.length === 0
      ? kasittely.aloitusViesti
      : kasittely.jatkoKasittelyt?.at(-1);

  if (
    viimeinenViestiOnKysymys &&
    viimeisinViesti?.vastaanottajaOid === user.userOid
  ) {
    return true;
  }
  return false;
};

export const KasittelyDetails: React.FC<KasittelyDetailsProps> = ({
  kasittely,
  answers,
  handleOpenModal,
  handleSend,
  handleChange,
  user,
}) => {
  const theme = useTheme();
  const { t } = useTranslations();
  const vastaamatta = vastaamatonKysymysMinulle(user, kasittely);

  return (
    <AccordionDetails
      data-testid={`kasittely-details-${kasittely.aloitusViesti.id}`}
      sx={{ width: '100%' }}
    >
      <ViestiBox viesti={kasittely.aloitusViesti} index={-1} />
      {kasittely.jatkoKasittelyt?.map((jatkoKasittely, index) => (
        <ViestiBox viesti={jatkoKasittely} index={index} />
      ))}
      {vastaamatta && (
        <VastausInput
          id={kasittely.aloitusViesti.id || ''}
          answers={answers}
          handleSend={handleSend}
          handleChange={handleChange}
          user={user}
        />
      )}
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

interface VastausInputProps {
  id: string;
  answers: Record<string, string>;
  handleSend: (id: string, laheta?: boolean) => void;
  handleChange: (id: string, value: string) => void;
  user: User | null;
}

const VastausInput: React.FC<VastausInputProps> = ({
  id,
  answers,
  handleSend,
  handleChange,
  user,
}) => {
  const { t } = useTranslations();
  const { data: esittelijat } = useEsittelijat();

  const vastaaja = esittelijat.find(
    (esittelija) => esittelija.esittelijaOid === user?.userOid,
  );
  const name = `${vastaaja?.etunimi} ${vastaaja?.sukunimi}`;
  const vastausToShow: string | undefined = answers[id];
  const backgroundColor = `rgba(${parseInt(ophColors.lightBlue2.slice(1, 3), 16)}, ${parseInt(
    ophColors.lightBlue2.slice(3, 5),
    16,
  )}, ${parseInt(ophColors.lightBlue2.slice(5, 7), 16)}, 0.25)`;

  return (
    <React.Fragment key={id}>
      <Box
        sx={{
          border: DEFAULT_BOX_BORDER,
          borderRadius: '4px',
          padding: '16px',
          width: '85%',
          marginBottom: '24px',
          marginLeft: '20px',
          backgroundColor: backgroundColor,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          <OphTypography variant="body1" sx={{ fontWeight: 600 }}>
            {t('hakemus.yhteinenkasittely.tyoparinVastaus')}
          </OphTypography>
          <Box sx={{ display: 'flex', flexDirection: 'row' }}>
            <OphTypography
              variant="body1"
              sx={{ color: ophColors.grey700, paddingRight: '5px' }}
            >
              {name}
            </OphTypography>
            <AccessTimeFilledIcon sx={{ color: ophColors.yellow1 }} />
            <OphTypography
              variant="body1"
              sx={{ color: ophColors.grey700, paddingLeft: '5px' }}
            >
              {t('yhteinenKasittely.vastaamatta')}
            </OphTypography>
          </Box>
        </Box>
        <OphInputFormField
          fullWidth
          multiline
          minRows={4}
          value={vastausToShow ?? ''}
          onChange={(e) => handleChange(id!, e.target.value)}
          sx={{ width: '100%', marginTop: '5px' }}
          data-testid={`kysymys-details-${id}__vastaus-field`}
        />
        <Box sx={{ marginTop: '16px' }}>
          <Button
            variant="contained"
            onClick={() => handleSend(id!, true)}
            data-testid={`kysymys-details-${id}__vastaus-send`}
          >
            {t('hakemus.yhteinenkasittely.lahetaVastaus')}
          </Button>
        </Box>
      </Box>
    </React.Fragment>
  );
};

interface ViestiProps {
  viesti: Viesti;
  index: number;
}

const ViestiBox: React.FC<ViestiProps> = ({ viesti, index }) => {
  useTheme();
  const { t } = useTranslations();

  const nameDate = `${viesti.lahettaja} ${formatHelsinki(viesti.luotu || '', 'd.M.yyyy HH:mm')}`;
  let tyyppi: ViestinYTyyppi;

  if (index < 0) {
    tyyppi = ViestinYTyyppi.kysymys;
  } else if (index % 2 === 0) {
    tyyppi = ViestinYTyyppi.vastaus;
  } else {
    tyyppi = ViestinYTyyppi.lisakysymys;
  }

  const viestiMargin =
    tyyppi === ViestinYTyyppi.kysymys || tyyppi === ViestinYTyyppi.lisakysymys
      ? 0
      : '20px';

  return (
    <React.Fragment key={viesti.id}>
      <Box
        sx={{
          border: DEFAULT_BOX_BORDER,
          borderRadius: '4px',
          padding: '16px',
          width: '85%',
          marginBottom: '24px',
          marginLeft: viestiMargin,
          backgroundColor:
            tyyppi === ViestinYTyyppi.vastaus
              ? `rgba(${parseInt(ophColors.lightBlue2.slice(1, 3), 16)}, ${parseInt(ophColors.lightBlue2.slice(3, 5), 16)}, ${parseInt(ophColors.lightBlue2.slice(5, 7), 16)}, 0.75)`
              : ophColors.white,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            width: '100%',
            marginBottom: '16px',
          }}
        >
          <OphTypography variant="body1" sx={{ fontWeight: 600 }}>
            {t(`hakemus.yhteinenkasittely.tyyppi.${ViestinYTyyppi[tyyppi]}`)}
          </OphTypography>
          <OphTypography variant="body1" sx={{ color: ophColors.grey700 }}>
            {nameDate}
          </OphTypography>
        </Box>
        {viesti.viesti}
      </Box>
    </React.Fragment>
  );
};
