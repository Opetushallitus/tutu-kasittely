package fi.oph.tutu.backend.controller

import fi.oph.tutu.backend.IntegrationTestBase
import fi.oph.tutu.backend.domain.Viestityyppi.ennakkotieto
import fi.oph.tutu.backend.domain.*
import fi.oph.tutu.backend.security.SecurityConstants
import fi.oph.tutu.backend.service.{OnrService, TranslationService, UserService}
import fi.oph.tutu.backend.utils.{AuditLog, AuditOperation}
import org.hamcrest.Matchers.hasSize
import org.junit.jupiter.api.Assertions.assertEquals
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
  var userService: UserService = _

  @MockitoBean
  var onrService: OnrService = _

  @MockitoBean
  var auditLog: AuditLog = _

  @MockitoBean
  var translationService: TranslationService = _

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
    esittelijaRepository.insertEsittelija(
      UserOid("test user"),
      "luoja",
      "Yrjö",
      "Kortesniemi",
      Some("yka@niemi.fi"),
      Some("123 456789")
    )
  }

  @BeforeEach
  def setupTest(): Unit = {
    when(onrService.haeNimiOption(any[Option[String]])).thenReturn(Some("test user"))
    when(onrService.haeHenkilo("test user"))
      .thenReturn(
        Right(
          OnrUser(
            oidHenkilo = "test user",
            kutsumanimi = "Esko",
            sukunimi = "Esittelijä",
            kansalaisuus = Seq(KansalaisuusKoodi("123")),
            hetu = Some("010170-789X"),
            yhteystiedotRyhma = Seq(),
            yksiloityVTJ = false
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
    when(translationService.getTranslation(any[Kieli], any[String])).thenReturn("")
  }

  @Test
  @WithMockUser(value = "kayttaja", authorities = Array(SecurityConstants.SECURITY_ROOLI_CRUD_FULL))
  @Order(1)
  def haeViestinTyoversioPalauttaa404ElleiHakemustaLoydy(): Unit = {
    mvc
      .perform(
        get(s"/api/viesti/tyoversio/1.2.246.562.11.00000000002")
      )
      .andExpect(status().isNotFound)
  }

  @Test
  @WithMockUser(value = "kayttaja", authorities = Array(SecurityConstants.SECURITY_ROOLI_CRUD_FULL))
  @Order(2)
  def haeViestinTyoversioPalauttaaUudenViestinElleiLoydyKannasta(): Unit = {
    initAtaruHakemusRequests()
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
  @WithMockUser(value = "kayttaja", authorities = Array(SecurityConstants.SECURITY_ROOLI_CRUD_FULL))
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
  @WithMockUser(value = "kayttaja", authorities = Array(SecurityConstants.SECURITY_ROOLI_CRUD_FULL))
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
  @WithMockUser(value = "kayttaja", authorities = Array(SecurityConstants.SECURITY_ROOLI_CRUD_FULL))
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
  @WithMockUser(value = "kayttaja", authorities = Array(SecurityConstants.SECURITY_ROOLI_CRUD_FULL))
  @Order(6)
  def haeVahvistettuViestiPalauttaaOlemassaolevanViestinKannasta(): Unit = {
    val existing = viestiRepository.haeVahvistamatonViesti(hakemusId.get).get
    viestiRepository.tallennaViesti(
      existing.id.get,
      existing.copy(vahvistettu = Some(LocalDateTime.parse("2026-02-06T14:30:00")), vahvistaja = Some("test user")),
      "test user"
    )
    mvc
      .perform(
        get(s"/api/viesti/${existing.id.get}")
      )
      .andExpect(status().isOk)
      .andExpect(jsonPath("$.id").value(existing.id.get.toString))
    verify(auditLog, times(1)).logRead(any(), any(), eqTo(AuditOperation.ReadViesti), any())
  }

  @Test
  @WithMockUser(value = "kayttaja", authorities = Array(SecurityConstants.SECURITY_ROOLI_CRUD_FULL))
  @Order(7)
  def haeViestilistaPalauttaaKannastaLoytyvatVahvistetutViestit(): Unit = {
    viestiRepository.lisaaViesti(
      hakemusId.get,
      Viesti(
        kieli = Some(Kieli.fi),
        tyyppi = Some(ennakkotieto),
        otsikko = Some("Toinen"),
        viesti = Some("Toinen viesti"),
        vahvistettu = Some(LocalDateTime.parse("2026-02-04T14:30:00")),
        vahvistaja = Some("test user")
      ),
      "test user"
    )
    viestiRepository.lisaaViesti(
      hakemusId.get,
      Viesti(
        kieli = Some(Kieli.sv),
        tyyppi = Some(ennakkotieto),
        otsikko = Some("Kolmas"),
        viesti = Some("Kolmas viesti"),
        vahvistettu = Some(LocalDateTime.parse("2026-02-05T14:30:00")),
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
  @WithMockUser(value = "kayttaja", authorities = Array(SecurityConstants.SECURITY_ROOLI_CRUD_FULL))
  @Order(8)
  def haeViestilistaPalauttaaKannastaLoytyvatVahvistetutViestitSortattunaAikaleimanMukaan(): Unit = {
    mvc
      .perform(
        get(s"/api/viestilista/$hakemusOid?sort=vahvistettu:desc")
      )
      .andExpect(status().isOk)
      .andExpect(jsonPath("$", hasSize(3)))
      .andExpect(jsonPath("$[0].otsikko").value("Päivitetty"))
      .andExpect(jsonPath("$[2].otsikko").value("Toinen"))
    verify(auditLog, times(1)).logRead(any(), any(), eqTo(AuditOperation.ReadViestit), any())

    mvc
      .perform(
        get(s"/api/viestilista/$hakemusOid?sort=vahvistettu:asc")
      )
      .andExpect(status().isOk)
      .andExpect(jsonPath("$[0].otsikko").value("Toinen"))
      .andExpect(jsonPath("$[2].otsikko").value("Päivitetty"))
  }

  @Test
  @WithMockUser(value = "kayttaja", authorities = Array(SecurityConstants.SECURITY_ROOLI_CRUD_FULL))
  @Order(9)
  def haeViestilistaPalauttaa400JosSorttausParametritVirheellisest(): Unit = {
    mvc
      .perform(
        get(s"/api/viestilista/$hakemusOid?sort=hopohopolopolopo")
      )
      .andExpect(status().isBadRequest)

    mvc
      .perform(
        get(s"/api/viestilista/$hakemusOid?sort=vahvistettu:hopo")
      )
      .andExpect(status().isBadRequest)

    mvc
      .perform(
        get(s"/api/viestilista/$hakemusOid?sort=eiootammoistakenttaa:desc")
      )
      .andExpect(status().isBadRequest)
  }

  @Test
  @WithMockUser(value = "kayttaja", authorities = Array(SecurityConstants.SECURITY_ROOLI_CRUD_FULL))
  @Order(10)
  def poistaViestiPalauttaa204(): Unit = {
    val viesti = viestiRepository.haeViestiLista(hakemusId.get, None).head
    mvc
      .perform(
        MockMvcRequestBuilders
          .delete(s"/api/viesti/${viesti.id}")
          .`with`(csrf())
      )
      .andExpect(status().isNoContent)
    assertEquals(2, viestiRepository.haeViestiLista(hakemusId.get, None).size)
  }

  @Test
  @WithMockUser(value = "kayttaja", authorities = Array(SecurityConstants.SECURITY_ROOLI_CRUD_FULL))
  @Order(11)
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
  @WithMockUser(value = "kayttaja", authorities = Array(SecurityConstants.SECURITY_ROOLI_CRUD_FULL))
  @Order(12)
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

  @Test
  @WithMockUser(value = "kayttaja", authorities = Array(SecurityConstants.SECURITY_ROOLI_CRUD_FULL))
  @Order(13)
  def haeOletusSisaltoPalauttaaHtmlMuotoistaSisaltoa(): Unit = {
    initAtaruHakemusRequests()
    val result = mvc
      .perform(
        get(s"/api/viesti/oletussisalto/$hakemusOid/taydennyspyynto")
      )
      .andExpect(status().isOk)
      .andReturn()
    assert(result.getResponse.getContentAsString.contains("Yrjö Kortesniemi"))
    assert(result.getResponse.getContentAsString.contains("yka@niemi.fi"))
    assert(result.getResponse.getContentAsString.contains("123 456789"))
  }
}
