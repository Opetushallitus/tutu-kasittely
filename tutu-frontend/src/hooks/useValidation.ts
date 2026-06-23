import { useState } from 'react';

import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import { ValidationState } from '@/src/lib/types/validation';
import { flattenObject } from '@/src/lib/utils';

export const useValidation = <T extends Record<string, unknown>>(
  value: T,
  requiredFields: string[],
): ValidationState => {
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  const { t } = useTranslations();

  const isValid = () => Object.keys(validationErrors).length === 0;

  const clearValidationError = (key: string) => {
    const { [key]: _, ...restErrors } = validationErrors;
    setValidationErrors(restErrors);
  };

  const validateAndSave = (onSave: () => void) => {
    const puuttuvaTietoMsg = t('virhe.validaatio.pakollinenTietoPuuttuu');
    const flattenedData = flattenObject(value);
    const erroneousFields = requiredFields.filter(
      (field) => !flattenedData[field],
    );
    const toBeValidationErrors: Record<string, string> = erroneousFields.reduce(
      (acc, field) => {
        acc[field] = puuttuvaTietoMsg;
        return acc;
      },
      {} as Record<string, string>,
    );
    setValidationErrors(toBeValidationErrors);
    if (Object.keys(toBeValidationErrors).length === 0) {
      onSave();
    }
  };

  return { isValid, validationErrors, validateAndSave, clearValidationError };
};
