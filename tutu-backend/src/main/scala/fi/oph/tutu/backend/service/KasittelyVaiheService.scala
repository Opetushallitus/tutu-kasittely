package fi.oph.tutu.backend.service

import fi.oph.tutu.backend.domain.*
import fi.oph.tutu.backend.repository.AsiakirjaRepository
import org.springframework.stereotype.{Component, Service}

import java.util.UUID

/**
 * Palvelu hakemuksen käsittelyvaiheen ratkaisemiseen.
 *
 * Tämä palvelu tarjoaa keskitetyn logiikan käsittelyvaiheen määrittämiseen
 * perustuen hakemuksen asiakirja- ja perustelutietoihin.
 *
 * Käyttää optimoitua tietokantakyselyä, joka hakee vain käsittelyvaiheen
 * ratkaisemiseen tarvittavat minimaaliset tiedot yhdellä kyselyllä.
 *
 * Käsittelyvaihe määräytyy seuraavien ehtojen perusteella (prioriteettijärjestyksessä):
 * - Jos valmistumisen vahvistuspyyntö on lähetetty mutta ei saatu -> OdottaaVahvistusta
 * - Jos lausuntopyyntö on lähetetty mutta ei saapunut -> OdottaaLausuntoa
 * - Jos IMI-pyyntö on lähetetty mutta ei vastattu -> OdottaaIMIVastausta
 * - Jos kaikki tarvittavat selvitykset saatu JA kaikki toimenpiteet valmiit
 *   (vahvistus saatu tai ei pyydetty, lausunnot saapuneet tai ei pyydetty, IMI-vastaus saatu tai ei pyydetty)
 *   -> ValmisKasiteltavaksi
 * - Muuten -> AlkukasittelyKesken
 */
@Component
@Service
class KasittelyVaiheService(
  asiakirjaRepository: AsiakirjaRepository
) {

  /**
   * Ratkaisee hakemuksen käsittelyvaiheen perustuen hakemuksen tietoihin.
   *
   * Käyttää optimoitua tietokantakyselyä, joka hakee vain tarvittavat kentät
   * yhdellä kyselyllä sen sijaan että haettaisiin kaikki asiakirja- ja
   * perustelutiedot useilla erillisillä kyselyillä.
   *
   * @param asiakirjaId
   *   Hakemuksen asiakirja ID
   * @param hakemusId
   *   Hakemuksen ID
   * @return
   *   Ratkaistu käsittelyvaihe
   */
  def resolveKasittelyVaihe(
    asiakirjaId: Option[UUID],
    hakemusId: UUID
  ): KasittelyVaihe = {
    asiakirjaRepository.haeKasittelyVaiheTiedot(asiakirjaId, hakemusId) match {
      case Some(tiedot) => resolve(tiedot)
      case None         => KasittelyVaihe.AlkukasittelyKesken
    }
  }

  /**
   * Ratkaisee käsittelyvaiheen käyttäen optimoitua data-objektia.
   *
   * Käyttää pattern matchingia priorisoidun logiikan toteuttamiseen:
   * 1. Jos jokin toimenpide kesken -> palauta kyseinen tila (prioriteettijärjestyksessä)
   * 2. Jos selvitykset saatu ja kaikki toimenpiteet valmiit -> ValmisKasiteltavaksi
   * 3. Muuten -> AlkukasittelyKesken
   *
   * @param tiedot Käsittelyvaiheen ratkaisemiseen tarvittavat minimaaliset tiedot
   * @return Ratkaistu käsittelyvaihe
   */
  private def resolve(tiedot: KasittelyVaiheTiedot): KasittelyVaihe =
    (
      tiedot.vahvistusPyyntoLahetetty.isDefined && tiedot.vahvistusSaatu.isEmpty,
      tiedot.lausuntoKesken,
      tiedot.imiPyyntoLahetetty.isDefined && tiedot.imiPyyntoVastattu.isEmpty,
      tiedot.selvityksetSaatu
    ) match
      // Prioriteettijärjestys: Tarkista ensin kesken olevat toimenpiteet
      case (true, _, _, _) => KasittelyVaihe.OdottaaVahvistusta
      case (_, true, _, _) => KasittelyVaihe.OdottaaLausuntoa
      case (_, _, true, _) => KasittelyVaihe.OdottaaIMIVastausta

      // Jos selvitykset saatu ja ei toimenpiteitä kesken -> valmis käsiteltäväksi
      case (false, false, false, true) => KasittelyVaihe.ValmisKasiteltavaksi

      // Oletusarvo: alkukäsittely kesken
      // (mahdollistaa tilan regression kun toimenpiteitä poistetaan)
      case _ => KasittelyVaihe.AlkukasittelyKesken
}
