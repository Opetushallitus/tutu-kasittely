export type ValidationState = {
  isValid: () => boolean;
  validationErrors: Record<string, string>;
  validateAndSave: (onSave: () => void) => void;
};
