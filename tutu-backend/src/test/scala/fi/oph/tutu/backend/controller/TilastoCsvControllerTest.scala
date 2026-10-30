package fi.oph.tutu.backend.controller

import fi.oph.tutu.backend.IntegrationTestBase
import fi.oph.tutu.backend.domain.*
import fi.oph.tutu.backend.fixture.onrUserFixture
import fi.oph.tutu.backend.security.SecurityConstants
import fi.oph.tutu.backend.service.*
import fi.oph.tutu.backend.utils.{AuditLog, AuditOperation}
import org.hamcrest.Matchers.containsString
import org.junit.jupiter.api.*
import org.junit.jupiter.api.Assertions.{assertEquals, assertTrue}
import org.junit.jupiter.api.TestInstance.Lifecycle
import org.mockito.ArgumentCaptor
import org.mockito.ArgumentMatchers.{any, eq as eqTo}
import org.mockito.Mockito
import org.mockito.Mockito.{never, times, verify}
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.security.test.context.support.{WithAnonymousUser, WithMockUser}
import org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.bean.`override`.mockito.MockitoBean
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.*
import org.springframework.test.web.servlet.setup.{DefaultMockMvcBuilder, MockMvcBuilders, MockMvcConfigurer}
import org.springframework.web.context.WebApplicationContext

import java.nio.charset.StandardCharsets
import java.time.LocalDateTime
import java.util.UUID

@AutoConfigureMockMvc
@TestInstance(Lifecycle.PER_CLASS)
@ActiveProfiles(Array("test"))
class TilastoCsvControllerTest extends IntegrationTestBase {

  @Autowired
  private val context: WebApplicationContext = null
  private var mockMvc: MockMvc               = null

  @MockitoBean
  var auditLog: AuditLog = _

  @MockitoBean
  var userService: UserService = _

  @MockitoBean
  var onrService: OnrService = _

  @MockitoBean
  var koodistoService: KoodistoService = _

  val url      = "/tutu-backend/api/tilastot/tilastokeskus-csv"
  val lomakeId = 1527182L

  val csvHeader: String =
    "hyväksymispvm:n vuosi,hakijan henkilötunnus,tutkinto 1:n suoritusmaa,tutkinto 1:n todistuksen pvm," +
      "tutkinto 1:n koulutusala,tutkinnon tunnustettu taso"

  // Hakemus A: hyväksytty 2024, ylempi korkeakoulu, Ruotsi
  val hakijaOidA = "1.2.246.562.24.00000000001"
  val hetuA      = "010170-789X"
  // Hakemus B: hyväksytty 2025-03, alempi korkeakoulu, Tansania
  val hakijaOidB = "1.2.246.562.24.00000000002"
  val hetuB      = "020280-123A"
  // Hakemus C: hyväksytty 2025-11, hakijalla ei hetua ONR:ssä
  val hakijaOidC = "1.2.246.562.24.00000000003"

  val rowA = s"""2024,$hetuA,Ruotsi,1.6.2010,"72",5"""
  val rowB = s"""2025,$hetuB,Tansania,2.2.2015,"34",4"""
  val rowC = s"""2025,,Ruotsi,3.3.2020,"72",4"""

  @BeforeAll def setup(): Unit = {
    val configurer: MockMvcConfigurer =
      SecurityMockMvcConfigurers.springSecurity()
    val intermediate: DefaultMockMvcBuilder =
      MockMvcBuilders.webAppContextSetup(context).apply(configurer)
    mockMvc = intermediate.build()

    luoHakemusPaatosJaTutkinto(
      "1.2.246.562.11.00000000000000007001",
      hakijaOidA,
      Some(LocalDateTime.parse("2024-06-15T12:00:00")),
      "maatjavaltiot2_752",
      "1.6.2010",
      "koulutusalaoph2002_72",
      TutkintoTaso.YlempiKorkeakoulu
    )
    luoHakemusPaatosJaTutkinto(
      "1.2.246.562.11.00000000000000007002",
      hakijaOidB,
      Some(LocalDateTime.parse("2025-03-10T12:00:00")),
      "maatjavaltiot2_834",
      "2.2.2015",
      "koulutusalaoph2002_34",
      TutkintoTaso.AlempiKorkeakoulu
    )
    luoHakemusPaatosJaTutkinto(
      "1.2.246.562.11.00000000000000007003",
      hakijaOidC,
      Some(LocalDateTime.parse("2025-11-20T12:00:00")),
      "maatjavaltiot2_752",
      "3.3.2020",
      "koulutusalaoph2002_72",
      TutkintoTaso.AlempiKorkeakoulu
    )
    // Päätöstä ei ole hyväksytty, joten tämän ei pitäisi koskaan päätyä CSV:hen
    luoHakemusPaatosJaTutkinto(
      "1.2.246.562.11.00000000000000007004",
      hakijaOidA,
      None,
      "maatjavaltiot2_834",
      "4.4.2021",
      "koulutusalaoph2002_99",
      TutkintoTaso.YlempiKorkeakoulu
    )
  }

