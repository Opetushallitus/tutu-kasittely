import { Edit } from '@mui/icons-material';
import { ListItem } from '@mui/material';
import { OphButton, OphTypography } from '@opetushallitus/oph-design-system';

import { ophColors } from '@/src/lib/theme';

export const TekstipohjaListItem = ({
  id,
  nimi,
  onClick,
}: {
  id: string;
  nimi: string;
  onClick: () => void;
}) => {
  return (
    <ListItem
      sx={{
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        backgroundColor: ophColors.grey50,
        margin: '4px',
        fontWeight: 500,
        '&:hover *': {
          color: ophColors.blue2,
        },
        '&:hover button': {
          display: 'block',
        },
      }}
    >
      <OphTypography variant={'body1'} id={`list-item-${id}`}>
        {nimi}
      </OphTypography>
      <OphButton
        sx={{
          marginRight: '12px',
          display: 'none',
          height: '24px',
          padding: 0,
        }}
        aria-labelledby={`list-item-${id}`}
        startIcon={<Edit sx={{ top: '-8px' }} />}
        onClick={onClick}
      ></OphButton>
    </ListItem>
  );
};
