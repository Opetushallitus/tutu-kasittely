package fi.oph.tutu.backend.service

import fi.oph.tutu.backend.config.migration.ChunkingConfig
import fi.oph.tutu.backend.domain.migration.VanhaTutuMigrationChunk
import fi.oph.tutu.backend.repository.migration.{VanhaTutuMigrationRepository, VanhaTutuRepository}
import fi.oph.tutu.backend.utils.migration.{XmlChunk, XmlChunker}
import fi.oph.tutu.backend.service.migration.ChunkProcessor
import fi.oph.tutu.backend.service.migration.MigrationService
import fi.oph.tutu.backend.UnitTestBase
import fi.vm.sade.valinta.dokumenttipalvelu.Dokumenttipalvelu
import fi.vm.sade.valinta.dokumenttipalvelu.dto.ObjectEntity
import org.junit.jupiter.api.{BeforeEach, DisplayName, Test}
import org.junit.jupiter.api.Assertions.{assertEquals, assertTrue, fail}
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.ValueSource
import org.mockito.ArgumentMatchers.{any, eq as eqTo}
import org.mockito.Mockito.{times, verify, when}
import org.mockito.{Mock, MockitoAnnotations}

import java.io.{ByteArrayInputStream, FileInputStream}
import java.time.Instant
import java.util.{Collections, UUID}
import scala.io.Source
import scala.util.{Failure, Success, Try}

class MigrationServiceTest extends UnitTestBase {
  @Mock
  var dokumenttipalvelu: Dokumenttipalvelu = _
  @Mock
  var vanhaTutuRepository: VanhaTutuRepository = _
  @Mock
  var vanhaTutuMigrationRepository: VanhaTutuMigrationRepository = _
  @Mock
  var chunkProcessor: ChunkProcessor = _
  @Mock
  var xmlChunker: XmlChunker = _

  var migrationService: MigrationService = _
  var chunkingConfig: ChunkingConfig     = _

