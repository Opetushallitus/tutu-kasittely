package fi.oph.tutu.backend.repository

import fi.oph.tutu.backend.domain.*
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.{Component, Repository}
import slick.jdbc.GetResult
import slick.jdbc.PostgresProfile.api.*

import java.time.LocalDateTime
import java.util.UUID

@Component
@Repository
class YkViestiRepository extends BaseResultHandlers {
  @Autowired
  val db: TutuDatabase = null

  val LOG: Logger = LoggerFactory.getLogger(classOf[HakemusRepository])

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
        kysymysLuettu = r.nextTimestampOption().map(_.toLocalDateTime),
        vastausLuettu = r.nextTimestampOption().map(_.toLocalDateTime),
        kysymys = Option(r.nextString()),
        vastaus = Option(r.nextString()),
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
            v.kysymys_luettu,
            v.vastaus_luettu,
            v.kysymys,
            v.vastaus,
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
          v.kysymys_luettu,
          v.vastaus_luettu,
          v.kysymys,
          v.vastaus,
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

  def haeYkViesti(hakemusOid: String, id: String): Option[YkViesti] = {
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
          v.kysymys_luettu,
          v.vastaus_luettu,
          v.kysymys,
          v.vastaus,
          COALESCE(h.hakija_etunimet, '') || ' ' || COALESCE(h.hakija_sukunimi, '')
        FROM
          yk_viesti v
        LEFT JOIN hakemus h on h.hakemus_oid = v.hakemus_oid
        WHERE
          v.id = $id::uuid AND v.hakemus_oid = $hakemusOid
        """.as[YkViesti].headOption,
        "hae_ykviesti"
      )
    } catch {
      case e: Exception =>
        throw new RuntimeException(
          s"Yhteisen käsittelyn viestin haku epäonnistui: ${e.getMessage}",
          e
        )
    }
  }

  def luoHakemuksenYkViesti(
    ykViesti: YkViesti
  ): Unit = {
    try {
      db.run(
        sql"""
            INSERT INTO yk_viesti (
              parent_id,
              hakemus_oid,
              lahettaja_oid,
              vastaanottaja_oid,
              luotu,
              kysymys,
              vastaus
            )
            VALUES (
              ${ykViesti.parentId.map(_.toString).orNull}::uuid,
              ${ykViesti.hakemusOid.toString},
              ${ykViesti.lahettajaOid.map(_.toString).orNull},
              ${ykViesti.vastaanottajaOid.map(_.toString).orNull},
              now(),
              ${ykViesti.kysymys.map(_.toString).orNull},
              ${ykViesti.vastaus.map(_.toString).orNull}
            )
            RETURNING id
          """.as[UUID].head,
        "lisaa_yk_viesti"
      )
    } catch {
      case e: Exception =>
        LOG.error(s"Yhteiskäsittelyn viestin lisäys epäonnistui: $e")
        throw new RuntimeException(
          s"Yhteiskäsittelyn viestin lisäys epäonnistui: ${e.getMessage}",
          e
        )
    }
  }

  def muokkaaHakemuksenYkViestia(
    ykViesti: YkViesti
  ): Unit = {
    try {
      db.run(
        sql"""
            UPDATE yk_viesti
            SET
              vastaus = ${ykViesti.vastaus.map(_.toString).orNull},
              vastaus_luettu = ${ykViesti.vastausLuettu.map(java.sql.Timestamp.valueOf).orNull},
              kysymys_luettu = ${ykViesti.kysymysLuettu.map(java.sql.Timestamp.valueOf).orNull}
            WHERE
              id = ${ykViesti.id.toString}::uuid
          """.as[UUID].head,
        "muokkaa_yk_viestia"
      )
    } catch {
      case e: Exception =>
        LOG.error(s"Yhteiskäsittelyn viestin lisäys epäonnistui: $e")
        throw new RuntimeException(
          s"Yhteiskäsittelyn viestin lisäys epäonnistui: ${e.getMessage}",
          e
        )
    }
  }

  def haeHakemuksenYkViestit(
    hakemusOid: String,
    userOid: String
  ): Seq[YkViesti] = {
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
          v.kysymys_luettu,
          v.vastaus_luettu,
          v.kysymys,
          v.vastaus,
          COALESCE(h.hakija_etunimet, '') || ' ' || COALESCE(h.hakija_sukunimi, '')
        FROM
          yk_viesti v
        LEFT JOIN hakemus h on h.hakemus_oid = v.hakemus_oid
        WHERE
          (v.vastaanottaja_oid = $userOid OR v.lahettaja_oid = $userOid)
        ORDER BY v.luotu DESC
        """.as[YkViesti],
        "hae_yk_viestit"
      )
    } catch {
      case e: Exception =>
        throw new RuntimeException(
          s"Hakemuskohtaisten YK viestien haku epäonnistui: ${e.getMessage}",
          e
        )
    }
  }
}
