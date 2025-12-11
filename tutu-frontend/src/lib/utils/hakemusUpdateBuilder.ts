import { Hakemus, HakemusUpdateRequest } from '@/src/lib/types/hakemus';

/**
 * Builds a complete HakemusUpdateRequest from a Hakemus object with optional overrides
 *
 * This utility helps when using useEditableState with nested hakemus data where you
 * need to construct the full PUT request body while only editing a subset of fields.
 *
 * @param hakemus - The current hakemus object from server
 * @param overrides - Partial fields to override in the request
 * @returns Complete HakemusUpdateRequest ready for API call
 *
 * @example
 * ```typescript
 * const { editedData: editedAsiakirja, save } = useEditableState(
 *   hakemus?.asiakirja,
 *   (asiakirja) => {
 *     tallennaHakemus(buildHakemusUpdateRequest(hakemus!, { asiakirja }));
 *   }
 * );
 * ```
 */
export const buildHakemusUpdateRequest = (
  hakemus: Hakemus,
  overrides: Partial<HakemusUpdateRequest> = {},
): HakemusUpdateRequest => ({
  hakemusKoskee: hakemus.hakemusKoskee,
  asiatunnus: hakemus.asiatunnus || null,
  kirjausPvm: hakemus.kirjausPvm || null,
  esittelyPvm: hakemus.esittelyPvm || null,
  paatosPvm: hakemus.paatosPvm || null,
  esittelijaOid: hakemus.esittelijaOid || null,
  kasittelyVaihe: hakemus.kasittelyVaihe,
  yhteistutkinto: hakemus.yhteistutkinto,
  tutkinnot: hakemus.tutkinnot,
  asiakirja: hakemus.asiakirja,
  lopullinenPaatosVastaavaEhdollinenAsiatunnus:
    hakemus.lopullinenPaatosVastaavaEhdollinenAsiatunnus || null,
  lopullinenPaatosVastaavaEhdollinenSuoritusmaaKoodiUri:
    hakemus.lopullinenPaatosVastaavaEhdollinenSuoritusmaaKoodiUri || null,
  ...overrides,
});
