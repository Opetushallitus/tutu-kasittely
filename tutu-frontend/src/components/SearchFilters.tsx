'use client';

import CloseIcon from '@mui/icons-material/Close';
import {
  Autocomplete,
  Checkbox,
  Divider,
  FormControlLabel,
  Grid2 as Grid,
  InputAdornment,
  TextField,
} from '@mui/material';
import {
  OphButton,
  OphFormFieldWrapper,
  OphInputFormField,
} from '@opetushallitus/oph-design-system';

import {
  paatostyyppiOptions,
  ratkaisutyyppiOptions,
  tutkinnonTasoOptions,
} from '@/src/app/hakemus/[oid]/paatostiedot/constants';
import { SelectTreeDropdown } from '@/src/components/SelectTreeDropdown';
import { kelpoisuusFilterTreeOptions } from '@/src/constants/kelpoisuusFilterOptions';
import { opetettavaAineTreeOptions } from '@/src/constants/opetettavaAineFilterOptions';
import { useEsittelijat } from '@/src/hooks/useEsittelijat';
import { useKoodistoOptions } from '@/src/hooks/useKoodistoOptions';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import { OphSelectOption } from '@/src/lib/types/common';

const clearAdornment = (onClear: () => void, show: boolean) =>
  show ? (
    <InputAdornment position="end">
      <CloseIcon sx={{ cursor: 'pointer' }} onClick={onClear} />
    </InputAdornment>
  ) : undefined;

const autocompleteSx = (show: boolean) => ({
  '& .MuiAutocomplete-clearIndicator': {
    visibility: show ? 'visible' : 'hidden',
  },
  '& .MuiAutocomplete-clearIndicator svg': { fontSize: '1.5rem' },
});

export type SearchFiltersValues = {
  suoritusmaa: string[];
  paattymisVuosi: string;
  todistusVuosi: string;
  oppilaitos: string;
  tutkinnonNimi: string;
  paaAine: string;
  kelpoisuus: string;
  opetettavatAineet: string[];
  ratkaisutyyppi: string;
  paatostyyppi: string;
  sovellettuLaki: string;
  tutkinnonTaso: string;
  kielteinen: string;
  myonteinen: string;
  esittelijaOid: string;
  hakijanNimi: string;
  asiatunnus: string;
};

type SearchFiltersProps = {
  values: SearchFiltersValues;
  setSuoritusmaa: (v: string[]) => void;
  setPaattymisVuosi: (v: string) => void;
  setTodistusVuosi: (v: string) => void;
  setOppilaitos: (v: string) => void;
  setTutkinnonNimi: (v: string) => void;
  setPaaAine: (v: string) => void;
  setKelpoisuus: (v: string) => void;
  setOpetettavatAineet: (v: string[]) => void;
  setRatkaisutyyppi: (v: string) => void;
  setPaatostyyppi: (v: string) => void;
  setSovellettuLaki: (v: string) => void;
  setTutkinnonTaso: (v: string) => void;
  setKielteinen: (v: string) => void;
  setMyonteinen: (v: string) => void;
  setEsittelijaOid: (v: string) => void;
  setHakijanNimi: (v: string) => void;
  setAsiatunnus: (v: string) => void;
  onClearAll: () => void;
  onSubmit: () => void;
};

