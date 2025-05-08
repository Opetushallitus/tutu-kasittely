package fi.oph.tutu.backend

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.scala.DefaultScalaModule
import fi.oph.tutu.backend.controller.Hakemus
import fi.oph.tutu.backend.security.SecurityConstants
import fi.oph.tutu.backend.service.OnrService
import org.junit.jupiter.api.*
import org.junit.jupiter.api.MethodOrderer.OrderAnnotation
import org.junit.jupiter.api.TestInstance.Lifecycle
import org.mockito.ArgumentMatchers.any
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
import org.springframework.test.web.servlet.setup.{
  DefaultMockMvcBuilder,
  MockMvcBuilders,
  MockMvcConfigurer
}
import org.springframework.web.context.WebApplicationContext

@AutoConfigureMockMvc
@TestInstance(Lifecycle.PER_CLASS)
@ActiveProfiles(Array("test"))
@TestMethodOrder(classOf[OrderAnnotation])
class ControllerTest extends IntegrationTestBase {

  @Autowired
  private val context: WebApplicationContext = null
  private var mockMvc: MockMvc = null

  @MockitoBean
  var mockOnrService: OnrService = _

  @BeforeAll def setup(): Unit = {
    val configurer: MockMvcConfigurer =
      SecurityMockMvcConfigurers.springSecurity()
    val intermediate: DefaultMockMvcBuilder =
      MockMvcBuilders.webAppContextSetup(context).apply(configurer)
    mockMvc = intermediate.build()
  }

  @BeforeEach
  def setupTest(): Unit =
    when(mockOnrService.getAsiointikieli(any[String]))
      .thenReturn(Right("fi"))

  private val mapper = new ObjectMapper()
  mapper.registerModule(DefaultScalaModule)

  @Test
  @Order(1)
  @WithMockUser(
    value = "kayttaja",
    authorities = Array(SecurityConstants.SECURITY_ROOLI_ESITTELIJA_FULL)
  )
  def luoHakemusValidRequestReturns200(): Unit = {
    val hakemus = Hakemus("1.2.246.562.00.00000000000000006666")
    val requestJson = mapper.writeValueAsString(hakemus)

    mockMvc
      .perform(
        post("/api/hakemus")
          .contentType(MediaType.APPLICATION_JSON)
          .content(requestJson)
      )
      .andExpect(status().isOk)
  }

  @Test
  @Order(2)
  @WithMockUser(
    value = "kayttaja",
    authorities = Array(SecurityConstants.SECURITY_ROOLI_ESITTELIJA_FULL)
  )
  def luoHakemusValidRequestReturns500WhenHakemusAlreadyExists(): Unit = {
    val hakemus = Hakemus("1.2.246.562.00.00000000000000006666")
    val requestJson = mapper.writeValueAsString(hakemus)

    mockMvc
      .perform(
        post("/api/hakemus")
          .contentType(MediaType.APPLICATION_JSON)
          .content(requestJson)
      )
      .andExpect(status().isInternalServerError)
  }

  @Test
  @Order(3)
  @WithMockUser(
    value = "kayttaja",
    authorities = Array(SecurityConstants.SECURITY_ROOLI_ESITTELIJA_FULL)
  )
  def luoHakemusInvalidRequestReturns400(): Unit =
    mockMvc
      .perform(
        post("/api/hakemus")
          .contentType(MediaType.APPLICATION_JSON)
          .content("Eipä ollu oid")
      )
      .andExpect(status().isBadRequest)

  @Test
  @Order(4)
  @WithMockUser(value = "kyttääjä", authorities = Array("ROLE_APP_NADA"))
  def luoHakemusValidRequestReturns403WithInSufficientRights(): Unit = {
    val hakemus = Hakemus("1.2.246.562.00.00000000000000006667")
    val requestJson = mapper.writeValueAsString(hakemus)

    mockMvc
      .perform(
        post("/api/hakemus")
          .contentType(MediaType.APPLICATION_JSON)
          .content(requestJson)
      )
      .andExpect(status().isForbidden)
  }

  @Test
  @Order(5)
  def luoHakemusValidRequestReturns401WithoutLoggedinUser(): Unit = {
    val hakemus = Hakemus("1.2.246.562.00.00000000000000006667")
    val requestJson = mapper.writeValueAsString(hakemus)

    mockMvc
      .perform(
        post("/api/hakemus")
          .contentType(MediaType.APPLICATION_JSON)
          .content(requestJson)
      )
      .andExpect(status().isUnauthorized)
  }
}