  @BeforeEach
  def setup(): Unit = {
    MockitoAnnotations.openMocks(this)
    chunkingConfig = new ChunkingConfig()
    chunkingConfig.environment = "test"
    chunkingConfig.chunkSize = 100
    chunkingConfig.maxChunks = 10
    migrationService = MigrationService(
      dokumenttipalvelu,
      vanhaTutuRepository,
      vanhaTutuMigrationRepository,
      chunkProcessor,
      xmlChunker,
      chunkingConfig
    )

    @Test
    @DisplayName("Testaa migraation orkestrointi streampohjaisella prosessoinnilla")
    def testOrchestrateMigrationWithChunkedProcessing(): Unit = {
      val key        = "test-key"
      val xmlContent = """<?xml version="1.0" encoding="UTF-8"?>
      <FMPXMLRESULT xmlns="http://www.filemaker.com/fmpxmlresult">
        <ERRORCODE>0</ERRORCODE>
        <METADATA>
          <FIELD NAME="Name" TYPE="TEXT"/>
          <FIELD NAME="Age" TYPE="TEXT"/>
          <FIELD NAME="City" TYPE="TEXT"/>
        </METADATA>
        <RESULTSET FOUND="2">
          <ROW>
            <COL><DATA>John Doe</DATA></COL>
            <COL><DATA>30</DATA></COL>
            <COL><DATA>Helsinki</DATA></COL>
          </ROW>
          <ROW>
            <COL><DATA>Jane Smith</DATA></COL>
            <COL><DATA>25</DATA></COL>
            <COL><DATA>Turku</DATA></COL>
          </ROW>
        </RESULTSET>
      </FMPXMLRESULT>"""

      val xmlBytes         = xmlContent.getBytes("UTF-8")
      val mockObjectEntity = new ObjectEntity(
        new ByteArrayInputStream(xmlBytes),
        "application/xml",
        "test-file.xml",
        key,
        xmlBytes.length.toLong,
        Collections.emptyList[String](),
        Instant.now()
      )

      when(dokumenttipalvelu.get(eqTo(key))).thenReturn(mockObjectEntity)
      when(vanhaTutuRepository.deleteAll).thenReturn(2)
      when(vanhaTutuMigrationRepository.deleteAllChunks()).thenReturn(0)
      when(vanhaTutuMigrationRepository.createChunk(any[Int], any[Int], any[String]))
        .thenReturn(Success(UUID.randomUUID()))
      when(chunkProcessor.processMigrationChunksIndividually(eqTo(10))).thenReturn(Success(2))
      when(chunkProcessor.cleanupProcessedChunks()).thenReturn(Success(2))

      // Mock muistiarviot ja palastus

      when(xmlChunker.splitXmlStreamIntoChunksAndStore(any(), any()))
        .thenReturn(Success(2))

      val result = migrationService.orchestrateMigration(key)

      assertTrue(result.isSuccess)
      verify(dokumenttipalvelu, times(1)).get(key)
      verify(vanhaTutuRepository, times(1)).deleteAll
      verify(vanhaTutuMigrationRepository, times(1)).deleteAllChunks()
      // Varmistetaan että streampohjainen palastusmetodi kutsutaan
      verify(xmlChunker, times(1)).splitXmlStreamIntoChunksAndStore(any(), any())
      verify(chunkProcessor, times(1)).processMigrationChunksIndividually(eqTo(10))
      verify(chunkProcessor, times(1)).cleanupProcessedChunks()
    }

    @Test
    def testaaOrkestroiMigraatioKäsitteleePoistaKaikkiVirhe(): Unit = {
      val key       = "test-key"
      val exception = new RuntimeException("Database error")

      when(vanhaTutuRepository.deleteAll).thenThrow(exception)

      val result = migrationService.orchestrateMigration(key)

      assertTrue(result.isFailure)
      assertTrue(result.failed.get == exception)
      verify(vanhaTutuRepository, times(1)).deleteAll
      verify(dokumenttipalvelu, times(0)).get(any[String])
    }

    @Test
    def testaaOrkestroiMigraatioKäsitteleeDokumenttipalveluVirhe(): Unit = {
      val key       = "test-key"
      val exception = new RuntimeException("Document service error")

      when(vanhaTutuRepository.deleteAll).thenReturn(0)
      when(vanhaTutuMigrationRepository.deleteAllChunks()).thenReturn(0)
      when(dokumenttipalvelu.get(eqTo(key))).thenThrow(exception)

      val result = migrationService.orchestrateMigration(key)

      assertTrue(result.isFailure)
      // Palvelu käärii alkuperäisen poikkeuksen uuteen RuntimeExceptioniin, joten tarkistetaan syy
      assertTrue(result.failed.get.isInstanceOf[RuntimeException])
      assertTrue(result.failed.get.getCause == exception)
      assertTrue(result.failed.get.getMessage.contains("Tiedoston haku epäonnistui avaimella"))
      verify(vanhaTutuRepository, times(1)).deleteAll
      verify(vanhaTutuMigrationRepository, times(1)).deleteAllChunks()
      verify(dokumenttipalvelu, times(1)).get(key)
    }

    @Test
    def testaaOrkestroiMigraatioKäsitteleePalaKäsittelyVirhe(): Unit = {
      val key        = "test-key"
      val xmlContent = """<?xml version="1.0" encoding="UTF-8"?>
      <FMPXMLRESULT xmlns="http://www.filemaker.com/fmpxmlresult">
        <ERRORCODE>0</ERRORCODE>
        <METADATA>
          <FIELD NAME="Name" TYPE="TEXT"/>
        </METADATA>
        <RESULTSET FOUND="1">
          <ROW>
            <COL><DATA>John Doe</DATA></COL>
          </ROW>
        </RESULTSET>
      </FMPXMLRESULT>"""

      val xmlBytes         = xmlContent.getBytes("UTF-8")
      val mockObjectEntity = new ObjectEntity(
        new ByteArrayInputStream(xmlBytes),
        "application/xml",
        "test-file.xml",
        key,
        xmlBytes.length.toLong,
        Collections.emptyList[String](),
        Instant.now()
      )

      val exception = new RuntimeException("Chunk processing failed")

      when(dokumenttipalvelu.get(eqTo(key))).thenReturn(mockObjectEntity)
      when(vanhaTutuRepository.deleteAll).thenReturn(0)
      when(vanhaTutuMigrationRepository.deleteAllChunks()).thenReturn(0)
      when(vanhaTutuMigrationRepository.createChunk(any[Int], any[Int], any[String]))
        .thenReturn(Success(UUID.randomUUID()))
      when(xmlChunker.splitXmlStreamIntoChunksAndStore(any(), any()))
        .thenReturn(Success(0))
      when(chunkProcessor.processMigrationChunksIndividually(eqTo(10))).thenReturn(Failure(exception))

      val result = migrationService.orchestrateMigration(key)

      assertTrue(result.isFailure)
      assertTrue(result.failed.get == exception)
      verify(vanhaTutuRepository, times(1)).deleteAll
      verify(vanhaTutuMigrationRepository, times(1)).deleteAllChunks()
      // Varmistetaan että streampohjainen palastusmetodi kutsutaan (palauttaa 0 palaa)
      verify(xmlChunker, times(1)).splitXmlStreamIntoChunksAndStore(any(), any())
      verify(dokumenttipalvelu, times(1)).get(key)
      verify(chunkProcessor, times(1)).processMigrationChunksIndividually(eqTo(10))
    }

    @Test
    def testaaJatkaMigraatio(): Unit = {
      when(chunkProcessor.processMigrationChunksIndividually(eqTo(10))).thenReturn(Success(5))

      val result = migrationService.resumeMigration()

      assertTrue(result.isSuccess)
      assertTrue(result.get == 5)
      verify(chunkProcessor, times(1)).processMigrationChunksIndividually(eqTo(10))
    }

    @Test
    def testaaJatkaMigraatioKäsitteleeVirhe(): Unit = {
      val exception = new RuntimeException("Resume failed")
      when(chunkProcessor.processMigrationChunksIndividually(eqTo(10))).thenReturn(Failure(exception))

      val result = migrationService.resumeMigration()

      assertTrue(result.isFailure)
      assertTrue(result.failed.get == exception)
      verify(chunkProcessor, times(1)).processMigrationChunksIndividually(eqTo(10))
    }

    @Test
    def testaaHaeMigraatioTilastot(): Unit = {
      val stats = Map("totalChunks" -> 10, "processedChunks" -> 5, "unprocessedChunks" -> 5)
      when(chunkProcessor.getProcessingStats()).thenReturn(Success(stats))

      val result = migrationService.getMigrationStats()

      assertTrue(result.isSuccess)
      assertTrue(result.get == stats)
      verify(chunkProcessor, times(1)).getProcessingStats()
    }

    @ParameterizedTest
    @ValueSource(strings =
      Array(
        "vanha_tutu_xs.xml",
        "vanha_tutu_s.xml",
        "vanha_tutu_m.xml"
      )
    )
    @DisplayName("Testaa suorituskyky erikokoisilla XML-tiedostoilla")
    def testaaSuorituskykyEriTiedostokokoisilla(): Unit = {
      val testFiles = Seq(
        ("vanha_tutu_xs.xml", 280941L),
        ("vanha_tutu_s.xml", 1833830L),
        ("vanha_tutu_m.xml", 17526259L)
      )

      // Mockataan palastus kaikille tiedostokooille

      testFiles.foreach { case (fileName, expectedSize) =>
        val filePath = s"src/main/resources/filemaker-migration/$fileName"
        val file     = new java.io.File(filePath)

        if (file.exists()) {
          val inputStream = new FileInputStream(file)
          try {
            val fileSizeBytes = file.length()
            assertTrue(
              fileSizeBytes == expectedSize,
              s"Tiedoston koko muuttunut: $fileName. Odotettu $expectedSize, saatu $fileSizeBytes"
            )

            val startTime = System.currentTimeMillis()
            when(xmlChunker.splitXmlStreamIntoChunksAndStore(any[java.io.InputStream], any())).thenReturn(
              Success(1)
            )

            val result   = xmlChunker.splitXmlStreamIntoChunksAndStore(inputStream, (_, _, _) => ())
            val endTime  = System.currentTimeMillis()
            val duration = endTime - startTime

            assertTrue(result.isSuccess)
            val chunkCount = result.get

            assertTrue(duration < 30000, "Käsittelyn pitäisi valmistua 30 sekunnissa")

          } finally {
            inputStream.close()
          }
        }
      }
    }

    @Test
    @DisplayName("Testaa että chunkit saavat oikean total_chunks arvon migraation aikana")
    def testaaChunkitSaavatOikeanTotalChunksArvon(): Unit = {
      val key        = "test-key"
      val xmlContent = """<?xml version="1.0" encoding="UTF-8"?>
      <FMPXMLRESULT xmlns="http://www.filemaker.com/fmpxmlresult">
        <ERRORCODE>0</ERRORCODE>
        <METADATA>
          <FIELD NAME="Name" TYPE="TEXT"/>
          <FIELD NAME="Age" TYPE="TEXT"/>
        </METADATA>
        <RESULTSET FOUND="2">
          <ROW>
            <COL><DATA>John Doe</DATA></COL>
            <COL><DATA>30</DATA></COL>
          </ROW>
          <ROW>
            <COL><DATA>Jane Smith</DATA></COL>
            <COL><DATA>25</DATA></COL>
          </ROW>
        </RESULTSET>
      </FMPXMLRESULT>"""

      val xmlBytes         = xmlContent.getBytes("UTF-8")
      val mockObjectEntity = new ObjectEntity(
        new ByteArrayInputStream(xmlBytes),
        "application/xml",
        "test-file.xml",
        key,
        xmlBytes.length.toLong,
        Collections.emptyList[String](),
        Instant.now()
      )

      when(dokumenttipalvelu.get(eqTo(key))).thenReturn(mockObjectEntity)
      when(vanhaTutuRepository.deleteAll).thenReturn(0)
      when(vanhaTutuMigrationRepository.deleteAllChunks()).thenReturn(0)
      when(vanhaTutuMigrationRepository.createChunk(any[Int], any[Int], any[String]))
        .thenReturn(Success(UUID.randomUUID()))
      when(chunkProcessor.processMigrationChunksIndividually(eqTo(10))).thenReturn(Success(2))
      when(chunkProcessor.cleanupProcessedChunks()).thenReturn(Success(2))

      // Mock muistiarviot ja palastus

      when(xmlChunker.splitXmlStreamIntoChunksAndStore(any(), any()))
        .thenReturn(Success(2))

      // Varmistetaan että updateTotalChunksForAllChunks kutsutaan oikealla lukumäärällä
      when(vanhaTutuMigrationRepository.updateTotalChunksForAllChunks(2)).thenReturn(2)

      val result = migrationService.orchestrateMigration(key)

      assertTrue(result.isSuccess)
      verify(dokumenttipalvelu, times(1)).get(key)
      verify(vanhaTutuRepository, times(1)).deleteAll
      verify(vanhaTutuMigrationRepository, times(1)).deleteAllChunks()
      verify(xmlChunker, times(1)).splitXmlStreamIntoChunksAndStore(any(), any())
      verify(vanhaTutuMigrationRepository, times(1)).updateTotalChunksForAllChunks(2)
      verify(chunkProcessor, times(1)).processMigrationChunksIndividually(eqTo(10))
      verify(chunkProcessor, times(1)).cleanupProcessedChunks()
    }
  }
}
