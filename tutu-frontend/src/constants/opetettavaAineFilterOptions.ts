import { TFunction } from '@/src/lib/localization/hooks/useTranslations';
import {
  TranslationNode,
  TreeOption,
  buildTreeOptions,
} from '@/src/lib/localization/translationUtils';

// Katso paatosTietoOptions.json.
// Aineet jotka ovat sekä perusopetuksessa että lukiossa on listattu vain kerran.

const opetettavaAineItems: TranslationNode[] = [
  {
    tKey: 'haku.opetettavatAineet.opetettavatAineet',
    value: 'Opetettavat aineet',
    children: [
      {
        tKey: 'haku.opetettavatAineet.aidinkieliJaKirjallisuus',
        value: 'äidinkieli ja kirjallisuus',
        children: [
          {
            tKey: 'haku.opetettavatAineet.suomi',
            value: 'äidinkieli ja kirjallisuus_suomi',
          },
          {
            tKey: 'haku.opetettavatAineet.ruotsi',
            value: 'äidinkieli ja kirjallisuus_ruotsi',
          },
          {
            tKey: 'haku.opetettavatAineet.saame',
            value: 'äidinkieli ja kirjallisuus_saame',
          },
        ],
      },
      {
        tKey: 'haku.opetettavatAineet.toinenKotimainenKieli',
        value: 'toinen kotimainen kieli',
        children: [
          {
            tKey: 'haku.opetettavatAineet.ruotsi',
            value: 'toinen kotimainen kieli_ruotsi',
          },
          {
            tKey: 'haku.opetettavatAineet.suomi',
            value: 'toinen kotimainen kieli_suomi',
          },
        ],
      },
      {
        tKey: 'haku.opetettavatAineet.vierasKieli',
        value: 'vieras kieli',
        children: [
          {
            tKey: 'haku.opetettavatAineet.englanti',
            value: 'vieras kieli_englanti',
          },
          {
            tKey: 'haku.opetettavatAineet.espanja',
            value: 'vieras kieli_espanja',
          },
          {
            tKey: 'haku.opetettavatAineet.italia',
            value: 'vieras kieli_italia',
          },
          {
            tKey: 'haku.opetettavatAineet.japani',
            value: 'vieras kieli_japani',
          },
          {
            tKey: 'haku.opetettavatAineet.kiina',
            value: 'vieras kieli_kiina',
          },
          {
            tKey: 'haku.opetettavatAineet.latina',
            value: 'vieras kieli_latina',
          },
          {
            tKey: 'haku.opetettavatAineet.portugali',
            value: 'vieras kieli_portugali',
          },
          {
            tKey: 'haku.opetettavatAineet.ranska',
            value: 'vieras kieli_ranska',
          },
          {
            tKey: 'haku.opetettavatAineet.saame',
            value: 'vieras kieli_saame',
          },
          {
            tKey: 'haku.opetettavatAineet.saksa',
            value: 'vieras kieli_saksa',
          },
          {
            tKey: 'haku.opetettavatAineet.venaja',
            value: 'vieras kieli_venäjä',
          },
          {
            tKey: 'haku.opetettavatAineet.viro',
            value: 'vieras kieli_viro',
          },
        ],
      },
      {
        tKey: 'haku.opetettavatAineet.uskonto',
        value: 'uskonto',
        children: [
          {
            tKey: 'haku.opetettavatAineet.uskontoEvankelisLuterilainen',
            value: 'uskonto_uskonto, evankelis-luterilainen',
          },
          {
            tKey: 'haku.opetettavatAineet.uskontoOrtodoksinen',
            value: 'uskonto_uskonto, ortodoksinen',
          },
          {
            tKey: 'haku.opetettavatAineet.uskontoKatolinen',
            value: 'uskonto_uskonto, katolinen',
          },
          {
            tKey: 'haku.opetettavatAineet.uskontoIslam',
            value: 'uskonto_uskonto, islam',
          },
        ],
      },
      { tKey: 'haku.opetettavatAineet.matematiikka', value: 'matematiikka' },
      { tKey: 'haku.opetettavatAineet.biologia', value: 'biologia' },
      { tKey: 'haku.opetettavatAineet.maantieto', value: 'maantieto' },
      { tKey: 'haku.opetettavatAineet.maantiede', value: 'maantiede' },
      { tKey: 'haku.opetettavatAineet.fysiikka', value: 'fysiikka' },
      { tKey: 'haku.opetettavatAineet.kemia', value: 'kemia' },
      { tKey: 'haku.opetettavatAineet.terveystieto', value: 'terveystieto' },
      {
        tKey: 'haku.opetettavatAineet.elamankatsomustieto',
        value: 'elämänkatsomustieto',
      },
      { tKey: 'haku.opetettavatAineet.filosofia', value: 'filosofia' },
      { tKey: 'haku.opetettavatAineet.psykologia', value: 'psykologia' },
      { tKey: 'haku.opetettavatAineet.historia', value: 'historia' },
      {
        tKey: 'haku.opetettavatAineet.yhteiskuntaoppi',
        value: 'yhteiskuntaoppi',
      },
      { tKey: 'haku.opetettavatAineet.musiikki', value: 'musiikki' },
      { tKey: 'haku.opetettavatAineet.kuvataide', value: 'kuvataide' },
      { tKey: 'haku.opetettavatAineet.kasityo', value: 'käsityö' },
      { tKey: 'haku.opetettavatAineet.liikunta', value: 'liikunta' },
      { tKey: 'haku.opetettavatAineet.kotitalous', value: 'kotitalous' },
      {
        tKey: 'haku.opetettavatAineet.tietotekniikka',
        value: 'tietotekniikka',
      },
    ],
  },
  // Yhdistetty tiettyTutkintoTaiOpinnotOptions
  {
    tKey: 'haku.opetettavatAineet.paivakodinJohtaja',
    value: 'Päiväkodin johtaja',
  },
  {
    tKey: 'haku.opetettavatAineet.steinerpedagoginenHenkilosto',
    value: 'Steinerpedagogisen henkilöstön tehtävät',
  },
  {
    tKey: 'haku.opetettavatAineet.rinnastaminenOikeustieteenMaisterinTutkintoon',
    value: 'Rinnastaminen oikeustieteen maisterin tutkintoon',
  },
  {
    tKey: 'haku.opetettavatAineet.opettajanPedagogisetOpinnot',
    value: 'Opettajan pedagogiset opinnot',
  },
  {
    tKey: 'haku.opetettavatAineet.erityisopetuksenTehtaviinAmmatillisiaValmiuksiaAntavatOpinnot',
    value: 'Erityisopetuksen tehtäviin ammatillisia valmiuksia antavat opinnot',
  },
  {
    tKey: 'haku.opetettavatAineet.oppilaanohjauksenJaOpintoOhjauksenTehtaviinAmmatillisiaValmiuksiaAntavatOpinnot',
    value:
      'Oppilaanohjauksen ja opinto-ohjauksen tehtäviin ammatillisia valmiuksia antavat opinnot',
  },
  {
    tKey: 'haku.opetettavatAineet.kasvatustieteellisenAlanKorkeakoulututkinto',
    value:
      'Kasvatustieteellisen alan korkeakoulututkinto (kasvatustieteen kandidaatti, kasvatustieteen maisteri, kasvatustieteen lisensiaatti tai kasvatustieteen tohtori)',
  },
  {
    tKey: 'haku.opetettavatAineet.sosiaaliJaTerveysalanAmmattikorkeakoulututkinto',
    value:
      'Sosiaali- ja terveysalan ammattikorkeakoulututkinto tai ylempi ammattikorkeakoulututkinto (sosionomi (AMK) tai sosionomi (ylempi AMK))',
  },
  {
    tKey: 'haku.opetettavatAineet.muuOpetustehtavaTaiVarhaiskasvatuksenOpintosuoritus',
    value:
      'Muu opetustehtävään tai varhaiskasvatuksen tehtävään vaadittava korkeakoulun opintosuoritus',
  },
];

export const opetettavaAineTreeOptions = (t: TFunction): TreeOption[] =>
  buildTreeOptions(opetettavaAineItems, t);
