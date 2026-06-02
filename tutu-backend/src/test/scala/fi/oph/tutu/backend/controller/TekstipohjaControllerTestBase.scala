package fi.oph.tutu.backend.controller

import fi.oph.tutu.backend.IntegrationTestBase
import fi.oph.tutu.backend.domain.{Kieli, Tekstipohja, TekstipohjaKategoria, TekstipohjaListItem, User}
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
trait TekstipohjaControllerTestBase extends IntegrationTestBase {

  @Autowired
  private val context: WebApplicationContext = null
  private var mvc: MockMvc                   = null

  @MockitoBean
  var userService: UserService = _

  @MockitoBean
  var auditLog: AuditLog = _

  var testKategoriaId: Option[UUID] = None

  def lisaaKategoriaKantaan(kategoria: TekstipohjaKategoria): UUID
  def lisaaTekstipohjaKantaan(tekstipohja: Tekstipohja): UUID
  def haeTekstipohjaLista(): Seq[TekstipohjaListItem]

  def pohjaListPath: String
  def pohjaListKategorioittainPath: String
  def kategoriaListPath: String
  def pohjaSavePath: String
  def kategoriaSavePath: String
  def pohjaAccessPath(viestipohjaId: UUID): String

  def pohjaListAuditOperation: AuditOperation
  def pohjaReadAuditOperation: AuditOperation
  def kategoriaListAuditOperation: AuditOperation
  def kategoriaCreateAuditOperation: AuditOperation
  def kategoriaUpdateAuditOperation: AuditOperation
  def pohjaCreateAuditOperation: AuditOperation
  def pohjaUpdateAuditOperation: AuditOperation
  def pohjaDeleteAuditOperation: AuditOperation

  def lisaaKategoria(nimi: String): UUID = {
    lisaaKategoriaKantaan(
      TekstipohjaKategoria(
        id = None,
        nimi = nimi,
        luotu = None,
        luoja = None,
        muokattu = None,
        muokkaaja = None
      )
    )
  }

  def lisaaTekstipohja(nimi: String, kategoriaId: UUID): UUID = {
    lisaaTekstipohjaKantaan(
      Tekstipohja(
        id = None,
        nimi = nimi,
        kategoriaId = Some(kategoriaId),
        sisalto = Map(Kieli.fi -> "Sisältö suomeksi"),
        luotu = None,
        luoja = None,
        muokattu = None,
        muokkaaja = None
      )
    )
  }

  @BeforeAll
  def setup(): Unit = {
    val configurer: MockMvcConfigurer       = SecurityMockMvcConfigurers.springSecurity()
    val intermediate: DefaultMockMvcBuilder = MockMvcBuilders.webAppContextSetup(context).apply(configurer)
    mvc = intermediate.build()

    testKategoriaId = Some(lisaaKategoria("Peruskategoria"))
  }

  @BeforeEach
  def setupTest(): Unit = {
    when(userService.getEnrichedUserDetails(any)).thenReturn(
      User(userOid = "test-user", authorities = List(SecurityConstants.SECURITY_ROOLI_CRUD_FULL))
    )
  }

  // --- GET /api/XXXXXpohja ---

  @Test
  @WithMockUser(value = "kayttaja", authorities = Array(SecurityConstants.SECURITY_ROOLI_CRUD_FULL))
  @Order(1)
  def haeTekstipohjaListaPalauttaa200(): Unit = {
    mvc
      .perform(get(pohjaListPath))
      .andExpect(status().isOk)
    verify(auditLog, times(1)).logRead(any(), any(), eqTo(pohjaListAuditOperation), any())
  }

  // --- GET /api/XXXXXpohja/kategoria ---

  @Test
  @WithMockUser(value = "kayttaja", authorities = Array(SecurityConstants.SECURITY_ROOLI_CRUD_FULL))
  @Order(2)
  def haeTekstipohjaKategoriatPalauttaa200(): Unit = {
    mvc
      .perform(get(kategoriaListPath))
      .andExpect(status().isOk)
    verify(auditLog, times(1)).logRead(any(), any(), eqTo(kategoriaListAuditOperation), any())
  }

  // --- PUT /api/XXXXXpohja/kategoria ---

  @Test
  @WithMockUser(value = "kayttaja", authorities = Array(SecurityConstants.SECURITY_ROOLI_CRUD_FULL))
  @Order(3)
  def tallennaUusiTekstipohjaKategoriaPalauttaa200(): Unit = {
    val json = """{"nimi": "Uusi kategoria"}"""
    mvc
      .perform(
        put(kategoriaSavePath)
          .`with`(csrf())
          .contentType(MediaType.APPLICATION_JSON)
          .content(json)
      )
      .andExpect(status().isOk)
      .andExpect(jsonPath("$.nimi").value("Uusi kategoria"))
      .andExpect(jsonPath("$.id").isNotEmpty)
    verify(auditLog, times(1)).logCreate(any(), any(), eqTo(kategoriaCreateAuditOperation), any())
  }

