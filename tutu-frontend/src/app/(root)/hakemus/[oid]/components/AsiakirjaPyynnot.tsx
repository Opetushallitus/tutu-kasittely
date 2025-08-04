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
  SelectChangeEvent,
  Stack,
  useTheme,
} from '@mui/material';
import { StyledTooltip } from '@/src/components/ToolTip';
import { pyydettavatAsiakirjat } from '@/src/app/(root)/hakemus/[oid]/components/types';
import { AsiakirjaPyynto } from '@/src/lib/types/hakemus';
import { useHakemus } from '@/src/context/HakemusContext';

interface AsiakirjaPyynnotProps {
  asiakirjaPyynnot: AsiakirjaPyynto[] | [];
}
export const AsiakirjaPyynnot = ({
  asiakirjaPyynnot,
}: AsiakirjaPyynnotProps) => {
  const { t } = useTranslations();
  const theme = useTheme();
  const { updateHakemus } = useHakemus();

  const [toolTipOpen, setToolTipOpen] = React.useState(false);
  const [showPyydaAsiakirjaDropdown, setShowPyydaAsiakirjaDropdown] =
    React.useState(false);

  const addAsiakirjapyynto = (value: string) => {
    updateHakemus({
      pyydettavatAsiakirjat: [...asiakirjaPyynnot, { asiakirjaTyyppi: value }],
    });
  };
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
        {items.map((item) => {
          const alreadyRequested = asiakirjaPyynnot?.some(
            (pyynto) => pyynto.asiakirjaTyyppi === item,
          );

          if (!alreadyRequested) {
            return (
              <MenuItem key={item} value={item}>
                <OphTypography style={{ paddingLeft: theme.spacing(1) }}>
                  {t(`hakemus.asiakirjat.asiakirjapyynnot.asiakirjat.${item}`)}
                </OphTypography>
              </MenuItem>
            );
          }
        })}{' '}
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
      {showPyydaAsiakirjaDropdown && (
        <FormControl sx={{ width: '80%' }}>
          <Select
            value={''}
            onChange={(event: SelectChangeEvent) =>
              addAsiakirjapyynto(event.target.value)
            }
          >
            {pyydettavatAsiakirjatGroupedOptions}
          </Select>
        </FormControl>
      )}
      {asiakirjaPyynnot &&
        asiakirjaPyynnot.map((pyynto) => (
          <FormControl key={pyynto.id} sx={{ width: '80%' }}>
            <Select
              value={pyynto.asiakirjaTyyppi}
              onChange={(event: SelectChangeEvent) =>
                addAsiakirjapyynto(event.target.value)
              }
            >
              {pyydettavatAsiakirjatGroupedOptions}
            </Select>
          </FormControl>
        ))}
      <OphButton
        variant="outlined"
        sx={{ width: '15%' }}
        onClick={() => setShowPyydaAsiakirjaDropdown(true)}
      >
        {t('hakemus.asiakirjat.asiakirjapyynnot.pyyda')}
      </OphButton>
    </>
  );
};
