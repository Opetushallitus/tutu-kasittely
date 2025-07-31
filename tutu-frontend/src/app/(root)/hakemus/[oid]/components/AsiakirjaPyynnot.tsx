'use client';
import { styled } from '@/src/lib/theme';
import { ophColors, OphTypography } from '@opetushallitus/oph-design-system';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CloseIcon from '@mui/icons-material/Close';
import React from 'react';
import { Stack } from '@mui/material';
import { StyledTooltip } from '@/src/components/ToolTip';

export const AsiakirjaPyynnot = () => {
  const { t } = useTranslations();
  const [open, setOpen] = React.useState(false);

  const handleTooltipClose = () => {
    setOpen(false);
  };

  const handleTooltipOpen = () => {
    setOpen(true);
  };

  const StyledInfoOutlinedIcon = styled(InfoOutlinedIcon)({
    color: ophColors.blue2,
  });

  const StyledCloseIcon = styled(CloseIcon)({
    color: ophColors.black,
  });

  const tarkistusLista = (
    <>
      <div
        style={{
          display: 'flex',
          alignItems: 'stretch',
          justifyContent: 'space-between',
        }}
      >
        <OphTypography variant="h4" style={{ paddingBottom: '10px' }}>
          {t('hakemus.asiakirjat.asiakirjapyynnot.lista')}
        </OphTypography>
        <StyledCloseIcon
          onClick={handleTooltipClose}
          style={{ alignSelf: 'top' }}
        />
      </div>
      <OphTypography variant="h5">
        {t('hakemus.asiakirjat.asiakirjapyynnot.tutkinnottaikoulutukset')}
      </OphTypography>
      <Stack direction="column" style={{ paddingBottom: '10px' }}>
        <OphTypography>
          {t(
            'hakemus.asiakirjat.asiakirjapyynnot.tutkintotodistustenjaljennokset',
          )}
        </OphTypography>
        <OphTypography>
          {t('hakemus.asiakirjat.asiakirjapyynnot.liitteidenjaljennokset')}
        </OphTypography>
        <OphTypography>
          {t(
            'hakemus.asiakirjat.asiakirjapyynnot.tutkintotodistustenkaannokset',
          )}
        </OphTypography>
        <OphTypography>
          {t('hakemus.asiakirjat.asiakirjapyynnot.liitteidenkaannokset')}
        </OphTypography>
        <OphTypography>
          {t(
            'hakemus.asiakirjat.asiakirjapyynnot.alkuperaisettutkintotodistukset',
          )}
        </OphTypography>
        <OphTypography>
          {t('hakemus.asiakirjat.asiakirjapyynnot.alkuperaisetliitteet')}
        </OphTypography>
        <OphTypography>
          {t('hakemus.asiakirjat.asiakirjapyynnot.vaitoskirja')}
        </OphTypography>
      </Stack>
      <OphTypography variant="h5">
        {t('hakemus.asiakirjat.asiakirjapyynnot.kelpoisuusammattiin')}
      </OphTypography>
      <Stack direction="column" style={{ paddingBottom: '10px' }}>
        <OphTypography>
          {t('hakemus.asiakirjat.asiakirjapyynnot.tyotodistukset')}
        </OphTypography>
        <OphTypography>
          {t('hakemus.asiakirjat.asiakirjapyynnot.ammattipatevyys')}
        </OphTypography>
      </Stack>
      <OphTypography variant="h5">
        {t('hakemus.asiakirjat.asiakirjapyynnot.henkilotiedot')}
      </OphTypography>
      <Stack direction="column" style={{ paddingBottom: '10px' }}>
        <OphTypography>
          {t('hakemus.asiakirjat.asiakirjapyynnot.kansalaisuus')}
        </OphTypography>
        <OphTypography>
          {t('hakemus.asiakirjat.asiakirjapyynnot.nimenmuutos')}
        </OphTypography>
      </Stack>
    </>
  );

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <OphTypography variant={'h2'}>
        {t('hakemus.asiakirjat.asiakirjapyynnot.otsikko')}
      </OphTypography>
      <StyledTooltip
        title={tarkistusLista}
        onClick={handleTooltipOpen}
        open={open}
      >
        <StyledInfoOutlinedIcon style={{ marginLeft: 8 }} />
      </StyledTooltip>
    </div>
  );
};
