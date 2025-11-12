import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import {
  OphButton,
  ophColors,
  OphTypography,
} from '@opetushallitus/oph-design-system';
import { Divider, Stack, styled, useTheme } from '@mui/material';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import { FullSpinner } from '../FullSpinner';
import { getPerusteluMuistio } from '@/src/hooks/usePerustelu';
import { ToimintoLinkki } from '@/src/components/sidebar/ToimintoLinkki';
import PreviewIcon from '@mui/icons-material/Preview';
import CopyAllIcon from '@mui/icons-material/CopyAll';
import CloseIcon from '@mui/icons-material/Close';
import { useHakemus } from '@/src/context/HakemusContext';
import useToaster from '@/src/hooks/useToaster';

const PreviewIconBlue = styled(PreviewIcon)({
  color: ophColors.blue2,
  paddingTop: '3px',
});

export const AvaaPerusteluMuistioButton = () => {
  const theme = useTheme();
  const { t } = useTranslations();

  const {
    hakemusState: { editedData: hakemus },
  } = useHakemus();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const modalComponent = hakemus ? (
    <PerusteluMuistioModal
      open={isOpen}
      hakemusOid={hakemus!.hakemusOid}
      handleClose={() => setIsOpen(false)}
    />
  ) : null;

  return (
    <>
      {modalComponent}
      <ToimintoLinkki
        onClick={() => setIsOpen(true)}
        gap={theme.spacing(1)}
        icon={<PreviewIconBlue />}
        label={t('hakemus.sivupalkki.perustelumuistio')}
      />
    </>
  );
};

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  minWidth: 800,
  height: '100%',
  bgcolor: ophColors.white,
  border: `00px solid ${ophColors.white}`,
  boxShadow: 24,
  p: 4,
};

const MuistioContent = styled(Box)({
  whiteSpace: 'pre-line',
  overflowY: 'auto',
});

export type PerusteluMuistioModalProps = {
  open: boolean;
  hakemusOid: string;
  handleClose: () => void;
};
export const PerusteluMuistioModal = ({
  open,
  hakemusOid,
  handleClose,
}: PerusteluMuistioModalProps) => {
  const { t } = useTranslations();

  const { addToast } = useToaster();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [muistio, setMuistio] = useState<string>('');

  useEffect(() => {
    if (open) {
      getPerusteluMuistio(hakemusOid).then((sisalto: string) => {
        setMuistio(sisalto || '');
        setIsLoading(false);
      });
    }
    return () => {
      setIsLoading(true);
    };
  }, [hakemusOid, open]);

  const handleCopy = () => {
    navigator.clipboard.writeText(muistio);
    addToast({
      key: 'hakemus.perustelumuistio.kopioi.toaster',
      message: t('hakemus.perustelumuistio.kopioituToast'),
      type: 'success',
    });
  };

  const content = isLoading ? (
    <FullSpinner />
  ) : (
    <OphTypography variant={'body1'} component="pre">
      {muistio}
    </OphTypography>
  );

  return (
    <Modal
      open={open}
      onClose={handleClose}
      data-testid="perustelu-muistio-modal"
    >
      <Box sx={style}>
        <Stack sx={{ height: '100%' }} direction="column" gap={2}>
          <Stack direction="row" gap={2} justifyContent="space-between">
            <OphTypography variant="h2">
              {t('hakemus.perustelumuistio.otsikko')}
            </OphTypography>
            <Stack direction="row" gap={2}>
              <OphButton
                data-testid="modal-confirm-button"
                variant="contained"
                onClick={handleCopy}
                disabled={!!isLoading}
                startIcon={<CopyAllIcon />}
              >
                {t('hakemus.perustelumuistio.kopioi')}
              </OphButton>
              <OphButton
                data-testid="modal-peruuta-button"
                onClick={handleClose}
                endIcon={<CloseIcon />}
              >
                {t('yleiset.sulje')}
              </OphButton>
            </Stack>
          </Stack>
          <Divider />
          <MuistioContent>{content}</MuistioContent>
        </Stack>
      </Box>
    </Modal>
  );
};
