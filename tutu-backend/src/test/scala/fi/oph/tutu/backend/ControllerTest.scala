package fi.oph.tutu.backend

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.scala.DefaultScalaModule
import fi.oph.tutu.backend.domain.{
  AtaruHakemus,
  DbEsittelija,
  HakemusOid,
  Hakija,
  Kieli,
  OnrUser,
  PartialHakemus,
  UserOid,
  UusiAtaruHakemus
}
import fi.oph.tutu.backend.fixture.hakijaFixture
import fi.oph.tutu.backend.repository.{EsittelijaRepository, HakemusRepository}
import fi.oph.tutu.backend.security.SecurityConstants
import fi.oph.tutu.backend.service.*
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

import java.io.FileNotFoundException
import scala.io.Source

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

  @MockitoBean
  var hakemuspalveluService: HakemuspalveluService = _

  @MockitoBean
  var kayttooikeusService: KayttooikeusService = _

  @Autowired
  var userService: UserService = _

  @MockitoBean
  var ataruHakemusParser: AtaruHakemusParser = _

  final val esittelijaOidString = "1.2.246.562.24.00000000000000006666"

  var esittelija: Option[DbEsittelija] = None
  @BeforeAll def setup(): Unit = {
    val configurer: MockMvcConfigurer =
      SecurityMockMvcConfigurers.springSecurity()
    val intermediate: DefaultMockMvcBuilder =
      MockMvcBuilders.webAppContextSetup(context).apply(configurer)
    mockMvc = intermediate.build()
    esittelija = esittelijaRepository.upsertEsittelija("0008", UserOid(esittelijaOidString), "testi")
  }
  @BeforeEach
  def setupTest(): Unit =
    when(mockOnrService.haeAsiointikieli(any[String]))
      .thenReturn(Right("fi"))

    when(mockOnrService.haeHenkilo(esittelijaOidString))
      .thenReturn(Right(OnrUser(esittelijaOidString, "Esko", "Esittelijä")))

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
    value = esittelijaOidString,
    authorities = Array(SecurityConstants.SECURITY_ROOLI_ESITTELIJA_FULL)
  )
  def luoHakemusValidRequestWithoutEsittelijaReturns200(): Unit = {
    val hakemus     = UusiAtaruHakemus(HakemusOid("1.2.246.562.11.00000000000000006666"), "0008", 1)
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
    value = esittelijaOidString,
    authorities = Array(SecurityConstants.SECURITY_ROOLI_ESITTELIJA_FULL)
  )
  def luoHakemusValidRequestReturns500WhenHakemusAlreadyExists(): Unit = {
    val hakemus     = UusiAtaruHakemus(HakemusOid("1.2.246.562.11.00000000000000006666"), "0008", 1)
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
    value = esittelijaOidString,
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
    val hakemus     = UusiAtaruHakemus(HakemusOid("1.2.246.562.11.00000000000000006667"), "0008", 0)
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
    val hakemus     = UusiAtaruHakemus(HakemusOid("1.2.246.562.11.00000000000000006667"), "0008", 0)
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
    value = esittelijaOidString,
    authorities = Array(SecurityConstants.SECURITY_ROOLI_ESITTELIJA_FULL)
  )
  def luoHakemusValidRequestReturns200WithCorrectEsittelijaOid(): Unit = {
    val hakemus     = UusiAtaruHakemus(HakemusOid("1.2.246.562.11.00000000000000006665"), "0008", 0)
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
    assert(insertedHakemus.esittelijaOid.get == esittelija.get.esittelijaOid.toString)
  }

  @Test
  @Order(7)
  @WithMockUser(
    value = esittelijaOidString,
    authorities = Array(SecurityConstants.SECURITY_ROOLI_ESITTELIJA_FULL)
  )
  def haeHakemuslistaReturns200AndArrayOfHakemusListItems(): Unit = {
    when(hakemuspalveluService.haeHakemukset(any[Seq[HakemusOid]]))
      .thenReturn(Right(loadJson("ataruHakemukset.json")))

    val expectedResult = s"""[{
                                "asiatunnus" : null,
                                "hakija" : "Testi Neljäs Hakija",
                                "aika" : "2025-05-14T10:59:47.597Z",
                                "hakemusOid" : "1.2.246.562.11.00000000000000006668",
                                "hakemusKoskee" : 1,
                                "esittelijaOid" : "1.2.246.562.24.00000000000000006666",
                                "esittelijaKutsumanimi": "Esko",
                                "esittelijaSukunimi": "Esittelijä",
                                "kasittelyVaihe": "AlkukasittelyKesken"
                              }, {
                                "asiatunnus" : null,
                                "hakija" : "Testi Hakija",
                                "aika" : "2025-05-14T11:06:38.273Z",
                                "hakemusOid" : "1.2.246.562.11.00000000000000006665",
                                "hakemusKoskee" : 0,
                                "esittelijaOid" : "1.2.246.562.24.00000000000000006666",
                                "esittelijaKutsumanimi": "Esko",
                                "esittelijaSukunimi": "Esittelijä",
                                "kasittelyVaihe": "AlkukasittelyKesken"
                              }, {
                                "asiatunnus" : null,
                                "hakija" : "Testi Toka Hakija",
                                "aika" : "2025-05-14T10:59:47.597Z",
                                "hakemusOid" : "1.2.246.562.11.00000000000000006666",
                                "hakemusKoskee" : 1,
                                "esittelijaOid" : "1.2.246.562.24.00000000000000006666",
                                "esittelijaKutsumanimi": "Esko",
                                "esittelijaSukunimi": "Esittelijä",
                                "kasittelyVaihe": "AlkukasittelyKesken"
                              }, {
                                "asiatunnus" : null,
                                "hakija" : "Testi Kolmas Hakija",
                                "aika" : "2025-05-14T10:59:47.597Z",
                                "hakemusOid" : "1.2.246.562.11.00000000000000006667",
                                "hakemusKoskee" : 0,
                                "esittelijaOid" : null,
                                "esittelijaKutsumanimi": null,
                                "esittelijaSukunimi": null,
                                "kasittelyVaihe": "AlkukasittelyKesken"
                              } ]"""

    hakemusService.tallennaHakemus(UusiAtaruHakemus(HakemusOid("1.2.246.562.11.00000000000000006667"), "0000", 0))
    hakemusService.tallennaHakemus(UusiAtaruHakemus(HakemusOid("1.2.246.562.11.00000000000000006668"), "0008", 1))

    val result = mockMvc
      .perform(
        get("/api/hakemuslista")
      )
      .andExpect(status().isOk)
      .andExpect(content().contentType(MediaType.APPLICATION_JSON))
      .andExpect(content().json(expectedResult))
  }

  @Test
  @Order(8)
  @WithMockUser(value = esittelijaOidString, authorities = Array(SecurityConstants.SECURITY_ROOLI_ESITTELIJA_FULL))
  def haeHakemuslistaReturns200AndArrayOfHakemusListItemsWithNaytaAndHakemuskoskeeQueryParameters(): Unit = {
    when(hakemuspalveluService.haeHakemukset(any[Seq[HakemusOid]]))
      .thenReturn(Right(loadJson("ataruHakemukset.json")))

    val expectedResult = s"""[{
                                "asiatunnus" : null,
                                "hakija" : "Testi Neljäs Hakija",
                                "aika" : "2025-05-14T10:59:47.597Z",
                                "hakemusOid" : "1.2.246.562.11.00000000000000006668",
                                "hakemusKoskee" : 1,
                                "esittelijaOid" : "1.2.246.562.24.00000000000000006666",
                                "esittelijaKutsumanimi": "Esko",
                                "esittelijaSukunimi": "Esittelijä",
                                "kasittelyVaihe": "AlkukasittelyKesken"
                              }, {
                                "asiatunnus" : null,
                                "hakija" : "Testi Toka Hakija",
                                "aika" : "2025-05-14T10:59:47.597Z",
                                "hakemusOid" : "1.2.246.562.11.00000000000000006666",
                                "hakemusKoskee" : 1,
                                "esittelijaOid" : "1.2.246.562.24.00000000000000006666",
                                "esittelijaKutsumanimi": "Esko",
                                "esittelijaSukunimi": "Esittelijä",
                                "kasittelyVaihe": "AlkukasittelyKesken"
                              } ]"""

    val result = mockMvc
      .perform(
        get("/api/hakemuslista?nayta=omat&hakemuskoskee=1")
      )
      .andExpect(status().isOk)
      .andExpect(content().contentType(MediaType.APPLICATION_JSON))
      .andExpect(content().json(expectedResult))
  }

  @Test
  @Order(9)
  @WithMockUser(value = esittelijaOidString, authorities = Array(SecurityConstants.SECURITY_ROOLI_ESITTELIJA_FULL))
  def haeHakemusValidRequestReturns200(): Unit = {

    when(hakemuspalveluService.haeHakemus(any[HakemusOid]))
      .thenReturn(Right(loadJson("ataruHakemus.json")))
    when(hakemuspalveluService.haeMuutoshistoria(any[HakemusOid])).thenReturn(
      Right(loadJson("muutosHistoria.json"))
    )
    when(hakemuspalveluService.haeLomake(any[Long]))
      .thenReturn(Right(loadJson("ataruLomake.json")))
    when(ataruHakemusParser.parseHakija(any[AtaruHakemus])).thenReturn(hakijaFixture)

    val expectedResult = s"""{
                                "hakemusOid": "1.2.246.562.11.00000000000000006667",
                                "hakija": {
                                  "etunimet": "Testi Kolmas",
                                  "kutsumanimi": "Tatu",
                                  "sukunimi": "Hakija",
                                  "kansalaisuus": {
                                    "fi": "Suomi",
                                    "sv": "Finland",
                                    "en": "Finland"
                                  },
                                  "asuinmaa": {"fi": "Suomi", "sv": "Finland", "en": "Finland"},
                                  "kotikunta": {
                                    "fi": "Kajaani",
                                    "sv": "Kajana",
                                    "en": "Kanada"
                                  },
                                  "hetu": "180462-9981",
                                  "syntymaaika": "18.04.1962",
                                  "matkapuhelin": "+3584411222333",
                                  "katuosoite": "Sillitie 1",
                                  "postinumero": "00800",
                                  "postitoimipaikka": "HELSINKI",
                                  "sahkopostiosoite": "patu.kuusinen@riibasu.fi"
                                },
                                "asiatunnus": null,
                                "kirjausPvm": "2025-05-14T10:59:47.597",
                                "esittelyPvm": null,
                                "paatosPvm": null,
                                "esittelijaOid": null,
                                "ataruHakemuksenTila": "KasittelyMaksettu",
                                "kasittelyVaihe": "AlkukasittelyKesken",
                                "muutosHistoria": [{
                                  "role": "Esittelija",
                                  "time": "2025-06-17T10:02:20.473",
                                  "modifiedBy": "Esko Esittelijä"
                                  }, {
                                  "role": "Hakija",
                                  "time": "2025-06-17T15:19:44.23",
                                  "modifiedBy": "Tatu Hakija"
                                  }, {
                                  "role": "Esittelija",
                                  "time": "2025-06-18T05:57:18.866",
                                  "modifiedBy": "Esko Esittelijä"}]
                              }"""

    val result = mockMvc
      .perform(
        get("/api/hakemus/1.2.246.562.11.00000000000000006667")
      )
      .andExpect(status().isOk)
      .andExpect(content().contentType(MediaType.APPLICATION_JSON))
      .andExpect(content().json(expectedResult))
  }

  @Test
  @Order(10)
  @WithMockUser(value = esittelijaOidString, authorities = Array(SecurityConstants.SECURITY_ROOLI_ESITTELIJA_FULL))
  def haeHakemusValidRequestReturns404WhenAtaruHakemusNotFound(): Unit = {

    when(
      hakemuspalveluService.haeHakemus(HakemusOid("1.2.246.562.11.00000000000002354670"))
    ).thenReturn(Left(NotFoundException()))

    mockMvc
      .perform(
        get("/api/hakemus/1.2.246.562.11.00000000000002354670")
      )
      .andExpect(status().isNotFound)
      .andExpect(content().contentType(MediaType.valueOf("text/plain; charset=UTF-8")))
      .andExpect(
        content().json(
          """{"message":"Hakemusta ei löytynyt"}"""
        )
      )
  }

  @Test
  @Order(11)
  @WithMockUser(
    value = esittelijaOidString,
    authorities = Array(SecurityConstants.SECURITY_ROOLI_ESITTELIJA_FULL)
  )
  def paivitaHakemusValidRequestReturns200WithChangedEsittelijaOid(): Unit = {
    when(hakemuspalveluService.haeHakemus(any[HakemusOid]))
      .thenReturn(Right(loadJson("ataruHakemus.json")))
    when(hakemuspalveluService.haeMuutoshistoria(any[HakemusOid])).thenReturn(
      Right(loadJson("muutosHistoria.json"))
    )
    when(hakemuspalveluService.haeLomake(any[Long]))
      .thenReturn(Right(loadJson("ataruLomake.json")))
    when(ataruHakemusParser.parseHakija(any[AtaruHakemus])).thenReturn(hakijaFixture)

    // maakoodi 0000 -> esittelijaOid = null
    val originalHakemus = UusiAtaruHakemus(HakemusOid("1.2.246.562.11.00000000000000006670"), "0000", 0)
    hakemusService.tallennaHakemus(originalHakemus)

    // Päivitetään esittelijaOid
    var updatedHakemus = PartialHakemus(
      esittelijaOid = Some(esittelijaOidString)
    )
    var requestJson = mapper.writeValueAsString(updatedHakemus)

    mockMvc
      .perform(
        patch("/api/hakemus/1.2.246.562.11.00000000000000006670")
          .`with`(csrf())
          .contentType(MediaType.APPLICATION_JSON)
          .content(requestJson)
      )
      .andExpect(status().isOk)

    var paivitettyHakemus = hakemusService.haeHakemus(HakemusOid("1.2.246.562.11.00000000000000006670"))
    assert(paivitettyHakemus.get.esittelijaOid.contains(esittelijaOidString))

    // Päivitetään hakemuskoskee 1 -> 0
    updatedHakemus = PartialHakemus(
      hakemusKoskee = Some(0)
    )
    requestJson = mapper.writeValueAsString(updatedHakemus)

    mockMvc
      .perform(
        patch("/api/hakemus/1.2.246.562.11.00000000000000006670")
          .`with`(csrf())
          .contentType(MediaType.APPLICATION_JSON)
          .content(requestJson)
      )
      .andExpect(status().isOk)

    paivitettyHakemus = hakemusService.haeHakemus(HakemusOid("1.2.246.562.11.00000000000000006670"))
    assert(paivitettyHakemus.get.hakemusKoskee == 0)

    // Päivitetään asiatunnus
    updatedHakemus = PartialHakemus(
      asiatunnus = Some("OPH-122-2025")
    )
    requestJson = mapper.writeValueAsString(updatedHakemus)

    mockMvc
      .perform(
        patch("/api/hakemus/1.2.246.562.11.00000000000000006670")
          .`with`(csrf())
          .contentType(MediaType.APPLICATION_JSON)
          .content(requestJson)
      )
      .andExpect(status().isOk)

    paivitettyHakemus = hakemusService.haeHakemus(HakemusOid("1.2.246.562.11.00000000000000006670"))
    assert(paivitettyHakemus.get.hakemusKoskee == 0)
  }

  @Test
  @WithMockUser(value = "kayttaja", authorities = Array(SecurityConstants.SECURITY_ROOLI_ESITTELIJA_FULL))
  def haeEsittelijatReturns200WithValidHenkilot(): Unit = {
    val expectedResult =
      """[
        |  {
        |    "esittelijaOid": "1.2.246.562.24.00000000001",
        |    "etunimi": "Roope",
        |    "sukunimi": "Roihuvuori"
        |  },
        |  {
        |    "esittelijaOid": "1.2.246.562.24.00000000002",
        |    "etunimi": "Jarmo",
        |    "sukunimi": "Jakomäki"
        |  }
        |]""".stripMargin
    when(
      kayttooikeusService.haeEsittelijat
    ).thenReturn(Right(Seq("1.2.246.562.24.00000000001", "1.2.246.562.24.00000000002")))
    when(mockOnrService.haeHenkilo("1.2.246.562.24.00000000001"))
      .thenReturn(Right(OnrUser("1.2.246.562.24.00000000001", "Roope", "Roihuvuori")))
    when(mockOnrService.haeHenkilo("1.2.246.562.24.00000000002"))
      .thenReturn(Right(OnrUser("1.2.246.562.24.00000000002", "Jarmo", "Jakomäki")))

    mockMvc
      .perform(
        get("/api/esittelijat")
      )
      .andExpect(status().isOk)
      .andExpect(content().contentType(MediaType.APPLICATION_JSON))
      .andExpect(content().json(expectedResult))
  }

}
