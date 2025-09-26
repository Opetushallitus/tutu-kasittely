package fi.oph.tutu.backend.repository.migration

import fi.oph.tutu.backend.repository.{BaseResultHandlers, TutuDatabase}
import org.springframework.stereotype.{Component, Repository}
import slick.jdbc.PostgresProfile.api._
import slick.jdbc.GetResult
import scala.concurrent.duration.DurationInt
import org.springframework.beans.factory.annotation.Autowired
import org.slf4j.{Logger, LoggerFactory}

import java.util.UUID

@Component
@Repository
class VanhaTutuRepository extends BaseResultHandlers {
  @Autowired
  val db: TutuDatabase = null

  final private val DB_TIMEOUT = 30.seconds
  val LOG: Logger              = LoggerFactory.getLogger(classOf[VanhaTutuRepository])

  implicit val getVanhaTutuResult: GetResult[String] = GetResult(r => r.nextString())

  def create(dataJson: String): UUID = {
    try {
      val query = sql"""
        INSERT INTO vanha_tutu (data_json)
        VALUES ($dataJson::jsonb)
        RETURNING id
      """.as[UUID].head

      db.run(query, "vanha-tutu-create")
    } catch {
      case e: Exception =>
        LOG.error(s"Vanha tutu tallennus epäonnistui: ${e}")
        throw new RuntimeException(
          s"Vanha tutu tallennus epäonnistui: ${e.getMessage}",
          e
        )
    }
  }

  def get(id: UUID): Option[String] = {
    try {
      val query = sql"""
        SELECT data_json::text
        FROM vanha_tutu
        WHERE id::text = ${id.toString}
      """.as[String].headOption

      db.run(query, "vanha-tutu-get")
    } catch {
      case e: Exception =>
        LOG.error(s"Vanha tutu haku epäonnistui id:llä $id: ${e}")
        throw new RuntimeException(
          s"Vanha tutu haku epäonnistui: ${e.getMessage}",
          e
        )
    }
  }

  def delete(id: UUID): Int = {
    try {
      val query = sqlu"""
        DELETE FROM vanha_tutu
        WHERE id::text = ${id.toString}
      """

      db.run(query, "vanha-tutu-delete")
    } catch {
      case e: Exception =>
        LOG.error(s"Vanha tutu poisto epäonnistui id:llä $id: ${e}")
        throw new RuntimeException(
          s"Vanha tutu poisto epäonnistui: ${e.getMessage}",
          e
        )
    }
  }

  def deleteAll: Int = {
    try {
      val query = sqlu"""
        DELETE FROM vanha_tutu
      """

      db.run(query, "vanha-tutu-delete-all")
    } catch {
      case e: Exception =>
        LOG.error(s"Kaikkien vanha tutu -tietueiden poisto epäonnistui: ${e}")
        throw new RuntimeException(
          s"Kaikkien vanha tutu -tietueiden poisto epäonnistui: ${e.getMessage}",
          e
        )
    }
  }
}
