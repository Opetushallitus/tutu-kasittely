'use client';

import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import { Box, Button, Stack, useTheme, Theme } from '@mui/material';
import { OphTypography, ophColors } from '@opetushallitus/oph-design-system';
import { useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { useQueryState } from 'nuqs';
import React, { useEffect, useState } from 'react';

import { SortOrder } from '@/src/app/(root)/components/types';
import { FullSpinner } from '@/src/components/FullSpinner';
import { useAuthorizedUser } from '@/src/components/providers/AuthorizedUserProvider';
import { useEsittelijat } from '@/src/hooks/useEsittelijat';
import useToaster from '@/src/hooks/useToaster';
import { useYhteinenKasittely } from '@/src/hooks/useYhteinenKasittely';
import {
  TFunction,
  useTranslations,
} from '@/src/lib/localization/hooks/useTranslations';
import { DEFAULT_BOX_BORDER } from '@/src/lib/theme';
import { User } from '@/src/lib/types/user';
import { YhteinenKasittely } from '@/src/lib/types/yhteinenkasittely';
import { handleFetchError } from '@/src/lib/utils';

import { KasittelyList } from './components/KasittelyList';
import { KasittelyModal } from './components/KasittelyModal';

const kayttajaLukenutViestin =
  (user: User | null) => (kasittely: YhteinenKasittely) => {
    if (!user) {
      return false;
    }
    const kayttajaOnKysyja = user.userOid === kasittely.lahettajaOid;
    const kayttajaOnVastaaja = user.userOid === kasittely.vastaanottajaOid;
    const vastausAnnettu = !!kasittely.vastaus;
    const kysymysLuettu = !!kasittely.kysymysLuettu;
    const vastausLuettu = !!kasittely.vastausLuettu;

    const kayttajaOnKysyjaJaLukenutVastauksen =
      kayttajaOnKysyja && vastausAnnettu && vastausLuettu;
    const kayttajaOnVastaajaJaLukenutKysymyksen =
      kayttajaOnVastaaja && kysymysLuettu;

    return (
      kayttajaOnKysyjaJaLukenutVastauksen ||
      kayttajaOnVastaajaJaLukenutKysymyksen
    );
  };

const EmptyList: React.FC<{ t: TFunction; theme: Theme }> = ({ t, theme }) => {
  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <Box
        data-testid="yhteinenkasittely-tyhja-icon"
        sx={{
          height: '2.5vw',
          width: '2.5vw',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: ophColors.grey50,
          borderRadius: '50%',
          marginY: theme.spacing(4),
        }}
      >
        <FolderOutlinedIcon sx={{ color: ophColors.grey700 }} />
      </Box>
      <OphTypography variant="body1">
        {t('hakemus.yhteinenkasittely.eiLuotu')}
      </OphTypography>
    </Box>
  );
};

