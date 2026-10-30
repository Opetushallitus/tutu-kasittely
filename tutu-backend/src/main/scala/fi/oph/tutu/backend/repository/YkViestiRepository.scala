package fi.oph.tutu.backend.repository

import fi.oph.tutu.backend.domain.*
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.{Component, Repository}
import slick.jdbc.GetResult
import slick.jdbc.PostgresProfile.api.*

import java.time.LocalDateTime
import java.util.UUID
import slick.jdbc.PositionedResult

def nextStringArray(r: PositionedResult): Seq[String] = {
  try {
    r.rs
      .getArray(r.skip.currentPos)
      .getArray
      .asInstanceOf[Array[Any]]
      .toList
      .map(_.toString())
  } catch {
    case e: Exception => Seq.empty
  }
}

@Component
@Repository
class YkViestiRepository extends BaseResultHandlers {
  @Autowired
  val db: TutuDatabase = null

  val LOG: Logger = LoggerFactory.getLogger(classOf[YkViestiRepository])

  implicit val getYkViestiListItemResult: GetResult[YkViesti] =
    GetResult(r =>
      YkViesti(
        id = r.nextObject().asInstanceOf[UUID],
        parentId = Option(r.nextObject().asInstanceOf[UUID]),
        hakemusOid = HakemusOid(r.nextString()),
        asiatunnus = Option(r.nextString()),
        lahettajaOid = Option(r.nextString()),
        lahettaja = Option(r.nextString()),
        vastaanottajaOid = Option(r.nextString()),
        viesti = Option(r.nextString()),
        hakija = r.nextString(),
        luoja = r.nextStringOption(),
        luotu = r.nextTimestampOption().map(_.toLocalDateTime),
        lahetetty = r.nextTimestampOption().map(_.toLocalDateTime),
        muokkaaja = r.nextStringOption(),
        muokattu = r.nextTimestampOption().map(_.toLocalDateTime),
        luettu = nextStringArray(r),
        aihe = Option(r.nextString()),
        esittelija = Option(r.nextString())
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
            COALESCE(e.kutsumanimi, '') || ' ' || COALESCE(e.sukunimi, ''),
            v.vastaanottaja_oid,
            v.viesti,
            COALESCE(h.hakija_etunimet, '') || ' ' || COALESCE(h.hakija_sukunimi, ''),
            v.luoja,
            v.luotu,
            v.lahetetty,
            v.muokkaaja,
            v.muokattu,
            v.luettu,
            a.avain,
            COALESCE(he.kutsumanimi, '') || ' ' || COALESCE(he.sukunimi, '')
          FROM
            yk_viesti v
          LEFT JOIN hakemus h on h.hakemus_oid = v.hakemus_oid
          LEFT JOIN esittelija e on e.esittelija_oid = v.lahettaja_oid
          LEFT JOIN yk_viesti_aihe a on a.id = v.aihe
          LEFT JOIN esittelija he on he.id = h.esittelija_id
          WHERE
            v.vastaanottaja_oid = $userOid
          AND
            v.lahetetty IS NOT NULL
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
          COALESCE(e.kutsumanimi, '') || ' ' || COALESCE(e.sukunimi, ''),
          v.vastaanottaja_oid,
          v.viesti,
          COALESCE(h.hakija_etunimet, '') || ' ' || COALESCE(h.hakija_sukunimi, ''),
          v.luoja,
          v.luotu,
          v.lahetetty,
          v.muokkaaja,
          v.muokattu,
          v.luettu,
          a.avain,
          COALESCE(he.kutsumanimi, '') || ' ' || COALESCE(he.sukunimi, '')
        FROM
          yk_viesti v
        LEFT JOIN hakemus h on h.hakemus_oid = v.hakemus_oid
        LEFT JOIN esittelija e on e.esittelija_oid = v.lahettaja_oid
        LEFT JOIN yk_viesti_aihe a on a.id = v.aihe
        LEFT JOIN esittelija he on he.id = h.esittelija_id
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
          COALESCE(e.kutsumanimi, '') || ' ' || COALESCE(e.sukunimi, ''),
          v.vastaanottaja_oid,
          v.viesti,
          COALESCE(h.hakija_etunimet, '') || ' ' || COALESCE(h.hakija_sukunimi, ''),
          v.luoja,
          v.luotu,
          v.lahetetty,
          v.muokkaaja,
          v.muokattu,
          v.luettu,
          a.avain,
          COALESCE(he.kutsumanimi, '') || ' ' || COALESCE(he.sukunimi, '')
        FROM
          yk_viesti v
        LEFT JOIN hakemus h on h.hakemus_oid = v.hakemus_oid
        LEFT JOIN esittelija e on e.esittelija_oid = v.lahettaja_oid
        LEFT JOIN yk_viesti_aihe a on a.id = v.aihe
        LEFT JOIN esittelija he on he.id = h.esittelija_id
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

  def tallennaHakemuksenYkViesti(
    ykViesti: YkViesti
  ): UUID = {
    try {
      db.run(
        sql"""
            INSERT INTO yk_viesti (
              parent_id,
              hakemus_oid,
              lahettaja_oid,
              vastaanottaja_oid,
              viesti,
              luoja,
              lahetetty
            )
            VALUES (
              ${ykViesti.parentId.map(_.toString).orNull}::uuid,
              ${ykViesti.hakemusOid.toString},
              ${ykViesti.lahettajaOid.map(_.toString).orNull},
              ${ykViesti.vastaanottajaOid.map(_.toString).orNull},
              ${ykViesti.viesti.map(_.toString).orNull},
              ${ykViesti.luoja.map(_.toString).orNull},
              ${ykViesti.lahetetty.map(java.sql.Timestamp.valueOf).orNull}
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
              luettu = ${ykViesti.luettu},
              muokkaaja =  ${ykViesti.muokkaaja.map(_.toString).orNull},
              lahetetty = ${ykViesti.lahetetty.map(java.sql.Timestamp.valueOf).orNull}
            WHERE
              id = ${ykViesti.id.toString}::uuid
          """.as[UUID].head,
        "muokkaa_yk_viestia"
      )
    } catch {
      case e: Exception =>
        LOG.error(s"Yhteiskäsittelyn viestin muokkaus epäonnistui: $e")
        throw new RuntimeException(
          s"Yhteiskäsittelyn viestin muokkaus epäonnistui: ${e.getMessage}",
          e
        )
    }
  }

  def haeHakemuksenYkViestit(
    hakemusOid: String
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
          COALESCE(e.kutsumanimi, '') || ' ' || COALESCE(e.sukunimi, ''),
          v.vastaanottaja_oid,
          v.viesti,
          COALESCE(h.hakija_etunimet, '') || ' ' || COALESCE(h.hakija_sukunimi, ''),
          v.luoja,
          v.luotu,
          v.lahetetty,
          v.muokkaaja,
          v.muokattu,
          v.luettu,
          a.avain,
          COALESCE(he.kutsumanimi, '') || ' ' || COALESCE(he.sukunimi, '')
        FROM
          yk_viesti v
        LEFT JOIN esittelija e on e.esittelija_oid = v.lahettaja_oid
        LEFT JOIN hakemus h on h.hakemus_oid = v.hakemus_oid
        LEFT JOIN yk_viesti_aihe a on a.id = v.aihe
        LEFT JOIN esittelija he on he.id = h.esittelija_id
        WHERE
          v.hakemus_oid = $hakemusOid
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

  /**
   * Poistaa yhteiskäsittelyn viestin
   *
   * @param id
   * YK-viestin id
   */
  private def poistaYkViesti(
    id: UUID
  ): DBIO[Int] =
    sqlu"""
      DELETE FROM yk_viesti
      WHERE id = ${id.toString}::uuid
    """

  def suoritaPoistaYkViesti(id: UUID): Int = {
    try {
      db.run(poistaYkViesti(id), "poista_yk_viesti")
    } catch {
      case e: Exception =>
        LOG.error(s"Yhteiskäsittelyn viestin poistaminen epäonnistui: $e")
        throw new RuntimeException(
          s"Yhteiskäsittelyn viestin poistaminen epäonnistui: ${e.getMessage}",
          e
        )
    }
  }
}
