package fi.oph.tutu.backend.repository

import fi.oph.tutu.backend.domain.*
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.{Component, Repository}
import slick.jdbc.GetResult
import slick.jdbc.PostgresProfile.api.*
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.duration.DurationInt

import java.time.LocalDateTime
import java.util.UUID

@Component
@Repository
class YkViestiRepository extends BaseResultHandlers {
  @Autowired
  val db: TutuDatabase = null

  final val DB_TIMEOUT = 30.seconds
  val LOG: Logger      = LoggerFactory.getLogger(classOf[HakemusRepository])

  implicit val getYkViestiListItemResult: GetResult[YkViesti] =
    GetResult(r =>
      YkViesti(
        id = r.nextObject().asInstanceOf[UUID],
        parentId = Option(r.nextObject().asInstanceOf[UUID]),
        hakemusOid = HakemusOid(r.nextString()),
        asiatunnus = Option(r.nextString()),
        lahettajaOid = Option(r.nextString()),
        vastaanottajaOid = Option(r.nextString()),
        luotu = Some(r.nextTimestamp().toLocalDateTime),
        luettu = r.nextTimestampOption().map(_.toLocalDateTime),
        viesti = Option(r.nextString()),
        hakija = r.nextString()
      )
    )

  def haeYkSaapuneetViestit(userOid: String): Seq[YkViesti] =
    try {
      db.run(
        sql"""
          SELECT
            v.id,
            v.parent_id,
            v.hakemus_oid,
            h.asiatunnus,
            v.lahettaja_oid,
            v.vastaanottaja_oid,
            v.luotu,
            v.luettu,
            v.viesti,
            COALESCE(h.hakija_etunimet, '') || ' ' || COALESCE(h.hakija_sukunimi, '')
          FROM
            yk_viesti v
          LEFT JOIN hakemus h on h.hakemus_oid = v.hakemus_oid
          WHERE
            v.vastaanottaja_oid = $userOid
          """.as[YkViesti],
        "hae_yksaapuneetViestit"
      )
    } catch {
      case e: Exception =>
        throw new RuntimeException(
          s"Yhteisen käsittelyn saapuneiden viestien listaus epäonnistui: ${e.getMessage}",
          e
        )
    }

  def haeYkLahetetytViestit(userOid: String): Seq[YkViesti] =
    try {
      db.run(
        sql"""
        SELECT
          v.id,
          v.parent_id,
          v.hakemus_oid,
          h.asiatunnus,
          v.lahettaja_oid,
          v.vastaanottaja_oid,
          v.luotu,
          v.luettu,
          v.viesti,
          COALESCE(h.hakija_etunimet, '') || ' ' || COALESCE(h.hakija_sukunimi, '')
        FROM
          yk_viesti v
        LEFT JOIN hakemus h on h.hakemus_oid = v.hakemus_oid
        WHERE
          v.lahettaja_oid = $userOid
        """.as[YkViesti],
        "hae_yklahetetytViestit"
      )
    } catch {
      case e: Exception =>
        throw new RuntimeException(
          s"Yhteisen käsittelyn lähetettyjen viestien listaus epäonnistui: ${e.getMessage}",
          e
        )
    }
}
