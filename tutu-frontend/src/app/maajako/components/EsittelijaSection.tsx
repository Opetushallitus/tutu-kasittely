import { Box, Chip } from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import {
  OphSelectFormField,
  OphTypography,
} from '@opetushallitus/oph-design-system';
import { QueryObserverResult, RefetchOptions } from '@tanstack/react-query';

import { Esittelija } from '@/src/lib/types/esittelija';

import { TFunction } from '../../../lib/localization/hooks/useTranslations';
import { Maakoodi } from '../../../lib/types/maakoodi';

interface EsittelijaSectionProps {
  esittelija: Esittelija;
  maakoodit: Maakoodi[] | undefined;
  t: TFunction;
}

const filterMaakooditByEsittelija = (
  maakoodit: Maakoodi[] | undefined,
  esittelijaId: string | null | undefined,
) =>
  maakoodit
    ?.filter((maakoodi) => maakoodi.esittelijaId === esittelijaId)
    .map((maakoodi) => maakoodi.fi) || [];

export const EsittelijaSection = ({
  esittelija,
  maakoodit,
  t,
}: EsittelijaSectionProps) => {
  const maakooditForEsittelija = filterMaakooditByEsittelija(
    maakoodit,
    esittelija.id,
  );

  return (
    <>
      <OphTypography variant={'h4'}>
        {esittelija.etunimi} {esittelija.sukunimi}
      </OphTypography>

      <OphTypography variant={'label'}>
        {t('maajako.tutkinnonsuoritusmaat')}
      </OphTypography>

      <OphTypography variant={'body1'}>
        {maakooditForEsittelija.length > 0
          ? maakooditForEsittelija.join(', ')
          : '-'}
      </OphTypography>
    </>
  );
};

interface SetMaakoodiToUpdateParams {
  id: string;
  esittelijaId?: string;
}

interface EditEsittelijaSectionProps {
  esittelija: Esittelija;
  maakoodit: Maakoodi[];
  maakooditWithoutEsittelija: Maakoodi[];

  t: TFunction;
  setMaakoodiToUpdate: (any: SetMaakoodiToUpdateParams) => void;
  updateMaakoodi: (
    options?: RefetchOptions | undefined,
  ) => Promise<QueryObserverResult<null, Error>>;
}

export const EditEsittelijaSection = ({
  esittelija,
  maakoodit,
  maakooditWithoutEsittelija,

  t,
  setMaakoodiToUpdate,
  updateMaakoodi,
}: EditEsittelijaSectionProps) => {
  return (
    <>
      <OphTypography variant={'h4'}>
        {esittelija.etunimi} {esittelija.sukunimi}
      </OphTypography>
      <OphSelectFormField
        placeholder="yleiset.valitse"
        label={t('maajako.tutkinnonsuoritusmaat')}
        multiple
        data-testid={`esittelija-maaselection-${esittelija.id}`}
        options={maakooditWithoutEsittelija.map((maakoodi) => ({
          label: maakoodi.fi,
          value: maakoodi.koodiUri,
        }))}
        value={
          (maakoodit
            .filter((maakoodi) => maakoodi.esittelijaId === esittelija.id)
            .map((maakoodi) => maakoodi.koodiUri) as never) || ''
        }
        onChange={(event: SelectChangeEvent) => {
          const selectedValues = Array.isArray(event.target.value)
            ? event.target.value
            : [event.target.value];

          const newMaakoodi = maakoodit?.find(
            (maakoodi) =>
              selectedValues.includes(maakoodi.koodiUri) &&
              maakoodi.esittelijaId === null,
          );

          if (newMaakoodi && esittelija.id) {
            setMaakoodiToUpdate({
              id: newMaakoodi.id,
              esittelijaId: esittelija.id,
            });
          }
        }}
        sx={{ width: '100%' }}
        renderValue={(selected) => (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {Array.isArray(selected) &&
              maakoodit
                .filter((maakoodi) => selected.includes(maakoodi.koodiUri))
                .map((maakoodi) => (
                  <Chip
                    key={maakoodi.koodiUri}
                    label={maakoodi.fi}
                    sx={{ borderRadius: '0px' }}
                    data-testid={`maakoodi-chip-${maakoodi.koodiUri}`}
                    onDelete={() => {
                      if (maakoodi && esittelija.id) {
                        setMaakoodiToUpdate({
                          id: maakoodi.id,
                          esittelijaId: undefined,
                        });
                        updateMaakoodi();
                      }
                    }}
                    onMouseDown={(event) => {
                      event.stopPropagation();
                    }}
                  />
                ))}
          </Box>
        )}
      ></OphSelectFormField>
    </>
  );
};
