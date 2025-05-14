package fi.oph.tutu.backend.repository

import fi.oph.tutu.backend.domain.HakemusOid
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

  /**
   * Tallentaa uuden hakemuksen
   *
   * @param hakemusOid
   *   hakemuspalvelun hakemuksen oid
   * @return
   *   tallennetun hakemuksen id
   */
  def tallennaHakemus(hakemusOid: HakemusOid, luoja: String): UUID =
    val hakemusOidString = hakemusOid.toString
    try
      db.run(
        sql"""
      INSERT INTO hakemus (hakemus_oid, luoja)
      VALUES ($hakemusOidString, $luoja)
      RETURNING id
    """.as[UUID].head,
        "tallennaHakemus"
      )
    catch {
      case e: Exception =>
        throw new RuntimeException(
          s"Hakemuksen tallennus epäonnistui: ${e.getMessage}",
          e
        )
    }
}
