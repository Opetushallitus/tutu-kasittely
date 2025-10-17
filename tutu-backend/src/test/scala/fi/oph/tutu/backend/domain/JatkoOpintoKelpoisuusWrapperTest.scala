package fi.oph.tutu.backend.domain

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.scala.DefaultScalaModule
import com.fasterxml.jackson.databind.module.SimpleModule
import org.junit.jupiter.api.{BeforeEach, Test}
import org.junit.jupiter.api.Assertions.*

class JatkoOpintoKelpoisuusWrapperTest:
  private var mapper: ObjectMapper = _

  @BeforeEach
  def setUp(): Unit =
    mapper = new ObjectMapper()
    mapper.registerModule(DefaultScalaModule)

    val jatkoOpintoKelpoisuusModule = new SimpleModule()
    jatkoOpintoKelpoisuusModule.addDeserializer(
      classOf[JatkoOpintoKelpoisuusWrapper],
      new JatkoOpintoKelpoisuusWrapperDeserializer()
    )
    mapper.registerModule(jatkoOpintoKelpoisuusModule)

  @Test
  def testDeserializeString(): Unit =
    val json   = "\"kyllä\""
    val result = mapper.readValue(json, classOf[JatkoOpintoKelpoisuusWrapper])
    assertTrue(result.jatkoOpintoKelpoisuus.contains("kyllä"), "Should deserialize string value")

  @Test
  def testDeserializeNestedString(): Unit =
    val json   = """{"jatkoOpintoKelpoisuus": "kyllä"}"""
    val result = mapper.readValue(json, classOf[JatkoOpintoKelpoisuusWrapper])
    assertTrue(
      result.jatkoOpintoKelpoisuus.contains("kyllä"),
      "Should deserialize nested string to Some(value)"
    )

  @Test
  def testDeserializeNestedNull(): Unit =
    val json   = """{"jatkoOpintoKelpoisuus": null}"""
    val result = mapper.readValue(json, classOf[JatkoOpintoKelpoisuusWrapper])
    assertTrue(result.jatkoOpintoKelpoisuus.isEmpty, "Should deserialize nested null to None")

  @Test
  def testFromPartialWithSomeValue(): Unit =
    val wrapper = JatkoOpintoKelpoisuusWrapper(Some("ei"))
    val result  = JatkoOpintoKelpoisuusWrapper.fromPartial(Some(wrapper))
    assertTrue(result.jatkoOpintoKelpoisuus.contains("ei"), "fromPartial should extract Some(value)")

  @Test
  def testFromPartialWithNone(): Unit =
    val wrapper = JatkoOpintoKelpoisuusWrapper(None)
    val result  = JatkoOpintoKelpoisuusWrapper.fromPartial(Some(wrapper))
    assertTrue(result.jatkoOpintoKelpoisuus.isEmpty, "fromPartial should extract None")

  @Test
  def testFromPartialWithNoWrapper(): Unit =
    val result = JatkoOpintoKelpoisuusWrapper.fromPartial(None)
    assertTrue(result.jatkoOpintoKelpoisuus.isEmpty, "fromPartial with None should return None")
