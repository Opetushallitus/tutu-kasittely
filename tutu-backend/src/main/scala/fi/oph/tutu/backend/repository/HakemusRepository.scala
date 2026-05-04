package fi.oph.tutu.backend.repository

import fi.oph.tutu.backend.domain.*
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.{Component, Repository}
import slick.dbio.DBIO
import slick.jdbc.GetResult
import slick.jdbc.PostgresProfile.api.*

import java.time.LocalDateTime
import java.util.UUID
import scala.util.{Failure, Success, Try}

@Component
@Repository
class HakemusRepository extends BaseResultHandlers {
  @Autowired
  val db: TutuDatabase = null

  val LOG: Logger = LoggerFactory.getLogger(classOf[HakemusRepository])

  implicit val getHakemusOidResult: GetResult[HakemusOid] =
    GetResult(r => HakemusOid(r.nextString()))

  implicit val getHakemusResult: GetResult[DbHakemus] =
    GetResult(r =>
      DbHakemus(
        id = UUID.fromString(r.nextString()),
        hakemusOid = HakemusOid(r.nextString()),
        hakemusKoskee = r.nextInt(),
        formId = r.nextLong(),
        esittelijaId = r.nextStringOption().map(UUID.fromString),
        esittelijaOid = r.nextStringOption().map(UserOid(_)),
        asiakirjaId = r.nextStringOption().map(UUID.fromString),
        asiatunnus = r.nextStringOption(),
        kasittelyVaihe = KasittelyVaihe.fromString(r.nextString()),
        muokattu = Option(r.nextTimestamp()).map(_.toLocalDateTime),
        yhteistutkinto = r.nextBoolean(),
        lopullinenPaatosVastaavaEhdollinenAsiatunnus = r.nextStringOption(),
        lopullinenPaatosVastaavaEhdollinenSuoritusmaaKoodiUri = r.nextStringOption(),
        esittelijanHuomioita = r.nextStringOption(),
        muokkaaja = r.nextStringOption(),
        onkoPeruutettu = r.nextBoolean(),
        peruutusPvm = Option(r.nextTimestamp()).map(_.toLocalDateTime),
        peruutusLisatieto = r.nextStringOption(),
        viimeisinTaydennyspyyntoPvm = Option(r.nextTimestamp()).map(_.toLocalDateTime),
        saapumisPvm = Option(r.nextTimestamp()).map(_.toLocalDateTime),
        ataruHakemusMuokattu = Option(r.nextTimestamp()).map(_.toLocalDateTime),
        hakijaEtunimet = r.nextStringOption(),
        hakijaSukunimi = r.nextStringOption(),
        esittelyPvm = Option(r.nextTimestamp()).map(_.toLocalDateTime)
      )
    )

  /**
   * Tallentaa uuden hakemuksen (palauttaa DBIO-actionin transaktioita varten)
   *
   * @param hakemusOid
   *   hakemuspalvelun hakemuksen oid
   * @return
   *   DBIO action joka palauttaa tallennetun hakemuksen id:n
   */
  def tallennaHakemusAction(
    hakemusOid: HakemusOid,
    hakemusKoskee: Int,
    formId: Long,
    esittelijaId: Option[UUID],
    asiakirjaId: UUID,
    lopullinenPaatosVastaavaEhdollinenAsiatunnus: Option[String],
    lopullinenPaatosVastaavaEhdollinenSuoritusmaaKoodiUri: Option[String],
    luoja: String,
    saapumisPvm: Option[java.sql.Timestamp] = None,
    ataruHakemusMuokattu: Option[java.sql.Timestamp] = None,
    hakijaEtunimet: Option[String] = None,
    hakijaSukunimi: Option[String] = None,
    viimeisinTaydennyspyyntoPvm: Option[java.sql.Timestamp] = None
  ): DBIO[UUID] =
    val hakemusOidString                                   = hakemusOid.toString
    val esittelijaIdOrNull                                 = esittelijaId.map(_.toString).orNull
    val lopullinenPaatosVastaavaEhdollinenAsiatunnusOrNull =
      lopullinenPaatosVastaavaEhdollinenAsiatunnus.orNull
    val lopullinenPaatosVastaavaEhdollinenSuoritusmaaKoodiUriOrNull =
      lopullinenPaatosVastaavaEhdollinenSuoritusmaaKoodiUri.orNull
    val saapumisPvmOrNull                 = saapumisPvm.orNull
    val ataruHakemusMuokattuOrNull        = ataruHakemusMuokattu.orNull
    val hakijaEtunimetOrNull              = hakijaEtunimet.orNull
    val hakijaSukunimiOrNull              = hakijaSukunimi.orNull
    val viimeisinTaydennyspyyntoPvmOrNull = viimeisinTaydennyspyyntoPvm.orNull

