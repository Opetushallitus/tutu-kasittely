package fi.oph.tutu.backend.repository

import fi.oph.tutu.backend.domain.{Kieli, Viesti, ViestiListItem, Viestityyppi}
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.{Component, Repository}
import slick.jdbc.GetResult

import java.util.UUID
import scala.concurrent.duration.DurationInt
import slick.jdbc.PostgresProfile.api.*

@Component
@Repository
class ViestiRepository extends BaseResultHandlers {
  @Autowired
  val db: TutuDatabase = null

  final val DB_TIMEOUT = 30.seconds
  val LOG: Logger      = LoggerFactory.getLogger(classOf[ViestiRepository])

  implicit val getViestiResult: GetResult[Viesti] =
    GetResult(r =>
      Viesti(
        id = Some(r.nextObject().asInstanceOf[UUID]),
        hakemusId = Some(r.nextObject().asInstanceOf[UUID]),
        kieli = Option(Kieli.fromString(r.nextString())),
        viestityyppi = Option(Viestityyppi.fromString(r.nextString())),
        otsikko = Option(r.nextString()),
        viesti = Option(r.nextString()),
        vahvistettu = r.nextTimestampOption().map(_.toLocalDateTime),
        vahvistaja = Option(r.nextString()),
        luotu = Some(r.nextTimestamp().toLocalDateTime),
        luoja = Some(r.nextString()),
        muokkaaja = r.nextStringOption()
      )
    )

  implicit val getViestiListItemResult: GetResult[ViestiListItem] =
    GetResult(r =>
      ViestiListItem(
        id = r.nextObject().asInstanceOf[UUID],
        viestityyppi = Viestityyppi.fromString(r.nextString()),
        otsikko = r.nextString(),
        vahvistettu = r.nextTimestamp().toLocalDateTime,
        vahvistaja = r.nextString()
      )
    )

  def haeViesti(id: UUID): Option[Viesti] = {
    try {
      db.run(
        sql"""
          SELECT id, hakemus_id, kieli, tyyppi, otsikko, viesti, vahvistettu, vahvistaja, luotu, luoja, muokkaaja
          FROM viesti
          WHERE id = ${id.toString}::uuid
           """.as[Viesti].headOption,
        "hae_viesti"
      )
    } catch {
      case e: Exception =>
        LOG.error(s"Viestin haku epäonnistui: $e")
        throw new RuntimeException(
          s"Viestin haku epäonnistui: ${e.getMessage}",
          e
        )
    }
  }

  def haeVahvistamatonViesti(hakemusId: UUID): Option[Viesti] = {
    try {
      db.run(
        sql"""
          SELECT id, hakemus_id, kieli, tyyppi, otsikko, viesti, null, null, luotu, luoja, muokkaaja
          FROM viesti
          WHERE hakemus_id = ${hakemusId.toString}::uuid
            AND vahvistettu IS NULL
           """.as[Viesti].headOption,
        "hae_vahvistamaton_viesti"
      )
    } catch {
      case e: Exception =>
        LOG.error(s"Vahvistamattoman viestin haku epäonnistui: $e")
        throw new RuntimeException(
          s"Vahvistamattoman viestin haku epäonnistui: ${e.getMessage}",
          e
        )
    }
  }

  def haeViestiLista(hakemusId: UUID): Seq[ViestiListItem] = {
    try {
      db.run(
        sql"""
          SELECT id, tyyppi, otsikko, vahvistettu, vahvistaja
          FROM viesti
          WHERE hakemus_id = ${hakemusId.toString}::uuid
          AND vahvistettu IS NOT NULL
           """.as[ViestiListItem],
        "hae_viestilista"
      )
    } catch {
      case e: Exception =>
        LOG.error(s"Viestilistan haku epäonnistui: $e")
        throw new RuntimeException(
          s"Viestilistan haku epäonnistui: ${e.getMessage}",
          e
        )
    }
  }

  def lisaaViesti(hakemusId: UUID, viesti: Viesti, luoja: String): Viesti = {
    try {
      db.run(
        sql"""
            INSERT INTO viesti (hakemus_id, kieli, tyyppi, otsikko, viesti, vahvistettu, vahvistaja, luoja)
            VALUES (${hakemusId.toString}::uuid,
            ${viesti.kieli.map(_.toString).orNull}::kieli,
            ${viesti.viestityyppi.map(_.toString).orNull}::viestityyppi,
            ${viesti.otsikko.orNull},
            ${viesti.viesti.orNull},
            ${viesti.vahvistettu.map(java.sql.Timestamp.valueOf).orNull},
            ${viesti.vahvistaja.orNull},
            $luoja)
            RETURNING id, hakemus_id, kieli, tyyppi, otsikko, viesti, vahvistettu, vahvistaja, luotu, luoja, null
          """.as[Viesti].head,
        "lisaa_viesti"
      )
    } catch {
      case e: Exception =>
        LOG.error(s"Viestin lisäys epäonnistui: $e")
        throw new RuntimeException(
          s"Viestin lisäys epäonnistui: ${e.getMessage}",
          e
        )
    }
  }

  def tallennaViesti(id: UUID, viesti: Viesti, muokkaaja: String): Viesti = {
    try {
      db.run(
        sql"""
          UPDATE viesti
          SET
              kieli = ${viesti.kieli.map(_.toString).orNull}::kieli,
              tyyppi = ${viesti.viestityyppi.map(_.toString).orNull}::viestityyppi,
              otsikko = ${viesti.otsikko.orNull},
              viesti = ${viesti.viesti.orNull},
              vahvistettu = ${viesti.vahvistettu.map(java.sql.Timestamp.valueOf).orNull},
              vahvistaja = ${viesti.vahvistaja.orNull},
              muokkaaja = $muokkaaja
          WHERE id = ${id.toString}::uuid
          RETURNING id, hakemus_id, kieli, tyyppi, otsikko, viesti, vahvistettu, vahvistaja, luotu, luoja, muokkaaja
        """.as[Viesti].head,
        "tallenna_viesti"
      )
    } catch {
      case e: Exception =>
        LOG.error(s"Viestin tallennus epäonnistui: $e")
        throw new RuntimeException(
          s"Viestin tallennus epäonnistui: ${e.getMessage}",
          e
        )
    }
  }

  def poistaViesti(id: UUID): Int = {
    try {
      db.run(
        sqlu"""
          DELETE FROM viesti
          WHERE id = ${id.toString}::uuid
        """,
        "poista_viesti"
      )
    } catch {
      case e: Exception =>
        LOG.error(s"Viestin poisto epäonnistui: $e")
        throw new RuntimeException(
          s"Viestin poisto epäonnistui: ${e.getMessage}",
          e
        )
    }
  }
}
