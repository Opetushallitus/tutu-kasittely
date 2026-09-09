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
      valitettu = Some(true),
      valitusPvm = Some(LocalDateTime.of(2026, 9, 1, 0, 0, 0)),
      ratkaisuPvm = Some(LocalDateTime.of(2026, 9, 15, 12, 30, 0)),
      lausuntopyyntoValittu = Some(true),
      lausuntopyynto = Some(
        ValitusLausuntopyynto(
          ashaTunnus = Some("ASHA-123"),
          saapumisPvm = Some(LocalDateTime.of(2026, 9, 16, 0, 0, 0)),
          maaraAikaPvm = Some(LocalDateTime.of(2026, 9, 30, 0, 0, 0)),
          lausuntoAnnettuPvm = Some(LocalDateTime.of(2026, 9, 25, 0, 0, 0))
        )
      ),
      valittajanVaatimus = Some(
        ValitusHaOValittajanVaatimus(
          taso = Some(true),
          suuntautuminen = Some(false),
          virallisuus = Some(true),
          tiettyKelpoisuus = Some(false),
          kompensaationPoistoTaiVahennysAP = Some(true),
          kompensaationPoistoTaiVahennysUO = Some(false),
          muu = Some(true),
          tasmennys = Some("Tarkentava selitys")
        )
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
    val valitusHaO = ValitusHaO(valitettu = None, valitusPvm = None, ratkaisuPvm = None)

    val json   = Serialization.write(valitusHaO)
    val result = Serialization.read[ValitusHaO](json)

    assertEquals(valitusHaO, result)
  }
}
