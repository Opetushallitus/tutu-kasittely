package fi.oph.tutu.backend.controller

import fi.oph.tutu.backend.IntegrationTestBase
import fi.oph.tutu.backend.domain.*
import fi.oph.tutu.backend.security.SecurityConstants
import fi.oph.tutu.backend.service.*
import org.junit.jupiter.api.*
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.MethodOrderer.OrderAnnotation
import org.junit.jupiter.api.TestInstance.Lifecycle
import org.mockito.ArgumentMatchers.any
import org.mockito.Mockito.*
import org.hamcrest.Matchers.{empty, equalTo, hasKey, hasSize, not}
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

import java.util.UUID
import java.time.LocalDateTime

@AutoConfigureMockMvc
@TestInstance(Lifecycle.PER_CLASS)
@ActiveProfiles(Array("test"))
@TestMethodOrder(classOf[OrderAnnotation])
class YkViestiControllerTest extends IntegrationTestBase {

  @Autowired
  private val context: WebApplicationContext = null
  private var mvc: MockMvc                   = _

  @MockitoBean
  var userService: UserService = _

  @MockitoBean
  var esittelijaService: EsittelijaService = _

  var ykViestiId: UUID = _

  // Viestilistan sarakkeiden testeille omat käyttäjät, jotta muiden testien listat eivät muutu
  private val listaLahettajaOid     = "lista-lahettaja-oid"
  private val listaVastaanottajaOid = "lista-vastaanottaja-oid"

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

    ykViestiId = ykViestiRepository.tallennaHakemuksenYkViesti(
      YkViesti(
        id = null,
        parentId = None,
        hakemusOid = HakemusOid("hakemus-333"),
        lahettajaOid = Some("lahettaja-oid"),
        vastaanottajaOid = Some("vastaanottaja-oid"),
        viesti = Some("Kysymys body"),
        lahetetty = Some(LocalDateTime.parse("2026-10-30T00:00:00.000")),
        hakija = null
      )
    )

