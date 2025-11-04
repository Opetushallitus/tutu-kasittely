import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import { Perustelu } from '@/src/lib/types/perustelu';
import { OphRadioGroupWithClear } from '@/src/components/OphRadioGroupWithClear';

interface Props {
  perustelu: Perustelu | undefined;
  updatePerustelu: (perustelu: Partial<Perustelu>) => void;
}

export const VirallinenTutkinto = ({ perustelu, updatePerustelu }: Props) => {
  const { t } = useTranslations();

  const currentValue = perustelu?.virallinenTutkinto;

  const updateVirallinenTutkinto = (val: boolean | null | undefined) => {
    updatePerustelu({
      virallinenTutkinto: val,
    });
  };

  return (
    <OphRadioGroupWithClear
      label={t('hakemus.perustelu.yleiset.perustelut.virallinenTutkinto')}
      labelId="virallinen-tutkinto-radio-group-label"
      data-testid="virallinen-tutkinto-radio-group"
      options={[
        { value: 'true', label: t('yleiset.kylla') },
        { value: 'false', label: t('yleiset.ei') },
      ]}
      row
      value={currentValue?.toString() ?? ''}
      onChange={(e) => updateVirallinenTutkinto(e.target.value === 'true')}
      onClear={() => updateVirallinenTutkinto(null)}
    />
  );
};
