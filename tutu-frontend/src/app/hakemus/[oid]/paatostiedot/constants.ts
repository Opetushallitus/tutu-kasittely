import { TFunction } from '@/src/lib/localization/hooks/useTranslations';
import { Paatostyyppi } from '@/src/lib/types/paatos';

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

export const sovellettuLakiOptions = (
  paatosTyyppi: Paatostyyppi,
  t: TFunction,
) => {
  switch (paatosTyyppi) {
    case 'Taso':
    case 'TiettyTutkintoTaiOpinnot':
      return [
        {
          value: 'uo',
          label: t('hakemus.paatos.sovellettuLaki.uo'),
        },
      ];
    case 'Kelpoisuus':
      return [
        {
          value: 'ap',
          label: t('hakemus.paatos.sovellettuLaki.ap'),
        },
        {
          value: 'ap_seut',
          label: t('hakemus.paatos.sovellettuLaki.ap_seut'),
        },
        {
          value: 'uo',
          label: t('hakemus.paatos.sovellettuLaki.uo'),
        },
      ];
    case 'RiittavatOpinnot':
      return [
        {
          value: 'ro',
          label: t('hakemus.paatos.sovellettuLaki.ro'),
        },
      ];
  }
};
