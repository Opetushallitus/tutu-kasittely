import { EditOutlined, CopyAll, DeleteOutlined } from '@mui/icons-material';
import CloseIcon from '@mui/icons-material/Close';
import { Divider, Stack, styled } from '@mui/material';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import { Theme } from '@mui/material/styles';
import {
  OphButton,
  ophColors,
  OphTypography,
} from '@opetushallitus/oph-design-system';
import React, { useEffect } from 'react';

import { convertHtmlToMarkdown } from '@/src/components/editor/editor-utils';
import { FullSpinner } from '@/src/components/FullSpinner';
import useToaster, { AddToastCallback } from '@/src/hooks/useToaster';
import { useVahvistettuViesti } from '@/src/hooks/useVahvistetutViestit';
import { TFunction } from '@/src/lib/localization/hooks/useTranslations';
import { Viestityyppi } from '@/src/lib/types/viesti';
import { handleFetchError } from '@/src/lib/utils';

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

const ViestiContent = styled(Box)({
  whiteSpace: 'pre-line',
  overflowY: 'auto',
});

export type ViestiMetadata = {
  id: string;
  tyyppi: Viestityyppi;
};

export type VahvistettuViestiModalProps = {
  t: TFunction;
  theme: Theme;
  open: boolean;
  viestiMetadata?: ViestiMetadata;
  handleClose: () => void;
  handlePoistaViesti: (id: string) => void;
  handleLisaaEditoriin: (html: string) => void;
};

const handleCopy = (html: string, t: TFunction, addToast: AddToastCallback) => {
  const markdown = convertHtmlToMarkdown(html);
  navigator.clipboard.writeText(markdown);
  addToast({
    key: 'hakemus.viesti.kopioi.toaster',
    message: t('hakemus.viesti.kopioituToast'),
    type: 'success',
    timeMs: 2500,
  });
};

export const VahvistettuViestiModal = ({
  t,
  theme,
  open,
  viestiMetadata,
  handleClose,
  handlePoistaViesti,
  handleLisaaEditoriin,
}: VahvistettuViestiModalProps) => {
  const { viesti, isLoading, error } = useVahvistettuViesti(viestiMetadata?.id);
  const { addToast } = useToaster();

  useEffect(() => {
    handleFetchError(addToast, error, 'virhe.viestinLataus', t);
  }, [addToast, error, t]);

  if (error) {
    return null;
  }

  const content = isLoading ? (
    <FullSpinner />
  ) : (
    <Stack gap={theme.spacing(2)}>
      <OphTypography data-testid="viesti-otsikko" variant={'h2'}>
        {viesti?.otsikko}
      </OphTypography>
      <ViestiContent>
        <div
          id="viestiContent"
          dangerouslySetInnerHTML={{ __html: viesti?.viesti || '' }}
        />
      </ViestiContent>
    </Stack>
  );

  const tyyppi =
    viestiMetadata && viestiMetadata.tyyppi
      ? t(`hakemus.viesti.${viestiMetadata.tyyppi}`)
      : '';

  return (
    <Modal
      open={open}
      onClose={handleClose}
      data-testid="vahvistettu-viesti-modal"
    >
      <Box sx={style}>
        <Stack sx={{ height: '100%' }} direction="column" gap={2}>
          <Stack direction="row" gap={2} justifyContent="space-between">
            <OphTypography variant="h2">{tyyppi}</OphTypography>
            <Stack direction="row" gap={2}>
              <OphButton
                data-testid={`viesti-modal-kopioi-button`}
                variant="outlined"
                startIcon={<CopyAll />}
                onClick={() => handleCopy(viesti?.viesti || '', t, addToast)}
              >
                {t(`hakemus.viesti.kopioi`)}
              </OphButton>
              <OphButton
                data-testid={`viesti-modal-kopioi-editoriin-button`}
                variant="outlined"
                startIcon={<EditOutlined />}
                onClick={() => {
                  handleLisaaEditoriin(viesti?.viesti || '');
                  addToast({
                    key: 'hakemus.viesti.kopioituEditoriinToast',
                    message: t('hakemus.viesti.kopioituEditoriinToast'),
                    type: 'success',
                    timeMs: 2500,
                  });
                }}
              >
                {t(`hakemus.viesti.kopioiEditoriin`)}
              </OphButton>
              <OphButton
                data-testid={`viesti-modal-poista-button`}
                variant="outlined"
                startIcon={<DeleteOutlined />}
                onClick={() => handlePoistaViesti(viesti!.id!)}
              >
                {t(`yleiset.poista`)}
              </OphButton>
              <OphButton
                data-testid="viesti-modal-sulje-button"
                onClick={handleClose}
                endIcon={<CloseIcon />}
              >
                {t('yleiset.sulje')}
              </OphButton>
            </Stack>
          </Stack>
          <Divider />
          {content}
        </Stack>
      </Box>
    </Modal>
  );
};