  @BeforeEach
  def setupEach(): Unit = {
    Mockito.reset(auditLog, onrService, koodistoService)
    Mockito
      .when(userService.getEnrichedUserDetails(any[Boolean]))
      .thenReturn(
        User(
          userOid = "1.2.246.562.24.00000000000000006666",
          authorities = List(SecurityConstants.SECURITY_ROOLI_CRUD_FULL)
        )
      )
    Mockito
      .when(onrService.haeHenkilot(any[Seq[String]]))
      .thenAnswer { invocation =>
        val henkilot = Map(
          hakijaOidA -> onrUserFixture.copy(oidHenkilo = hakijaOidA, hetu = Some(hetuA)),
          hakijaOidB -> onrUserFixture.copy(oidHenkilo = hakijaOidB, hetu = Some(hetuB)),
          hakijaOidC -> onrUserFixture.copy(oidHenkilo = hakijaOidC, hetu = None)
        )
        Right(invocation.getArgument[Seq[String]](0).flatMap(henkilot.get))
      }
    Mockito
      .when(koodistoService.getKoodisto("maatjavaltiot2"))
      .thenReturn(
        Seq(
          KoodistoItem("maatjavaltiot2_752", "752", Map(Kieli.fi -> "Ruotsi")),
          KoodistoItem("maatjavaltiot2_834", "834", Map(Kieli.fi -> "Tansania"))
        )
      )
  }

  private def luoHakemusPaatosJaTutkinto(
    hakemusOid: String,
    hakijaOid: String,
    hyvaksymispaiva: Option[LocalDateTime],
    maakoodiUri: String,
    todistuksenPaivamaara: String,
    koulutusalaKoodiUri: String,
    tutkintoTaso: TutkintoTaso
  ): UUID = {
    val hakemusId = hakemusRepository.db.run(
      hakemusRepository.tallennaHakemusAction(
        HakemusOid(hakemusOid),
        1,
        lomakeId,
        None,
        asiakirjaRepository.tallennaUudetAsiakirjatiedot(Asiakirja(), "testi"),
        None,
        None,
        "testi",
        hakijaOid = Some(hakijaOid)
      ),
      "luo_tilasto_testihakemus"
    )
    tutkintoRepository.suoritaLisaaTutkinto(
      Tutkinto(
        id = None,
        hakemusId = hakemusId,
        jarjestys = "1",
        maakoodiUri = Some(maakoodiUri),
        todistuksenPaivamaara = Some(todistuksenPaivamaara),
        koulutusalaKoodiUri = Some(koulutusalaKoodiUri)
      ),
      "testi"
    )
    val paatos = paatosRepository.tallennaPaatos(
      hakemusId,
      Paatos(
        ratkaisutyyppi = Some(Ratkaisutyyppi.Paatos),
        hyvaksymispaiva = hyvaksymispaiva
      ),
      "testi"
    )
    paatosRepository.tallennaPaatosTieto(
      paatos.id.get,
      PaatosTieto(
        paatosTyyppi = Some(PaatosTyyppi.Taso),
        myonteinenPaatos = Some(true),
        tutkintoTaso = Some(tutkintoTaso)
      ),
      "testi"
    )
    hakemusId
  }

  private def csvLines(body: String): Seq[String] =
    body.split("\n").toSeq

  @Test
  @WithMockUser(value = "kayttaja", authorities = Array(SecurityConstants.SECURITY_ROOLI_CRUD_FULL))
  def downloadTilastokeskusCsvReturns200WithCsvFromDatabase(): Unit = {
    val result = mockMvc
      .perform(get(url).param("alkuPvm", "2024-01-01T00:00:00Z").param("loppuPvm", "2025-12-31T23:59:59Z"))
      .andExpect(status().isOk)
      .andExpect(header().string("Content-Disposition", "attachment; filename=\"tilastokeskus.csv\""))
      .andExpect(content().contentTypeCompatibleWith("text/csv"))
      .andReturn()

    assertTrue(result.getResponse.getContentType.toLowerCase.contains("charset=utf-8"))

    val body = new String(result.getResponse.getContentAsByteArray, StandardCharsets.UTF_8)
    assertTrue(body.endsWith("\n"))
    val lines = csvLines(body)
    assertEquals(csvHeader, lines.head)
    // Rivien järjestys ei ole taattu. Päätös ilman hyväksymispäivää ei saa olla mukana.
    assertEquals(Set(rowA, rowB, rowC), lines.tail.toSet)
    assertEquals(3, lines.tail.size)

    verify(onrService, times(1)).haeHenkilot(any[Seq[String]])
  }

