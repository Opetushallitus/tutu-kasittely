import { Box, Stack } from '@mui/material';
import { OphButton } from '@opetushallitus/oph-design-system';
import React from 'react';

import { HakijanIlmoittamaPopover } from './HakijanIlmoittamaPopover';

import { TFunction } from '@/src/lib/localization/hooks/useTranslations';

export type HakijanIlmoittamaFieldWrapperProps = {
  hakijanIlmoittamaSisalto: string | undefined;
  linkTestId: string;
  t: TFunction;
  children: React.ReactNode;
};

export const HakijanIlmoittamaFieldWrapper = ({
  hakijanIlmoittamaSisalto,
  linkTestId,
  t,
  children,
}: HakijanIlmoittamaFieldWrapperProps) => {
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);

  return (
    <Stack direction="column" gap={0.5}>
      {children}
      <Box>
        <OphButton
          variant="text"
          size="small"
          sx={{
            padding: 0,
            minWidth: 'auto',
            textTransform: 'none',
            color: 'primary.main',
            fontWeight: 400,
          }}
          onClick={(event) => setAnchorEl(event.currentTarget)}
          data-testid={linkTestId}
        >
          {t('hakemus.tutkinnot.hakijanIlmoittamaTieto.linkki')}
        </OphButton>
      </Box>
      <HakijanIlmoittamaPopover
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        sisalto={hakijanIlmoittamaSisalto}
      />
    </Stack>
  );
};
