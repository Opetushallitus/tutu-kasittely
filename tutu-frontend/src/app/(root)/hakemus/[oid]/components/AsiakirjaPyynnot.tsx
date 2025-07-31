'use client';
import { styled } from '@/src/lib/theme';
import {
  OphButton,
  ophColors,
  OphTypography,
} from '@opetushallitus/oph-design-system';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CloseIcon from '@mui/icons-material/Close';
import React from 'react';
import {
  FormControl,
  ListSubheader,
  MenuItem,
  Select,
  Stack,
  useTheme,
} from '@mui/material';
import { StyledTooltip } from '@/src/components/ToolTip';
import { pyydettavatAsiakirjat } from '@/src/app/(root)/hakemus/[oid]/components/types';

export const AsiakirjaPyynnot = () => {
  const { t } = useTranslations();
  const theme = useTheme();
  const [toolTipOpen, setToolTipOpen] = React.useState(false);
  const [showPyydaAsiakirjaaDropdown, setShowPyydaAsiakirjaaDropdown] =
    React.useState(false);

  const handleTooltipClose = () => {
    setToolTipOpen(false);
  };

  const handleTooltipOpen = () => {
    setToolTipOpen(true);
  };

  const StyledInfoOutlinedIcon = styled(InfoOutlinedIcon)({
    color: ophColors.blue2,
  });

  const StyledCloseIcon = styled(CloseIcon)({
    color: ophColors.black,
  });

  const pyydettavatAsiakirjatGroupedOptions = Object.entries(
    pyydettavatAsiakirjat,
  ).map(([category, items]) => {
    return (
      <div key={category}>
        <ListSubheader>
          <OphTypography variant="h5">
            {t(`hakemus.asiakirjat.asiakirjapyynnot.otsikko.${category}`)}
          </OphTypography>
        </ListSubheader>

        {items.map((item) => (
          <MenuItem key={item} value={item}>
            <OphTypography style={{ paddingLeft: theme.spacing(1) }}>
              {t(`hakemus.asiakirjat.asiakirjapyynnot.asiakirjat.${item}`)}
            </OphTypography>
          </MenuItem>
        ))}
      </div>
    );
  });

  const pyydettavatAsiakirjatTarkistuslista = (
    <>
      <div
        style={{
          display: 'flex',
          alignItems: 'stretch',
          justifyContent: 'space-between',
        }}
      >
        <OphTypography variant="h4" style={{ paddingBottom: '10px' }}>
          {t('hakemus.asiakirjat.asiakirjapyynnot.otsikko.lista')}
        </OphTypography>
        <StyledCloseIcon
          onClick={handleTooltipClose}
          style={{ alignSelf: 'top' }}
        />
      </div>
      {Object.entries(pyydettavatAsiakirjat).map(([category, items]) => (
        <React.Fragment key={category}>
          <OphTypography variant="h5">
            {t(`hakemus.asiakirjat.asiakirjapyynnot.otsikko.${category}`)}
          </OphTypography>
          <Stack direction="column" style={{ paddingBottom: '10px' }}>
            {items.map((item) => (
              <OphTypography key={item}>
                {t(`hakemus.asiakirjat.asiakirjapyynnot.asiakirjat.${item}`)}
              </OphTypography>
            ))}
          </Stack>
        </React.Fragment>
      ))}
    </>
  );

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <OphTypography variant={'h2'}>
          {t(
            'hakemus.asiakirjat.asiakirjapyynnot.otsikko.pyydettavatasiakirjat',
          )}
        </OphTypography>
        <StyledTooltip
          title={pyydettavatAsiakirjatTarkistuslista}
          onClick={handleTooltipOpen}
          open={toolTipOpen}
        >
          <StyledInfoOutlinedIcon style={{ marginLeft: 8 }} />
        </StyledTooltip>
      </div>
      <OphButton
        variant="outlined"
        sx={{ width: '15%' }}
        onClick={() => setShowPyydaAsiakirjaaDropdown(true)}
      >
        {t('hakemus.asiakirjat.asiakirjapyynnot.pyyda')}
      </OphButton>
      {showPyydaAsiakirjaaDropdown && (
        <FormControl sx={{ width: '80%' }}>
          <Select
            value={'value'}
            label=""
            // onChange={(event: SelectChangeEvent) => null}
          >
            {pyydettavatAsiakirjatGroupedOptions}
          </Select>
        </FormControl>
      )}
    </>
  );
};
