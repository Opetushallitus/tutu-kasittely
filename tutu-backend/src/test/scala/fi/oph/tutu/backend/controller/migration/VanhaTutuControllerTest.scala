package fi.oph.tutu.backend.controller.migration

import com.fasterxml.jackson.databind.{ObjectMapper, SerializationFeature}
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule
import com.fasterxml.jackson.module.scala.DefaultScalaModule
import fi.oph.tutu.backend.IntegrationTestBase
import fi.oph.tutu.backend.domain.*
import fi.oph.tutu.backend.repository.migration.VanhaTutuRepository
import fi.oph.tutu.backend.service.UserService
import fi.oph.tutu.backend.service.migration.VanhaTutuService
import fi.oph.tutu.backend.service.migration.MigrationService
import fi.oph.tutu.backend.utils.{AuditLog, AuditOperation}
import fi.vm.sade.auditlog.{Changes, User as AuditUser}
import jakarta.servlet.http.HttpServletRequest
import org.junit.jupiter.api.*
import org.junit.jupiter.api.TestInstance.Lifecycle
import org.mockito.ArgumentMatchers.{any, eq as eqTo}
import org.mockito.Mockito
import org.mockito.Mockito.{times, verify}
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.http.MediaType
import org.springframework.security.test.context.support.{WithAnonymousUser, WithMockUser}
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf
import org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.bean.`override`.mockito.MockitoBean
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.*
import org.springframework.test.web.servlet.setup.{DefaultMockMvcBuilder, MockMvcBuilders, MockMvcConfigurer}
import org.springframework.web.context.WebApplicationContext

import java.net.InetAddress
import java.util.UUID
import scala.util.{Failure, Success}

@AutoConfigureMockMvc
@TestInstance(Lifecycle.PER_CLASS)
@ActiveProfiles(Array("test"))
class VanhaTutuControllerTest extends IntegrationTestBase {

  @Autowired
  private val context: WebApplicationContext = null
  private var mockMvc: MockMvc               = _

  @Autowired
  var vanhaTutuRepository: VanhaTutuRepository = _

  @MockitoBean
  var auditLog: AuditLog = _

  @MockitoBean
  var migrationService: MigrationService = _

  @MockitoBean
  var userService: UserService = _

  final val esittelijaOid: String = "1.2.246.562.24.00000000000000006666"
  val mockUser: User              = User(esittelijaOid, List("ROLE_USER"), Some("fi"))

