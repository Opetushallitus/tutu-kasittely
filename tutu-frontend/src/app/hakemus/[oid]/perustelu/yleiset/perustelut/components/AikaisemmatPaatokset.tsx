import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import { Perustelu } from '@/src/lib/types/perustelu';
import { OphRadioGroupWithClear } from '@/src/components/OphRadioGroupWithClear';

interface Props {
  perustelu: Perustelu | undefined;
  updatePerustelu: (perustelu: Partial<Perustelu>) => void;
}

export const AikaisemmatPaatokset = ({ perustelu, updatePerustelu }: Props) => {
  const { t } = useTranslations();

  // Controlled component - read value directly from props (server response)
  const currentValue = perustelu?.aikaisemmatPaatokset;

  const updateAikaisemmatPaatokset = (val: boolean | null) => {
    // Update field directly with value
    updatePerustelu({
      aikaisemmatPaatokset: val,
    });
  };

  return (
    <OphRadioGroupWithClear
      label={t(
        'hakemus.perustelu.yleiset.muutPerustelut.aikaisemmatPaatokset.otsikko',
      )}
      labelId="aikaisemmat-paatokset-radio-group-label"
      data-testid="aiemmat-paatokset-radio-group"
      options={[
        {
          value: 'true',
          label: t(
            'hakemus.perustelu.yleiset.muutPerustelut.aikaisemmatPaatokset.kylla',
          ),
        },
        {
          value: 'false',
          label: t(
            'hakemus.perustelu.yleiset.muutPerustelut.aikaisemmatPaatokset.ei',
          ),
        },
      ]}
      row={false}
      value={currentValue?.toString() ?? ''}
      onChange={(e) => updateAikaisemmatPaatokset(e.target.value === 'true')}
      onClear={() => updateAikaisemmatPaatokset(null)}
    />
  );
};
