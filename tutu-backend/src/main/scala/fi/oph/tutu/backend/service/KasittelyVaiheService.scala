package fi.oph.tutu.backend.service

import fi.oph.tutu.backend.domain.*
import fi.oph.tutu.backend.domain.AtaruHakemuksenTila.TaydennysPyynto
import fi.oph.tutu.backend.domain.KasittelyVaihe.AlkukasittelyKesken
import fi.oph.tutu.backend.repository.AsiakirjaRepository
import fi.oph.tutu.backend.utils.Utility.toLocalDateTime
import org.springframework.stereotype.{Component, Service}

import java.time.LocalDateTime

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
 * - Jos molemmat päätöksen päivämäärät (hyväksymispäivä JA lähetyspäivä) asetettu -> LoppukasittelyValmis
 * - Jos vain päätöksen hyväksymispäivä asetettu (lähetyspäivä puuttuu) -> HyvaksyttyEiLahetetty
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
   * @param dbHakemus
   * hakemuksen tiedot
   * @param ataruHakemuksenTila
   * Vastaava ataru-hakemus
   * @return
   * Ratkaistu käsittelyvaihe
   */
  def resolveKasittelyVaihe(
    dbHakemus: DbHakemus,
    ataruHakemus: AtaruHakemus
  ): KasittelyVaihe = {
    asiakirjaRepository.haeKasittelyVaiheTiedot(dbHakemus.asiakirjaId, dbHakemus.id) match {
      case Some(tiedot) => resolve(tiedot, ataruHakemus, dbHakemus.viimeisinTaydennyspyyntoPvm)
      case None         => AlkukasittelyKesken
    }
  }

  /**
   * Ratkaisee käsittelyvaiheen käyttäen optimoitua data-objektia.
   *
   * Käyttää pattern matchingia priorisoidun logiikan toteuttamiseen:
   * 1. Jos päätös tehty (päivämäärät asetettu) -> LoppukasittelyValmis tai HyvaksyttyEiLahetetty
   * 2. Jos jokin toimenpide kesken -> palauta kyseinen tila (OdottaaVahvistusta/Lausuntoa/IMIVastausta)
   * 3. Jos selvitykset saatu ja kaikki toimenpiteet valmiit -> ValmisKasiteltavaksi
   * 4. Jos kaikkia selvityksiä ei vielä saatu, mutta hakemusta on editoitu sen saapumisen jälkeen
   *    (esim. vastattu täydennyspyyntöön) -> HakemustaTaydennetty
   * 5. Muuten -> AlkukasittelyKesken
   *
   * @param tiedot Käsittelyvaiheen ratkaisemiseen tarvittavat minimaaliset tiedot
   * @return Ratkaistu käsittelyvaihe
   */
  private def resolve(
    tiedot: KasittelyVaiheTiedot,
    ataruHakemus: AtaruHakemus,
    viimeisinTaydennyspyyntoPvm: Option[LocalDateTime]
  ): KasittelyVaihe = {
    val submitted = toLocalDateTime(ataruHakemus.submitted)
    val modified  = toLocalDateTime(ataruHakemus.latestVersionCreated)
    (
      ataruHakemus
        .hakemuksenTila() == TaydennysPyynto && viimeisinTaydennyspyyntoPvm.isDefined && viimeisinTaydennyspyyntoPvm.get
        .isAfter(modified),
      tiedot.vahvistusPyyntoLahetetty.isDefined && tiedot.vahvistusSaatu.isEmpty,
      tiedot.lausuntoKesken,
      tiedot.imiPyyntoLahetetty.isDefined && tiedot.imiPyyntoVastattu.isEmpty,
      tiedot.selvityksetSaatu,
      modified.isAfter(submitted),
      tiedot.paatosLahetyspaiva.isDefined,
      tiedot.paatosHyvaksymispaiva.isDefined
    ) match
      // Päätöksen tilat - tarkistetaan onko päätös tehty
      case (_, _, _, _, _, _, true, true) => KasittelyVaihe.LoppukasittelyValmis
      case (_, _, _, _, _, _, _, true)    => KasittelyVaihe.HyvaksyttyEiLahetetty

      // Prioriteettijärjestys: Tarkista ensin kesken olevat toimenpiteet
      case (true, _, _, _, _, _, _, _) => KasittelyVaihe.OdottaaTaydennysta
      case (_, true, _, _, _, _, _, _) => KasittelyVaihe.OdottaaVahvistusta
      case (_, _, true, _, _, _, _, _) => KasittelyVaihe.OdottaaLausuntoa
      case (_, _, _, true, _, _, _, _) => KasittelyVaihe.OdottaaIMIVastausta

      // Jos selvitykset saatu ja ei toimenpiteitä kesken -> valmis käsiteltäväksi
      case (false, false, false, false, true, _, _, _) => KasittelyVaihe.ValmisKasiteltavaksi
      // Jos kaikkia selvityksiä ei vielä saatu, mutta hakemusta on editoitu sen saapumisen jälkeen
      // (esim. vastattu täydennyspyyntöön) -> HakemustaTaydennetty
      case (false, false, false, false, false, true, _, _) => KasittelyVaihe.HakemustaTaydennetty
      // Oletusarvo: alkukäsittely kesken
      // (mahdollistaa tilan regression kun toimenpiteitä poistetaan)
      case _ => AlkukasittelyKesken
  }
}
