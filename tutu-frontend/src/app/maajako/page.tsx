'use client';

import { Divider, Stack, useTheme } from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import {
  OphButton,
  OphSelectFormField,
  OphTypography,
} from '@opetushallitus/oph-design-system';
import React, { useEffect, useMemo, useState } from 'react';

import {
  EditEsittelijaSection,
  EsittelijaSection,
} from '@/src/app/maajako/components/EsittelijaSection';
import { SelectedMaakoodiInfo } from '@/src/app/maajako/components/SelectedMaakoodiInfo';
import { AlertBox } from '@/src/components/AlertBox';
import { BoxWrapper } from '@/src/components/BoxWrapper';
import { FullSpinner } from '@/src/components/FullSpinner';
import { SaveRibbon } from '@/src/components/SaveRibbon';
import { SuccessBox } from '@/src/components/SuccessBox';
import { useEsittelijat } from '@/src/hooks/useEsittelijat';
import { useMaakoodit, useUpdateMaakoodit } from '@/src/hooks/useMaakoodit';
import useToaster from '@/src/hooks/useToaster';
import {
  TFunction,
  useTranslations,
} from '@/src/lib/localization/hooks/useTranslations';
import { Maakoodi } from '@/src/lib/types/maakoodi';
import { handleFetchError } from '@/src/lib/utils';

type ChangeModelType = { [id: string]: string | null };

const sortMaakoodit = (maakoodit: Maakoodi[] | undefined) =>
  maakoodit?.slice().sort((a, b) => a.fi.localeCompare(b.fi)) || [];

