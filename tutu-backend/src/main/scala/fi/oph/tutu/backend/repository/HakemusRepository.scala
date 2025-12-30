package fi.oph.tutu.backend.repository

import fi.oph.tutu.backend.domain.*
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.{Component, Repository}
import slick.dbio.DBIO
import slick.jdbc.GetResult
import slick.jdbc.PostgresProfile.api.*

import java.util.UUID
import scala.concurrent.duration.DurationInt
import scala.util.{Failure, Success, Try}

@Component
@Repository
class HakemusRepository extends BaseResultHandlers {
  @Autowired
  val db: TutuDatabase = null

  final val DB_TIMEOUT = 30.seconds
  val LOG: Logger      = LoggerFactory.getLogger(classOf[HakemusRepository])

  implicit val getHakemusOidResult: GetResult[HakemusOid] =
    GetResult(r => HakemusOid(r.nextString()))

  implicit val getHakemusResult: GetResult[DbHakemus] =
    GetResult(r =>
      DbHakemus(
        UUID.fromString(r.nextString()),
        HakemusOid(r.nextString()),
        r.nextInt(),
        r.nextLong(),
        Option(r.nextString()).map(UUID.fromString),
        Option(UserOid(r.nextString())),
        Option(r.nextString()).map(UUID.fromString),
        Option(r.nextString()),
        KasittelyVaihe.fromString(r.nextString()),
        Option(r.nextTimestamp()).map(_.toLocalDateTime),
        r.nextBoolean(),
        Option(r.nextString()),
        Option(r.nextString())
      )
    )