  @Test
  @WithMockUser(value = "kayttaja", authorities = Array(SecurityConstants.SECURITY_ROOLI_CRUD_FULL))
  def downloadTilastokeskusCsvWithoutParamsReturnsAllApprovedPaatokset(): Unit = {
    val result = mockMvc
      .perform(get(url))
      .andExpect(status().isOk)
      .andReturn()

    val lines = csvLines(new String(result.getResponse.getContentAsByteArray, StandardCharsets.UTF_8))
    assertEquals(csvHeader, lines.head)
    assertEquals(Set(rowA, rowB, rowC), lines.tail.toSet)
  }

  @Test
  @WithMockUser(value = "kayttaja", authorities = Array(SecurityConstants.SECURITY_ROOLI_CRUD_FULL))
  def downloadTilastokeskusCsvFiltersByAlkuPvmAndLoppuPvm(): Unit = {
    val result = mockMvc
      .perform(get(url).param("alkuPvm", "2025-01-01T00:00:00Z").param("loppuPvm", "2025-12-31T23:59:59Z"))
      .andExpect(status().isOk)
      .andReturn()

    val lines = csvLines(new String(result.getResponse.getContentAsByteArray, StandardCharsets.UTF_8))
    assertEquals(Set(rowB, rowC), lines.tail.toSet)
  }

  @Test
  @WithMockUser(value = "kayttaja", authorities = Array(SecurityConstants.SECURITY_ROOLI_CRUD_FULL))
  def downloadTilastokeskusCsvFiltersByOnlyAlkuPvm(): Unit = {
    val result = mockMvc
      .perform(get(url).param("alkuPvm", "2025-06-01T00:00:00Z"))
      .andExpect(status().isOk)
      .andReturn()

    val lines = csvLines(new String(result.getResponse.getContentAsByteArray, StandardCharsets.UTF_8))
    assertEquals(Seq(rowC), lines.tail)
  }

  @Test
  @WithMockUser(value = "kayttaja", authorities = Array(SecurityConstants.SECURITY_ROOLI_CRUD_FULL))
  def downloadTilastokeskusCsvFiltersByOnlyLoppuPvm(): Unit = {
    val result = mockMvc
      .perform(get(url).param("loppuPvm", "2024-12-31T23:59:59Z"))
      .andExpect(status().isOk)
      .andReturn()

    val lines = csvLines(new String(result.getResponse.getContentAsByteArray, StandardCharsets.UTF_8))
    assertEquals(Seq(rowA), lines.tail)
  }

  @Test
  @WithMockUser(value = "kayttaja", authorities = Array(SecurityConstants.SECURITY_ROOLI_CRUD_FULL))
  def downloadTilastokeskusCsvReturnsHeaderOnlyWhenNoDataInRange(): Unit = {
    mockMvc
      .perform(get(url).param("alkuPvm", "2020-01-01T00:00:00Z").param("loppuPvm", "2020-12-31T23:59:59Z"))
      .andExpect(status().isOk)
      .andExpect(content().bytes(s"$csvHeader\n".getBytes(StandardCharsets.UTF_8)))
  }

  @Test
  @WithMockUser(value = "kayttaja", authorities = Array(SecurityConstants.SECURITY_ROOLI_CRUD_FULL))
  def downloadTilastokeskusCsvWritesAuditLogOnSuccess(): Unit = {
    mockMvc
      .perform(get(url).param("alkuPvm", "2025-01-01T00:00:00Z").param("loppuPvm", "2025-12-31T23:59:59Z"))
      .andExpect(status().isOk)

    val tunniste = ArgumentCaptor.forClass(classOf[String])
    verify(auditLog, times(1)).logRead(
      eqTo("tilastokeskus-csv"),
      tunniste.capture(),
      eqTo(AuditOperation.ReadTilastokeskusCsv),
      any()
    )
    assertTrue(tunniste.getValue.contains("2025-01-01T00:00:00Z"))
    assertTrue(tunniste.getValue.contains("2025-12-31T23:59:59Z"))
  }

