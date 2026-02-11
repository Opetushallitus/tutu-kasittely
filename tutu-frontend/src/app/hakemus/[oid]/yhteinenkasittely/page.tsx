'use client';

import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import { Box, Button, Stack, useTheme, Theme } from '@mui/material';
import { OphTypography, ophColors } from '@opetushallitus/oph-design-system';
import { useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';

import { SortOrder } from '@/src/app/(root)/components/types';
import { FullSpinner } from '@/src/components/FullSpinner';
import useToaster from '@/src/hooks/useToaster';
import { useYhteinenKasittely } from '@/src/hooks/useYhteinenKasittely';
import {
  TFunction,
  useTranslations,
} from '@/src/lib/localization/hooks/useTranslations';
import { DEFAULT_BOX_BORDER } from '@/src/lib/theme';
import { YhteinenKasittely } from '@/src/lib/types/yhteinenkasittely';
import { handleFetchError } from '@/src/lib/utils';

import { KasittelyList } from './components/KasittelyList';

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

  const {
    kasittelyt,
    isKasittelytLoading,
    luoUusiKasittely,
    vastaaKasittelyyn,
    error: kasittelyError,
  } = useYhteinenKasittely(hakemusOid, sortKey);

  useEffect(() => {
    handleFetchError(
      addToast,
      kasittelyError,
      'virhe.yhteisenkasittelynLataus',
      t,
    );
  }, [kasittelyError, addToast, t]);

  if (kasittelyError) {
    return null;
  }

  if (isKasittelytLoading) {
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

  const handleCreateNewKasittely = async () => {
    try {
      const kasittely: YhteinenKasittely = {};
      luoUusiKasittely(kasittely);
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
      });
    } catch (error) {
      handleFetchError(addToast, error, 'virhe.yhteisenkasittelynLaheta', t);
    }
  };

  return (
    <Box sx={{ width: '100%', marginRight: theme.spacing(3) }}>
      <Stack direction="row">
        <Box sx={{ width: '100%' }}>
          <OphTypography variant="h2" data-testid="yhteinenkasittely-otsikko">
            {t('hakemus.yhteinenkasittely.otsikko')}
          </OphTypography>
          <Button
            variant="contained"
            color="primary"
            sx={{ marginBottom: theme.spacing(3), marginTop: theme.spacing(3) }}
            onClick={handleCreateNewKasittely}
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
                    aria-label={t('hakemus.yhteinenkasittely.kysymysLahetetty')}
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
                  handleChange={handleChange}
                  handleSend={handleSendAnswer}
                />
              </Box>
            </Box>
          )}
        </Box>
      </Stack>
    </Box>
  );
}
