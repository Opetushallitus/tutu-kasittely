import { EditOutlined } from '@mui/icons-material';
import { ListSubheader } from '@mui/material';
import { OphButton, OphTypography } from '@opetushallitus/oph-design-system';

import { ophColors } from '@/src/lib/theme';

export const KategoriaSubHeader = ({
  index,
  nimi,
  onClick,
  setShowKategoriaPohjat,
}: {
  index: number;
  nimi: string;
  onClick?: () => void;
  setShowKategoriaPohjat: () => void;
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
          display: 'flex',
        },
      }}
    >
      <OphButton
        sx={{ padding: 0 }}
        variant={'text'}
        onClick={setShowKategoriaPohjat}
      >
        <OphTypography
          variant={'label'}
        >{`${index + 1}. ${nimi}`}</OphTypography>
      </OphButton>
      {onClick && (
        <OphButton
          sx={{
            display: 'none',
            height: '24px',
          }}
          startIcon={<EditOutlined />}
          onClick={onClick}
        ></OphButton>
      )}
    </ListSubheader>
  );
};