  @Test
  @WithMockUser(value = "kayttaja", authorities = Array(SecurityConstants.SECURITY_ROOLI_CRUD_FULL))
  @Order(4)
  def tallennaOlemassaolevaTekstipohjaKategoriaPalauttaa200(): Unit = {
    val kategoriaId = testKategoriaId.get
    val json        = s"""{"id": "${kategoriaId.toString}", "nimi": "Päivitetty nimi"}"""
    mvc
      .perform(
        put(kategoriaSavePath)
          .`with`(csrf())
          .contentType(MediaType.APPLICATION_JSON)
          .content(json)
      )
      .andExpect(status().isOk)
      .andExpect(jsonPath("$.id").value(kategoriaId.toString))
      .andExpect(jsonPath("$.nimi").value("Päivitetty nimi"))
    verify(auditLog, times(1)).logChanges(any(), any(), eqTo(kategoriaUpdateAuditOperation), any())
  }

  @Test
  @WithMockUser(value = "kayttaja", authorities = Array(SecurityConstants.SECURITY_ROOLI_CRUD_FULL))
  @Order(5)
  def tallennaTekstipohjaKategoriaTuntemattomallaTunnisteellaPalauttaa404(): Unit = {
    val nonExistentId = UUID.randomUUID()
    val json          = s"""{"id": "${nonExistentId.toString}", "nimi": "Ei löydy"}"""
    mvc
      .perform(
        put(kategoriaSavePath)
          .`with`(csrf())
          .contentType(MediaType.APPLICATION_JSON)
          .content(json)
      )
      .andExpect(status().isNotFound)
  }

  // --- PUT /api/XXXXXpohja ---

  @Test
  @WithMockUser(value = "kayttaja", authorities = Array(SecurityConstants.SECURITY_ROOLI_CRUD_FULL))
  @Order(6)
  def tallennaUusiTekstipohjaPalauttaa200(): Unit = {
    val kategoriaId = testKategoriaId.get
    val json        =
      s"""{"nimi": "Testipohja", "kategoriaId": "${kategoriaId.toString}", "sisalto": {"fi": "Sisältö suomeksi"}}"""
    mvc
      .perform(
        put(pohjaSavePath)
          .`with`(csrf())
          .contentType(MediaType.APPLICATION_JSON)
          .content(json)
      )
      .andExpect(status().isOk)
      .andExpect(jsonPath("$.nimi").value("Testipohja"))
      .andExpect(jsonPath("$.id").isNotEmpty)
    verify(auditLog, times(1)).logCreate(any(), any(), eqTo(pohjaCreateAuditOperation), any())
  }

  @Test
  @WithMockUser(value = "kayttaja", authorities = Array(SecurityConstants.SECURITY_ROOLI_CRUD_FULL))
  @Order(7)
  def tallennaOlemassaolevaTekstipohjaPalauttaa200(): Unit = {
    val kategoriaId   = testKategoriaId.get
    val tekstipohjaId = lisaaTekstipohjaKantaan(
      Tekstipohja(
        id = None,
        nimi = "Päivitettävä pohja",
        kategoriaId = Some(kategoriaId),
        sisalto = Map(Kieli.fi -> "Vanha sisältö"),
        luotu = None,
        luoja = None,
        muokattu = None,
        muokkaaja = None
      )
    )
    val json =
      s"""{"id": "$tekstipohjaId", "nimi": "Päivitetty pohja", "kategoriaId": "$kategoriaId", "sisalto": {"fi": "Uusi sisältö"}}"""
    mvc
      .perform(
        put(pohjaSavePath)
          .`with`(csrf())
          .contentType(MediaType.APPLICATION_JSON)
          .content(json)
      )
      .andExpect(status().isOk)
      .andExpect(jsonPath("$.id").value(tekstipohjaId.toString))
      .andExpect(jsonPath("$.nimi").value("Päivitetty pohja"))
    verify(auditLog, times(1)).logChanges(any(), any(), eqTo(pohjaUpdateAuditOperation), any())
  }

  @Test
  @WithMockUser(value = "kayttaja", authorities = Array(SecurityConstants.SECURITY_ROOLI_CRUD_FULL))
  @Order(8)
  def tallennaTekstipohjaTuntemattomallaTunnisteellaPalauttaa404(): Unit = {
    val kategoriaId   = testKategoriaId.get
    val nonExistentId = UUID.randomUUID()
    val json          =
      s"""{"id": "$nonExistentId", "nimi": "Ei löydy", "kategoriaId": "$kategoriaId", "sisalto": {"fi": "Sisältö"}}"""
    mvc
      .perform(
        put(pohjaSavePath)
          .`with`(csrf())
          .contentType(MediaType.APPLICATION_JSON)
          .content(json)
      )
      .andExpect(status().isNotFound)
  }

  // --- GET /api/XXXXXpohja/{XXXXXpohjaId} ---

