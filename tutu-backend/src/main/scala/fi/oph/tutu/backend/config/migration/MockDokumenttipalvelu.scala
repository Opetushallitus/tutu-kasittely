package fi.oph.tutu.backend.config.migration

import fi.vm.sade.valinta.dokumenttipalvelu.Dokumenttipalvelu
import fi.vm.sade.valinta.dokumenttipalvelu.dto.ObjectEntity
import org.slf4j.LoggerFactory
import org.springframework.context.annotation.Profile
import org.springframework.core.io.ClassPathResource

import java.io.ByteArrayInputStream
import java.time.Instant
import java.util.Collections
import scala.io.Source

@Profile(Array("dev", "test"))
class MockDokumenttipalvelu extends Dokumenttipalvelu("mock-region", "mock-bucket") {
  private val logger         = LoggerFactory.getLogger(getClass)
  private val mockFilePath   = "filemaker-migration/vanha_tutu_m.xml" // 200 tapausta, saa muuttaa pienemmäksi jos tarve
  private val mockXmlContent = {
    val resource = new ClassPathResource(mockFilePath)
    val source   = Source.fromInputStream(resource.getInputStream)
    try {
      source.getLines().mkString("\n").getBytes
    } finally {
      source.close()
    }
  }
  private val contentType = "application/xml"

  /**
   * Retrieves a mock XML file as an ObjectEntity.
   *
   * @param key The identifier for the object to retrieve. In a real implementation, this would be the S3 object key or document ID.
   * @return An ObjectEntity containing the mock XML content and associated metadata.
   */
  override def get(key: String): ObjectEntity = {
    logger.info(s"MockDokumenttipalvelu: Getting file with key $key")
    new ObjectEntity(
      new ByteArrayInputStream(mockXmlContent),
      contentType,
      mockFilePath,
      key,
      mockXmlContent.length.toLong,
      Collections.emptyList[String](),
      Instant.now()
    )
  }
}
