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

type OpRange = {
  min: number;
  max: number;
};

type VaaditutOpinnot = {
  kokonaisLaajuus: OpRange;
  perusJaAineTasoiset: OpRange | number;
  eurooppa?: OpRange;
};

const VAADITUT_OPINNOT_BY_SOVELLETTU_TILANNE: Record<string, VaaditutOpinnot> =
  {
    '1': {
      kokonaisLaajuus: { min: 40, max: 65 },
      perusJaAineTasoiset: { min: 40, max: 65 },
    },
    '1a': {
      kokonaisLaajuus: { min: 65, max: 95 },
      perusJaAineTasoiset: 40,
    },
    '1b': {
      kokonaisLaajuus: { min: 65, max: 95 },
      perusJaAineTasoiset: 40,
    },
    '2': {
      kokonaisLaajuus: { min: 65, max: 95 },
      perusJaAineTasoiset: 40,
      eurooppa: { min: 10, max: 20 },
    },
    '2a': {
      kokonaisLaajuus: { min: 75, max: 95 },
      perusJaAineTasoiset: 40,
      eurooppa: { min: 10, max: 20 },
    },
    '3': {
      kokonaisLaajuus: { min: 15, max: 25 },
      perusJaAineTasoiset: { min: 15, max: 25 },
    },
    '4': {
      kokonaisLaajuus: { min: 15, max: 25 },
      perusJaAineTasoiset: { min: 15, max: 25 },
    },
    '4a': {
      kokonaisLaajuus: { min: 40, max: 55 },
      perusJaAineTasoiset: { min: 15, max: 25 },
    },
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
  range,
  bold,
  highlight,
}: {
  range: OpRange | number;
  bold?: boolean;
  highlight?: boolean;
}) => {
  const minOrExact = typeof range === 'number' ? range : range.min;
  const max = typeof range === 'number' ? undefined : range.max;
  const style: { fontWeight?: string; backgroundColor?: string } = bold
    ? { fontWeight: 'bold' }
    : {};
  if (highlight) {
    style.backgroundColor =
      minOrExact > 0 || max ? ophColors.yellow1 : ophColors.green5;
  }
  const val = max ? `${minOrExact}-${max}` : minOrExact;
  return (
    <TableCell>
      <OphTypography component="span" {...style}>
        {val} op
      </OphTypography>
    </TableCell>
  );
};

const calculateEdellytetytPisteet = (
  suoritettu: number,
  vaadittu: OpRange | number,
): OpRange | number => {
  let edellytettyMinOrExact =
    typeof vaadittu === 'number' ? vaadittu : vaadittu.min;
  edellytettyMinOrExact =
    suoritettu > edellytettyMinOrExact ? 0 : edellytettyMinOrExact - suoritettu;

  let edellytettyMax = typeof vaadittu === 'number' ? undefined : vaadittu.max;
  edellytettyMax =
    edellytettyMax && suoritettu < edellytettyMax
      ? edellytettyMax - suoritettu
      : undefined;

  return edellytettyMax
    ? {
        min: edellytettyMinOrExact,
        max: edellytettyMax,
      }
    : edellytettyMinOrExact;
};

export const OpintopisteTaulukko = ({
  t,
  sovellettuTilanne,
  suoritetutTallinnaOpinnot,
  suoritetutEurooppaOpinnot,
  suoritetutSuomiOpinnot,
}: {
  t: TFunction;
  sovellettuTilanne: string;
  suoritetutTallinnaOpinnot?: number | null;
  suoritetutEurooppaOpinnot?: number | null;
  suoritetutSuomiOpinnot?: number | null;
}) => {
  const vaadittuKokonaisLaajuus =
    VAADITUT_OPINNOT_BY_SOVELLETTU_TILANNE[sovellettuTilanne].kokonaisLaajuus;
  const vaadittuPerusJaAineopinto =
    VAADITUT_OPINNOT_BY_SOVELLETTU_TILANNE[sovellettuTilanne]
      .perusJaAineTasoiset;
  const vaaditutEurooppaOpinnot =
    VAADITUT_OPINNOT_BY_SOVELLETTU_TILANNE[sovellettuTilanne].eurooppa;

  const suoritettuPerusJaAineopinto =
    (suoritetutTallinnaOpinnot ?? 0) + (suoritetutSuomiOpinnot ?? 0);
  const suoritettuKokonaisLaajuus =
    suoritettuPerusJaAineopinto + (suoritetutEurooppaOpinnot ?? 0);

  const edellytettyKokonaisLaajuus = calculateEdellytetytPisteet(
    suoritettuKokonaisLaajuus,
    vaadittuKokonaisLaajuus,
  );

  const edellytettyPerusJaAineopinto = calculateEdellytetytPisteet(
    suoritettuPerusJaAineopinto,
    vaadittuPerusJaAineopinto,
  );

  const edellytetytEurooppaOpinnot = vaaditutEurooppaOpinnot
    ? calculateEdellytetytPisteet(
        suoritetutEurooppaOpinnot ?? 0,
        vaaditutEurooppaOpinnot,
      )
    : undefined;

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
          <OpCell range={vaadittuKokonaisLaajuus} bold={true} />
          <OpCell range={suoritettuKokonaisLaajuus} bold={true} />
          <OpCell
            range={edellytettyKokonaisLaajuus}
            bold={true}
            highlight={true}
          />
        </TableRow>
        <TableRow data-testid="opintopiste-taulukko-rivi-perusjaainetasoiset">
          <LabelCell t={t} labelId="perusJaAineTasoiset" />
          <OpCell range={vaadittuPerusJaAineopinto} />
          <OpCell range={suoritettuPerusJaAineopinto} />
          <OpCell range={edellytettyPerusJaAineopinto} highlight={true} />
        </TableRow>
        {vaaditutEurooppaOpinnot && (
          <TableRow data-testid="opintopiste-taulukko-rivi-eurooppaOpinnot">
            <LabelCell t={t} labelId="eurooppaOpinnotLyhytNimi" />
            <OpCell range={vaaditutEurooppaOpinnot} />
            <OpCell range={suoritetutEurooppaOpinnot ?? 0} />
            <OpCell range={edellytetytEurooppaOpinnot!} highlight={true} />
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};
