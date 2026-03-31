package fi.oph.tutu.backend.controller

import fi.oph.tutu.backend.IntegrationTestBase
import fi.oph.tutu.backend.domain.*
import fi.oph.tutu.backend.security.SecurityConstants
import fi.oph.tutu.backend.service.*
import fi.oph.tutu.backend.utils.{AuditLog, AuditOperation}
import org.junit.jupiter.api.*
import org.junit.jupiter.api.Assertions.{assertEquals, assertTrue, fail}
import org.junit.jupiter.api.MethodOrderer.OrderAnnotation
import org.junit.jupiter.api.TestInstance.Lifecycle
import org.mockito.ArgumentMatchers.{any, eq as eqTo}
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
import fi.oph.tutu.backend.utils.Utility.toLocalDateTime

@AutoConfigureMockMvc
@TestInstance(Lifecycle.PER_CLASS)
@ActiveProfiles(Array("test"))
@TestMethodOrder(classOf[OrderAnnotation])
class TutuIntegrationTest extends IntegrationTestBase {

  @Autowired
  private val context: WebApplicationContext = null
  private var mockMvc: MockMvc               = null

  @MockitoBean
  var mockOnrService: OnrService = _

  @MockitoBean
  var auditLog: AuditLog = _

  @MockitoBean
  var userService: UserService = _

  @Autowired
  var hakemusService: HakemusService = _

  final val esittelijaOidString = "1.2.246.562.24.00000000000000006666"
  val dummyUserAgent            = "User-Agent"
  val dummyUserAgentValue       = "DummyAgent/1.0"
  val xffOriginalHeaderName     = "XFF_ORIGINAL"
  val xffOriginalHeaderValue    = "127.0.0.1"

  var esittelija: Option[DbEsittelija] = None
  var maakoodi: Option[DbMaakoodi]     = None
  var maakoodi2: Option[DbMaakoodi]    = None

  @BeforeAll def setup(): Unit = {
    val configurer: MockMvcConfigurer =
      SecurityMockMvcConfigurers.springSecurity()
    val intermediate: DefaultMockMvcBuilder =
      MockMvcBuilders.webAppContextSetup(context).apply(configurer)
    mockMvc = intermediate.build()

    esittelija = esittelijaRepository.insertEsittelija(UserOid(esittelijaOidString), "testi")
    maakoodi = maakoodiRepository.upsertMaakoodi(
      "maatjavaltiot2_752",
      "Ruotsi",
      "Sverige",
      "Sweden",
      "testi",
      Some(esittelija.get.esittelijaId)
    )
    maakoodi2 = maakoodiRepository.upsertMaakoodi(
      "maatjavaltiot2_834",
      "Tansania",
      "Tanzania",
      "Tarzania",
      "testi",
      Some(esittelija.get.esittelijaId)
    )
  }

  @BeforeEach
  def setupTest(): Unit = {
    when(mockOnrService.haeAsiointikieli(any[String]))
      .thenReturn(Right("fi"))

    when(mockOnrService.haeHenkilo(esittelijaOidString))
      .thenReturn(
        Right(
          OnrUser(
            oidHenkilo = esittelijaOidString,
            kutsumanimi = "Esko",
            sukunimi = "Esittelijä",
            kansalaisuus = Seq(KansalaisuusKoodi("123")),
            hetu = Some("010170-789X"),
            yhteystiedotRyhma = Seq(),
            yksiloityVTJ = false
          )
        )
      )
  }

  @Test
  @WithMockUser(value = "kayttaja", authorities = Array(SecurityConstants.SECURITY_ROOLI_CRUD_FULL))
  def luoHakemusInvalidRequestReturns400(): Unit = {
    when(userService.getEnrichedUserDetails(any[Boolean]))
      .thenReturn(
        fi.oph.tutu.backend.domain.User(
          userOid = "kayttaja",
          authorities = List(SecurityConstants.SECURITY_ROOLI_CRUD_FULL)
        )
      )

    val hakemus     = "1.2.246.562.XX"
    val requestJson = mapper.writeValueAsString(hakemus)
    mockMvc
      .perform(
        post("/api/ataru-hakemus")
          .`with`(csrf())
          .contentType(MediaType.APPLICATION_JSON)
          .content(requestJson)
      )
      .andExpect(status().isBadRequest)
  }

