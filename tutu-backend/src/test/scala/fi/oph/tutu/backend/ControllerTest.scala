package fi.oph.tutu.backend

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.scala.DefaultScalaModule
import fi.oph.tutu.backend.domain.{AtaruHakemus, Esittelija, HakemusOid, UserOid}
import fi.oph.tutu.backend.repository.{EsittelijaRepository, HakemusRepository}
import fi.oph.tutu.backend.security.SecurityConstants
import fi.oph.tutu.backend.service.{HakemusService, OnrService}
import org.hamcrest.Matchers.equalTo
import org.junit.jupiter.api.*
import org.junit.jupiter.api.Assertions.fail
import org.junit.jupiter.api.MethodOrderer.OrderAnnotation
import org.junit.jupiter.api.TestInstance.Lifecycle
import org.mockito.ArgumentMatchers.any
import org.mockito.Mockito.*
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

@AutoConfigureMockMvc
@TestInstance(Lifecycle.PER_CLASS)
@ActiveProfiles(Array("test"))
@TestMethodOrder(classOf[OrderAnnotation])
class ControllerTest extends IntegrationTestBase {

  @Autowired
  private val context: WebApplicationContext = null
  private var mockMvc: MockMvc               = null

  @MockitoBean
  var mockOnrService: OnrService = _

  @Autowired
  var esittelijaRepository: EsittelijaRepository = _

  @Autowired
  var hakemusRepository: HakemusRepository = _

  @Autowired
  var hakemusService: HakemusService = _

  var esittelija: Option[Esittelija] = None
  @BeforeAll def setup(): Unit = {
    val configurer: MockMvcConfigurer =
      SecurityMockMvcConfigurers.springSecurity()
    val intermediate: DefaultMockMvcBuilder =
      MockMvcBuilders.webAppContextSetup(context).apply(configurer)
    mockMvc = intermediate.build()
    esittelija = esittelijaRepository.upsertEsittelija("0008", UserOid("1.2.246.562.24.00000000000000006666"), "testi")
  }

  @BeforeEach
  def setupTest(): Unit =
    when(mockOnrService.getAsiointikieli(any[String]))
      .thenReturn(Right("fi"))

  private val mapper = new ObjectMapper()
  mapper.registerModule(DefaultScalaModule)

  @Test
  def get200ResponseFromHealthcheckUnautheticated(): Unit =
    mockMvc
      .perform(
        get("/api/healthcheck")
          .accept(MediaType.APPLICATION_JSON)
      )
      .andExpect(status.isOk)
      .andExpect(content.string(equalTo("Tutu is alive and kicking!")))

  @Test
  @WithMockUser(username = "testuser", roles = Array("USER"))
  def getAuthenticatedUserGets200ResponseFromAuthenticatedApi: Unit =
    mockMvc
      .perform(get("/api/session"))
      .andExpect(status().isOk)
      .andExpect(content().contentType(MediaType.APPLICATION_JSON))

  @Test
  @WithAnonymousUser
  def getUnauthenticatedUserGets401ResponseFromAuthenticatedApi: Unit =
    mockMvc
      .perform(get("/api/session"))
      .andExpect(status().isUnauthorized)

