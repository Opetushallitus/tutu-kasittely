package fi.oph.tutu.backend.service.migration

import fi.oph.tutu.backend.UnitTestBase
import fi.oph.tutu.backend.config.migration.ChunkingConfig
import fi.oph.tutu.backend.domain.migration.VanhaTutuMigrationChunk
import fi.oph.tutu.backend.repository.migration.{VanhaTutuMigrationRepository, VanhaTutuRepository}
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.{BeforeEach, Test}
import org.mockito.ArgumentMatchers.any
import org.mockito.Mockito.{times, verify, when}
import org.mockito.{Mock, MockitoAnnotations}

import java.time.LocalDateTime
import java.util.UUID

class ChunkProcessorTest extends UnitTestBase {
  @Mock
  var vanhaTutuMigrationRepository: VanhaTutuMigrationRepository = _
  @Mock
  var vanhaTutuRepository: VanhaTutuRepository = _
  @Mock
  var chunkingConfig: ChunkingConfig = _

  var chunkProcessor: ChunkProcessor = _

  @BeforeEach
  def setup(): Unit = {
    MockitoAnnotations.openMocks(this)
    // Asetetaan oletusarvoiset mock-käyttäytymiset ChunkingConfigille
    when(chunkingConfig.getChunkSize).thenReturn(5)
    when(chunkingConfig.getMaxChunks).thenReturn(10)
    chunkProcessor = ChunkProcessor(vanhaTutuMigrationRepository, vanhaTutuRepository, chunkingConfig)
  }

  @Test
  def testaaKäsittelePalaKelvollisellaPalalla(): Unit = {
    val chunkId = UUID.randomUUID()
    val chunk   = VanhaTutuMigrationChunk(
      id = chunkId,
      chunkIndex = 1,
      totalChunks = 1,
      xmlChunk = """<?xml version="1.0" encoding="UTF-8"?>
<FMPXMLRESULT xmlns="http://www.filemaker.com/fmpxmlresult">
  <ERRORCODE>0</ERRORCODE>
  <METADATA>
    <FIELD NAME="Name" TYPE="TEXT"/>
    <FIELD NAME="Age" TYPE="TEXT"/>
  </METADATA>
  <RESULTSET FOUND="2">
    <ROW><COL><DATA>John Doe</DATA></COL><COL><DATA>30</DATA></COL></ROW>
    <ROW><COL><DATA>Jane Smith</DATA></COL><COL><DATA>25</DATA></COL></ROW>
  </RESULTSET>
</FMPXMLRESULT>""",
      processed = false,
      createdAt = LocalDateTime.now(),
      processedAt = None
    )

    when(vanhaTutuRepository.create(any[String])).thenReturn(UUID.randomUUID())

    val result = chunkProcessor.processChunk(chunk)

    assertTrue(result.isSuccess)
    assertEquals(2, result.get)
    verify(vanhaTutuRepository, times(2)).create(any[String])
  }

  @Test
  def testaaKäsittelePalaTyhjälläPalalla(): Unit = {
    val chunkId = UUID.randomUUID()
    val chunk   = VanhaTutuMigrationChunk(
      id = chunkId,
      chunkIndex = 1,
      totalChunks = 1,
      xmlChunk = """<?xml version="1.0" encoding="UTF-8"?>
<FMPXMLRESULT xmlns="http://www.filemaker.com/fmpxmlresult">
  <ERRORCODE>0</ERRORCODE>
  <METADATA>
    <FIELD NAME="Name" TYPE="TEXT"/>
  </METADATA>
  <RESULTSET FOUND="0">
  </RESULTSET>
</FMPXMLRESULT>""",
      processed = false,
      createdAt = LocalDateTime.now(),
      processedAt = None
    )

    val result = chunkProcessor.processChunk(chunk)

    assertTrue(result.isSuccess)
    assertEquals(0, result.get)
    verify(vanhaTutuRepository, times(0)).create(any[String])
  }

