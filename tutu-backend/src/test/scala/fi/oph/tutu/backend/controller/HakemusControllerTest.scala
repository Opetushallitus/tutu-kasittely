package fi.oph.tutu.backend.controller

import fi.oph.tutu.backend.IntegrationTestBase
import fi.oph.tutu.backend.domain.*
import fi.oph.tutu.backend.security.SecurityConstants
import fi.oph.tutu.backend.service.*
import fi.oph.tutu.backend.utils.Constants.DATE_TIME_FORMAT
import fi.oph.tutu.backend.utils.{AuditLog, AuditOperation}
import org.junit.jupiter.api.*
import org.junit.jupiter.api.Assertions.fail
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

import java.time.format.DateTimeFormatter
import java.time.{LocalDateTime, ZoneId, ZonedDateTime}

object HakemusControllerTestConstants {
  final val ESITTELIJA_OID = "1.2.246.562.24.00000000003"
}

@AutoConfigureMockMvc
@TestInstance(Lifecycle.PER_CLASS)
@ActiveProfiles(Array("test"))
@TestMethodOrder(classOf[OrderAnnotation])
class HakemusControllerTest extends IntegrationTestBase {

  @Autowired
  private val context: WebApplicationContext = null
  private var mockMvc: MockMvc               = null

  @MockitoBean
  var auditLog: AuditLog = _

  @MockitoBean
  var userService: fi.oph.tutu.backend.service.UserService = _

