import {
  OphSelectMultiple,
  type OphSelectMultipleProps,
} from '@/src/components/OphSelectMultiple';
import { OphFormFieldWrapper } from '@opetushallitus/oph-design-system';

export interface OphFormFieldWrapperCommonProps {
  /**
   * If true, the label will indicate that the input is required.
   */
  required?: boolean;
  /**
   * The label text show above the input
   */
  label?: string;
  /**
   * The helper text shown below the input
   */
  helperText?: string;
  /**
   * An error message shown after the input. If defined also sets the field and label in error state (red).
   */
  errorMessage?: string;
}

export type OphSelectMultipleFormFieldProps<T> =
  OphFormFieldWrapperCommonProps & OphSelectMultipleProps<T>;

/**
 * MultiSelect-component with label and other form field features.
 * [OphSelectMultiple](/docs/components-ophselectmultiple--docs) and [OphFormFieldWrapper](/docs/utils-ophformfieldwrapper--docs) combined.
 */

//TODO: kopioitu oph-design-system-repon branchista - Kun julkaistu ota suoraan sieltä käyttöön.

export const OphSelectMultipleFormField = <T extends string>({
  required,
  label,
  helperText,
  errorMessage,
  sx,
  ...props
}: OphSelectMultipleFormFieldProps<T | ''>) => {
  return (
    <OphFormFieldWrapper
      sx={sx}
      required={required}
      label={label}
      helperText={helperText}
      disabled={props.disabled}
      errorMessage={errorMessage}
      renderInput={({ labelId }) => (
        <OphSelectMultiple {...props} labelId={labelId} />
      )}
    />
  );
};