  implicit val getHakemusListItemResult: GetResult[HakemusListItem] =
    GetResult(r =>
      HakemusListItem(
        null,
        null,
        UUID.fromString(r.nextString()),
        r.nextString(),
        r.nextInt(),
        Option(r.nextString()),
        Option(r.nextString()).map(UUID.fromString),
        Option(r.nextString()),
        null,
        null,
        KasittelyVaihe.fromString(r.nextString()),
        Option(r.nextString()),
        null,
        Option(r.nextBoolean()),
        Option(r.nextString())
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
    luoja: String
  ): DBIO[UUID] =
    val hakemusOidString                                   = hakemusOid.toString
    val esittelijaIdOrNull                                 = esittelijaId.map(_.toString).orNull
    val lopullinenPaatosVastaavaEhdollinenAsiatunnusOrNull =
      lopullinenPaatosVastaavaEhdollinenAsiatunnus.orNull
    val lopullinenPaatosVastaavaEhdollinenSuoritusmaaKoodiUriOrNull =
      lopullinenPaatosVastaavaEhdollinenSuoritusmaaKoodiUri.orNull

    sql"""
      INSERT INTO hakemus (hakemus_oid, hakemus_koskee, form_id, esittelija_id,
        asiakirja_id, lopullinen_paatos_ehdollisen_asiatunnus,
        lopullinen_paatos_tutkinnon_suoritus_maakoodiuri, luoja)
      VALUES ($hakemusOidString, $hakemusKoskee, $formId, $esittelijaIdOrNull::uuid, ${asiakirjaId.toString}::uuid,
        $lopullinenPaatosVastaavaEhdollinenAsiatunnusOrNull,
        $lopullinenPaatosVastaavaEhdollinenSuoritusmaaKoodiUriOrNull, $luoja)
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
        LOG.error(s"Hakemuksen tallennus epäonnistui: ${e}")
        throw new RuntimeException(
          s"Hakemuksen tallennus epäonnistui: ${e.getMessage}",
          e
        )
    }

  /**
   * Palauttaa listan hakemuksista hakemusOid-listan pohjalta
   * - Palautettavien kenttien listaa täydennettävä sitä mukaa
   *   kun domain-luokka kasvaa
   *
   * @param hakemusOidit
   *   hakemuspalvelun hakemusten oidit
   *
   * @return
   *   HakemusOid-listan mukaiset hakemukset tietoineen
   */
  def haeHakemusLista(hakemusOidt: Seq[HakemusOid]): Seq[HakemusListItem] = {
    try {
      val oidt = hakemusOidt.map(oid => s"'${oid.s}'").mkString(", ")
      db.run(
        sql"""
            SELECT
              h.id, h.hakemus_oid, h.hakemus_koskee, e.esittelija_oid, h.asiakirja_id, h.asiatunnus, h.kasittely_vaihe, h.muokattu, a.ap_hakemus, a.viimeinen_asiakirja_hakijalta
            FROM
              hakemus h
            LEFT JOIN esittelija e on e.id = h.esittelija_id
            LEFT JOIN asiakirja a on a.id = h.asiakirja_id
            WHERE
              h.hakemus_oid IN (#$oidt)
            """.as[HakemusListItem],
        "hae_hakemukset"
      )
    } catch {
      case e: Exception =>
        throw new RuntimeException(
          s"Hakemuksien listaus epäonnistui: ${e.getMessage}",
          e
        )
    }
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
              h.lopullinen_paatos_tutkinnon_suoritus_maakoodiuri
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
   * PLACEHOLDER TOTEUTUS, KUNNES ElasticSearch-HAKU TOTEUTETTU
   *
   * @param userOid
   * esittelijän oid
   * @param hakemusKoskee
   * hakemuspalvelun hakemuksen syy
   * @param vaiheet
   * tutu-hakemuksen käsittelyvaiheet
   * @return
   * hakuehtojen mukaisten hakemusten Oid:t
   */
  def haeHakemusOidit(
    userOids: Seq[String],
    hakemusKoskee: Seq[Int],
    vaiheet: Seq[String],
    apHakemus: Boolean
  ): Seq[HakemusOid] = {
    try {
      val baseQuery = "SELECT h.hakemus_oid FROM hakemus h"

      val joinClauses = Seq.newBuilder[String]

      if (userOids.nonEmpty) {
        val oidList = userOids.map(o => s"'$o'").mkString(", ")
        joinClauses += s"INNER JOIN esittelija e ON h.esittelija_id = e.id AND e.esittelija_oid IN (${oidList})"
      }

      if (apHakemus) {
        joinClauses += "INNER JOIN asiakirja a ON h.asiakirja_id = a.id AND a.ap_hakemus = true"
      }
      val joinClause = {
        val clauses = joinClauses.result()
        if (clauses.isEmpty) ""
        else " " + clauses.mkString(" ")
      }

      val whereClauses = Seq.newBuilder[String]

      if (hakemusKoskee.nonEmpty) {
        val hakemusKoskeeList = hakemusKoskee.map(hk => s"$hk").mkString(", ")
        whereClauses += s"h.hakemus_koskee IN (${hakemusKoskeeList})"
      }

      if (vaiheet.nonEmpty) {
        val vaiheList = vaiheet.map(vaihe => s"'${vaihe}'").mkString(", ")
        whereClauses += s"h.kasittely_vaihe IN (${vaiheList})"
      }

      val whereClause = {
        val clauses = whereClauses.result()
        if (clauses.isEmpty) ""
        else " WHERE " + clauses.mkString(" AND ")
      }

      val fullQuery = baseQuery + joinClause + whereClause

      LOG.debug(fullQuery)

      db.run(
        sql"""#$fullQuery""".as[HakemusOid],
        "hae_hakemus_oidt"
      )
    } catch {
      case e: Exception =>
        throw new RuntimeException(
          s"HakemusOidien listaus epäonnistui: ${e.getMessage}",
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
          lopullinen_paatos_tutkinnon_suoritus_maakoodiuri = $lopullinenPaatosVastaavaEhdollinenSuoritusmaaKoodiUriOrNull
        WHERE hakemus_oid = $hakemusOidString
        RETURNING
          hakemus_oid
      """.as[HakemusOid].head,
        "paivita_taysi_hakemus"
      )
    catch {
      case e: Exception =>
        LOG.error(s"Hakemuksen täysi päivitys epäonnistui: ${e}")
        throw new RuntimeException(
          s"Hakemuksen täysi päivitys epäonnistui: ${e.getMessage}",
          e
        )
    }
  }

  private def paivitaAsiatunnus(hakemusOid: HakemusOid, asiatunnus: String, muokkaaja: String): DBIO[Int] =
    sqlu"""
      UPDATE hakemus
      SET asiatunnus = ${asiatunnus}, muokkaaja = ${muokkaaja}
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

  private def paivitaVaiheJaHakemusKoskee(
    hakemusOid: HakemusOid,
    kasittelyVaihe: KasittelyVaihe,
    hakemusKoskee: Int,
    muokkaaja: String
  ): DBIO[Int] =
    sqlu"""
        UPDATE hakemus
        SET kasittely_vaihe = ${kasittelyVaihe.toString}, hakemus_koskee = ${hakemusKoskee}, muokkaaja = ${muokkaaja}
        WHERE hakemus_oid = ${hakemusOid.toString}
      """

  def suoritaPaivitaVaiheJaHakemusKoskee(
    hakemusOid: HakemusOid,
    kasittelyVaihe: KasittelyVaihe,
    hakemusKoskee: Int,
    muokkaaja: String
  ): Int = {
    Try {
      db.run(
        paivitaVaiheJaHakemusKoskee(hakemusOid, kasittelyVaihe, hakemusKoskee, muokkaaja),
        "PaivitaVaiheJaHakemusKoskee"
      )
    } match {
      case Success(modified) => modified
      case Failure(e)        =>
        LOG.error(s"Virhe hakemus koskee-tiedon päivittämisessä: ${e.getMessage}", e)
        throw new RuntimeException(s"Virhe hakemus koskee-tiedon päivittämisessä: ${e.getMessage} ${e.getMessage}", e)
    }
  }
}