    sql"""
      INSERT INTO hakemus (hakemus_oid, hakemus_koskee, form_id, esittelija_id,
        asiakirja_id, lopullinen_paatos_ehdollisen_asiatunnus,
        lopullinen_paatos_tutkinnon_suoritus_maakoodiuri, luoja,
        saapumis_pvm, ataru_hakemus_muokattu, hakija_etunimet, hakija_sukunimi,
        viimeisin_taydennyspyynto_paiva)
      VALUES ($hakemusOidString, $hakemusKoskee, $formId, $esittelijaIdOrNull::uuid, ${asiakirjaId.toString}::uuid,
        $lopullinenPaatosVastaavaEhdollinenAsiatunnusOrNull,
        $lopullinenPaatosVastaavaEhdollinenSuoritusmaaKoodiUriOrNull, $luoja,
        $saapumisPvmOrNull, $ataruHakemusMuokattuOrNull, $hakijaEtunimetOrNull, $hakijaSukunimiOrNull,
        $viimeisinTaydennyspyyntoPvmOrNull)
      RETURNING id
    """.as[UUID].head

  /**
   * Tallentaa uuden hakemuksen
   *
   * @param hakemusOid
   *   hakemuspalvelun hakemuksen oid
   * @return
   *   tallennetun hakemuksen id
   */
  def tallennaHakemus(
    hakemusOid: HakemusOid,
    hakemusKoskee: Int,
    formId: Long,
    esittelijaId: Option[UUID],
    asiakirjaId: UUID,
    lopullinenPaatosVastaavaEhdollinenAsiatunnus: Option[String],
    lopullinenPaatosVastaavaEhdollinenSuoritusmaaKoodiUri: Option[String],
    luoja: String
  ): UUID =
    try
      db.run(
        tallennaHakemusAction(
          hakemusOid,
          hakemusKoskee,
          formId,
          esittelijaId,
          asiakirjaId,
          lopullinenPaatosVastaavaEhdollinenAsiatunnus,
          lopullinenPaatosVastaavaEhdollinenSuoritusmaaKoodiUri,
          luoja
        ),
        "tallenna_hakemus"
      )
    catch {
      case e: Exception =>
        LOG.error(s"Hakemuksen tallennus epäonnistui: $e")
        throw new RuntimeException(
          s"Hakemuksen tallennus epäonnistui: ${e.getMessage}",
          e
        )
    }

