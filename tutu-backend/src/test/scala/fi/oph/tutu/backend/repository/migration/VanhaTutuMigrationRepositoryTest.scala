package fi.oph.tutu.backend.repository.migration

import fi.oph.tutu.backend.domain.migration.VanhaTutuMigrationChunk
import fi.oph.tutu.backend.repository.migration.VanhaTutuMigrationRepository
import org.junit.jupiter.api.{BeforeEach, Test}
import org.junit.jupiter.api.Assertions._
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.Mock
import org.mockito.Mockito._
import org.mockito.junit.jupiter.MockitoExtension

import java.time.LocalDateTime
import java.util.UUID
import scala.util.{Failure, Success, Try}

@ExtendWith(Array(classOf[MockitoExtension]))
class VanhaTutuMigrationRepositoryTest {
  @Mock
  var vanhaTutuMigrationRepository: VanhaTutuMigrationRepository = _

  @BeforeEach
  def setup(): Unit = {
    // Nollataan mockit ennen jokaista testiä
    reset(vanhaTutuMigrationRepository)
  }

  @Test
  def testaaChunkinLuominen(): Unit = {
    val chunkIndex  = 1
    val totalChunks = 2
    val xmlChunk    = "<test>sisältö</test>"
    val chunkId     = UUID.randomUUID()
    val now         = LocalDateTime.now()

    // Mock the repository methods
    when(vanhaTutuMigrationRepository.createChunk(chunkIndex, totalChunks, xmlChunk))
      .thenReturn(Success(chunkId))

    val testChunk = VanhaTutuMigrationChunk(
      id = chunkId,
      chunkIndex = chunkIndex,
      totalChunks = totalChunks,
      xmlChunk = xmlChunk,
      processed = false,
      createdAt = now
    )
    when(vanhaTutuMigrationRepository.getUnprocessedChunk())
      .thenReturn(Some(testChunk))

    val result = vanhaTutuMigrationRepository.createChunk(chunkIndex, totalChunks, xmlChunk)

    assertTrue(result.isSuccess, "Chunkin luominen pitäisi onnistua")
    val returnedChunkId = result.get
    assertNotNull(returnedChunkId, "Luodulla chunkilla pitäisi olla kelvollinen ID")
    assertEquals(chunkId, returnedChunkId, "Palautetun chunkin ID:n pitäisi vastata odotettua ID:tä")

    // Varmistetaan että chunk luotiin todella tietokantaan
    val chunk = vanhaTutuMigrationRepository.getUnprocessedChunk()
    assertTrue(chunk.isDefined, "Pitäisi olla tasan yksi chunk")
    assertEquals(chunkId, chunk.get.id, "Luodun chunkin ID:n pitäisi vastata")
    assertEquals(chunkIndex, chunk.get.chunkIndex, "Chunkin indeksin pitäisi vastata")
    assertEquals(totalChunks, chunk.get.totalChunks, "Kokonaispalojen määrän pitäisi vastata")
    assertEquals(xmlChunk, chunk.get.xmlChunk, "XML-chunkin pitäisi vastata")
    assertFalse(chunk.get.processed, "Uusi chunk ei pitäisi olla käsitelty")

    // Varmistetaan metodikutsut
    verify(vanhaTutuMigrationRepository).createChunk(chunkIndex, totalChunks, xmlChunk)
    verify(vanhaTutuMigrationRepository).getUnprocessedChunk()
  }

