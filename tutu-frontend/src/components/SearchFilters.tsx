'use client';

import CloseIcon from '@mui/icons-material/Close';
import {
  Autocomplete,
  Grid2 as Grid,
  InputAdornment,
  TextField,
} from '@mui/material';
import {
  OphFormFieldWrapper,
  OphInputFormField,
} from '@opetushallitus/oph-design-system';

import { useKoodistoOptions } from '@/src/hooks/useKoodistoOptions';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import { OphSelectOption } from '@/src/lib/types/common';

export type SearchFiltersValues = {
  suoritusmaa: string;
  paattymisVuosi: string;
  todistusVuosi: string;
  oppilaitos: string;
  tutkinnonNimi: string;
  paaAine: string;
};

type Props = {
  values: SearchFiltersValues;
  setSuoritusmaa: (v: string) => void;
  setPaattymisVuosi: (v: string) => void;
  setTodistusVuosi: (v: string) => void;
  setOppilaitos: (v: string) => void;
  setTutkinnonNimi: (v: string) => void;
  setPaaaine: (v: string) => void;
};

export const SearchFilters = ({
  values,
  setSuoritusmaa,
  setPaattymisVuosi,
  setTodistusVuosi,
  setOppilaitos,
  setTutkinnonNimi,
  setPaaaine,
}: Props) => {
  const { t } = useTranslations();
  const { maatJaValtiotOptions } = useKoodistoOptions();

  const selectedSuoritusmaa =
    maatJaValtiotOptions.find((o) => o.value === values.suoritusmaa) ?? null;

  const clearAdornment = (onClear: () => void, show: boolean) =>
    show ? (
      <InputAdornment position="end">
        <CloseIcon sx={{ cursor: 'pointer' }} onClick={onClear} />
      </InputAdornment>
    ) : undefined;

  return (
    <Grid container spacing={2} sx={{ paddingTop: 1 }} size={12}>
      <Grid size={4}>
        <OphFormFieldWrapper
          label={t('haku.suoritusmaa')}
          sx={{ width: '100%' }}
          renderInput={() => (
            <Autocomplete<OphSelectOption>
              options={maatJaValtiotOptions}
              getOptionLabel={(o) => o.label}
              isOptionEqualToValue={(o, v) => o.value === v.value}
              value={selectedSuoritusmaa}
              onChange={(_, newValue) => setSuoritusmaa(newValue?.value ?? '')}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder={
                    !selectedSuoritusmaa ? t('yleiset.valitse') : undefined
                  }
                />
              )}
              data-testid="haku-suoritusmaa"
              sx={{
                '& .MuiAutocomplete-clearIndicator': {
                  visibility: selectedSuoritusmaa ? 'visible' : 'hidden',
                },
              }}
            />
          )}
        />
      </Grid>
      <Grid size={4}>
        <OphInputFormField
          label={t('haku.paattymisVuosi')}
          value={values.paattymisVuosi}
          onChange={(e) => setPaattymisVuosi(e.target.value.replace(/\D/g, ''))}
          data-testid="haku-paattymisvuosi"
          sx={{ width: '100%' }}
          endAdornment={clearAdornment(
            () => setPaattymisVuosi(''),
            !!values.paattymisVuosi,
          )}
        />
      </Grid>
      <Grid size={4}>
        <OphInputFormField
          label={t('haku.todistusVuosi')}
          value={values.todistusVuosi}
          onChange={(e) => setTodistusVuosi(e.target.value.replace(/\D/g, ''))}
          data-testid="haku-todistusvuosi"
          sx={{ width: '100%' }}
          endAdornment={clearAdornment(
            () => setTodistusVuosi(''),
            !!values.todistusVuosi,
          )}
        />
      </Grid>
      <Grid size={4}>
        <OphInputFormField
          label={t('haku.oppilaitos')}
          value={values.oppilaitos}
          onChange={(e) => setOppilaitos(e.target.value)}
          data-testid="haku-oppilaitos"
          sx={{ width: '100%' }}
          endAdornment={clearAdornment(
            () => setOppilaitos(''),
            !!values.oppilaitos,
          )}
        />
      </Grid>
      <Grid size={4}>
        <OphInputFormField
          label={t('haku.tutkinnonNimi')}
          value={values.tutkinnonNimi}
          onChange={(e) => setTutkinnonNimi(e.target.value)}
          data-testid="haku-tutkinnonnimi"
          sx={{ width: '100%' }}
          endAdornment={clearAdornment(
            () => setTutkinnonNimi(''),
            !!values.tutkinnonNimi,
          )}
        />
      </Grid>
      <Grid size={4}>
        <OphInputFormField
          label={t('haku.paaAine')}
          value={values.paaAine}
          onChange={(e) => setPaaaine(e.target.value)}
          data-testid="haku-paaAine"
          sx={{ width: '100%' }}
          endAdornment={clearAdornment(() => setPaaaine(''), !!values.paaAine)}
        />
      </Grid>
    </Grid>
  );
};