export const SearchFilters = ({
  values,
  setSuoritusmaa,
  setPaattymisVuosi,
  setTodistusVuosi,
  setOppilaitos,
  setTutkinnonNimi,
  setPaaAine,
  setKelpoisuus,
  setOpetettavatAineet,
  setRatkaisutyyppi,
  setPaatostyyppi,
  setSovellettuLaki,
  setTutkinnonTaso,
  setKielteinen,
  setMyonteinen,
  setEsittelijaOid,
  setHakijanNimi,
  setAsiatunnus,
  onClearAll,
  onSubmit,
}: SearchFiltersProps) => {
  const { t } = useTranslations();

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSubmit();
    }
  };

  const { maatJaValtiotOptions } = useKoodistoOptions();
  const { options: esittelijaOptions } = useEsittelijat();

  const ratkaisutyyppiOpts = ratkaisutyyppiOptions(t);
  const paatostyyppiOpts = paatostyyppiOptions(t);
  const tutkinnonTasoOpts = tutkinnonTasoOptions(t);

  const sovellettuLakiOpts = [
    { value: 'uo', label: t('hakemus.paatos.sovellettuLaki.uo') },
    { value: 'ap', label: t('hakemus.paatos.sovellettuLaki.ap') },
    { value: 'ap_seut', label: t('hakemus.paatos.sovellettuLaki.ap_seut') },
    { value: 'ro', label: t('hakemus.paatos.sovellettuLaki.ro') },
  ];

  const selectedRatkaisutyyppi = values.ratkaisutyyppi
    ? (ratkaisutyyppiOpts.find((o) => o.value === values.ratkaisutyyppi) ??
      null)
    : null;

  const selectedPaatostyyppi = values.paatostyyppi
    ? (paatostyyppiOpts.find((o) => o.value === values.paatostyyppi) ?? null)
    : null;

  const selectedSovellettuLaki = values.sovellettuLaki
    ? (sovellettuLakiOpts.find((o) => o.value === values.sovellettuLaki) ??
      null)
    : null;

  const selectedTutkinnonTaso = values.tutkinnonTaso
    ? (tutkinnonTasoOpts.find((o) => o.value === values.tutkinnonTaso) ?? null)
    : null;

  const selectedEsittelija = values.esittelijaOid
    ? (esittelijaOptions.find((o) => o.value === values.esittelijaOid) ?? null)
    : null;

  return (
    <Grid container spacing={2} sx={{ paddingTop: 1 }} size={12}>
      {/* ── Tutkinto-filtterit ── */}
      <Grid size={4}>
        <SelectTreeDropdown
          label={t('haku.suoritusmaa')}
          options={maatJaValtiotOptions}
          value={values.suoritusmaa}
          onChange={setSuoritusmaa}
          multiple
          autocomplete
          data-testid="haku-suoritusmaa"
          placeholder={t('yleiset.valitse')}
        />
      </Grid>
      <Grid size={4}>
        <OphInputFormField
          onKeyDown={handleKeyDown}
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
          onKeyDown={handleKeyDown}
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
          onKeyDown={handleKeyDown}
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
          onKeyDown={handleKeyDown}
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
          onKeyDown={handleKeyDown}
          label={t('haku.paaAine')}
          value={values.paaAine}
          onChange={(e) => setPaaAine(e.target.value)}
          data-testid="haku-paaaine"
          sx={{ width: '100%' }}
          endAdornment={clearAdornment(() => setPaaAine(''), !!values.paaAine)}
        />
      </Grid>

      <Grid size={12}>
        <Divider />
      </Grid>

      {/* ── Päätös-filtterit: Ratkaisutyyppi, Päätöstyyppi, Sovellettu laki
                               Kelpoisuus, Opetettavat aineet, Tutkinnon taso ── */}
      <Grid size={4}>
        <OphFormFieldWrapper
          label={t('hakemus.paatos.ratkaisutyyppi.otsikko')}
          sx={{ width: '100%' }}
          renderInput={() => (
            <Autocomplete<OphSelectOption>
              options={ratkaisutyyppiOpts}
              getOptionLabel={(o) => o.label}
              value={selectedRatkaisutyyppi}
              onChange={(_, newValue) =>
                setRatkaisutyyppi(newValue?.value ?? '')
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder={
                    !selectedRatkaisutyyppi ? t('yleiset.valitse') : undefined
                  }
                />
              )}
              data-testid="haku-ratkaisutyyppi"
              sx={autocompleteSx(!!selectedRatkaisutyyppi)}
            />
          )}
        />
      </Grid>
      <Grid size={4}>
        <OphFormFieldWrapper
          label={t('hakemus.paatos.paatostyyppi.otsikko')}
          sx={{ width: '100%' }}
          renderInput={() => (
            <Autocomplete<OphSelectOption>
              options={paatostyyppiOpts}
              getOptionLabel={(o) => o.label}
              value={selectedPaatostyyppi}
              onChange={(_, newValue) => setPaatostyyppi(newValue?.value ?? '')}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder={
                    !selectedPaatostyyppi ? t('yleiset.valitse') : undefined
                  }
                />
              )}
              data-testid="haku-paatostyyppi"
              sx={autocompleteSx(!!selectedPaatostyyppi)}
            />
          )}
        />
      </Grid>
      <Grid size={4}>
        <OphFormFieldWrapper
          label={t('hakemus.paatos.sovellettuLaki.otsikko')}
          sx={{ width: '100%' }}
          renderInput={() => (
            <Autocomplete<OphSelectOption>
              options={sovellettuLakiOpts}
              getOptionLabel={(o) => o.label}
              value={selectedSovellettuLaki}
              onChange={(_, newValue) =>
                setSovellettuLaki(newValue?.value ?? '')
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder={
                    !selectedSovellettuLaki ? t('yleiset.valitse') : undefined
                  }
                />
              )}
              data-testid="haku-sovellettu-laki"
              sx={autocompleteSx(!!selectedSovellettuLaki)}
            />
          )}
        />
      </Grid>

      <Grid size={4}>
        <SelectTreeDropdown
          label={t('hakemus.paatos.paatostyyppi.kelpoisuus.otsikko')}
          value={values.kelpoisuus}
          options={kelpoisuusFilterTreeOptions(t)}
          data-testid="haku-kelpoisuus"
          onChange={setKelpoisuus}
          placeholder={t('yleiset.valitse')}
        />
      </Grid>
      <Grid size={4}>
        <SelectTreeDropdown
          label={t('haku.opetettavatAineet')}
          value={values.opetettavatAineet}
          options={opetettavaAineTreeOptions(t)}
          data-testid="haku-opetettavat-aineet"
          onChange={setOpetettavatAineet}
          multiple
          placeholder={t('yleiset.valitse')}
        />
      </Grid>
      <Grid size={4}>
        <OphFormFieldWrapper
          label={t('hakemus.paatos.tutkinto.tutkinnonTaso')}
          sx={{ width: '100%' }}
          renderInput={() => (
            <Autocomplete<OphSelectOption>
              options={tutkinnonTasoOpts}
              getOptionLabel={(o) => o.label}
              value={selectedTutkinnonTaso}
              onChange={(_, newValue) =>
                setTutkinnonTaso(newValue?.value ?? '')
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder={
                    !selectedTutkinnonTaso ? t('yleiset.valitse') : undefined
                  }
                />
              )}
              data-testid="haku-tutkinnon-taso"
              sx={autocompleteSx(!!selectedTutkinnonTaso)}
            />
          )}
        />
      </Grid>

      {/* ── Päätös on: Kielteinen / Myönteinen ── */}
      <Grid size={12} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <OphFormFieldWrapper
          label={t('haku.paatosOn')}
          sx={{ width: '100%' }}
          renderInput={() => (
            <Grid container sx={{ gap: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={values.kielteinen === 'true'}
                    onChange={(e) =>
                      setKielteinen(e.target.checked ? 'true' : '')
                    }
                    data-testid="haku-kielteinen"
                  />
                }
                label={t('hakemus.paatos.kielteinen')}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={values.myonteinen === 'true'}
                    onChange={(e) =>
                      setMyonteinen(e.target.checked ? 'true' : '')
                    }
                    data-testid="haku-myonteinen"
                  />
                }
                label={t('hakemus.paatos.myonteinen')}
              />
            </Grid>
          )}
        />
      </Grid>

      <Grid size={12}>
        <Divider />
      </Grid>

      {/* ── Hakija/esittelijä-filtterit ── */}
      <Grid size={4}>
        <OphFormFieldWrapper
          label={t('hakemuslista.esittelija')}
          sx={{ width: '100%' }}
          renderInput={() => (
            <Autocomplete<OphSelectOption>
              options={esittelijaOptions}
              getOptionLabel={(o) => o.label}
              value={selectedEsittelija}
              onChange={(_, newValue) =>
                setEsittelijaOid(newValue?.value ?? '')
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder={
                    !selectedEsittelija ? t('yleiset.valitse') : undefined
                  }
                />
              )}
              data-testid="haku-esittelija"
              sx={autocompleteSx(!!selectedEsittelija)}
            />
          )}
        />
      </Grid>
      <Grid size={4}>
        <OphInputFormField
          onKeyDown={handleKeyDown}
          label={t('hakemuslista.hakija')}
          value={values.hakijanNimi}
          onChange={(e) => setHakijanNimi(e.target.value)}
          data-testid="haku-hakijan-nimi"
          sx={{ width: '100%' }}
          endAdornment={clearAdornment(
            () => setHakijanNimi(''),
            !!values.hakijanNimi,
          )}
        />
      </Grid>
      <Grid size={4}>
        <OphInputFormField
          onKeyDown={handleKeyDown}
          label={t('hakemuslista.asiatunnus')}
          value={values.asiatunnus}
          onChange={(e) => setAsiatunnus(e.target.value)}
          data-testid="haku-asiatunnus"
          sx={{ width: '100%' }}
          endAdornment={clearAdornment(
            () => setAsiatunnus(''),
            !!values.asiatunnus,
          )}
        />
      </Grid>

      {/* ── Tyhjennä-nappi ── */}
      <Grid size={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <OphButton
          variant="text"
          sx={{ fontWeight: 400, px: 0 }}
          onClick={onClearAll}
        >
          {t('haku.tyhjennaHakuehdot')}
        </OphButton>
      </Grid>
    </Grid>
  );
};