  @Test
  @WithMockUser(value = "kayttaja", authorities = Array(SecurityConstants.SECURITY_ROOLI_CRUD_FULL))
  @Order(9)
  def haeYksittainenTekstipohjaPalauttaaOlemassaolevanPohjan(): Unit = {
    val tekstipohjat  = haeTekstipohjaLista()
    val tekstipohjaId = tekstipohjat.head.id.get
    mvc
      .perform(get(pohjaAccessPath(tekstipohjaId)))
      .andExpect(status().isOk)
      .andExpect(jsonPath("$.id").value(tekstipohjaId.toString))
    verify(auditLog, times(1)).logRead(any(), any(), eqTo(pohjaReadAuditOperation), any())
  }

  @Test
  @WithMockUser(value = "kayttaja", authorities = Array(SecurityConstants.SECURITY_ROOLI_CRUD_FULL))
  @Order(10)
  def haeYksittainenTekstipohjaPalauttaa404ElleiLoydyKannasta(): Unit = {
    val nonExistentId = UUID.randomUUID()
    mvc
      .perform(get(pohjaAccessPath(nonExistentId)))
      .andExpect(status().isNotFound)
  }

  // --- DELETE /api/XXXXXpohja/{XXXXXpohjaId} ---

  @Test
  @WithMockUser(value = "kayttaja", authorities = Array(SecurityConstants.SECURITY_ROOLI_CRUD_FULL))
  @Order(11)
  def poistaTekstipohjaPalauttaa204(): Unit = {
    val tekstipohjat  = haeTekstipohjaLista()
    val tekstipohjaId = tekstipohjat.head.id.get
    mvc
      .perform(
        MockMvcRequestBuilders
          .delete(pohjaAccessPath(tekstipohjaId))
          .`with`(csrf())
      )
      .andExpect(status().isNoContent)
    verify(auditLog, times(1)).logChanges(any(), any(), eqTo(pohjaDeleteAuditOperation), any())
  }

  @Test
  @WithMockUser(value = "kayttaja", authorities = Array(SecurityConstants.SECURITY_ROOLI_CRUD_FULL))
  @Order(12)
  def poistaTekstipohjaPalauttaa404ElleiLoydyKannasta(): Unit = {
    val nonExistentId = UUID.randomUUID()
    mvc
      .perform(
        MockMvcRequestBuilders
          .delete(pohjaAccessPath(nonExistentId))
          .`with`(csrf())
      )
      .andExpect(status().isNotFound)
  }

  // --- GET /api/XXXXXpohja/kategorioittain ---

  @Test
  @WithMockUser(value = "kayttaja", authorities = Array(SecurityConstants.SECURITY_ROOLI_CRUD_FULL))
  @Order(13)
  def haeTekstipohjatKategorioittainPalauttaa200(): Unit = {
    val kategoria1 = lisaaKategoria("Toinen kategoria")
    val kategoria2 = lisaaKategoria("Kolmas kategoria")
    val kategoria3 = lisaaKategoria("Neljäs kategoria")
    lisaaTekstipohja("Toinen pohja", kategoria1)
    lisaaTekstipohja("Kolmas pohja", kategoria1)
    lisaaTekstipohja("Neljäs pohja", kategoria3)
    lisaaTekstipohja("Viides pohja", kategoria2)
    lisaaTekstipohja("Kuudes pohja", kategoria3)
    lisaaTekstipohja("Seitsemäs pohja", testKategoriaId.get)

    mvc
      .perform(get(pohjaListKategorioittainPath))
      .andExpect(status().isOk)
      .andExpect(jsonPath("$[0].kategoriaNimi").value("Päivitetty nimi"))
      .andExpect(jsonPath("$[0].pohjat[0].nimi").value("Päivitetty pohja"))
      .andExpect(jsonPath("$[0].pohjat[1].nimi").value("Seitsemäs pohja"))
      .andExpect(jsonPath("$[1].kategoriaNimi").value("Uusi kategoria"))
      .andExpect(jsonPath("$[1].pohjat").isEmpty)
      .andExpect(jsonPath("$[2].kategoriaNimi").value("Toinen kategoria"))
      .andExpect(jsonPath("$[2].pohjat[0].nimi").value("Toinen pohja"))
      .andExpect(jsonPath("$[2].pohjat[1].nimi").value("Kolmas pohja"))
      .andExpect(jsonPath("$[3].kategoriaNimi").value("Kolmas kategoria"))
      .andExpect(jsonPath("$[3].pohjat[0].nimi").value("Viides pohja"))
      .andExpect(jsonPath("$[4].kategoriaNimi").value("Neljäs kategoria"))
      .andExpect(jsonPath("$[4].pohjat[0].nimi").value("Neljäs pohja"))
      .andExpect(jsonPath("$[4].pohjat[1].nimi").value("Kuudes pohja"))
      .andReturn()
    verify(auditLog, times(1)).logRead(any(), any(), eqTo(pohjaListAuditOperation), any())
  }
}