  /**
   * Palauttaa yksittäisen hakemuksen
   *
   * @param hakemusOid
   * hakemuksen oid
   * @return
   * hakemuksen
   */
  def haeHakemus(hakemusOid: HakemusOid): Option[DbHakemus] = {
    try {
      db.run(
        sql"""
            SELECT
              h.id,
              h.hakemus_oid,
              h.hakemus_koskee,
              h.form_id,
              h.esittelija_id,
              e.esittelija_oid,
              h.asiakirja_id,
              h.asiatunnus,
              h.kasittely_vaihe,
              h.muokattu,
              h.yhteistutkinto,
              h.lopullinen_paatos_ehdollisen_asiatunnus,
              h.lopullinen_paatos_tutkinnon_suoritus_maakoodiuri,
              h.esittelijan_huomioita,
              h.muokkaaja,
              h.onko_peruutettu,
              h.peruutus_paiva,
              h.peruutus_lisatieto,
              h.viimeisin_taydennyspyynto_paiva,
              h.saapumis_pvm,
              h.ataru_hakemus_muokattu,
              h.hakija_etunimet,
              h.hakija_sukunimi,
              h.esittely_pvm
            FROM
              hakemus h
            LEFT JOIN esittelija e on e.id = h.esittelija_id
            WHERE
              h.hakemus_oid = ${hakemusOid.s}
          """.as[DbHakemus].headOption,
        "hae_hakemus"
      )
    } catch {
      case e: Exception =>
        throw new RuntimeException(
          s"Hakemuksen haku epäonnistui: ${e.getMessage}",
          e
        )
    }
  }

  /**
   * Päivittää hakemuksen kokonaan (PUT endpoint).
   * Korvaa kaikki käyttäjän muokattavat kentät.
   * NULL arvo pyynnössä -> NULL tietokantaan.
   *
   * @param hakemusOid
   * hakemuksen oid
   * @param hakemus
   * täysi hakemus-objekti
   * @param muokkaaja
   * muokkaajan oid
   * @return
   * tallennetun hakemuksen oid
   */
  def paivitaHakemus(
    hakemusOid: HakemusOid,
    hakemus: DbHakemus,
    muokkaaja: String
  ): HakemusOid = {
    val hakemusOidString                                   = hakemusOid.toString
    val esittelijaIdOrNull                                 = hakemus.esittelijaId.map(_.toString).orNull
    val asiakirjaIdOrNull                                  = hakemus.asiakirjaId.map(_.toString).orNull
    val asiatunnusOrNull                                   = hakemus.asiatunnus.orNull
    val hakemusKoskee                                      = hakemus.hakemusKoskee
    val yhteistutkinto                                     = hakemus.yhteistutkinto
    val kasittelyVaihe                                     = hakemus.kasittelyVaihe.toString
    val lopullinenPaatosVastaavaEhdollinenAsiatunnusOrNull =
      hakemus.lopullinenPaatosVastaavaEhdollinenAsiatunnus.orNull
    val lopullinenPaatosVastaavaEhdollinenSuoritusmaaKoodiUriOrNull =
      hakemus.lopullinenPaatosVastaavaEhdollinenSuoritusmaaKoodiUri.orNull
    val esittelijanHuomioita        = hakemus.esittelijanHuomioita
    val peruutettu                  = hakemus.onkoPeruutettu
    val peruutusPvm                 = hakemus.peruutusPvm.map(java.sql.Timestamp.valueOf).orNull
    val peruutusLisatieto           = hakemus.peruutusLisatieto
    val viimeisinTaydennyspyyntoPvm = hakemus.viimeisinTaydennyspyyntoPvm.map(java.sql.Timestamp.valueOf).orNull
    val formId                      = hakemus.formId
    val saapumisPvmOpt              = hakemus.saapumisPvm.map(java.sql.Timestamp.valueOf).orNull
    val ataruHakemusMuokattuOpt     = hakemus.ataruHakemusMuokattu.map(java.sql.Timestamp.valueOf).orNull
    val hakijaEtunimetOpt           = hakemus.hakijaEtunimet.orNull
    val hakijaSukunimiOpt           = hakemus.hakijaSukunimi.orNull

    try
      db.run(
        sql"""
        UPDATE hakemus
        SET
          hakemus_koskee = $hakemusKoskee,
          esittelija_id = $esittelijaIdOrNull::uuid,
          asiakirja_id = $asiakirjaIdOrNull::uuid,
          asiatunnus = $asiatunnusOrNull,
          muokkaaja = $muokkaaja,
          yhteistutkinto = $yhteistutkinto,
          kasittely_vaihe = $kasittelyVaihe,
          lopullinen_paatos_ehdollisen_asiatunnus = $lopullinenPaatosVastaavaEhdollinenAsiatunnusOrNull,
          lopullinen_paatos_tutkinnon_suoritus_maakoodiuri = $lopullinenPaatosVastaavaEhdollinenSuoritusmaaKoodiUriOrNull,
          esittelijan_huomioita = $esittelijanHuomioita,
          onko_peruutettu = $peruutettu,
          peruutus_paiva = $peruutusPvm,
          peruutus_lisatieto = $peruutusLisatieto,
          viimeisin_taydennyspyynto_paiva = $viimeisinTaydennyspyyntoPvm,
          form_id = $formId,
          saapumis_pvm =$saapumisPvmOpt,
          ataru_hakemus_muokattu = $ataruHakemusMuokattuOpt,
          hakija_etunimet = $hakijaEtunimetOpt,
          hakija_sukunimi = $hakijaSukunimiOpt
        WHERE hakemus_oid = $hakemusOidString
        RETURNING
          hakemus_oid
      """.as[HakemusOid].head,
        "paivita_taysi_hakemus"
      )
    catch {
      case e: Exception =>
        LOG.error(s"Hakemuksen täysi päivitys epäonnistui: $e")
        throw new RuntimeException(
          s"Hakemuksen täysi päivitys epäonnistui: ${e.getMessage}",
          e
        )
    }
  }

