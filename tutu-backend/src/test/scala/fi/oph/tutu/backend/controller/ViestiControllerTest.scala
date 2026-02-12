package fi.oph.tutu.backend.controller

import fi.oph.tutu.backend.IntegrationTestBase
import fi.oph.tutu.backend.domain.{Asiakirja, HakemusOid, KansalaisuusKoodi, Kieli, OnrUser, User, Viesti}
import fi.oph.tutu.backend.security.SecurityConstants
import fi.oph.tutu.backend.service.{OnrService, UserService}
import fi.oph.tutu.backend.utils.{AuditLog, AuditOperation}
import fi.oph.tutu.backend.domain.Viestityyppi.ennakkotieto
import org.hamcrest.Matchers.hasSize
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.MethodOrderer.OrderAnnotation
import org.junit.jupiter.api.{BeforeAll, BeforeEach, Order, Test, TestInstance, TestMethodOrder}
import org.junit.jupiter.api.TestInstance.Lifecycle
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
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.{get, put}
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.{jsonPath, status}
import org.springframework.test.web.servlet.setup.{DefaultMockMvcBuilder, MockMvcBuilders, MockMvcConfigurer}
import org.springframework.web.context.WebApplicationContext

import java.time.LocalDateTime
import java.util.UUID

@AutoConfigureMockMvc
@TestInstance(Lifecycle.PER_CLASS)
@ActiveProfiles(Array("test"))
@TestMethodOrder(classOf[OrderAnnotation])
class ViestiControllerTest extends IntegrationTestBase {
  @Autowired
  private val context: WebApplicationContext = null
  private var mvc: MockMvc                   = null

  @MockitoBean
  private var userService: UserService = _

  @MockitoBean
  private var onrService: OnrService = _

  @MockitoBean
  private var auditLog: AuditLog = _

