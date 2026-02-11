import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Accordion, AccordionSummary, Box } from '@mui/material';
import { OphTypography, ophColors } from '@opetushallitus/oph-design-system';
import * as dateFns from 'date-fns';
import React from 'react';

import { YhteinenKasittely } from '@/src/lib/types/yhteinenkasittely';

import { KasittelyDetails } from './KasittelyDetails';

interface KasittelyListProps {
  kasittelyt: YhteinenKasittely[];
  answers: Record<string, string>;
  handleChange: (id: string, value: string) => void;
  handleSend: (id: string) => void;
}

export const KasittelyList: React.FC<KasittelyListProps> = ({
  kasittelyt,
  answers,
  handleChange,
  handleSend,
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
                {dateFns.format(new Date(kasittely.luotu!), 'd.M.yyyy')}
              </OphTypography>
            </Box>
          </AccordionSummary>
          <KasittelyDetails
            kasittely={kasittely}
            answers={answers}
            handleChange={handleChange}
            handleSend={handleSend}
          />
        </Accordion>
      ))}
    </>
  );
};
