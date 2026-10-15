import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Accordion, AccordionSummary, Box } from '@mui/material';
import { useTheme } from '@mui/system';
import { OphTypography, ophColors } from '@opetushallitus/oph-design-system';
import React from 'react';

import { KasittelyDetails } from './KasittelyDetails';

import { formatHelsinki } from '@/src/lib/dateUtils';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import { User } from '@/src/lib/types/user';
import { YhteinenKasittely } from '@/src/lib/types/yhteinenkasittely';

interface KasittelyListProps {
  kasittelyt: YhteinenKasittely[];
  answers: Record<string, string>;
  handleOpenModal: (parent?: YhteinenKasittely) => void;
  handleChange: (id: string, value: string) => void;
  handleSend: (id: string) => void;
  expandedPanels: string[];
  handleOpenPanel: (panelId?: string) => void;
  handleClosePanel: (panelId?: string) => void;
  user: User | null;
}

export const KasittelyList: React.FC<KasittelyListProps> = ({
  kasittelyt,
  answers,
  handleOpenModal,
  handleChange,
  handleSend,
  expandedPanels,
  handleOpenPanel,
  handleClosePanel,
  user,
}) => {
  const { t } = useTranslations();
  const theme = useTheme();
  const handleAccordionChange =
    (panelId?: string) => (_event: React.SyntheticEvent, expanded: boolean) => {
      if (expanded) {
        handleOpenPanel(panelId);
      } else {
        handleClosePanel(panelId);
      }
    };

  return (
    <>
      {kasittelyt.map((kasittely) => {
        const aihe = kasittely.aloitusViesti?.aihe
          ? t(`hakemus.yhteinenkasittely.aihe.${kasittely.aloitusViesti?.aihe}`)
          : '';
        return (
          <Accordion
            key={kasittely.aloitusViesti?.id}
            expanded={
              kasittely.aloitusViesti?.id
                ? expandedPanels.includes(kasittely.aloitusViesti?.id)
                : false
            }
            onChange={handleAccordionChange(kasittely.aloitusViesti?.id)}
          >
            <AccordionSummary
              expandIcon={
                <ExpandMoreIcon
                  fontSize="small"
                  sx={{ color: ophColors.black }}
                />
              }
              sx={{
                '& .MuiAccordionSummary-expandIconWrapper': { order: -1 },
                padding: 0,
                display: 'flex',
                width: '100%',
              }}
            >
              <Box style={{ flex: 3, overflow: 'hidden' }}>
                <OphTypography
                  variant="body1"
                  sx={{
                    color: ophColors.blue2,
                    fontWeight: 400,
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                  }}
                  data-testid={`kysymys-${kasittely.aloitusViesti?.id}`}
                >
                  {aihe}
                </OphTypography>
              </Box>
              <Box style={{ flex: 1 }}>
                <OphTypography
                  variant="body1"
                  sx={{ color: ophColors.grey700 }}
                >
                  {kasittely.aloitusViesti?.lahettaja}
                </OphTypography>
              </Box>
              <Box style={{ flex: 2, marginLeft: theme.spacing(2) }}>
                <OphTypography
                  variant="body1"
                  sx={{ color: ophColors.grey700 }}
                >
                  {kasittely.aloitusViesti?.luotu
                    ? formatHelsinki(
                        kasittely.aloitusViesti?.luotu,
                        'd.M.yyyy HH:mm',
                      )
                    : ''}
                </OphTypography>
              </Box>
            </AccordionSummary>
            <KasittelyDetails
              kasittely={kasittely}
              answers={answers}
              handleOpenModal={handleOpenModal}
              handleChange={handleChange}
              handleSend={handleSend}
              user={user}
            />
          </Accordion>
        );
      })}
    </>
  );
};
