package fi.oph.tutu.backend.domain

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.scala.DefaultScalaModule
import com.fasterxml.jackson.databind.module.SimpleModule
import org.junit.jupiter.api.{BeforeEach, Test}
import org.junit.jupiter.api.Assertions.*

class StringFieldWrapperTest:
  private var mapper: ObjectMapper = _

  @BeforeEach
  def setUp(): Unit =
    mapper = new ObjectMapper()
    mapper.registerModule(DefaultScalaModule)

    val stringFieldModule = new SimpleModule()
    stringFieldModule.addDeserializer(
      classOf[StringFieldWrapper],
      new StringFieldWrapperDeserializer()
    )
    mapper.registerModule(stringFieldModule)

  @Test
  def testDeserializeString(): Unit =
    val json   = "\"some_value\""
    val result = mapper.readValue(json, classOf[StringFieldWrapper])
    assertTrue(result.value.contains("some_value"), "Should deserialize string value")

  @Test
  def testDeserializeNestedString(): Unit =
    val json   = """{"fieldName": "some_value"}"""
    val result = mapper.readValue(json, classOf[StringFieldWrapper])
    assertTrue(
      result.value.contains("some_value"),
      "Should deserialize nested string to Some(value)"
    )

  @Test
  def testDeserializeNestedNull(): Unit =
    val json   = """{"fieldName": null}"""
    val result = mapper.readValue(json, classOf[StringFieldWrapper])
    assertTrue(result.value.isEmpty, "Should deserialize nested null to None")
