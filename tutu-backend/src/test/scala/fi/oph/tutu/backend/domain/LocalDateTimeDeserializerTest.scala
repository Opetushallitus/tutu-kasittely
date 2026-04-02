package fi.oph.tutu.backend.domain

import fi.oph.tutu.backend.UnitTestBase
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test

import java.time.LocalDateTime
import java.time.ZoneId

class LocalDateTimeDeserializerTest extends UnitTestBase {

  // Expected LocalDateTime for both formats
  private val expected = LocalDateTime.of(2026, 4, 7, 21, 0, 0)

  // ----- ImiPyynto -----

  @Test
  def imiPyyntoLahetettyDeserializes(): Unit = {
    val json =
      """{"imiPyynto": true, "imiPyyntoNumero": null,
          "imiPyyntoLahetetty": "2026-04-07T21:00:00.000Z", "imiPyyntoVastattu": null}"""

    val result = mapper.readValue(json, classOf[ImiPyynto])
    assertEquals(expected, result.imiPyyntoLahetetty.get)
  }

  @Test
  def imiPyyntoVastattuDeserializes(): Unit = {
    val json =
      """{"imiPyynto": true, "imiPyyntoNumero": null,
          "imiPyyntoLahetetty": null, "imiPyyntoVastattu": "2026-04-07T21:00:00.000Z"}"""

    val result = mapper.readValue(json, classOf[ImiPyynto])
    assertEquals(expected, result.imiPyyntoVastattu.get)
  }

  // ----- ValmistumisenVahvistus -----

  @Test
  def valmistumisenVahvistusPyyntoLahetettyDeserializes(): Unit = {
    val json =
      """{"valmistumisenVahvistus": true,
          "valmistumisenVahvistusPyyntoLahetetty": "2026-04-07T21:00:00.000Z",
          "valmistumisenVahvistusSaatu": null,
          "valmistumisenVahvistusVastaus": null,
          "valmistumisenVahvistusLisatieto": null}"""

    val result = mapper.readValue(json, classOf[ValmistumisenVahvistus])
    assertEquals(expected, result.valmistumisenVahvistusPyyntoLahetetty.get)
  }

  @Test
  def valmistumisenVahvistusSaatuDeserializes(): Unit = {
    val json =
      """{"valmistumisenVahvistus": true,
          "valmistumisenVahvistusPyyntoLahetetty": null,
          "valmistumisenVahvistusSaatu": "2026-04-07T21:00:00.000Z",
          "valmistumisenVahvistusVastaus": null,
          "valmistumisenVahvistusLisatieto": null}"""

    val result = mapper.readValue(json, classOf[ValmistumisenVahvistus])
    assertEquals(expected, result.valmistumisenVahvistusSaatu.get)
  }

  // ----- Asiakirja (viimeinenAsiakirjaHakijalta) -----

  @Test
  def asiakirjaViimeinenHakijaltaDeserializes(): Unit = {
    val json = """{"viimeinenAsiakirjaHakijalta": "2026-04-07T21:00:00.000Z"}"""

    val result = mapper.readValue(json, classOf[Asiakirja])
    assertEquals(expected, result.viimeinenAsiakirjaHakijalta.get)
  }

  // ----- Jackson global LocalDateTime  -----

  @Test
  def mapperDeserializesLocalDateTime(): Unit = {
    val json = """"2026-04-07T21:00:00.000Z""""

    val result = mapper.readValue(json, classOf[LocalDateTime])
    assertEquals(expected, result)
  }

  @Test
  def mapperSerializesLocalDateTime(): Unit = {
    val result = mapper.writeValueAsString(expected)
    assertEquals("\"2026-04-07T21:00:00.000Z\"", result)
  }

  // Backend aika käyttää aina UTC:tä jopa testeissä
  @Test
  def timeZoneOnUTC(): Unit = {
    assertEquals("UTC", ZoneId.systemDefault().getId)
  }
}