  @Test
  def testaaKäsittelemättömienChunkienHaku(): Unit = {
    val chunk1Id = UUID.randomUUID()
    val chunk2Id = UUID.randomUUID()
    val now      = LocalDateTime.now()

    // Mock the repository methods
    when(vanhaTutuMigrationRepository.createChunk(1, 2, "<test>chunk1</test>"))
      .thenReturn(Success(chunk1Id))
    when(vanhaTutuMigrationRepository.createChunk(2, 2, "<test>chunk2</test>"))
      .thenReturn(Success(chunk2Id))

    val testChunk1 = VanhaTutuMigrationChunk(
      id = chunk1Id,
      chunkIndex = 1,
      totalChunks = 2,
      xmlChunk = "<test>chunk1</test>",
      processed = false,
      createdAt = now
    )
    val testChunk2 = VanhaTutuMigrationChunk(
      id = chunk2Id,
      chunkIndex = 2,
      totalChunks = 2,
      xmlChunk = "<test>chunk2</test>",
      processed = false,
      createdAt = now
    )
    when(vanhaTutuMigrationRepository.getUnprocessedChunk())
      .thenReturn(Some(testChunk1))
      .thenReturn(Some(testChunk2))
      .thenReturn(None)

    // Create test chunks
    val chunk1Result = vanhaTutuMigrationRepository.createChunk(1, 2, "<test>chunk1</test>")
    val chunk2Result = vanhaTutuMigrationRepository.createChunk(2, 2, "<test>chunk2</test>")

    assertTrue(chunk1Result.isSuccess, "First chunk creation should succeed")
    assertTrue(chunk2Result.isSuccess, "Second chunk creation should succeed")

    val returnedChunk1Id = chunk1Result.get
    val returnedChunk2Id = chunk2Result.get

    val chunk1 = vanhaTutuMigrationRepository.getUnprocessedChunk()
    val chunk2 = vanhaTutuMigrationRepository.getUnprocessedChunk()
    val chunk3 = vanhaTutuMigrationRepository.getUnprocessedChunk()

    assertTrue(chunk1.isDefined, "Should return first chunk")
    assertTrue(chunk2.isDefined, "Should return second chunk")
    assertTrue(chunk3.isEmpty, "Should return None for third call")

    // Verify chunk details
    assertEquals(chunk1Id, chunk1.get.id, "First chunk ID should match")
    assertEquals(chunk2Id, chunk2.get.id, "Second chunk ID should match")
    assertEquals(1, chunk1.get.chunkIndex, "First chunk index should be 1")
    assertEquals(2, chunk2.get.chunkIndex, "Second chunk index should be 2")
    assertFalse(chunk1.get.processed, "First chunk should not be processed")
    assertFalse(chunk2.get.processed, "Second chunk should not be processed")

    // Verify method calls
    verify(vanhaTutuMigrationRepository).createChunk(1, 2, "<test>chunk1</test>")
    verify(vanhaTutuMigrationRepository).createChunk(2, 2, "<test>chunk2</test>")
    verify(vanhaTutuMigrationRepository, times(3)).getUnprocessedChunk()
  }

  @Test
  def testaaChunkinMerkitseminenKäsitellyksi(): Unit = {
    val chunkId = UUID.randomUUID()
    val now     = LocalDateTime.now()

    // Mock the repository methods
    when(vanhaTutuMigrationRepository.createChunk(1, 1, "<test>chunk</test>"))
      .thenReturn(Success(chunkId))

    val unprocessedChunk = VanhaTutuMigrationChunk(
      id = chunkId,
      chunkIndex = 1,
      totalChunks = 1,
      xmlChunk = "<test>chunk</test>",
      processed = false,
      createdAt = now
    )
    when(vanhaTutuMigrationRepository.getUnprocessedChunk())
      .thenReturn(Some(unprocessedChunk)) // Initially unprocessed
      .thenReturn(None)                   // After marking as processed

    when(vanhaTutuMigrationRepository.markChunkAsProcessed(chunkId))
      .thenReturn(1)
    when(vanhaTutuMigrationRepository.getChunkCount())
      .thenReturn(1)

    // Create a test chunk first
    val chunkResult = vanhaTutuMigrationRepository.createChunk(1, 1, "<test>chunk</test>")
    assertTrue(chunkResult.isSuccess, "Chunk creation should succeed")
    val returnedChunkId = chunkResult.get
    assertEquals(chunkId, returnedChunkId, "Returned chunk ID should match expected ID")

    // Verify chunk is initially unprocessed
    val initialChunk = vanhaTutuMigrationRepository.getUnprocessedChunk()
    assertTrue(initialChunk.isDefined, "Should have one unprocessed chunk")
    assertFalse(initialChunk.get.processed, "Chunk should initially be unprocessed")

    val result = vanhaTutuMigrationRepository.markChunkAsProcessed(chunkId)
    assertEquals(1, result, "Should mark exactly one chunk as processed")

    // Verify chunk is now processed
    val processedChunk = vanhaTutuMigrationRepository.getUnprocessedChunk()
    assertTrue(processedChunk.isEmpty, "Should have no unprocessed chunks")

    // Verify total count is still 1
    val totalCount = vanhaTutuMigrationRepository.getChunkCount()
    assertEquals(1, totalCount, "Total chunk count should still be 1")

    // Verify method calls
    verify(vanhaTutuMigrationRepository).createChunk(1, 1, "<test>chunk</test>")
    verify(vanhaTutuMigrationRepository, times(2)).getUnprocessedChunk()
    verify(vanhaTutuMigrationRepository).markChunkAsProcessed(chunkId)
    verify(vanhaTutuMigrationRepository).getChunkCount()
  }

