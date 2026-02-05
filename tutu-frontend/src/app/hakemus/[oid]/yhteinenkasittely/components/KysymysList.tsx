import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Accordion, AccordionSummary } from '@mui/material';
import { OphTypography, ophColors } from '@opetushallitus/oph-design-system';
import * as dateFns from 'date-fns';
import React from 'react';

import { KysymysDetails, Kysymys } from './KysymysDetails';

interface KysymysListProps {
  kysymykset: Kysymys[];
  answers: Record<string, string>;
  handleChange: (id: string, value: string) => void;
  handleSend: (id: string) => void;
}

export const KysymysList: React.FC<KysymysListProps> = ({
  kysymykset,
  answers,
  handleChange,
  handleSend,
}) => {
  return (
    <>
      {kysymykset.map((kysymys) => (
        <Accordion key={kysymys.id}>
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
            <div style={{ flex: 3, overflow: 'hidden' }}>
              <OphTypography
                variant="body1"
                sx={{
                  color: ophColors.blue2,
                  fontWeight: 400,
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                }}
                data-testid={`kysymys-${kysymys.id}`}
              >
                {kysymys.question}
              </OphTypography>
            </div>
            <div style={{ flex: 1 }}>
              <OphTypography variant="body2">
                {dateFns.format(new Date(kysymys.timestamp), 'd.M.yyyy')}
              </OphTypography>
            </div>
          </AccordionSummary>
          <KysymysDetails
            kysymys={kysymys}
            answers={answers}
            handleChange={handleChange}
            handleSend={handleSend}
          />
        </Accordion>
      ))}
    </>
  );
};
