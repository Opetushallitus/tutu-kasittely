import { OphTypography } from '@opetushallitus/oph-design-system';
import { Esittelija } from '@/src/lib/types/esittelija';

interface Maakoodi {
  koodi: string;
  nimi: string;
  esittelijaId: string | null;
}

interface EsittelijaSectionProps {
  esittelija: Esittelija;
  maakoodit: Maakoodi[] | undefined;
  t: (key: string) => string;
}

const filterMaakooditByEsittelija = (
  maakoodit: Maakoodi[] | undefined,
  esittelijaId: string | null | undefined,
) =>
  maakoodit
    ?.filter((maakoodi) => maakoodi.esittelijaId === esittelijaId)
    .map((maakoodi) => maakoodi.nimi) || [];

export const EsittelijaSection = ({
  esittelija,
  maakoodit,
  t,
}: EsittelijaSectionProps) => {
  const maakooditForEsittelija = filterMaakooditByEsittelija(
    maakoodit,
    esittelija.id,
  );

  return (
    <>
      <OphTypography variant={'h4'}>
        {esittelija.etunimi} {esittelija.sukunimi}
      </OphTypography>

      <OphTypography variant={'label'}>
        {t('maajako.tutkinnonsuoritusmaat')}
      </OphTypography>

      <OphTypography variant={'body1'}>
        {maakooditForEsittelija.length > 0
          ? maakooditForEsittelija.join(', ')
          : '-'}
      </OphTypography>
    </>
  );
};
