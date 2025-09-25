package fi.oph.tutu.backend.config.migration

import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.stereotype.Component

@Component
@ConfigurationProperties(prefix = "tutu.migration.chunking")
class ChunkingConfig {
  var chunkSize: Int      = 100   // from config or default to 100
  var maxChunks: Int      = 10    // from config or default to 10
  var environment: String = "dev" // from config or default to dev

  def isProduction: Boolean = environment.toLowerCase == "prod"

  // Use configuration values directly from properties files
  def getChunkSize: Int = chunkSize

  def getMaxChunks: Int = maxChunks

  def getBufferSize: Int = if (isProduction) 65536 else 32768 // 64KB vs 32KB

}