    luoListanHakemusJaViesti("hakemus-444", "OPH-444-2026", "1.2.246.562.24.00000000444", "Aino", "Aaltonen")
    luoListanHakemusJaViesti("hakemus-555", "OPH-555-2026", "1.2.246.562.24.00000000555", "Veikko", "Virtanen")
  }

  private def luoListanHakemusJaViesti(
    hakemusOid: String,
    asiatunnus: String,
    esittelijaOid: String,
    kutsumanimi: String,
    sukunimi: String
  ): Unit = {
    val esittelija = esittelijaRepository.insertEsittelija(UserOid(esittelijaOid), "testi", kutsumanimi, sukunimi).get
    hakemusRepository.tallennaHakemus(
      HakemusOid(hakemusOid),
      1,
      1,
      Some(esittelija.esittelijaId),
      asiakirjaRepository.tallennaUudetAsiakirjatiedot(Asiakirja(), "testi"),
      None,
      None,
      "testi"
    )
    hakemusRepository.suoritaPaivitaAsiatunnus(HakemusOid(hakemusOid), asiatunnus, "testi")

    ykViestiRepository.tallennaHakemuksenYkViesti(
      YkViesti(
        id = null,
        parentId = None,
        hakemusOid = HakemusOid(hakemusOid),
        lahettajaOid = Some(listaLahettajaOid),
        vastaanottajaOid = Some(listaVastaanottajaOid),
        viesti = Some(s"Kysymys hakemukselle $hakemusOid"),
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
    when(esittelijaService.haeEsittelijaNimi(any[String])).thenAnswer(invocation =>
      invocation.getArgument(0, classOf[String])
    )

    mvc
      .perform(
        get(s"/tutu-backend/api/hakemus/hakemus-333/yhteinenkasittely")
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
    when(esittelijaService.haeEsittelijaNimi(any[String])).thenAnswer(invocation =>
      invocation.getArgument(0, classOf[String])
    )

    val postBody = Map(
      "parentId"         -> None,
      "viesti"           -> Some("Toinen kyssäri"),
      "vastaanottajaOid" -> Some("vastaanottaja-oid"),
      "laheta"           -> Some(true)
    )
    val postBodyAsJson = mapper.writeValueAsString(postBody)

    mvc
      .perform(
        post(s"/tutu-backend/api/hakemus/hakemus-333/yhteinenkasittely")
          .`with`(csrf())
          .contentType(MediaType.APPLICATION_JSON)
          .content(postBodyAsJson)
      )
      .andExpect(status().isNoContent)

    mvc
      .perform(
        get(s"/tutu-backend/api/hakemus/hakemus-333/yhteinenkasittely")
      )
      .andExpect(status().isOk)
      .andExpect(jsonPath("$", hasSize(2)))
  }

  @Test
  @WithMockUser(value = "vastaanottaja-oid", authorities = Array(SecurityConstants.SECURITY_ROOLI_CRUD_FULL))
  @Order(3)
  def ykViestiOnkoViestejaPalauttaaTruen(): Unit = {
    when(
      userService.getEnrichedUserDetails(any)
    ).thenReturn(
      User(
        userOid = "vastaanottaja-oid",
        authorities = List(SecurityConstants.SECURITY_ROOLI_CRUD_FULL)
      )
    )

    mvc
      .perform(
        get(s"/tutu-backend/api/ykViestiOnkoViesteja")
      )
      .andExpect(status().isOk)
      .andExpect(content().string("true"))
  }

  @Test
  @WithMockUser(value = "vastaanottaja-oid", authorities = Array(SecurityConstants.SECURITY_ROOLI_CRUD_FULL))
  @Order(4)
  def haeYkSaapuneetViestitPalauttaaViestit(): Unit = {
    when(
      userService.getEnrichedUserDetails(any)
    ).thenReturn(
      User(
        userOid = "vastaanottaja-oid",
        authorities = List(SecurityConstants.SECURITY_ROOLI_CRUD_FULL)
      )
    )

    mvc
      .perform(
        get(s"/tutu-backend/api/ykSaapuneetViestit?sort=tila:asc")
      )
      .andExpect(status().isOk)
      .andExpect(
        content().json(
          // TODO: status-kentät näyttivät olevan kesken toteutuspuolella. Tarkistettava kenttien käyttö.
          s"""[{"hakemusOid":"hakemus-333",
                "status" : "vastattu",
                "lahettajaOid":"lahettaja-oid",
                "vastaanottajaOid":"vastaanottaja-oid",
                "viesti":"Kysymys body"},
               {"hakemusOid":"hakemus-333",
                "status" : "vastattu",
                "lahettajaOid":"lahettaja-oid",
                "vastaanottajaOid":"vastaanottaja-oid",
                "viesti":"Toinen kyssäri"}]"""
        )
      )
  }

  @Test
  @WithMockUser(value = "lahettaja-oid", authorities = Array(SecurityConstants.SECURITY_ROOLI_CRUD_FULL))
  @Order(5)
  def haeYkLahetetytViestitPalauttaaViestit(): Unit = {
    when(
      userService.getEnrichedUserDetails(any)
    ).thenReturn(
      User(
        userOid = "lahettaja-oid",
        authorities = List(SecurityConstants.SECURITY_ROOLI_CRUD_FULL)
      )
    )

    mvc
      .perform(
        get(s"/tutu-backend/api/ykLahetetytViestit")
      )
      .andExpect(status().isOk)
      .andExpect(
        content().json(
          s"""[{
            "hakemusOid":"hakemus-333",
            "status" : "vastattu",
            "lahettajaOid":"lahettaja-oid",
            "vastaanottajaOid":"vastaanottaja-oid",
            "viesti":"Toinen kyssäri"
          }, {
            "id":"$ykViestiId",
            "hakemusOid":"hakemus-333",
            "status": "vastattu",
            "lahettajaOid":"lahettaja-oid",
            "vastaanottajaOid":"vastaanottaja-oid",
            "viesti":"Kysymys body"
          }]"""
        )
      )
  }

  @Test
  @WithMockUser(value = "lahettaja-oid", authorities = Array(SecurityConstants.SECURITY_ROOLI_CRUD_FULL))
  @Order(6)
  def merkitseYkViestiLuetuksiPalauttaa204(): Unit = {
    when(
      userService.getEnrichedUserDetails(any)
    ).thenReturn(
      User(
        userOid = "lahettaja-oid",
        authorities = List(SecurityConstants.SECURITY_ROOLI_CRUD_FULL)
      )
    )
    when(esittelijaService.haeEsittelijaNimi(any[String])).thenAnswer(invocation =>
      invocation.getArgument(0, classOf[String])
    )

    val patchBody       = Map()
    val patchBodyAsJson = mapper.writeValueAsString(patchBody)

    mvc
      .perform(
        patch(s"/tutu-backend/api/hakemus/hakemus-333/yhteinenkasittely/${ykViestiId.toString}/luettu")
          .`with`(csrf())
          .contentType(MediaType.APPLICATION_JSON)
          .content(patchBodyAsJson)
      )
      .andExpect(status().isNoContent)

    mvc
      .perform(
        get(s"/tutu-backend/api/hakemus/hakemus-333/yhteinenkasittely")
      )
      .andExpect(status().isOk)
      .andExpect(jsonPath("$", hasSize(2)))
      .andExpect(jsonPath("$[1].aloitusViesti", hasKey("luettu")))
  }

  @Test
  @WithMockUser(value = "lahettaja-oid", authorities = Array(SecurityConstants.SECURITY_ROOLI_CRUD_FULL))
  @Order(8)
  def poistaYKViestiPalauttaa204(): Unit = {
    ////////
    // Setup

    // Luodaan poistettava viesti
    val ykViestiId = ykViestiRepository.tallennaHakemuksenYkViesti(
      YkViesti(
        id = null,
        parentId = None,
        hakemusOid = HakemusOid("hakemus-333"),
        lahettajaOid = Some("lahettaja-oid"),
        luoja = Some("lahettaja-oid"),
        vastaanottajaOid = Some("vastaanottaja-oid"),
        viesti = Some("Kysymys body"),
        hakija = null
      )
    )

    // Poistajan oikeudet
    when(
      userService.getEnrichedUserDetails(any)
    ).thenReturn(
      User(
        userOid = "lahettaja-oid",
        authorities = List(SecurityConstants.SECURITY_ROOLI_CRUD_FULL)
      )
    )

    ////////////////////////
    // Verify - Act - Verify

    // Varmistetaan että hakemus löytyy tietokannasta
    val viestiBefore = ykViestiRepository.haeYkViesti("hakemus-333", ykViestiId.toString)
    assertTrue(viestiBefore.nonEmpty)

    // Suoritetaan poistokutsu
    mvc
      .perform(
        delete(s"/tutu-backend/api/hakemus/hakemus-333/yhteinenkasittely/${ykViestiId.toString}").`with`(csrf())
      )
      .andExpect(status().isNoContent)

    // Varmistetaan että hakemus ei löydy enää tietokannasta
    val viestiAfter = ykViestiRepository.haeYkViesti("hakemus-333", ykViestiId.toString)
    assertTrue(viestiAfter.isEmpty)
  }

  @Test
  @Disabled
  @WithMockUser(value = "lahettaja-oid", authorities = Array())
  @Order(9)
  def poistaYKViestiPalauttaa403KunEiKäyttöoikeuksia(): Unit = {
    ////////
    // Setup

    // Luodaan poistettava viesti
    val ykViestiId = ykViestiRepository.tallennaHakemuksenYkViesti(
      YkViesti(
        id = null,
        parentId = None,
        hakemusOid = HakemusOid("hakemus-333"),
        lahettajaOid = Some("lahettaja-oid"),
        luoja = Some("lahettaja-oid"),
        vastaanottajaOid = Some("vastaanottaja-oid"),
        viesti = Some("Kysymys body"),
        hakija = null
      )
    )

    // Poistajan oikeudet
    when(
      userService.getEnrichedUserDetails(any)
    ).thenReturn(
      User(
        userOid = "lahettaja-oid",
        authorities = List()
      )
    )

    ///////////////
    // Verify - Act - Verify

    // Varmistetaan että hakemus löytyy tietokannasta
    val viestiBefore = ykViestiRepository.haeYkViesti("hakemus-333", ykViestiId.toString)
    assertTrue(viestiBefore.nonEmpty)

    // Suoritetaan poistokutsu
    mvc
      .perform(
        delete(s"/tutu-backend/api/hakemus/hakemus-333/yhteinenkasittely/${ykViestiId.toString}").`with`(csrf())
      )
      .andExpect(status().isForbidden)

    // Varmistetaan että hakemus löytyy tietokannasta
    val viestiAfter = ykViestiRepository.haeYkViesti("hakemus-333", ykViestiId.toString)
    assertTrue(viestiAfter.nonEmpty)
  }

  @Test
  @WithMockUser(value = "lista-vastaanottaja-oid", authorities = Array(SecurityConstants.SECURITY_ROOLI_CRUD_FULL))
  @Order(10)
  def haeYkSaapuneetViestitPalauttaaAsiatunnuksenJaEsittelijan(): Unit = {
    when(
      userService.getEnrichedUserDetails(any)
    ).thenReturn(
      User(
        userOid = listaVastaanottajaOid,
        authorities = List(SecurityConstants.SECURITY_ROOLI_CRUD_FULL)
      )
    )

    mvc
      .perform(
        get(s"/tutu-backend/api/ykSaapuneetViestit?sort=asiatunnus:asc")
      )
      .andExpect(status().isOk)
      .andExpect(jsonPath("$", hasSize(2)))
      .andExpect(jsonPath("$[0].asiatunnus", equalTo("OPH-444-2026")))
      .andExpect(jsonPath("$[0].esittelija", equalTo("Aino Aaltonen")))
      .andExpect(jsonPath("$[1].asiatunnus", equalTo("OPH-555-2026")))
      .andExpect(jsonPath("$[1].esittelija", equalTo("Veikko Virtanen")))
  }

  @Test
  @WithMockUser(value = "lista-lahettaja-oid", authorities = Array(SecurityConstants.SECURITY_ROOLI_CRUD_FULL))
  @Order(11)
  def haeYkLahetetytViestitPalauttaaAsiatunnuksenJaEsittelijan(): Unit = {
    when(
      userService.getEnrichedUserDetails(any)
    ).thenReturn(
      User(
        userOid = listaLahettajaOid,
        authorities = List(SecurityConstants.SECURITY_ROOLI_CRUD_FULL)
      )
    )

    mvc
      .perform(
        get(s"/tutu-backend/api/ykLahetetytViestit?sort=asiatunnus:asc")
      )
      .andExpect(status().isOk)
      .andExpect(jsonPath("$", hasSize(2)))
      .andExpect(jsonPath("$[0].asiatunnus", equalTo("OPH-444-2026")))
      .andExpect(jsonPath("$[0].esittelija", equalTo("Aino Aaltonen")))
      .andExpect(jsonPath("$[1].asiatunnus", equalTo("OPH-555-2026")))
      .andExpect(jsonPath("$[1].esittelija", equalTo("Veikko Virtanen")))
  }

  @Test
  @WithMockUser(value = "lista-lahettaja-oid", authorities = Array(SecurityConstants.SECURITY_ROOLI_CRUD_FULL))
  @Order(12)
  def haeYkLahetetytViestitJarjestaaEsittelijanMukaan(): Unit = {
    when(
      userService.getEnrichedUserDetails(any)
    ).thenReturn(
      User(
        userOid = listaLahettajaOid,
        authorities = List(SecurityConstants.SECURITY_ROOLI_CRUD_FULL)
      )
    )

    mvc
      .perform(
        get(s"/tutu-backend/api/ykLahetetytViestit?sort=esittelija:asc")
      )
      .andExpect(status().isOk)
      .andExpect(jsonPath("$[0].esittelija", equalTo("Aino Aaltonen")))
      .andExpect(jsonPath("$[1].esittelija", equalTo("Veikko Virtanen")))

    mvc
      .perform(
        get(s"/tutu-backend/api/ykLahetetytViestit?sort=esittelija:desc")
      )
      .andExpect(status().isOk)
      .andExpect(jsonPath("$[0].esittelija", equalTo("Veikko Virtanen")))
      .andExpect(jsonPath("$[1].esittelija", equalTo("Aino Aaltonen")))
  }
}
