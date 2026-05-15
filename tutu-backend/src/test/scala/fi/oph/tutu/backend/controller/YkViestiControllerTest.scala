package fi.oph.tutu.backend.controller

import fi.oph.tutu.backend.IntegrationTestBase
import fi.oph.tutu.backend.domain.*
import fi.oph.tutu.backend.security.SecurityConstants
import fi.oph.tutu.backend.service.*
import fi.oph.tutu.backend.utils.{AuditLog, AuditOperation}
import org.junit.jupiter.api.*
import org.junit.jupiter.api.MethodOrderer.OrderAnnotation
import org.junit.jupiter.api.TestInstance.Lifecycle
import org.mockito.ArgumentMatchers.{any, eq as eqTo}
import org.mockito.Mockito.*
import org.hamcrest.Matchers.{equalTo, hasKey, hasSize}
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.http.MediaType
import org.springframework.security.test.context.support.WithMockUser
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf
import org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.bean.`override`.mockito.MockitoBean
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.*
import org.springframework.test.web.servlet.setup.{DefaultMockMvcBuilder, MockMvcBuilders, MockMvcConfigurer}
import org.springframework.web.context.WebApplicationContext

import java.time.LocalDateTime
import java.util.UUID

@AutoConfigureMockMvc
@TestInstance(Lifecycle.PER_CLASS)
@ActiveProfiles(Array("test"))
@TestMethodOrder(classOf[OrderAnnotation])
class YkViestiControllerTest extends IntegrationTestBase {

  @Autowired
  private val context: WebApplicationContext = null
  private var mvc: MockMvc                   = null

  @MockitoBean
  private var userService: UserService = _

  @MockitoBean
  private var auditLog: AuditLog = _

  @MockitoBean
  var onrService: OnrService = _

  var ykViestiId: UUID = null

  @BeforeAll def setup(): Unit = {
    val configurer: MockMvcConfigurer =
      SecurityMockMvcConfigurers.springSecurity()
    val intermediate: DefaultMockMvcBuilder =
      MockMvcBuilders.webAppContextSetup(context).apply(configurer)
    mvc = intermediate.build()

    hakemusRepository.tallennaHakemus(
      HakemusOid("hakemus-333"),
      1,
      1,
      None,
      asiakirjaRepository.tallennaUudetAsiakirjatiedot(Asiakirja(), "testi"),
      None,
      None,
      "testi"
    )

    ykViestiId = ykViestiRepository.luoHakemuksenYkViesti(
      YkViesti(
        id = null,
        parentId = None,
        hakemusOid = HakemusOid("hakemus-333"),
        lahettajaOid = Some("lahettaja-oid"),
        vastaanottajaOid = None,
        kysymys = Some("Kysymys body"),
        hakija = null
      )
    )
  }

  @Test
  @WithMockUser(value = "lahettaja-oid", authorities = Array(SecurityConstants.SECURITY_ROOLI_CRUD_FULL))
  @Order(1)
  def haeHakemuksenYkViestitPalauttaa200JaListanViesteja(): Unit = {
    when(
      userService.getEnrichedUserDetails(any)
    ).thenReturn(
      User(
        userOid = "lahettaja-oid",
        authorities = List(SecurityConstants.SECURITY_ROOLI_CRUD_FULL)
      )
    )
    when(onrService.haeNimiOption(any[Option[String]])).thenReturn(None)

    mvc
      .perform(
        get(s"/api/hakemus/hakemus-333/yhteinenkasittely")
      )
      .andExpect(status().isOk)
      .andExpect(jsonPath("$").isArray)
      .andExpect(jsonPath("$", hasSize(1)))
  }

