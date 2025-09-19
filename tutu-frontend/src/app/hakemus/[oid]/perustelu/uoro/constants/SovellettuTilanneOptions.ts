import { OphRadioOption } from '@/src/lib/types/common';

export const sovellettuPedagogisetOpinnotOptions: OphRadioOption<string>[] = [
  { value: 'A', label: 'A' },
  { value: 'B', label: 'B' },
  { value: 'C', label: 'C' },
  { value: 'D', label: 'D' },
  { value: 'E', label: 'E' },
  { value: 'F', label: 'F' },
];

export const sovellettuMonialaisetOpinnotOptions: OphRadioOption<string>[] = [
  { value: 'A', label: 'A' },
  { value: 'B', label: 'B' },
];

export const sovellettuErityisOpetusOptions: OphRadioOption<string>[] = [
  { value: 'A', label: 'A' },
  { value: 'B', label: 'B' },
  { value: 'C', label: 'C' },
  { value: 'D', label: 'D' },
  { value: 'E', label: 'E' },
];

export const sovellettuVarhaiskasvatusOptions: OphRadioOption<string>[] = [
  { value: 'A', label: 'A' },
  { value: 'B', label: 'B' },
  { value: 'C', label: 'C' },
  { value: 'D', label: 'D' },
];

export const sovellettuLuokanOpettajaOptions: OphRadioOption<string>[] = [
  { value: 'A', label: 'A' },
  { value: 'B', label: 'B' },
];

export const sovellettuRinnastaminenKasvatustieteelliseenTutkintoon: OphRadioOption<string>[][] =
  [
    [
      { value: 'KK1', label: 'KK1' },
      { value: 'KK2', label: 'KK2' },
    ],
    [
      { value: 'KM1', label: 'KM1' },
      { value: 'KM2A', label: 'KM2A' },
      { value: 'KM2B', label: 'KM2B' },
      { value: 'KM3', label: 'KM3' },
      { value: 'KM4A', label: 'KM4A' },
      { value: 'KM4B', label: 'KM4B' },
    ],
    [
      { value: 'KL', label: 'KL' },
      { value: 'KT', label: 'KT' },
    ],
  ];

export const sovellettuRinnastaminenOikeustieteenMaisterinTutkintoon: OphRadioOption<string>[] =
  [
    { value: '1', label: '1' },
    { value: '1A', label: '1A' },
    { value: '1B', label: '1B' },
    { value: '2', label: '2' },
    { value: '2A', label: '2A' },
    { value: '3', label: '3' },
    { value: '4', label: '4' },
    { value: '4A', label: '4A' },
  ];

export const sovellettuTilanneOpetettavatAineetVieraatKieletOptions: OphRadioOption<string>[] =
  [
    { value: 'A1', label: 'A1' },
    { value: 'A2', label: 'A2' },
    { value: 'A3', label: 'A3' },
    { value: 'A4', label: 'A4' },
    { value: 'A5', label: 'A5' },
    { value: 'B1', label: 'B1' },
    { value: 'B2', label: 'B2' },
    { value: 'B3', label: 'B3' },
  ];

export const SovellettuTilanneOpetettavatAineetOptions: Record<
  string,
  OphRadioOption<string>[]
> = {
  liikunta: [
    { value: 'A', label: 'A' },
    { value: 'B', label: 'B' },
    { value: 'C', label: 'C' },
    { value: 'D', label: 'D' },
    { value: 'E', label: 'E' },
  ],
  musiikki: [
    { value: 'A', label: 'A' },
    { value: 'B', label: 'B' },
    { value: 'C', label: 'C' },
    { value: 'D', label: 'D' },
    { value: 'E', label: 'E' },
    { value: 'F', label: 'F' },
  ],
  kuvataide: [
    { value: 'A', label: 'A' },
    { value: 'B', label: 'B' },
    { value: 'C', label: 'C' },
    { value: 'D', label: 'D' },
    { value: 'E', label: 'E' },
    { value: 'F', label: 'F' },
  ],
  kemia: [
    { value: 'A', label: 'A' },
    { value: 'B', label: 'B' },
    { value: 'C', label: 'C' },
    { value: 'D', label: 'D' },
  ],
  matematiikka: [
    { value: 'A', label: 'A' },
    { value: 'B', label: 'B' },
    { value: 'C', label: 'C' },
    { value: 'D', label: 'D' },
  ],
  fysiikka: [
    { value: 'A', label: 'A' },
    { value: 'B', label: 'B' },
    { value: 'C', label: 'C' },
    { value: 'D', label: 'D' },
  ],
  biologia: [
    { value: 'A', label: 'A' },
    { value: 'B', label: 'B' },
    { value: 'C', label: 'C' },
    { value: 'D', label: 'D' },
  ],
  maantiede: [
    { value: 'A', label: 'A' },
    { value: 'B', label: 'B' },
    { value: 'C', label: 'C' },
    { value: 'D', label: 'D' },
  ],
  historia: [
    { value: 'A', label: 'A' },
    { value: 'A1', label: 'A1' },
    { value: 'A2', label: 'A2' },
    { value: 'A3', label: 'A3' },
    { value: 'B', label: 'B' },
    { value: 'B1', label: 'B1' },
  ],
  yhteiskuntaoppi: [
    { value: 'A', label: 'A' },
    { value: 'A1', label: 'A1' },
    { value: 'B', label: 'B' },
  ],
};
