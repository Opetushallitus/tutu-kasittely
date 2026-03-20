package fi.oph.tutu.backend.controller

import fi.oph.tutu.backend.IntegrationTestBase
import fi.oph.tutu.backend.domain.Esittelija
import fi.oph.tutu.backend.security.SecurityConstants
import fi.oph.tutu.backend.service.UserService
import fi.oph.tutu.backend.utils.AuditLog
import org.junit.jupiter.api.*
import org.junit.jupiter.api.TestInstance.Lifecycle
import org.mockito.Mockito.*
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.http.MediaType
import org.springframework.security.test.context.support.WithMockUser
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
class EsittelijaControllerTest extends IntegrationTestBase {

  @Autowired
  private val context: WebApplicationContext = null
  private var mockMvc: MockMvc               = null

  @MockitoBean
  var mockUserService: UserService = _

  @MockitoBean
  var auditLog: AuditLog = _

  @BeforeAll def setup(): Unit = {
    val configurer: MockMvcConfigurer =
      SecurityMockMvcConfigurers.springSecurity()
    val intermediate: DefaultMockMvcBuilder =
      MockMvcBuilders.webAppContextSetup(context).apply(configurer)
    mockMvc = intermediate.build()
  }

  @Test
  @WithMockUser(value = "kayttaja", authorities = Array(SecurityConstants.SECURITY_ROOLI_CRUD_FULL))
  def haeEsittelijatReturns200WithValidHenkilot(): Unit = {
    val expectedResult =
      """[
        |  {
        |    "esittelijaOid": "1.2.246.562.24.00000000001",
        |    "etunimi": "Roope",
        |    "sukunimi": "Roihuvuori"
        |  },
        |  {
        |    "esittelijaOid": "1.2.246.562.24.00000000002",
        |    "etunimi": "Jarmo",
        |    "sukunimi": "Jakomäki"
        |  }
        |]""".stripMargin

    when(mockUserService.haeEsittelijat).thenReturn(
      Seq(
        Esittelija(esittelijaOid = "1.2.246.562.24.00000000001", etunimi = "Roope", sukunimi = "Roihuvuori"),
        Esittelija(esittelijaOid = "1.2.246.562.24.00000000002", etunimi = "Jarmo", sukunimi = "Jakomäki")
      )
    )

    mockMvc
      .perform(
        get("/api/esittelijat")
      )
      .andExpect(status().isOk)
      .andExpect(content().contentType(MediaType.APPLICATION_JSON))
      .andExpect(content().json(expectedResult))
  }
}
