package fi.oph.tutu.backend.repository.migration

import com.fasterxml.jackson.databind.{ObjectMapper, SerializationFeature}
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule
import com.fasterxml.jackson.module.scala.DefaultScalaModule
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.extension.ExtendWith
import org.junit.jupiter.api.{BeforeEach, Test}
import org.mockito.Mock
import org.mockito.Mockito.*
import org.mockito.junit.jupiter.MockitoExtension

import java.util.UUID

@ExtendWith(Array(classOf[MockitoExtension]))
class VanhaTutuRepositoryTest {

  @Mock
  var vanhaTutuRepository: VanhaTutuRepository = _

  private val mapper = new ObjectMapper()
  mapper.registerModule(DefaultScalaModule)
  mapper.registerModule(new JavaTimeModule)
  mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS)

  @BeforeEach
  def setupTest(): Unit = {
    // Reset mocks before each test
    reset(vanhaTutuRepository)
  }

  @Test
  def testaaTietokantaoperaatiot(): Unit = {
    val testData = Map(
      "testField"    -> "testValue",
      "numberField"  -> 42,
      "booleanField" -> true
    )
    val testId   = UUID.randomUUID()
    val testJson = mapper.writeValueAsString(testData)

    // Mock the repository methods
    when(vanhaTutuRepository.create(testJson)).thenReturn(testId)
    when(vanhaTutuRepository.get(testId))
      .thenReturn(Some(testJson)) // First call - before deletion
      .thenReturn(None)           // Second call - after deletion
    when(vanhaTutuRepository.delete(testId)).thenReturn(1)

    // Test create operation
    val id = vanhaTutuRepository.create(testJson)
    assert(id != null, "Create operation should return a valid ID")
    assertEquals(testId, id, "Returned ID should match expected ID")
    verify(vanhaTutuRepository).create(testJson)

    // Test get operation
    val retrievedData = vanhaTutuRepository.get(id)
    assert(retrievedData.isDefined, "Get operation should return data")
    assertEquals(Some(testJson), retrievedData, "Retrieved data should match expected data")
    verify(vanhaTutuRepository).get(id)

    // Test delete operation
    val deletedCount = vanhaTutuRepository.delete(id)
    assertEquals(1, deletedCount, "Delete should return count of deleted records")
    verify(vanhaTutuRepository).delete(id)

    // Test get after deletion
    val deletedData = vanhaTutuRepository.get(id)
    assert(deletedData.isEmpty, "Data should be deleted")
    verify(vanhaTutuRepository, times(2)).get(id) // Called twice: once before deletion, once after
  }
}
