'use client';

import { PerusteluLayout } from '@/src/app/hakemus/[oid]/perustelu/components/PerusteluLayout';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import { useHakemus } from '@/src/context/HakemusContext';
import { usePerustelu } from '@/src/hooks/usePerustelu';
import { FormControl, Stack, useTheme } from '@mui/material';
import {
  OphCheckbox,
  OphFormFieldWrapper,
  OphInputFormField,
  OphTypography,
} from '@opetushallitus/oph-design-system';
import { useState } from 'react';
import { FullSpinner } from '@/src/components/FullSpinner';
import { useDebounce } from '@/src/hooks/useDebounce';
import { PerusteluAP } from '@/src/lib/types/perusteluAP';

export default function ApPage() {
  const { t, translateEntity } = useTranslations('hakemus.perustelu.ap');
  const theme = useTheme();
  const { hakemus, isLoading, error } = useHakemus();
  const hakija = hakemus?.hakija;
  const { perustelu, updatePerustelu } = usePerustelu(hakemus?.hakemusOid);
  const [perusteluAP, setPerusteluAP] = useState<PerusteluAP>(
    perustelu?.perusteluAP ?? {},
  );

  const debouncedUpdatePerusteluAP = useDebounce((next: PerusteluAP) => {
    updatePerustelu({
      ...perustelu!,
      perusteluAP: next,
    });
  }, 1000);

  const updatePerusteluAP = (next: PerusteluAP) => {
    setPerusteluAP(next);
    debouncedUpdatePerusteluAP(next);
  };

  const updateCheckbox = (key: keyof PerusteluAP, checked: boolean) => {
    updatePerusteluAP({ ...perusteluAP, [key]: checked });
  };

  const updateTextField = (key: keyof PerusteluAP, value: string) => {
    updatePerusteluAP({ ...perusteluAP, [key]: value });
  };

  return isLoading ? (
    <FullSpinner></FullSpinner>
  ) : (
    <PerusteluLayout
      showTabs={false}
      title="otsikko"
      t={t}
      hakemus={hakemus}
      isHakemusLoading={isLoading}
      hakemusError={error}
    >
      <Stack direction="column" spacing={2}>
        <OphFormFieldWrapper
          label={t('perusteApLainSoveltamiselle')}
          renderInput={({ labelId }) => (
            <FormControl aria-labelledby={labelId}>
              <OphCheckbox
                checked={!!perusteluAP.lakiperusteToisessaJasenmaassaSaannelty}
                label={t('lakiperusteToisessaJasenmaassaSaannelty')}
                onChange={(event) => {
                  updateCheckbox(
                    'lakiperusteToisessaJasenmaassaSaannelty',
                    event.target.checked,
                  );
                }}
              />
              <OphCheckbox
                checked={!!perusteluAP.lakiperustePatevyysLahtomaanOikeuksilla}
                label={t('lakiperustePatevyysLahtomaanOikeuksilla')}
                onChange={(event) => {
                  updateCheckbox(
                    'lakiperustePatevyysLahtomaanOikeuksilla',
                    event.target.checked,
                  );
                }}
              />
              <OphCheckbox
                checked={!!perusteluAP.lakiperusteToinenEUmaaTunnustanut}
                label={t('lakiperusteToinenEUmaaTunnustanut')}
                onChange={(event) => {
                  updateCheckbox(
                    'lakiperusteToinenEUmaaTunnustanut',
                    event.target.checked,
                  );
                }}
              />
              <OphCheckbox
                checked={!!perusteluAP.lakiperusteLahtomaassaSaantelematon}
                label={t('lakiperusteLahtomaassaSaantelematon')}
                onChange={(event) => {
                  updateCheckbox(
                    'lakiperusteLahtomaassaSaantelematon',
                    event.target.checked,
                  );
                }}
              />
            </FormControl>
          )}
        />
        <OphFormFieldWrapper
          label={t('kansalaisuus')}
          renderInput={({ labelId }) => (
            <OphTypography aria-labelledby={labelId}>
              {translateEntity(hakija?.kansalaisuus)}
            </OphTypography>
          )}
        ></OphFormFieldWrapper>
        <OphInputFormField
          label={t('todistusEUKansalaisuuteenRinnasteisestaAsemasta')}
          value={
            perusteluAP?.todistusEUKansalaisuuteenRinnasteisestaAsemasta ?? ''
          }
          onChange={(event) => {
            updateTextField(
              'todistusEUKansalaisuuteenRinnasteisestaAsemasta',
              event.target.value,
            );
          }}
        ></OphInputFormField>
        <OphInputFormField
          label={t('ammattiJohonPatevoitynyt')}
          multiline={true}
          minRows={3}
          value={perusteluAP?.ammattiJohonPatevoitynyt ?? ''}
          onChange={(event) => {
            updateTextField('ammattiJohonPatevoitynyt', event.target.value);
          }}
        ></OphInputFormField>
        <OphInputFormField
          label={t('ammattitoiminnanPaaAsiallinenSisalto')}
          multiline={true}
          minRows={3}
          value={perusteluAP?.ammattitoiminnanPaaAsiallinenSisalto ?? ''}
          onChange={(event) => {
            updateTextField(
              'ammattitoiminnanPaaAsiallinenSisalto',
              event.target.value,
            );
          }}
        ></OphInputFormField>
        <OphInputFormField
          label={t('koulutuksenKestoJaSisalto')}
          multiline={true}
          minRows={3}
          value={perusteluAP?.koulutuksenKestoJaSisalto ?? ''}
          onChange={(event) => {
            updateTextField('koulutuksenKestoJaSisalto', event.target.value);
          }}
        ></OphInputFormField>
        <OphFormFieldWrapper
          label={t('ammattipatevyysSelvitykset')}
          renderInput={({ labelId }) => (
            <FormControl
              aria-labelledby={labelId}
              sx={{ display: 'flex', gap: theme.spacing(1) }}
            >
              <OphCheckbox
                checked={!!perusteluAP.selvityksetLahtomaanViranomaiselta}
                label={t('selvityksetLahtomaanViranomaiselta')}
                onChange={(event) => {
                  updateCheckbox(
                    'selvityksetLahtomaanViranomaiselta',
                    event.target.checked,
                  );
                }}
              />
              <OphCheckbox
                checked={!!perusteluAP.selvityksetLahtomaanLainsaadannosta}
                label={t('selvityksetLahtomaanLainsaadannosta')}
                onChange={(event) => {
                  updateCheckbox(
                    'selvityksetLahtomaanLainsaadannosta',
                    event.target.checked,
                  );
                }}
              />
              <OphCheckbox
                checked={!!perusteluAP.selvityksetAikaisempiTapaus}
                label={t('selvityksetAikaisempiTapaus')}
                onChange={(event) => {
                  updateCheckbox(
                    'selvityksetAikaisempiTapaus',
                    event.target.checked,
                  );
                }}
              />
              <OphCheckbox
                checked={!!perusteluAP.selvityksetIlmeneeAsiakirjoista}
                label={t('selvityksetIlmeneeAsiakirjoista')}
                onChange={(event) => {
                  updateCheckbox(
                    'selvityksetIlmeneeAsiakirjoista',
                    event.target.checked,
                  );
                }}
              />
            </FormControl>
          )}
        />
        <OphInputFormField
          label={t('lisatietoja')}
          multiline={true}
          minRows={3}
          value={perusteluAP?.lisatietoja ?? ''}
          onChange={(event) => {
            updateTextField('lisatietoja', event.target.value);
          }}
        ></OphInputFormField>
        <OphFormFieldWrapper
          label={t('IMIhalytykset')}
          renderInput={({ labelId }) => (
            <OphCheckbox
              aria-labelledby={labelId}
              label={t('IMIHalytysTarkastettu')}
              checked={perusteluAP?.IMIHalytysTarkastettu}
            ></OphCheckbox>
          )}
        ></OphFormFieldWrapper>
        <OphFormFieldWrapper
          label={t('syntymaaika')}
          renderInput={({ labelId }) => (
            <OphTypography aria-labelledby={labelId}>
              {hakija?.syntymaaika}
            </OphTypography>
          )}
        ></OphFormFieldWrapper>
        <OphInputFormField
          label={t('muutAPPerustelut')}
          multiline={true}
          minRows={3}
          value={perusteluAP?.muutAPPerustelut ?? ''}
          onChange={(event) => {
            updateTextField('muutAPPerustelut', event.target.value);
          }}
        ></OphInputFormField>
        <OphInputFormField
          label={t('SEUTarviointi')}
          helperText={t('SEUTarviointiHelperText')}
          multiline={true}
          minRows={3}
          value={perusteluAP?.SEUTArviointi ?? ''}
          onChange={(event) => {
            updateTextField('SEUTArviointi', event.target.value);
          }}
        ></OphInputFormField>
      </Stack>
    </PerusteluLayout>
  );
}