  val lomakeId: Long          = 1527182
  val hakemusOid              = HakemusOid("1.2.246.562.11.00000000001")
  var hakemusId: Option[UUID] = None

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
        lomakeId,
        None,
        asiakirjaRepository.tallennaUudetAsiakirjatiedot(Asiakirja(), "testi"),
        None,
        None,
        "testi"
      )
    )
  }

  @BeforeEach
  def setupTest(): Unit = {
    when(onrService.haeHenkilo("test user"))
      .thenReturn(
        Right(
          OnrUser(
            oidHenkilo = "test user",
            kutsumanimi = "Esko",
            sukunimi = "Esittelijä",
            kansalaisuus = Seq(KansalaisuusKoodi("123")),
            hetu = Some("010170-789X"),
            false
          )
        )
      )
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
  def haeViestinTyoversioPalauttaa404ElleiHakemustaLoydy(): Unit = {
    mvc
      .perform(
        get(s"/api/viesti/tyoversio/1.2.246.562.11.00000000002")
      )
      .andExpect(status().isNotFound)
  }

  @Test
  @WithMockUser(value = "kayttaja", authorities = Array(SecurityConstants.SECURITY_ROOLI_ESITTELIJA_FULL))
  @Order(2)
  def haeViestinTyoversioPalauttaaUudenViestinElleiLoydyKannasta(): Unit = {
    mvc
      .perform(
        get(s"/api/viesti/tyoversio/$hakemusOid")
      )
      .andExpect(status().isOk)
      .andExpect(jsonPath("$.hakemusId").value(hakemusId.get.toString))
    verify(auditLog, times(1)).logRead(any(), any(), eqTo(AuditOperation.ReadViesti), any())
    assert(viestiRepository.haeVahvistamatonViesti(hakemusId.get).isEmpty)
  }

  @Test
  @WithMockUser(value = "kayttaja", authorities = Array(SecurityConstants.SECURITY_ROOLI_ESITTELIJA_FULL))
  @Order(3)
  def tallennaUusiViestiPalauttaa200(): Unit = {
    val newViesti =
      s"""{"kieli": "fi", "viestityyppi": "taydennyspyynto", "otsikko": "Testiviesti", "viesti": "Tämä on testiviesti"}"""
    mvc
      .perform(
        put(s"/api/viesti/$hakemusOid")
          .`with`(csrf())
          .contentType(MediaType.APPLICATION_JSON)
          .content(newViesti)
      )
      .andExpect(status().isOk)

    verify(auditLog, times(1)).logCreate(any(), any(), eqTo(AuditOperation.CreateViesti), any())
  }

  @Test
  @WithMockUser(value = "kayttaja", authorities = Array(SecurityConstants.SECURITY_ROOLI_ESITTELIJA_FULL))
  @Order(4)
  def tallennaOlemassaolevaViestiPalauttaa200(): Unit = {
    val viesti        = viestiRepository.haeVahvistamatonViesti(hakemusId.get).get
    val updatedViesti =
      s"""{"id": "${viesti.id.get}", "hakemusId": "${hakemusId.get}", "kieli": "fi", "viestityyppi": "taydennyspyynto", "otsikko": "Päivitetty", "viesti": "Päivitetty teksti"}"""
    mvc
      .perform(
        put(s"/api/viesti/$hakemusOid")
          .`with`(csrf())
          .contentType(MediaType.APPLICATION_JSON)
          .content(updatedViesti)
      )
      .andExpect(status().isOk)
      .andExpect(jsonPath("$.id").value(viesti.id.get.toString))
      .andExpect(jsonPath("$.otsikko").value("Päivitetty"))
      .andExpect(jsonPath("$.viesti").value("Päivitetty teksti"))

    verify(auditLog, times(1)).logChanges(any(), any(), eqTo(AuditOperation.UpdateViesti), any())
  }

  @Test
  @WithMockUser(value = "kayttaja", authorities = Array(SecurityConstants.SECURITY_ROOLI_ESITTELIJA_FULL))
  @Order(5)
  def haeViestinTyoversioPalauttaaOlemassaolevanViestinKannasta(): Unit = {
    val viesti = viestiRepository.haeVahvistamatonViesti(hakemusId.get).get
    mvc
      .perform(
        get(s"/api/viesti/tyoversio/$hakemusOid")
      )
      .andExpect(status().isOk)
      .andExpect(jsonPath("$.id").value(viesti.id.get.toString))
      .andExpect(jsonPath("$.hakemusId").value(hakemusId.get.toString))
    verify(auditLog, times(1)).logRead(any(), any(), eqTo(AuditOperation.ReadViesti), any())
  }

  @Test
  @WithMockUser(value = "kayttaja", authorities = Array(SecurityConstants.SECURITY_ROOLI_ESITTELIJA_FULL))
  @Order(6)
  def vahvistaViestiPalauttaa200(): Unit = {
    val viesti        = viestiRepository.haeVahvistamatonViesti(hakemusId.get).get
    val updatedViesti =
      s"""{"id": "${viesti.id.get}", "hakemusId": "${hakemusId.get}", "kieli": "fi", "viestityyppi": "taydennyspyynto", "otsikko": "Vahvistettu", "viesti": "Vahvistettu teksti"}"""
    mvc
      .perform(
        put(s"/api/viesti/$hakemusOid/vahvista")
          .`with`(csrf())
          .contentType(MediaType.APPLICATION_JSON)
          .content(updatedViesti)
      )
      .andExpect(status().isOk)
      .andExpect(jsonPath("$.id").value(viesti.id.get.toString))
      .andExpect(jsonPath("$.vahvistettu").isNotEmpty)
      .andExpect(jsonPath("$.vahvistaja").value("test user"))
      .andExpect(jsonPath("$.otsikko").value("Vahvistettu"))
      .andExpect(jsonPath("$.viesti").value("Vahvistettu teksti"))

    verify(auditLog, times(1)).logChanges(any(), any(), eqTo(AuditOperation.UpdateViesti), any())
  }

  @Test
  @WithMockUser(value = "kayttaja", authorities = Array(SecurityConstants.SECURITY_ROOLI_ESITTELIJA_FULL))
  @Order(7)
  def haeVahvistettuViestiPalauttaaOlemassaolevanViestinKannasta(): Unit = {
    val viesti = viestiRepository.haeViestiLista(hakemusId.get).head
    mvc
      .perform(
        get(s"/api/viesti/${viesti.id}")
      )
      .andExpect(status().isOk)
      .andExpect(jsonPath("$.id").value(viesti.id.toString))
    verify(auditLog, times(1)).logRead(any(), any(), eqTo(AuditOperation.ReadViesti), any())
  }

  @Test
  @WithMockUser(value = "kayttaja", authorities = Array(SecurityConstants.SECURITY_ROOLI_ESITTELIJA_FULL))
  @Order(8)
  def haeViestilistaPalauttaaKannastaLoytyvatVahvistetutViestis(): Unit = {
    viestiRepository.lisaaViesti(
      hakemusId.get,
      Viesti(
        kieli = Some(Kieli.fi),
        viestityyppi = Some(ennakkotieto),
        otsikko = Some("Toinen"),
        viesti = Some("Toinen viesti"),
        vahvistettu = Some(LocalDateTime.now()),
        vahvistaja = Some("test user")
      ),
      "test user"
    )
    viestiRepository.lisaaViesti(
      hakemusId.get,
      Viesti(
        kieli = Some(Kieli.sv),
        viestityyppi = Some(ennakkotieto),
        otsikko = Some("Kolmas"),
        viesti = Some("Kolmas viesti"),
        vahvistettu = Some(LocalDateTime.now()),
        vahvistaja = Some("test user")
      ),
      "test user"
    )
    mvc
      .perform(
        get(s"/api/viestilista/$hakemusOid")
      )
      .andExpect(status().isOk)
      .andExpect(jsonPath("$", hasSize(3)))
    verify(auditLog, times(1)).logRead(any(), any(), eqTo(AuditOperation.ReadViestit), any())
  }

  @Test
  @WithMockUser(value = "kayttaja", authorities = Array(SecurityConstants.SECURITY_ROOLI_ESITTELIJA_FULL))
  @Order(9)
  def poistaViestiPalauttaa204(): Unit = {
    val viesti = viestiRepository.haeViestiLista(hakemusId.get).head
    mvc
      .perform(
        MockMvcRequestBuilders
          .delete(s"/api/viesti/${viesti.id}")
          .`with`(csrf())
      )
      .andExpect(status().isNoContent)
    assertEquals(2, viestiRepository.haeViestiLista(hakemusId.get).size)
  }

  @Test
  @WithMockUser(value = "kayttaja", authorities = Array(SecurityConstants.SECURITY_ROOLI_ESITTELIJA_FULL))
  @Order(10)
  def poistaViestiPalauttaa404JosViestiaEiLoydy(): Unit = {
    var idCandidate = UUID.randomUUID()
    while (viestiRepository.haeViesti(idCandidate).isDefined) {
      idCandidate = UUID.randomUUID()
    }
    mvc
      .perform(
        MockMvcRequestBuilders
          .delete(s"/api/viesti/${idCandidate.toString}")
          .`with`(csrf())
      )
      .andExpect(status().isNotFound)
  }

  @Test
  @WithMockUser(value = "kayttaja", authorities = Array(SecurityConstants.SECURITY_ROOLI_ESITTELIJA_FULL))
  @Order(11)
  def tallennaViestiPalauttaa500JosHakemustaEiLoydy(): Unit = {
    val newViesti =
      s"""{"kieli": "fi", "viestityyppi": "taydennyspyynto", "otsikko": "Testiviesti", "teksti": "Tämä on testiviesti"}"""
    mvc
      .perform(
        put(s"/api/viesti/1.2.246.562.11.00000000002")
          .`with`(csrf())
          .contentType(MediaType.APPLICATION_JSON)
          .content(newViesti)
      )
      .andExpect(status().is5xxServerError())
  }

}
