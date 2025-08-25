import { useState, useEffect } from 'react';
import { Stack } from '@mui/material';
import {
  OphInputFormField,
  OphTypography,
} from '@opetushallitus/oph-design-system';
import { useDebounce } from '@/src/hooks/useDebounce';
import { useMuistio } from '@/src/hooks/useMuistio';

import { Hakemus } from '@/src/lib/types/hakemus';

interface MuistioProps {
  hakemus: Hakemus | undefined;
  sisainen: boolean;
  hakemuksenOsa: string;
  label?: string;
  helperText?: string;
}

export const Muistio = ({
  hakemus,
  sisainen,
  hakemuksenOsa,
  label,
  helperText,
}: MuistioProps) => {
  const { muistio, updateMuistio } = useMuistio(
    hakemus?.hakemusOid,
    hakemuksenOsa,
    sisainen,
  );

  const [sisalto, setSisalto] = useState<string | undefined>(muistio?.sisalto);

  useEffect(() => {
    setSisalto(muistio?.sisalto || '');
  }, [muistio?.sisalto, setSisalto]);

  const debouncedMuistioUpdateAction = useDebounce((value: string) => {
    updateMuistio(value);
  }, 1500);

  const updateSisalto = (value: string) => {
    setSisalto(value);
    debouncedMuistioUpdateAction(value);
  };

  const testid = [
    'muistio',
    hakemuksenOsa,
    sisainen ? 'sisainen' : 'muistio',
  ].join('-');

  return (
    <Stack direction="column">
      {label && <OphTypography variant="label">{label}</OphTypography>}
      {helperText && (
        <OphTypography variant="body1">{helperText}</OphTypography>
      )}
      <OphInputFormField
        multiline={true}
        onChange={(event) => updateSisalto(event?.target.value)}
        value={sisalto ?? ''}
        minRows={3}
        inputProps={{
          'data-testid': testid,
        }}
      />
    </Stack>
  );
};
