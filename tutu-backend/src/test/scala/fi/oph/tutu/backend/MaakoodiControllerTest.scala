package fi.oph.tutu.backend

import com.fasterxml.jackson.databind.{ObjectMapper, SerializationFeature}
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule
import com.fasterxml.jackson.module.scala.DefaultScalaModule
import fi.oph.tutu.backend.domain.*
import fi.oph.tutu.backend.service.*
import fi.oph.tutu.backend.utils.{AuditLog, AuditOperation}
import org.junit.jupiter.api.*
import org.junit.jupiter.api.TestInstance.Lifecycle
import org.mockito.ArgumentMatchers.{any, eq as eqTo}
import org.mockito.Mockito.{times, verify}
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.http.MediaType
import org.springframework.security.test.context.support.{WithAnonymousUser, WithMockUser}
import org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.bean.`override`.mockito.MockitoBean
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.*
import org.springframework.test.web.servlet.setup.{DefaultMockMvcBuilder, MockMvcBuilders, MockMvcConfigurer}
import org.springframework.web.context.WebApplicationContext

@AutoConfigureMockMvc
@TestInstance(Lifecycle.PER_CLASS)
@ActiveProfiles(Array("test"))
class MaakoodiControllerTest extends IntegrationTestBase {

  @Autowired
  private val context: WebApplicationContext = null
  private var mockMvc: MockMvc               = null

  @MockitoBean
  var auditLog: AuditLog = _

  @Autowired
  var maakoodiService: MaakoodiService = _

  @MockitoBean
  var kayttooikeusService: KayttooikeusService = _

  @Autowired
  var userService: UserService                       = _
  implicit val ec: scala.concurrent.ExecutionContext = scala.concurrent.ExecutionContext.global

  private val mapper = new ObjectMapper()
  mapper.registerModule(DefaultScalaModule)
  mapper.registerModule(new JavaTimeModule)
  mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS)

  val esittelijaOid                    = "1.2.246.562.24.00000000000000006666"
  var esittelija: Option[DbEsittelija] = None

  @BeforeAll def setup(): Unit = {
    val configurer: MockMvcConfigurer =
      SecurityMockMvcConfigurers.springSecurity()
    val intermediate: DefaultMockMvcBuilder =
      MockMvcBuilders.webAppContextSetup(context).apply(configurer)
    mockMvc = intermediate.build()

    // First create esittelija
    esittelija = esittelijaRepository.insertEsittelija(UserOid(esittelijaOid), "testi")

    // Then create test maakoodi
    maakoodiRepository.upsertMaakoodi("752", "Ruotsi", "testi", Some(esittelija.get.esittelijaId))
  }

  @Test
  @WithMockUser(username = "testuser", roles = Array("USER"))
  def listMaakooditReturns200AndExpectedData(): Unit = {
    mockMvc
      .perform(get("/api/maakoodit"))
      .andExpect(status().isOk)
      .andExpect(content().contentType(MediaType.APPLICATION_JSON))
      .andExpect(jsonPath("$[0].koodi").value("752"))
      .andExpect(jsonPath("$[0].nimi").value("Ruotsi"))
      .andExpect(jsonPath("$[0].esittelijaId").isNotEmpty)
    verify(auditLog, times(1)).logRead(any(), any(), eqTo(AuditOperation.ReadMaakoodit), any())
  }

  @Test
  @WithAnonymousUser
  def listMaakooditReturns401ForUnauthenticatedUser(): Unit = {
    mockMvc
      .perform(get("/api/maakoodit"))
      .andExpect(status().isUnauthorized)
  }
}
