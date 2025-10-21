package fi.oph.tutu.backend.domain

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.scala.DefaultScalaModule
import com.fasterxml.jackson.databind.module.SimpleModule
import org.junit.jupiter.api.{BeforeEach, Test}
import org.junit.jupiter.api.Assertions.*

class BooleanFieldWrapperTest:
  private var mapper: ObjectMapper = _

  @BeforeEach
  def setUp(): Unit =
    mapper = new ObjectMapper()
    mapper.registerModule(DefaultScalaModule)

    val booleanFieldModule = new SimpleModule()
    booleanFieldModule.addDeserializer(
      classOf[BooleanFieldWrapper],
      new BooleanFieldWrapperDeserializer()
    )
    mapper.registerModule(booleanFieldModule)

  @Test
  def testDeserializeTrue(): Unit =
    val json   = "true"
    val result = mapper.readValue(json, classOf[BooleanFieldWrapper])
    assertTrue(result.value.contains(true), "Should deserialize true to Some(true)")

  @Test
  def testDeserializeFalse(): Unit =
    val json   = "false"
    val result = mapper.readValue(json, classOf[BooleanFieldWrapper])
    assertTrue(result.value.contains(false), "Should deserialize false to Some(false)")

  @Test
  def testDeserializeNestedTrue(): Unit =
    val json   = """{"virallinenTutkinto": true}"""
    val result = mapper.readValue(json, classOf[BooleanFieldWrapper])
    assertTrue(result.value.contains(true), "Should deserialize nested true to Some(true)")

  @Test
  def testDeserializeNestedFalse(): Unit =
    val json   = """{"virallinenTutkinto": false}"""
    val result = mapper.readValue(json, classOf[BooleanFieldWrapper])
    assertTrue(result.value.contains(false), "Should deserialize nested false to Some(false)")

  @Test
  def testDeserializeNestedNull(): Unit =
    val json   = """{"virallinenTutkinto": null}"""
    val result = mapper.readValue(json, classOf[BooleanFieldWrapper])
    assertTrue(result.value.isEmpty, "Should deserialize nested null to None")

  @Test
  def testDeserializeAnyFieldNameTrue(): Unit =
    val json   = """{"myonteinenPaatos": true}"""
    val result = mapper.readValue(json, classOf[BooleanFieldWrapper])
    assertTrue(result.value.contains(true), "Should work with any field name")

  @Test
  def testDeserializeAnyFieldNameNull(): Unit =
    val json   = """{"apHakemus": null}"""
    val result = mapper.readValue(json, classOf[BooleanFieldWrapper])
    assertTrue(result.value.isEmpty, "Should work with any field name for null")
