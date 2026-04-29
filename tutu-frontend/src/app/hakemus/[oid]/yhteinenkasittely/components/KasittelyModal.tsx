import { Box, Modal, Stack } from '@mui/material';
import {
  OphTypography,
  OphInputFormField,
  OphButton,
  OphSelectFormField,
  ophColors,
} from '@opetushallitus/oph-design-system';
import React from 'react';

import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import { Esittelija } from '@/src/lib/types/esittelija';
import { YhteinenKasittely } from '@/src/lib/types/yhteinenkasittely';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  minWidth: 800,
  bgcolor: ophColors.white,
  border: `00px solid ${ophColors.white}`,
  boxShadow: 24,
  p: 3,
};

interface UusiKasittelyModalProps {
  esittelijat: Esittelija[];
  open: boolean;
  handleClose: () => void;
  handleSend: () => void;
  setTyopari: (tyopariId?: string) => void;
  setKysymys: (kysymys: string) => void;
}

export const UusiKasittelyModal: React.FC<UusiKasittelyModalProps> = ({
  esittelijat,
  open,
  handleClose,
  handleSend,
  setTyopari,
  setKysymys,
}) => {
  const { t } = useTranslations();
  return (
    <Modal
      open={open}
      onClose={handleClose}
      data-testid="vahvistettu-viesti-modal"
      aria-labelledby="hakemus.yhteinenkasittely.uusiKasittely.title"
      aria-describedby="hakemus.yhteinenkasittely.uusiKasittely.body"
      role="dialog"
    >
      <Box sx={modalStyle}>
        <Stack
          sx={{ height: '100%' }}
          direction="column"
          gap={2}
          justifyContent="space-between"
        >
          <OphTypography
            id="hakemus.yhteinenkasittely.uusiKasittely.title"
            variant="h2"
          >
            {t('hakemus.yhteinenkasittely.uusiKasittely.title')}
          </OphTypography>
          <OphTypography
            id="hakemus.yhteinenkasittely.uusiKasittely.body"
            variant="body1"
          >
            {t('hakemus.yhteinenkasittely.uusiKasittely.body')}
          </OphTypography>
          <OphSelectFormField
            label={t('hakemus.yhteinenkasittely.uusiKasittely.tyopari')}
            placeholder={t('yleiset.valitse')}
            onChange={(e) => setTyopari(e.target.value)}
            data-testid="yhteinenkasittely-uusiKasittely-tyopari"
            options={esittelijat.map((esittelija) => ({
              value: esittelija.esittelijaOid,
              label: `${esittelija.etunimi} ${esittelija.sukunimi}`.trim(),
            }))}
          />
          <OphInputFormField
            multiline
            minRows={4}
            label={t(
              'hakemus.yhteinenkasittely.uusiKasittely.kysymysTyoparille',
            )}
            onChange={(e) => setKysymys(e.target.value)}
            data-testid="yhteinenkasittely-uusiKasittely-kysymys"
          />
          <Stack justifyContent="flex-end" direction="row" gap={2}>
            <OphButton onClick={handleClose}>{t('yleiset.peruuta')}</OphButton>
            <OphButton
              variant="contained"
              onClick={handleSend}
              data-testid="yhteinenkasittely-uusiKasittely-laheta"
            >
              {t('hakemus.yhteinenkasittely.uusiKasittely.laheta')}
            </OphButton>
          </Stack>
        </Stack>
      </Box>
    </Modal>
  );
};

interface JatkoKasittelyModalProps {
  parentKasittely: YhteinenKasittely;
  esittelijat: Esittelija[];
  open: boolean;
  handleClose: () => void;
  handleSend: () => void;
  setTyopari: (tyopariId?: string) => void;
  setKysymys: (kysymys: string) => void;
}

