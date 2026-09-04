package fi.oph.tutu.backend.controller

import fi.oph.tutu.backend.UnitTestBase
import fi.oph.tutu.backend.domain.{
  HakemusOid,
  User,
  ValitusHO,
  ValitusKHO,
  ValitusKHORatkaisu,
  ValitusOPH,
  Valitustiedot
}
import fi.oph.tutu.backend.exception.ValitustiedotValidationException
import fi.oph.tutu.backend.service.{HakemusService, UserService, ValitustiedotService}
import fi.oph.tutu.backend.utils.AuditLog
import fi.oph.tutu.backend.utils.AuditOperation.{CreateValitustiedot, UpdateValitustiedot}
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.{BeforeEach, Test}
import org.mockito.ArgumentMatchers.{any, eq as eqTo}
import org.mockito.Mockito.*
import org.mockito.{ArgumentCaptor, Mock, MockitoAnnotations}
import org.springframework.http.HttpStatus

import java.nio.charset.StandardCharsets
import java.time.LocalDateTime
import java.util.UUID

class ValitustiedotControllerTest extends UnitTestBase {
  @Mock
  var valitustiedotService: ValitustiedotService = _

  @Mock
  var hakemusService: HakemusService = _

  @Mock
  var userService: UserService = _

  @Mock
  var auditLog: AuditLog = _

  var valitustiedotController: ValitustiedotController = _

  private val hakemusOid = HakemusOid("1.2.246.562.11.00000000000000000123")
  private val user       = User(userOid = "1.2.246.562.24.12345678901", authorities = List())

  @BeforeEach
  def setup(): Unit = {
    MockitoAnnotations.openMocks(this)
    valitustiedotController =
      new ValitustiedotController(valitustiedotService, hakemusService, userService, mapper, auditLog)
    when(userService.getEnrichedUserDetails(true)).thenReturn(user)
  }

  private def valitusKHOWithPvms: ValitusKHO = ValitusKHO(
    valitettu = Some(true),
    valitusPvm = Some(LocalDateTime.of(2026, 9, 1, 0, 0, 0)),
    ratkaisuPvm = Some(LocalDateTime.of(2026, 9, 15, 12, 30, 0)),
    ratkaisu = Some(ValitusKHORatkaisu.HakijanVaatimusHylatty),
    ratkaisuLisatieto = Some("Lisätietoa KHO:n ratkaisusta")
  )

  @Test
  def getValitustiedotPalauttaa200(): Unit = {
    val valitustiedot = Valitustiedot(
      id = Some(UUID.randomUUID()),
      hakemusId = Some(UUID.randomUUID()),
      valitusOPH = ValitusOPH(),
      valitusHO = ValitusHO(),
      valitusKHO = valitusKHOWithPvms
    )

    when(valitustiedotService.haeValitustiedot(hakemusOid)).thenReturn(Some(valitustiedot))

    val result = valitustiedotController.getValitustiedot(hakemusOid.s, null)

    assertEquals(HttpStatus.OK, result.getStatusCode)
    assertEquals(mapper.writeValueAsString(valitustiedot), result.getBody)
  }

  @Test
  def getValitustiedotEiLoydyPalauttaa200JaTyhjanPohjan(): Unit = {
    when(valitustiedotService.haeValitustiedot(hakemusOid)).thenReturn(None)

    val result = valitustiedotController.getValitustiedot(hakemusOid.s, null)

    assertEquals(HttpStatus.OK, result.getStatusCode)
    assertEquals(
      mapper.writeValueAsString(
        Valitustiedot(
          valitusOPH = ValitusOPH(),
          valitusHO = ValitusHO(),
          valitusKHO = ValitusKHO()
        )
      ),
      result.getBody
    )
  }

