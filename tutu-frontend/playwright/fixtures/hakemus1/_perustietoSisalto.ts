import { SisaltoItem } from '@/src/lib/types/hakemus';

export const _perustietoSisalto: Array<SisaltoItem> = [
  {
    key: '7630ce29-8dbe-4a3a-8567-ee98e1b45cff',
    fieldType: 'fieldset',
    value: [],
    label: {
      fi: 'OHJEITA JA TIETOJA',
      sv: 'Instruktioner och information',
      en: 'Instructions and information',
    },
    children: [
      {
        key: '564d6150-478b-4338-84c2-1846bf91d615',
        fieldType: 'multipleChoice',
        value: [
          {
            label: {
              fi: 'Tarvitsenko päätöksen? Millaista päätöstä haen?',
              sv: 'Behöver jag ett beslut? Vilket slags beslut ska jag söka?',
              en: 'Do I need a decision? Which type of decision should I apply for?',
            },
            value: '0',
            followups: [],
          },
        ],
        label: {
          fi: 'Opetushallituksen tunnustamispäätöksen hakeminen',
          sv: 'Att ansöka om Utbildningsstyrelsens beslut om erkännande',
          en: 'Applying for a decision on recognition from the Finnish National Agency for Education',
        },
        children: [],
        infoText: {
          label: {
            fi: 'Tällä lomakkeella voit hakea Opetushallituksen tunnustamispäätöstä tutkinnosta, jonka olet suorittanut ulkomailla. \n\nOpetushallituksen tunnustamispäätöksellä voit osoittaa virkakelpoisuuden tai ammattipätevyyden.\n\nLue seuraavat ohjeet huolellisesti ennen kuin lähetät hakemuksen.\n\nSuosittelemme seuraavien selainohjelmistojen tuoreimpia versioita: Mozilla Firefox, Google Chrome, Apple Safari tai Microsoft Edge.',
            sv: 'Med den här blanketten kan du ansöka om Utbildningsstyrelsens beslut om erkännande för en examen som du har avlagt utomlands.\nMed Utbildningsstyrelsens beslut om erkännande kan du påvisa tjänstebehörighet eller yrkeskvalifikationer.\n\nLäs följande anvisningar noga innan du skickar din ansökan.\n\nVi rekommenderar att du använder de nyaste versionerna av någon av följande webbläsare: Mozilla Firefox, Google Chrome, Apple Safari eller Microsoft Edge.',
            en: 'You can use this form to apply for a decision on the recognition of your foreign qualification from the Finnish National Agency for Education. \n\nThe decisions are used to prove general eligibility for a public post or position, or eligibility for a regulated profession.\n\nPlease read the following instructions carefully before sending the application.\n\nWe recommend using an up-to-date version of one of the following web browsers: Mozilla Firefox, Google Chrome, Apple Safari or Microsoft Edge.',
          },
          value: undefined,
        },
      },
    ],
    infoText: undefined,
  },
  {
    key: '68afefd2-daff-4d74-857c-1736a54eab1b',
    fieldType: 'fieldset',
    value: [],
    label: {
      fi: 'VALITSE, MITÄ HAET',
      sv: 'VÄLJ VILKET BESLUT DIN ANSÖKAN GÄLLER',
      en: 'Choose what you are applying for',
    },
    children: [
      {
        key: '97840c6c-3642-48d0-9f47-adf9ee1793cc',
        fieldType: 'dropdown',
        value: [
          {
            label: {
              fi: '2. Kelpoisuus ammattiin',
              sv: '2. Behörighet för ett yrke',
              en: '2. Eligibility for a profession',
            },
            value: '1',
            followups: [
              {
                key: '6259e995-c34d-458e-834b-f1061cec09a7',
                fieldType: 'singleChoice',
                value: [
                  {
                    label: {
                      fi: 'Kyllä',
                      sv: 'Ja',
                      en: 'Yes',
                    },
                    value: '0',
                    followups: [],
                  },
                ],
                label: {
                  fi: 'Haetko myös ulkomaisen korkeakoulututkintosi tason rinnastamista?',
                  sv: 'Ansöker du också om att den högskoleexamen som du avlagt utomlands ska jämställas med en högskoleexamen på en viss nivå som avläggs i Finland?',
                  en: 'Are you also applying for the recognition of a higher education degree completed abroad as comparable to a Finnish higher education degree of a certain level? ',
                },
                children: [],
                infoText: {
                  label: {
                    fi: 'Suosittelemme valitsemaan "kyllä", jos sinulla on korkeakoulututkinto. Korkeakoulututkinnon tason rinnastaminen sisältyy päätöksen hintaan.\n\n[Siirry lisätietoihin korkeakoulututkinnon tason rinnastamisesta](https://www.oph.fi/fi/palvelut/ulkomailla-suoritetun-korkeakoulututkinnon-tason-rinnastaminen)',
                    sv: 'Om du har en högskoleexamen rekommenderar vi att du ansöker samtidigt om jämställande av nivån på en högskoleexamen. Beslutet om jämställande av nivån på en högskoleexamen ingår i priset.\n\n[Gå till tilläggsuppgifter om jämställande av nivån på en högskoleexamen](https://www.oph.fi/sv/tjanster/jamstallande-av-nivan-pa-en-hogskoleexamen)',
                    en: 'If you have completed a higher education degree, we recommend that you choose "yes". The decision on the recognition of the level of a higher education degree is included in the fee. \n\n[Go to more information on recognition of the level of a higher education degree](https://www.oph.fi/en/services/recognition-level-foreign-higher-education-degree)',
                  },
                  value: undefined,
                },
              },
              {
                key: 'e8cd9e32-6690-4e30-a099-e6a71c433c24',
                fieldType: 'multipleChoice',
                value: [
                  {
                    label: {
                      fi: 'Erityisluokanopettaja',
                      sv: 'Specialklasslärare',
                      en: 'Special class teacher',
                    },
                    value: '4',
                    followups: [],
                  },
                ],
                label: {
                  fi: '',
                  sv: '',
                  en: '',
                },
                children: [],
                infoText: {
                  label: {
                    fi: '###**Valitse ammatti kohdista 2a–c**\n##\nJos valikosta puuttuu etsimäsi ammatti, ota yhteyttä sähköpostitse (recognition@oph.fi).\n##\n**2a) Opetusalan ammatit**',
                    sv: '###**Välj yrke, examen eller studieprestation i punkterna 2a–c.**\n##\nOm det yrke, den examen eller studieprestation du söker inte finns i menyn, kontakta Utbildningsstyrelsen per e-post (recognition@oph.fi).\n##\n**2a) Uppgifter inom undervisningsområdet**',
                    en: '###**Select a profession in the sections 2a-c.**\n\nIf a profession is missing from the menu, contact the Finnish National Agency for Education by email (recognition@oph.fi).\n##\n**2a) Teaching positions**',
                  },
                  value: undefined,
                },
              },
              {
                key: '7d07bf15-79ab-4d2a-b1b9-63f03c1d0862',
                fieldType: 'textField',
                value: [
                  {
                    label: {
                      fi: 'jesari',
                      en: 'jesari',
                      sv: 'jesari',
                    },
                    value: '',
                    followups: [],
                  },
                ],
                label: {
                  fi: 'Mihin ammattiin olet pätevöitynyt?',
                  sv: 'Vilket yrke har du kvalifikationer för?',
                  en: 'What profession are you qualified in?',
                },
                children: [],
                infoText: undefined,
              },
              {
                key: '1d4bb273-0889-401e-aae1-5134a12cf238',
                fieldType: 'singleChoice',
                value: [
                  {
                    label: {
                      fi: 'Kyllä',
                      sv: 'Ja',
                      en: 'Yes',
                    },
                    value: '0',
                    followups: [
                      {
                        key: 'f738b265-1670-4600-b72d-d11df7892ebb',
                        fieldType: 'singleChoice',
                        value: [
                          {
                            label: {
                              fi: 'Kyllä',
                              sv: 'Ja',
                              en: 'Yes',
                            },
                            value: '0',
                            followups: [
                              {
                                key: '8b40d098-da19-4017-9e39-23568ec18140',
                                fieldType: 'attachment',
                                value: [
                                  {
                                    label: {
                                      fi: 'a5b81dff-f792-4cdb-8293-884c46668742',
                                      en: 'a5b81dff-f792-4cdb-8293-884c46668742',
                                      sv: 'a5b81dff-f792-4cdb-8293-884c46668742',
                                    },
                                    value: '',
                                    followups: [],
                                  },
                                ],
                                label: {
                                  fi: 'Todistus ammattipätevyydestä',
                                  sv: 'Intyg över yrkeskvalifikationer',
                                  en: 'Document attesting professional qualifications',
                                },
                                children: [],
                                infoText: undefined,
                              },
                            ],
                          },
                        ],
                        label: {
                          fi: 'Onko sinulla tutkintotodistuksen lisäksi erillinen todistus ammattipätevyydestä (esim. Teacher’s certificate - tai Legitimation-todistus)?',
                          sv: 'Har du utöver examensbevis ett separat intyg över yrkeskvalifikationer (t.ex. Qualified Teacher Status- eller Legitimation-intyg)?',
                          en: 'Do you have, in addition to your degree certificate, a separate document attesting professional qualifications (e.g. Teacher’s certificate, Legitimation certificate)?',
                        },
                        children: [],
                        infoText: {
                          label: undefined,
                          value: undefined,
                        },
                      },
                      {
                        key: '7e526c98-7bfd-437e-9628-d78e3712619d',
                        fieldType: 'singleChoice',
                        value: [
                          {
                            label: {
                              fi: 'Kyllä',
                              sv: 'Ja',
                              en: 'Yes',
                            },
                            value: 'Kyllä',
                            followups: [
                              {
                                key: 'c6e4b7d5-7d5e-4c79-b0be-ac8bd2db8b76',
                                fieldType: 'attachment',
                                value: [
                                  {
                                    label: {
                                      fi: '19947afb-4639-446d-a5d1-7798971d3f20',
                                      en: '19947afb-4639-446d-a5d1-7798971d3f20',
                                      sv: '19947afb-4639-446d-a5d1-7798971d3f20',
                                    },
                                    value: '',
                                    followups: [],
                                  },
                                ],
                                label: {
                                  fi: 'Todistukset ammattikokemuksesta',
                                  sv: 'Intyg över yrkeserfarenhet',
                                  en: 'Certificates of professional experience',
                                },
                                children: [],
                                infoText: {
                                  label: undefined,
                                  value: {
                                    fi: 'Pyydämme todistukset erikseen, jos niitä tarvitaan. Halutessasi voit lisätä ne jo hakuvaiheessa.',
                                    sv: 'Vid behov ber vi dig att lämna in intyg i ett senare skede. Om du vill kan du bifoga intygen redan i ansökningsskedet.',
                                    en: 'We ask for certificates separately if needed. If you wish, you can add them already at the application stage.',
                                  },
                                },
                              },
                              {
                                key: 'cb593dfd-e361-493b-971c-09597bb54f4b',
                                fieldType: 'textArea',
                                value: [
                                  {
                                    label: {
                                      fi: 'esa jesari',
                                      en: 'esa jesari',
                                      sv: 'esa jesari',
                                    },
                                    value: '',
                                    followups: [],
                                  },
                                ],
                                label: {
                                  fi: 'Työnantajan yhteystiedot',
                                  sv: 'Arbetsgivarens kontaktuppgifter',
                                  en: 'Contact details of the employer',
                                },
                                children: [],
                                infoText: {
                                  label: {
                                    fi: 'Anna työnantajan yhteystiedot, jos niitä ei ole työtodistuksessa.',
                                    sv: 'Ange arbetsgivarens kontaktuppgifter, om de inte finns på arbetsintyget.',
                                    en: 'Provide employer’s contact details if they do not appear on the work certificate.',
                                  },
                                  value: undefined,
                                },
                              },
                            ],
                          },
                        ],
                        label: {
                          fi: 'Onko sinulla ammattikokemusta tehtävästä, johon haet kelpoisuutta?',
                          sv: 'Har du yrkeserfarenhet av uppgiften som du ansöker om behörighet för?',
                          en: 'Have you gained professional experience in the profession for which you seek recognition?',
                        },
                        children: [],
                        infoText: {
                          label: undefined,
                          value: undefined,
                        },
                      },
                      {
                        key: '8989cb83-2ffe-4d81-91c9-048336013db2',
                        fieldType: 'singleChoice',
                        value: [
                          {
                            label: {
                              fi: 'Ei',
                              sv: 'Nej',
                              en: 'No',
                            },
                            value: 'Ei',
                            followups: [],
                          },
                        ],
                        label: {
                          fi: 'Onko sinulla täydennyskoulutustodistuksia tai muita todistuksia elinikäisen oppimisen avulla hankituista tiedoista, taidoista ja pätevyyksistä?',
                          sv: 'Har du intyg över fortbildning eller andra intyg över kunskap, färdigheter och behörigheter som du tillägnat dig med hjälp av livslångt lärande?',
                          en: 'Do you have certificates that attest knowledge, skills and competence acquired through life-long learning?',
                        },
                        children: [],
                        infoText: {
                          label: undefined,
                          value: undefined,
                        },
                      },
                    ],
                  },
                ],
                label: {
                  fi: 'Haetko toisessa EU/ETA-maassa tai Sveitsissä hankkimasi ammattipätevyyden tunnustamista?',
                  sv: 'Ansöker du om erkännande av yrkeskvalifikation som du skaffat i ett annat EU-/EES-land eller Schweiz?',
                  en: 'Are you applying for the recognition of professional qualifications acquired in another EU or EEA member state or in Switzerland?',
                },
                children: [],
                infoText: {
                  label: undefined,
                  value: undefined,
                },
              },
            ],
          },
        ],
        label: {
          fi: 'Valitse yksi pudotusvalikon vaihtoehdoista',
          sv: 'Välj ett av följande alternativ i rullgardinsmenyn',
          en: 'Choose one option from the drop-down menu',
        },
        children: [],
        infoText: undefined,
      },
    ],
    infoText: undefined,
  },
  {
    key: '89e89dff-25b2-4177-b078-fcaf0c9d2589',
    fieldType: 'fieldset',
    value: [],
    label: {
      fi: 'Tutkinto tai koulutus',
      sv: 'Examen eller utbildning',
      en: 'Qualification or education',
    },
    children: [
      {
        key: 'f1882e83-2836-440d-a197-4950571e798a',
        fieldType: 'singleChoice',
        value: [
          {
            label: {
              fi: 'Tutkinto 1',
              sv: 'Examen 1',
              en: 'Qualification 1',
            },
            value: '0',
            followups: [
              {
                key: 'tutkintotodistus',
                fieldType: 'attachment',
                value: [
                  {
                    label: {
                      fi: 'c95d7c76-5a4c-4ce5-a173-5c848664e6ed',
                      en: 'c95d7c76-5a4c-4ce5-a173-5c848664e6ed',
                      sv: 'c95d7c76-5a4c-4ce5-a173-5c848664e6ed',
                    },
                    value: '',
                    followups: [],
                  },
                ],
                label: {
                  fi: 'TUTKINTOTODISTUS',
                  sv: 'EXAMENSBEVIS',
                  en: 'DEGREE / QUALIFICATION CERTIFICATE',
                },
                children: [],
              },
              {
                key: 'opintosuoriteote',
                fieldType: 'attachment',
                value: [
                  {
                    label: {
                      fi: '11111111-2222-3333-4444-555555555555',
                      en: '7046e83e-b780-42c4-bbd5-a55b798050dd',
                      sv: '7046e83e-b780-42c4-bbd5-a55b798050dd',
                    },
                    value: '',
                    followups: [],
                  },
                ],
                label: {
                  fi: 'TÄLLE EI LÖYDY ID:LLÄ VASTAAVAA TIEDOSTONIMEÄ',
                  sv: 'INTE FILE MED DETTA ID',
                  en: 'NO FILE WITH THIS ID',
                },
                children: [],
              },
              {
                key: 'muuliite',
                fieldType: 'attachment',
                value: [
                  {
                    label: {
                      fi: '582be518-e3ea-4692-8a2c-8370b40213e5',
                      en: '582be518-e3ea-4692-8a2c-8370b40213e5',
                      sv: '582be518-e3ea-4692-8a2c-8370b40213e5',
                    },
                    value: '',
                    followups: [],
                  },
                ],
                label: {
                  fi: 'TÄLLE EI LÖYDY ID:TÄ',
                  sv: 'INTE ID',
                  en: 'NO IDEA',
                },
                children: [],
              },
            ],
          },
        ],
        label: {
          fi: 'Anna tiedot ylimmästä tutkinnosta, jonka olet suorittanut ulkomailla ja jonka perusteella haet päätöstä',
          sv: 'Ange uppgifter om den högsta examen som du har avlagt utomlands. ',
          en: 'Provide information on the highest foreign qualification that you have completed. ',
        },
        children: [],
      },
    ],
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
    infoText: undefined,
  },
  {
    key: '3781f43c-fff7-47c7-aa7b-66f4a47395a5',
    fieldType: 'fieldset',
    value: [],
    label: {
      fi: 'Päätöksen lähettäminen sähköpostilla',
      sv: 'Tillstånd till att beslutet skickas per e-post',
      en: 'Consent to receive the decision electronically',
    },
    children: [
      {
        key: '1098b604-115b-4e59-ba11-073c0924e473',
        fieldType: 'singleChoice',
        value: [
          {
            label: {
              fi: 'Ei',
              sv: 'Nej',
              en: 'No',
            },
            value: '1',
            followups: [],
          },
        ],
        label: {
          fi: 'Saako päätöksen lähettää sinulle sähköpostilla?',
          sv: 'Får beslutet skickas till dig per e-post?',
          en: 'Can we send you the decision by email?',
        },
        children: [],
        infoText: undefined,
      },
    ],
    infoText: undefined,
  },
  {
    key: '9e94bfe6-5855-43fc-bd80-d5b74741decb',
    fieldType: 'fieldset',
    value: [],
    label: {
      fi: 'Tietojen oikeellisuus ja todistusten aitous',
      sv: 'Uppgifternas riktighet och intygens äkthet',
      en: 'Confirmation',
    },
    children: [
      {
        key: '66a6cdb5-8930-4c61-b704-806901264646',
        fieldType: 'singleChoice',
        value: [
          {
            label: {
              fi: 'Kyllä',
              sv: 'Ja',
              en: 'Yes',
            },
            value: 'Yes',
            followups: [],
          },
        ],
        label: {
          fi: 'Vakuutatko, että hakemuksen tiedot ovat oikeita?',
          sv: 'Intygar du att uppgifterna i ansökan är riktiga?',
          en: 'Do you certify that the information you have provided in this application and the attachments is true and accurate? ',
        },
        children: [],
        infoText: undefined,
      },
      {
        key: 'c20bb2dc-fc8c-41a9-8897-b08fbfc3c705',
        fieldType: 'singleChoice',
        value: [
          {
            label: {
              fi: 'Ei',
              sv: 'Nej',
              en: 'No',
            },
            value: '1',
            followups: [],
          },
        ],
        label: {
          fi: 'Saako Opetushallitus kysyä todistusten antajilta, ovatko todistukset aitoja?',
          sv: 'Får Utbildningsstyrelsen kontakta utfärdarna av intygen för att kontrollera att intygen är äkta? ',
          en: 'May the Finnish National Agency for Education verify from the institutions that have issued your documents that the documents in question are authentic?',
        },
        children: [],
        infoText: {
          label: {
            fi: '',
            sv: '',
            en: '',
          },
          value: undefined,
        },
      },
    ],
    infoText: undefined,
  },
  {
    key: 'a03ac23e-7056-4792-bd74-caa6a3607fa0',
    fieldType: 'singleChoice',
    value: [
      {
        label: {
          fi: 'Kyllä',
          sv: 'Ja',
          en: 'Yes',
        },
        value: '0',
        followups: [],
      },
    ],
    label: {
      fi: 'Ymmärrän, että hakemukseni otetaan käsittelyyn vasta, kun olen maksanut käsittelymaksun. Ymmärrän, että minun pitää myöhemmin maksaa erillinen päätösmaksu ennen kuin saan päätökseni.',
      sv: 'Jag förstår att min ansökan tas till behandling först efter att jag har betalat behandlingsavgiften. Jag förstår att jag måste senare betala en separat beslutsavgift för att få beslutet.',
      en: 'I understand that I have to pay the processing fee before my application is taken into processing. I understand that I will later have to pay a separate decision fee before I receive my decision.',
    },
    children: [],
    infoText: undefined,
  },
];