export const JatkoKasittelyModal: React.FC<JatkoKasittelyModalProps> = ({
  parentKasittely,
  esittelijat,
  open,
  handleClose,
  handleSend,
  setTyopari,
  setKysymys,
}) => {
  const { t } = useTranslations();

  const filteredEsittelijat = esittelijat.filter(
    (esittelija) =>
      esittelija.esittelijaOid !== parentKasittely.vastaanottajaOid,
  );

  return (
    <Modal
      open={open}
      onClose={handleClose}
      data-testid="vahvistettu-viesti-modal"
      aria-labelledby="hakemus.yhteinenkasittely.jatkoKasittely.title"
      aria-describedby="hakemus.yhteinenkasittely.jatkoKasittely.body"
      role="dialog"
    >
      <Box sx={modalStyle}>
        <Stack
          sx={{ height: '100%' }}
          direction="column"
          gap={2}
          justifyContent="space-between"
        >
          <OphTypography
            id="hakemus.yhteinenkasittely.jatkoKasittely.title"
            variant="h2"
          >
            {t('hakemus.yhteinenkasittely.jatkoKasittely.title')}
          </OphTypography>
          <OphTypography
            id="hakemus.yhteinenkasittely.jatkoKasittely.body"
            variant="body1"
          >
            {t('hakemus.yhteinenkasittely.jatkoKasittely.body')}
          </OphTypography>
          <OphSelectFormField
            label={t('hakemus.yhteinenkasittely.uusiKasittely.tyopari')}
            placeholder={t('yleiset.valitse')}
            onChange={(e) => setTyopari(e.target.value)}
            data-testid="yhteinenkasittely-jatkoKasittely-tyopari"
            options={filteredEsittelijat.map((esittelija) => ({
              value: esittelija.esittelijaOid,
              label: `${esittelija.etunimi} ${esittelija.sukunimi}`.trim(),
            }))}
          />

          <OphTypography variant="h2">
            {t('hakemus.yhteinenkasittely.jatkoKasittely.alkuperainenKysymys')}
          </OphTypography>
          <OphTypography variant="body1">
            {parentKasittely.kysymys}
          </OphTypography>

          <OphInputFormField
            multiline
            minRows={4}
            label={t(
              'hakemus.yhteinenkasittely.jatkoKasittely.kysymysTyoparille',
            )}
            onChange={(e) => setKysymys(e.target.value)}
            data-testid="yhteinenkasittely-jatkoKasittely-kysymys"
          />
          <Stack justifyContent="flex-end" direction="row" gap={2}>
            <OphButton onClick={handleClose}>{t('yleiset.peruuta')}</OphButton>
            <OphButton
              variant="contained"
              onClick={handleSend}
              data-testid="yhteinenkasittely-uusiKasittely-laheta"
            >
              {t('hakemus.yhteinenkasittely.uusiKasittely.laheta')}
            </OphButton>
          </Stack>
        </Stack>
      </Box>
    </Modal>
  );
};

interface KasittelyModalProps {
  parentKasittely?: YhteinenKasittely;
  esittelijat: Esittelija[];
  open: boolean;
  handleClose: () => void;
  handleSend: () => void;
  setTyopari: (tyopariId?: string) => void;
  setKysymys: (kysymys: string) => void;
}

export const KasittelyModal: React.FC<KasittelyModalProps> = ({
  parentKasittely,
  esittelijat,
  open,
  handleClose,
  handleSend,
  setTyopari,
  setKysymys,
}) => {
  return !parentKasittely ? (
    <UusiKasittelyModal
      esittelijat={esittelijat}
      open={open}
      handleClose={handleClose}
      handleSend={handleSend}
      setTyopari={setTyopari}
      setKysymys={setKysymys}
    />
  ) : (
    <JatkoKasittelyModal
      parentKasittely={parentKasittely}
      esittelijat={esittelijat}
      open={open}
      handleClose={handleClose}
      handleSend={handleSend}
      setTyopari={setTyopari}
      setKysymys={setKysymys}
    />
  );
};
