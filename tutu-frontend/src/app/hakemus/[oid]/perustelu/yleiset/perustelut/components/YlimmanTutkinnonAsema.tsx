import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import { Perustelu } from '@/src/lib/types/perustelu';
import { OphRadioGroupWithClear } from '@/src/components/OphRadioGroupWithClear';
import { wrapField } from '@/src/lib/types/fieldWrapper';

interface Props {
  perustelu: Perustelu | undefined;
  updatePerustelu: (perustelu: Partial<Perustelu>) => void;
}

export const YlimmanTutkinnonAsema = ({
  perustelu,
  updatePerustelu,
}: Props) => {
  const { t } = useTranslations();

  // Controlled component - read value directly from props (server response)
  const currentValue = perustelu?.ylimmanTutkinnonAsemaLahtomaanJarjestelmassa;

  const updateYlimmanTutkinnonAsema = (val: string | null | undefined) => {
    // Wrap value for backend deserialization (type-safe) - immediate update
    updatePerustelu(
      wrapField(
        'ylimmanTutkinnonAsemaLahtomaanJarjestelmassa',
        val,
      ) as unknown as Partial<Perustelu>,
    );
  };

  const tutkinnonAsemat = [
    'alempi_korkeakouluaste',
    'ylempi_korkeakouluaste',
    'alempi_ja_ylempi_korkeakouluaste',
    'tutkijakoulutusaste',
    'ei_korkeakouluaste',
  ];

  return (
    <OphRadioGroupWithClear
      label={t(
        'hakemus.perustelu.yleiset.perustelut.ylimmanTutkinnonAsema.otsikko',
      )}
      labelId="ylimman-tutkinnon-asema-radio-group-label"
      data-testid="tutkinnon-asema-radio-group"
      options={tutkinnonAsemat.map((asema) => ({
        value: asema,
        label: t(
          `hakemus.perustelu.yleiset.perustelut.ylimmanTutkinnonAsema.${asema}`,
        ),
      }))}
      row={false}
      value={currentValue ?? ''}
      onChange={(e) => updateYlimmanTutkinnonAsema(e.target.value)}
      onClear={() => updateYlimmanTutkinnonAsema(null)}
    />
  );
};
