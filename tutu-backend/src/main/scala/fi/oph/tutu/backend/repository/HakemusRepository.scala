package fi.oph.tutu.backend.repository

import org.springframework.beans.factory.annotation.Autowired
import slick.jdbc.GetResult
import org.slf4j.LoggerFactory
import org.springframework.stereotype.{Component, Repository}

import scala.concurrent.duration.DurationInt
import slick.jdbc.PostgresProfile.api.*

import java.util.UUID


@Component
@Repository
class HakemusRepository {
  @Autowired
  val db: TutuDatabase = null

  final val DB_TIMEOUT = 30.seconds
  val LOG = LoggerFactory.getLogger(classOf[HakemusRepository])

    implicit val getUUIDResult: GetResult[UUID] = GetResult(r => UUID.fromString(r.nextString()))

  /**
   * Tallentaa uuden hakemuksen
   *
   * @param hakemusOid hakemuspalvelun hakemuksen oid
   * @return tallennetun hakemuksen id
   */
  def tallennaHakemus(hakemusOid: String, luoja: String): Option[UUID] = {
    try {
      db.run(sql"""
      INSERT INTO hakemus (hakemus_oid, luoja)
      VALUES ($hakemusOid, $luoja)
      RETURNING id
    """.as[UUID].headOption, "tallennaHakemus")
    } catch {
      case e: Exception =>
        LOG.error(s"Failed to save hakemus: ${e.getMessage}", e)
        None
    }
  }
}

