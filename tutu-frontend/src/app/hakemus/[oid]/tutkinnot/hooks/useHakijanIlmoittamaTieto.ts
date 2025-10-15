import { useMemo } from 'react';
import { SisaltoItem } from '@/src/lib/types/hakemus';
import { Language } from '@/src/lib/localization/localizationTypes';
import {
  HakemuspalveluSisaltoId,
  muuTutkintoTietoKey,
  muutTutkinnot,
  tutkintoMaaKeys,
  tutkintoNimiKeys,
  tutkintoOppilaitosKeys,
  tutkintoTaiKoulutus,
  ylinTutkinto,
} from '@/src/constants/hakemuspalveluSisalto';
import { findSisaltoQuestionAndAnswer } from '@/src/lib/hakemuspalveluUtils';

type HakijanIlmoittamaTieto = {
  nimi?: string;
  oppilaitos?: string;
  maakoodiUri?: string;
  muuTutkintoTieto?: string;
};

/**
 * Hook hakijan Ataru-lomakkeelle ilmoittamien alkuperäisten tutkintotietojen hakemiseen
 */
export const useHakijanIlmoittamaTieto = (
  sisalto: SisaltoItem[],
  tutkintoJarjestys: string,
  lomakkeenKieli: Language,
): HakijanIlmoittamaTieto => {
  return useMemo(() => {
    // Helper function to extract value from sisalto by path
    const haeArvo = (
      ...polku: HakemuspalveluSisaltoId[]
    ): string | undefined => {
      const [, arvo] = findSisaltoQuestionAndAnswer(
        sisalto,
        polku,
        lomakkeenKieli,
      );
      return arvo;
    };

    // MUU tutkinto käsitellään erikseen
    if (tutkintoJarjestys === 'MUU') {
      return {
        muuTutkintoTieto: haeArvo(
          tutkintoTaiKoulutus,
          muutTutkinnot,
          muuTutkintoTietoKey,
        ),
      };
    }

    // Tutkinnon kenttien avaimet jarjestyksen mukaan
    const kentat: Record<
      string,
      {
        nimi: HakemuspalveluSisaltoId;
        oppilaitos: HakemuspalveluSisaltoId;
        maa: HakemuspalveluSisaltoId;
      }
    > = {
      '1': {
        nimi: tutkintoNimiKeys.tutkinto1,
        oppilaitos: tutkintoOppilaitosKeys.tutkinto1,
        maa: tutkintoMaaKeys.tutkinto1,
      },
      '2': {
        nimi: tutkintoNimiKeys.tutkinto2,
        oppilaitos: tutkintoOppilaitosKeys.tutkinto2,
        maa: tutkintoMaaKeys.tutkinto2,
      },
      '3': {
        nimi: tutkintoNimiKeys.tutkinto3,
        oppilaitos: tutkintoOppilaitosKeys.tutkinto3,
        maa: tutkintoMaaKeys.tutkinto3,
      },
    };

    const tutkinnonKentat = kentat[tutkintoJarjestys];
    if (!tutkinnonKentat) {
      return {};
    }

    // Sisältöpolku: tutkintoTaiKoulutus > ylinTutkinto > kenttä
    return {
      nimi: haeArvo(tutkintoTaiKoulutus, ylinTutkinto, tutkinnonKentat.nimi),
      oppilaitos: haeArvo(
        tutkintoTaiKoulutus,
        ylinTutkinto,
        tutkinnonKentat.oppilaitos,
      ),
      maakoodiUri: haeArvo(
        tutkintoTaiKoulutus,
        ylinTutkinto,
        tutkinnonKentat.maa,
      ),
    };
  }, [sisalto, tutkintoJarjestys, lomakkeenKieli]);
};
