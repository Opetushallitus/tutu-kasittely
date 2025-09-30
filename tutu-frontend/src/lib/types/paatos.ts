export type Ratkaisutyyppi =
  | 'Paatos'
  | 'PeruutusTaiRaukeaminen'
  | 'Oikaisu'
  | 'JatetaanTutkimatta'
  | 'Siirto';

export type Paatos = {
  ratkaisutyyppi?: Ratkaisutyyppi;
  seutArviointi: boolean;
};

export type PaatosUpdateCallback = (paatos: Paatos) => void;