  @Test
  def testaaKäsiteltyjenChunkienPoisto(): Unit = {
    val chunk1Id = UUID.randomUUID()
    val chunk2Id = UUID.randomUUID()

    // Mock the repository methods
    when(vanhaTutuMigrationRepository.createChunk(1, 2, "<test>chunk1</test>"))
      .thenReturn(Success(chunk1Id))
    when(vanhaTutuMigrationRepository.createChunk(2, 2, "<test>chunk2</test>"))
      .thenReturn(Success(chunk2Id))

    when(vanhaTutuMigrationRepository.markChunkAsProcessed(chunk1Id))
      .thenReturn(1)
    when(vanhaTutuMigrationRepository.markChunkAsProcessed(chunk2Id))
      .thenReturn(1)

    when(vanhaTutuMigrationRepository.getUnprocessedChunk())
      .thenReturn(None) // No unprocessed chunks after marking as processed

    when(vanhaTutuMigrationRepository.getChunkCount())
      .thenReturn(2) // Before deletion
      .thenReturn(0) // After deletion

    when(vanhaTutuMigrationRepository.deleteProcessedChunks())
      .thenReturn(2)

    // Create test chunks
    val chunk1Result = vanhaTutuMigrationRepository.createChunk(1, 2, "<test>chunk1</test>")
    val chunk2Result = vanhaTutuMigrationRepository.createChunk(2, 2, "<test>chunk2</test>")

    assertTrue(chunk1Result.isSuccess, "First chunk creation should succeed")
    assertTrue(chunk2Result.isSuccess, "Second chunk creation should succeed")

    val returnedChunk1Id = chunk1Result.get
    val returnedChunk2Id = chunk2Result.get
    assertEquals(chunk1Id, returnedChunk1Id, "First chunk ID should match")
    assertEquals(chunk2Id, returnedChunk2Id, "Second chunk ID should match")

    // Mark both chunks as processed
    val markResult1 = vanhaTutuMigrationRepository.markChunkAsProcessed(chunk1Id)
    val markResult2 = vanhaTutuMigrationRepository.markChunkAsProcessed(chunk2Id)
    assertEquals(1, markResult1, "First chunk should be marked as processed")
    assertEquals(1, markResult2, "Second chunk should be marked as processed")

    // Verify both chunks are processed
    val unprocessedChunk = vanhaTutuMigrationRepository.getUnprocessedChunk()
    assertTrue(unprocessedChunk.isEmpty, "Should have no unprocessed chunks")

    val totalCountBefore = vanhaTutuMigrationRepository.getChunkCount()
    assertEquals(2, totalCountBefore, "Should have 2 total chunks before deletion")

    val result = vanhaTutuMigrationRepository.deleteProcessedChunks()
    assertEquals(2, result, "Should delete exactly 2 processed chunks")

    // Verify chunks are deleted
    val totalCountAfter = vanhaTutuMigrationRepository.getChunkCount()
    assertEquals(0, totalCountAfter, "Should have 0 total chunks after deletion")

    // Verify method calls
    verify(vanhaTutuMigrationRepository).createChunk(1, 2, "<test>chunk1</test>")
    verify(vanhaTutuMigrationRepository).createChunk(2, 2, "<test>chunk2</test>")
    verify(vanhaTutuMigrationRepository).markChunkAsProcessed(chunk1Id)
    verify(vanhaTutuMigrationRepository).markChunkAsProcessed(chunk2Id)
    verify(vanhaTutuMigrationRepository).getUnprocessedChunk()
    verify(vanhaTutuMigrationRepository, times(2)).getChunkCount()
    verify(vanhaTutuMigrationRepository).deleteProcessedChunks()
  }

