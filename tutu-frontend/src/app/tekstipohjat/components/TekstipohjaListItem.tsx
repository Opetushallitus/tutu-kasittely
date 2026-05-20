import { EditOutlined } from '@mui/icons-material';
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
        margin: '4px 0',
        fontWeight: 500,
        '&:hover *': {
          color: ophColors.blue2,
        },
        '&:hover button': {
          display: 'flex',
        },
      }}
    >
      <OphTypography variant={'body1'} id={`list-item-${id}`}>
        {nimi}
      </OphTypography>
      <OphButton
        sx={{
          display: 'none',
          height: '24px',
        }}
        aria-labelledby={`list-item-${id}`}
        startIcon={<EditOutlined />}
        onClick={onClick}
      ></OphButton>
    </ListItem>
  );
};
