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
import scala.util.{Failure, Success}

@Component
@Repository
class MuistioRepository {
  @Autowired
  val db: TutuDatabase = null

  final val DB_TIMEOUT = 30.seconds
  val LOG: Logger      = LoggerFactory.getLogger(classOf[MuistioRepository])

  implicit val getUUIDResult: GetResult[UUID] =
    GetResult(r => UUID.fromString(r.nextString()))

  implicit val getMuistioResult: GetResult[Muistio] = {
    GetResult(r =>
      Muistio(
        UUID.fromString(r.nextString()),
        UUID.fromString(r.nextString()),
        r.nextString(),
        r.nextTimestamp().toLocalDateTime,
        r.nextString(),
        Option(r.nextTimestamp()).map(_.toLocalDateTime),
        r.nextString(),
        r.nextBoolean(),
        r.nextString()
      )
    )
  }

  /**
   * Tallentaa uuden muistion
   *
   * @param hakemusId
   *   hakemuksen uuid
   * @param hakemuksenOsa
   * @param sisainen
   * @param sisalto
   * @param luoja
   * @return
   *   tallennetun muistion id
   */
  def tallennaMuistio(
    hakemusId: UUID,
    hakemuksenOsa: String,
    sisainen: Boolean,
    sisalto: String,
    luoja: String
  ): UUID = {
    try {
      db.run(
        sql"""
          INSERT INTO muistio (
            hakemus_id,
            sisalto,
            sisainen_huomio,
            hakemuksen_osa,
            luoja
          )
          VALUES (
            ${hakemusId.toString}::uuid,
            $sisalto,
            $sisainen,
            ${hakemuksenOsa}::hakemuksen_osa,
            $luoja
          )
          ON CONFLICT (hakemus_id, hakemuksen_osa, sisainen_huomio)
          DO UPDATE SET
            sisalto = ${sisalto},
            muokkaaja = $luoja
          RETURNING id
        """.as[UUID].head,
        "tallenna_muistio"
      )
    } catch {
      case e: Exception =>
        LOG.error(s"Muistion tallennus epäonnistui: ${e}")
        throw new RuntimeException(
          s"Muistion tallennus epäonnistui: ${e.getMessage}",
          e
        )
    }
  }

  /**
   * Palauttaa yksittäisen muistion
   *
   * @param hakemusId
   *   hakemuksen uuid
   * @param hakemuksenOsa
   * @param sisainen
   * @return
   *   muistio
   */
  def haeMuistio(
    hakemusId: UUID,
    hakemuksenOsa: String,
    sisainen: Boolean
  ): Option[Muistio] = {
    try {
      db.run(
        sql"""
            SELECT
              m.id,
              m.hakemus_id,
              m.sisalto,
              m.luotu,
              m.luoja,
              m.muokattu,
              m.muokkaaja,
              m.sisainen_huomio,
              m.hakemuksen_osa
            FROM
              muistio m
            WHERE
              m.hakemus_id =  ${hakemusId.toString}::uuid
            AND
              m.hakemuksen_osa = ${hakemuksenOsa}::hakemuksen_osa
            AND
              m.sisainen_huomio = ${sisainen}
          """.as[Muistio].headOption,
        "hae_muistio"
      )
    } catch {
      case e: Exception =>
        throw new RuntimeException(
          s"Muistion haku epäonnistui: ${e.getMessage}",
          e
        )
    }
  }

}