  @Test
  @WithMockUser(value = "kayttaja", authorities = Array(SecurityConstants.SECURITY_ROOLI_CRUD_FULL))
  def downloadTilastokeskusCsvReturns500WhenOnrFails(): Unit = {
    Mockito
      .doReturn(Left(OnrServiceException("ONR virhe")))
      .when(onrService)
      .haeHenkilot(any[Seq[String]])

    mockMvc
      .perform(get(url))
      .andExpect(status().isInternalServerError)
      .andExpect(jsonPath("$.origin").value("oppijanumerorekisteri"))
      .andExpect(jsonPath("$.message").value("ONR virhe"))

    verify(auditLog, never()).logRead(any(), any(), any(), any())
  }

  @Test
  @WithMockUser(value = "kayttaja", authorities = Array(SecurityConstants.SECURITY_ROOLI_CRUD_FULL))
  def downloadTilastokeskusCsvReturns500WhenUnexpectedExceptionThrown(): Unit = {
    Mockito
      .doThrow(new RuntimeException("boom"))
      .when(koodistoService)
      .getKoodisto("maatjavaltiot2")

    mockMvc
      .perform(get(url))
      .andExpect(status().isInternalServerError)
      .andExpect(jsonPath("$.origin").value(""))
      .andExpect(jsonPath("$.message").value("boom"))

    verify(auditLog, never()).logRead(any(), any(), any(), any())
  }

  @Test
  @WithMockUser(value = "kayttaja", authorities = Array(SecurityConstants.SECURITY_ROOLI_CRUD_FULL))
  def downloadTilastokeskusCsvReturns400WhenAlkuPvmInvalid(): Unit = {
    mockMvc
      .perform(get(url).param("alkuPvm", "not-a-date").param("loppuPvm", "2025-12-31T23:59:59Z"))
      .andExpect(status().isBadRequest)
      .andExpect(jsonPath("$.message").value(containsString("alkuPvm")))

    verifyNoExternalCallsOrAudit()
  }

  @Test
  @WithMockUser(value = "kayttaja", authorities = Array(SecurityConstants.SECURITY_ROOLI_CRUD_FULL))
  def downloadTilastokeskusCsvReturns400WhenLoppuPvmInvalid(): Unit = {
    mockMvc
      .perform(get(url).param("alkuPvm", "2025-01-01T00:00:00Z").param("loppuPvm", "2025-13-45T00:00:00Z"))
      .andExpect(status().isBadRequest)
      .andExpect(jsonPath("$.message").value(containsString("loppuPvm")))

    verifyNoExternalCallsOrAudit()
  }

  @Test
  @WithMockUser(value = "kayttaja", authorities = Array(SecurityConstants.SECURITY_ROOLI_CRUD_FULL))
  def downloadTilastokeskusCsvReturns400WhenAlkuPvmAfterLoppuPvm(): Unit = {
    mockMvc
      .perform(get(url).param("alkuPvm", "2025-12-31T23:59:59Z").param("loppuPvm", "2025-01-01T00:00:00Z"))
      .andExpect(status().isBadRequest)
      .andExpect(jsonPath("$.message").value(containsString("alkuPvm")))

    verifyNoExternalCallsOrAudit()
  }

  @Test
  @WithMockUser(value = "kayttaja", authorities = Array(SecurityConstants.SECURITY_ROOLI_CRUD_FULL))
  def downloadTilastokeskusCsvReturns400WhenDateHasNoTimeOrIsEmpty(): Unit = {
    mockMvc
      .perform(get(url).param("alkuPvm", "2025-01-01"))
      .andExpect(status().isBadRequest)

    mockMvc
      .perform(get(url).param("alkuPvm", ""))
      .andExpect(status().isBadRequest)

    verifyNoExternalCallsOrAudit()
  }

  @Test
  @WithAnonymousUser
  def downloadTilastokeskusCsvReturns401ForAnonymousUser(): Unit = {
    mockMvc
      .perform(get(url).param("alkuPvm", "2025-01-01T00:00:00Z").param("loppuPvm", "2025-12-31T23:59:59Z"))
      .andExpect(status().isUnauthorized)

    verifyNoExternalCallsOrAudit()
  }

  private def verifyNoExternalCallsOrAudit(): Unit = {
    verify(onrService, never()).haeHenkilot(any[Seq[String]])
    verify(auditLog, never()).logRead(any(), any(), any(), any())
  }
}