  @Test
  def testaaKaikkienChunkienPoisto(): Unit = {
    val chunk1Id = UUID.randomUUID()
    val chunk2Id = UUID.randomUUID()

    // Mock the repository methods
    when(vanhaTutuMigrationRepository.createChunk(1, 2, "<test>chunk1</test>"))
      .thenReturn(Success(chunk1Id))
    when(vanhaTutuMigrationRepository.createChunk(2, 2, "<test>chunk2</test>"))
      .thenReturn(Success(chunk2Id))

    when(vanhaTutuMigrationRepository.markChunkAsProcessed(chunk1Id))
      .thenReturn(1)

    when(vanhaTutuMigrationRepository.getChunkCount())
      .thenReturn(2) // Before deletion
      .thenReturn(0) // After deletion

    when(vanhaTutuMigrationRepository.deleteAllChunks())
      .thenReturn(2)

    // Create test chunks
    val chunk1Result = vanhaTutuMigrationRepository.createChunk(1, 2, "<test>chunk1</test>")
    val chunk2Result = vanhaTutuMigrationRepository.createChunk(2, 2, "<test>chunk2</test>")

    assertTrue(chunk1Result.isSuccess, "First chunk creation should succeed")
    assertTrue(chunk2Result.isSuccess, "Second chunk creation should succeed")

    val returnedChunk1Id = chunk1Result.get
    val returnedChunk2Id = chunk2Result.get
    assertEquals(chunk1Id, returnedChunk1Id, "First chunk ID should match")
    assertEquals(chunk2Id, returnedChunk2Id, "Second chunk ID should match")

    // Mark one as processed, leave one unprocessed
    val markResult = vanhaTutuMigrationRepository.markChunkAsProcessed(returnedChunk1Id)
    assertEquals(1, markResult, "First chunk should be marked as processed")

    val totalCountBefore = vanhaTutuMigrationRepository.getChunkCount()
    assertEquals(2, totalCountBefore, "Should have 2 total chunks before deletion")

    val result = vanhaTutuMigrationRepository.deleteAllChunks()
    assertEquals(2, result, "Should delete all 2 chunks regardless of processed status")

    // Verify all chunks are deleted
    val totalCountAfter = vanhaTutuMigrationRepository.getChunkCount()
    assertEquals(0, totalCountAfter, "Should have 0 total chunks after deletion")

    // Verify method calls
    verify(vanhaTutuMigrationRepository).createChunk(1, 2, "<test>chunk1</test>")
    verify(vanhaTutuMigrationRepository).createChunk(2, 2, "<test>chunk2</test>")
    verify(vanhaTutuMigrationRepository).markChunkAsProcessed(chunk1Id)
    verify(vanhaTutuMigrationRepository, times(2)).getChunkCount()
    verify(vanhaTutuMigrationRepository).deleteAllChunks()
  }

  @Test
  def testaaChunkienLukumääränHaku(): Unit = {
    val chunk1Id = UUID.randomUUID()
    val chunk2Id = UUID.randomUUID()
    val chunk3Id = UUID.randomUUID()

    // Mock the repository methods
    when(vanhaTutuMigrationRepository.getChunkCount())
      .thenReturn(0) // Initially 0
      .thenReturn(3) // After creating 3 chunks

    when(vanhaTutuMigrationRepository.createChunk(1, 3, "<test>chunk1</test>"))
      .thenReturn(Success(chunk1Id))
    when(vanhaTutuMigrationRepository.createChunk(2, 3, "<test>chunk2</test>"))
      .thenReturn(Success(chunk2Id))
    when(vanhaTutuMigrationRepository.createChunk(3, 3, "<test>chunk3</test>"))
      .thenReturn(Success(chunk3Id))

    // Initially should be 0
    val initialCount = vanhaTutuMigrationRepository.getChunkCount()
    assertEquals(0, initialCount, "Initial count should be 0")

    // Create test chunks
    val chunk1Result = vanhaTutuMigrationRepository.createChunk(1, 3, "<test>chunk1</test>")
    val chunk2Result = vanhaTutuMigrationRepository.createChunk(2, 3, "<test>chunk2</test>")
    val chunk3Result = vanhaTutuMigrationRepository.createChunk(3, 3, "<test>chunk3</test>")

    assertTrue(chunk1Result.isSuccess, "First chunk creation should succeed")
    assertTrue(chunk2Result.isSuccess, "Second chunk creation should succeed")
    assertTrue(chunk3Result.isSuccess, "Third chunk creation should succeed")

    val result = vanhaTutuMigrationRepository.getChunkCount()
    assertEquals(3, result, "Should have exactly 3 chunks")

    // Verify method calls
    verify(vanhaTutuMigrationRepository, times(2)).getChunkCount()
    verify(vanhaTutuMigrationRepository).createChunk(1, 3, "<test>chunk1</test>")
    verify(vanhaTutuMigrationRepository).createChunk(2, 3, "<test>chunk2</test>")
    verify(vanhaTutuMigrationRepository).createChunk(3, 3, "<test>chunk3</test>")
  }

