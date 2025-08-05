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
import { DeleteOutline } from '@mui/icons-material';
import useToaster from '@/src/hooks/useToaster';
import { handleFetchError } from '@/src/lib/utils';

const emptyAsiakirjaPyynto: AsiakirjaPyynto = {
  asiakirjanTyyppi: '',
};

interface AsiakirjaPyynnotProps {
  asiakirjaPyynnot: AsiakirjaPyynto[] | [];
}

export const AsiakirjaPyynnot = ({
  asiakirjaPyynnot,
}: AsiakirjaPyynnotProps) => {
  const { t } = useTranslations();
  const theme = useTheme();
  const { updateHakemus } = useHakemus();
  const { addToast } = useToaster();
  console.log(asiakirjaPyynnot);
  console.log(asiakirjaPyynnot.length);
  const [toolTipOpen, setToolTipOpen] = React.useState(false);
  const [showPyydaAsiakirjaDropdown, setShowPyydaAsiakirjaDropdown] =
    React.useState(asiakirjaPyynnot.length > 0);

  const addAsiakirjapyynto = (event: SelectChangeEvent) => {
    const selectedValue = event.target.value;
    console.log('add ' + selectedValue);
    const selectedValueExists = asiakirjaPyynnot.some(
      (pyynto) => pyynto.asiakirjanTyyppi === selectedValue,
    );
    if (selectedValueExists) {
      handleFetchError(
        addToast,
        Error(),
        'virhe.duplikaatti-asiakirjapyynto',
        t,
      );
      return;
    }

    updateHakemus({
      pyydettavatAsiakirjat: [
        ...asiakirjaPyynnot,
        { asiakirjanTyyppi: selectedValue },
      ],
    });
  };

  const deleteAsiakirjapyynto = (value: string) => {
    console.log('delete ' + value);
    if (value === '') {
      setShowPyydaAsiakirjaDropdown(false);
      return;
    }
    updateHakemus({
      pyydettavatAsiakirjat: asiakirjaPyynnot.filter(
        (pyynto) => pyynto.asiakirjanTyyppi !== value,
      ),
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
    return [
      <ListSubheader key={`header-${category}`}>
        <OphTypography variant="h5">
          {t(`hakemus.asiakirjat.asiakirjapyynnot.otsikko.${category}`)}
        </OphTypography>
      </ListSubheader>,
      items.map((item) => (
        <MenuItem key={item} value={item}>
          <OphTypography style={{ paddingLeft: theme.spacing(1) }}>
            {t(`hakemus.asiakirjat.asiakirjapyynnot.asiakirjat.${item}`)}
          </OphTypography>
        </MenuItem>
      )),
    ];
  });

  const asiakirjatTooltip = (
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
        <OphTypography
          variant={'h2'}
          data-testid="pyydettavat-asiakirjat-otsikko"
        >
          {t(
            'hakemus.asiakirjat.asiakirjapyynnot.otsikko.pyydettavatasiakirjat',
          )}
        </OphTypography>
        <StyledTooltip
          title={asiakirjatTooltip}
          onClick={handleTooltipOpen}
          open={toolTipOpen}
        >
          <StyledInfoOutlinedIcon style={{ marginLeft: 8 }} />
        </StyledTooltip>
      </div>
      {showPyydaAsiakirjaDropdown &&
        [...asiakirjaPyynnot, emptyAsiakirjaPyynto].map((pyynto, index) => {
          return (
            <Stack direction="row" key={index}>
              <Select
                sx={{ width: '80%' }}
                data-testid="pyyda-asiakirja-select"
                value={pyynto.asiakirjanTyyppi}
                onChange={addAsiakirjapyynto}
              >
                {pyydettavatAsiakirjatGroupedOptions}
              </Select>
              <OphButton
                data-testid={`poista-asiakirja-button-${index}`}
                variant="text"
                startIcon={<DeleteOutline />}
                onClick={() => deleteAsiakirjapyynto(pyynto.asiakirjanTyyppi)}
              >
                {t('yleiset.poista')}
              </OphButton>
            </Stack>
          );
        })}
      <OphButton
        data-testid="pyyda-asiakirja-button"
        variant="outlined"
        sx={{ width: '15%' }}
        onClick={() => setShowPyydaAsiakirjaDropdown(true)}
      >
        {t('hakemus.asiakirjat.asiakirjapyynnot.pyyda')}
      </OphButton>
    </>
  );
};