  @Test
  @Order(1)
  @WithMockUser(
    value = "kayttaja",
    authorities = Array(SecurityConstants.SECURITY_ROOLI_ESITTELIJA_FULL)
  )
  def luoHakemusValidRequestWithoutEsittelijaReturns200(): Unit = {
    val hakemus     = AtaruHakemus(HakemusOid("1.2.246.562.11.00000000000000006666"), "0008", 1)
    val requestJson = mapper.writeValueAsString(hakemus)

    mockMvc
      .perform(
        post("/api/ataru-hakemus")
          .`with`(csrf())
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
    val hakemus     = AtaruHakemus(HakemusOid("1.2.246.562.11.00000000000000006666"), "0008", 1)
    val requestJson = mapper.writeValueAsString(hakemus)

    mockMvc
      .perform(
        post("/api/ataru-hakemus")
          .`with`(csrf())
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
    val hakemus =
      "1.2.246.562.XX"
    val requestJson = mapper.writeValueAsString(hakemus)
    mockMvc
      .perform(
        post("/api/ataru-hakemus")
          .`with`(csrf())
          .contentType(MediaType.APPLICATION_JSON)
          .content(requestJson)
      )
      .andExpect(status().isBadRequest)

  @Test
  @Order(4)
  @WithMockUser(value = "kyttääjä", authorities = Array("ROLE_APP_NADA"))
  def luoHakemusValidRequestReturns403WithInSufficientRights(): Unit = {
    val hakemus     = AtaruHakemus(HakemusOid("1.2.246.562.11.00000000000000006667"), "0008", 0)
    val requestJson = mapper.writeValueAsString(hakemus)

    mockMvc
      .perform(
        post("/api/ataru-hakemus")
          .`with`(csrf())
          .contentType(MediaType.APPLICATION_JSON)
          .content(requestJson)
      )
      .andExpect(status().isForbidden)
  }

  @Test
  @Order(5)
  @WithAnonymousUser
  def luoHakemusValidRequestReturns401WithAnonymousUser(): Unit = {
    val hakemus     = AtaruHakemus(HakemusOid("1.2.246.562.11.00000000000000006667"), "0008", 0)
    val requestJson = mapper.writeValueAsString(hakemus)

    mockMvc
      .perform(
        post("/api/ataru-hakemus")
          .`with`(csrf())
          .contentType(MediaType.APPLICATION_JSON)
          .content(requestJson)
      )
      .andExpect(status().isUnauthorized)
  }

  @Test
  @Order(6)
  @WithMockUser(
    value = "kayttaja",
    authorities = Array(SecurityConstants.SECURITY_ROOLI_ESITTELIJA_FULL)
  )
  def luoHakemusValidRequestReturns200WithCorrectEsittelijaOid(): Unit = {
    val hakemus     = AtaruHakemus(HakemusOid("1.2.246.562.11.00000000000000006665"), "0008", 0)
    val requestJson = mapper.writeValueAsString(hakemus)

    mockMvc
      .perform(
        post("/api/ataru-hakemus")
          .`with`(csrf())
          .contentType(MediaType.APPLICATION_JSON)
          .content(requestJson)
      )
      .andExpect(status().isOk)
    val insertedHakemus = hakemusRepository
      .haeHakemusLista(Seq(HakemusOid("1.2.246.562.11.00000000000000006665")))
      .headOption
      .getOrElse(fail("Hakemusta ei löytynyt"))
    assert(insertedHakemus.esittelijaId.get == esittelija.get.esittelijaId.toString)
  }

  @Test
  @Order(7)
  @WithMockUser(value = "kayttaja", authorities = Array(SecurityConstants.SECURITY_ROOLI_ESITTELIJA_FULL))
  def haeHakemuslistaReturns200AndArrayOfHakemusListItems(): Unit = {
    val expectedResult = s"""[{
                                "asiatunnus" : "TestiAsiaTunnus",
                                "hakija" : "Testi Hakija",
                                "vaihe" : "Testi Vaihe",
                                "paatostyyppi" : "Testi Paatostyyppi",
                                "aika" : "2 kk",
                                "hakemusOid" : "1.2.246.562.11.00000000000000006668",
                                "syykoodi" : 1,
                                "esittelijaId" : "${esittelija.get.esittelijaId.toString}",
                                "esittelijaOid" : "1.2.246.562.24.00000000000000006666"
                              }, {
                                "asiatunnus" : "TestiAsiaTunnus",
                                "hakija" : "Testi Hakija",
                                "vaihe" : "Testi Vaihe",
                                "paatostyyppi" : "Testi Paatostyyppi",
                                "aika" : "2 kk",
                                "hakemusOid" : "1.2.246.562.11.00000000000000006665",
                                "syykoodi" : 0,
                                "esittelijaId" : "${esittelija.get.esittelijaId.toString}",
                                "esittelijaOid" : "1.2.246.562.24.00000000000000006666"
                              }, {
                                "asiatunnus" : "TestiAsiaTunnus",
                                "hakija" : "Testi Hakija",
                                "vaihe" : "Testi Vaihe",
                                "paatostyyppi" : "Testi Paatostyyppi",
                                "aika" : "2 kk",
                                "hakemusOid" : "1.2.246.562.11.00000000000000006666",
                                "syykoodi" : 1,
                                "esittelijaId" : "${esittelija.get.esittelijaId.toString}",
                                "esittelijaOid" : "1.2.246.562.24.00000000000000006666"
                              }, {
                                "asiatunnus" : "TestiAsiaTunnus",
                                "hakija" : "Testi Hakija",
                                "vaihe" : "Testi Vaihe",
                                "paatostyyppi" : "Testi Paatostyyppi",
                                "aika" : "2 kk",
                                "hakemusOid" : "1.2.246.562.11.00000000000000006667",
                                "syykoodi" : 0,
                                "esittelijaId" : null,
                                "esittelijaOid" : null
                              } ]"""

    val ataruHakemus1 = AtaruHakemus(HakemusOid("1.2.246.562.11.00000000000000006667"), "0000", 0)
    val ataruHakemus2 = AtaruHakemus(HakemusOid("1.2.246.562.11.00000000000000006668"), "0008", 1)
    hakemusService.tallennaHakemus(ataruHakemus1)
    hakemusService.tallennaHakemus(ataruHakemus2)

    val result = mockMvc
      .perform(
        get("/api/hakemuslista")
      )
      .andExpect(status().isOk)
      .andExpect(content().contentType(MediaType.APPLICATION_JSON))
      .andExpect(content().json(expectedResult))
  }
}
