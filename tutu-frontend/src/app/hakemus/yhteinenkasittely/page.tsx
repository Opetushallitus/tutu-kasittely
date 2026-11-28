'use client';

import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import { Box, Button, Stack, useTheme, Theme } from '@mui/material';
import { OphTypography, ophColors } from '@opetushallitus/oph-design-system';
import { useQueryClient } from '@tanstack/react-query';
import { useQueryState } from 'nuqs';
import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import { KasittelyList } from './components/KasittelyList';
import { KasittelyModal } from './components/KasittelyModal';

import { SortOrder } from '@/src/app/components/types';
import { FullSpinner } from '@/src/components/FullSpinner';
import { useAuthorizedUser } from '@/src/components/providers/AuthorizedUserProvider';
import { UnsavedChangesGuard } from '@/src/components/UnsavedChangesGuard';
import { useEditableState } from '@/src/hooks/useEditableState';
import { useEsittelijat } from '@/src/hooks/useEsittelijat';
import useToaster, { TALLENNA_TOAST_DURATION } from '@/src/hooks/useToaster';
import { useYhteinenKasittely } from '@/src/hooks/useYhteinenKasittely';
import { useYkViestiAiheet } from '@/src/hooks/useYkViestiAiheet';
import {
  TFunction,
  useTranslations,
} from '@/src/lib/localization/hooks/useTranslations';
import { DEFAULT_BOX_BORDER } from '@/src/lib/theme';
import { User } from '@/src/lib/types/user';
import {
  Viesti,
  YhteinenKasittely,
  YkViestiTyyppi,
} from '@/src/lib/types/yhteinenkasittely';
import { YKKysymysDTO } from '@/src/lib/types/yhteisenKasittelynViesti';
import { handleFetchError } from '@/src/lib/utils';

function not<T>(predicate: (arg: T) => boolean) {
  return (arg: T) => !predicate(arg);
}

const findParentKasittely = (
  kasittelyt?: YhteinenKasittely[],
  viesti?: Viesti,
) => {
  if (!kasittelyt || !viesti || !viesti.parentId) {
    return undefined;
  }
  return kasittelyt.find(
    (kasittely) => kasittely.aloitusViesti.id === viesti.parentId,
  );
};

