import { Stack } from '@mui/material';
import { OphTypography } from '@opetushallitus/oph-design-system';

export type Direction = 'row' | 'column';

export type LabeledValueProps = {
  label: string;
  value: string;
  direction?: Direction;
};
export const LabeledValue = (props: LabeledValueProps) => {
  const { label, value } = props;
  return (
    <Stack direction={props.direction || 'column'} gap={2}>
      <OphTypography variant={'label'}>{label}</OphTypography>
      <OphTypography variant={'body1'}>{value}</OphTypography>
    </Stack>
  );
};
