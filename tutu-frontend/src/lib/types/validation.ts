export type ValidationState = {
  isValid: () => boolean;
  clearValidationError: (key: string) => void;
  validationErrors: Record<string, string>;
  validateAndSave: (onSave: () => void) => void;
};
