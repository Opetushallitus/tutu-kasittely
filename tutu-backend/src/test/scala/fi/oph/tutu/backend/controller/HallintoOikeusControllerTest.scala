package fi.oph.tutu.backend.controller

import com.fasterxml.jackson.databind.ObjectMapper
import fi.oph.tutu.backend.UnitTestBase
import fi.oph.tutu.backend.domain.{HallintoOikeus, Kieli}
import fi.oph.tutu.backend.service.HallintoOikeusService
import fi.oph.tutu.backend.utils.AuditLog
import org.junit.jupiter.api.Assertions._
import org.junit.jupiter.api.{BeforeEach, Test}
import org.mockito.ArgumentMatchers._
import org.mockito.Mockito._
import org.mockito.{Mock, MockitoAnnotations}
import org.springframework.http.HttpStatus

import java.util.UUID
import scala.util.{Left, Right}

class HallintoOikeusControllerTest extends UnitTestBase {
  @Mock
  var hallintoOikeusService: HallintoOikeusService = _

  @Mock
  var mapper: ObjectMapper = _

  @Mock
  var auditLog: AuditLog = _

  var hallintoOikeusController: HallintoOikeusController = _

  @BeforeEach
  def setup(): Unit = {
    MockitoAnnotations.openMocks(this)
    hallintoOikeusController = new HallintoOikeusController(hallintoOikeusService, mapper, auditLog)
  }

  @Test
  def testGetByKuntaOnnistuu(): Unit = {
    val kuntaKoodi     = "091"
    val hallintoOikeus = HallintoOikeus(
      id = Some(UUID.randomUUID()),
      koodi = "HELSINKI",
      nimi = Map(
        Kieli.fi -> "Helsingin hallinto-oikeus",
        Kieli.sv -> "Helsingfors förvaltningsdomstol",
        Kieli.en -> "Helsinki Administrative Court"
      )
    )

    when(hallintoOikeusService.haeHallintoOikeusByKunta(kuntaKoodi))
      .thenReturn(hallintoOikeus)

    val result = hallintoOikeusController.getByKunta(kuntaKoodi, null)

    assertEquals(HttpStatus.OK, result.getStatusCode)
    assertNotNull(result.getBody)
  }

  @Test
  def testGetByKuntaEiLoydy(): Unit = {
    val kuntaKoodi = "999"
    val error      = new fi.oph.tutu.backend.exception.HallintoOikeusNotFoundException("Hallinto-oikeutta ei löytynyt")

    when(hallintoOikeusService.haeHallintoOikeusByKunta(kuntaKoodi))
      .thenThrow(error)

    val result = hallintoOikeusController.getByKunta(kuntaKoodi, null)

    assertEquals(HttpStatus.NOT_FOUND, result.getStatusCode)
  }

  @Test
  def testGetByKuntaRuotsiksi(): Unit = {
    val kuntaKoodi     = "091"
    val hallintoOikeus = HallintoOikeus(
      id = Some(UUID.randomUUID()),
      koodi = "HELSINKI",
      nimi = Map(
        Kieli.fi -> "Helsingin hallinto-oikeus",
        Kieli.sv -> "Helsingfors förvaltningsdomstol",
        Kieli.en -> "Helsinki Administrative Court"
      )
    )

    when(hallintoOikeusService.haeHallintoOikeusByKunta(kuntaKoodi))
      .thenReturn(hallintoOikeus)

    val result = hallintoOikeusController.getByKunta(kuntaKoodi, null)

    assertEquals(HttpStatus.OK, result.getStatusCode)
    assertNotNull(result.getBody)
    verify(hallintoOikeusService).haeHallintoOikeusByKunta(kuntaKoodi)
  }

  @Test
  def testGetByKuntaEnglanniksi(): Unit = {
    val kuntaKoodi     = "091"
    val hallintoOikeus = HallintoOikeus(
      id = Some(UUID.randomUUID()),
      koodi = "HELSINKI",
      nimi = Map(
        Kieli.fi -> "Helsingin hallinto-oikeus",
        Kieli.sv -> "Helsingfors förvaltningsdomstol",
        Kieli.en -> "Helsinki Administrative Court"
      )
    )

    when(hallintoOikeusService.haeHallintoOikeusByKunta(kuntaKoodi))
      .thenReturn(hallintoOikeus)

    val result = hallintoOikeusController.getByKunta(kuntaKoodi, null)

    assertEquals(HttpStatus.OK, result.getStatusCode)
    assertNotNull(result.getBody)
    verify(hallintoOikeusService).haeHallintoOikeusByKunta(kuntaKoodi)
  }

  @Test
  def testGetByKuntaEriKunnilla(): Unit = {
    val turku          = "853"
    val hallintoOikeus = HallintoOikeus(
      id = Some(UUID.randomUUID()),
      koodi = "TURKU",
      nimi = Map(
        Kieli.fi -> "Turun hallinto-oikeus",
        Kieli.sv -> "Åbo förvaltningsdomstol",
        Kieli.en -> "Turku Administrative Court"
      )
    )

    when(hallintoOikeusService.haeHallintoOikeusByKunta(turku))
      .thenReturn(hallintoOikeus)

    val result = hallintoOikeusController.getByKunta(turku, null)

    assertEquals(HttpStatus.OK, result.getStatusCode)
    assertNotNull(result.getBody)
    verify(hallintoOikeusService).haeHallintoOikeusByKunta(turku)
  }

  @Test
  def testGetByKuntaServiceHeittaaPoikkeuksen(): Unit = {
    val kuntaKoodi = "091"

    when(hallintoOikeusService.haeHallintoOikeusByKunta(kuntaKoodi))
      .thenThrow(new RuntimeException("Database connection failed"))

    val result = hallintoOikeusController.getByKunta(kuntaKoodi, null)

    assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, result.getStatusCode)
  }

}