  @Test
  def testaaKäsittelePalaKäsitteleeLuontiVirhe(): Unit = {
    val chunkId = UUID.randomUUID()
    val chunk   = VanhaTutuMigrationChunk(
      id = chunkId,
      chunkIndex = 1,
      totalChunks = 1,
      xmlChunk = """<?xml version="1.0" encoding="UTF-8"?>
<FMPXMLRESULT xmlns="http://www.filemaker.com/fmpxmlresult">
  <ERRORCODE>0</ERRORCODE>
  <METADATA>
    <FIELD NAME="Name" TYPE="TEXT"/>
  </METADATA>
  <RESULTSET FOUND="1">
    <ROW><COL><DATA>John Doe</DATA></COL></ROW>
  </RESULTSET>
</FMPXMLRESULT>""",
      processed = false,
      createdAt = LocalDateTime.now(),
      processedAt = None
    )

    val exception = new RuntimeException("Create failed")
    when(vanhaTutuRepository.create(any[String])).thenThrow(exception)

    val result = chunkProcessor.processChunk(chunk)

    assertTrue(result.isFailure)
    assertEquals(exception, result.failed.get)
    verify(vanhaTutuRepository, times(1)).create(any[String])
    verify(vanhaTutuMigrationRepository, times(0)).markChunkAsProcessed(any[UUID])
  }

  @Test
  def testaaKäsittelePalatUseillaPalalla(): Unit = {
    val chunk1Id = UUID.randomUUID()
    val chunk2Id = UUID.randomUUID()

    val chunks = Seq(
      VanhaTutuMigrationChunk(
        id = chunk1Id,
        chunkIndex = 1,
        totalChunks = 2,
        xmlChunk = """<?xml version="1.0" encoding="UTF-8"?>
<FMPXMLRESULT xmlns="http://www.filemaker.com/fmpxmlresult">
  <ERRORCODE>0</ERRORCODE>
  <METADATA>
    <FIELD NAME="Name" TYPE="TEXT"/>
  </METADATA>
  <RESULTSET FOUND="1">
    <ROW><COL><DATA>John Doe</DATA></COL></ROW>
  </RESULTSET>
</FMPXMLRESULT>""",
        processed = false,
        createdAt = LocalDateTime.now(),
        processedAt = None
      ),
      VanhaTutuMigrationChunk(
        id = chunk2Id,
        chunkIndex = 2,
        totalChunks = 2,
        xmlChunk = """<?xml version="1.0" encoding="UTF-8"?>
<FMPXMLRESULT xmlns="http://www.filemaker.com/fmpxmlresult">
  <ERRORCODE>0</ERRORCODE>
  <METADATA>
    <FIELD NAME="Name" TYPE="TEXT"/>
  </METADATA>
  <RESULTSET FOUND="1">
    <ROW><COL><DATA>Jane Smith</DATA></COL></ROW>
  </RESULTSET>
</FMPXMLRESULT>""",
        processed = false,
        createdAt = LocalDateTime.now(),
        processedAt = None
      )
    )

    when(vanhaTutuRepository.create(any[String])).thenReturn(UUID.randomUUID())
    when(vanhaTutuMigrationRepository.markChunkAsProcessed(any[UUID])).thenReturn(1)

    val result = chunkProcessor.processMigrationChunks(chunks)

    assertTrue(result.isSuccess)
    assertEquals(2, result.get)
    verify(vanhaTutuRepository, times(2)).create(any[String])
    verify(vanhaTutuMigrationRepository, times(1)).markChunkAsProcessed(chunk1Id)
    verify(vanhaTutuMigrationRepository, times(1)).markChunkAsProcessed(chunk2Id)
  }

