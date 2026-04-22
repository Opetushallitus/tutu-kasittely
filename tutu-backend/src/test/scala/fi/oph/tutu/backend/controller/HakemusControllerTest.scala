package fi.oph.tutu.backend.controller

import fi.oph.tutu.backend.IntegrationTestBase
import fi.oph.tutu.backend.domain.*
import fi.oph.tutu.backend.fixture.createTutkinnotFixture
import fi.oph.tutu.backend.security.SecurityConstants
import fi.oph.tutu.backend.service.*
import fi.oph.tutu.backend.utils.Constants.ATARU_SERVICE
import fi.oph.tutu.backend.utils.{AuditLog, AuditOperation}
import org.junit.jupiter.api.*
import org.junit.jupiter.api.Assertions.{assertEquals, assertTrue}
import org.junit.jupiter.api.MethodOrderer.OrderAnnotation
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
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.*
import org.springframework.test.web.servlet.setup.{DefaultMockMvcBuilder, MockMvcBuilders, MockMvcConfigurer}
import org.springframework.web.context.WebApplicationContext
import org.hamcrest.Matchers.hasItems
import org.hamcrest.CustomMatcher

import java.time.format.DateTimeFormatter
import java.time.{LocalDateTime, ZonedDateTime}
import fi.oph.tutu.backend.utils.Utility.toLocalDateTime

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
  var userService: UserService = _

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

    esittelija = esittelijaRepository.insertEsittelija(UserOid(esittelijaOidString), "testi", "Esko", "Esittelijä")
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
            yhteystiedotRyhma = Seq(),
            yksiloityVTJ = false
          )
        )
      )
  }

  @Test
  @WithMockUser(
    value = HakemusControllerTestConstants.ESITTELIJA_OID,
    authorities = Array(SecurityConstants.SECURITY_ROOLI_CRUD_FULL)
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
    authorities = Array(SecurityConstants.SECURITY_ROOLI_CRUD_FULL)
  )
  def paivitaHakemusMalformedJsonReturns400(): Unit = {
    when(userService.getEnrichedUserDetails(any[Boolean]))
      .thenReturn(
        User(
          userOid = HakemusControllerTestConstants.ESITTELIJA_OID,
          authorities = List(SecurityConstants.SECURITY_ROOLI_CRUD_FULL)
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
    authorities = Array(SecurityConstants.SECURITY_ROOLI_CRUD_FULL)
  )
  def haeHakemuslistaReturns200AndArrayOfHakemusListItems(): Unit = {
    initAtaruHakemusRequests()
    when(userService.getEnrichedUserDetails(any[Boolean]))
      .thenReturn(
        User(userOid = esittelijaOidString, authorities = List(SecurityConstants.SECURITY_ROOLI_CRUD_FULL))
      )
    when(ataruHakemusParser.parseTutkinto1MaakoodiUri(any())).thenReturn(Some("maatjavaltiot2_834"))

    // Ylikirjoita eri hakijat
    when(hakemuspalveluService.haeHakemus(eqTo(HakemusOid("1.2.246.562.11.00000000000000006665"))))
      .thenReturn(Right(loadJson("ataruHakemus6665.json")))
    when(hakemuspalveluService.haeHakemus(eqTo(HakemusOid("1.2.246.562.11.00000000000000006666"))))
      .thenReturn(Right(loadJson("ataruHakemus6666.json")))
    when(hakemuspalveluService.haeHakemus(eqTo(HakemusOid("1.2.246.562.11.00000000000000006668"))))
      .thenReturn(Right(loadJson("ataruHakemus6668.json")))

    val saapumisPvmStr     = "2025-05-14T10:59:47.597Z"
    val saapumisPvmStr6665 = "2025-05-14T11:06:38.273Z"
    val expectedResult     = s"""{"items": [{
                                "asiatunnus" : null,
                                "hakija" : "Testi Neljäs Hakija",
                                "saapumisPvm" : "$saapumisPvmStr",
                                "hakemusOid" : "1.2.246.562.11.00000000000000006668",
                                "hakemusKoskee" : 0,
                                "esittelijaOid" : "1.2.246.562.24.00000000000000006666",
                                "esittelijaKutsumanimi": "Esko",
                                "esittelijaSukunimi": "Esittelijä",
                                "kasittelyVaihe": "AlkukasittelyKesken"
                              }, {
                                "asiatunnus" : null,
                                "hakija" : "Testi Hakija",
                                "saapumisPvm" : "$saapumisPvmStr6665",
                                "hakemusOid" : "1.2.246.562.11.00000000000000006665",
                                "hakemusKoskee" : 0,
                                "esittelijaOid" : "1.2.246.562.24.00000000000000006666",
                                "esittelijaKutsumanimi": "Esko",
                                "esittelijaSukunimi": "Esittelijä",
                                "kasittelyVaihe": "AlkukasittelyKesken"
                              }, {
                                "asiatunnus" : null,
                                "hakija" : "Testi Toka Hakija",
                                "saapumisPvm" : "$saapumisPvmStr",
                                "hakemusOid" : "1.2.246.562.11.00000000000000006666",
                                "hakemusKoskee" : 1,
                                "esittelijaOid" : "1.2.246.562.24.00000000000000006666",
                                "esittelijaKutsumanimi": "Esko",
                                "esittelijaSukunimi": "Esittelijä",
                                "kasittelyVaihe": "AlkukasittelyKesken"
                              }, {
                                "asiatunnus" : null,
                                "hakija" : "Testi Kolmas Hakija",
                                "saapumisPvm" : "$saapumisPvmStr",
                                "hakemusOid" : "1.2.246.562.11.00000000000000006667",
                                "hakemusKoskee" : 1,
                                "esittelijaOid" : "1.2.246.562.24.00000000000000006666",
                                "esittelijaKutsumanimi": "Esko",
                                "esittelijaSukunimi": "Esittelijä",
                                "kasittelyVaihe": "AlkukasittelyKesken"
                              }], "totalCount": 4, "page": 1, "pageSize": 20, "totalPages": 1}"""

    when(ataruHakemusParser.onkoApHakemus(any()))
      .thenReturn(None)
      .thenReturn(Some(false))
      .thenReturn(Some(false))
      .thenReturn(None)
    hakemusService.tallennaAtaruHakemus(UusiAtaruHakemus(HakemusOid("1.2.246.562.11.00000000000000006665"), 0))
    hakemusService.tallennaAtaruHakemus(UusiAtaruHakemus(HakemusOid("1.2.246.562.11.00000000000000006666"), 1))
    hakemusService.tallennaAtaruHakemus(UusiAtaruHakemus(HakemusOid("1.2.246.562.11.00000000000000006667"), 1))
    hakemusService.tallennaAtaruHakemus(UusiAtaruHakemus(HakemusOid("1.2.246.562.11.00000000000000006668"), 0))
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
  @Order(2)
  @WithMockUser(value = esittelijaOidString, authorities = Array(SecurityConstants.SECURITY_ROOLI_CRUD_FULL))
  def haeHakemusValidRequestReturns200(): Unit = {
    val virkailijaOid = UserOid("1.2.246.562.24.00000000000000006666")
    val hakemusOid    = HakemusOid("1.2.246.562.11.00000000000000006667")
    val asiakirjaId   = addAsiakirjaStuffToHakemus(virkailijaOid)
    val dbHakemus     = hakemusRepository.haeHakemus(hakemusOid).get
    hakemusRepository.paivitaHakemus(
      hakemusOid,
      dbHakemus.copy(asiakirjaId = Some(asiakirjaId)),
      virkailijaOid.toString
    )
    initAtaruHakemusRequests()

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
                                "saapumisPvm": "2025-05-14T10:59:47.597Z",
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
                                },
                                "liitteidenTilat" : [ {
                                  "attachment" : "88d627a1-47d9-4bb2-aad2-16384a900352",
                                  "state" : "checked",
                                  "hakukohde" : "form",
                                  "updateTime" : "2025-12-17T09:30:00.000Z"
                                }, {
                                  "attachment" : "063912dd-2e57-4e69-a42c-35ff73d8953d",
                                  "state" : "not-checked",
                                  "hakukohde" : "form",
                                  "updateTime" : null
                                } ]
                              }"""

    mockMvc
      .perform(
        get("/api/hakemus/1.2.246.562.11.00000000000000006667")
      )
      .andExpect(status().isOk)
      .andExpect(content().contentType(MediaType.APPLICATION_JSON))
      .andExpect(content().json(expectedResult))

    verify(auditLog, times(1)).logRead(any(), any(), eqTo(AuditOperation.ReadHakemus), any())
  }

  @Test
  @Order(3)
  @WithMockUser(value = esittelijaOidString, authorities = Array(SecurityConstants.SECURITY_ROOLI_CRUD_FULL))
  def haeHakemuslistaReturns200AndArrayOfHakemusListItemsWithNaytaAndHakemuskoskeeQueryParameters(): Unit = {
    when(userService.getEnrichedUserDetails(any[Boolean]))
      .thenReturn(
        User(userOid = esittelijaOidString, authorities = List(SecurityConstants.SECURITY_ROOLI_CRUD_FULL))
      )
    val hakemus     = hakemusRepository.haeHakemus(HakemusOid("1.2.246.562.11.00000000000000006667")).get
    val asiakirjaId = hakemus.asiakirjaId.get
    val asiakirja   = asiakirjaRepository.haeAsiakirjaTiedot(asiakirjaId).get
    asiakirjaRepository.paivitaAsiakirjaTiedot(
      asiakirjaId,
      new Asiakirja(asiakirja.copy(apHakemus = Some(true)), Seq.empty, Map.empty),
      UserOid(esittelijaOidString)
    )

    val expectedResult = s"""{"items": [{
                                "asiatunnus" : null,
                                "hakija" : "Testi Kolmas Hakija",
                                "saapumisPvm" : "2025-05-14T10:59:47.597Z",
                                "hakemusOid" : "1.2.246.562.11.00000000000000006667",
                                "hakemusKoskee" : 1,
                                "apHakemus": true,
                                "esittelijaOid" : "1.2.246.562.24.00000000000000006666",
                                "esittelijaKutsumanimi": "Esko",
                                "esittelijaSukunimi": "Esittelijä",
                                "kasittelyVaihe": "AlkukasittelyKesken",
                                "taydennyspyyntoLahetetty": null
                              }], "totalCount": 1, "page": 1, "pageSize": 20, "totalPages": 1}"""

    mockMvc
      .perform(
        get("/api/hakemuslista?nayta=omat&hakemuskoskee=4")
      )
      .andExpect(status().isOk)
      .andExpect(content().contentType(MediaType.APPLICATION_JSON))
      .andExpect(content().json(expectedResult))
    verify(auditLog, times(1)).logRead(any(), any(), eqTo(AuditOperation.ReadHakemukset), any())
  }

  @Test
  @Order(4)
  @WithMockUser(value = esittelijaOidString, authorities = Array(SecurityConstants.SECURITY_ROOLI_CRUD_FULL))
  def haeLiitteidenTiedotReturns200(): Unit = {
    when(userService.getEnrichedUserDetails(any[Boolean]))
      .thenReturn(
        User(userOid = esittelijaOidString, authorities = List(SecurityConstants.SECURITY_ROOLI_CRUD_FULL))
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
  @Order(6)
  @WithMockUser(
    value = HakemusControllerTestConstants.ESITTELIJA_OID,
    authorities = Array(SecurityConstants.SECURITY_ROOLI_CRUD_FULL)
  )
  def paivitaHakemusTimestampWithMillisReturns200(): Unit = {
    when(userService.getEnrichedUserDetails(any[Boolean]))
      .thenReturn(
        User(
          userOid = HakemusControllerTestConstants.ESITTELIJA_OID,
          authorities = List(SecurityConstants.SECURITY_ROOLI_CRUD_FULL)
        )
      )
    initAtaruHakemusRequests("ataruHakemus6666.json")
    when(ataruHakemusParser.parseHakemusKoskee(any[AtaruHakemus])).thenReturn(0)

    val hakemusOid = HakemusOid("1.2.246.562.11.00000000000000006668")

    // Testataan että frontend toISOString()-muoto deserialisoidaan oikein.
    // Asiakirja on pakollinen.
    val requestJson =
      s"""{"peruutusPvm": "2026-04-01T21:00:00.000Z", "onkoPeruutettu": true,
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
          }}"""

    mockMvc
      .perform(
        put(s"/api/hakemus/$hakemusOid")
          .`with`(csrf())
          .contentType(MediaType.APPLICATION_JSON)
          .content(requestJson)
      )
      .andExpect(status().isOk)
      .andExpect(jsonPath("$.peruutusPvm").value("2026-04-01T21:00:00.000Z"))
  }

  @Test
  @Order(7)
  @WithMockUser(value = esittelijaOidString, authorities = Array(SecurityConstants.SECURITY_ROOLI_CRUD_FULL))
  def paivitaAsiatunnusReturns204(): Unit = {
    when(userService.getEnrichedUserDetails(any[Boolean]))
      .thenReturn(
        User(userOid = esittelijaOidString, authorities = List(SecurityConstants.SECURITY_ROOLI_CRUD_FULL))
      )
    initAtaruHakemusRequests()
    when(ataruHakemusParser.parseTutkinto1MaakoodiUri(any())).thenReturn(Some("maatjavaltiot2_834"))

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
      .andExpect(jsonPath("$.asiatunnus").value("OPH-4321-2025"))
  }

  @Test
  @Order(5)
  @WithMockUser(value = esittelijaOidString, authorities = Array(SecurityConstants.SECURITY_ROOLI_CRUD_FULL))
  def paivitaAsiatunnusReturns400(): Unit = {
    when(userService.getEnrichedUserDetails(any[Boolean]))
      .thenReturn(
        User(userOid = esittelijaOidString, authorities = List(SecurityConstants.SECURITY_ROOLI_CRUD_FULL))
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

  @Test
  @Order(6)
  @WithMockUser(value = esittelijaOidString, authorities = Array(SecurityConstants.SECURITY_ROOLI_CRUD_FULL))
  def paivitaHakemuksenTiedotAtarustaReturns200(): Unit = {
    when(userService.getEnrichedUserDetails(any[Boolean]))
      .thenReturn(
        User(userOid = esittelijaOidString, authorities = List(SecurityConstants.SECURITY_ROOLI_CRUD_FULL))
      )

    val hakemusOid = HakemusOid("1.2.246.562.11.00000000000000006667")

    val dbHakemus = hakemusRepository.haeHakemus(hakemusOid).get
    hakemusRepository.paivitaHakemus(
      hakemusOid,
      dbHakemus.copy(
        kasittelyVaihe = KasittelyVaihe.OdottaaTaydennysta,
        viimeisinTaydennyspyyntoPvm = Some(LocalDateTime.parse("2026-01-01T18:30:45.597"))
      ),
      "1.2.246.562.24.00000000000000006666"
    )

    initAtaruHakemusRequests("ataruHakemus6667_modified.json")
    when(ataruHakemusParser.parseHakemusKoskee(any[AtaruHakemus])).thenReturn(2)
    when(ataruHakemusParser.onkoHakemusPeruutettu(any[AtaruHakemus])).thenReturn(true)

    mockMvc
      .perform(
        get("/api/hakemus-update-notification/1.2.246.562.11.00000000000000006667")
      )
      .andExpect(status().isOk)

    val paivitettyHakemus = hakemusRepository.haeHakemus(hakemusOid).get
    assertEquals(2, paivitettyHakemus.hakemusKoskee)
    assertEquals(KasittelyVaihe.HakemustaTaydennetty, paivitettyHakemus.kasittelyVaihe)
    assertTrue(paivitettyHakemus.onkoPeruutettu)
    assertEquals(toLocalDateTime("2026-01-30T10:59:47.597Z"), paivitettyHakemus.peruutusPvm.get)
    assertEquals(Ratkaisutyyppi.PeruutusTaiRaukeaminen, paatosRepository.haePaatos(dbHakemus.id).get.ratkaisutyyppi.get)

    val tutkinnotFixture    = createTutkinnotFixture(dbHakemus.id)
    val paivitetytTutkinnot = tutkintoRepository.haeTutkinnotHakemusOidilla(hakemusOid)
    assertEquals(paivitetytTutkinnot.length, tutkinnotFixture.length)
    paivitetytTutkinnot.foreach(t =>
      assertEquals(ATARU_SERVICE, t.muokkaaja.get)
      assertEquals(
        tutkinnotFixture.find(ft => ft.jarjestys == t.jarjestys).get,
        t.copy(id = None, muokkaaja = None, muokattu = None)
      )
    )

    // Kentät siirretty hakemukseen: tarkistetaan oikeat tyypit ja arvot
    assertEquals(toLocalDateTime("2026-01-30T10:59:47.597Z"), paivitettyHakemus.ataruHakemusMuokattu.get)
    assertEquals(toLocalDateTime("2025-05-14T10:59:47.597Z"), paivitettyHakemus.saapumisPvm.get)
    assertEquals("Testi Kolmas", paivitettyHakemus.hakijaEtunimet.get)
    assertEquals("Hakija", paivitettyHakemus.hakijaSukunimi.get)
    // Ei päivity
    assertEquals(LocalDateTime.parse("2026-01-01T18:30:45.597"), paivitettyHakemus.viimeisinTaydennyspyyntoPvm.get)
  }

  @Test
  @Order(7)
  @WithMockUser(value = esittelijaOidString, authorities = Array(SecurityConstants.SECURITY_ROOLI_CRUD_FULL))
  def paivitaHakemuksenTilaAtarustaReturns200(): Unit = {
    when(userService.getEnrichedUserDetails(any[Boolean]))
      .thenReturn(
        User(userOid = esittelijaOidString, authorities = List(SecurityConstants.SECURITY_ROOLI_CRUD_FULL))
      )

    val hakemusOid = HakemusOid("1.2.246.562.11.00000000000000006667")
    initAtaruHakemusRequests("ataruHakemus6666.json")
    when(ataruHakemusParser.parseHakemusKoskee(any[AtaruHakemus])).thenReturn(0)

    mockMvc
      .perform(
        get("/api/state-change-notification/1.2.246.562.11.00000000000000006667/information-request")
      )
      .andExpect(status().isOk)

    val paivitettyHakemus = hakemusRepository.haeHakemus(hakemusOid)
    assertEquals(KasittelyVaihe.OdottaaTaydennysta, paivitettyHakemus.get.kasittelyVaihe)
  }

  @Test
  @Order(8)
  @WithMockUser(value = esittelijaOidString, authorities = Array(SecurityConstants.SECURITY_ROOLI_CRUD_FULL))
  def paivitaHakemuksenTilaAtarustaPalauttaa400JosTilatietoVirheellinen(): Unit = {
    when(userService.getEnrichedUserDetails(any[Boolean]))
      .thenReturn(
        User(userOid = esittelijaOidString, authorities = List(SecurityConstants.SECURITY_ROOLI_CRUD_FULL))
      )

    mockMvc
      .perform(
        get("/api/state-change-notification/1.2.246.562.11.00000000000000006667/virheellinen")
      )
      .andExpect(status().isBadRequest)
  }

  @Test
  @Order(9)
  @WithMockUser(value = esittelijaOidString, authorities = Array(SecurityConstants.SECURITY_ROOLI_CRUD_FULL))
  def haeHakemuslistaHakemusKoskee1And4ReturnsOnly1AndAp(): Unit = {
    when(userService.getEnrichedUserDetails(any[Boolean]))
      .thenReturn(
        User(userOid = esittelijaOidString, authorities = List(SecurityConstants.SECURITY_ROOLI_CRUD_FULL))
      )

    // Ensure there's an AP flag set for one of the hakemukset
    val hakemus     = hakemusRepository.haeHakemus(HakemusOid("1.2.246.562.11.00000000000000006667")).get
    val asiakirjaId = hakemus.asiakirjaId.get
    val asiakirja   = asiakirjaRepository.haeAsiakirjaTiedot(asiakirjaId).get
    asiakirjaRepository.paivitaAsiakirjaTiedot(
      asiakirjaId,
      new Asiakirja(asiakirja.copy(apHakemus = Some(true)), Seq.empty, Map.empty),
      UserOid(esittelijaOidString)
    )

    mockMvc
      .perform(
        get("/api/hakemuslista?hakemuskoskee=1&hakemuskoskee=4")
      )
      .andExpect(status().isOk)
      .andExpect(content().contentType(MediaType.APPLICATION_JSON))
      .andExpect(jsonPath("$.items.length()").value(2))
      .andExpect(jsonPath("$.totalCount").value(2))
      .andExpect(
        jsonPath("$.items[*].hakemusOid").value(
          hasItems(
            "1.2.246.562.11.00000000000000006666",
            "1.2.246.562.11.00000000000000006667"
          )
        )
      )
      .andExpect(jsonPath("$.items[*].hakemusKoskee").value(hasItems(1, 1)))
      .andExpect(jsonPath("$.items[*].apHakemus").value(hasItems(true, false)))

    verify(auditLog, times(1)).logRead(any(), any(), eqTo(AuditOperation.ReadHakemukset), any())
  }

  @Test
  @Order(10)
  @WithMockUser(value = esittelijaOidString, authorities = Array(SecurityConstants.SECURITY_ROOLI_CRUD_FULL))
  def haeHakemuslistaHakuMatchesNameAndAsiatunnus(): Unit = {
    when(userService.getEnrichedUserDetails(any[Boolean]))
      .thenReturn(
        User(userOid = esittelijaOidString, authorities = List(SecurityConstants.SECURITY_ROOLI_CRUD_FULL))
      )

    // Name hit: "Testi Kolmas Hakija" contains "Kolmas"
    mockMvc
      .perform(get("/api/hakemuslista?haku=Kolmas"))
      .andExpect(status().isOk)
      .andExpect(jsonPath("$.totalCount").value(1))
      .andExpect(jsonPath("$.items[0].hakemusOid").value("1.2.246.562.11.00000000000000006667"))

    // Asiatunnus hit: set to "OPH-4321-2025" for hakemus 6667 in Order 7
    mockMvc
      .perform(get("/api/hakemuslista?haku=OPH-4321"))
      .andExpect(status().isOk)
      .andExpect(jsonPath("$.totalCount").value(1))
      .andExpect(jsonPath("$.items[0].hakemusOid").value("1.2.246.562.11.00000000000000006667"))

    // No match
    mockMvc
      .perform(get("/api/hakemuslista?haku=EiLöydyMitään"))
      .andExpect(status().isOk)
      .andExpect(jsonPath("$.totalCount").value(0))
  }

  @Test
  @Order(11)
  @WithMockUser(value = esittelijaOidString, authorities = Array(SecurityConstants.SECURITY_ROOLI_CRUD_FULL))
  def paivitaEsittelyPvmWithDateReturns204(): Unit = {
    when(userService.getEnrichedUserDetails(any[Boolean]))
      .thenReturn(
        User(userOid = esittelijaOidString, authorities = List(SecurityConstants.SECURITY_ROOLI_CRUD_FULL))
      )
    initAtaruHakemusRequests()
    when(ataruHakemusParser.parseTutkinto1MaakoodiUri(any())).thenReturn(Some("maatjavaltiot2_834"))

    val hakemusOid = HakemusOid("1.2.246.562.11.00000000000000006667")

    val requestJson = """{"esittelyPvm": "2026-04-02T11:34:23.602Z"}"""

    mockMvc
      .perform(
        patch(s"/api/hakemus/${hakemusOid.toString}/esittelypvm")
          .`with`(csrf())
          .contentType(MediaType.APPLICATION_JSON)
          .content(requestJson)
          .header(dummyUserAgent, dummyUserAgentValue)
          .header(xffOriginalHeaderName, xffOriginalHeaderValue)
      )
      .andExpect(status().isNoContent)

    verify(auditLog, times(1)).logChanges(any(), any(), eqTo(AuditOperation.UpdateEsittelyPvm), any())

    mockMvc
      .perform(
        get(s"/api/hakemus/${hakemusOid.toString}")
      )
      .andExpect(status().isOk)
      .andExpect(content().contentType(MediaType.APPLICATION_JSON))
      .andExpect(jsonPath("$.esittelyPvm").value("2026-04-02T11:34:23.602Z"))
  }

  @Test
  @Order(12)
  @WithMockUser(value = esittelijaOidString, authorities = Array(SecurityConstants.SECURITY_ROOLI_CRUD_FULL))
  def paivitaEsittelyPvmWithoutDateReturns204(): Unit = {
    def isToday(dateString: String): Boolean = {
      val nowDate  = LocalDateTime.now.toLocalDate
      val testDate = toLocalDateTime(dateString).toLocalDate
      nowDate.isEqual(testDate)
    }

    when(userService.getEnrichedUserDetails(any[Boolean]))
      .thenReturn(
        User(userOid = esittelijaOidString, authorities = List(SecurityConstants.SECURITY_ROOLI_CRUD_FULL))
      )
    initAtaruHakemusRequests()
    when(ataruHakemusParser.parseTutkinto1MaakoodiUri(any())).thenReturn(Some("maatjavaltiot2_834"))

    val hakemusOid = HakemusOid("1.2.246.562.11.00000000000000006667")

    val requestJson = """{}"""

    mockMvc
      .perform(
        patch(s"/api/hakemus/${hakemusOid.toString}/esittelypvm")
          .`with`(csrf())
          .contentType(MediaType.APPLICATION_JSON)
          .content(requestJson)
          .header(dummyUserAgent, dummyUserAgentValue)
          .header(xffOriginalHeaderName, xffOriginalHeaderValue)
      )
      .andExpect(status().isNoContent)

    verify(auditLog, times(1)).logChanges(any(), any(), eqTo(AuditOperation.UpdateEsittelyPvm), any())

    mockMvc
      .perform(
        get(s"/api/hakemus/${hakemusOid.toString}")
      )
      .andExpect(status().isOk)
      .andExpect(content().contentType(MediaType.APPLICATION_JSON))
      .andExpect(jsonPath("$.esittelyPvm").value(new CustomMatcher("Datestring represents today") {
        def matches(item: Object): Boolean = {
          val dateString = item.asInstanceOf[String]
          isToday(dateString)
        }
      }))
  }

  @Test
  @Order(13)
  @WithMockUser(value = esittelijaOidString, authorities = Array(SecurityConstants.SECURITY_ROOLI_CRUD_FULL))
  def haeHakemuksetHaullaLoytyy(): Unit = {
    // "Testi Toka Hakija"
    mockMvc
      .perform(get("/api/hakemus/haku?haku=Toka"))
      .andExpect(status().isOk)
      .andExpect(jsonPath("$.totalCount").value(1))
      .andExpect(jsonPath("$.items[0].hakemusOid").value("1.2.246.562.11.00000000000000006666"))

    verify(auditLog, times(1)).logRead(any(), any(), eqTo(AuditOperation.ReadHakemukset), any())

    mockMvc
      .perform(get("/api/hakemus/haku?haku=Testi Toka"))
      .andExpect(status().isOk)
      .andExpect(jsonPath("$.totalCount").value(1))
      .andExpect(jsonPath("$.items[0].hakemusOid").value("1.2.246.562.11.00000000000000006666"))
  }

  @Test
  @Order(14)
  @WithMockUser(value = esittelijaOidString, authorities = Array(SecurityConstants.SECURITY_ROOLI_CRUD_FULL))
  def haeHakemuksetHaullaTyhjaHakuPalauttaaTyhjanTuloksen(): Unit = {
    mockMvc
      .perform(get("/api/hakemus/haku?haku="))
      .andExpect(status().isOk)
      .andExpect(jsonPath("$.totalCount").value(0))
      .andExpect(jsonPath("$.items.length()").value(0))
  }

  @Test
  @Order(15)
  @WithMockUser(value = esittelijaOidString, authorities = Array(SecurityConstants.SECURITY_ROOLI_CRUD_FULL))
  def haeHakemuksetHaullaNakymaMaaritteleeHakualueen(): Unit = {
    mockMvc
      .perform(get("/api/hakemus/haku?haku=Toka&nakyma=perustiedot"))
      .andExpect(status().isOk)
      .andExpect(jsonPath("$.totalCount").value(1))
      .andExpect(jsonPath("$.items[0].hakemusOid").value("1.2.246.562.11.00000000000000006666"))

    mockMvc
      .perform(get("/api/hakemus/haku?haku=Toka&nakyma=tutkinnot"))
      .andExpect(status().isOk)
      .andExpect(jsonPath("$.totalCount").value(0))
  }
}
