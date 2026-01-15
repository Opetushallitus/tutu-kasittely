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
import React, { useEffect, useMemo } from 'react';
import {
  Divider,
  ListSubheader,
  MenuItem,
  Select,
  Stack,
  useTheme,
} from '@mui/material';
import { StyledTooltip } from '@/src/components/ToolTip';
import {
  PYYDETTAVAT_ASIAKIRJAT,
  LOPULLISEN_PAATOKSEN_PYYDETTAVAT_ASIAKIRJAT,
} from '@/src/app/hakemus/[oid]/asiakirjat/types';
import {
  AsiakirjaPyynto,
  AsiakirjaTietoUpdateCallback,
  LOPULLINEN_PAATOS_HAKEMUSKOSKEE,
} from '@/src/lib/types/hakemus';
import { DeleteOutline } from '@mui/icons-material';
import { IconButton } from '@/src/components/IconButton';

interface AsiakirjaPyynnotProps {
  asiakirjaPyynnot: AsiakirjaPyynto[];
  updateAsiakirjaTietoAction: AsiakirjaTietoUpdateCallback;
  hakemusKoskee: number;
}

interface AsiakirjaPyyntoProps {
  pyynto?: AsiakirjaPyynto | null;
  index?: number;
}

export const AsiakirjaPyynnot = ({
  asiakirjaPyynnot,
  updateAsiakirjaTietoAction,
  hakemusKoskee,
}: AsiakirjaPyynnotProps) => {
  const { t } = useTranslations();
  const theme = useTheme();

  const pyydettavatAsiakirjat =
    hakemusKoskee === LOPULLINEN_PAATOS_HAKEMUSKOSKEE
      ? LOPULLISEN_PAATOKSEN_PYYDETTAVAT_ASIAKIRJAT
      : PYYDETTAVAT_ASIAKIRJAT;

  const [currentAsiakirjaPyynnot, setCurrentAsiakirjaPyynnot] =
    React.useState<AsiakirjaPyynto[]>(asiakirjaPyynnot);
  const [toolTipOpen, setToolTipOpen] = React.useState(false);
  const [
    showEmptyAsiakirjaPyyntoDropdown,
    setShowEmptyAsiakirjaPyyntoDropdown,
  ] = React.useState(false);

  useEffect(() => {
    setCurrentAsiakirjaPyynnot(asiakirjaPyynnot);
  }, [asiakirjaPyynnot]);

  const addOrUpdateAsiakirjapyynto = (selectedValue: string, id?: string) => {
    const pyynto = {
      id: id || crypto.randomUUID(), // Käytä väliaikaista idtä niin uusien pyyntöjen poisto toimii
      asiakirjanTyyppi: selectedValue,
    };

    const toBePyynnot = id
      ? currentAsiakirjaPyynnot.map((p) => (p.id === id ? pyynto : p))
      : [...currentAsiakirjaPyynnot, pyynto];

    setCurrentAsiakirjaPyynnot(toBePyynnot);
    updateAsiakirjaTietoAction({
      pyydettavatAsiakirjat: toBePyynnot,
    });
    setShowEmptyAsiakirjaPyyntoDropdown(false);
  };

  const deleteAsiakirjapyynto = (id?: string) => {
    if (!id) {
      setShowEmptyAsiakirjaPyyntoDropdown(false);
      return;
    }
    const toBeAsiakirjaPyynnot = currentAsiakirjaPyynnot.filter(
      (pyynto) => pyynto.id !== id,
    );
    setCurrentAsiakirjaPyynnot(toBeAsiakirjaPyynnot);
    updateAsiakirjaTietoAction({
      pyydettavatAsiakirjat: toBeAsiakirjaPyynnot,
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

  const selectedTypes = useMemo(
    () => new Set(currentAsiakirjaPyynnot.map((p) => p.asiakirjanTyyppi)),
    [currentAsiakirjaPyynnot],
  );

  const pyydettavatAsiakirjatGroupedOptions = (excludeValue?: string) => {
    return Object.entries(pyydettavatAsiakirjat).map(
      ([category, items]: [string, string[]]) => {
        return [
          <ListSubheader key={`header-${category}`}>
            <OphTypography variant="h5">
              {t(`hakemus.asiakirjat.asiakirjapyynnot.otsikko.${category}`)}
            </OphTypography>
          </ListSubheader>,
          items.map((item) => {
            const isDisabled = selectedTypes.has(item) && item !== excludeValue;
            return (
              <MenuItem key={item} value={item} disabled={isDisabled}>
                <OphTypography style={{ paddingLeft: theme.spacing(1) }}>
                  {t(`hakemus.asiakirjat.asiakirjapyynnot.asiakirjat.${item}`)}
                </OphTypography>
              </MenuItem>
            );
          }),
        ];
      },
    );
  };

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
      {Object.entries(pyydettavatAsiakirjat).map(
        ([category, items]: [string, string[]]) => (
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
        ),
      )}
    </>
  );

  const AsiakirjaPyyntoItem = ({ pyynto, index }: AsiakirjaPyyntoProps) => (
    <Stack direction="row" alignItems={'center'}>
      <Stack direction="column" width="100%" gap={theme.spacing(1)}>
        <OphTypography variant="label">
          {t('hakemus.asiakirjat.asiakirja')}
        </OphTypography>
        <Select
          sx={{ width: '100%' }}
          data-testid="pyyda-asiakirja-select"
          value={pyynto?.asiakirjanTyyppi || ''}
          onChange={(e) =>
            addOrUpdateAsiakirjapyynto(e.target.value, pyynto?.id)
          }
        >
          {pyydettavatAsiakirjatGroupedOptions(pyynto?.asiakirjanTyyppi)}
        </Select>
      </Stack>

      <OphButton
        sx={{
          alignSelf: 'flex-end',
          paddingLeft: '32px',
          paddingRight: '16px',
        }}
        data-testid={`poista-asiakirja-button-${index}`}
        variant="text"
        startIcon={<DeleteOutline />}
        onClick={() => deleteAsiakirjapyynto(pyynto?.id)}
      >
        {t('yleiset.poista')}
      </OphButton>
    </Stack>
  );

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <OphTypography
          variant={'h3'}
          data-testid="pyydettavat-asiakirjat-otsikko"
        >
          {t(
            'hakemus.asiakirjat.asiakirjapyynnot.otsikko.pyydettavatasiakirjat',
          )}
        </OphTypography>
        <IconButton>
          <StyledTooltip
            title={asiakirjatTooltip}
            onClick={handleTooltipOpen}
            open={toolTipOpen}
          >
            <StyledInfoOutlinedIcon />
          </StyledTooltip>
        </IconButton>
      </div>
      {currentAsiakirjaPyynnot.length > 0 &&
        currentAsiakirjaPyynnot.map((pyynto, index) => (
          <AsiakirjaPyyntoItem pyynto={pyynto} key={pyynto.id} index={index} />
        ))}
      {showEmptyAsiakirjaPyyntoDropdown && <AsiakirjaPyyntoItem />}
      <Divider orientation="horizontal" />
      <OphButton
        data-testid="pyyda-asiakirja-button"
        variant="outlined"
        sx={{ width: '15%' }}
        onClick={() => setShowEmptyAsiakirjaPyyntoDropdown(true)}
      >
        {t('hakemus.asiakirjat.asiakirjapyynnot.pyyda')}
      </OphButton>
    </>
  );
};