  @Test
  def testaaKäsittelemättömienChunkienLukumääränHaku(): Unit = {
    val chunk1Id = UUID.randomUUID()
    val chunk2Id = UUID.randomUUID()
    val chunk3Id = UUID.randomUUID()

    // Mock the repository methods
    when(vanhaTutuMigrationRepository.getUnprocessedChunkCount())
      .thenReturn(0) // Initially 0
      .thenReturn(3) // After creating 3 chunks
      .thenReturn(2) // After marking one as processed

    when(vanhaTutuMigrationRepository.getChunkCount())
      .thenReturn(3) // Total count remains 3

    when(vanhaTutuMigrationRepository.createChunk(1, 3, "<test>chunk1</test>"))
      .thenReturn(Success(chunk1Id))
    when(vanhaTutuMigrationRepository.createChunk(2, 3, "<test>chunk2</test>"))
      .thenReturn(Success(chunk2Id))
    when(vanhaTutuMigrationRepository.createChunk(3, 3, "<test>chunk3</test>"))
      .thenReturn(Success(chunk3Id))

    when(vanhaTutuMigrationRepository.markChunkAsProcessed(chunk1Id))
      .thenReturn(1)

    // Initially should be 0
    val initialCount = vanhaTutuMigrationRepository.getUnprocessedChunkCount()
    assertEquals(0, initialCount, "Initial unprocessed count should be 0")

    // Create test chunks
    val chunk1Result = vanhaTutuMigrationRepository.createChunk(1, 3, "<test>chunk1</test>")
    val chunk2Result = vanhaTutuMigrationRepository.createChunk(2, 3, "<test>chunk2</test>")
    val chunk3Result = vanhaTutuMigrationRepository.createChunk(3, 3, "<test>chunk3</test>")

    assertTrue(chunk1Result.isSuccess, "First chunk creation should succeed")
    assertTrue(chunk2Result.isSuccess, "Second chunk creation should succeed")
    assertTrue(chunk3Result.isSuccess, "Third chunk creation should succeed")

    // All chunks should be unprocessed initially
    val unprocessedCount = vanhaTutuMigrationRepository.getUnprocessedChunkCount()
    assertEquals(3, unprocessedCount, "Should have 3 unprocessed chunks")

    // Mark one chunk as processed
    val markResult = vanhaTutuMigrationRepository.markChunkAsProcessed(chunk1Id)
    assertEquals(1, markResult, "First chunk should be marked as processed")

    val unprocessedCountAfter = vanhaTutuMigrationRepository.getUnprocessedChunkCount()
    assertEquals(2, unprocessedCountAfter, "Should have 2 unprocessed chunks after marking one as processed")

    // Total count should still be 3
    val totalCount = vanhaTutuMigrationRepository.getChunkCount()
    assertEquals(3, totalCount, "Total count should still be 3")

    // Verify method calls
    verify(vanhaTutuMigrationRepository, times(3)).getUnprocessedChunkCount()
    verify(vanhaTutuMigrationRepository).createChunk(1, 3, "<test>chunk1</test>")
    verify(vanhaTutuMigrationRepository).createChunk(2, 3, "<test>chunk2</test>")
    verify(vanhaTutuMigrationRepository).createChunk(3, 3, "<test>chunk3</test>")
    verify(vanhaTutuMigrationRepository).markChunkAsProcessed(chunk1Id)
    verify(vanhaTutuMigrationRepository).getChunkCount()
  }
}
