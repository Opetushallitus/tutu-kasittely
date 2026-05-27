import MenuItem from '@mui/material/MenuItem/MenuItem';
import Select, { SelectProps } from '@mui/material/Select/Select';
import {
  ophColors,
  OphFormFieldWrapper,
} from '@opetushallitus/oph-design-system';

import { OphSelectOption } from '../lib/types/common';

interface OphFormFieldWrapperCommonProps {
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

interface OphSelectProps<T> extends Omit<
  SelectProps<T>,
  | 'children'
  | 'label'
  | 'variant'
  | 'components'
  | 'componentsProps'
  | 'disableUnderline'
> {
  /**
   * Selectable options for the select component.
   */
  options: Array<OphSelectOption<T>>;
  /**
   * Can the value be cleared from the select component.
   */
  clearable?: boolean;
  /**
   * Placeholder text shown when no value is selected.
   */
  placeholder?: string;
}

type OphSelectFormFieldProps<T> = OphFormFieldWrapperCommonProps &
  OphSelectProps<T>;

// OphSelectFormField but with grey placeholder
export const OphSelectFormFieldPatched = <T extends string>({
  required,
  label,
  helperText,
  errorMessage,
  sx,
  ...props
}: OphSelectFormFieldProps<T | ''>) => {
  return (
    <OphFormFieldWrapper
      sx={sx}
      required={required}
      label={label}
      helperText={helperText}
      disabled={props.disabled}
      errorMessage={errorMessage}
      renderInput={({ labelId }) => <OphSelect {...props} labelId={labelId} />}
    />
  );
};

const OphSelect = <T extends string>({
  placeholder,
  clearable,
  options,
  ...props
}: OphSelectProps<T | ''>) => {
  return (
    <Select defaultValue="" displayEmpty {...props} label={null}>
      <MenuItem sx={{ display: clearable ? 'block' : 'none' }} value="">
        {/*Patched grey placeholder*/}
        <span style={{ color: ophColors.grey500 }}>{placeholder}</span>
      </MenuItem>
      {options.map(({ value, label }) => {
        return (
          <MenuItem value={value} key={value}>
            {label}
          </MenuItem>
        );
      })}
    </Select>
  );
};
