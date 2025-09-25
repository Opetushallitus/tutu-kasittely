package fi.oph.tutu.backend.service.migration

import fi.oph.tutu.backend.config.migration.ChunkingConfig
import fi.oph.tutu.backend.domain.migration.VanhaTutuMigrationChunk
import fi.oph.tutu.backend.repository.migration.{VanhaTutuMigrationRepository, VanhaTutuRepository}
import fi.oph.tutu.backend.utils.ErrorHandling
import fi.oph.tutu.backend.utils.migration.XmlToJsonConverter
import org.json4s.DefaultFormats
import org.json4s.jackson.Serialization
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.stereotype.{Component, Service}
import scala.util.{boundary, Failure, Success, Try}

/**
 * Palojen käsittelijä, joka muuntaa XML-palat JSON:ksi ja tallentaa ne tietokantaan.
 *
 * Käsittelee migraatiopalat yksitellen:
 * - Validoi palan sisällön ja indeksit
 * - Muuntaa XML-sisällön JSON-objekteiksi
 * - Tallentaa JSON-tiedot vanha_tutu-tauluun
 * - Merkitsee palan käsitellyksi
 *
 * @param vanhaTutuMigrationRepository Repository migraatiopalojen hallintaan
 * @param vanhaTutuRepository Repository lopullisten tietojen tallentamiseen
 * @param chunkingConfig Konfiguraatio palakokojen parametreille
 */
