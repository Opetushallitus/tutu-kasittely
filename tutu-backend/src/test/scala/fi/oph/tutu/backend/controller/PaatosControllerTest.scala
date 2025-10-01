package fi.oph.tutu.backend.controller

import fi.oph.tutu.backend.IntegrationTestBase
import fi.oph.tutu.backend.domain.*
import fi.oph.tutu.backend.security.SecurityConstants
import fi.oph.tutu.backend.service.UserService
import fi.oph.tutu.backend.utils.{AuditLog, AuditOperation}
import org.junit.jupiter.api.MethodOrderer.OrderAnnotation
import org.junit.jupiter.api.TestInstance.Lifecycle
import org.junit.jupiter.api.*
import org.mockito.ArgumentMatchers.{any, eq as eqTo}
import org.mockito.Mockito.*
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.http.MediaType
import org.springframework.security.test.context.support.WithMockUser
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf
import org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.bean.`override`.mockito.MockitoBean
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.{get, post}
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.{content, jsonPath, status}
import org.springframework.test.web.servlet.setup.{DefaultMockMvcBuilder, MockMvcBuilders, MockMvcConfigurer}
import org.springframework.web.context.WebApplicationContext

import java.util.UUID

@AutoConfigureMockMvc
@TestInstance(Lifecycle.PER_CLASS)
@ActiveProfiles(Array("test"))
@TestMethodOrder(classOf[OrderAnnotation])
class PaatosControllerTest extends IntegrationTestBase {
  @Autowired
  private val context: WebApplicationContext = null
  private var mvc: MockMvc                   = null

  @MockitoBean
  private var userService: UserService = _

  @MockitoBean
  private var auditLog: AuditLog = _

  val hakemusOid: HakemusOid  = HakemusOid("1.2.246.562.11.00000000000000006666")
  var hakemusId: Option[UUID] = None
  var paatos: Paatos          = _

  private def makePaatos(givenHakemusId: Option[UUID]): Paatos = {
    Paatos(
      id = None,
      hakemusId = givenHakemusId,
      ratkaisutyyppi = pick(Ratkaisutyyppi.values.map(Some(_)) ++ None),
      seutArviointi = pickBoolean,
      luotu = None,
      muokattu = None,
      luoja = None,
      muokkaaja = None
    )
  }
  private def paatos2Json(paatos: Paatos, ignoreFields: String*): String = {
    val paatosAsMap = paatos.productElementNames.toList.zip(paatos.productIterator.toList).toMap -- ignoreFields
    mapper.writeValueAsString(paatosAsMap)
  }

  @BeforeAll def setup(): Unit = {
    val configurer: MockMvcConfigurer =
      SecurityMockMvcConfigurers.springSecurity()
    val intermediate: DefaultMockMvcBuilder =
      MockMvcBuilders.webAppContextSetup(context).apply(configurer)
    mvc = intermediate.build()

    hakemusId = Some(
      hakemusRepository.tallennaHakemus(
        hakemusOid,
        1,
        None,
        asiakirjaRepository.tallennaUudetAsiakirjatiedot(Asiakirja(), "testi"),
        "testi"
      )
    )
    paatos = makePaatos(hakemusId)
  }

  @BeforeEach
  def initMocks(): Unit = {
    when(
      userService.getEnrichedUserDetails(any)
    ).thenReturn(
      User(
        userOid = "test user",
        authorities = List()
      )
    )
  }
  @Test
  @WithMockUser(value = "kayttaja", authorities = Array(SecurityConstants.SECURITY_ROOLI_ESITTELIJA_FULL))
  @Order(1)
  def tallennaPaatosPalauttaa200JaKantaanTallennetunDatan(): Unit = {
    val paatosJSON = paatos2Json(paatos, "id", "luoja", "luotu", "muokattu", "muokkaaja")
    mvc
      .perform(
        post(s"/api/paatos/${hakemusOid}")
          .`with`(csrf())
          .contentType(MediaType.APPLICATION_JSON)
          .content(paatosJSON)
      )
      .andExpect(status().isOk)
      .andExpect(jsonPath("$.id").isString)
      .andExpect(content().json(paatosJSON))
    verify(auditLog, times(1)).logChanges(any(), any(), eqTo(AuditOperation.UpdatePaatos), any())
  }

  @Test
  @WithMockUser(value = "kayttaja", authorities = Array(SecurityConstants.SECURITY_ROOLI_ESITTELIJA_FULL))
  @Order(2)
  def haePaatosPalauttaa200(): Unit = {
    val paatosId   = paatosRepository.haePaatos(hakemusId.get).get.id
    val paatosJSON =
      paatos2Json(paatos.copy(id = paatosId, luoja = Some("test user")), "id", "luotu", "muokattu", "muokkaaja")
    mvc
      .perform(
        get(s"/api/paatos/${hakemusOid}")
      )
      .andExpect(status().isOk)
      .andExpect(jsonPath("$.id").isString)
      .andExpect(content().json(paatosJSON))
    verify(auditLog, times(1)).logRead(any(), any(), eqTo(AuditOperation.ReadPaatos), any())
  }

  @Test
  @WithMockUser(value = "kayttaja", authorities = Array(SecurityConstants.SECURITY_ROOLI_ESITTELIJA_FULL))
  @Order(3)
  def haePaatosPalauttaa404KunPaatosEiKannassa(): Unit = {
    mvc
      .perform(
        get(s"/api/paatos/${HakemusOid("1.2.246.562.11.00000000000000009999")}")
      )
      .andExpect(status().isNotFound)
    verify(auditLog, times(0)).logRead(any(), any(), eqTo(AuditOperation.ReadPaatos), any())
  }

  @Test
  @WithMockUser(value = "kayttaja", authorities = Array(SecurityConstants.SECURITY_ROOLI_ESITTELIJA_FULL))
  @Order(4)
  def tallennaPaatosPalauttaa500KunHakemusEiKannassa(): Unit = {
    val paatosJSON = paatos2Json(paatos, "id", "luoja", "luotu", "muokattu", "muokkaaja")
    mvc
      .perform(
        post(s"/api/paatos/${HakemusOid("1.2.246.562.11.00000000000000009999")}")
          .`with`(csrf())
          .contentType(MediaType.APPLICATION_JSON)
          .content(paatosJSON)
      )
      .andExpect(status().isInternalServerError)
    verify(auditLog, times(0)).logChanges(any(), any(), eqTo(AuditOperation.UpdatePaatos), any())
  }
}
