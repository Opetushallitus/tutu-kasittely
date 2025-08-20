import { useState, useEffect } from 'react';
import { Stack } from '@mui/material';
import {
  OphInputFormField,
  OphTypography,
} from '@opetushallitus/oph-design-system';
import { useDebounce } from '@/src/hooks/useDebounce';
import { useMuistio } from '@/src/hooks/useMuistio';
import { isDefined } from '@/src/lib/utils';

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

  const [sisalto, _setSisalto] = useState<string | undefined>(muistio?.sisalto);

  useEffect(() => {
    _setSisalto(muistio?.sisalto || '');
  }, [muistio?.sisalto, _setSisalto]);

  const debouncedMuistioUpdateAction = useDebounce((value: string) => {
    updateMuistio(value);
  }, 1500);

  const setSisalto = (value: string) => {
    _setSisalto(value);
    debouncedMuistioUpdateAction(value);
  };

  const _label = isDefined(label) ? (
    <OphTypography variant="label">{label}</OphTypography>
  ) : null;

  const _helperText = isDefined(helperText) ? (
    <OphTypography variant="body1">{helperText}</OphTypography>
  ) : null;

  return (
    <Stack direction="column">
      {_label}
      {_helperText}
      <OphInputFormField
        multiline={true}
        onChange={(event) => setSisalto(event?.target.value)}
        value={sisalto ?? ''}
        minRows={3}
      />
    </Stack>
  );
};
