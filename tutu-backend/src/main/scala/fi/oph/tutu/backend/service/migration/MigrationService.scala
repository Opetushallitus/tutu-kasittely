package fi.oph.tutu.backend.service.migration

import fi.oph.tutu.backend.config.migration.ChunkingConfig
import fi.oph.tutu.backend.domain.migration.VanhaTutuMigrationChunk
import fi.oph.tutu.backend.repository.migration.{VanhaTutuMigrationRepository, VanhaTutuRepository}
import fi.oph.tutu.backend.utils.ErrorHandling
import fi.oph.tutu.backend.utils.migration.{XmlChunk, XmlChunker}
import fi.vm.sade.valinta.dokumenttipalvelu.Dokumenttipalvelu
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.stereotype.{Component, Service}
import scala.io.Source
import scala.util.{Failure, Success, Try}
import java.nio.charset.StandardCharsets
import org.json4s.DefaultFormats
import org.json4s.jackson.Serialization

/**
 * Migraatiopalvelu, joka käsittelee suuria XML-tiedostoja FileMakerista uuteen järjestelmään.
 *
 * Käyttää stream-pohjaista käsittelyä suurten tiedostojen (jopa 2GB) käsittelemiseen.
 *
 * Migraation vaiheet:
 * 1. Hakee XML-tiedoston dokumenttipalvelusta
 * 2. Jakaa tiedoston paloihin stream-pohjaisesti
 * 3. Tallentaa palat migraatiotauluun käsittelyä varten
 * 4. Käsittelee palat yksitellen XML:stä JSON:ksi
 * 5. Tallentaa lopulliset tiedot vanha_tutu-tauluun
 * 6. Siivoaa käsitellyt palat
 *
 * @param dokumenttipalvelu Dokumenttipalvelu tiedostojen hakemiseen
 * @param vanhaTutuRepository Repository lopullisten tietojen tallentamiseen
 * @param vanhaTutuMigrationRepository Repository migraatiopalojen hallintaan
 * @param chunkProcessor Palvelu yksittäisten palojen käsittelyyn
 * @param xmlChunker Palvelu XML:n jakamiseen paloihin
 * @param chunkingConfig Konfiguraatio palakokojen parametreille
 */
