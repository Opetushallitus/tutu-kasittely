'use client';

import { PerusteluLayout } from '@/src/app/hakemus/[oid]/perustelu/components/PerusteluLayout';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import { Stack } from '@mui/material';
import { Muistio } from '@/src/components/Muistio';
import { useHakemus } from '@/src/context/HakemusContext';
import { usePerustelu } from '@/src/hooks/usePerustelu';
import { PerusteluUoRo } from '@/src/lib/types/perusteluUoRo';
import React, { useEffect } from 'react';
import {
  OphCheckbox,
  OphInputFormField,
  OphTypography,
} from '@opetushallitus/oph-design-system';
import {
  opettajatBooleanFields,
  otmBooleanFields,
  vkBooleanFields,
} from '@/src/constants/perusteluUoRoBooleanFields';
import { useDebounce } from '@/src/hooks/useDebounce';

export default function UoroPage() {
  const { t } = useTranslations();
  const { hakemus, isLoading, error } = useHakemus();
  const { perustelu, updatePerustelu } = usePerustelu(hakemus?.hakemusOid);
  const [perusteluUoRo, setPerusteluUoRo] = React.useState<
    PerusteluUoRo | undefined
  >();

  useEffect(() => {
    if (!perustelu) return;

    setPerusteluUoRo(perustelu.perusteluUoRo);
  }, [perustelu, setPerusteluUoRo]);

  const updatePerusteluUoRo = (field: string, value: boolean | string) => {
    const isMuuUnchecked =
      value === false && (value.toString() === 'muuEro' || 'muuSelite');
    const modifiedPerusteluUoRo = perusteluUoRo
      ? {
          ...perusteluUoRo,
          perustelunSisalto: {
            ...perusteluUoRo.perustelunSisalto,
            [field]: value,
            ...(isMuuUnchecked ? { [`${field}Selite`]: '' } : {}),
          },
        }
      : {
          perusteluId: perustelu!.id,
          perustelunSisalto: { [field]: value },
        };

    setPerusteluUoRo(modifiedPerusteluUoRo);
    debouncedUpdatePerusteluUoRo(modifiedPerusteluUoRo);
  };

  const debouncedUpdatePerusteluUoRo = useDebounce((next: PerusteluUoRo) => {
    updatePerustelu({ ...perustelu!, perusteluUoRo: next });
  }, 1000);
  return (
    <PerusteluLayout
      showTabs={false}
      title="hakemus.perustelu.uoro.otsikko"
      t={t}
      hakemus={hakemus}
      isHakemusLoading={isLoading}
      hakemusError={error}
    >
      <Stack direction="column" spacing={2}>
        <Muistio
          label={t('hakemus.perustelu.uoro.koulutuksenSisalto')}
          helperText={t('hakemus.perustelu.uoro.koulutuksenSisaltoSelite')}
          hakemus={hakemus}
          sisainen={false}
          hakemuksenOsa={'perustelut-ro-uo'}
        />
        <OphTypography variant={'h3'}>
          {t('hakemus.perustelu.uoro.erotKoulutuksenSisallossa')}
        </OphTypography>
        <OphTypography variant={'h4'}>
          {t('hakemus.perustelu.uoro.opettajat.otsikko')}
        </OphTypography>
        {opettajatBooleanFields.map(({ key, labelKey }) => (
          <OphCheckbox
            key={key as string}
            label={t(labelKey)}
            data-testid={`checkbox-${key as string}`}
            checked={!!perusteluUoRo?.perustelunSisalto?.[key]}
            onChange={() =>
              updatePerusteluUoRo(key, !perusteluUoRo?.perustelunSisalto?.[key])
            }
          />
        ))}
        {perusteluUoRo?.perustelunSisalto.opettajatMuuEro && (
          <OphInputFormField
            data-testid="opettajatMuuEroSelite"
            sx={{ paddingLeft: 4 }}
            multiline={true}
            minRows={5}
            label={t('yleiset.tasmenna')}
            value={perusteluUoRo?.perustelunSisalto.opettajatMuuEroSelite || ''}
            onChange={(event) =>
              updatePerusteluUoRo('opettajatMuuEroSelite', event.target.value)
            }
          />
        )}
        <OphTypography variant={'h4'}>
          {t('hakemus.perustelu.uoro.opettajatVk.otsikko')}
        </OphTypography>
        {vkBooleanFields.map(({ key, labelKey }) => (
          <OphCheckbox
            key={key as string}
            label={t(labelKey)}
            data-testid={`checkbox-${key as string}`}
            checked={!!perusteluUoRo?.perustelunSisalto?.[key]}
            onChange={() =>
              updatePerusteluUoRo(key, !perusteluUoRo?.perustelunSisalto?.[key])
            }
          />
        ))}
        {perusteluUoRo?.perustelunSisalto.vkOpettajatMuuEro && (
          <OphInputFormField
            sx={{ paddingLeft: 4 }}
            multiline={true}
            minRows={5}
            label={t('yleiset.tasmenna')}
            value={
              perusteluUoRo?.perustelunSisalto.vkOpettajatMuuEroSelite || ''
            }
            onChange={(event) =>
              updatePerusteluUoRo('vkOpettajatMuuEroSelite', event.target.value)
            }
          />
        )}
        <OphTypography variant={'h4'}>
          {t('hakemus.perustelu.uoro.otm.otsikko')}
        </OphTypography>
        {otmBooleanFields.map(({ key, labelKey }) => (
          <OphCheckbox
            key={key as string}
            label={t(labelKey)}
            data-testid={`checkbox-${key as string}`}
            checked={!!perusteluUoRo?.perustelunSisalto?.[key]}
            onChange={() =>
              updatePerusteluUoRo(key, !perusteluUoRo?.perustelunSisalto?.[key])
            }
          />
        ))}
        {perusteluUoRo?.perustelunSisalto.otmMuuEro && (
          <OphInputFormField
            data-testid="otmMuuEroSelite"
            sx={{ paddingLeft: 4 }}
            multiline={true}
            minRows={5}
            label={t('yleiset.tasmenna')}
            value={perusteluUoRo?.perustelunSisalto.otmMuuEroSelite || ''}
            onChange={(event) =>
              updatePerusteluUoRo('otmMuuEroSelite', event.target.value)
            }
          />
        )}
        <Muistio
          label={t('hakemus.perustelu.uoro.muuTutkinto')}
          hakemus={hakemus}
          sisainen={false}
          hakemuksenOsa={'perustelut-uo-ro-muu-tutkinto'}
        />
      </Stack>
    </PerusteluLayout>
  );
}
