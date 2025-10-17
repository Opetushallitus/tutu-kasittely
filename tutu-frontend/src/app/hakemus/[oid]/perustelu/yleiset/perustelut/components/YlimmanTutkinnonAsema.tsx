import { useEffect, useState } from 'react';

import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import { Perustelu } from '@/src/lib/types/perustelu';
import { OphRadioGroupWithClear } from '@/src/components/OphRadioGroupWithClear';

interface Props {
  perustelu: Perustelu | undefined;
  updatePerustelu: (perustelu: Partial<Perustelu>) => void;
}

export const YlimmanTutkinnonAsema = ({
  perustelu: maybePerustelu,
  updatePerustelu,
}: Props) => {
  const { t } = useTranslations();

  const [ylimmanTutkinnonAsema, setYlimmanTutkinnonAsema] = useState<
    string | null | undefined
  >();

  const updateYlimmanTutkinnonAsema = (val: string | null | undefined) => {
    if (val !== ylimmanTutkinnonAsema) {
      setYlimmanTutkinnonAsema(val);
      updatePerustelu({
        ylimmanTutkinnonAsemaLahtomaanJarjestelmassa: val,
      });
    }
  };

  useEffect(() => {
    setYlimmanTutkinnonAsema(
      maybePerustelu?.ylimmanTutkinnonAsemaLahtomaanJarjestelmassa,
    );
  }, [maybePerustelu?.ylimmanTutkinnonAsemaLahtomaanJarjestelmassa]);

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
      value={ylimmanTutkinnonAsema ?? ''}
      onChange={(e) => updateYlimmanTutkinnonAsema(e.target.value)}
      onClear={() => updateYlimmanTutkinnonAsema(null)}
    />
  );
};