  @Test
  def testaaKäsittelePalatErissä(): Unit = {
    val chunk1Id = UUID.randomUUID()
    val chunk2Id = UUID.randomUUID()

    val chunks = Seq(
      VanhaTutuMigrationChunk(
        id = chunk1Id,
        chunkIndex = 1,
        totalChunks = 2,
        xmlChunk = """<?xml version="1.0" encoding="UTF-8"?>
<FMPXMLRESULT xmlns="http://www.filemaker.com/fmpxmlresult">
  <ERRORCODE>0</ERRORCODE>
  <METADATA>
    <FIELD NAME="Name" TYPE="TEXT"/>
  </METADATA>
  <RESULTSET FOUND="1">
    <ROW><COL><DATA>John Doe</DATA></COL></ROW>
  </RESULTSET>
</FMPXMLRESULT>""",
        processed = false,
        createdAt = LocalDateTime.now(),
        processedAt = None
      ),
      VanhaTutuMigrationChunk(
        id = chunk2Id,
        chunkIndex = 2,
        totalChunks = 2,
        xmlChunk = """<?xml version="1.0" encoding="UTF-8"?>
<FMPXMLRESULT xmlns="http://www.filemaker.com/fmpxmlresult">
  <ERRORCODE>0</ERRORCODE>
  <METADATA>
    <FIELD NAME="Name" TYPE="TEXT"/>
  </METADATA>
  <RESULTSET FOUND="1">
    <ROW><COL><DATA>Jane Smith</DATA></COL></ROW>
  </RESULTSET>
</FMPXMLRESULT>""",
        processed = false,
        createdAt = LocalDateTime.now(),
        processedAt = None
      )
    )

    when(vanhaTutuMigrationRepository.getUnprocessedChunk())
      .thenReturn(Some(chunks(0)))
      .thenReturn(Some(chunks(1)))
      .thenReturn(None)
    when(vanhaTutuRepository.create(any[String])).thenReturn(UUID.randomUUID())
    when(vanhaTutuMigrationRepository.markChunkAsProcessed(any[UUID])).thenReturn(1)

    val result = chunkProcessor.processMigrationChunksIndividually()

    assertTrue(result.isSuccess)
    assertEquals(2, result.get)
    verify(vanhaTutuMigrationRepository, times(3)).getUnprocessedChunk()
    verify(vanhaTutuRepository, times(2)).create(any[String])
    verify(vanhaTutuMigrationRepository, times(2)).markChunkAsProcessed(any[UUID])
  }

  @Test
  def testaaKäsittelePalatErissäRajoituksella(): Unit = {
    val chunk1Id = UUID.randomUUID()
    val chunks   = Seq(
      VanhaTutuMigrationChunk(
        id = chunk1Id,
        chunkIndex = 1,
        totalChunks = 1,
        xmlChunk = """<?xml version="1.0" encoding="UTF-8"?>
<FMPXMLRESULT xmlns="http://www.filemaker.com/fmpxmlresult">
  <ERRORCODE>0</ERRORCODE>
  <METADATA>
    <FIELD NAME="Name" TYPE="TEXT"/>
  </METADATA>
  <RESULTSET FOUND="1">
    <ROW><COL><DATA>John Doe</DATA></COL></ROW>
  </RESULTSET>
</FMPXMLRESULT>""",
        processed = false,
        createdAt = LocalDateTime.now(),
        processedAt = None
      )
    )

    when(vanhaTutuMigrationRepository.getUnprocessedChunk()).thenReturn(Some(chunks(0)))
    when(vanhaTutuRepository.create(any[String])).thenReturn(UUID.randomUUID())
    when(vanhaTutuMigrationRepository.markChunkAsProcessed(any[UUID])).thenReturn(1)

    val result = chunkProcessor.processMigrationChunksIndividually(maxChunks = 1)

    assertTrue(result.isSuccess)
    assertEquals(1, result.get)
    verify(vanhaTutuMigrationRepository, times(1)).getUnprocessedChunk()
    verify(vanhaTutuRepository, times(1)).create(any[String])
    verify(vanhaTutuMigrationRepository, times(1)).markChunkAsProcessed(any[UUID])
  }

  @Test
  def testaaSiivoaKäsitellytPalat(): Unit = {
    when(vanhaTutuMigrationRepository.deleteProcessedChunks()).thenReturn(5)

    val result = chunkProcessor.cleanupProcessedChunks()

    assertTrue(result.isSuccess)
    assertEquals(5, result.get)
    verify(vanhaTutuMigrationRepository, times(1)).deleteProcessedChunks()
  }

