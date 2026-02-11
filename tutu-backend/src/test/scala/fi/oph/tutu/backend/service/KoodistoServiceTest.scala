package fi.oph.tutu.backend.service

import fi.oph.tutu.backend.UnitTestBase
import fi.oph.tutu.backend.domain.Kieli
import fi.vm.sade.javautils.nio.cas.CasClient
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.{BeforeEach, Test}
import org.mockito.ArgumentMatchers.any
import org.mockito.Mockito.when
import org.mockito.{Mock, MockitoAnnotations}

class KoodistoServiceTest extends UnitTestBase {
  @Mock
  var httpService: HttpService = _

  @Mock
  var maakoodiService: MaakoodiService = _

  var koodistoService: KoodistoService = _

  @BeforeEach
  def setup(): Unit = {
    MockitoAnnotations.openMocks(this)
    koodistoService = new KoodistoService(httpService, maakoodiService)
  }

  @Test
  def testGetKoodisto(): Unit = {
    when(httpService.get(any[CasClient], any[String])).thenReturn(Right(loadJson("maatJaValtiotKoodisto.json")))
    val maatJaValtiot = koodistoService.getKoodisto("maatJaValtiot2").toList
    assertEquals(maatJaValtiot.size, 3)

    assertEquals("maatjavaltiot2_246", maatJaValtiot.head.koodiUri)
    assertEquals("246", maatJaValtiot.head.koodiArvo)
    assertEquals(
      Map(Kieli.valueOf("fi") -> "Suomi", Kieli.valueOf("sv") -> "Finland", Kieli.valueOf("en") -> "Finland"),
      maatJaValtiot.head.nimi
    )

    assertEquals("maatjavaltiot2_702", maatJaValtiot(1).koodiUri)
    assertEquals("702", maatJaValtiot(1).koodiArvo)
    assertEquals(
      Map(Kieli.valueOf("fi") -> "Singapore", Kieli.valueOf("sv") -> "Singapore", Kieli.valueOf("en") -> "Singapore"),
      maatJaValtiot(1).nimi
    )

    assertEquals("maatjavaltiot2_752", maatJaValtiot.last.koodiUri)
    assertEquals("752", maatJaValtiot.last.koodiArvo)
    assertEquals(
      Map(Kieli.valueOf("fi") -> "Ruotsi", Kieli.valueOf("sv") -> "Sverige", Kieli.valueOf("en") -> "Sweden"),
      maatJaValtiot.last.nimi
    )
  }
}
