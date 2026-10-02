package fi.oph.tutu.backend.domain

import fi.oph.tutu.backend.UnitTestBase
import fi.oph.tutu.backend.utils.TutuJsonFormats
import org.json4s.jackson.Serialization
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test

import java.time.LocalDateTime

class ValitusHaOSerializationTest extends UnitTestBase with TutuJsonFormats {

  @Test
  def valitusHaORoundTripsWithPopulatedLocalDateTimeFields(): Unit = {
    val valitusHaO = ValitusHaO(
      valitettu = true,
      valitusPvm = Some(LocalDateTime.of(2026, 9, 1, 0, 0, 0)),
      ratkaisuPvm = Some(LocalDateTime.of(2026, 9, 15, 12, 30, 0)),
      lausuntopyyntoValittu = true,
      lausuntopyynto = ValitusLausuntopyynto(
        ashaTunnus = Some("ASHA-123"),
        saapumisPvm = Some(LocalDateTime.of(2026, 9, 16, 0, 0, 0)),
        maaraAikaPvm = Some(LocalDateTime.of(2026, 9, 30, 0, 0, 0)),
        lausuntoAnnettuPvm = Some(LocalDateTime.of(2026, 9, 25, 0, 0, 0))
      ),
      valittajanVaatimus = ValitusHaOValittajanVaatimus(
        taso = true,
        suuntautuminen = false,
        virallisuus = true,
        tiettyKelpoisuus = false,
        kompensaationPoistoTaiVahennysAP = true,
        kompensaationPoistoTaiVahennysUO = false,
        muu = true,
        tasmennys = Some("Tarkentava selitys")
      ),
      ratkaisu = Some("VaatimusHylatty"),
      ratkaisuLisatieto = Some("Lisätietoa HaO:n ratkaisusta")
    )

    val json   = Serialization.write(valitusHaO)
    val result = Serialization.read[ValitusHaO](json)

    assertEquals(valitusHaO, result)
  }

  @Test
  def valitusHaORoundTripsWithEmptyFields(): Unit = {
    val valitusHaO = ValitusHaO(valitettu = false, valitusPvm = None, ratkaisuPvm = None)

    val json   = Serialization.write(valitusHaO)
    val result = Serialization.read[ValitusHaO](json)

    assertEquals(valitusHaO, result)
  }

  @Test
  def valitusHaOUsesDefaultsForMissingFieldsWhenReadFromDb(): Unit = {
    assertEquals(ValitusHaO(), Serialization.read[ValitusHaO]("{}"))
  }

  @Test
  def valitusHaOUsesDefaultsForNullFieldsWhenReadFromDb(): Unit = {
    assertEquals(
      ValitusHaO(),
      Serialization.read[ValitusHaO]("""{"valitettu": null, "lausuntopyynto": null, "valittajanVaatimus": null}""")
    )
  }

  @Test
  def valitusHaOUsesDefaultsForMissingAndNullFieldsInRequest(): Unit = {
    assertEquals(ValitusHaO(), mapper.readValue("{}", classOf[ValitusHaO]))
    assertEquals(
      ValitusHaO(),
      mapper.readValue(
        """{"valitettu": null, "lausuntopyynto": null, "valittajanVaatimus": null}""",
        classOf[ValitusHaO]
      )
    )
  }
}