@Component
@Service
class MigrationService(
  dokumenttipalvelu: Dokumenttipalvelu,
  vanhaTutuRepository: VanhaTutuRepository,
  vanhaTutuMigrationRepository: VanhaTutuMigrationRepository,
  chunkProcessor: ChunkProcessor,
  xmlChunker: XmlChunker,
  chunkingConfig: ChunkingConfig
) {
  val LOG: Logger                           = LoggerFactory.getLogger(classOf[MigrationService])
  implicit val formats: DefaultFormats.type = DefaultFormats

  /**
   * Orkestroi koko migraatioprosessin annetulle tiedostolle.
   *
   * Käsittelee koko migraation elinkaaren:
   * - Validoi syöteparametrit
   * - Siivoaa olemassa olevat tiedot (idempotenssi)
   * - Hakee XML-tiedoston dokumenttipalvelusta
   * - Jakaa tiedoston paloihin stream-pohjaisesti
   * - Käsittelee palat yksitellen
   * - Siivoaa käsitellyt palat valmistumisen jälkeen
   *
   * @param key S3-avain tai dokumenttitunniste migroitavalle XML-tiedostolle
   * @return Success(Unit) jos migraatio onnistuu, Failure(exception) muuten
   * @throws IllegalArgumentException jos key on null tai tyhjä
   * @throws RuntimeException jos mikä tahansa migraation vaihe epäonnistuu
   */
  def orchestrateMigration(key: String): Try[Unit] = Try {
    // Input validation
    if (key == null || key.trim.isEmpty) {
      throw new IllegalArgumentException("Migration key cannot be null or empty")
    }

    cleanupExistingData() // Tulevaisuudessa voi olla kaksi eri XML tiedostoa yhden sijaan ja tämä pitää poistaa

    // XML File to chunks
    val fileEntity = fetchFileLocal(key) // fetchFile(key)
    logFileInfo(fileEntity)

    try {
      // Ensure the stream is reset before processing
      fileEntity.entity.reset()
      val chunkCount = splitFileIntoChunksAndStore(fileEntity.entity)

      // Update total chunks count for all chunks after they are created
      vanhaTutuMigrationRepository.updateTotalChunksForAllChunks(chunkCount)

      // Process XML chunks
      val batchSize = chunkingConfig.getChunkSize
      val maxChunks = chunkingConfig.getMaxChunks
      chunkProcessor.processMigrationChunksIndividually(maxChunks = maxChunks) match {
        case Success(totalCreated) =>
          LOG.info(s"Käsitelty onnistuneesti kaikki palat, luotu yhteensä $totalCreated tietuetta")
        case Failure(exception) =>
          LOG.error("Palojen käsittely epäonnistui", exception)
          throw exception
      }

      // Cleanup migration table after processing
      chunkProcessor.cleanupProcessedChunks() match {
        case Success(deletedCount) =>
          LOG.info(s"Siivottu $deletedCount käsiteltyä palaa")
        case Failure(exception) =>
          LOG.error("Käsiteltyjen palojen siivous epäonnistui", exception)
      }
    } catch {
      case e: Exception =>
        LOG.error("Virhe migraation käsittelyssä", e)
        throw e
    } finally {
      // Ensure resource cleanup even if reset() or other operations fail
      try {
        fileEntity.entity.close()
        LOG.debug("Tiedostoresurssi suljettu onnistuneesti")
      } catch {
        case e: Exception =>
          LOG.warn("Virhe tiedostoresurssin sulkemisessa", e)
      }
    }
  }

  private def cleanupExistingData(): Unit = {
    ErrorHandling.withErrorHandling("Olemassa olevien rivien poisto", LOG) {
      val deletedCount = vanhaTutuRepository.deleteAll
      LOG.info(s"Poistettu $deletedCount riviä vanha_tutu taulusta")

      val deletedChunks = vanhaTutuMigrationRepository.deleteAllChunks()
      LOG.info(s"Poistettu $deletedChunks chunkkia vanha_tutu_migration taulusta")
    }
  }

  private def fetchFile(fileKey: String) = {
    try {
      val fileEntity = dokumenttipalvelu.get(fileKey)
      LOG.info(
        s"Tiedosto haettu onnistuneesti: key=$fileKey, tiedosto=${fileEntity.fileName}, koko=${fileEntity.contentLength} tavua"
      )
      fileEntity
    } catch {
      case e: Exception =>
        LOG.error(s"Tiedoston haku epäonnistui: key=$fileKey", e)
        throw new RuntimeException(s"Tiedoston haku epäonnistui avaimella '$fileKey': ${e.getMessage}", e)
    }
  }

  private def fetchFileLocal(fileKey: String) = {
    fi.vm.sade.valinta.dokumenttipalvelu.dto.ObjectEntity(
      new java.io.ByteArrayInputStream(
        scala.io.Source
          .fromFile(fileKey)
          .getLines()
          .mkString("\n")
          .getBytes(java.nio.charset.StandardCharsets.UTF_8)
      ),
      null,
      null,
      null,
      null,
      null,
      null
    )
  }

  private def logFileInfo(fileEntity: fi.vm.sade.valinta.dokumenttipalvelu.dto.ObjectEntity): Unit = {
    LOG.info(
      s"Tiedoston käsittely aloitettu: " +
        s"tiedosto=${fileEntity.fileName}, " +
        s"koko=${fileEntity.contentLength} tavua"
    )
  }

  private def splitFileIntoChunksAndStore(inputStream: java.io.InputStream): Int = {
    xmlChunker.splitXmlStreamIntoChunksAndStore(inputStream, storeChunk) match {
      case Success(chunkCount) =>
        LOG.info(s"XML jaettu ${chunkCount} palaan ja tallennettu tietokantaan")
        chunkCount
      case Failure(exception) =>
        LOG.error("XML-tiedoston jako paloihin ja tallentaminen epäonnistui", exception)
        throw exception
    }
  }

  private def storeChunk(chunk: XmlChunk): Unit = {
    vanhaTutuMigrationRepository.createChunk(
      chunk.chunkIndex,
      chunk.totalChunks,
      chunk.xmlChunk
    ) match {
      case scala.util.Success(chunkId) =>
        LOG.debug(s"Tallennettu pala ${chunk.chunkIndex}/${chunk.totalChunks} id:llä: $chunkId")
      case scala.util.Failure(exception) =>
        LOG.error(s"Palan ${chunk.chunkIndex} tallennus epäonnistui", exception)
        throw exception
    }
  }

  private def storeChunk(chunkIndex: Int, totalChunks: Int, xmlChunk: String): Unit = {
    vanhaTutuMigrationRepository.createChunk(chunkIndex, totalChunks, xmlChunk) match {
      case scala.util.Success(chunkId) =>
        LOG.debug(s"Tallennettu pala ${chunkIndex}/${totalChunks} id:llä: $chunkId")
      case scala.util.Failure(exception) =>
        LOG.error(s"Palan ${chunkIndex} tallennus epäonnistui", exception)
        throw exception
    }
  }

  def getMigrationStats(): Try[Map[String, Any]] = Try {
    chunkProcessor.getProcessingStats().get
  }

  /**
   * Jatkaa keskeytynyttä migraatiota käsittelemällä jäljellä olevat palat.
   *
   * Hyödyllinen kun migraatio keskeytyy virheen takia ja halutaan jatkaa
   * siitä mihin jäätiin. Käsittelee vain käsittelemättömät palat.
   *
   * @return Success(luotuRivienMäärä) jos jatkaminen onnistuu, Failure(exception) muuten
   */
  def resumeMigration(): Try[Int] = Try {
    LOG.info("Jatketaan migraatiota käsittelemällä jäljellä olevat palat")
    val maxChunks = chunkingConfig.getMaxChunks
    chunkProcessor.processMigrationChunksIndividually(maxChunks = maxChunks) match {
      case Success(created) =>
        LOG.info(s"Migraatio jatkettu, luotu $created lisätietuetta")
        created
      case Failure(exception) =>
        LOG.error("Migraation jatkaminen epäonnistui", exception)
        throw exception
    }
  }
}
