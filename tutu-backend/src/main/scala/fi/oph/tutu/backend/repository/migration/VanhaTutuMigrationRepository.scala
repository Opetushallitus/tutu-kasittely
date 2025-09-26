package fi.oph.tutu.backend.repository.migration

import fi.oph.tutu.backend.domain.migration.VanhaTutuMigrationChunk
import fi.oph.tutu.backend.repository.{BaseResultHandlers, TutuDatabase}
import org.springframework.stereotype.{Component, Repository}
import slick.jdbc.PostgresProfile.api._
import slick.jdbc.GetResult
import scala.concurrent.duration.DurationInt
import org.springframework.beans.factory.annotation.Autowired
import org.slf4j.{Logger, LoggerFactory}

import java.time.LocalDateTime
import java.util.UUID
import scala.util.{Failure, Try}

/**
 * Repository migraatiopalojen hallintaan tietokannassa.
 *
 * Hoitaa migraatiopalojen tallentamisen, hakemisen ja merkitsemisen käsitellyiksi.
 * Optimoitu tehokkaaseen palojen käsittelyyn ja migraation jatkamiseen.
 */
@Component
@Repository
class VanhaTutuMigrationRepository extends BaseResultHandlers {
  @Autowired
  val db: TutuDatabase = null

  final private val DB_TIMEOUT = 30.seconds
  val LOG: Logger              = LoggerFactory.getLogger(classOf[VanhaTutuMigrationRepository])

  implicit val getVanhaTutuMigrationChunkResult: GetResult[VanhaTutuMigrationChunk] = GetResult(r =>
    VanhaTutuMigrationChunk(
      id = UUID.fromString(r.nextString()),
      chunkIndex = r.nextInt(),
      totalChunks = r.nextInt(),
      xmlChunk = r.nextString(),
      processed = r.nextBoolean(),
      createdAt = r.nextTimestamp().toLocalDateTime,
      processedAt = r.nextTimestampOption().map(_.toLocalDateTime)
    )
  )

  def createChunk(chunkIndex: Int, totalChunks: Int, xmlChunk: String): Try[UUID] = Try {
    val query = sql"""
      INSERT INTO vanha_tutu_migration (chunk_index, total_chunks, xml_chunk)
      VALUES ($chunkIndex, $totalChunks, $xmlChunk)
      RETURNING id
    """.as[UUID].head

    db.run(query, "vanha-tutu-migration-create-chunk")
  } recoverWith { case e: Exception =>
    LOG.error(s"Chunk tallennus epäonnistui: ${e.getMessage}", e)
    Failure(new RuntimeException(s"Chunk tallennus epäonnistui: ${e.getMessage}", e))
  }

  /**
   * Hakee seuraavan käsittelemättömän palan tietokannasta.
   *
   * Hakee palan, joka on merkitty käsittelemättömäksi ja järjestää
   * chunk_index:n mukaan varmistaakseen järjestyksen.
   *
   * @return Some(chunk) jos löytyy käsittelemätön pala, None jos ei ole
   */
  def getUnprocessedChunk(): Option[VanhaTutuMigrationChunk] = {
    try {
      val query = sql"""
        SELECT id, chunk_index, total_chunks, xml_chunk, processed, created_at, processed_at
        FROM vanha_tutu_migration
        WHERE processed = FALSE
        ORDER BY chunk_index
        LIMIT 1
      """.as[VanhaTutuMigrationChunk]

      db.run(query, "vanha-tutu-migration-get-single-unprocessed").headOption
    } catch {
      case e: Exception =>
        LOG.error(s"Yksittäisen käsittelemättömän chunkin haku epäonnistui: ${e}")
        throw new RuntimeException(
          s"Yksittäisen käsittelemättömän chunkin haku epäonnistui: ${e.getMessage}",
          e
        )
    }
  }

  def markChunkAsProcessed(chunkId: UUID): Int = {
    try {
      val query = sqlu"""
        UPDATE vanha_tutu_migration
        SET processed = TRUE, processed_at = CURRENT_TIMESTAMP
        WHERE id = ${chunkId.toString}::uuid
      """

      db.run(query, "vanha-tutu-migration-mark-processed")
    } catch {
      case e: Exception =>
        LOG.error(s"Vanha tutu migraation chunk merkitseminen käsitellyksi epäonnistui id:llä $chunkId: ${e}")
        throw new RuntimeException(
          s"Vanha tutu migraation chunk merkitseminen käsitellyksi epäonnistui: ${e.getMessage}",
          e
        )
    }
  }

  def deleteProcessedChunks(): Int = {
    try {
      val query = sqlu"""
        DELETE FROM vanha_tutu_migration
        WHERE processed = TRUE
      """

      db.run(query, "vanha-tutu-migration-delete-processed")
    } catch {
      case e: Exception =>
        LOG.error(s"Käsiteltyjen vanha tutu migraation chunk poisto epäonnistui: ${e}")
        throw new RuntimeException(
          s"Käsiteltyjen vanha tutu migraation chunk poisto epäonnistui: ${e.getMessage}",
          e
        )
    }
  }

  def deleteAllChunks(): Int = {
    try {
      val query = sqlu"""
        DELETE FROM vanha_tutu_migration
      """

      db.run(query, "vanha-tutu-migration-delete-all")
    } catch {
      case e: Exception =>
        LOG.error(s"Kaikkien vanha tutu migraation chunk poisto epäonnistui: ${e}")
        throw new RuntimeException(
          s"Kaikkien vanha tutu migraation chunk poisto epäonnistui: ${e.getMessage}",
          e
        )
    }
  }

  def getChunkCount(): Int = {
    try {
      val query = sql"""
        SELECT COUNT(*) FROM vanha_tutu_migration
      """.as[Int].head

      db.run(query, "vanha-tutu-migration-count")
    } catch {
      case e: Exception =>
        LOG.error(s"Vanha tutu migraation chunk laskenta epäonnistui: ${e}")
        throw new RuntimeException(
          s"Vanha tutu migraation chunk laskenta epäonnistui: ${e.getMessage}",
          e
        )
    }
  }

  def getUnprocessedChunkCount(): Int = {
    try {
      val query = sql"""
        SELECT COUNT(*) FROM vanha_tutu_migration WHERE processed = FALSE
      """.as[Int].head

      db.run(query, "vanha-tutu-migration-unprocessed-count")
    } catch {
      case e: Exception =>
        LOG.error(s"Käsittelemättömien vanha tutu migraation chunk laskenta epäonnistui: ${e}")
        throw new RuntimeException(
          s"Käsittelemättömien vanha tutu migraation chunk laskenta epäonnistui: ${e.getMessage}",
          e
        )
    }
  }

  def updateTotalChunksForAllChunks(totalChunks: Int): Int = {
    try {
      val query = sqlu"""
        UPDATE vanha_tutu_migration
        SET total_chunks = $totalChunks
        WHERE total_chunks = 0
      """

      db.run(query, "vanha-tutu-migration-update-total-chunks")
    } catch {
      case e: Exception =>
        LOG.error(s"Vanha tutu migraation chunk total_chunks päivitys epäonnistui: ${e}")
        throw new RuntimeException(
          s"Vanha tutu migraation chunk total_chunks päivitys epäonnistui: ${e.getMessage}",
          e
        )
    }
  }
}
