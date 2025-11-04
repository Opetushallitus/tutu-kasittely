import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import { OphRadioGroupWithClear } from '@/src/components/OphRadioGroupWithClear';

import {
  AsiakirjaTieto,
  AsiakirjaTietoUpdateCallback,
} from '@/src/lib/types/hakemus';

interface ApHakemusProps {
  asiakirjaTieto: AsiakirjaTieto;
  hakemusKoskee: number;
  updateAsiakirjaTieto: AsiakirjaTietoUpdateCallback;
}

export const ApHakemus = ({
  asiakirjaTieto,
  hakemusKoskee,
  updateAsiakirjaTieto,
}: ApHakemusProps) => {
  const { t } = useTranslations();

  const currentValue = asiakirjaTieto.apHakemus;

  const updateApHakemus = (val: boolean | null) => {
    updateAsiakirjaTieto({
      apHakemus: val,
    } as Partial<AsiakirjaTieto>);
  };

  return (
    hakemusKoskee === 1 && (
      <OphRadioGroupWithClear
        label={t('hakemus.apHakemus')}
        labelId="ap-hakemus-radio-group-label"
        data-testid="ap-hakemus-radio-group"
        options={[
          { value: 'true', label: t('yleiset.kylla') },
          { value: 'false', label: t('yleiset.ei') },
        ]}
        row
        value={currentValue?.toString() ?? ''}
        onChange={(e) => updateApHakemus(e.target.value === 'true')}
        onClear={() => updateApHakemus(null)}
      />
    )
  );
};
