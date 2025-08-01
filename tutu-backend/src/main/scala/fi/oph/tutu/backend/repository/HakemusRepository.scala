package fi.oph.tutu.backend.repository

import fi.oph.tutu.backend.domain.*
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
        KasittelyVaihe.fromString(r.nextString()),
        Option(r.nextTimestamp()).map(_.toLocalDateTime)
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
        r.nextString(),
        Option(r.nextString()),
        null
      )
    )

  implicit val getPyydettavaAsiakirjaResult: GetResult[PyydettavaAsiakirja] =
    GetResult(r =>
      PyydettavaAsiakirja(
        Option(UUID.fromString(r.nextString())),
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
              h.hakemus_oid, h.hakemus_koskee, e.esittelija_oid, h.asiatunnus, h.kasittely_vaihe, h.muokattu
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
              h.hakemus_oid, h.hakemus_koskee, h.esittelija_id, e.esittelija_oid, h.asiatunnus, h.kasittely_vaihe, h.muokattu
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
   * esittelijän oid
   * @param hakemusKoskee
   * hakemuspalvelun hakemuksen syy
   * @param vaiheet
   * tutu-hakemuksen käsittelyvaiheet
   * @return
   * hakuehtojen mukaisten hakemusten Oid:t
   */
  def haeHakemusOidit(
    userOid: Option[String],
    hakemusKoskee: Option[String],
    vaiheet: Option[Seq[String]]
  ): Seq[HakemusOid] = {
    try {
      val baseQuery = "SELECT h.hakemus_oid FROM hakemus h"

      val joinClause = userOid match {
        case None      => ""
        case Some(oid) => s" INNER JOIN esittelija e ON h.esittelija_id = e.id AND e.esittelija_oid = '${oid}'"
      }

      val whereClauses = Seq.newBuilder[String]

      hakemusKoskee.foreach { s =>
        whereClauses += s"h.hakemus_koskee = ${s.toInt}"
      }

      vaiheet.foreach { v =>
        if (v.nonEmpty) {
          val vaiheList = v.map(vaihe => s"'${vaihe}'").mkString(", ")
          whereClauses += s"h.kasittely_vaihe IN (${vaiheList})"
        }
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

  /**
   * Luo pyydettävän asiakirjan
   *
   * @param hakemusOid
   * hakemuksen oid
   * @param asiakirjaTyyppi
   * pyydettävän asiakirjan tyyppi
   * @param virkailijaOid
   * virkailijan oid
   */
  def luoPyydettavaAsiakirja(
    hakemusOid: HakemusOid,
    asiakirjaTyyppi: String,
    virkailijaOid: UserOid
  ): Unit = {
    try {
      db.run(
        sql"""
          INSERT INTO pyydettava_asiakirja (hakemus_id, asiakirja_tyyppi, luoja)
          VALUES ((SELECT hakemus.id FROM hakemus WHERE hakemus_oid = ${hakemusOid.toString}), ${asiakirjaTyyppi}::asiakirjan_tyyppi, ${virkailijaOid.toString})
        """.asUpdate,
        "luo_pyydettava_asiakirja"
      )
    } catch {
      case e: Exception =>
        LOG.error(s"Pyydettävän asiakirjan luonti epäonnistui: ${e}")
        throw new RuntimeException(
          s"Pyydettävän asiakirjan luonti epäonnistui: ${e.getMessage}",
          e
        )
    }
  }

  /**
   * Poistaa pyydettävän asiakirjan
   *
   * @param id
   * asiakirjan id
   */
  def poistaPyydettavaAsiakirja(
    id: UUID
  ): Unit = {
    try {
      db.run(
        sqlu"""
          DELETE FROM pyydettava_asiakirja
          WHERE id = ${id.toString}::uuid
        """,
        "poista_pyydettava_asiakirja"
      )
    } catch {
      case e: Exception =>
        LOG.error(s"Pyydettävän asiakirjan poisto epäonnistui: ${e}")
        throw new RuntimeException(
          s"Pyydettävän asiakirjan poisto epäonnistui: ${e.getMessage}",
          e
        )
    }
  }

  /**
   * Hakee hakemuksen pyydettävät asiakirjat
   *
   * @param hakemusOid
   * hakemuksen oid
   * @return
   * hakemuksen pyydettävät asiakirjat
   */
  def haePyydettavatAsiakirjatHakemusOidilla(hakemusOid: HakemusOid): Seq[PyydettavaAsiakirja] = {
    try {
      db.run(
        sql"""
          SELECT id, asiakirja_tyyppi
          FROM pyydettava_asiakirja
          WHERE hakemus_id = (SELECT id FROM hakemus WHERE hakemus_oid = ${hakemusOid.toString})
        """.as[PyydettavaAsiakirja],
        "hae_hakemuksen_pyydettavat_asiakirjat"
      )
    } catch {
      case e: Exception =>
        LOG.error(s"Hakemuksen pyydettävien asiakirjojen haku epäonnistui: ${e}")
        throw new RuntimeException(
          s"Hakemuksen pyydettävien asiakirjojen haku epäonnistui: ${e.getMessage}",
          e
        )
    }
  }
}
