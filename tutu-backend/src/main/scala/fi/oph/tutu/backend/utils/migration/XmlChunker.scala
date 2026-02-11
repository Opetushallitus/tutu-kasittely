package fi.oph.tutu.backend.utils.migration

import fi.oph.tutu.backend.config.migration.ChunkingConfig
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component

import java.io.InputStream
import scala.util.Try

case class XmlChunk(
  chunkIndex: Int,
  totalChunks: Int,
  xmlChunk: String
)

case class ChunkerConfig(
  chunkSize: Int,         // config-arvo ChunkingConfig.getChunkSize
  bufferSize: Int = 8192, // default-arvo tiedostojen lukemiseen
  maxChunks: Int = 3      // default-arvo samanaikaisten palojen määrälle
)

/**
 * XML-tiedostojen stream-pohjainen käsittely paloissa.
 *
 * Jakaa suuret XML-tiedostot paloihin käyttäen StAX-stream-käsittelijää.
 * Optimoitu suurten tiedostojen (jopa 2GB) käsittelemiseen.
 *
 * @param chunkingConfig Konfiguraatio palakokojen määrittämiseen
 */
@Component
class XmlChunker @Autowired() (chunkingConfig: ChunkingConfig) {
  private val LOG: Logger      = LoggerFactory.getLogger(getClass)
  private val chunkingStrategy = new ChunkingStrategy(chunkingConfig)

  /**
   * Jakaa XML-streamin paloihin ja tallentaa ne tietokantaan.
   *
   * Käyttää stream-pohjaista käsittelyä. Jakaa tiedoston
   * konfiguroituun palakokoon perustuen ja kutsuu storeChunk-funktiota
   * jokaiselle palalle.
   *
   * @param inputStream XML-tiedoston stream
   * @param storeChunk Funktio palan tallentamiseen (chunkIndex, totalChunks, xmlChunk)
   * @return Success(palojenMäärä) jos jako onnistuu, Failure(exception) muuten
   */
  def splitXmlStreamIntoChunksAndStore(
    inputStream: InputStream,
    storeChunk: (Int, Int, String) => Unit
  ): Try[Int] = {
    val config = ChunkerConfig(
      chunkSize = chunkingConfig.getChunkSize,
      bufferSize = chunkingConfig.getBufferSize,
      maxChunks = chunkingConfig.getMaxChunks
    )

    StreamProcessor.processXmlStreamAndStore(inputStream, config, chunkingStrategy, storeChunk)
  }

  def validateChunk(chunk: XmlChunk): Try[Boolean] = Try {
    import scala.xml.XML
    try {
      val xml          = XML.loadString(chunk.xmlChunk)
      val hasMetadata  = (xml \\ "METADATA").nonEmpty
      val hasResultSet = (xml \\ "RESULTSET").nonEmpty
      val hasRows      = (xml \\ "ROW").nonEmpty

      if (!hasMetadata || !hasResultSet) {
        LOG.warn(s"Pala ${chunk.chunkIndex} - pakollinen XML-rakenne puuttuu")
        false
      } else if (!hasRows) {
        LOG.debug(s"Pala ${chunk.chunkIndex} - ei sisällä rivejä (tyhjä pala)")
        true
      } else {
        LOG.debug(s"Pala ${chunk.chunkIndex} - validointi onnistui")
        true
      }
    } catch {
      case e: Exception =>
        LOG.error(s"Pala ${chunk.chunkIndex} - validointi epäonnistui: ${e.getMessage}")
        false
    }
  }

}
