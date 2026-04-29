import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Accordion, AccordionSummary, Box } from '@mui/material';
import { OphTypography, ophColors } from '@opetushallitus/oph-design-system';
import React from 'react';

import { formatHelsinki } from '@/src/lib/dateUtils';
import { User } from '@/src/lib/types/user';
import { YhteinenKasittely } from '@/src/lib/types/yhteinenkasittely';

import { KasittelyDetails } from './KasittelyDetails';

interface KasittelyListProps {
  kasittelyt: YhteinenKasittely[];
  answers: Record<string, string>;
  handleOpenModal: (parent?: YhteinenKasittely) => void;
  handleChange: (id: string, value: string) => void;
  handleSend: (id: string) => void;
  user: User | null;
}

export const KasittelyList: React.FC<KasittelyListProps> = ({
  kasittelyt,
  answers,
  handleOpenModal,
  handleChange,
  handleSend,
  user,
}) => {
  return (
    <>
      {kasittelyt.map((kasittely) => (
        <Accordion key={kasittely.id}>
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
                data-testid={`kysymys-${kasittely.id}`}
              >
                {kasittely.kysymys}
              </OphTypography>
            </Box>
            <Box style={{ flex: 1 }}>
              <OphTypography variant="body2">
                {kasittely.luotu
                  ? formatHelsinki(kasittely.luotu, 'd.M.yyyy')
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
      ))}
    </>
  );
};
