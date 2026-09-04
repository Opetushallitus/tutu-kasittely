package fi.oph.tutu.backend.domain

import fi.oph.tutu.backend.UnitTestBase
import fi.oph.tutu.backend.utils.TutuJsonFormats
import org.json4s.jackson.Serialization
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test

import java.time.LocalDateTime

class ValitusKHOSerializationTest extends UnitTestBase with TutuJsonFormats {

  @Test
  def valitusKHORoundTripsWithPopulatedLocalDateTimeFields(): Unit = {
    val valitusKHO = ValitusKHO(
      valitettu = Some(true),
      valitusPvm = Some(LocalDateTime.of(2026, 9, 1, 0, 0, 0)),
      ratkaisuPvm = Some(LocalDateTime.of(2026, 9, 15, 12, 30, 0))
    )

    val json   = Serialization.write(valitusKHO)
    val result = Serialization.read[ValitusKHO](json)

    assertEquals(valitusKHO, result)
  }

  @Test
  def valitusKHORoundTripsWithEmptyFields(): Unit = {
    val valitusKHO = ValitusKHO(valitettu = None, valitusPvm = None, ratkaisuPvm = None)

    val json   = Serialization.write(valitusKHO)
    val result = Serialization.read[ValitusKHO](json)

    assertEquals(valitusKHO, result)
  }
}
