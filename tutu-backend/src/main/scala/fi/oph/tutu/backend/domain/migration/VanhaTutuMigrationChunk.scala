package fi.oph.tutu.backend.domain.migration

import java.time.LocalDateTime
import java.util.UUID

/**
 * Migraatiopalan tietomalli.
 *
 * Edustaa yhtä palaa suuresta XML-tiedostosta, joka on jaettu
 * käsiteltäväksi.
 *
 * @param id Palan yksilöllinen tunniste
 * @param chunkIndex Palan järjestysnumero (1-pohjainen)
 * @param totalChunks Palojen kokonaismäärä tiedostossa
 * @param xmlChunk XML-sisältö tässä palassa
 * @param processed Onko pala käsitelty (oletus: false)
 * @param createdAt Milloin pala luotiin
 * @param processedAt Milloin pala käsiteltiin (jos käsitelty)
 */
case class VanhaTutuMigrationChunk(
  id: UUID,
  chunkIndex: Int,
  totalChunks: Int,
  xmlChunk: String,
  processed: Boolean = false,
  createdAt: LocalDateTime,
  processedAt: Option[LocalDateTime] = None
)