  private def paivitaAsiatunnus(hakemusOid: HakemusOid, asiatunnus: String, muokkaaja: String): DBIO[Int] =
    sqlu"""
      UPDATE hakemus
      SET asiatunnus = $asiatunnus, muokkaaja = $muokkaaja
      WHERE hakemus_oid = ${hakemusOid.toString}
    """

  def suoritaPaivitaAsiatunnus(hakemusOid: HakemusOid, asiatunnus: String, muokkaaja: String): Int = {
    Try {
      db.run(paivitaAsiatunnus(hakemusOid, asiatunnus, muokkaaja), "PaivitaAsiatunnus")
    } match {
      case Success(modified) => modified
      case Failure(e)        =>
        LOG.error(s"Virhe asiatunnuksen päivittämisessä: ${e.getMessage}", e)
        throw new RuntimeException(s"Virhe asiatunnuksen päivittämisessä: ${e.getMessage}", e)
    }
  }

  private def paivitaEsittelyPvm(hakemusOid: HakemusOid, esittelyPvm: LocalDateTime, muokkaaja: String): DBIO[Int] =
    val esittelyPvmValue = java.sql.Timestamp.valueOf(esittelyPvm)
    sqlu"""
      UPDATE hakemus
      SET esittely_pvm = $esittelyPvmValue, muokkaaja = $muokkaaja
      WHERE hakemus_oid = ${hakemusOid.toString}
    """

  def suoritaPaivitaEsittelyPvm(hakemusOid: HakemusOid, esittelyPvm: LocalDateTime, muokkaaja: String): Int = {
    Try {
      db.run(paivitaEsittelyPvm(hakemusOid, esittelyPvm, muokkaaja), "PaivitaEsittelyPvm")
    } match {
      case Success(modified) => modified
      case Failure(e)        =>
        LOG.error(s"Virhe esittelypäivän päivittämisessä: ${e.getMessage}", e)
        throw new RuntimeException(s"Virhe esittelypäivän päivittämisessä: ${e.getMessage}", e)
    }
  }

  def onkoHakemusOlemassa(hakemusOid: HakemusOid): Boolean =
    try {
      db.run(
        sql"""SELECT EXISTS (SELECT 1 FROM hakemus WHERE hakemus_oid = ${hakemusOid.s}) """.as[Boolean].head,
        "tarkista_hakemuksen_olemassaolo"
      )
    } catch {
      case e: Exception =>
        throw new RuntimeException(
          s"Hakemuksen olemassaolon tarkistus epäonnistui: ${e.getMessage}",
          e
        )
    }
}
