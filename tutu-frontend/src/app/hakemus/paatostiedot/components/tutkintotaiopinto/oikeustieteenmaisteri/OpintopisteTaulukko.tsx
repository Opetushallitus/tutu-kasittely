import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import { OphTypography, ophColors } from '@opetushallitus/oph-design-system';
import React from 'react';

import { TFunction } from '@/src/lib/localization/hooks/useTranslations';

type VaaditutOpinnot = {
  kokonaisLaajuus: number;
  perusJaAineTasoiset: number;
  eurooppa?: number;
};

const VAADITUT_OPINNOT_BY_SOVELLETTU_TILANNE: Record<string, VaaditutOpinnot> =
  {
    '1': { kokonaisLaajuus: 40, perusJaAineTasoiset: 40 },
    '1a': { kokonaisLaajuus: 65, perusJaAineTasoiset: 40 },
    '1b': { kokonaisLaajuus: 65, perusJaAineTasoiset: 40 },
    '2': { kokonaisLaajuus: 65, perusJaAineTasoiset: 40, eurooppa: 10 },
    '2a': { kokonaisLaajuus: 75, perusJaAineTasoiset: 40, eurooppa: 10 },
    '3': { kokonaisLaajuus: 15, perusJaAineTasoiset: 15 },
    '4': { kokonaisLaajuus: 15, perusJaAineTasoiset: 15 },
    '4a': { kokonaisLaajuus: 40, perusJaAineTasoiset: 15 },
  };

const LabelCell = ({
  t,
  labelId,
  wPcent,
  bold,
}: {
  t: TFunction;
  labelId: string;
  wPcent?: string;
  bold?: boolean;
}) => {
  const widthParam = wPcent ? { style: { width: `${wPcent}%` } } : {};
  const boldParam = bold ? { style: { fontWeight: 'bold' } } : {};

  return (
    <TableCell {...widthParam}>
      <OphTypography {...boldParam}>
        {t(`hakemus.paatos.myonteinenPaatos.uo.sovellettuTilanne.${labelId}`)}
      </OphTypography>
    </TableCell>
  );
};

const OpCell = ({
  val,
  bold,
  highlight,
}: {
  val: number;
  bold?: boolean;
  highlight?: boolean;
}) => {
  const style: { fontWeight?: string; backgroundColor?: string } = bold
    ? { fontWeight: 'bold' }
    : {};
  if (highlight) {
    style.backgroundColor = val > 0 ? ophColors.yellow1 : ophColors.green5;
  }
  return (
    <TableCell>
      <OphTypography component="span" {...style}>
        {val} op
      </OphTypography>
    </TableCell>
  );
};
export const OpintopisteTaulukko = ({
  t,
  sovellettuTilanne,
  tallinnaOpintojenLaajuus,
  eurooppaOpintojenLaajuus,
  suomiOpintojenLaajuus,
}: {
  t: TFunction;
  sovellettuTilanne: string;
  tallinnaOpintojenLaajuus?: number;
  eurooppaOpintojenLaajuus?: number;
  suomiOpintojenLaajuus?: number;
}) => {
  const vaadittuKokonaisLaajuus =
    VAADITUT_OPINNOT_BY_SOVELLETTU_TILANNE[sovellettuTilanne].kokonaisLaajuus;
  const vaadittuPerusJaAineopinto =
    VAADITUT_OPINNOT_BY_SOVELLETTU_TILANNE[sovellettuTilanne]
      .perusJaAineTasoiset;
  const vaadittuEurooppaOpinto =
    VAADITUT_OPINNOT_BY_SOVELLETTU_TILANNE[sovellettuTilanne].eurooppa;

  const suoritettuPerusJaAineopinto =
    (tallinnaOpintojenLaajuus ?? 0) + (suomiOpintojenLaajuus ?? 0);
  const suoritettuKokonaisLaajuus =
    suoritettuPerusJaAineopinto + (eurooppaOpintojenLaajuus ?? 0);

  const edellytettyKokonaisLaajuus =
    suoritettuKokonaisLaajuus > vaadittuKokonaisLaajuus
      ? 0
      : vaadittuKokonaisLaajuus - suoritettuKokonaisLaajuus;
  const edellytettyPerusJaAineopinto =
    suoritettuPerusJaAineopinto > vaadittuPerusJaAineopinto
      ? 0
      : vaadittuPerusJaAineopinto - suoritettuPerusJaAineopinto;

  return (
    <Table
      sx={{
        '& .MuiTableCell-root': {
          borderBottom: 'none',
        },
      }}
    >
      <TableHead>
        <TableRow>
          <LabelCell t={t} labelId="vaaditutOpinnot" wPcent="40" bold={true} />
          <LabelCell t={t} labelId="laajuus" wPcent="20" bold={true} />
          <LabelCell t={t} labelId="suoritettu" wPcent="20" bold={true} />
          <LabelCell t={t} labelId="edellytetaan" wPcent="20" bold={true} />
        </TableRow>
      </TableHead>
      <TableBody sx={{ backgroundColor: 'white' }}>
        <TableRow data-testid="opintopiste-taulukko-rivi-kokonaislaajuus">
          <LabelCell t={t} labelId="kokonaisLaajuus" />
          <OpCell val={vaadittuKokonaisLaajuus} bold={true} />
          <OpCell val={suoritettuKokonaisLaajuus} bold={true} />
          <OpCell
            val={edellytettyKokonaisLaajuus}
            bold={true}
            highlight={true}
          />
        </TableRow>
        <TableRow data-testid="opintopiste-taulukko-rivi-perusjaainetasoiset">
          <LabelCell t={t} labelId="perusJaAineTasoiset" />
          <OpCell val={vaadittuPerusJaAineopinto} />
          <OpCell val={suoritettuPerusJaAineopinto} />
          <OpCell val={edellytettyPerusJaAineopinto} highlight={true} />
        </TableRow>
        {vaadittuEurooppaOpinto && (
          <TableRow data-testid="opintopiste-taulukko-rivi-eurooppaOpinnot">
            <LabelCell t={t} labelId="eurooppaOpinnot" />
            <OpCell val={vaadittuEurooppaOpinto} />
            <OpCell val={eurooppaOpintojenLaajuus ?? 0} />
            <OpCell
              val={
                eurooppaOpintojenLaajuus &&
                eurooppaOpintojenLaajuus >= vaadittuEurooppaOpinto
                  ? 0
                  : vaadittuEurooppaOpinto - (eurooppaOpintojenLaajuus ?? 0)
              }
              highlight={true}
            />
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};
