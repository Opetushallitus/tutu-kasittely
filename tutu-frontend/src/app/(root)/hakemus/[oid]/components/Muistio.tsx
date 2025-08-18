import { useState, useEffect } from 'react';
import { OphInputFormField } from '@opetushallitus/oph-design-system';
import { useDebounce } from '@/src/hooks/useDebounce';
import { useMuistio } from '@/src/hooks/useMuistio';

import { Hakemus } from '@/src/lib/types/hakemus';

interface MuistioProps {
  hakemus: Hakemus | undefined;
  sisainen: boolean;
  hakemuksenOsa: string;
  label: string;
}

export const Muistio = ({
  hakemus,
  sisainen,
  hakemuksenOsa,
  label,
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

  return (
    <OphInputFormField
      label={label}
      multiline={true}
      onChange={(event) => setSisalto(event?.target.value)}
      value={sisalto ?? ''}
      minRows={3}
    />
  );
};
