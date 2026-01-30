package fi.oph.tutu.backend.repository.migration

import fi.oph.tutu.backend.domain.DBFilemakerEntry
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

  val LOG: Logger = LoggerFactory.getLogger(classOf[VanhaTutuRepository])

  implicit val getFilemakerEntryResult: GetResult[DBFilemakerEntry] =
    GetResult(r =>
      DBFilemakerEntry(
        r.nextString(),
        r.nextString()
      )
    )

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

  def get(id: UUID): Option[DBFilemakerEntry] = {
    try {
      val query = sql"""
        SELECT id, data_json::text
        FROM vanha_tutu
        WHERE id::text = ${id.toString}
      """.as[DBFilemakerEntry].headOption

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

  def list(pageNum: Int): Seq[DBFilemakerEntry] = {
    val PAGE_SIZE = 20
    val offset    = (pageNum - 1) * PAGE_SIZE // pageNum alkaa 1:stä
    try {
      val query = sql"""
        SELECT id, data_json::text
        FROM vanha_tutu
        ORDER BY data_json->>'Hakemus kirjattu' DESC
        OFFSET ${offset}
        LIMIT ${PAGE_SIZE}
      """.as[DBFilemakerEntry]

      db.run(query, "vanha-tutu-list")
    } catch {
      case e: Exception =>
        LOG.error(s"Vanha tutu listaus epäonnistui: ${e}")
        throw new RuntimeException(
          s"Vanha tutu listaus epäonnistui: ${e.getMessage}",
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
