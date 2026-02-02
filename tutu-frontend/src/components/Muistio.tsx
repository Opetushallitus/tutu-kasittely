import { Stack } from '@mui/material';
import { OphInputFormField } from '@opetushallitus/oph-design-system';

interface MuistioProps {
  label?: string;
  helperText?: string;
  sisalto?: string;
  updateMuistio: (value: string) => void;
  testId?: string;
}

export const Muistio = ({
  label,
  helperText,
  sisalto,
  updateMuistio,
  testId,
}: MuistioProps) => {
  return (
    <Stack direction="column">
      <OphInputFormField
        label={label}
        helperText={helperText}
        multiline={true}
        onChange={(event) => updateMuistio(event?.target.value)}
        value={sisalto ?? ''}
        minRows={3}
        inputProps={{
          'data-testid': testId ?? 'muistio-input',
        }}
      />
    </Stack>
  );
};
