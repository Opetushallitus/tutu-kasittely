import { Stack } from '@mui/material';
import { OphTypography } from '@opetushallitus/oph-design-system';

export type LabeledValueProps = {
  label: string;
  value: string;
};
export const LabeledValue = (props: LabeledValueProps) => {
  const { label, value } = props;
  return (
    <Stack>
      <OphTypography variant={'label'}>{label}</OphTypography>
      <OphTypography variant={'body1'}>{value}</OphTypography>
    </Stack>
  );
};
