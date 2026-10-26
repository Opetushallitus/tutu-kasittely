package fi.oph.tutu.backend.repository

import fi.oph.tutu.backend.domain.*
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.{Component, Repository}
import reactor.core.publisher.Flux
import scala.jdk.CollectionConverters.*
import slick.jdbc.GetResult
import slick.jdbc.PostgresProfile.api.*

import java.util.UUID

@Component
@Repository
class YkViestiAiheRepository extends BaseResultHandlers {
  @Autowired
  val db: TutuDatabase = null
  val LOG: Logger      = LoggerFactory.getLogger(classOf[YkViestiAiheRepository])

  implicit val getYkViestiAiheResult: GetResult[YkViestiAihe] =
    GetResult(r =>
      YkViestiAihe(
        id = r.nextObject().asInstanceOf[UUID],
        avain = r.nextString()
      )
    )

  def haeYkViestinAiheet(): Seq[YkViestiAihe] =
    try {
      val action = sql"""
  SELECT id, avain
  FROM yk_viesti_aihe
""".as[YkViestiAihe]

      Flux
        .from(db.db.stream(action))
        .collectList()
        .block(java.time.Duration.ofMillis(db.timeout.toMillis))
        .asScala
        .toSeq
    } catch {
      case e: Exception =>
        LOG.error("Yhteisen käsittelyn viestien aiheiden haku epäonnistui", e)
        throw e
    }

}
