import AccessTimeFilledIcon from '@mui/icons-material/AccessTimeFilled';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { Box, Button, AccordionDetails, useTheme, Link } from '@mui/material';
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
import {
  Viesti,
  YhteinenKasittely,
  YkViestiTyyppi,
} from '@/src/lib/types/yhteinenkasittely';

interface KasittelyDetailsProps {
  kasittely: YhteinenKasittely;
  handleOpenModal: (parent?: YhteinenKasittely, viesti?: Viesti) => void;
  handleOpenEditModal: (viesti?: Viesti) => void;
  handleChange: (
    { id, parentId }: { id?: string; parentId?: string },
    value: string,
  ) => void;
  handleSend: (
    { id, parentId }: { id?: string; parentId?: string },
    laheta?: boolean,
  ) => void;
  user: User | null;
}

const vastaamatonKysymysMinulle = (
  user: User | null,
  kasittely: YhteinenKasittely,
) => {
  if (!user) {
    return false;
  }

  const viestit: Viesti[] = [
    kasittely.aloitusViesti,
    ...(kasittely.jatkoKasittelyt || []),
  ];

  const viimeisinKysymysMinulle = viestit.findLastIndex(
    (viesti: Viesti) =>
      viesti.tyyppi !== 'vastaus' &&
      viesti.vastaanottajaOid === user.userOid &&
      !!viesti.lahetetty,
  );
  const viimeisinVastaukseni = viestit.findLastIndex(
    (viesti: Viesti) =>
      viesti.tyyppi === 'vastaus' &&
      viesti.lahettajaOid === user.userOid &&
      !!viesti.lahetetty,
  );

  return viimeisinKysymysMinulle > viimeisinVastaukseni;
};

export const KasittelyDetails: React.FC<KasittelyDetailsProps> = ({
  kasittely,
  handleOpenModal,
  handleOpenEditModal,
  handleSend,
  handleChange,
  user,
}) => {
  const theme = useTheme();
  const { t } = useTranslations();

  const keskenerainenVastaus: Viesti | undefined =
    kasittely.jatkoKasittelyt?.find(
      (viesti: Viesti) =>
        viesti.lahettajaOid === user?.userOid &&
        !viesti.lahetetty &&
        viesti.tyyppi === 'vastaus',
    );

  return (
    <AccordionDetails
      data-testid={`kasittely-details-${kasittely.aloitusViesti.id}`}
      sx={{ width: '100%' }}
    >
      <ViestiBox
        viesti={kasittely.aloitusViesti}
        index={-1}
        openEditModal={handleOpenEditModal}
      />
      {kasittely.jatkoKasittelyt
        ?.filter((viesti: Viesti) => viesti !== keskenerainenVastaus)
        .map((jatkoKasittely, index) => (
          <ViestiBox
            key={jatkoKasittely.id}
            viesti={jatkoKasittely}
            index={index}
            openEditModal={handleOpenEditModal}
          />
        ))}
      {vastaamatonKysymysMinulle(user, kasittely) && (
        <VastausInput
          aloitusViesti={kasittely.aloitusViesti}
          viesti={keskenerainenVastaus}
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
  aloitusViesti: Viesti;
  viesti?: Viesti;
  handleSend: (
    { id, parentId }: { id?: string; parentId?: string },
    laheta?: boolean,
  ) => void;
  handleChange: (
    { id, parentId }: { id?: string; parentId?: string },
    value: string,
  ) => void;
  user: User | null;
}

const VastausInput: React.FC<VastausInputProps> = ({
  aloitusViesti,
  viesti,
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
  const vastausToShow: string | undefined = viesti?.viesti;
  const backgroundColor = `rgba(${parseInt(ophColors.lightBlue2.slice(1, 3), 16)}, ${parseInt(
    ophColors.lightBlue2.slice(3, 5),
    16,
  )}, ${parseInt(ophColors.lightBlue2.slice(5, 7), 16)}, 0.25)`;

  return (
    <React.Fragment key={`${viesti?.id || aloitusViesti.id!}--vastaus`}>
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
          defaultValue={vastausToShow ?? ''}
          onChange={(e) =>
            handleChange(
              { id: viesti?.id, parentId: aloitusViesti.id },
              e.target.value,
            )
          }
          sx={{ width: '100%', marginTop: '5px' }}
          data-testid={`kysymys-details-${aloitusViesti.id}__vastaus-field`}
        />
        <Box sx={{ marginTop: '16px' }}>
          <Button
            variant="contained"
            onClick={() =>
              handleSend({ id: viesti?.id, parentId: aloitusViesti.id }, true)
            }
            data-testid={`kysymys-details-${aloitusViesti.id}__vastaus-send`}
          >
            {t('hakemus.yhteinenkasittely.lahetaVastaus')}
          </Button>
          <Button
            variant="outlined"
            onClick={() =>
              handleSend({ id: viesti?.id, parentId: aloitusViesti.id }, false)
            }
            data-testid={`kysymys-details-${aloitusViesti.id}__vastaus-save`}
          >
            {t('hakemus.yhteinenkasittely.uusiKasittely.tallenna')}
          </Button>
        </Box>
      </Box>
    </React.Fragment>
  );
};

interface ViestiProps {
  viesti: Viesti;
  index: number;
  openEditModal: (viesti?: Viesti) => void;
}

const ViestiBox: React.FC<ViestiProps> = ({ viesti, openEditModal }) => {
  useTheme();
  const { t } = useTranslations();

  const nameIcon = viesti.lahetetty ? undefined : (
    <AccessTimeFilledIcon sx={{ color: ophColors.yellow1 }} />
  );
  const timeLabel = viesti.lahetetty
    ? ''
    : t(`hakemus.yhteinenkasittely.details.keskenLabel`);
  const nameDate =
    `${viesti.lahettaja} ${timeLabel} ${formatHelsinki(viesti.luotu || '', 'd.M.yyyy HH:mm')}`.trim();
  const viestiMargin =
    viesti.tyyppi === YkViestiTyyppi.kysymys ||
    viesti.tyyppi === YkViestiTyyppi.jatkokysymys
      ? 0
      : '20px';

  const tyyppiLabel = viesti.lahetetty ? (
    <OphTypography variant="body1" sx={{ fontWeight: 600 }}>
      {t(`hakemus.yhteinenkasittely.tyyppi.${YkViestiTyyppi[viesti.tyyppi]}`)}
    </OphTypography>
  ) : (
    <Link
      sx={{
        display: 'flex',
        alignContent: 'center',
        gap: '0.5em',
      }}
      component="button"
      onClick={() => openEditModal(viesti)}
    >
      <EditOutlinedIcon />
      <span>
        {t(`hakemus.yhteinenkasittely.tyyppi.${YkViestiTyyppi[viesti.tyyppi]}`)}
      </span>
    </Link>
  );

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
            viesti.tyyppi === YkViestiTyyppi.vastaus
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
          {tyyppiLabel}
          <OphTypography
            variant="body1"
            sx={{
              color: ophColors.grey700,
              display: 'flex',
              alignItems: 'center',
              textWrap: 'nowrap',
            }}
          >
            {nameIcon}
            {nameDate}
          </OphTypography>
        </Box>
        {viesti.viesti}
      </Box>
    </React.Fragment>
  );
};
