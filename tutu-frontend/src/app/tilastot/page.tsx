import RemoveIcon from '@mui/icons-material/Remove';
import { Grid, Stack } from '@mui/system';
import { OphButton, OphTypography } from '@opetushallitus/oph-design-system';
import React from 'react';

import Header from '@/src/app/tilastot/components/Header';
import { BoxWrapper } from '@/src/components/BoxWrapper';
import { CalendarComponent } from '@/src/components/calendar-component';
import { PageLayout } from '@/src/components/PageLayout';
import { useCsvDownload } from '@/src/hooks/useCsvDownload';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';

export default function TilastotPage() {
  const { t } = useTranslations();

  const [alkupvm, setAlkupvm] = React.useState<Date | null>(
    new Date(new Date().getFullYear(), 0, 1),
  );
  const [loppupvm, setLoppupvm] = React.useState<Date | null>(new Date());
  const { startDownload, loading } = useCsvDownload(alkupvm, loppupvm);

  return (
    <PageLayout header={<Header />}>
      <BoxWrapper sx={{ height: '100%' }}>
        <Stack spacing={3}>
          <OphTypography variant={'h2'}>
            {t('tilastot.tilastokeskukselle')}
          </OphTypography>
          <OphTypography variant={'body1'}>
            {t('tilastot.aikavali.ohje')}
          </OphTypography>
          <Grid container columns={15} columnSpacing={2} sx={{ width: '30%' }}>
            <Grid size={8}>
              <OphTypography variant={'label'}>
                {t('tilastot.alkupvm')}
              </OphTypography>
            </Grid>
            <Grid size={7}>
              <OphTypography variant={'label'}>
                {t('tilastot.loppupvm')}
              </OphTypography>
            </Grid>
            <Grid size={7}>
              <CalendarComponent
                setDate={setAlkupvm}
                selectedValue={alkupvm}
                maxDate={loppupvm}
                dataTestId="tilastot-alkupvm"
              />
            </Grid>
            <Grid size={'grow'} sx={{ alignSelf: 'center' }}>
              <RemoveIcon />
            </Grid>
            <Grid size={7}>
              <CalendarComponent
                setDate={setLoppupvm}
                selectedValue={loppupvm}
                minDate={alkupvm}
                dataTestId="tilastot-loppupvm"
              />
            </Grid>
          </Grid>
          <OphButton
            data-testid="tilastot-lataa"
            variant="contained"
            sx={{ width: '16%' }}
            disabled={loading}
            onClick={startDownload}
          >
            {t('tilastot.lataa')}
          </OphButton>
        </Stack>
      </BoxWrapper>
    </PageLayout>
  );
}