@Component
@Service
class ChunkProcessor(
  vanhaTutuMigrationRepository: VanhaTutuMigrationRepository,
  vanhaTutuRepository: VanhaTutuRepository,
  chunkingConfig: ChunkingConfig
) {
  val LOG: Logger                           = LoggerFactory.getLogger(classOf[ChunkProcessor])
  implicit val formats: DefaultFormats.type = DefaultFormats

  /**
   * Käsittelee yksittäisen migraatiopalan.
   *
   * Validoi palan sisällön ja muuntaa XML:n JSON:ksi, tallentaa lopuksi tietokantaan.
   *
   * @param chunk Käsiteltävä migraatiopala
   * @return Success(luotuRivienMäärä) jos käsittely onnistuu, Failure(exception) muuten
   */
  def processChunk(chunk: VanhaTutuMigrationChunk): Try[Int] = Try {
    LOG.info(s"Käsitellään chunk ${chunk.chunkIndex}/${chunk.totalChunks} (id: ${chunk.id})")

    // Validointi että indexit ovat järkeviä ja xmlChunk ei ole tyhjä
    validateChunk(chunk).get // This will throw if validation fails
    processValidChunk(chunk)
  }

  private def validateChunk(chunk: VanhaTutuMigrationChunk): Try[Unit] = Try {
    if (chunk.chunkIndex <= 0) {
      throw new IllegalArgumentException(
        s"Chunk index must be positive, got: ${chunk.chunkIndex} (chunkId: ${chunk.id})"
      )
    }
    if (chunk.chunkIndex > chunk.totalChunks) {
      throw new IllegalArgumentException(
        s"Chunk index ${chunk.chunkIndex} exceeds total chunks ${chunk.totalChunks} (chunkId: ${chunk.id})"
      )
    }
    if (chunk.xmlChunk.isEmpty) {
      throw new IllegalArgumentException(
        s"Chunk XML content is empty (chunkId: ${chunk.id}, chunkIndex: ${chunk.chunkIndex})"
      )
    }
  }

  private def processValidChunk(chunk: VanhaTutuMigrationChunk): Int = {
    XmlToJsonConverter.convertXmlToJson(chunk.xmlChunk) match {
      case Success(jsonObjects) =>
        LOG.info(s"Chunk ${chunk.chunkIndex}: Muunnettu ${jsonObjects.length} JSON-objektiksi")

        if (jsonObjects.isEmpty) {
          LOG.info(s"Chunk ${chunk.chunkIndex}: Ei dataa käsiteltäväksi")
          0
        } else {
          val createdCount = jsonObjects.map { jsonObj =>
            val jsonString = Serialization.write(jsonObj)

            ErrorHandling.withErrorHandling(
              s"Chunk ${chunk.chunkIndex}: Vanha tutu rivin luonti",
              LOG
            ) {
              val id = vanhaTutuRepository.create(jsonString)
              LOG.debug(s"Chunk ${chunk.chunkIndex}: Luotu vanha_tutu rivi id:llä $id")
              id
            }
          }.length

          LOG.info(s"Chunk ${chunk.chunkIndex}: Luotu onnistuneesti $createdCount riviä vanha_tutu tauluun")
          createdCount
        }

      case Failure(e) =>
        LOG.error(s"Chunk ${chunk.chunkIndex}: XML:n muuntaminen JSON:ksi epäonnistui (chunkId: ${chunk.id})", e)
        throw new RuntimeException(
          s"XML to JSON conversion failed for chunk ${chunk.chunkIndex} (chunkId: ${chunk.id}): ${e.getMessage}",
          e
        )
    }
  }

  def processMigrationChunks(chunks: Seq[VanhaTutuMigrationChunk]): Try[Int] = Try {
    LOG.info(s"Käsitellään ${chunks.length} chunkkia")

    val totalCreated = chunks.foldLeft(0) { (total, chunk) =>
      processChunk(chunk) match {
        case Success(created) =>
          markChunkAsProcessed(chunk).get // This will throw if marking fails
          total + created
        case Failure(e) =>
          LOG.error(s"Chunk ${chunk.chunkIndex} käsittely epäonnistui", e)
          throw e
      }
    }

    LOG.info(s"Käsitelty onnistuneesti ${chunks.length} chunkkia, luotu yhteensä $totalCreated tietuetta")
    totalCreated
  }

  private def markChunkAsProcessed(chunk: VanhaTutuMigrationChunk): Try[Unit] = Try {
    try {
      vanhaTutuMigrationRepository.markChunkAsProcessed(chunk.id)
      LOG.debug(s"Merkitty chunk ${chunk.chunkIndex} käsitellyksi")
    } catch {
      case e: Exception =>
        LOG.error(s"Chunk ${chunk.chunkIndex} merkitseminen käsitellyksi epäonnistui (chunkId: ${chunk.id})", e)
        throw e
    }
  }

  /**
   * Käsittelee migraatiopalat yksitellen tietokannasta.
   *
   * Hakee käsittelemättömiä paloja tietokannasta ja käsittelee ne yksitellen.
   * Mahdollistaa migraation jatkamisen keskeytyksen jälkeen.
   *
   * @param maxChunks Maksimimäärä paloja käsiteltäväksi (0 = ei rajaa)
   * @return Success(luotuRivienMäärä) jos käsittely onnistuu, Failure(exception) muuten
   */
  def processMigrationChunksIndividually(
    maxChunks: Int = chunkingConfig.getMaxChunks
  ): Try[Int] = Try {
    LOG.debug(s"Aloitetaan yksittäisten chunkkien käsittely, max chunkkeja ${
        if (maxChunks > 0) maxChunks else "ei rajaa"
      }")

    var totalCreated    = 0
    var processedChunks = 0

    boundary:
      while (maxChunks == 0 || processedChunks < maxChunks) {
        val chunkOption = vanhaTutuMigrationRepository.getUnprocessedChunk() // Get one chunk at a time

        chunkOption match {
          case Some(chunk) =>
            LOG.debug(s"Käsitellään yksittäinen chunk ${chunk.chunkIndex}/${chunk.totalChunks}")

            processChunk(chunk) match {
              case Success(createdRows) =>
                totalCreated += createdRows
                processedChunks += 1
                LOG.info(
                  s"Käsitelty chunk ${chunk.chunkIndex}/${chunk.totalChunks} (id: ${chunk.id}), luotu $createdRows tietuetta"
                )
                vanhaTutuMigrationRepository.markChunkAsProcessed(chunk.id)
              case Failure(exception) =>
                LOG.error(s"Chunkin ${chunk.chunkIndex} (id: ${chunk.id}) käsittely epäonnistui", exception)
                throw exception // Re-throw to stop processing on error
            }
          case None =>
            LOG.debug("Ei enää käsittelemättömiä chunkeja")
            boundary.break()
        }
      }

    totalCreated
  }

  def cleanupProcessedChunks(): Try[Int] = Try {
    try {
      val deletedCount = vanhaTutuMigrationRepository.deleteProcessedChunks()
      LOG.debug(s"Siivottu $deletedCount käsiteltyä chunkkia migraatiotaulusta")
      deletedCount
    } catch {
      case e: Exception =>
        LOG.error("Käsiteltyjen chunkkien siivous epäonnistui", e)
        throw e
    }
  }

  def getProcessingStats(): Try[Map[String, Any]] = Try {
    try {
      val totalChunks       = vanhaTutuMigrationRepository.getChunkCount()
      val unprocessedChunks = vanhaTutuMigrationRepository.getUnprocessedChunkCount()
      val processedChunks   = totalChunks - unprocessedChunks

      Map(
        "totalChunks"          -> totalChunks,
        "processedChunks"      -> processedChunks,
        "unprocessedChunks"    -> unprocessedChunks,
        "completionPercentage" -> (if (totalChunks > 0) processedChunks * 100.0 / totalChunks else 0.0)
      )
    } catch {
      case e: Exception =>
        LOG.error("Migraation tilastojen haku epäonnistui", e)
        throw e
    }
  }
}
