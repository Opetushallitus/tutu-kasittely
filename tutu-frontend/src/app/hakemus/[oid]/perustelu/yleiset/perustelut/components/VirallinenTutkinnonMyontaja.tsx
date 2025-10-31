import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import { Perustelu } from '@/src/lib/types/perustelu';
import { OphRadioGroupWithClear } from '@/src/components/OphRadioGroupWithClear';

interface Props {
  perustelu: Perustelu | undefined;
  updatePerustelu: (perustelu: Partial<Perustelu>) => void;
}

export const VirallinenTutkinnonMyontaja = ({
  perustelu,
  updatePerustelu,
}: Props) => {
  const { t } = useTranslations();

  // Controlled component - read value directly from props (server response)
  const currentValue = perustelu?.virallinenTutkinnonMyontaja;

  const updateVirallinenTutkinnonMyontaja = (
    val: boolean | null | undefined,
  ) => {
    // Update field directly with value
    updatePerustelu({
      virallinenTutkinnonMyontaja: val,
    });
  };

  return (
    <OphRadioGroupWithClear
      label={t(
        'hakemus.perustelu.yleiset.perustelut.virallinenTutkinnonMyontaja',
      )}
      labelId="virallinen-tutkinnon-myontaja-radio-group-label"
      data-testid="virallinen-tutkinnon-myontaja-radio-group"
      options={[
        { value: 'true', label: t('yleiset.kylla') },
        { value: 'false', label: t('yleiset.ei') },
      ]}
      row
      value={currentValue?.toString() ?? ''}
      onChange={(e) =>
        updateVirallinenTutkinnonMyontaja(e.target.value === 'true')
      }
      onClear={() => updateVirallinenTutkinnonMyontaja(null)}
    />
  );
};