export default function YhteinenKasittelyPage() {
  const { t } = useTranslations();
  const theme = useTheme();
  const { oid: hakemusOid } = useParams<{ oid: string }>();

  const queryClient = useQueryClient();
  const { addToast } = useToaster();

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [sortKey, setSortKey] = useState<SortOrder>('desc');

  const [expandedPanels, setExpandedPanels] = useState<string[]>([]);

  const [modalParent, setModalParent] = useState<
    YhteinenKasittely | undefined
  >();
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [tyopari, setTyopari] = useState<string | undefined>();
  const [kysymys, setKysymys] = useState<string>('');

  const user = useAuthorizedUser();

  const [viestiId] = useQueryState('viestiId');

  const {
    data: esittelijat,
    isLoading: esittelijatIsLoading,
    error: esittelijatError,
  } = useEsittelijat();

  const {
    kasittelyt,
    isKasittelytLoading,
    luoUusiKasittely,
    vastaaKasittelyyn,
    viestiLuettu,
    error: kasittelyError,
    updateError,
  } = useYhteinenKasittely(hakemusOid, sortKey);

  useEffect(() => {
    handleFetchError(
      addToast,
      kasittelyError,
      'virhe.yhteisenkasittelynLataus',
      t,
    );
    handleFetchError(
      addToast,
      esittelijatError,
      'virhe.yhteisenkasittelynLataus',
      t,
    );
    handleFetchError(addToast, updateError, 'virhe.tallennus', t);
  }, [kasittelyError, esittelijatError, updateError, addToast, t]);

  const merkitseLuetuksi = (panelId?: string) => {
    const kasittely = kasittelyt?.find((kasittely) => kasittely.id === panelId);
    if (kasittely) {
      const jatkoKasittelyt = kasittely.jatkoKasittelyt || [];
      const viestiIdt: string[] = [kasittely, ...jatkoKasittelyt]
        .filter(kayttajaLukenutViestin(user))
        .map(({ id }) => id)
        .filter(Boolean) as string[];

      viestiIdt.forEach((viestiId) => viestiLuettu(viestiId));
    }
  };

  const handleOpenPanel = (panelId?: string) => {
    if (panelId) {
      const newExpandedPanels = [...expandedPanels, panelId];
      setExpandedPanels(newExpandedPanels);

      merkitseLuetuksi(panelId);
    }
  };

  const handleClosePanel = (panelId?: string) => {
    if (panelId) {
      const newExpandedPanels = expandedPanels.filter((id) => id !== panelId);
      setExpandedPanels(newExpandedPanels);
    }
  };

  useEffect(() => {
    if (!!viestiId && !!kasittelyt) {
      handleOpenPanel(viestiId);
    }
  }, [kasittelyt, viestiId]); // eslint-disable-line react-hooks/exhaustive-deps

  if (kasittelyError) {
    return null;
  }

  if (isKasittelytLoading || esittelijatIsLoading) {
    return <FullSpinner />;
  }

  const handleSort = () => {
    const newSort = sortKey === 'desc' ? 'asc' : 'desc';
    setSortKey(newSort as SortOrder);
    queryClient.invalidateQueries({
      queryKey: ['getYhteinenKasittely'],
    });
  };

  const handleChange = (id: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  };

  const handleOpenModal = (parent?: YhteinenKasittely) => {
    setModalParent(parent);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalParent(undefined);
    setModalOpen(false);
  };

  const handleCreateKasittely = async () => {
    try {
      const kasittely: YhteinenKasittely = {
        parentId: modalParent?.id,
        kysymys: kysymys,
        vastaanottajaOid: tyopari,
      };
      luoUusiKasittely(kasittely);
      handleModalClose();
    } catch (error) {
      handleFetchError(addToast, error, 'virhe.yhteisenkasittelynUusi', t);
    }
  };

  const handleSendAnswer = async (id: string) => {
    try {
      vastaaKasittelyyn({ id, vastaus: answers[id] ?? '' });
      addToast({
        key: 'hakemus.yhteinenkasittely.vastattu.toaster',
        message: t('hakemus.yhteinenkasittely.vastattuToast'),
        type: 'success',
        timeMs: 2500,
      });
    } catch (error) {
      handleFetchError(addToast, error, 'virhe.yhteisenkasittelynLaheta', t);
    }
  };

  return (
    <>
      <Box sx={{ width: '100%', marginRight: theme.spacing(3) }}>
        <Stack direction="row">
          <Box sx={{ width: '100%' }}>
            <OphTypography variant="h2" data-testid="yhteinenkasittely-otsikko">
              {t('hakemus.yhteinenkasittely.otsikko')}
            </OphTypography>
            <Button
              variant="contained"
              color="primary"
              sx={{
                marginBottom: theme.spacing(3),
                marginTop: theme.spacing(3),
              }}
              onClick={() => handleOpenModal()}
              data-testid="uusi-yhteinen-kasittely-btn"
            >
              {t('hakemus.yhteinenkasittely.uusiYhteinenKasittely')}
            </Button>

            {!kasittelyt?.length ? (
              <EmptyList t={t} theme={theme} />
            ) : (
              <Box>
                <Box
                  sx={{
                    display: 'flex',
                    borderBottom: DEFAULT_BOX_BORDER,
                  }}
                >
                  <OphTypography
                    variant="body1"
                    sx={{
                      flex: 3,
                      fontWeight: 600,
                      paddingLeft: theme.spacing(1.5),
                      userSelect: 'none',
                    }}
                  >
                    {t('hakemus.yhteinenkasittely.kysymys')}
                  </OphTypography>
                  <Stack direction="row" sx={{ flex: 1 }}>
                    <Button
                      onClick={handleSort}
                      aria-label={t(
                        'hakemus.yhteinenkasittely.kysymysLahetetty',
                      )}
                      endIcon={
                        sortKey === 'asc' ? (
                          <ExpandMoreIcon
                            fontSize="small"
                            sx={{ color: ophColors.black }}
                          />
                        ) : (
                          <ExpandLessIcon
                            fontSize="small"
                            sx={{ color: ophColors.black }}
                          />
                        )
                      }
                      sx={{ paddingLeft: 0 }}
                    >
                      <OphTypography variant="body1" sx={{ fontWeight: 600 }}>
                        {t('hakemus.yhteinenkasittely.kysymysLahetetty')}
                      </OphTypography>
                    </Button>
                  </Stack>
                </Box>

                <Box>
                  <KasittelyList
                    kasittelyt={kasittelyt}
                    answers={answers}
                    handleOpenModal={handleOpenModal}
                    handleChange={handleChange}
                    handleSend={handleSendAnswer}
                    expandedPanels={expandedPanels}
                    handleOpenPanel={handleOpenPanel}
                    handleClosePanel={handleClosePanel}
                    user={user}
                  />
                </Box>
              </Box>
            )}
          </Box>
        </Stack>
      </Box>
      <KasittelyModal
        esittelijat={esittelijat}
        open={modalOpen}
        parentKasittely={modalParent}
        handleClose={() => handleModalClose()}
        handleSend={handleCreateKasittely}
        setTyopari={setTyopari}
        setKysymys={setKysymys}
      />
    </>
  );
}
