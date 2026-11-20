import { Box, Modal, Stack } from '@mui/material';
import {
  OphTypography,
  OphInputFormField,
  OphButton,
  ophColors,
} from '@opetushallitus/oph-design-system';
import React, { useEffect, useState } from 'react';

import { OphSelectFormFieldPatched } from '@/src/components/OphSelectFormFieldPatched';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import { Esittelija } from '@/src/lib/types/esittelija';
import {
  Viesti,
  YhteinenKasittely,
  YkViestiAihe,
} from '@/src/lib/types/yhteinenkasittely';

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
  viesti?: Viesti;
  esittelijat: Esittelija[];
  aiheet: YkViestiAihe[];
  open: boolean;
  handleClose: () => void;
  handleSend: (laheta: boolean) => void;
  setTyopari: (tyopariId?: string) => void;
  setKysymys: (kysymys: string) => void;
  setAihe: (aiheId?: string) => void;
}

export const UusiKasittelyModal: React.FC<UusiKasittelyModalProps> = ({
  viesti,
  esittelijat,
  aiheet,
  open,
  handleClose,
  handleSend,
  setTyopari,
  setKysymys,
  setAihe,
}) => {
  const [state, setState] = useState(
    {} as { kysymys?: string; tyopariId?: string; aihe?: string },
  );

  useEffect(() => {
    const _kysymys = viesti?.viesti;
    const _tyopariId = viesti?.vastaanottajaOid;
    const _aihe = aiheet.find((aihe) => aihe.avain === viesti?.aihe)?.id;

    setState({
      kysymys: _kysymys,
      tyopariId: _tyopariId,
      aihe: _aihe,
    });
  }, [viesti]);

  const handleSetTyopari = (tyopariId?: string) => {
    setState({ ...state, tyopariId });
    setTyopari(tyopariId);
  };

  const handleSetKysymys = (kysymys: string) => {
    setState({ ...state, kysymys });
    setKysymys(kysymys);
  };

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
          spacing={2}
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
          <OphSelectFormFieldPatched
            label={t('hakemus.yhteinenkasittely.uusiKasittely.tyopari')}
            placeholder={t('yleiset.valitse')}
            onChange={(e) => handleSetTyopari(e.target.value)}
            data-testid="yhteinenkasittely-uusiKasittely-tyopari"
            options={esittelijat.map((esittelija) => ({
              value: esittelija.esittelijaOid,
              label: `${esittelija.etunimi} ${esittelija.sukunimi}`.trim(),
            }))}
            {...(state.tyopariId ? { defaultValue: state.tyopariId } : {})}
          />
          <OphSelectFormFieldPatched
            label={t('hakemus.yhteinenkasittely.uusiKasittely.aihe')}
            placeholder={t('yleiset.valitse')}
            onChange={(e) => setAihe(e.target.value)}
            data-testid="yhteinenkasittely-uusiKasittely-aihe"
            options={aiheet.map((aihe) => ({
              value: aihe.id,
              label: t(`hakemus.yhteinenkasittely.aihe.${aihe.avain}`).trim(),
            }))}
            {...(state.aihe ? { defaultValue: state.aihe } : {})}
          />
          <OphInputFormField
            multiline
            minRows={4}
            label={t(
              'hakemus.yhteinenkasittely.uusiKasittely.kysymysTyoparille',
            )}
            onChange={(e) => handleSetKysymys(e.target.value)}
            data-testid="yhteinenkasittely-uusiKasittely-kysymys"
            {...(state.kysymys ? { defaultValue: state.kysymys } : {})}
          />
          <Stack justifyContent="flex-end" direction="row" spacing={2}>
            <OphButton onClick={handleClose}>{t('yleiset.peruuta')}</OphButton>
            <OphButton onClick={() => handleSend(false)}>
              {t('hakemus.yhteinenkasittely.uusiKasittely.tallenna')}
            </OphButton>
            <OphButton
              variant="contained"
              onClick={() => handleSend(true)}
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
  viesti?: Viesti;
  esittelijat: Esittelija[];
  open: boolean;
  handleClose: () => void;
  handleSend: (laheta: boolean) => void;
  setTyopari: (tyopariId?: string) => void;
  setKysymys: (kysymys: string) => void;
}

