package fi.oph.tutu.backend.controller

import fi.oph.tutu.backend.IntegrationTestBase
import fi.oph.tutu.backend.domain.{Kieli, User, Viestipohja, ViestipohjaKategoria}
import fi.oph.tutu.backend.repository.ViestipohjaRepository
import fi.oph.tutu.backend.security.SecurityConstants
import fi.oph.tutu.backend.service.UserService
import fi.oph.tutu.backend.utils.{AuditLog, AuditOperation}
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

import java.util.UUID

// Claude Codea käytetty testipohjan generoimiseen

@AutoConfigureMockMvc
@TestInstance(Lifecycle.PER_CLASS)
@ActiveProfiles(Array("test"))
@TestMethodOrder(classOf[OrderAnnotation])
class ViestipohjaControllerTest extends IntegrationTestBase {

  @Autowired
  private val context: WebApplicationContext = null
  private var mvc: MockMvc                   = null

  @MockitoBean
  var userService: UserService = _

  @MockitoBean
  var auditLog: AuditLog = _

  @Autowired
  var viestipohjaRepository: ViestipohjaRepository = _

  var testKategoriaId: Option[UUID] = None

  @BeforeAll
  def setup(): Unit = {
    val configurer: MockMvcConfigurer       = SecurityMockMvcConfigurers.springSecurity()
    val intermediate: DefaultMockMvcBuilder = MockMvcBuilders.webAppContextSetup(context).apply(configurer)
    mvc = intermediate.build()

    val kategoria = viestipohjaRepository.lisaaViestipohjaKategoria(
      ViestipohjaKategoria(
        id = None,
        nimi = "Peruskategoria",
        luotu = None,
        luoja = None,
        muokattu = None,
        muokkaaja = None
      ),
      "test-user"
    )
    testKategoriaId = kategoria.id
  }

  @BeforeEach
  def setupTest(): Unit = {
    when(userService.getEnrichedUserDetails(any)).thenReturn(
      User(userOid = "test-user", authorities = List(SecurityConstants.SECURITY_ROOLI_CRUD_FULL))
    )
  }

  // --- GET /api/viestipohja ---

  @Test
  @WithMockUser(value = "kayttaja", authorities = Array(SecurityConstants.SECURITY_ROOLI_CRUD_FULL))
  @Order(1)
  def haeViestipohjaListaPalauttaa200(): Unit = {
    mvc
      .perform(get("/api/viestipohja"))
      .andExpect(status().isOk)
    verify(auditLog, times(1)).logRead(any(), any(), eqTo(AuditOperation.ReadViestipohjat), any())
  }

  // --- GET /api/viestipohja/kategoria ---

  @Test
  @WithMockUser(value = "kayttaja", authorities = Array(SecurityConstants.SECURITY_ROOLI_CRUD_FULL))
  @Order(2)
  def haeViestipohjaKategoriatPalauttaa200(): Unit = {
    mvc
      .perform(get("/api/viestipohja/kategoria"))
      .andExpect(status().isOk)
    verify(auditLog, times(1)).logRead(any(), any(), eqTo(AuditOperation.ReadViestipohjaKategoriat), any())
  }

  // --- PUT /api/viestipohja/kategoria ---

  @Test
  @WithMockUser(value = "kayttaja", authorities = Array(SecurityConstants.SECURITY_ROOLI_CRUD_FULL))
  @Order(3)
  def tallennaUusiViestipohjaKategoriaPalauttaa200(): Unit = {
    val json = """{"nimi": "Uusi kategoria"}"""
    mvc
      .perform(
        put("/api/viestipohja/kategoria")
          .`with`(csrf())
          .contentType(MediaType.APPLICATION_JSON)
          .content(json)
      )
      .andExpect(status().isOk)
      .andExpect(jsonPath("$.nimi").value("Uusi kategoria"))
      .andExpect(jsonPath("$.id").isNotEmpty)
    verify(auditLog, times(1)).logCreate(any(), any(), eqTo(AuditOperation.CreateViestipohjaKategoria), any())
  }

  @Test
  @WithMockUser(value = "kayttaja", authorities = Array(SecurityConstants.SECURITY_ROOLI_CRUD_FULL))
  @Order(4)
  def tallennaOlemassaolevaViestipohjaKategoriaPalauttaa200(): Unit = {
    val kategoriaId = testKategoriaId.get
    val json        = s"""{"id": "${kategoriaId.toString}", "nimi": "Päivitetty nimi"}"""
    mvc
      .perform(
        put("/api/viestipohja/kategoria")
          .`with`(csrf())
          .contentType(MediaType.APPLICATION_JSON)
          .content(json)
      )
      .andExpect(status().isOk)
      .andExpect(jsonPath("$.id").value(kategoriaId.toString))
      .andExpect(jsonPath("$.nimi").value("Päivitetty nimi"))
    verify(auditLog, times(1)).logChanges(any(), any(), eqTo(AuditOperation.UpdateViestipohjaKategoria), any())
  }

  @Test
  @WithMockUser(value = "kayttaja", authorities = Array(SecurityConstants.SECURITY_ROOLI_CRUD_FULL))
  @Order(5)
  def tallennaViestipohjaKategoriaTuntemattomallaTunnisteellaPalauttaa404(): Unit = {
    val nonExistentId = UUID.randomUUID()
    val json          = s"""{"id": "${nonExistentId.toString}", "nimi": "Ei löydy"}"""
    mvc
      .perform(
        put("/api/viestipohja/kategoria")
          .`with`(csrf())
          .contentType(MediaType.APPLICATION_JSON)
          .content(json)
      )
      .andExpect(status().isNotFound)
  }

  // --- PUT /api/viestipohja ---

