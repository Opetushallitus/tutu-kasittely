package fi.oph.tutu.backend.repository

import fi.oph.tutu.backend.domain.{Hakemus, HakemusOid}
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

  implicit val getHakemusResult: GetResult[Hakemus] =
    GetResult(r => Hakemus(HakemusOid(r.nextString()), r.nextInt(), UUID.fromString(r.nextString())))

  /**
   * Tallentaa uuden hakemuksen
   *
   * @param hakemusOid
   *   hakemuspalvelun hakemuksen oid
   * @return
   *   tallennetun hakemuksen id
   */
  def tallennaHakemus(hakemusOid: HakemusOid, syykoodi: Int, esittelijaId: Option[UUID], luoja: String): UUID =
    val hakemusOidString   = hakemusOid.toString
    val esittelijaIdOrNull = esittelijaId.map(_.toString).orNull
    try
      db.run(
        sql"""
      INSERT INTO hakemus (hakemus_oid, syykoodi, esittelija_id, luoja)
      VALUES ($hakemusOidString, $syykoodi, ${esittelijaIdOrNull}::uuid, $luoja)
      RETURNING id
    """.as[UUID].head,
        "tallennaHakemus"
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
   * @return
   *   HakemusOid-listan mukaiset hakemukset tietoineen
   */
  def haeHakemukset(hakemusOidt: Seq[HakemusOid]): Seq[Hakemus] =
    try {
      val oidt = hakemusOidt.map(oid => oid.s).mkString(",")

      db.run(
        sql"""
        SELECT
          hakemus_oid, syykoodi, esittelija_id
        FROM
          hakemus
        WHERE
          hakemus_oid IN ($oidt)
        """.as[Hakemus],
        "hae_hakemukset"
      )
    } catch {
      case e: Exception =>
        throw new RuntimeException(
          s"Hakemuksien listaus epäonnistui: ${e.getMessage}",
          e
        )
    }

  /**
   * PLACEHOLDER TOTEUTUS, KUNNES ElasticSearch-HAKU TOTEUTETTU
   *
   * Placeholder-toteutus ei käsittele hakuehtoja, vaan palauttaa kaikki hakemukset
   *
   * @return
   *   hakuehtojen mukaisten hakemusten Oid:t
   */
  def mockHaeHakemusIdt(): Seq[HakemusOid] =
    try
      db.run(
        sql"""
        SELECT hakemus_oid FROM hakemus
        """.as[HakemusOid],
        "mock_hae_hakemus_idt"
      )
    catch {
      case e: Exception =>
        throw new RuntimeException(
          s"Hakemuksien listaus epäonnistui: ${e.getMessage}",
          e
        )
    }
}
