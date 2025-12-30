package fi.oph.tutu.backend.controller

import fi.oph.tutu.backend.IntegrationTestBase
import fi.oph.tutu.backend.domain.*
import fi.oph.tutu.backend.domain.KasittelyVaihe.{
  AlkukasittelyKesken,
  HyvaksyttyEiLahetetty,
  OdottaaTaydennysta,
  OdottaaVahvistusta,
  ValmisKasiteltavaksi
}
import fi.oph.tutu.backend.fixture.{
  createTutkinnotFixtureAfterMuuttuneetTutkinnot,
  createTutkinnotFixtureBeforeMuuttuneetTutkinnot,
  hakijaFixture
}
import fi.oph.tutu.backend.security.SecurityConstants
import fi.oph.tutu.backend.service.*
import fi.oph.tutu.backend.utils.Constants.{DATE_TIME_FORMAT, TUTU_SERVICE}
import fi.oph.tutu.backend.utils.{AuditLog, AuditOperation}
import org.junit.jupiter.api.*
import org.junit.jupiter.api.Assertions.assertEquals
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

import java.time.format.DateTimeFormatter
import java.time.{ZoneId, ZonedDateTime}
import java.util.UUID

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

  private def tallennaHakemus(hakemusOid: String, hakemusKoskee: Int): Unit = {
    hakemusService.tallennaAtaruHakemus(
      UusiAtaruHakemus(HakemusOid(hakemusOid), hakemusKoskee)
    )
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
        User(
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
  def haeHakemuslistaReturns200AndArrayOfHakemusListItems(): Unit = {
    initAtaruHakemusRequests()
    when(userService.getEnrichedUserDetails(any[Boolean]))
      .thenReturn(
        User(userOid = esittelijaOidString, authorities = List(SecurityConstants.SECURITY_ROOLI_ESITTELIJA_FULL))
      )
    when(ataruHakemusParser.parseTutkinto1MaakoodiUri(any())).thenReturn(Some("maatjavaltiot2_834"))

    when(hakemuspalveluService.haeHakemukset(any[Seq[HakemusOid]]))
      .thenReturn(Right(loadJson("ataruHakemukset.json")))
    val expectedResult = s"""[{
                                "asiatunnus" : null,
                                "hakija" : "Testi Neljäs Hakija",
                                "aika" : "2025-05-14T10:59:47.597Z",
                                "hakemusOid" : "1.2.246.562.11.00000000000000006668",
                                "hakemusKoskee" : 0,
                                "esittelijaOid" : "1.2.246.562.24.00000000000000006666",
                                "esittelijaKutsumanimi": "Esko",
                                "esittelijaSukunimi": "Esittelijä",
                                "kasittelyVaihe": "AlkukasittelyKesken"
                              }, {
                                "asiatunnus" : null,
                                "hakija" : "Testi Hakija",
                                "aika" : "2025-05-14T11:06:38.273Z",
                                "hakemusOid" : "1.2.246.562.11.00000000000000006665",
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
                                "kasittelyVaihe": "OdottaaTaydennysta"
                              }, {
                                "asiatunnus" : null,
                                "hakija" : "Testi Kolmas Hakija",
                                "aika" : "2025-05-14T10:59:47.597Z",
                                "hakemusOid" : "1.2.246.562.11.00000000000000006667",
                                "hakemusKoskee" : 1,
                                "esittelijaOid" : "1.2.246.562.24.00000000000000006666",
                                "esittelijaKutsumanimi": "Esko",
                                "esittelijaSukunimi": "Esittelijä",
                                "kasittelyVaihe": "AlkukasittelyKesken"
                              } ]"""

    hakemusService.tallennaAtaruHakemus(UusiAtaruHakemus(HakemusOid("1.2.246.562.11.00000000000000006665"), 0))
    hakemusService.tallennaAtaruHakemus(UusiAtaruHakemus(HakemusOid("1.2.246.562.11.00000000000000006666"), 1))
    hakemusService.tallennaAtaruHakemus(UusiAtaruHakemus(HakemusOid("1.2.246.562.11.00000000000000006667"), 0))
    hakemusService.tallennaAtaruHakemus(UusiAtaruHakemus(HakemusOid("1.2.246.562.11.00000000000000006668"), 1))
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
  @WithMockUser(value = esittelijaOidString, authorities = Array(SecurityConstants.SECURITY_ROOLI_ESITTELIJA_FULL))
  def haeHakemusValidRequestReturns200(): Unit = {
    val virkailijaOid = UserOid("1.2.246.562.24.00000000000000006666")
    val hakemusOid    = HakemusOid("1.2.246.562.11.00000000000000006667")
    val asiakirjaId   = addAsiakirjaStuffToHakemus(virkailijaOid)
    val dbAsiakirja   = hakemusRepository.haeHakemus(hakemusOid).get
    hakemusRepository.paivitaHakemus(
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
                                },
                                "liitteidenTilat" : [ {
                                  "attachment" : "88d627a1-47d9-4bb2-aad2-16384a900352",
                                  "state" : "checked",
                                  "hakukohde" : "form",
                                  "updateTime" : "2025-12-17T09:30:00"
                                }, {
                                  "attachment" : "063912dd-2e57-4e69-a42c-35ff73d8953d",
                                  "state" : "not-checked",
                                  "hakukohde" : "form",
                                  "updateTime" : null
                                } ]
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
  @Order(3)
  @WithMockUser(value = esittelijaOidString, authorities = Array(SecurityConstants.SECURITY_ROOLI_ESITTELIJA_FULL))
  def haeHakemusUpdatesDataAsNeeded(): Unit = {
    hakemusRepository.suoritaPaivitaVaiheJaHakemusKoskee(
      HakemusOid("1.2.246.562.11.00000000000000006666"),
      ValmisKasiteltavaksi,
      3,
      TUTU_SERVICE
    )
    val virkailijaOid = UserOid("1.2.246.562.24.00000000000000006666")
    val hakemusOid    = HakemusOid("1.2.246.562.11.00000000000000006666")
    initAtaruHakemusRequests("ataruHakemus6666.json")

    val expectedResult = s"""{
                                "hakemusOid": "1.2.246.562.11.00000000000000006666",
                                "ataruHakemuksenTila": "TaydennysPyynto",
                                "kasittelyVaihe": "OdottaaTaydennysta",
                                "hakemusKoskee": 0,
                                "taydennyspyyntoLahetetty": "2025-07-21T14:06:38.273"
                              }"""

    val result = mockMvc
      .perform(
        get("/api/hakemus/1.2.246.562.11.00000000000000006666")
      )
      .andExpect(status().isOk)
      .andExpect(content().contentType(MediaType.APPLICATION_JSON))
      .andExpect(content().json(expectedResult))

    verify(auditLog, times(1)).logRead(any(), any(), eqTo(AuditOperation.ReadHakemus), any())
    val hakemus = hakemusRepository.haeHakemus(hakemusOid).get
    assertEquals(OdottaaTaydennysta, hakemus.kasittelyVaihe)
    assertEquals(0, hakemus.hakemusKoskee)
  }

  @Test
  @Order(4)
  @WithMockUser(value = esittelijaOidString, authorities = Array(SecurityConstants.SECURITY_ROOLI_ESITTELIJA_FULL))
  def haeHakemuslistaReturns200AndArrayOfHakemusListItemsWithNaytaAndHakemuskoskeeQueryParameters(): Unit = {
    when(userService.getEnrichedUserDetails(any[Boolean]))
      .thenReturn(
        User(userOid = esittelijaOidString, authorities = List(SecurityConstants.SECURITY_ROOLI_ESITTELIJA_FULL))
      )
    when(hakemuspalveluService.haeHakemukset(any[Seq[HakemusOid]]))
      .thenReturn(Right(loadJson("ataruHakemukset.json")))
    when(ataruHakemusParser.parseHakemusKoskee(any[AtaruHakemus])).thenReturn(1)
    val hakemus     = hakemusRepository.haeHakemus(HakemusOid("1.2.246.562.11.00000000000000006667")).get
    val asiakirjaId = hakemus.asiakirjaId.get
    val asiakirja   = asiakirjaRepository.haeAsiakirjaTiedot(asiakirjaId).get
    asiakirjaRepository.paivitaAsiakirjaTiedot(
      asiakirja.copy(apHakemus = Some(true)),
      UserOid(esittelijaOidString)
    )

    val expectedResult = s"""[{
                                "asiatunnus" : null,
                                "hakija" : "Testi Kolmas Hakija",
                                "aika" : "2025-05-14T10:59:47.597Z",
                                "hakemusOid" : "1.2.246.562.11.00000000000000006667",
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
  @Order(5)
  @WithMockUser(value = esittelijaOidString, authorities = Array(SecurityConstants.SECURITY_ROOLI_ESITTELIJA_FULL))
  def haeHakemuslistaReturns200AndExpectedHakemusListItemsWhenHakemuksetUpdatedWithinQuery(): Unit = {
    when(userService.getEnrichedUserDetails(any[Boolean]))
      .thenReturn(
        User(userOid = esittelijaOidString, authorities = List(SecurityConstants.SECURITY_ROOLI_ESITTELIJA_FULL))
      )
    hakemusRepository.suoritaPaivitaVaiheJaHakemusKoskee(
      HakemusOid("1.2.246.562.11.00000000000000006665"),
      HyvaksyttyEiLahetetty,
      3,
      TUTU_SERVICE
    )
    hakemusRepository.suoritaPaivitaVaiheJaHakemusKoskee(
      HakemusOid("1.2.246.562.11.00000000000000006666"),
      ValmisKasiteltavaksi,
      3,
      TUTU_SERVICE
    )
    hakemusRepository.suoritaPaivitaVaiheJaHakemusKoskee(
      HakemusOid("1.2.246.562.11.00000000000000006667"),
      AlkukasittelyKesken,
      3,
      TUTU_SERVICE
    )
    hakemusRepository.suoritaPaivitaVaiheJaHakemusKoskee(
      HakemusOid("1.2.246.562.11.00000000000000006668"),
      OdottaaVahvistusta,
      3,
      TUTU_SERVICE
    )
    when(hakemuspalveluService.haeHakemukset(any[Seq[HakemusOid]]))
      .thenReturn(Right(loadJson("ataruHakemukset.json")))
    when(ataruHakemusParser.parseHakemusKoskee(any[AtaruHakemus])).thenReturn(1)
    var hakemus     = hakemusRepository.haeHakemus(HakemusOid("1.2.246.562.11.00000000000000006666")).get
    val asiakirjaId = hakemus.asiakirjaId.get
    val asiakirja   = asiakirjaRepository.haeAsiakirjaTiedot(asiakirjaId).get
    asiakirjaRepository.paivitaAsiakirjaTiedot(
      asiakirja.copy(apHakemus = Some(true)),
      UserOid(esittelijaOidString)
    )

    val expectedResult = s"""[{
                                "asiatunnus" : null,
                                "hakija" : "Testi Toka Hakija",
                                "aika" : "2025-05-14T10:59:47.597Z",
                                "hakemusOid" : "1.2.246.562.11.00000000000000006666",
                                "hakemusKoskee" : 1,
                                "apHakemus": true,
                                "esittelijaOid" : "1.2.246.562.24.00000000000000006666",
                                "esittelijaKutsumanimi": "Esko",
                                "esittelijaSukunimi": "Esittelijä",
                                "kasittelyVaihe": "OdottaaTaydennysta",
                                "taydennyspyyntoLahetetty": "2025-07-21T14:06:38.273"
                              } ]"""

    val result = mockMvc
      .perform(
        get("/api/hakemuslista?hakemuskoskee=4&vaihe=OdottaaTaydennysta")
      )
      .andExpect(status().isOk)
      .andExpect(content().contentType(MediaType.APPLICATION_JSON))
      .andExpect(content().json(expectedResult))
    verify(auditLog, times(1)).logRead(any(), any(), eqTo(AuditOperation.ReadHakemukset), any())
    hakemus = hakemusRepository.haeHakemus(HakemusOid("1.2.246.562.11.00000000000000006666")).get
    assertEquals(OdottaaTaydennysta, hakemus.kasittelyVaihe)
    assertEquals(1, hakemus.hakemusKoskee)
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

  @Test
  @Order(9)
  @WithMockUser(value = esittelijaOidString, authorities = Array(SecurityConstants.SECURITY_ROOLI_ESITTELIJA_FULL))
  def haeHakemusWithMuuttuneetTutkinnotValidRequestReturns200(): Unit = {
    @Override
    @MockitoBean
    val hakemusOid = HakemusOid("1.2.246.562.11.00000000000000006671")
    when(hakemuspalveluService.haeHakemus(any[HakemusOid]))
      .thenReturn(Right(loadJson("ataruHakemus6671WithModifiedInFuture.json")))
    when(ataruHakemusParser.parseHakija(any[AtaruHakemus]))
      .thenReturn(hakijaFixture)
    when(ataruHakemusParser.parseTutkinnot(any[UUID], any[AtaruHakemus]))
      .thenAnswer { invocation =>
        val uuid = invocation.getArgument[UUID](0)
        createTutkinnotFixtureBeforeMuuttuneetTutkinnot(uuid)
      }
      .thenAnswer { invocation =>
        val uuid = invocation.getArgument[UUID](0)
        createTutkinnotFixtureAfterMuuttuneetTutkinnot(uuid)
      }
      .thenAnswer { invocation =>
        val uuid = invocation.getArgument[UUID](0)
        createTutkinnotFixtureBeforeMuuttuneetTutkinnot(uuid)
      }
    when(ataruHakemusParser.parseHakemusKoskee(any[AtaruHakemus])).thenReturn(1).thenReturn(0)

    when(hakemuspalveluService.haeLomake(any[Long]))
      .thenReturn(Right(loadJson("ataruLomake.json")))

    hakemusService.tallennaAtaruHakemus(UusiAtaruHakemus(hakemusOid, 0))
    val hakemus = hakemusRepository.haeHakemus(hakemusOid).get

    val tutkinnotBefore = tutkintoRepository.haeTutkinnotHakemusOidilla(hakemusOid)

    val firstTutkintoBefore = tutkinnotBefore.find(tutkinto => tutkinto.jarjestys == "1").get
    assertEquals("tutkintotodistus", firstTutkintoBefore.todistusOtsikko.get)
    assertEquals("maatjavaltiot2_101", firstTutkintoBefore.maakoodiUri.get)
    assertEquals("ensimmäinen laulututkinto", firstTutkintoBefore.nimi.get)

    val secondTutkintoBefore = tutkinnotBefore.find(tutkinto => tutkinto.jarjestys == "2").get
    assertEquals("muutodistus", secondTutkintoBefore.todistusOtsikko.get)
    assertEquals(1974, secondTutkintoBefore.aloitusVuosi.get)
    assertEquals(2014, secondTutkintoBefore.paattymisVuosi.get)
    assertEquals("maatjavaltiot2_102", secondTutkintoBefore.maakoodiUri.get)
    assertEquals("Kolmosoluen asijantuntijatutkinto", secondTutkintoBefore.nimi.get)

    val muuTutkintoBefore = tutkinnotBefore.find(tutkinto => tutkinto.jarjestys == "MUU").get
    assertEquals("Ammuu-instituutti", muuTutkintoBefore.muuTutkintoTieto.get)

    mockMvc
      .perform(
        get("/api/hakemus/1.2.246.562.11.00000000000000006671")
      )
      .andExpect(status().isOk)
      .andExpect(content().contentType(MediaType.APPLICATION_JSON))

    val tutkinnotAfter = tutkintoRepository.haeTutkinnotHakemusOidilla(hakemusOid)

    val firstTutkintoAfter = tutkinnotAfter.find(tutkinto => tutkinto.jarjestys == "1").get
    assertEquals("maatjavaltiot2_103", firstTutkintoAfter.maakoodiUri.get)
    assertEquals("ensimmäinen laulututkinto, riki sorsan koko tuotanto", firstTutkintoAfter.nimi.get)

    val secondTutkintoAfter =
      tutkinnotAfter.find(tutkinto => tutkinto.jarjestys == "2").get
    assertEquals("ovrigbevis", secondTutkintoAfter.todistusOtsikko.get)
    assertEquals(1897, secondTutkintoAfter.aloitusVuosi.get)
    assertEquals(2024, secondTutkintoAfter.paattymisVuosi.get)
    assertEquals("maatjavaltiot2_104", secondTutkintoAfter.maakoodiUri.get)
    assertEquals("mocktail-koulu", secondTutkintoAfter.nimi.get)

    val muuTutkintoAfter = tutkinnotAfter.find(tutkinto => tutkinto.jarjestys == "MUU").get
    assertEquals("Ammuu-instituutti, ypäjän hevosopisto", muuTutkintoAfter.muuTutkintoTieto.get)

    // Muokataan tutkintoja virkailijan toimesta
    tutkintoRepository.suoritaPaivitaTutkinto(
      firstTutkintoAfter.copy(nimi = Some("Oikeasti Kirkan parhaat")),
      "Virkailija1"
    )
    tutkintoRepository.suoritaPaivitaTutkinto(
      secondTutkintoAfter.copy(nimi = Some("Pienpanimo-tutkinto")),
      "Virkailija2"
    )
    tutkintoRepository.suoritaPaivitaTutkinto(
      muuTutkintoAfter.copy(muuTutkintoTieto = Some("Tarkistettu: lemmikkigerbiilin hoito")),
      "Virkailija3"
    )

    mockMvc
      .perform(
        get("/api/hakemus/1.2.246.562.11.00000000000000006671")
      )
      .andExpect(status().isOk)
      .andExpect(content().contentType(MediaType.APPLICATION_JSON))

    val tutkinnotAfterVirkailijaUpdate = tutkintoRepository.haeTutkinnotHakemusOidilla(hakemusOid)

    val firstTutkintoAfterVirkailijaUpdate =
      tutkinnotAfterVirkailijaUpdate.find(tutkinto => tutkinto.jarjestys == "1").get
    assertEquals("tutkintotodistus", firstTutkintoAfterVirkailijaUpdate.todistusOtsikko.get)
    assertEquals("maatjavaltiot2_103", firstTutkintoAfterVirkailijaUpdate.maakoodiUri.get)
    assertEquals("Oikeasti Kirkan parhaat", firstTutkintoAfterVirkailijaUpdate.nimi.get)

    val secondTutkintoAfterVirkailijaUpdate =
      tutkinnotAfterVirkailijaUpdate.find(tutkinto => tutkinto.jarjestys == "2").get
    assertEquals("muutodistus", secondTutkintoAfterVirkailijaUpdate.todistusOtsikko.get)
    assertEquals(1974, secondTutkintoAfterVirkailijaUpdate.aloitusVuosi.get)
    assertEquals(2014, secondTutkintoAfterVirkailijaUpdate.paattymisVuosi.get)
    assertEquals("maatjavaltiot2_104", secondTutkintoAfterVirkailijaUpdate.maakoodiUri.get)
    assertEquals("Pienpanimo-tutkinto", secondTutkintoAfterVirkailijaUpdate.nimi.get)

    val muuTutkintoAfterVirkailijaUpdate =
      tutkinnotAfterVirkailijaUpdate.find(tutkinto => tutkinto.jarjestys == "MUU").get
    assertEquals("Tarkistettu: lemmikkigerbiilin hoito", muuTutkintoAfterVirkailijaUpdate.muuTutkintoTieto.get)

    verify(auditLog, times(2)).logRead(any(), any(), eqTo(AuditOperation.ReadHakemus), any())
  }

  def haeHakemusTutkinnotEiMuutuJosHakemusEiMuuttunutValidRequestReturns200(): Unit = {
    @Override
    @MockitoBean
    val hakemusOid = HakemusOid("1.2.246.562.11.00000000000000006671")
    when(hakemuspalveluService.haeHakemus(any[HakemusOid]))
      .thenReturn(Right(loadJson("ataruHakemus6671WithMissingTutkinto2.json")))
    when(ataruHakemusParser.parseHakija(any[AtaruHakemus]))
      .thenReturn(hakijaFixture)
    when(ataruHakemusParser.parseTutkinnot(any[UUID], any[AtaruHakemus]))
      .thenAnswer { invocation =>
        val uuid = invocation.getArgument[UUID](0)
        createTutkinnotFixtureBeforeMuuttuneetTutkinnot(uuid)
      }
      .thenAnswer { invocation =>
        val uuid = invocation.getArgument[UUID](0)
        createTutkinnotFixtureAfterMuuttuneetTutkinnot(uuid)
      }
      .thenAnswer { invocation =>
        val uuid = invocation.getArgument[UUID](0)
        createTutkinnotFixtureBeforeMuuttuneetTutkinnot(uuid)
      }
    when(ataruHakemusParser.parseHakemusKoskee(any[AtaruHakemus])).thenReturn(1).thenReturn(0)

    when(hakemuspalveluService.haeLomake(any[Long]))
      .thenReturn(Right(loadJson("ataruLomake.json")))

    hakemusService.tallennaAtaruHakemus(UusiAtaruHakemus(hakemusOid, 0))
    val hakemus = hakemusRepository.haeHakemus(hakemusOid).get

    val tutkinnotBefore = tutkintoRepository.haeTutkinnotHakemusOidilla(hakemusOid)

    val firstTutkintoBefore = tutkinnotBefore.find(tutkinto => tutkinto.jarjestys == "1").get
    assertEquals("tutkintotodistus", firstTutkintoBefore.todistusOtsikko.get)
    assertEquals("maatjavaltiot2_101", firstTutkintoBefore.maakoodiUri.get)
    assertEquals("ensimmäinen laulututkinto", firstTutkintoBefore.nimi.get)

    val secondTutkintoBefore = tutkinnotBefore.find(tutkinto => tutkinto.jarjestys == "2").get
    assertEquals("muutodistus", secondTutkintoBefore.todistusOtsikko.get)
    assertEquals(1974, secondTutkintoBefore.aloitusVuosi.get)
    assertEquals(2014, secondTutkintoBefore.paattymisVuosi.get)
    assertEquals("maatjavaltiot2_102", secondTutkintoBefore.maakoodiUri.get)
    assertEquals("Kolmosoluen asijantuntijatutkinto", secondTutkintoBefore.nimi.get)

    val muuTutkintoBefore = tutkinnotBefore.find(tutkinto => tutkinto.jarjestys == "MUU").get
    assertEquals("Ammuu-instituutti", muuTutkintoBefore.muuTutkintoTieto.get)

    mockMvc
      .perform(
        get("/api/hakemus/1.2.246.562.11.00000000000000006671")
      )
      .andExpect(status().isOk)
      .andExpect(content().contentType(MediaType.APPLICATION_JSON))

    val tutkinnotAfter = tutkintoRepository.haeTutkinnotHakemusOidilla(hakemusOid)

    val firstTutkintoAfter = tutkinnotAfter.find(tutkinto => tutkinto.jarjestys == "1").get
    assertEquals(firstTutkintoBefore.maakoodiUri.get, firstTutkintoAfter.maakoodiUri.get)
    assertEquals(firstTutkintoBefore.maakoodiUri.get, firstTutkintoAfter.nimi.get)

    val secondTutkintoAfter =
      tutkinnotAfter.find(tutkinto => tutkinto.jarjestys == "2").get
    assertEquals(secondTutkintoBefore.todistusOtsikko.get, secondTutkintoAfter.todistusOtsikko.get)
    assertEquals(secondTutkintoBefore.aloitusVuosi.get, secondTutkintoAfter.aloitusVuosi.get)
    assertEquals(secondTutkintoBefore.paattymisVuosi.get, secondTutkintoAfter.paattymisVuosi.get)
    assertEquals(secondTutkintoBefore.maakoodiUri.get, secondTutkintoAfter.maakoodiUri.get)
    assertEquals(secondTutkintoBefore.nimi.get, secondTutkintoAfter.nimi.get)

    val muuTutkintoAfter = tutkinnotAfter.find(tutkinto => tutkinto.jarjestys == "MUU").get
    assertEquals(muuTutkintoBefore.muuTutkintoTieto.get, muuTutkintoAfter.muuTutkintoTieto.get)

    verify(auditLog, times(2)).logRead(any(), any(), eqTo(AuditOperation.ReadHakemus), any())
  }
}
