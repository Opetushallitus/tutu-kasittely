import { OphTypography } from '@opetushallitus/oph-design-system';
import { Esittelija } from '@/src/lib/types/esittelija';

interface Maakoodi {
  koodi: string;
  nimi: string;
  esittelijaId: string | null;
}

interface SelectedMaakoodiInfoProps {
  maakoodit: Maakoodi[] | undefined;
  selectedMaakoodi: string;
  esittelijat: Esittelija[] | undefined;
}

export const SelectedMaakoodiInfo = ({
  maakoodit,
  selectedMaakoodi,
  esittelijat,
}: SelectedMaakoodiInfoProps) => {
  const filteredMaakoodit =
    maakoodit?.filter(
      (maakoodi) =>
        maakoodi.esittelijaId != null && maakoodi.koodi === selectedMaakoodi,
    ) || [];

  if (filteredMaakoodit.length > 0) {
    const esittelijaId = filteredMaakoodit[0].esittelijaId;
    const esittelija = esittelijat?.find((e) => e.id === esittelijaId);

    if (esittelija) {
      return (
        <>
          <OphTypography variant={'h4'}>Esittelijä</OphTypography>
          <OphTypography variant={'body1'}>
            {esittelija.etunimi} {esittelija.sukunimi}
          </OphTypography>
        </>
      );
    }
  }
  return null;
};