const kayttajaLukenutViestin = (user: User | null) => (viesti: Viesti) => {
  if (!user) {
    return false;
  }
  const luettu =
    viesti.luettu && viesti.luettu?.some((oid) => oid === user.userOid);

  return luettu || false;
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

  const [sortKey, setSortKey] = useState<SortOrder>('desc');

  const [expandedPanels, setExpandedPanels] = useState<string[]>([]);

  const [modalParent, setModalParent] = useState<
    YhteinenKasittely | undefined
  >();
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [tyopari, setTyopari] = useState<string | undefined>();
  const [kysymys, setKysymys] = useState<string>('');
  const [aihe, setAihe] = useState<string | undefined>();
  const [muokattavaViesti, setMuokattavaViesti] = useState<
    Viesti | undefined
  >();

  const user = useAuthorizedUser();

  const [viestiId] = useQueryState('viestiId');

  const {
    data: esittelijat,
    isLoading: esittelijatIsLoading,
    error: esittelijatError,
  } = useEsittelijat();

  const { aiheet, aiheetIsLoading, aiheetError } = useYkViestiAiheet();

  const {
    kasittelyt,
    isKasittelytLoading,
    luoUusiKasittely,
    vastaaKasittelyyn,
    viestiLuettu,
    error: kasittelyError,
    updateError,
  } = useYhteinenKasittely(hakemusOid ?? '', sortKey);

  const answersFromServer = useMemo(() => {
    return (kasittelyt ?? []).reduce(
      (acc: Record<string, string>, kasittely: YhteinenKasittely) => {
        acc[kasittely.aloitusViesti.id!] = kasittely.aloitusViesti.viesti ?? '';
        kasittely.jatkoKasittelyt?.forEach((viesti: Viesti) => {
          acc[viesti.id!] = viesti.viesti ?? '';
        });
        return acc;
      },
      {},
    );
  }, [kasittelyt]);

  const {
    editedData: answers = {} as Record<string, string>,
    hasChanges: answersHasChanges,
    updateLocal: setAnswers,
    discard,
  } = useEditableState(answersFromServer, () => {});

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
    handleFetchError(
      addToast,
      aiheetError,
      'virhe.yhteisenkasittelynLataus',
      t,
    );
    handleFetchError(addToast, updateError, 'virhe.tallennus', t);
  }, [kasittelyError, esittelijatError, updateError, addToast, t]);

  const merkitseLuetuksi = (panelId?: string) => {
    const kasittely = kasittelyt?.find(
      (kasittely) => kasittely.aloitusViesti.id === panelId,
    );
    if (kasittely) {
      const jatkoKasittelyt = kasittely.jatkoKasittelyt || [];
      const aloitusViesti = kasittely.aloitusViesti;
      const viestiIdt: string[] = [aloitusViesti, ...jatkoKasittelyt]
        .filter(not(kayttajaLukenutViestin(user)))
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
  }, [kasittelyt, viestiId]);

  if (kasittelyError) {
    return null;
  }

  if (isKasittelytLoading || esittelijatIsLoading || aiheetIsLoading) {
    return <FullSpinner />;
  }

  const handleSort = async () => {
    const newSort = sortKey === 'desc' ? 'asc' : 'desc';
    setSortKey(newSort as SortOrder);
    await queryClient.invalidateQueries({
      queryKey: ['getYhteinenKasittely'],
    });
  };

  const handleChange = (
    { id, parentId }: { id?: string; parentId?: string },
    value: string,
  ) => {
    if (!id && !parentId) return;
    const answerId = id || `answer__${parentId}`;
    setAnswers({ ...answers, [answerId]: value });
  };

  const handleOpenModal = (parent?: YhteinenKasittely, viesti?: Viesti) => {
    setModalParent(parent);
    setMuokattavaViesti(viesti);
    setModalOpen(true);
  };

  const handleOpenEditModal = (viesti?: Viesti) => {
    setModalParent(findParentKasittely(kasittelyt, viesti));
    setMuokattavaViesti(viesti);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalParent(undefined);
    setMuokattavaViesti(undefined);
    setModalOpen(false);
  };

  const handleCreateKasittely = async (laheta: boolean = false) => {
    try {
      const kasittely: YKKysymysDTO = {
        id: muokattavaViesti?.id,
        parentId: modalParent?.aloitusViesti.id,
        viesti: kysymys,
        vastaanottajaOid: tyopari,
        laheta,
        aihe: aihe,
        tyyppi: modalParent
          ? YkViestiTyyppi.jatkokysymys
          : YkViestiTyyppi.kysymys,
      };
      luoUusiKasittely(kasittely);
      addToast({
        key: 'hakemus.yhteinenkasittely.kysymys.toaster',
        message: t('hakemus.yhteinenkasittely.kysymysToast'),
        type: 'success',
        timeMs: 2500,
      });
      handleModalClose();
    } catch (error) {
      handleFetchError(addToast, error, 'virhe.yhteisenkasittelynUusi', t);
    }
  };

  const handleSendAnswer = async (
    { id, parentId }: { id?: string; parentId?: string },
    laheta: boolean = false,
  ) => {
    try {
      if (!id && !parentId) return;
      const answerId = id || `answer__${parentId}`;

      vastaaKasittelyyn({
        id,
        parentId,
        vastaus: answers[answerId] ?? '',
        laheta,
        tyyppi: YkViestiTyyppi.vastaus,
      });
      if (laheta) {
        addToast({
          key: 'hakemus.yhteinenkasittely.vastattu.toaster',
          message: t('hakemus.yhteinenkasittely.vastattuToast'),
          type: 'success',
          timeMs: 2500,
        });
      } else {
        addToast({
          key: 'hakemus.yhteinenkasittely.tallennettu.toaster',
          message: t('hakemus.yhteinenkasittely.vastausTallennettu'),
          type: 'success',
          timeMs: TALLENNA_TOAST_DURATION,
        });
      }
    } catch (error) {
      handleFetchError(addToast, error, 'virhe.yhteisenkasittelynLaheta', t);
    }
  };

  return (
    <>
      <UnsavedChangesGuard enabled={answersHasChanges} onDiscard={discard} />
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
                  <OphTypography
                    variant="body1"
                    sx={{
                      flex: 1,
                      fontWeight: 600,
                      paddingLeft: theme.spacing(1.5),
                      userSelect: 'none',
                    }}
                  >
                    {t('hakemus.yhteinenkasittely.lahettaja')}
                  </OphTypography>
                  <Stack
                    direction="row"
                    sx={{
                      flex: 2,
                      marginLeft: theme.spacing(2),
                      paddingLeft: theme.spacing(2),
                    }}
                  >
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
                    handleOpenModal={handleOpenModal}
                    handleOpenEditModal={handleOpenEditModal}
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
        viesti={muokattavaViesti}
        esittelijat={esittelijat}
        aiheet={aiheet}
        open={modalOpen}
        parentKasittely={modalParent}
        handleClose={() => handleModalClose()}
        handleSend={handleCreateKasittely}
        setTyopari={setTyopari}
        setKysymys={setKysymys}
        setAihe={setAihe}
      />
    </>
  );
}