  @Test
  @WithMockUser(value = "kayttaja", authorities = Array(SecurityConstants.SECURITY_ROOLI_CRUD_FULL))
  @Order(6)
  def tallennaUusiViestipohjaPalauttaa200(): Unit = {
    val kategoriaId = testKategoriaId.get
    val json        =
      s"""{"nimi": "Testipohja", "kategoriaId": "${kategoriaId.toString}", "sisalto": {"fi": "Sisältö suomeksi"}}"""
    mvc
      .perform(
        put("/api/viestipohja")
          .`with`(csrf())
          .contentType(MediaType.APPLICATION_JSON)
          .content(json)
      )
      .andExpect(status().isOk)
      .andExpect(jsonPath("$.nimi").value("Testipohja"))
      .andExpect(jsonPath("$.id").isNotEmpty)
    verify(auditLog, times(1)).logCreate(any(), any(), eqTo(AuditOperation.CreateViestipohja), any())
  }

  @Test
  @WithMockUser(value = "kayttaja", authorities = Array(SecurityConstants.SECURITY_ROOLI_CRUD_FULL))
  @Order(7)
  def tallennaOlemassaolevaViestipohjaPalauttaa200(): Unit = {
    val kategoriaId = testKategoriaId.get
    val viestipohja = viestipohjaRepository.lisaaViestipohja(
      Viestipohja(
        id = None,
        nimi = "Päivitettävä pohja",
        kategoriaId = kategoriaId,
        sisalto = Map(Kieli.fi -> "Vanha sisältö"),
        luotu = None,
        luoja = None,
        muokattu = None,
        muokkaaja = None
      ),
      "test-user"
    )
    val viestipohjaId = viestipohja.id.get
    val json          =
      s"""{"id": "$viestipohjaId", "nimi": "Päivitetty pohja", "kategoriaId": "$kategoriaId", "sisalto": {"fi": "Uusi sisältö"}}"""
    mvc
      .perform(
        put("/api/viestipohja")
          .`with`(csrf())
          .contentType(MediaType.APPLICATION_JSON)
          .content(json)
      )
      .andExpect(status().isOk)
      .andExpect(jsonPath("$.id").value(viestipohjaId.toString))
      .andExpect(jsonPath("$.nimi").value("Päivitetty pohja"))
    verify(auditLog, times(1)).logChanges(any(), any(), eqTo(AuditOperation.UpdateViestipohja), any())
  }

  @Test
  @WithMockUser(value = "kayttaja", authorities = Array(SecurityConstants.SECURITY_ROOLI_CRUD_FULL))
  @Order(8)
  def tallennaViestipohjaTuntemattomallaTunnisteellaPalauttaa404(): Unit = {
    val kategoriaId   = testKategoriaId.get
    val nonExistentId = UUID.randomUUID()
    val json          =
      s"""{"id": "$nonExistentId", "nimi": "Ei löydy", "kategoriaId": "$kategoriaId", "sisalto": {"fi": "Sisältö"}}"""
    mvc
      .perform(
        put("/api/viestipohja")
          .`with`(csrf())
          .contentType(MediaType.APPLICATION_JSON)
          .content(json)
      )
      .andExpect(status().isNotFound)
  }

  // --- GET /api/viestipohja/{viestipohjaId} ---

  @Test
  @WithMockUser(value = "kayttaja", authorities = Array(SecurityConstants.SECURITY_ROOLI_CRUD_FULL))
  @Order(9)
  def haeYksittainenViestipohjaPalauttaaOlemassaolevanPohjan(): Unit = {
    val viestipohjat  = viestipohjaRepository.haeViestipohjaLista()
    val viestipohjaId = viestipohjat.head.id.get
    mvc
      .perform(get(s"/api/viestipohja/$viestipohjaId"))
      .andExpect(status().isOk)
      .andExpect(jsonPath("$.id").value(viestipohjaId.toString))
    verify(auditLog, times(1)).logRead(any(), any(), eqTo(AuditOperation.ReadViestipohja), any())
  }

  @Test
  @WithMockUser(value = "kayttaja", authorities = Array(SecurityConstants.SECURITY_ROOLI_CRUD_FULL))
  @Order(10)
  def haeYksittainenViestipohjaPalauttaa404ElleiLoydyKannasta(): Unit = {
    val nonExistentId = UUID.randomUUID()
    mvc
      .perform(get(s"/api/viestipohja/$nonExistentId"))
      .andExpect(status().isNotFound)
  }

  // --- DELETE /api/viestipohja/{viestipohjaId} ---

  @Test
  @WithMockUser(value = "kayttaja", authorities = Array(SecurityConstants.SECURITY_ROOLI_CRUD_FULL))
  @Order(11)
  def poistaViestipohjaPalauttaa204(): Unit = {
    val viestipohjat  = viestipohjaRepository.haeViestipohjaLista()
    val viestipohjaId = viestipohjat.head.id.get.toString
    mvc
      .perform(
        MockMvcRequestBuilders
          .delete(s"/api/viestipohja/$viestipohjaId")
          .`with`(csrf())
      )
      .andExpect(status().isNoContent)
    verify(auditLog, times(1)).logChanges(any(), any(), eqTo(AuditOperation.DeleteViestiPohja), any())
  }

  @Test
  @WithMockUser(value = "kayttaja", authorities = Array(SecurityConstants.SECURITY_ROOLI_CRUD_FULL))
  @Order(12)
  def poistaViestipohjaPalauttaa404ElleiLoydyKannasta(): Unit = {
    val nonExistentId = UUID.randomUUID().toString
    mvc
      .perform(
        MockMvcRequestBuilders
          .delete(s"/api/viestipohja/$nonExistentId")
          .`with`(csrf())
      )
      .andExpect(status().isNotFound)
  }
}
