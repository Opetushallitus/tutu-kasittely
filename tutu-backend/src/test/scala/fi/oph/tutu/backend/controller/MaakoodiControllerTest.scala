package fi.oph.tutu.backend.controller

import fi.oph.tutu.backend.IntegrationTestBase
import fi.oph.tutu.backend.domain.*
import fi.oph.tutu.backend.service.*
import fi.oph.tutu.backend.utils.{AuditLog, AuditOperation}
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

import java.util.UUID

@AutoConfigureMockMvc
@TestInstance(Lifecycle.PER_CLASS)
@ActiveProfiles(Array("test"))
class MaakoodiControllerTest extends IntegrationTestBase {

  @Autowired
  private val context: WebApplicationContext = null
  private var mockMvc: MockMvc               = null

  @MockitoBean
  var auditLog: AuditLog = _

  @MockitoBean
  var koodistoService: KoodistoService = _

  @MockitoBean
  var userService: UserService = _

  @Autowired
  var maakoodiService: MaakoodiService = _

  val esittelijaOid                    = "1.2.246.562.24.00000000000000006666"
  var esittelija: Option[DbEsittelija] = None
  val mockUser                         = User(esittelijaOid, List("ROLE_USER"), Some("fi"))

  @BeforeEach
  def setupEach(): Unit = {
    Mockito
      .when(userService.getEnrichedUserDetails(any()))
      .thenReturn(mockUser)
  }

  @BeforeAll def setup(): Unit = {
    val configurer: MockMvcConfigurer =
      SecurityMockMvcConfigurers.springSecurity()
    val intermediate: DefaultMockMvcBuilder =
      MockMvcBuilders.webAppContextSetup(context).apply(configurer)
    mockMvc = intermediate.build()
    Mockito
      .when(koodistoService.getKoodisto("maatjavaltiot2"))
      .thenReturn(Seq.empty[KoodistoItem])
    esittelija = esittelijaRepository.insertEsittelija(UserOid(esittelijaOid), "testi")
    maakoodiRepository.upsertMaakoodi("maatjavaltiot2_752", "Ruotsi", "testi", Some(esittelija.get.esittelijaId))
  }

  @Test
  @WithMockUser(username = "testuser", roles = Array("USER"))
  def listMaakooditReturns200AndExpectedData(): Unit = {
    mockMvc
      .perform(get("/api/maakoodi"))
      .andExpect(status().isOk)
      .andExpect(content().contentType(MediaType.APPLICATION_JSON))
      .andExpect(jsonPath("$[0].koodiUri").value("maatjavaltiot2_752"))
      .andExpect(jsonPath("$[0].nimi").value("Ruotsi"))
      .andExpect(jsonPath("$[0].esittelijaId").isNotEmpty)
  }

  @Test
  @WithAnonymousUser
  def listMaakooditReturns401ForUnauthenticatedUser(): Unit = {
    mockMvc
      .perform(get("/api/maakoodi"))
      .andExpect(status().isUnauthorized)
  }

  @Test
  @WithMockUser(username = "testuser", roles = Array("USER"))
  def updateMaakoodiValidRequestReturns200(): Unit = {
    maakoodiRepository.upsertMaakoodi("maatjavaltiot2_100", "TestCountry", "testi", None)
    val maakoodi = maakoodiRepository.listAll().find(_.koodiUri == "maatjavaltiot2_100").get

    mockMvc
      .perform(
        put("/api/maakoodi")
          .`with`(csrf())
          .contentType(MediaType.APPLICATION_JSON)
          .param("id", maakoodi.id.toString)
          .param("esittelijaId", esittelija.get.esittelijaId.toString)
      )
      .andExpect(status().isOk)
      .andExpect(content().contentType(MediaType.APPLICATION_JSON))
      .andExpect(jsonPath("$.koodiUri").value("maatjavaltiot2_100"))
      .andExpect(jsonPath("$.nimi").value("TestCountry"))
      .andExpect(jsonPath("$.esittelijaId").value(esittelija.get.esittelijaId.toString))

    verify(auditLog, times(1)).logChanges(
      any(),
      eqTo(Map("maakoodiId" -> maakoodi.id.toString, "esittelijaId" -> esittelija.get.esittelijaId.toString)),
      eqTo(AuditOperation.UpdateMaakoodi),
      any()
    )

    val updatedMaakoodi = maakoodiRepository.listAll().find(_.koodiUri == "maatjavaltiot2_100").get
    assert(updatedMaakoodi.esittelijaId.contains(esittelija.get.esittelijaId))
    assert(updatedMaakoodi.koodiUri == "maatjavaltiot2_100")
    assert(updatedMaakoodi.nimi == "TestCountry")

    Mockito.reset(auditLog)

    mockMvc
      .perform(
        put("/api/maakoodi")
          .`with`(csrf())
          .contentType(MediaType.APPLICATION_JSON)
          .param("id", maakoodi.id.toString)
      )
      .andExpect(status().isOk)
      .andExpect(content().contentType(MediaType.APPLICATION_JSON))
      .andExpect(jsonPath("$.koodiUri").value("maatjavaltiot2_100"))
      .andExpect(jsonPath("$.nimi").value("TestCountry"))
      .andExpect(jsonPath("$.esittelijaId").isEmpty)

    verify(auditLog, times(1)).logChanges(
      any(),
      eqTo(Map("maakoodiId" -> maakoodi.id.toString, "esittelijaId" -> "")),
      eqTo(AuditOperation.UpdateMaakoodi),
      any()
    )

    val maakoodiAfterRemoval = maakoodiRepository.listAll().find(_.koodiUri == "maatjavaltiot2_100").get
    assert(maakoodiAfterRemoval.esittelijaId.isEmpty)
    assert(maakoodiAfterRemoval.koodiUri == "maatjavaltiot2_100")
    assert(maakoodiAfterRemoval.nimi == "TestCountry")
  }

  @Test
  @WithAnonymousUser
  def updateMaakoodiValidRequestReturns401WithAnonymousUser(): Unit = {
    val maakoodi = maakoodiRepository.listAll().head

    mockMvc
      .perform(
        put("/api/maakoodi")
          .`with`(csrf())
          .contentType(MediaType.APPLICATION_JSON)
          .param("id", maakoodi.id.toString)
          .param("esittelijaId", esittelija.get.esittelijaId.toString)
      )
      .andExpect(status().isUnauthorized)
  }

  @Test
  @WithMockUser(username = "testuser", roles = Array("USER"))
  def updateMaakoodiInvalidIdReturns404(): Unit = {
    val invalidId = UUID.randomUUID()

    mockMvc
      .perform(
        put("/api/maakoodi")
          .`with`(csrf())
          .contentType(MediaType.APPLICATION_JSON)
          .param("id", invalidId.toString)
          .param("esittelijaId", esittelija.get.esittelijaId.toString)
      )
      .andExpect(status().isNotFound)
  }
}