  @Test
  def testaaHaeKäsittelyTilastot(): Unit = {
    when(vanhaTutuMigrationRepository.getChunkCount()).thenReturn(10)
    when(vanhaTutuMigrationRepository.getUnprocessedChunkCount()).thenReturn(3)

    val result = chunkProcessor.getProcessingStats()

    assertTrue(result.isSuccess)
    val stats = result.get

    assertEquals(10, stats("totalChunks"))
    assertEquals(7, stats("processedChunks"))
    assertEquals(3, stats("unprocessedChunks"))
    assertEquals(70.0, stats("completionPercentage"))
  }

  @Test
  def testaaHylkääChunkinJossaChunkIndexYlittääTotalChunks(): Unit = {
    val chunkId = UUID.randomUUID()
    val chunk   = VanhaTutuMigrationChunk(
      id = chunkId,
      chunkIndex = 1,
      totalChunks = 0, // Tämä aiheuttaa validointivirheen
      xmlChunk = """<?xml version="1.0" encoding="UTF-8"?>
<FMPXMLRESULT xmlns="http://www.filemaker.com/fmpxmlresult">
  <ERRORCODE>0</ERRORCODE>
  <METADATA>
    <FIELD NAME="Name" TYPE="TEXT"/>
  </METADATA>
  <RESULTSET FOUND="1">
    <ROW><COL><DATA>John Doe</DATA></COL></ROW>
  </RESULTSET>
</FMPXMLRESULT>""",
      processed = false,
      createdAt = LocalDateTime.now(),
      processedAt = None
    )

    val result = chunkProcessor.processChunk(chunk)

    assertTrue(result.isFailure)
    assertTrue(result.failed.get.isInstanceOf[IllegalArgumentException])
    assertTrue(result.failed.get.getMessage.contains("Chunk index 1 exceeds total chunks 0"))
  }

  @Test
  def testaaHylkääChunkinJossaChunkIndexOnNolla(): Unit = {
    val chunkId = UUID.randomUUID()
    val chunk   = VanhaTutuMigrationChunk(
      id = chunkId,
      chunkIndex = 0, // Tämä aiheuttaa validointivirheen
      totalChunks = 2,
      xmlChunk = """<?xml version="1.0" encoding="UTF-8"?>
<FMPXMLRESULT xmlns="http://www.filemaker.com/fmpxmlresult">
  <ERRORCODE>0</ERRORCODE>
  <METADATA>
    <FIELD NAME="Name" TYPE="TEXT"/>
  </METADATA>
  <RESULTSET FOUND="1">
    <ROW><COL><DATA>John Doe</DATA></COL></ROW>
  </RESULTSET>
</FMPXMLRESULT>""",
      processed = false,
      createdAt = LocalDateTime.now(),
      processedAt = None
    )

    val result = chunkProcessor.processChunk(chunk)

    assertTrue(result.isFailure)
    assertTrue(result.failed.get.isInstanceOf[IllegalArgumentException])
    assertTrue(result.failed.get.getMessage.contains("Chunk index must be positive, got: 0"))
  }

  @Test
  def testaaHylkääChunkinJossaXmlChunkOnTyhjä(): Unit = {
    val chunkId = UUID.randomUUID()
    val chunk   = VanhaTutuMigrationChunk(
      id = chunkId,
      chunkIndex = 1,
      totalChunks = 2,
      xmlChunk = "", // Tämä aiheuttaa validointivirheen
      processed = false,
      createdAt = LocalDateTime.now(),
      processedAt = None
    )

    val result = chunkProcessor.processChunk(chunk)

    assertTrue(result.isFailure)
    assertTrue(result.failed.get.isInstanceOf[IllegalArgumentException])
    assertTrue(result.failed.get.getMessage.contains("Chunk XML content is empty"))
  }
}
