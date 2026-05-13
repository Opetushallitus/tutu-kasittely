'use client';

import CloseIcon from '@mui/icons-material/Close';
import {
  Autocomplete,
  Checkbox,
  Divider,
  FormControlLabel,
  Grid2 as Grid,
  InputAdornment,
  SelectChangeEvent,
  TextField,
} from '@mui/material';
import {
  OphButton,
  OphFormFieldWrapper,
  OphInputFormField,
  OphSelectFormField,
} from '@opetushallitus/oph-design-system';

import {
  erotKoulutuksessaOptions,
  paatostyyppiOptions,
  ratkaisutyyppiOptions,
  tutkinnonTasoOptions,
} from '@/src/app/hakemus/[oid]/paatostiedot/constants';
import { useEsittelijat } from '@/src/hooks/useEsittelijat';
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
  kelpoisuus: string;
  opetettavatAineet: string;
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
  setSuoritusmaa: (v: string) => void;
  setPaattymisVuosi: (v: string) => void;
  setTodistusVuosi: (v: string) => void;
  setOppilaitos: (v: string) => void;
  setTutkinnonNimi: (v: string) => void;
  setPaaAine: (v: string) => void;
  setKelpoisuus: (v: string) => void;
  setOpetettavatAineet: (v: string) => void;
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
}: SearchFiltersProps) => {
  const { t } = useTranslations();
  const { maatJaValtiotOptions } = useKoodistoOptions();
  const { options: esittelijaOptions } = useEsittelijat();

  const selectedSuoritusmaa =
    maatJaValtiotOptions.find((o) => o.value === values.suoritusmaa) ?? null;

  const clearAdornment = (onClear: () => void, show: boolean) =>
    show ? (
      <InputAdornment position="end">
        <CloseIcon sx={{ cursor: 'pointer' }} onClick={onClear} />
      </InputAdornment>
    ) : undefined;

  const emptyOption = { value: '', label: t('yleiset.valitse') };

  const sovellettuLakiAllOptions = [
    emptyOption,
    { value: 'uo', label: t('hakemus.paatos.sovellettuLaki.uo') },
    { value: 'ap', label: t('hakemus.paatos.sovellettuLaki.ap') },
    { value: 'ap_seut', label: t('hakemus.paatos.sovellettuLaki.ap_seut') },
    { value: 'ro', label: t('hakemus.paatos.sovellettuLaki.ro') },
  ];

  const kelpoisuusOptions = [
    emptyOption,
    ...erotKoulutuksessaOptions
      .filter((o) => o.kelpoisuusKey && o.lyhytNimiKaannosAvain)
      .map((o) => ({
        value: o.kelpoisuusKey!,
        label: t(o.lyhytNimiKaannosAvain!),
      })),
  ];

  return (
    <Grid container spacing={2} sx={{ paddingTop: 1 }} size={12}>
      {/* ── Tutkinto-filtterit ── */}
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
          onChange={(e) => setPaaAine(e.target.value)}
          data-testid="haku-paaaine"
          sx={{ width: '100%' }}
          endAdornment={clearAdornment(() => setPaaAine(''), !!values.paaAine)}
        />
      </Grid>

      <Grid size={12}>
        <Divider />
      </Grid>

      {/* ── Päätös-filtterit – rivi 1: Ratkaisutyyppi, Päätöstyyppi, Sovellettu laki ── */}
      <Grid size={4}>
        <OphSelectFormField
          label={t('hakemus.paatos.ratkaisutyyppi.otsikko')}
          options={[emptyOption, ...ratkaisutyyppiOptions(t)]}
          value={values.ratkaisutyyppi}
          onChange={(e: SelectChangeEvent) => setRatkaisutyyppi(e.target.value)}
          data-testid="haku-ratkaisutyyppi"
          sx={{ width: '100%' }}
        />
      </Grid>
      <Grid size={4}>
        <OphSelectFormField
          label={t('hakemus.paatos.paatostyyppi.otsikko')}
          options={[emptyOption, ...paatostyyppiOptions(t)]}
          value={values.paatostyyppi}
          onChange={(e: SelectChangeEvent) => setPaatostyyppi(e.target.value)}
          data-testid="haku-paatostyyppi"
          sx={{ width: '100%' }}
        />
      </Grid>
      <Grid size={4}>
        <OphSelectFormField
          label={t('hakemus.paatos.sovellettuLaki.otsikko')}
          options={sovellettuLakiAllOptions}
          value={values.sovellettuLaki}
          onChange={(e: SelectChangeEvent) => setSovellettuLaki(e.target.value)}
          data-testid="haku-sovellettu-laki"
          sx={{ width: '100%' }}
        />
      </Grid>

      {/* ── Päätös-filtterit – rivi 2: Kelpoisuus, Opetettavat aineet, Tutkinnon taso ── */}
      <Grid size={4}>
        <OphSelectFormField
          label={t('hakemus.paatos.paatostyyppi.kelpoisuus.otsikko')}
          options={kelpoisuusOptions}
          value={values.kelpoisuus}
          onChange={(e: SelectChangeEvent) => setKelpoisuus(e.target.value)}
          data-testid="haku-kelpoisuus"
          sx={{ width: '100%' }}
        />
      </Grid>
      <Grid size={4}>
        <OphInputFormField
          label={t('haku.opetettavatAineet')}
          value={values.opetettavatAineet}
          onChange={(e) => setOpetettavatAineet(e.target.value)}
          data-testid="haku-opetettavat-aineet"
          sx={{ width: '100%' }}
          endAdornment={clearAdornment(
            () => setOpetettavatAineet(''),
            !!values.opetettavatAineet,
          )}
        />
      </Grid>
      <Grid size={4}>
        <OphSelectFormField
          label={t('hakemus.paatos.tutkinto.tutkinnonTaso')}
          options={[emptyOption, ...tutkinnonTasoOptions(t)]}
          value={values.tutkinnonTaso}
          onChange={(e: SelectChangeEvent) => setTutkinnonTaso(e.target.value)}
          data-testid="haku-tutkinnon-taso"
          sx={{ width: '100%' }}
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
        <OphSelectFormField
          label={t('hakemuslista.esittelija')}
          options={[emptyOption, ...esittelijaOptions]}
          value={values.esittelijaOid}
          onChange={(e: SelectChangeEvent) => setEsittelijaOid(e.target.value)}
          data-testid="haku-esittelija"
          sx={{ width: '100%' }}
        />
      </Grid>
      <Grid size={4}>
        <OphInputFormField
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