  @Test
  def getValitustiedotPoikkeusPalauttaa500(): Unit = {
    when(valitustiedotService.haeValitustiedot(hakemusOid))
      .thenThrow(new RuntimeException("Database connection failed"))

    val result = valitustiedotController.getValitustiedot(hakemusOid.s, null)

    assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, result.getStatusCode)
  }

  @Test
  def tallennaValitustiedotLuoUudenPalauttaa200(): Unit = {
    val lahetetty = Valitustiedot(
      valitusOPH = ValitusOPH(),
      valitusHO = ValitusHO(),
      valitusKHO = valitusKHOWithPvms
    )
    val tallennettu = lahetetty.copy(id = Some(UUID.randomUUID()), hakemusId = Some(UUID.randomUUID()))

    val captor = ArgumentCaptor.forClass(classOf[Valitustiedot])
    when(
      valitustiedotService.tallennaValitustiedot(
        eqTo(hakemusOid),
        captor.capture(),
        eqTo(user.userOid)
      )
    ).thenReturn((None, Some(tallennettu)))

    val bytes  = mapper.writeValueAsString(lahetetty).getBytes(StandardCharsets.UTF_8)
    val result = valitustiedotController.tallennaValitustiedot(hakemusOid.s, bytes, null)

    assertEquals(HttpStatus.OK, result.getStatusCode)
    assertEquals(mapper.writeValueAsString(tallennettu), result.getBody)
    assertEquals(lahetetty.valitusKHO, captor.getValue.valitusKHO)
    verify(auditLog, times(1)).logCreate(any(), any(), eqTo(CreateValitustiedot), any())
  }

  @Test
  def tallennaValitustiedotPaivittaaOlemassaOlevanPalauttaa200(): Unit = {
    val vanha = Valitustiedot(
      id = Some(UUID.randomUUID()),
      hakemusId = Some(UUID.randomUUID()),
      valitusOPH = ValitusOPH(),
      valitusHO = ValitusHO(),
      valitusKHO = ValitusKHO()
    )
    val paivitetty = vanha.copy(valitusKHO = valitusKHOWithPvms)

    when(
      valitustiedotService.tallennaValitustiedot(
        eqTo(hakemusOid),
        any(classOf[Valitustiedot]),
        eqTo(user.userOid)
      )
    ).thenReturn((Some(vanha), Some(paivitetty)))

    val bytes  = mapper.writeValueAsString(paivitetty).getBytes(StandardCharsets.UTF_8)
    val result = valitustiedotController.tallennaValitustiedot(hakemusOid.s, bytes, null)

    assertEquals(HttpStatus.OK, result.getStatusCode)
    assertEquals(mapper.writeValueAsString(paivitetty), result.getBody)
    verify(auditLog, times(1)).logChanges(any(), any(), eqTo(UpdateValitustiedot), any())
  }

  @Test
  def tallennaValitustiedotEpaonnistuuPalauttaa500(): Unit = {
    when(
      valitustiedotService.tallennaValitustiedot(
        eqTo(hakemusOid),
        any(classOf[Valitustiedot]),
        eqTo(user.userOid)
      )
    ).thenReturn((None, None))

    val lahetetty = Valitustiedot(valitusOPH = ValitusOPH(), valitusHO = ValitusHO(), valitusKHO = ValitusKHO())
    val bytes     = mapper.writeValueAsString(lahetetty).getBytes(StandardCharsets.UTF_8)
    val result    = valitustiedotController.tallennaValitustiedot(hakemusOid.s, bytes, null)

    assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, result.getStatusCode)
  }

  @Test
  def tallennaValitustiedotPoikkeusPalauttaa400(): Unit = {
    when(
      valitustiedotService.tallennaValitustiedot(
        eqTo(hakemusOid),
        any(classOf[Valitustiedot]),
        eqTo(user.userOid)
      )
    ).thenThrow(new RuntimeException("Tallennus epäonnistui"))

    val lahetetty = Valitustiedot(valitusOPH = ValitusOPH(), valitusHO = ValitusHO(), valitusKHO = ValitusKHO())
    val bytes     = mapper.writeValueAsString(lahetetty).getBytes(StandardCharsets.UTF_8)
    val result    = valitustiedotController.tallennaValitustiedot(hakemusOid.s, bytes, null)

    assertEquals(HttpStatus.BAD_REQUEST, result.getStatusCode)
  }

  @Test
  def tallennaValitustiedotEpakelvotKhoPaivamaaratPalauttaa400(): Unit = {
    val virheviesti = "KHO:n ratkaisupäivä ei voi olla ennen valituspäivää"
    when(
      valitustiedotService.tallennaValitustiedot(
        eqTo(hakemusOid),
        any(classOf[Valitustiedot]),
        eqTo(user.userOid)
      )
    ).thenThrow(new ValitustiedotValidationException(virheviesti))

    val lahetetty = Valitustiedot(
      valitusOPH = ValitusOPH(),
      valitusHO = ValitusHO(),
      valitusKHO = ValitusKHO(
        valitettu = Some(true),
        valitusPvm = Some(LocalDateTime.of(2026, 9, 15, 0, 0, 0)),
        ratkaisuPvm = Some(LocalDateTime.of(2026, 9, 1, 0, 0, 0))
      )
    )
    val bytes  = mapper.writeValueAsString(lahetetty).getBytes(StandardCharsets.UTF_8)
    val result = valitustiedotController.tallennaValitustiedot(hakemusOid.s, bytes, null)

    assertEquals(HttpStatus.BAD_REQUEST, result.getStatusCode)
    assertTrue(result.getBody.asInstanceOf[String].contains(virheviesti))
  }
}
