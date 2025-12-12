import { SisaltoItem } from '@/src/lib/types/hakemus';

export const _sisalto: Array<SisaltoItem> = [
  {
    children: [
      {
        label: {
          fi: 'Minkä tai mitkä seuraavista olet suorittanut?',
          sv: 'Vilken eller vilka av de följande har du kompletterat?',
          en: 'Which of the following have you completed?',
        },
        key: '42d23ef4-7e1e-4de6-8d4d-a35d5ef0d786',
        value: [
          {
            label: {
              fi: 'Sopeutumisajan',
              sv: 'Anpassningsperiod',
              en: 'Adaptation period',
            },
            value: '3',
            followups: [
              {
                label: {
                  fi: 'Tehtävä(t), jossa sopeutumisaika on suoritettu (tehtävänimike suomen tai ruotsin kielellä)',
                  sv: 'Arbetsuppgift(er) i vilken anpassningsperioden har genomförts (uppgiftsbenämning på finska eller svenska)',
                  en: 'Position(s) in which the adaptation period was completed (provide the title in Finnish or in Swedish)',
                },
                key: '917a7238-e839-4e0c-912f-05a8bd734042',
                fieldType: 'textArea',
                children: [],
                value: [
                  {
                    followups: [],
                    value: '',
                    label: {
                      fi: 'Säätäjä',
                      sv: 'säätäjä',
                      en: 'säätäjä',
                    },
                  },
                ],
              },
              {
                label: {
                  fi: 'Ajanjakso(t), jolloin sopeutumisaika on suoritettu',
                  sv: 'Tidpunkt(er) då anpassningsperioden har genomförts',
                  en: 'Start and end date(s) of the period(s) during which the adaptation period was completed',
                },
                key: '9bbcaab3-d3a0-41e3-89b7-a32a6a45cc0b',
                fieldType: 'textArea',
                children: [],
                value: [
                  {
                    followups: [],
                    value: '',
                    label: {
                      fi: '1.2.2025 - 2.2.2025',
                      sv: '1.2.2025 - 2.2.2025',
                      en: '1.2.2025 - 2.2.2025',
                    },
                  },
                ],
              },
              {
                label: {
                  fi: 'Työnantaja ja työnantajan yhteystiedot',
                  sv: 'Arbetsgivare och arbetsgivarens kontaktuppgifter',
                  en: 'Name and contact details of the employer(s)',
                },
                key: '0f981e15-8afa-418f-89b4-002ac4ea20d3',
                fieldType: 'textArea',
                children: [],
                value: [
                  {
                    followups: [],
                    value: '',
                    label: {
                      fi: 'Säätö oy',
                      sv: 'Säätö oy',
                      en: 'Säätö oy',
                    },
                  },
                ],
              },
              {
                label: {
                  fi: 'Sopeutumisajan valvoja ja valvojan pätevyys. Täytetään, jos ehdollisessa päätöksessä on määritelty valvojalta edellytettävä pätevyys.',
                  sv: 'Övervakare för anpassningsperioden och hans/hennes kompetens. Ifylls om den kompetens som krävs av övervakaren har bestämts i det villkorliga beslutet.',
                  en: "Supervisor for the adaptation period and the supervisor's qualification. Fill in, if the qualification requirements for the supervisor are specified in the conditional Finnish National Agency for Education decision.",
                },
                key: 'f1abcbce-e1a0-4e3f-9a96-58a25efea57a',
                fieldType: 'textArea',
                children: [],
                value: [
                  {
                    followups: [],
                    value: '',
                    label: {
                      fi: '',
                      sv: '',
                      en: '',
                    },
                  },
                ],
              },
              {
                label: {
                  fi: 'Sopeutumisajan suorittamisesta annetun todistuksen päivämäärä',
                  sv: 'Datum för intyg över genomförd anpassningsperiod',
                  en: 'Date(s) of the certificate(s) issued for completion of the adaptation period',
                },
                key: 'c904441f-27b1-4b83-bd39-77ee88532568',
                fieldType: 'textArea',
                children: [],
                value: [
                  {
                    followups: [],
                    value: '',
                    label: {
                      fi: '3.2.2025',
                      sv: '3.2.2025',
                      en: '3.2.2025',
                    },
                  },
                ],
              },
              {
                label: {
                  fi: 'Työnantajan antama todistus sopeutumisajan suorittamisesta',
                  sv: 'Intyg över anpassningsperioden',
                  en: 'The certificate(s) issued by the employer for completion of the adaptation period',
                },
                key: 'ce0fe7fe-b694-40e0-a461-9bd18d502f46',
                fieldType: 'attachment',
                children: [],
                value: [
                  {
                    followups: [],
                    value: '',
                    label: {
                      fi: '8003048a-92a2-4d3a-95a9-dae81e4533d8',
                      sv: '8003048a-92a2-4d3a-95a9-dae81e4533d8',
                      en: '8003048a-92a2-4d3a-95a9-dae81e4533d8',
                    },
                  },
                ],
              },
            ],
          },
          {
            label: {
              fi: 'Kelpoisuuskokeen',
              sv: 'Lämplighetsprov',
              en: 'Aptitude test',
            },
            value: '1',
            followups: [
              {
                label: {
                  fi: 'Kelpoisuuskokeen järjestäjä',
                  sv: 'Anordnaren av lämplighetsprovet',
                  en: 'Organiser of the aptitude test',
                },
                key: '8d416b6e-1739-4c67-a098-86f1106fd239',
                fieldType: 'textArea',
                children: [],
                value: [
                  {
                    followups: [],
                    value: '',
                    label: {
                      fi: 'Oy Ab',
                      sv: 'Oy Ab',
                      en: 'Oy Ab',
                    },
                  },
                ],
              },
              {
                label: {
                  fi: 'Kelpoisuuskokeen suorittamisesta annetun todistuksen päivämäärä',
                  sv: 'Datum för intyg över avläggande av lämplighetsprov',
                  en: 'Date(s) of issue of the certificate(s) awarded for completion of the aptitude test',
                },
                key: '4a0d7e78-7a30-414e-8f72-adab5b6fccff',
                fieldType: 'textArea',
                children: [],
                value: [
                  {
                    followups: [],
                    value: '',
                    label: {
                      fi: '4.2.2025',
                      sv: '4.2.2025',
                      en: '4.2.2025',
                    },
                  },
                ],
              },
              {
                label: {
                  fi: 'Todistus kelpoisuuskokeen suorittamisesta',
                  sv: 'Intyg över avläggande av lämplighetsprov',
                  en: 'Certificate(s) issued for completion of the aptitude test',
                },
                key: 'e8028ce6-cc89-43be-b396-22c20191d25d',
                fieldType: 'attachment',
                children: [],
                value: [
                  {
                    followups: [],
                    value: '',
                    label: {
                      fi: '2314ead7-7709-4405-b886-0a257a3382ab',
                      sv: '2314ead7-7709-4405-b886-0a257a3382ab',
                      en: '2314ead7-7709-4405-b886-0a257a3382ab',
                    },
                  },
                ],
              },
            ],
          },
          {
            label: {
              fi: 'Täydentäviä opintoja',
              sv: 'Kompletterande studier',
              en: 'Supplementing studies',
            },
            value: '2',
            followups: [
              {
                label: {
                  fi: 'Täydentävien opintojen järjestäjä',
                  sv: 'Anordnaren av kompletterande studier',
                  en: 'Organiser(s) of the additional studies',
                },
                key: '3af23df4-7255-445e-8c31-fa4f04ffab32',
                fieldType: 'textField',
                children: [],
                value: [
                  {
                    followups: [],
                    value: '',
                    label: {
                      fi: 'Elämän koulu',
                      sv: 'Elämän koulu',
                      en: 'Elämän koulu',
                    },
                  },
                ],
              },
              {
                label: {
                  fi: 'Korkeakoulun antamat todistukset täydentävien opintojen suorittamisesta',
                  sv: 'Högskolans intyg över genomgångna kompletterande studier',
                  en: 'A copy of the certificate(s) issued for completion of the additional studies',
                },
                key: '3fde97bc-93a8-469e-9f45-33fc50d09d48',
                fieldType: 'attachment',
                children: [],
                value: [
                  {
                    followups: [],
                    value: '',
                    label: {
                      fi: '14654ff1-909a-48c8-add8-917bb5eb5221',
                      sv: '14654ff1-909a-48c8-add8-917bb5eb5221',
                      en: '14654ff1-909a-48c8-add8-917bb5eb5221',
                    },
                  },
                ],
              },
            ],
          },
        ],
        fieldType: 'multipleChoice',
        children: [],
      },
    ],
    label: {
      fi: 'Sopeutumisaika, kelpoisuuskoe tai täydentävät opinnot',
      sv: 'Anpassningsperiod, lämplighetsprov eller kompletterande studier',
      en: 'Aptitude test, adaptation period or supplementing studies',
    },
    key: 'adfb7a3d-d05c-477b-8d00-820ef2ed7328',
    fieldType: 'fieldset',
    value: [],
  },
  {
    key: '0d23f1d1-1aa5-4dcb-9234-28c593441935',
    fieldType: 'fieldset',
    value: [],
    label: {
      fi: 'Päätös- ja asiointikieli',
      sv: 'Beslutet och kommunikationsspråk',
      en: 'Language to be used in the decision and when contacting the applicant',
    },
    children: [
      {
        key: '82c7260d-ebf0-4521-8f18-ad37e5490670',
        fieldType: 'singleChoice',
        value: [
          {
            label: {
              fi: 'suomeksi',
              sv: 'finska',
              en: 'Finnish',
            },
            value: 'finnish',
            followups: [],
          },
        ],
        label: {
          fi: 'Millä kielellä haluat päätöksen?',
          sv: 'På vilket språk vill du ha beslutet?',
          en: 'Language of the decision',
        },
        children: [],
      },
      {
        key: '9b5f4057-0b3e-45ae-827d-12d877822d4a',
        fieldType: 'singleChoice',
        value: [
          {
            label: {
              fi: 'suomeksi',
              sv: 'finska',
              en: 'Finnish',
            },
            value: '0',
            followups: [],
          },
        ],
        label: {
          fi: 'Millä kielellä haluat asioida Opetushallituksen kanssa?',
          sv: 'På vilket språk vill du kommunicera med Utbildningsstyrelsen?',
          en: 'Language to be used when contacting the applicant',
        },
        children: [],
      },
    ],
  },
];