  private val mapper = new ObjectMapper()
  mapper.registerModule(DefaultScalaModule)
  mapper.registerModule(new JavaTimeModule)
  mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS)

  @BeforeAll
  def setup(): Unit = {
    val configurer: MockMvcConfigurer =
      SecurityMockMvcConfigurers.springSecurity()
    val intermediate: DefaultMockMvcBuilder =
      MockMvcBuilders.webAppContextSetup(context).apply(configurer)
    mockMvc = intermediate.build()
  }

  @BeforeEach
  def setupTest(): Unit = {
    Mockito
      .when(userService.getEnrichedUserDetails(any()))
      .thenReturn(mockUser)

    try {
      vanhaTutuRepository.deleteAll
    } catch {
      case _: Exception =>
    }
  }

  private def setupTestData(): Unit = {
    val testData1 = Map(
      "name"        -> "John Doe",
      "age"         -> 30,
      "city"        -> "Helsinki",
      "migrationId" -> "test-migration-1"
    )

    val testData2 = Map(
      "name"        -> "Jane Smith",
      "age"         -> 25,
      "city"        -> "Turku",
      "migrationId" -> "test-migration-2"
    )

    vanhaTutuRepository.create(mapper.writeValueAsString(testData1))
    vanhaTutuRepository.create(mapper.writeValueAsString(testData2))
  }

  @Test
  @DisplayName("Aloittaa migraation onnistuneesti")
  @WithMockUser(username = "testuser", roles = Array("USER"))
  def testStartMigrationSuccess(): Unit = {
    Mockito
      .`when`(migrationService.orchestrateMigration(eqTo("test-key")))
      .thenReturn(Success(()))

    mockMvc
      .perform(
        get("/api/migration/start")
          .param("key", "test-key")
          .accept(MediaType.APPLICATION_JSON)
      )
      .andExpect(status().isOk)
      .andExpect(content().contentType(MediaType.APPLICATION_JSON))
      .andExpect(jsonPath("$.status").value("success"))

    verify(migrationService).orchestrateMigration(eqTo("test-key"))
    verify(auditLog).logChanges(
      any[AuditUser],
      eqTo(Map("key" -> "test-key")),
      eqTo(AuditOperation.StartMigration),
      any()
    )
  }

  @Test
  @DisplayName("Hylkää migraation aloituksen ilman autentikointia")
  @WithAnonymousUser
  def testStartMigrationUnauthorized(): Unit = {
    mockMvc
      .perform(
        get("/api/migration/start")
          .param("key", "test-key")
          .accept(MediaType.APPLICATION_JSON)
      )
      .andExpect(status().isUnauthorized)

    verify(migrationService, times(0)).orchestrateMigration(any[String])
    verify(auditLog, times(0)).logChanges(any(), any(), any(), any())
  }

  @Test
  @DisplayName("Käsittelee migraation aloituksen virheen")
  @WithMockUser(username = "testuser", roles = Array("USER"))
  def testStartMigrationServerError(): Unit = {
    val exception = new RuntimeException("Service error")

    Mockito
      .`when`(migrationService.orchestrateMigration(eqTo("test-key")))
      .thenReturn(Failure(exception))

    mockMvc
      .perform(
        get("/api/migration/start")
          .param("key", "test-key")
          .accept(MediaType.APPLICATION_JSON)
      )
      .andExpect(status().isInternalServerError)

    verify(migrationService).orchestrateMigration(eqTo("test-key"))
    verify(auditLog, times(0)).logChanges(any(), any(), any(), any())
  }

  @Test
  @DisplayName("Hakee vanha tutu -tiedot ID:n perusteella onnistuneesti")
  @WithMockUser(username = "testuser", roles = Array("USER"))
  def testGetVanhaTutuByIdSuccess(): Unit = {
    val testData1 = Map(
      "name"        -> "John Doe",
      "age"         -> 30,
      "city"        -> "Helsinki",
      "migrationId" -> "test-migration-1"
    )

    val id = vanhaTutuRepository.create(mapper.writeValueAsString(testData1))

    mockMvc
      .perform(
        get(s"/api/vanha-tutu/$id")
          .accept(MediaType.APPLICATION_JSON)
      )
      .andExpect(status().isOk)
      .andExpect(content().contentType(MediaType.APPLICATION_JSON))
      .andExpect(jsonPath("$.name").value("John Doe"))
      .andExpect(jsonPath("$.age").value(30))
      .andExpect(jsonPath("$.city").value("Helsinki"))
      .andExpect(jsonPath("$.migrationId").value("test-migration-1"))

    verify(auditLog).logRead(
      eqTo("vanha-tutu"),
      eqTo(s"vanha-tutu/$id"),
      eqTo(AuditOperation.ReadVanhaTutu),
      any[HttpServletRequest]
    )
  }

  @Test
  @DisplayName("Hylkää vanha tutu -tietojen haun ilman autentikointia")
  @WithAnonymousUser
  def testGetVanhaTutuByIdUnauthorized(): Unit = {
    val testId = java.util.UUID.randomUUID()
    mockMvc
      .perform(
        get(s"/api/vanha-tutu/$testId")
          .accept(MediaType.APPLICATION_JSON)
      )
      .andExpect(status().isUnauthorized)

    verify(auditLog, times(0)).logRead(any(), any(), any(), any[HttpServletRequest])
  }

  @Test
  @DisplayName("Palauttaa 404 kun tietuetta ei löydy")
  @WithMockUser(username = "testuser", roles = Array("USER"))
  def testGetVanhaTutuByIdNotFound(): Unit = {
    val nonExistentId = java.util.UUID.randomUUID()
    mockMvc
      .perform(
        get(s"/api/vanha-tutu/$nonExistentId")
          .accept(MediaType.APPLICATION_JSON)
      )
      .andExpect(status().isNotFound)
      .andExpect(content().contentType(MediaType.APPLICATION_JSON))
      .andExpect(jsonPath("$.error").value("Tietuetta ei löytynyt"))

    verify(auditLog, times(0)).logRead(any(), any(), any(), any[HttpServletRequest])
  }

  @Test
  @DisplayName("Palauttaa 500 kun ID-muoto on virheellinen")
  @WithMockUser(username = "testuser", roles = Array("USER"))
  def testGetVanhaTutuByIdInvalidId(): Unit = {
    mockMvc
      .perform(
        get("/api/vanha-tutu/invalid-id")
          .accept(MediaType.APPLICATION_JSON)
      )
      .andExpect(status().isInternalServerError)

    verify(auditLog, times(0)).logRead(any(), any(), any(), any[HttpServletRequest])
  }

}
