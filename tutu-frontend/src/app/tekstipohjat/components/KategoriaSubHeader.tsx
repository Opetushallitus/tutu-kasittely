import { Edit } from '@mui/icons-material';
import { ListSubheader } from '@mui/material';
import { OphButton, OphTypography } from '@opetushallitus/oph-design-system';

import { ophColors } from '@/src/lib/theme';

export const KategoriaSubHeader = ({
  index,
  nimi,
  onClick,
}: {
  index: number;
  nimi: string;
  onClick: () => void;
}) => {
  return (
    <ListSubheader
      sx={{
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        '&:hover *': {
          color: ophColors.blue2,
        },
        '&:hover button': {
          display: 'block',
        },
      }}
    >
      <OphTypography variant={'label'}>{`${index + 1}. ${nimi}`}</OphTypography>
      <OphButton
        sx={{
          marginRight: '12px',
          display: 'none',
          height: '24px',
        }}
        startIcon={<Edit />}
        onClick={onClick}
      ></OphButton>
    </ListSubheader>
  );
};
