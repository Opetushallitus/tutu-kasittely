'use client';

import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Box, Button, Stack, IconButton, useTheme } from '@mui/material';
import { OphTypography, ophColors } from '@opetushallitus/oph-design-system';
import React, { useState } from 'react';

import { SortOrder } from '@/src/app/(root)/components/types';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import { DEFAULT_BOX_BORDER } from '@/src/lib/theme';

import { Kysymys } from './components/KysymysDetails';
import { KysymysList } from './components/KysymysList';

export default function YhteinenKasittelyPage() {
  const { t } = useTranslations();
  const theme = useTheme();

  // TODO: Fetch real data from backend
  const kysymykset: Kysymys[] = [
    {
      id: 'q1',
      sender: 'Testi esittelijä',
      question: 'Voisitko tarkistaa liitteen A tiedot?',
      timestamp: '2026-02-04T09:12:00Z',
    },
    {
      id: 'q2',
      sender: 'Kalle Päätalo',
      question: 'Onko tämä päätös valmis allekirjoitettavaksi?',
      timestamp: '2026-02-03T14:30:00Z',
    },
    {
      id: 'q3',
      sender: 'Otto Kehittäjä',
      question: 'Tarvitaanko lisätietoja hakijan opintosuunnasta?',
      timestamp: '2026-02-01T08:05:00Z',
      relatedQuestions: [
        {
          id: 'q4',
          sender: 'Toinen Tyyppi',
          question: 'Tarvitaanko lisätietoja ???',
          timestamp: '2026-02-01T08:05:00Z',
        },
        {
          id: 'q5',
          sender: 'Vastaaja Esittelijä',
          question: 'Tarvitaanko lisätietoja ???',
          timestamp: '2026-02-01T08:05:00Z',
        },
      ],
    },
  ];

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [sortKey, setSortKey] = useState<SortOrder>('desc'); // TODO: handle sorting change

  const handleChange = (id: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  };

  const handleSend = (id: string) => {
    // TODO: Implement sending
    console.log('Send answer', id, answers[id], { sortKey });
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
            data-testid="uusi-yhteinen-kasittely-btn"
          >
            {t('hakemus.yhteinenkasittely.uusiYhteinenKasittely')}
          </Button>

          <Box
            sx={{
              display: 'flex',
              borderBottom: DEFAULT_BOX_BORDER,
            }}
          >
            <OphTypography
              variant="body1"
              sx={{ flex: 3, fontWeight: 600, paddingLeft: theme.spacing(1.5) }}
            >
              {t('hakemus.yhteinenkasittely.kysymys')}
            </OphTypography>
            <Stack
              direction="row"
              sx={{
                flex: 1,
                alignItems: 'center',
                gap: theme.spacing(0.5),
              }}
            >
              <OphTypography variant="body1" sx={{ fontWeight: 600 }}>
                {t('hakemus.yhteinenkasittely.kysymysLahetetty')}{' '}
              </OphTypography>
              <IconButton
                size="small"
                aria-label="sort"
                onClick={() => {
                  setSortKey(sortKey === 'desc' ? 'asc' : 'desc');
                }}
              >
                {sortKey === 'asc' ? (
                  <ExpandMoreIcon
                    fontSize="small"
                    sx={{ color: ophColors.black }}
                  />
                ) : (
                  <ExpandLessIcon
                    fontSize="small"
                    sx={{ color: ophColors.black }}
                  />
                )}
              </IconButton>
            </Stack>
          </Box>

          <Box>
            <KysymysList
              kysymykset={kysymykset}
              answers={answers}
              handleChange={handleChange}
              handleSend={handleSend}
            />
          </Box>
        </Box>
      </Stack>
    </Box>
  );
}