  @Test
  @WithMockUser(value = "kayttaja", authorities = Array("ROLE_APP_NADA"))
  def luoHakemusValidRequestReturns403WithInSufficientRights(): Unit = {
    when(userService.getEnrichedUserDetails(any[Boolean]))
      .thenReturn(
        fi.oph.tutu.backend.domain.User(
          userOid = "kayttaja",
          authorities = List("ROLE_APP_NADA")
        )
      )

    val hakemus     = UusiAtaruHakemus(HakemusOid("1.2.246.562.11.00000000000000006667"), 0)
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
  @WithAnonymousUser
  def luoHakemusValidRequestReturns401WithAnonymousUser(): Unit = {
    val hakemus     = UusiAtaruHakemus(HakemusOid("1.2.246.562.11.00000000000000006667"), 0)
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
  @WithMockUser(
    value = HakemusControllerTestConstants.ESITTELIJA_OID,
    authorities = Array(SecurityConstants.SECURITY_ROOLI_CRUD_FULL)
  )
  def luoHakemusValidRequestReturns500WhenHakemusAlreadyExists(): Unit = {
    val hakemus     = UusiAtaruHakemus(HakemusOid("1.2.246.562.11.00000000000000006666"), 1)
    val requestJson = mapper.writeValueAsString(hakemus)
    when(ataruHakemusParser.parseTutkinto1MaakoodiUri(any())).thenReturn(Some("maatjavaltiot2_834"))
    mockMvc
      .perform(
        post("/api/ataru-hakemus")
          .`with`(csrf())
          .contentType(MediaType.APPLICATION_JSON)
          .content(requestJson)
          .header("XFF_ORIGINAL", "127.0.0.1")
      )
      .andExpect(status().isInternalServerError)
  }

  @Test
  @Order(1)
  @WithMockUser(
    value = esittelijaOidString,
    authorities = Array(SecurityConstants.SECURITY_ROOLI_CRUD_FULL)
  )
  def luoHakemusValidRequestReturns200(): Unit = {
    when(userService.getEnrichedUserDetails(any[Boolean]))
      .thenReturn(
        User(userOid = esittelijaOidString, authorities = List(SecurityConstants.SECURITY_ROOLI_CRUD_FULL))
      )
    when(hakemuspalveluService.haeHakemus(any[HakemusOid]))
      .thenReturn(Right(loadJson("ataruHakemus6666.json")))
    when(ataruHakemusParser.parseTutkinto1MaakoodiUri(any())).thenReturn(Some("maatjavaltiot2_834"))
    val requestJson =
      """{
          "hakemusOid": "1.2.246.562.11.00000000000000006666",
          "hakemusKoskee": 1
          }"""

    mockMvc
      .perform(
        post("/api/ataru-hakemus")
          .`with`(csrf())
          .contentType(MediaType.APPLICATION_JSON)
          .content(requestJson)
          .header(dummyUserAgent, dummyUserAgentValue)
          .header(xffOriginalHeaderName, xffOriginalHeaderValue)
      )
      .andExpect(status().isOk)

    val insertedHakemus = hakemusRepository
      .haeHakemus(HakemusOid("1.2.246.562.11.00000000000000006666"))
      .getOrElse(fail("Hakemusta ei löytynyt"))

    // tallennaHakemusAction fields
    assertEquals(esittelija.get.esittelijaOid, insertedHakemus.esittelijaOid.get)
    assertEquals(1527182L, insertedHakemus.formId)
    assertEquals(1, insertedHakemus.hakemusKoskee)
    assertEquals(toLocalDateTime("2025-05-14T10:59:47.597Z"), insertedHakemus.saapumisPvm.get)
    assertEquals(toLocalDateTime("2025-05-14T10:59:47.597Z"), insertedHakemus.ataruHakemusMuokattu.get)
    assertEquals(Some("Testi Toka"), insertedHakemus.hakijaEtunimet)
    assertEquals(Some("Hakija"), insertedHakemus.hakijaSukunimi)

    verify(auditLog, times(1)).logCreate(any(), any(), eqTo(AuditOperation.CreateHakemus), any())
  }

  @Test
  @Order(2)
  @WithMockUser(
    value = esittelijaOidString,
    authorities = Array(SecurityConstants.SECURITY_ROOLI_CRUD_FULL)
  )
  def luoHakemusValidRequestReturns200WithCorrectEsittelijaOid(): Unit = {
    when(userService.getEnrichedUserDetails(any[Boolean]))
      .thenReturn(
        User(userOid = esittelijaOidString, authorities = List(SecurityConstants.SECURITY_ROOLI_CRUD_FULL))
      )
    when(hakemuspalveluService.haeHakemus(any[HakemusOid]))
      .thenReturn(Right(loadJson("ataruHakemus6665.json")))
    when(ataruHakemusParser.parseTutkinto1MaakoodiUri(any())).thenReturn(Some("maatjavaltiot2_752"))

    val requestJson =
      """{
          "hakemusOid": "1.2.246.562.11.00000000000000006665",
          "hakemusKoskee": 0
          }"""

    mockMvc
      .perform(
        post("/api/ataru-hakemus")
          .`with`(csrf())
          .contentType(MediaType.APPLICATION_JSON)
          .content(requestJson)
          .header(dummyUserAgent, dummyUserAgentValue)
          .header(xffOriginalHeaderName, xffOriginalHeaderValue)
      )
      .andExpect(status().isOk)

    val insertedHakemus = hakemusRepository
      .haeHakemus(HakemusOid("1.2.246.562.11.00000000000000006665"))
      .getOrElse(fail("Hakemusta ei löytynyt"))

    // tallennaHakemusAction fields
    assertEquals(esittelija.get.esittelijaOid, insertedHakemus.esittelijaOid.get)
    assertEquals(1527182L, insertedHakemus.formId)
    assertEquals(0, insertedHakemus.hakemusKoskee)
    assertEquals(toLocalDateTime("2025-05-14T11:06:38.273Z"), insertedHakemus.saapumisPvm.get)
    assertEquals(toLocalDateTime("2025-05-14T11:06:38.273Z"), insertedHakemus.ataruHakemusMuokattu.get)
    assertEquals(Some("Testi"), insertedHakemus.hakijaEtunimet)
    assertEquals(Some("Hakija"), insertedHakemus.hakijaSukunimi)

    verify(auditLog, times(1)).logCreate(any(), any(), eqTo(AuditOperation.CreateHakemus), any())
  }

  @Test
  @Order(3)
  @WithMockUser(
    value = esittelijaOidString,
    authorities = Array(SecurityConstants.SECURITY_ROOLI_CRUD_FULL)
  )
  def luoLopullinenPaatosHakemusReturns200(): Unit = {
    when(userService.getEnrichedUserDetails(any[Boolean]))
      .thenReturn(
        User(userOid = esittelijaOidString, authorities = List(SecurityConstants.SECURITY_ROOLI_CRUD_FULL))
      )
    when(hakemuspalveluService.haeHakemus(any[HakemusOid]))
      .thenReturn(Right(loadJson("ataruHakemus6668.json")))
    when(ataruHakemusParser.parseLopullinenPaatosSuoritusmaaMaakoodiUri(any()))
      .thenReturn(Some("maatjavaltiot2_834"))
    when(ataruHakemusParser.parseLopullinenPaatosVastaavaEhdollinen(any()))
      .thenReturn(Some("ASIATUNNUS-001"))

    val requestJson =
      """{
          "hakemusOid": "1.2.246.562.11.00000000000000006668",
          "hakemusKoskee": 5
          }"""

    mockMvc
      .perform(
        post("/api/ataru-hakemus")
          .`with`(csrf())
          .contentType(MediaType.APPLICATION_JSON)
          .content(requestJson)
          .header(dummyUserAgent, dummyUserAgentValue)
          .header(xffOriginalHeaderName, xffOriginalHeaderValue)
      )
      .andExpect(status().isOk)

    val insertedHakemus = hakemusRepository
      .haeHakemus(HakemusOid("1.2.246.562.11.00000000000000006668"))
      .getOrElse(fail("Lopullisen paatoksen hakemusta ei löytynyt"))

    // tallennaHakemusAction fields
    assertEquals(esittelija.get.esittelijaOid, insertedHakemus.esittelijaOid.get)
    assertEquals(1527182L, insertedHakemus.formId)
    assertEquals(5, insertedHakemus.hakemusKoskee)
    assertEquals(toLocalDateTime("2025-05-14T10:59:47.597Z"), insertedHakemus.saapumisPvm.get)
    assertEquals(toLocalDateTime("2025-05-14T10:59:47.597Z"), insertedHakemus.ataruHakemusMuokattu.get)
    assertEquals(Some("Testi Neljäs"), insertedHakemus.hakijaEtunimet)
    assertEquals(Some("Hakija"), insertedHakemus.hakijaSukunimi)
    assertEquals(Some("ASIATUNNUS-001"), insertedHakemus.lopullinenPaatosVastaavaEhdollinenAsiatunnus)
    assertEquals(Some("maatjavaltiot2_834"), insertedHakemus.lopullinenPaatosVastaavaEhdollinenSuoritusmaaKoodiUri)

    verify(auditLog, times(1)).logCreate(any(), any(), eqTo(AuditOperation.CreateHakemus), any())
  }
}
