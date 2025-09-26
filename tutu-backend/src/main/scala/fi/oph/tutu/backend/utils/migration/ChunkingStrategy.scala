package fi.oph.tutu.backend.utils.migration

import fi.oph.tutu.backend.config.migration.ChunkingConfig

/**
 * Yksinkertainen strategia XML-tiedostojen jakamiseen paloihin.
 * Käyttää tiedostokoon perustuvaa heuristiikkaa palakokojen määrittämiseen.
 */
class ChunkingStrategy(chunkingConfig: ChunkingConfig) {

  /**
   * Laskee palakokojen parametrit tiedostokoon perustuen.
   */
  def calculateChunkingParameters(fileSizeBytes: Long): ChunkingParameters = {
    val fileSizeMB  = fileSizeBytes / (1024 * 1024)
    val chunkSize   = chunkingConfig.getChunkSize
    val totalChunks = calculateTotalChunks(fileSizeBytes, chunkSize)

    ChunkingParameters(
      recommendedChunkSize = chunkSize,
      actualChunkSize = chunkSize,
      totalChunks = totalChunks,
      fileSizeMB = fileSizeMB
    )
  }

  /**
   * Laskee palojen kokonaismäärän.
   * Yksinkertaistettu: ei rajoiteta maksimimäärää, koska 2GB tiedostot voivat tarvita useita paloja.
   */
  private def calculateTotalChunks(fileSizeBytes: Long, chunkSize: Int): Int = {
    if (fileSizeBytes == 0) return 0

    // Arvioidaan rivien määrä: 1KB per rivi
    val estimatedRows    = Math.max(1, (fileSizeBytes / 1024).toInt)
    val calculatedChunks = Math.ceil(estimatedRows.toDouble / chunkSize).toInt

    // Ei rajoiteta maksimimäärää - 2GB tiedostot voivat tarvita useita paloja
    calculatedChunks
  }
}

/**
 * Case class containing calculated chunking parameters.
 */
case class ChunkingParameters(
  recommendedChunkSize: Int,
  actualChunkSize: Int,
  totalChunks: Int,
  fileSizeMB: Long
)