  @MockitoBean
  var mockOnrService: OnrService = _

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
            false
          )
        )
      )
  }

  @Test
  @WithMockUser(value = "kayttaja", authorities = Array(SecurityConstants.SECURITY_ROOLI_ESITTELIJA_FULL))
  def luoHakemusInvalidRequestReturns400(): Unit = {
    when(userService.getEnrichedUserDetails(any[Boolean]))
      .thenReturn(
        fi.oph.tutu.backend.domain.User(
          userOid = "kayttaja",
          authorities = List(SecurityConstants.SECURITY_ROOLI_ESITTELIJA_FULL)
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
    authorities = Array(SecurityConstants.SECURITY_ROOLI_ESITTELIJA_FULL)
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
  @WithMockUser(
    value = HakemusControllerTestConstants.ESITTELIJA_OID,
    authorities = Array(SecurityConstants.SECURITY_ROOLI_ESITTELIJA_FULL)
  )
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
  @WithMockUser(
    value = HakemusControllerTestConstants.ESITTELIJA_OID,
    authorities = Array(SecurityConstants.SECURITY_ROOLI_ESITTELIJA_FULL)
  )
  def paivitaHakemusMalformedJsonReturns400(): Unit = {
    when(userService.getEnrichedUserDetails(any[Boolean]))
      .thenReturn(
        fi.oph.tutu.backend.domain.User(
          userOid = HakemusControllerTestConstants.ESITTELIJA_OID,
          authorities = List(SecurityConstants.SECURITY_ROOLI_ESITTELIJA_FULL)
        )
      )

    val hakemusOid  = "1.2.246.562.11.00000000000000006666"
    val requestJson = """{"invalid json structure"""

    mockMvc
      .perform(
        put(s"/api/hakemus/$hakemusOid")
          .`with`(csrf())
          .contentType(MediaType.APPLICATION_JSON)
          .content(requestJson)
      )
      .andExpect(status().isBadRequest)
  }

  @Test
  @Order(1)
  @WithMockUser(
    value = esittelijaOidString,
    authorities = Array(SecurityConstants.SECURITY_ROOLI_ESITTELIJA_FULL)
  )
  def luoHakemusValidRequestReturns200(): Unit = {
    when(userService.getEnrichedUserDetails(any[Boolean]))
      .thenReturn(
        User(userOid = esittelijaOidString, authorities = List(SecurityConstants.SECURITY_ROOLI_ESITTELIJA_FULL))
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

    verify(auditLog, times(1)).logCreate(any(), any(), eqTo(AuditOperation.CreateHakemus), any())
  }

  @Test
  @Order(2)
  @WithMockUser(
    value = esittelijaOidString,
    authorities = Array(SecurityConstants.SECURITY_ROOLI_ESITTELIJA_FULL)
  )
  def luoHakemusValidRequestReturns200WithCorrectEsittelijaOid(): Unit = {
    when(userService.getEnrichedUserDetails(any[Boolean]))
      .thenReturn(
        User(userOid = esittelijaOidString, authorities = List(SecurityConstants.SECURITY_ROOLI_ESITTELIJA_FULL))
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
      .haeHakemusLista(Seq(HakemusOid("1.2.246.562.11.00000000000000006665")))
      .headOption
      .getOrElse(fail("Hakemusta ei löytynyt"))
    assert(insertedHakemus.esittelijaOid.get == esittelija.get.esittelijaOid.toString)
    verify(auditLog, times(1)).logCreate(any(), any(), eqTo(AuditOperation.CreateHakemus), any())
  }

  @Test
  @Order(3)
  @WithMockUser(
    value = esittelijaOidString,
    authorities = Array(SecurityConstants.SECURITY_ROOLI_ESITTELIJA_FULL)
  )
  def haeHakemuslistaReturns200AndArrayOfHakemusListItems(): Unit = {
    initAtaruHakemusRequests()
    when(userService.getEnrichedUserDetails(any[Boolean]))
      .thenReturn(
        User(userOid = esittelijaOidString, authorities = List(SecurityConstants.SECURITY_ROOLI_ESITTELIJA_FULL))
      )
    when(ataruHakemusParser.parseTutkinto1MaakoodiUri(any())).thenReturn(Some("maatjavaltiot2_834"))
    when(hakemuspalveluService.haeHakemus(HakemusOid("1.2.246.562.11.00000000000000006667")))
      .thenReturn(Right(loadJson("ataruHakemus6667.json")))

    when(hakemuspalveluService.haeHakemus(HakemusOid("1.2.246.562.11.00000000000000006668")))
      .thenReturn(Right(loadJson("ataruHakemus6668.json")))

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
                                "esittelijaOid" : "1.2.246.562.24.00000000000000006666",
                                "esittelijaKutsumanimi": "Esko",
                                "esittelijaSukunimi": "Esittelijä",
                                "kasittelyVaihe": "AlkukasittelyKesken"
                              } ]"""

    hakemusService.tallennaHakemus(UusiAtaruHakemus(HakemusOid("1.2.246.562.11.00000000000000006667"), 0))
    hakemusService.tallennaHakemus(UusiAtaruHakemus(HakemusOid("1.2.246.562.11.00000000000000006668"), 1))
    mockMvc
      .perform(
        get("/api/hakemuslista")
      )
      .andExpect(status().isOk)
      .andExpect(content().contentType(MediaType.APPLICATION_JSON))
      .andExpect(content().json(expectedResult))
    verify(auditLog, times(1)).logRead(any(), any(), eqTo(AuditOperation.ReadHakemukset), any())
  }

  @Test
  @Order(4)
  @WithMockUser(value = esittelijaOidString, authorities = Array(SecurityConstants.SECURITY_ROOLI_ESITTELIJA_FULL))
  def haeHakemusValidRequestReturns200(): Unit = {
    val virkailijaOid = UserOid("1.2.246.562.24.00000000000000006666")
    val hakemusOid    = HakemusOid("1.2.246.562.11.00000000000000006667")
    val asiakirjaId   = addAsiakirjaStuffToHakemus(virkailijaOid)
    val dbAsiakirja   = hakemusRepository.haeHakemus(hakemusOid).get
    hakemusRepository.paivitaPartialHakemus(
      hakemusOid,
      dbAsiakirja.copy(asiakirjaId = Some(asiakirjaId)),
      virkailijaOid.toString
    )
    initAtaruHakemusRequests()

    val kirjauspvm = ZonedDateTime
      .parse("2025-05-14T10:59:47.597Z", DateTimeFormatter.ofPattern(DATE_TIME_FORMAT))
      .withZoneSameInstant(ZoneId.of("Europe/Helsinki"))
      .toLocalDateTime
    val kirjausPvmStr = kirjauspvm.format(DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSS"))

    val expectedResult = s"""{
                                "hakemusOid": "1.2.246.562.11.00000000000000006667",
                                "hakija": {
                                  "etunimet": "Testi Kolmas",
                                  "kutsumanimi": "Tatu",
                                  "sukunimi": "Hakija",
                                  "kansalaisuus": [{
                                    "fi": "Suomi",
                                    "sv": "Finland",
                                    "en": "Finland"
                                  }],
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
                                "yhteistutkinto": false,
                                "kirjausPvm": "$kirjausPvmStr",
                                "esittelyPvm": null,
                                "paatosPvm": null,
                                "esittelijaOid": 1.2.246.562.24.00000000000000006666,
                                "ataruHakemuksenTila": "KasittelyMaksettu",
                                "kasittelyVaihe": "AlkukasittelyKesken",
                                "muutosHistoria": [],
                                "taydennyspyyntoLahetetty": null,
                                "asiakirja": {
                                  "apHakemus": false,
                                  "suostumusVahvistamiselleSaatu": false,
                                  "pyydettavatAsiakirjat" : [ {
                                    "asiakirjanTyyppi" : "tutkintotodistustenjaljennokset"
                                  }, {
                                    "asiakirjanTyyppi" : "tyotodistukset"
                                  } ],
                                  "asiakirjamallitTutkinnoista" : {
                                    "ece" : {
                                      "lahde" : "ece",
                                      "vastaavuus" : true,
                                      "kuvaus" : "Jotain kuvausta"
                                    },
                                    "aacrao" : {
                                      "lahde" : "aacrao",
                                      "vastaavuus" : false,
                                      "kuvaus" : "Jotain muuta kuvausta"
                                    }
                                  }
                                }
                              }"""

    val result = mockMvc
      .perform(
        get("/api/hakemus/1.2.246.562.11.00000000000000006667")
      )
      .andExpect(status().isOk)
      .andExpect(content().contentType(MediaType.APPLICATION_JSON))
      .andExpect(content().json(expectedResult))
    verify(auditLog, times(1)).logRead(any(), any(), eqTo(AuditOperation.ReadHakemus), any())
  }

  @Test
  @Order(5)
  @WithMockUser(value = esittelijaOidString, authorities = Array(SecurityConstants.SECURITY_ROOLI_ESITTELIJA_FULL))
  def haeHakemuslistaReturns200AndArrayOfHakemusListItemsWithNaytaAndHakemuskoskeeQueryParameters(): Unit = {
    when(userService.getEnrichedUserDetails(any[Boolean]))
      .thenReturn(
        User(userOid = esittelijaOidString, authorities = List(SecurityConstants.SECURITY_ROOLI_ESITTELIJA_FULL))
      )
    when(hakemuspalveluService.haeHakemukset(any[Seq[HakemusOid]]))
      .thenReturn(Right(loadJson("ataruHakemukset.json")))
    when(hakemuspalveluService.haeHakemus(HakemusOid("1.2.246.562.11.00000000000000006668")))
      .thenReturn(Right(loadJson("ataruHakemus6668.json")))

    val hakemus     = hakemusRepository.haeHakemus(HakemusOid("1.2.246.562.11.00000000000000006668")).get
    val asiakirjaId = hakemus.asiakirjaId.get
    val asiakirja   = asiakirjaRepository.haeAsiakirjaTiedot(asiakirjaId).get
    asiakirjaRepository.paivitaAsiakirjaTiedot(
      asiakirja.copy(apHakemus = Some(true)),
      UserOid(esittelijaOidString)
    )

    val expectedResult = s"""[{
                                "asiatunnus" : null,
                                "hakija" : "Testi Neljäs Hakija",
                                "aika" : "2025-05-14T10:59:47.597Z",
                                "hakemusOid" : "1.2.246.562.11.00000000000000006668",
                                "hakemusKoskee" : 1,
                                "apHakemus": true,
                                "esittelijaOid" : "1.2.246.562.24.00000000000000006666",
                                "esittelijaKutsumanimi": "Esko",
                                "esittelijaSukunimi": "Esittelijä",
                                "kasittelyVaihe": "AlkukasittelyKesken",
                                "taydennyspyyntoLahetetty": null
                              } ]"""

    val result = mockMvc
      .perform(
        get("/api/hakemuslista?nayta=omat&hakemuskoskee=4")
      )
      .andExpect(status().isOk)
      .andExpect(content().contentType(MediaType.APPLICATION_JSON))
      .andExpect(content().json(expectedResult))
    verify(auditLog, times(1)).logRead(any(), any(), eqTo(AuditOperation.ReadHakemukset), any())
  }

  @Test
  @Order(6)
  @WithMockUser(value = esittelijaOidString, authorities = Array(SecurityConstants.SECURITY_ROOLI_ESITTELIJA_FULL))
  def haeLiitteidenTiedotReturns200(): Unit = {
    when(userService.getEnrichedUserDetails(any[Boolean]))
      .thenReturn(
        User(userOid = esittelijaOidString, authorities = List(SecurityConstants.SECURITY_ROOLI_ESITTELIJA_FULL))
      )
    when(hakemuspalveluService.haeLiitteidenTiedot(any[HakemusOid], any[Array[String]]))
      .thenReturn(Some("""[]"""))

    val hakemusOid = HakemusOid("1.2.246.562.11.00000000000000006667")

    mockMvc
      .perform(
        get(s"/api/liite/metadata/${hakemusOid.toString}?avaimet=key1,key2")
      )
      .andExpect(status().isOk)
      .andExpect(content().string("[]"))

    verify(auditLog, times(1)).logRead(any(), any(), eqTo(AuditOperation.ReadLiitteenTiedot), any())
  }

  @Test
  @Order(7)
  @WithMockUser(value = esittelijaOidString, authorities = Array(SecurityConstants.SECURITY_ROOLI_ESITTELIJA_FULL))
  def paivitaAsiatunnusReturns204(): Unit = {
    when(userService.getEnrichedUserDetails(any[Boolean]))
      .thenReturn(
        User(userOid = esittelijaOidString, authorities = List(SecurityConstants.SECURITY_ROOLI_ESITTELIJA_FULL))
      )
    initAtaruHakemusRequests()

    val hakemusOid = HakemusOid("1.2.246.562.11.00000000000000006667")

    val requestJson = """{"asiatunnus": "OPH-4321-2025"}"""

    mockMvc
      .perform(
        patch(s"/api/hakemus/${hakemusOid.toString}/asiatunnus")
          .`with`(csrf())
          .contentType(MediaType.APPLICATION_JSON)
          .content(requestJson)
          .header(dummyUserAgent, dummyUserAgentValue)
          .header(xffOriginalHeaderName, xffOriginalHeaderValue)
      )
      .andExpect(status().isNoContent)

    verify(auditLog, times(1)).logChanges(any(), any(), eqTo(AuditOperation.UpdateAsiatunnus), any())

    mockMvc
      .perform(
        get(s"/api/hakemus/${hakemusOid.toString}")
      )
      .andExpect(status().isOk)
      .andExpect(content().contentType(MediaType.APPLICATION_JSON))
      .andExpect(jsonPath("$.asiatunnus", org.hamcrest.Matchers.is("OPH-4321-2025")))
  }

  @Test
  @Order(8)
  @WithMockUser(value = esittelijaOidString, authorities = Array(SecurityConstants.SECURITY_ROOLI_ESITTELIJA_FULL))
  def paivitaAsiatunnusReturns400(): Unit = {
    when(userService.getEnrichedUserDetails(any[Boolean]))
      .thenReturn(
        User(userOid = esittelijaOidString, authorities = List(SecurityConstants.SECURITY_ROOLI_ESITTELIJA_FULL))
      )

    val hakemusOid = HakemusOid("1.2.246.562.11.00000000000000006667")

    val requestJson = """{"asiatunnus": "ei toimi"}"""

    mockMvc
      .perform(
        patch(s"/api/hakemus/${hakemusOid.toString}/asiatunnus")
          .`with`(csrf())
          .contentType(MediaType.APPLICATION_JSON)
          .content(requestJson)
          .header(dummyUserAgent, dummyUserAgentValue)
          .header(xffOriginalHeaderName, xffOriginalHeaderValue)
      )
      .andExpect(status().isBadRequest)
  }
}
