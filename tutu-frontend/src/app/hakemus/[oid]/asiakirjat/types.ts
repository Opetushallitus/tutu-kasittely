export const PYYDETTAVAT_ASIAKIRJAT = {
  tutkinnottaikoulutukset: [
    'tutkintotodistustenjaljennokset',
    'liitteidenjaljennokset',
    'tutkintotodistustenkaannokset',
    'liitteidenkaannokset',
    'alkuperaisettutkintotodistukset',
    'alkuperaisetliitteet',
    'vaitoskirja',
  ],
  kelpoisuusammattiin: ['tyotodistukset', 'ammattipatevyys'],
  henkilotiedot: ['kansalaisuus', 'nimenmuutos'],
} as const;

export const LOPULLISEN_PAATOKSEN_PYYDETTAVAT_ASIAKIRJAT = {
  sopeutumisaikataikelpoisuuskoetaitaydentavatopinnot: [
    'sopeutumisaika',
    'kelpoisuuskoe',
    'taydentavatopinnot',
  ],
  henkilotiedot: ['kansalaisuus', 'nimenmuutos'],
} as const;
