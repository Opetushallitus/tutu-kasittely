import { Stack } from '@mui/system';
import {
  OphCheckbox,
  OphFormFieldWrapper,
  OphInputFormField,
  OphTypography,
} from '@opetushallitus/oph-design-system';
import React, { useEffect } from 'react';

import { TFunction } from '@/src/lib/localization/hooks/useTranslations';

const isInteger = (val?: string) =>
  val && val.trim() !== '' && Number.isInteger(Number(val));

export interface OpintoOptionWithLaajuusInputProps {
  t: TFunction;
  checkboxLabel: string;
  laajuusLabel: string;
  checkboxDataTestId: string;
  laajuusDataTestId?: string;
  isChecked?: boolean;
  laajuus?: number | null;
  updateCb: (checked?: boolean, laajuus?: number | null) => void;
}

export const OpintoOptionWithLaajuusInput = ({
  t,
  checkboxLabel,
  laajuusLabel,
  checkboxDataTestId,
  laajuusDataTestId,
  isChecked,
  laajuus,
  updateCb,
}: OpintoOptionWithLaajuusInputProps) => {
  const [laajuusValue, setLaajuusValue] = React.useState<string>(
    laajuus?.toString() ?? '',
  );
  const [isValidLaajuus, setIsValidLaajuus] = React.useState(true);
  useEffect(() => {
    setLaajuusValue(laajuus?.toString() ?? '');
  }, [laajuus]);

  return (
    <>
      <OphCheckbox
        label={t(checkboxLabel)}
        checked={isChecked ?? false}
        onChange={(e) => {
          updateCb(e.target.checked);
        }}
        data-testid={checkboxDataTestId}
      />
      {isChecked && (
        <OphFormFieldWrapper
          sx={{ gap: 1, paddingLeft: 4 }}
          label={t(laajuusLabel)}
          renderInput={() => (
            <Stack direction="row" gap={1}>
              <OphInputFormField
                multiline={false}
                error={!isValidLaajuus}
                value={laajuusValue}
                onChange={(e) => {
                  setLaajuusValue(e.target.value);
                  const newVal = e.target.value.trim();
                  switch (true) {
                    case newVal === '':
                      setIsValidLaajuus(true);
                      updateCb(undefined, null);
                      break;
                    case isInteger(newVal):
                      setIsValidLaajuus(true);
                      updateCb(undefined, Number(newVal));
                      break;
                    default:
                      setIsValidLaajuus(false);
                      break;
                  }
                }}
                data-testid={laajuusDataTestId}
              />
              <OphTypography>{t('yleiset.opintopisteetLyhenne')}</OphTypography>
            </Stack>
          )}
        />
      )}
    </>
  );
};
