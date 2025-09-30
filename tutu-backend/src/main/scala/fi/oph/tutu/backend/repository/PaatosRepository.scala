package fi.oph.tutu.backend.repository

import fi.oph.tutu.backend.domain.{Paatos, Ratkaisutyyppi}
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.{Component, Repository}
import slick.jdbc.GetResult
import slick.jdbc.PostgresProfile.api.*

import java.util.UUID
import scala.concurrent.duration.DurationInt

@Component
@Repository
class PaatosRepository extends BaseResultHandlers {
  @Autowired
  val db: TutuDatabase = null
  val LOG: Logger      = LoggerFactory.getLogger(classOf[PaatosRepository])

  final val DB_TIMEOUT = 30.seconds

  implicit val getPaatosResult: GetResult[Paatos] = GetResult(r =>
    Paatos(
      id = Some(r.nextObject().asInstanceOf[UUID]),
      hakemusId = Some(r.nextObject().asInstanceOf[UUID]),
      ratkaisutyyppi = Option(Ratkaisutyyppi.fromString(r.nextString())),
      seutArviointi = r.nextBoolean(),
      luotu = Some(r.nextTimestamp().toLocalDateTime),
      luoja = Some(r.nextString()),
      muokattu = r.nextTimestampOption().map(_.toLocalDateTime),
      muokkaaja = r.nextStringOption()
    )
  )

  def tallennaPaatos(hakemusId: UUID, paatos: Paatos, luojaTaiMuokkaaja: String): Paatos = {
    val ratkaisutyyppiOrNull = paatos.ratkaisutyyppi.map(_.toString).orNull
    try {
      db.run(
        sql"""
        INSERT INTO paatos (hakemus_id, ratkaisutyyppi, seut_arviointi_tehty, luoja)
        VALUES (${hakemusId.toString}::uuid, $ratkaisutyyppiOrNull::ratkaisutyyppi, ${paatos.seutArviointi}, $luojaTaiMuokkaaja)
        ON CONFLICT (hakemus_id) 
        DO UPDATE SET
          ratkaisutyyppi = $ratkaisutyyppiOrNull::ratkaisutyyppi,
          seut_arviointi_tehty = ${paatos.seutArviointi},
          muokkaaja = $luojaTaiMuokkaaja
        RETURNING id, hakemus_id, ratkaisutyyppi, seut_arviointi_tehty, luotu, luoja, muokattu, muokkaaja
      """.as[Paatos].head,
        "tallenna_paatos"
      )
    } catch {
      case e: Exception =>
        LOG.error(s"Päätöksen tallennus epäonnistui: $e")
        throw new RuntimeException(
          s"Päätöksen tallennus epäonnistui: ${e.getMessage}",
          e
        )
    }
  }

  def haePaatos(hakemusId: UUID): Option[Paatos] = {
    try {
      db.run(
        sql"""
        SELECT id, hakemus_id, ratkaisutyyppi, seut_arviointi_tehty, luotu, luoja, muokattu, muokkaaja
        FROM paatos
        WHERE hakemus_id = ${hakemusId.toString}::uuid
      """.as[Paatos].headOption,
        "hae_paatos"
      )
    } catch {
      case e: Exception =>
        LOG.error(s"Päätöksen haku epäonnistui: $e")
        throw new RuntimeException(
          s"Päätöksen haku epäonnistui: ${e.getMessage}",
          e
        )
    }
  }
}
