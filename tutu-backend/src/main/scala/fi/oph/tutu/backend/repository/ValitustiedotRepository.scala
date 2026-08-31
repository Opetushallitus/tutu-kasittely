package fi.oph.tutu.backend.repository

import fi.oph.tutu.backend.domain.{HakemusOid, ValitusHO, ValitusKHO, ValitusOPH, Valitustiedot}
import org.json4s.jackson.Serialization
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.{Component, Repository}
import slick.jdbc.GetResult
import slick.jdbc.PostgresProfile.api.*

import java.util.UUID

@Component
@Repository
class ValitustiedotRepository extends BaseResultHandlers {
  @Autowired
  val db: TutuDatabase = null

  val LOG: Logger = LoggerFactory.getLogger(classOf[ValitustiedotRepository])

  implicit val getValitustiedotResult: GetResult[Valitustiedot] =
    GetResult(r =>
      Valitustiedot(
        id = Option(r.nextString()).filter(_.nonEmpty).map(UUID.fromString),
        hakemusId = Option(UUID.fromString(r.nextString())),
        valitusOPH = Serialization.read[ValitusOPH](r.nextString()),
        valitusHO = Serialization.read[ValitusHO](r.nextString()),
        valitusKHO = Serialization.read[ValitusKHO](r.nextString()),
        luoja = r.nextStringOption(),
        luotu = Option(r.nextTimestamp()).map(_.toLocalDateTime),
        muokkaaja = r.nextStringOption(),
        muokattu = Option(r.nextTimestamp()).map(_.toLocalDateTime)
      )
    )

  def lisaaValitustiedot(valitustiedot: Valitustiedot, luoja: String): Valitustiedot = {
    try {
      val valitusOPH: String = Serialization.write(valitustiedot.valitusOPH)
      val valitusHO: String  = Serialization.write(valitustiedot.valitusHO)
      val valitusKHO: String = Serialization.write(valitustiedot.valitusKHO)

      db.run(
        sql"""
          INSERT INTO valitustiedot(
          hakemus_id,
          valitus_oph,
          valitus_ho,
          valitus_kho,
          luoja
          ) VALUES (
            ${valitustiedot.hakemusId.get.toString}::uuid,
            $valitusOPH::jsonb,
            $valitusHO::jsonb,
            $valitusKHO::jsonb,
            $luoja
          )
          RETURNING
            id,
            hakemus_id,
            valitus_oph,
            valitus_ho,
            valitus_kho,
            luoja,
            luotu,
            muokkaaja,
            muokattu""".as[Valitustiedot],
        "lisaa_valitustiedot"
      ).head
    } catch {
      case e: Exception =>
        LOG.error(s"Valitustietojen tallennus epäonnistui:", e)
        throw new RuntimeException(
          s"Valitustietojen tallennus epäonnistui: ${e.getMessage}",
          e
        )
    }
  }

  def paivitaValitustiedot(id: UUID, valitustiedot: Valitustiedot, muokkaaja: String): Option[Valitustiedot] = {
    try {
      val valitusOPH: String = Serialization.write(valitustiedot.valitusOPH)
      val valitusHO: String  = Serialization.write(valitustiedot.valitusHO)
      val valitusKHO: String = Serialization.write(valitustiedot.valitusKHO)

      db.run(
        sql"""
          UPDATE valitustiedot
          SET
            valitus_oph = $valitusOPH::jsonb,
            valitus_ho = $valitusHO::jsonb,
            valitus_kho = $valitusKHO::jsonb,
            muokkaaja = $muokkaaja
          WHERE
            id = ${id.toString}::uuid
          RETURNING
            id,
            hakemus_id,
            valitus_oph,
            valitus_ho,
            valitus_kho,
            luoja,
            luotu,
            muokkaaja,
            muokattu""".as[Valitustiedot],
        "paivita_valitustiedot"
      ).headOption
    } catch {
      case e: Exception =>
        LOG.error(s"Valitustietojen ${valitustiedot.id} paivitys epäonnistui:", e)
        throw new RuntimeException(
          s"Valitustietojen paivitys epäonnistui: ${e.getMessage}",
          e
        )
    }
  }

  def haeValitustiedot(hakemusOid: HakemusOid): Option[Valitustiedot] = {
    try {
      db.run(
        sql"""
        SELECT id,
          hakemus_id,
          valitus_oph,
          valitus_ho,
          valitus_kho,
          luoja,
          luotu,
          muokkaaja,
          muokattu
        FROM valitustiedot
        WHERE hakemus_id IN
          (SELECT id
          FROM hakemus
          WHERE hakemus_oid = ${hakemusOid.toString})
       """.as[Valitustiedot],
        "hae_valitustiedot"
      ).headOption
    } catch {
      case e: Exception =>
        LOG.error(s"Valitustietojen haku hakemusOid:lla $hakemusOid epäonnistui:", e)
        throw new RuntimeException(
          s"Valitustietojen haku epäonnistui: ${e.getMessage}",
          e
        )
    }
  }
}
