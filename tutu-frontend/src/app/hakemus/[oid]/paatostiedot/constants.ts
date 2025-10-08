import { TFunction } from '@/src/lib/localization/hooks/useTranslations';

export const ratkaisutyyppiOptions = (t: TFunction) => [
  { value: 'Paatos', label: t('hakemus.paatos.ratkaisutyyppi.paatos') },
  {
    value: 'PeruutusTaiRaukeaminen',
    label: t('hakemus.paatos.ratkaisutyyppi.peruutusTaiRaukeaminen'),
  },
  { value: 'Oikaisu', label: t('hakemus.paatos.ratkaisutyyppi.oikaisu') },
  {
    value: 'JatetaanTutkimatta',
    label: t('hakemus.paatos.ratkaisutyyppi.jatetaanTutkimatta'),
  },
  { value: 'Siirto', label: t('hakemus.paatos.ratkaisutyyppi.siirto') },
];

export const paatostyyppiOptions = (t: TFunction) => [
  { value: 'Taso', label: t('hakemus.paatos.paatostyyppi.taso') },
  {
    value: 'Kelpoisuus',
    label: t('hakemus.paatos.paatostyyppi.kelpoisuus'),
  },
  {
    value: 'TiettyTutkintoTaiOpinnot',
    label: t('hakemus.paatos.paatostyyppi.tiettyTutkintoTaiOpinnot'),
  },
  {
    value: 'RiittavatOpinnot',
    label: t('hakemus.paatos.paatostyyppi.riittavatOpinnot'),
  },
];
