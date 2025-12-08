package fi.oph.tutu.backend.controller

import fi.oph.tutu.backend.IntegrationTestBase
import fi.oph.tutu.backend.domain.{
  DbEsittelija,
  DbMaakoodi,
  HakemusOid,
  KansalaisuusKoodi,
  OnrUser,
  User,
  UserOid,
  UusiAtaruHakemus
}
import fi.oph.tutu.backend.security.SecurityConstants
import fi.oph.tutu.backend.service.{HakemusService, OnrService, TutkintoService, UserService}
import fi.oph.tutu.backend.utils.{AuditLog, AuditOperation}
import org.junit.jupiter.api.Assertions.{assertEquals, assertTrue}
import org.junit.jupiter.api.MethodOrderer.OrderAnnotation
import org.junit.jupiter.api.TestInstance.Lifecycle
import org.junit.jupiter.api.{BeforeAll, Order, Test, TestInstance, TestMethodOrder}
import org.mockito.ArgumentMatchers.{any, eq as eqTo}
import org.mockito.Mockito.*
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.http.MediaType
import org.springframework.security.test.context.support.WithMockUser
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf
import org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*
import org.springframework.test.context.bean.`override`.mockito.MockitoBean
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.*
import org.springframework.test.web.servlet.setup.{DefaultMockMvcBuilder, MockMvcBuilders, MockMvcConfigurer}
import org.springframework.web.context.WebApplicationContext

@AutoConfigureMockMvc
@TestInstance(Lifecycle.PER_CLASS)
@ActiveProfiles(Array("test"))
@TestMethodOrder(classOf[OrderAnnotation])
class TutkintoControllerTest extends IntegrationTestBase {
  @Autowired
  private val context: WebApplicationContext = null
  private var mockMvc: MockMvc               = null

  @MockitoBean
  var auditLog: AuditLog = _

  @MockitoBean
  var mockOnrService: OnrService = _

  @MockitoBean
  var userService: UserService = _

  @Autowired
  var hakemusService: HakemusService = _

  @Autowired
  var tutkintoService: TutkintoService = _

  final val esittelijaOidString = "1.2.246.562.24.00000000000000006666"
  val dummyUserAgent            = "User-Agent"
  val dummyUserAgentValue       = "DummyAgent/1.0"
  val xffOriginalHeaderName     = "XFF_ORIGINAL"
  val xffOriginalHeaderValue    = "127.0.0.1"
  val hakemusOid                = HakemusOid("1.2.246.562.11.00000000000000006667")

  var esittelija: Option[DbEsittelija] = None
  var maakoodi: Option[DbMaakoodi]     = None

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
    initAtaruHakemusRequests()
    hakemusService.tallennaAtaruHakemus(
      UusiAtaruHakemus(hakemusOid, 1)
    )

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
            false
          )
        )
      )
  }

  @Test
  @Order(1)
  @WithMockUser(value = esittelijaOidString, authorities = Array(SecurityConstants.SECURITY_ROOLI_ESITTELIJA_FULL))
  def haeTutkinnotValidRequestReturns200(): Unit = {
    when(userService.getEnrichedUserDetails(any[Boolean]))
      .thenReturn(
        User(userOid = esittelijaOidString, authorities = List(SecurityConstants.SECURITY_ROOLI_ESITTELIJA_FULL))
      )

    val tutkinnot = tutkintoRepository.haeTutkinnotHakemusOidilla(hakemusOid)

    mockMvc
      .perform(
        get(s"/api/hakemus/${hakemusOid.toString}/tutkinto/")
          .header(dummyUserAgent, dummyUserAgentValue)
          .header(xffOriginalHeaderName, xffOriginalHeaderValue)
      )
      .andExpect(status().isOk)
      .andExpect(content().contentType(MediaType.APPLICATION_JSON))
      .andExpect(
        content().json(
          mapper.writeValueAsString(tutkinnot)
        )
      )
    verify(auditLog, times(1)).logRead(any(), any(), eqTo(AuditOperation.ReadTutkinnot), any())
  }

  @Test
  @Order(2)
  @WithMockUser(value = esittelijaOidString, authorities = Array(SecurityConstants.SECURITY_ROOLI_ESITTELIJA_FULL))
  def paivitaTutkinnotValidRequestReturns200(): Unit = {
    when(userService.getEnrichedUserDetails(any[Boolean]))
      .thenReturn(
        User(userOid = esittelijaOidString, authorities = List(SecurityConstants.SECURITY_ROOLI_ESITTELIJA_FULL))
      )

    val tutkinnot         = tutkintoRepository.haeTutkinnotHakemusOidilla(hakemusOid)
    val muutetutTutkinnot = tutkinnot.map(_.copy(nimi = Some("Muutettu nimi")))

    mockMvc
      .perform(
        put(s"/api/hakemus/${hakemusOid.toString}/tutkinto/")
          .`with`(csrf())
          .contentType(MediaType.APPLICATION_JSON)
          .content(mapper.writeValueAsString(muutetutTutkinnot))
          .header(dummyUserAgent, dummyUserAgentValue)
          .header(xffOriginalHeaderName, xffOriginalHeaderValue)
      )
      .andExpect(status().isOk)
      .andExpect(content().contentType(MediaType.APPLICATION_JSON))
      .andExpect(content().json(mapper.writeValueAsString(muutetutTutkinnot)))

    val tutkinnot2 = tutkintoRepository.haeTutkinnotHakemusOidilla(hakemusOid)

    assertTrue(tutkinnot2.forall(_.nimi.contains("Muutettu nimi")))
  }

  @Test
  @Order(3)
  @WithMockUser(value = esittelijaOidString, authorities = Array(SecurityConstants.SECURITY_ROOLI_ESITTELIJA_FULL))
  def poistaTutkintoValidRequestReturns204(): Unit = {
    val tutkinnot1  = tutkintoRepository.haeTutkinnotHakemusOidilla(hakemusOid)
    val poistettuId = tutkinnot1.head.id.get

    mockMvc
      .perform(
        delete(s"/api/hakemus/${hakemusOid.toString}/tutkinto/${poistettuId.toString}")
          .`with`(csrf())
          .header(dummyUserAgent, dummyUserAgentValue)
          .header(xffOriginalHeaderName, xffOriginalHeaderValue)
      )
      .andExpect(status().isNoContent)
    verify(auditLog, times(1)).logChanges(any(), any(), eqTo(AuditOperation.DeleteTutkinto), any())

    val tutkinnot2 = tutkintoRepository.haeTutkinnotHakemusOidilla(hakemusOid)

    assertEquals(tutkinnot2.length, tutkinnot1.length - 1)
    assertTrue(!tutkinnot2.exists(_.id.getOrElse("") == poistettuId))
  }
}