  @Test
  @WithMockUser(value = "lahettaja-oid", authorities = Array(SecurityConstants.SECURITY_ROOLI_CRUD_FULL))
  @Order(2)
  def luoYkViestiPalauttaa204(): Unit = {
    when(
      userService.getEnrichedUserDetails(any)
    ).thenReturn(
      User(
        userOid = "lahettaja-oid",
        authorities = List(SecurityConstants.SECURITY_ROOLI_CRUD_FULL)
      )
    )
    when(onrService.haeNimiOption(any[Option[String]])).thenReturn(None)

    val postBody = Map(
      "parentId"         -> None,
      "kysymys"          -> Some("Toinen kyssäri"),
      "vastaanottajaOid" -> Some("vastaanottaja-oid")
    )
    val postBodyAsJson = mapper.writeValueAsString(postBody)

    mvc
      .perform(
        post(s"/api/hakemus/hakemus-333/yhteinenkasittely")
          .`with`(csrf())
          .contentType(MediaType.APPLICATION_JSON)
          .content(postBodyAsJson)
      )
      .andExpect(status().isNoContent)

    mvc
      .perform(
        get(s"/api/hakemus/hakemus-333/yhteinenkasittely")
      )
      .andExpect(status().isOk)
      .andExpect(jsonPath("$", hasSize(2)))
  }

  @Test
  @WithMockUser(value = "vastaanottaja-oid", authorities = Array(SecurityConstants.SECURITY_ROOLI_CRUD_FULL))
  @Order(3)
  def vastaaHakemuksenYkViestiiniPalauttaa204(): Unit = {
    when(
      userService.getEnrichedUserDetails(any)
    ).thenReturn(
      User(
        userOid = "vastaanottaja-oid",
        authorities = List(SecurityConstants.SECURITY_ROOLI_CRUD_FULL)
      )
    )
    when(onrService.haeNimiOption(any[Option[String]])).thenReturn(None)

    val patchBody = Map(
      "id"      -> Some(ykViestiId.toString),
      "vastaus" -> Some("Hyvä on :+1:"),
      "laheta"  -> Some(true)
    )
    val patchBodyAsJson = mapper.writeValueAsString(patchBody)

    mvc
      .perform(
        patch(s"/api/hakemus/hakemus-333/yhteinenkasittely/${ykViestiId.toString}")
          .`with`(csrf())
          .contentType(MediaType.APPLICATION_JSON)
          .content(patchBodyAsJson)
      )
      .andExpect(status().isNoContent)

    mvc
      .perform(
        get(s"/api/hakemus/hakemus-333/yhteinenkasittely")
      )
      .andExpect(status().isOk)
      .andExpect(jsonPath("$", hasSize(2)))
      .andExpect(jsonPath("$[1].vastaus", equalTo("Hyvä on :+1:")))
  }

  @Test
  @WithMockUser(value = "lahettaja-oid", authorities = Array(SecurityConstants.SECURITY_ROOLI_CRUD_FULL))
  @Order(4)
  def merkitseYkViestiLuetuksiPalauttaa204(): Unit = {
    when(
      userService.getEnrichedUserDetails(any)
    ).thenReturn(
      User(
        userOid = "lahettaja-oid",
        authorities = List(SecurityConstants.SECURITY_ROOLI_CRUD_FULL)
      )
    )
    when(onrService.haeNimiOption(any[Option[String]])).thenReturn(None)

    val patchBody       = Map()
    val patchBodyAsJson = mapper.writeValueAsString(patchBody)

    mvc
      .perform(
        patch(s"/api/hakemus/hakemus-333/yhteinenkasittely/${ykViestiId.toString}/luettu")
          .`with`(csrf())
          .contentType(MediaType.APPLICATION_JSON)
          .content(patchBodyAsJson)
      )
      .andExpect(status().isNoContent)

    mvc
      .perform(
        get(s"/api/hakemus/hakemus-333/yhteinenkasittely")
      )
      .andExpect(status().isOk)
      .andExpect(jsonPath("$", hasSize(2)))
      .andExpect(jsonPath("$[1]", hasKey("vastausLuettu")))
  }
}