export const JatkoKasittelyModal: React.FC<JatkoKasittelyModalProps> = ({
  parentKasittely,
  viesti,
  esittelijat,
  open,
  handleClose,
  handleSend,
  setTyopari,
  setKysymys,
}) => {
  const { t } = useTranslations();

  const [state, setState] = useState<{ kysymys?: string; tyopariId?: string }>(
    {},
  );

  useEffect(() => {
    const _kysymys = viesti?.viesti;
    const _tyopariId = viesti?.vastaanottajaOid;
    setState({
      kysymys: _kysymys,
      tyopariId: _tyopariId,
    });
  }, [viesti]);

  const handleSetTyopari = (tyopariId?: string) => {
    setState({ ...state, tyopariId });
    setTyopari(tyopariId);
  };

  const handleSetKysymys = (kysymys: string) => {
    setState({ ...state, kysymys });
    setKysymys(kysymys);
  };

  const jatkokysymys = parentKasittely.jatkoKasittelyt?.at(-1);

  const filteredEsittelijat = esittelijat.filter(
    (esittelija) =>
      esittelija.esittelijaOid !==
      parentKasittely.aloitusViesti.vastaanottajaOid,
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
          spacing={2}
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
          <OphSelectFormFieldPatched
            defaultValue={state.tyopariId}
            label={t('hakemus.yhteinenkasittely.uusiKasittely.tyopari')}
            placeholder={t('yleiset.valitse')}
            onChange={(e) => handleSetTyopari(e.target.value)}
            data-testid="yhteinenkasittely-jatkoKasittely-tyopari"
            options={filteredEsittelijat.map((esittelija) => ({
              value: esittelija.esittelijaOid,
              label: `${esittelija.etunimi} ${esittelija.sukunimi}`.trim(),
            }))}
          />

          <OphTypography variant="h2">
            {t('hakemus.yhteinenkasittely.jatkoKasittely.alkuperainenKysymys')}
          </OphTypography>
          <OphTypography variant="body1">{jatkokysymys?.viesti}</OphTypography>

          <OphInputFormField
            defaultValue={state.kysymys}
            multiline
            minRows={4}
            label={t(
              'hakemus.yhteinenkasittely.jatkoKasittely.kysymysTyoparille',
            )}
            onChange={(e) => handleSetKysymys(e.target.value)}
            data-testid="yhteinenkasittely-jatkoKasittely-kysymys"
          />
          <Stack justifyContent="flex-end" direction="row" spacing={2}>
            <OphButton onClick={handleClose}>{t('yleiset.peruuta')}</OphButton>
            <OphButton onClick={() => handleSend(false)}>
              {t('hakemus.yhteinenkasittely.uusiKasittely.tallenna')}
            </OphButton>
            <OphButton
              variant="contained"
              onClick={() => handleSend(true)}
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
  viesti?: Viesti;
  esittelijat: Esittelija[];
  aiheet: YkViestiAihe[];
  open: boolean;
  handleClose: () => void;
  handleSend: (laheta: boolean) => void;
  setTyopari: (tyopariId?: string) => void;
  setKysymys: (kysymys: string) => void;
  setAihe: (aiheId?: string) => void;
}

export const KasittelyModal: React.FC<KasittelyModalProps> = ({
  parentKasittely,
  viesti,
  esittelijat,
  aiheet,
  open,
  handleClose,
  handleSend,
  setTyopari,
  setKysymys,
  setAihe,
}) => {
  return !parentKasittely ? (
    <UusiKasittelyModal
      viesti={viesti}
      esittelijat={esittelijat}
      aiheet={aiheet}
      open={open}
      handleClose={handleClose}
      handleSend={handleSend}
      setTyopari={setTyopari}
      setKysymys={setKysymys}
      setAihe={setAihe}
    />
  ) : (
    <JatkoKasittelyModal
      parentKasittely={parentKasittely}
      viesti={viesti}
      esittelijat={esittelijat}
      open={open}
      handleClose={handleClose}
      handleSend={handleSend}
      setTyopari={setTyopari}
      setKysymys={setKysymys}
    />
  );
};
