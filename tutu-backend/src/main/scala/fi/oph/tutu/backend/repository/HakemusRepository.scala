package fi.oph.tutu.backend.repository

import fi.oph.tutu.backend.domain.{DbHakemus, HakemusListItem, HakemusOid, KasittelyVaihe, UserOid}
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.{Component, Repository}
import slick.jdbc.GetResult
import slick.jdbc.PostgresProfile.api.*

import java.util.UUID
import scala.concurrent.duration.DurationInt

@Component
@Repository
class HakemusRepository {
  @Autowired
  val db: TutuDatabase = null

  final val DB_TIMEOUT = 30.seconds
  val LOG: Logger      = LoggerFactory.getLogger(classOf[HakemusRepository])

  implicit val getUUIDResult: GetResult[UUID] =
    GetResult(r => UUID.fromString(r.nextString()))

  implicit val getHakemusOidResult: GetResult[HakemusOid] =
    GetResult(r => HakemusOid(r.nextString()))

  implicit val getHakemusResult: GetResult[DbHakemus] =
    GetResult(r =>
      DbHakemus(
        HakemusOid(r.nextString()),
        r.nextInt(),
        Option(r.nextString()).map(UUID.fromString),
        Option(r.nextString()).map(UserOid.apply),
        Option(r.nextString()),
        KasittelyVaihe.fromString(r.nextString())
      )
    )

  implicit val getHakemusListItemResult: GetResult[HakemusListItem] =
    GetResult(r =>
      HakemusListItem(
        null,
        null,
        r.nextString(),
        r.nextInt(),
        Option(r.nextString()),
        Option(r.nextString()),
        null,
        null,
        r.nextString()
      )
    )

  /**
   * Tallentaa uuden hakemuksen
   *
   * @param hakemusOid
   *   hakemuspalvelun hakemuksen oid
   * @return
   *   tallennetun hakemuksen id
   */
  def tallennaHakemus(hakemusOid: HakemusOid, hakemusKoskee: Int, esittelijaId: Option[UUID], luoja: String): UUID =
    val hakemusOidString   = hakemusOid.toString
    val esittelijaIdOrNull = esittelijaId.map(_.toString).orNull
    try
      db.run(
        sql"""
      INSERT INTO hakemus (hakemus_oid, hakemus_koskee, esittelija_id, luoja)
      VALUES ($hakemusOidString, $hakemusKoskee, ${esittelijaIdOrNull}::uuid, $luoja)
      RETURNING id
    """.as[UUID].head,
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
              h.hakemus_oid, h.hakemus_koskee, e.esittelija_oid, h.asiatunnus, h.kasittely_vaihe
            FROM
              hakemus h
            LEFT JOIN public.esittelija e on e.id = h.esittelija_id
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
              h.hakemus_oid, h.hakemus_koskee, h.esittelija_id, e.esittelija_oid, h.asiatunnus, h.kasittely_vaihe
            FROM
              hakemus h
            LEFT JOIN public.esittelija e on e.id = h.esittelija_id
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
   *   esittelijän oid
   *
   * @param hakemusKoskee
   *   hakemuspalvelun hakemuksen syy
   * @return
   *   hakuehtojen mukaisten hakemusten Oid:t
   */
  def haeHakemusOidit(userOid: Option[String], hakemusKoskee: Option[String]): Seq[HakemusOid] = {
    try {
      val baseQuery = "SELECT h.hakemus_oid FROM hakemus h"

      val joinClause = userOid match {
        case None      => ""
        case Some(oid) => s" INNER JOIN esittelija e on h.esittelija_id = e.id and e.esittelija_oid = '${oid}'"
      }

      val whereClause = hakemusKoskee match {
        case None    => ""
        case Some(s) => s" WHERE h.hakemus_koskee = ${s.toInt}"
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
   * Päivittää osan hakemuksesta
   *
   * @param hakemusOid
   * hakemuksen oid
   * @param hakemusKoskee
   * hakemus koskee -koodi
   * @param esittelijaId
   * esittelijän id
   * @param asiatunnus
   * asiatunnus
   * @param muokkaaja
   * muokkaajan oid
   * @return
   * tallennetun hakemuksen id
   */
  def paivitaPartialHakemus(
    hakemusOid: HakemusOid,
    partialHakemus: DbHakemus,
    muokkaaja: String
  ): HakemusOid = {
    val hakemusOidString   = hakemusOid.toString
    val esittelijaIdOrNull = partialHakemus.esittelijaId.map(_.toString).orNull
    val asiatunnusOrNull   = partialHakemus.asiatunnus.map(_.toString).orNull
    val hakemusKoskee      = partialHakemus.hakemusKoskee
    try
      db.run(
        sql"""
        UPDATE hakemus
        SET hakemus_koskee = $hakemusKoskee, esittelija_id = ${esittelijaIdOrNull}::uuid, asiatunnus = $asiatunnusOrNull, muokkaaja = $muokkaaja
        WHERE hakemus_oid = $hakemusOidString
        RETURNING 
          hakemus_oid
      """.as[HakemusOid].head,
        "paivita_hakemus"
      )
    catch {
      case e: Exception =>
        LOG.error(s"Hakemuksen päivitus epäonnistui: ${e}")
        throw new RuntimeException(
          s"Hakemuksen päivitys epäonnistui: ${e.getMessage}",
          e
        )
    }
  }
}