export default function MaajakoPage() {
  const { t } = useTranslations();
  const theme = useTheme();
  const { addToast } = useToaster();

  const [sortedMaakoodit, setSortedMaakoodit] = useState([] as Maakoodi[]);
  const [selectedMaakoodi, setSelectedMaakoodi] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [initialHasChangesModel, setInitialHasChangesModel] = useState(
    {} as ChangeModelType,
  );
  const [hasChangesModel, setHasChangesModel] = useState({} as ChangeModelType);
  const [updateList, setUpdateList] = useState([] as Maakoodi[]);

  const {
    data: maakoodit,
    isLoading: maakooditIsLoading,
    error: maakooditError,
  } = useMaakoodit();
  const {
    data: esittelijat,
    isLoading: esittelijatIsLoading,
    error: esittelijatError,
  } = useEsittelijat();

  useUpdateMaakoodit(updateList);

  useEffect(() => {
    handleFetchError(addToast, maakooditError, 'virhe.maakoodiLataus', t);
  }, [maakooditError, addToast, t]);

  useEffect(() => {
    handleFetchError(addToast, esittelijatError, 'virhe.esittelijatLataus', t);
  }, [esittelijatError, addToast, t]);

  useEffect(() => {
    const initialSortedMaakoodit = sortMaakoodit(maakoodit);

    const initialHasChangesModel: ChangeModelType =
      initialSortedMaakoodit.reduce(
        (acc, maakoodi) => ({ ...acc, [maakoodi.id]: maakoodi.esittelijaId }),
        {},
      );

    setSortedMaakoodit(initialSortedMaakoodit);
    setInitialHasChangesModel(initialHasChangesModel);
  }, [maakoodit]);

  const maakooditWithoutEsittelija = useMemo(
    () => sortedMaakoodit.filter((maakoodi) => maakoodi.esittelijaId == null),
    [sortedMaakoodit],
  );

  const sortedMaakooditOptions = useMemo(() => {
    return sortedMaakoodit.map((maakoodi) => ({
      label: maakoodi.fi,
      value: maakoodi.koodiUri,
    }));
  }, [sortedMaakoodit]);

  const hasChanges = useMemo(() => {
    return Object.entries(hasChangesModel).reduce((acc, [id, esittelija]) => {
      return acc || initialHasChangesModel[id] !== esittelija;
    }, false);
  }, [initialHasChangesModel, hasChangesModel]);

  const setMaakoodi = (id: string, esittelijaId: string | null) => {
    const newModel = {
      ...hasChangesModel,
      [id]: esittelijaId,
    };

    const newSortedMaakoodit = sortedMaakoodit.map((maakoodi) => {
      if (maakoodi.id === id) {
        return { ...maakoodi, esittelijaId } as Maakoodi;
      } else {
        return maakoodi;
      }
    });

    setHasChangesModel(newModel);
    setSortedMaakoodit(newSortedMaakoodit);
  };

  const unsetMaakoodi = (id: string) => {
    setMaakoodi(id, null);
  };

  const handleSave = () => {
    if (hasChanges) {
      setIsSaving(true);
      try {
        const changedList = Object.entries(hasChangesModel)
          .filter(
            ([id, esittelija]) => initialHasChangesModel[id] !== esittelija,
          )
          .map(([id]) => id);
        const updateList = sortedMaakoodit.filter((maakoodi) =>
          changedList.includes(maakoodi.id),
        );
        setUpdateList(updateList);
      } finally {
        setIsSaving(false);
      }
    }
  };

  if (maakooditIsLoading || esittelijatIsLoading) {
    return <FullSpinner />;
  }

  return (
    <>
      <BoxWrapper sx={{ borderBottom: 'none' }}>
        <Stack
          gap={theme.spacing(2)}
          sx={{ flexGrow: 1, marginRight: theme.spacing(3) }}
        >
          <OphTypography variant={'h3'}>
            {t('maajako.kenellevalittu')}
          </OphTypography>
          <OphSelectFormField
            placeholder={t('yleiset.valitse')}
            label={t('maajako.suoritusmaa')}
            sx={{ width: '50%', marginBottom: theme.spacing(1) }}
            options={sortedMaakooditOptions}
            value={selectedMaakoodi}
            onChange={(event: SelectChangeEvent) =>
              setSelectedMaakoodi(event.target.value)
            }
            data-testid={'suoritusmaa'}
          ></OphSelectFormField>

          <SelectedMaakoodiInfo
            maakoodit={sortedMaakoodit}
            selectedMaakoodi={selectedMaakoodi}
            esittelijat={esittelijat}
          />
          <Divider sx={{ marginBottom: theme.spacing(1) }} />

          <OphTypography variant={'h3'}>{t('maajako.maajako')}</OphTypography>
          <OphTypography variant={'body1'}>{t('maajako.kuvaus')}</OphTypography>

          <KaikkiValittuInfo
            t={t}
            maakooditWithoutEsittelija={maakooditWithoutEsittelija}
          />

          <OphButton
            sx={{
              width: '15%',
              marginBottom: theme.spacing(1),
              marginTop: theme.spacing(1),
            }}
            variant="outlined"
            color="primary"
            data-testid="toggle-edit"
            onClick={() => {
              setIsEditing((prev) => !prev);
            }}
          >
            {isEditing
              ? t('maajako.poistumuokkaustilasta')
              : t('maajako.muokkaamaajakoa')}
          </OphButton>

          {esittelijat?.map((esittelija, index) => (
            <React.Fragment key={`esittelija-${index}`}>
              {isEditing ? (
                <EditEsittelijaSection
                  esittelija={esittelija}
                  maakoodit={sortedMaakoodit}
                  maakooditWithoutEsittelija={maakooditWithoutEsittelija}
                  t={t}
                  setMaakoodi={setMaakoodi}
                  unsetMaakoodi={unsetMaakoodi}
                />
              ) : (
                <EsittelijaSection
                  esittelija={esittelija}
                  maakoodit={sortedMaakoodit}
                  t={t}
                />
              )}
              <Divider
                sx={{
                  marginTop: theme.spacing(2),
                  marginBottom: theme.spacing(2),
                }}
              />
            </React.Fragment>
          ))}
        </Stack>
      </BoxWrapper>
      <SaveRibbon
        onSave={handleSave}
        isSaving={isSaving}
        hasChanges={hasChanges}
      />
    </>
  );
}

interface KaikkiValittuInfoProps {
  t: TFunction;
  maakooditWithoutEsittelija: Maakoodi[];
}

const KaikkiValittuInfo = ({
  t,
  maakooditWithoutEsittelija,
}: KaikkiValittuInfoProps) =>
  maakooditWithoutEsittelija.length === 0 ? (
    <SuccessBox infoText={t('maajako.kaikkiValittu')} />
  ) : (
    <AlertBox
      infoText={maakooditWithoutEsittelija
        .map((maakoodi) => maakoodi.fi)
        .join(', ')}
      headingText={t('maajako.varoitus')}
    />
  );
