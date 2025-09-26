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
import { useEffect, useState } from 'react';
import { FullSpinner } from '@/src/components/FullSpinner';
import { useDebounce } from '@/src/hooks/useDebounce';
import { APSisalto } from '@/src/lib/types/APSisalto';

export default function ApPage() {
  const { t, translateEntity } = useTranslations('hakemus.perustelu.ap');
  const theme = useTheme();
  const { hakemus, isLoading, error } = useHakemus();
  const hakija = hakemus?.hakija;
  const { perustelu, isPerusteluLoading, updatePerustelu } = usePerustelu(
    hakemus?.hakemusOid,
  );
  const [APSisalto, setAPSisalto] = useState(perustelu?.APSisalto);

  useEffect(() => {
    if (perustelu) {
      setAPSisalto(perustelu.APSisalto);
    }
  }, [perustelu, setAPSisalto]);

  const debouncedUpdateAPSisalto = useDebounce((next: APSisalto) => {
    updatePerustelu({
      ...perustelu!,
      APSisalto: next,
    });
  }, 1000);

  const updateAPSisalto = (next: APSisalto) => {
    setAPSisalto(next);
    debouncedUpdateAPSisalto(next);
  };

  const updateCheckbox = (key: keyof APSisalto, checked: boolean) => {
    updateAPSisalto({ ...APSisalto, [key]: checked });
  };

  const updateTextField = (key: keyof APSisalto, value: string) => {
    updateAPSisalto({ ...APSisalto, [key]: value });
  };

  return isLoading || isPerusteluLoading ? (
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
                checked={!!APSisalto?.lakiperusteToisessaJasenmaassaSaannelty}
                label={t('lakiperusteToisessaJasenmaassaSaannelty')}
                onChange={(event) => {
                  updateCheckbox(
                    'lakiperusteToisessaJasenmaassaSaannelty',
                    event.target.checked,
                  );
                }}
              />
              <OphCheckbox
                checked={!!APSisalto?.lakiperustePatevyysLahtomaanOikeuksilla}
                label={t('lakiperustePatevyysLahtomaanOikeuksilla')}
                onChange={(event) => {
                  updateCheckbox(
                    'lakiperustePatevyysLahtomaanOikeuksilla',
                    event.target.checked,
                  );
                }}
              />
              <OphCheckbox
                checked={!!APSisalto?.lakiperusteToinenEUmaaTunnustanut}
                label={t('lakiperusteToinenEUmaaTunnustanut')}
                onChange={(event) => {
                  updateCheckbox(
                    'lakiperusteToinenEUmaaTunnustanut',
                    event.target.checked,
                  );
                }}
              />
              <OphCheckbox
                checked={!!APSisalto?.lakiperusteLahtomaassaSaantelematon}
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
            APSisalto?.todistusEUKansalaisuuteenRinnasteisestaAsemasta ?? ''
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
          value={APSisalto?.ammattiJohonPatevoitynyt ?? ''}
          onChange={(event) => {
            updateTextField('ammattiJohonPatevoitynyt', event.target.value);
          }}
        ></OphInputFormField>
        <OphInputFormField
          label={t('ammattitoiminnanPaaAsiallinenSisalto')}
          multiline={true}
          minRows={3}
          value={APSisalto?.ammattitoiminnanPaaAsiallinenSisalto ?? ''}
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
          value={APSisalto?.koulutuksenKestoJaSisalto ?? ''}
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
                checked={!!APSisalto?.selvityksetLahtomaanViranomaiselta}
                label={t('selvityksetLahtomaanViranomaiselta')}
                onChange={(event) => {
                  updateCheckbox(
                    'selvityksetLahtomaanViranomaiselta',
                    event.target.checked,
                  );
                }}
              />
              <OphCheckbox
                checked={!!APSisalto?.selvityksetLahtomaanLainsaadannosta}
                label={t('selvityksetLahtomaanLainsaadannosta')}
                onChange={(event) => {
                  updateCheckbox(
                    'selvityksetLahtomaanLainsaadannosta',
                    event.target.checked,
                  );
                }}
              />
              <OphCheckbox
                checked={!!APSisalto?.selvityksetAikaisempiTapaus}
                label={t('selvityksetAikaisempiTapaus')}
                onChange={(event) => {
                  updateCheckbox(
                    'selvityksetAikaisempiTapaus',
                    event.target.checked,
                  );
                }}
              />
              <OphCheckbox
                checked={!!APSisalto?.selvityksetIlmeneeAsiakirjoista}
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
          value={APSisalto?.lisatietoja ?? ''}
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
              checked={!!APSisalto?.IMIHalytysTarkastettu}
              onChange={(event) => {
                updateCheckbox('IMIHalytysTarkastettu', event.target.checked);
              }}
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
          value={APSisalto?.muutAPPerustelut ?? ''}
          onChange={(event) => {
            updateTextField('muutAPPerustelut', event.target.value);
          }}
        ></OphInputFormField>
        <OphInputFormField
          label={t('SEUTarviointi')}
          helperText={t('SEUTarviointiHelperText')}
          multiline={true}
          minRows={3}
          value={APSisalto?.SEUTArviointi ?? ''}
          onChange={(event) => {
            updateTextField('SEUTArviointi', event.target.value);
          }}
        ></OphInputFormField>
      </Stack>
    </PerusteluLayout>
  );
}
