'use client';

import { PerusteluLayout } from '@/src/app/hakemus/[oid]/perustelu/components/PerusteluLayout';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import { useHakemus } from '@/src/context/HakemusContext';
import { usePerustelu } from '@/src/hooks/usePerustelu';
import { Box, FormControl, useTheme } from '@mui/material';
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
import * as R from 'remeda';

export default function ApPage() {
  const { t, translateEntity } = useTranslations();
  const theme = useTheme();
  const { hakemus, isLoading, error } = useHakemus();
  const hakija = hakemus?.hakija;
  const { perustelu, isPerusteluLoading, updatePerustelu } = usePerustelu(
    hakemus?.hakemusOid,
  );
  const [apSisalto, setAPSisalto] = useState(perustelu?.apSisalto);

  useEffect(() => {
    if (perustelu) {
      setAPSisalto(perustelu.apSisalto);
    }
  }, [perustelu, setAPSisalto]);

  const debouncedUpdateAPSisalto = useDebounce((next: APSisalto) => {
    updatePerustelu({
      ...perustelu!,
      apSisalto: next,
    });
  }, 1000);

  const updateAPSisalto = (next: APSisalto) => {
    setAPSisalto(next);
    debouncedUpdateAPSisalto(next);
  };

  const updateCheckbox = (key: keyof APSisalto, checked: boolean) => {
    const next = { ...apSisalto, [key]: checked };
    setAPSisalto(next);
    updatePerustelu({
      ...perustelu!,
      apSisalto: next,
    });
  };

  const updateTextField = (key: keyof APSisalto, value: string) => {
    updateAPSisalto({ ...apSisalto, [key]: value });
  };

  return isLoading || isPerusteluLoading ? (
    <FullSpinner></FullSpinner>
  ) : (
    <PerusteluLayout
      showTabs={false}
      title={t('hakemus.perustelu.ap.otsikko')}
      t={t}
      hakemus={hakemus}
      isHakemusLoading={isLoading}
      hakemusError={error}
    >
      <OphFormFieldWrapper
        label={t('hakemus.perustelu.ap.perusteApLainSoveltamiselle')}
        renderInput={({ labelId }) => (
          <FormControl
            aria-labelledby={labelId}
            sx={{
              display: 'flex',
              gap: theme.spacing(1),
              marginTop: theme.spacing(1),
            }}
          >
            <OphCheckbox
              checked={!!apSisalto?.lakiperusteToisessaJasenmaassaSaannelty}
              label={t(
                'hakemus.perustelu.ap.lakiperusteToisessaJasenmaassaSaannelty',
              )}
              onChange={(event) => {
                updateCheckbox(
                  'lakiperusteToisessaJasenmaassaSaannelty',
                  event.target.checked,
                );
              }}
              data-testid={'lakiperusteToisessaJasenmaassaSaannelty'}
            />
            <OphCheckbox
              checked={!!apSisalto?.lakiperustePatevyysLahtomaanOikeuksilla}
              label={t(
                'hakemus.perustelu.ap.lakiperustePatevyysLahtomaanOikeuksilla',
              )}
              onChange={(event) => {
                updateCheckbox(
                  'lakiperustePatevyysLahtomaanOikeuksilla',
                  event.target.checked,
                );
              }}
              data-testid={'lakiperustePatevyysLahtomaanOikeuksilla'}
            />
            <OphCheckbox
              checked={!!apSisalto?.lakiperusteToinenEUmaaTunnustanut}
              label={t(
                'hakemus.perustelu.ap.lakiperusteToinenEUmaaTunnustanut',
              )}
              onChange={(event) => {
                updateCheckbox(
                  'lakiperusteToinenEUmaaTunnustanut',
                  event.target.checked,
                );
              }}
              data-testid={'lakiperusteToinenEUmaaTunnustanut'}
            />
            <OphCheckbox
              checked={!!apSisalto?.lakiperusteLahtomaassaSaantelematon}
              label={t(
                'hakemus.perustelu.ap.lakiperusteLahtomaassaSaantelematon',
              )}
              onChange={(event) => {
                updateCheckbox(
                  'lakiperusteLahtomaassaSaantelematon',
                  event.target.checked,
                );
              }}
              data-testid={'lakiperusteLahtomaassaSaantelematon'}
            />
          </FormControl>
        )}
      />
      <OphFormFieldWrapper
        label={t('hakemus.perustelu.ap.kansalaisuus')}
        renderInput={({ labelId }) => (
          <OphTypography aria-labelledby={labelId} data-testid={'kansalaisuus'}>
            {R.map(hakija?.kansalaisuus ?? [], (k) => translateEntity(k)).join(
              ', ',
            )}
          </OphTypography>
        )}
      ></OphFormFieldWrapper>
      <OphInputFormField
        label={t(
          'hakemus.perustelu.ap.todistusEUKansalaisuuteenRinnasteisestaAsemasta',
        )}
        value={apSisalto?.todistusEUKansalaisuuteenRinnasteisestaAsemasta ?? ''}
        onChange={(event) => {
          updateTextField(
            'todistusEUKansalaisuuteenRinnasteisestaAsemasta',
            event.target.value,
          );
        }}
        data-testid={'todistusEUKansalaisuuteenRinnasteisestaAsemasta'}
      ></OphInputFormField>
      <OphInputFormField
        label={t('hakemus.perustelu.ap.ammattiJohonPatevoitynyt')}
        multiline={true}
        minRows={3}
        value={apSisalto?.ammattiJohonPatevoitynyt ?? ''}
        onChange={(event) => {
          updateTextField('ammattiJohonPatevoitynyt', event.target.value);
        }}
        data-testid={'ammattiJohonPatevoitynyt'}
      ></OphInputFormField>
      <OphInputFormField
        label={t('hakemus.perustelu.ap.ammattitoiminnanPaaAsiallinenSisalto')}
        multiline={true}
        minRows={3}
        value={apSisalto?.ammattitoiminnanPaaAsiallinenSisalto ?? ''}
        onChange={(event) => {
          updateTextField(
            'ammattitoiminnanPaaAsiallinenSisalto',
            event.target.value,
          );
        }}
        data-testid={'ammattitoiminnanPaaAsiallinenSisalto'}
      ></OphInputFormField>
      <OphInputFormField
        label={t('hakemus.perustelu.ap.koulutuksenKestoJaSisalto')}
        multiline={true}
        minRows={3}
        value={apSisalto?.koulutuksenKestoJaSisalto ?? ''}
        onChange={(event) => {
          updateTextField('koulutuksenKestoJaSisalto', event.target.value);
        }}
        data-testid={'koulutuksenKestoJaSisalto'}
      ></OphInputFormField>
      <OphFormFieldWrapper
        label={t('hakemus.perustelu.ap.ammattipatevyysSelvitykset')}
        renderInput={({ labelId }) => (
          <FormControl
            aria-labelledby={labelId}
            sx={{
              display: 'flex',
              gap: theme.spacing(1),
              marginTop: theme.spacing(1),
            }}
          >
            <OphCheckbox
              checked={!!apSisalto?.selvityksetLahtomaanViranomaiselta}
              label={t(
                'hakemus.perustelu.ap.selvityksetLahtomaanViranomaiselta',
              )}
              onChange={(event) => {
                updateCheckbox(
                  'selvityksetLahtomaanViranomaiselta',
                  event.target.checked,
                );
              }}
              data-testid={'selvityksetLahtomaanViranomaiselta'}
            />
            <OphCheckbox
              checked={!!apSisalto?.selvityksetLahtomaanLainsaadannosta}
              label={t(
                'hakemus.perustelu.ap.selvityksetLahtomaanLainsaadannosta',
              )}
              onChange={(event) => {
                updateCheckbox(
                  'selvityksetLahtomaanLainsaadannosta',
                  event.target.checked,
                );
              }}
              data-testid={'selvityksetLahtomaanLainsaadannosta'}
            />
            <OphCheckbox
              checked={!!apSisalto?.selvityksetAikaisempiTapaus}
              label={t('hakemus.perustelu.ap.selvityksetAikaisempiTapaus')}
              onChange={(event) => {
                updateCheckbox(
                  'selvityksetAikaisempiTapaus',
                  event.target.checked,
                );
              }}
              data-testid={'selvityksetAikaisempiTapaus'}
            />
            {apSisalto?.selvityksetAikaisempiTapaus && (
              <Box
                sx={{
                  marginLeft: theme.spacing(4),
                  marginBottom: theme.spacing(1),
                }}
              >
                <OphInputFormField
                  label={t(
                    'hakemus.perustelu.ap.selvityksetAikaisemmanTapauksenAsiaTunnus',
                  )}
                  sx={{
                    width: '100%',
                  }}
                  value={
                    apSisalto?.selvityksetAikaisemmanTapauksenAsiaTunnus ?? ''
                  }
                  onChange={(event) => {
                    updateTextField(
                      'selvityksetAikaisemmanTapauksenAsiaTunnus',
                      event.target.value,
                    );
                  }}
                  data-testid={'selvityksetAikaisemmanTapauksenAsiaTunnus'}
                />
              </Box>
            )}
            <OphCheckbox
              checked={!!apSisalto?.selvityksetIlmeneeAsiakirjoista}
              label={t('hakemus.perustelu.ap.selvityksetIlmeneeAsiakirjoista')}
              onChange={(event) => {
                updateCheckbox(
                  'selvityksetIlmeneeAsiakirjoista',
                  event.target.checked,
                );
              }}
              data-testid={'selvityksetIlmeneeAsiakirjoista'}
            />
          </FormControl>
        )}
      />
      <OphInputFormField
        label={t('hakemus.perustelu.ap.lisatietoja')}
        multiline={true}
        minRows={3}
        value={apSisalto?.lisatietoja ?? ''}
        onChange={(event) => {
          updateTextField('lisatietoja', event.target.value);
        }}
        data-testid={'lisatietoja'}
      ></OphInputFormField>
      <OphFormFieldWrapper
        label={t('hakemus.perustelu.ap.IMIhalytykset')}
        renderInput={({ labelId }) => (
          <OphCheckbox
            aria-labelledby={labelId}
            label={t('hakemus.perustelu.ap.IMIHalytysTarkastettu')}
            checked={!!apSisalto?.IMIHalytysTarkastettu}
            onChange={(event) => {
              updateCheckbox('IMIHalytysTarkastettu', event.target.checked);
            }}
            data-testid={'IMIHalytysTarkastettu'}
          ></OphCheckbox>
        )}
      ></OphFormFieldWrapper>
      <OphFormFieldWrapper
        label={t('hakemus.perustiedot.henkilotiedot.syntymaaika')}
        renderInput={({ labelId }) => (
          <OphTypography aria-labelledby={labelId} data-testid={'syntymaaika'}>
            {hakija?.syntymaaika}
          </OphTypography>
        )}
      ></OphFormFieldWrapper>
      <OphInputFormField
        label={t('hakemus.perustelu.ap.muutAPPerustelut')}
        multiline={true}
        minRows={3}
        value={apSisalto?.muutAPPerustelut ?? ''}
        onChange={(event) => {
          updateTextField('muutAPPerustelut', event.target.value);
        }}
        data-testid={'muutAPPerustelut'}
      ></OphInputFormField>
      <OphInputFormField
        label={t('hakemus.perustelu.ap.SEUTarviointi')}
        helperText={t('hakemus.perustelu.ap.SEUTarviointiHelperText')}
        multiline={true}
        minRows={3}
        value={apSisalto?.SEUTArviointi ?? ''}
        onChange={(event) => {
          updateTextField('SEUTArviointi', event.target.value);
        }}
        data-testid={'SEUTArviointi'}
      ></OphInputFormField>
    </PerusteluLayout>
  );
}
