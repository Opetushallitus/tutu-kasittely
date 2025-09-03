package fi.oph.tutu.backend

import com.fasterxml.jackson.databind.{ObjectMapper, SerializationFeature}
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule
import com.fasterxml.jackson.module.scala.DefaultScalaModule
import fi.oph.tutu.backend.domain.*
import fi.oph.tutu.backend.domain.AsiakirjamalliLahde.*
import fi.oph.tutu.backend.domain.ValmistumisenVahvistusVastaus.{Kielteinen, Myonteinen}
import fi.oph.tutu.backend.repository.{AsiakirjaRepository, DbMaakoodi, EsittelijaRepository, HakemusRepository}
import fi.oph.tutu.backend.security.SecurityConstants
import fi.oph.tutu.backend.service.*
import fi.oph.tutu.backend.utils.{AuditLog, AuditOperation}
import org.hamcrest.Matchers.equalTo
import org.junit.jupiter.api.*
import org.junit.jupiter.api.Assertions.fail
import org.junit.jupiter.api.MethodOrderer.OrderAnnotation
import org.junit.jupiter.api.TestInstance.Lifecycle
import org.mockito.ArgumentMatchers.{any, eq as eqTo}
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

import java.time.LocalDateTime

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

  @MockitoBean
  var auditLog: AuditLog = _

  @Autowired
  var hakemusService: HakemusService = _

  @MockitoBean
  var kayttooikeusService: KayttooikeusService = _

  @Autowired
  var userService: UserService                       = _
  implicit val ec: scala.concurrent.ExecutionContext = scala.concurrent.ExecutionContext.global

  final val esittelijaOidString = "1.2.246.562.24.00000000000000006666"
  val dummyUserAgent            = "User-Agent"
  val dummyUserAgentValue       = "DummyAgent/1.0"
  val xffOriginalHeaderName     = "XFF_ORIGINAL"
  val xffOriginalHeaderValue    = "127.0.0.1"

  var esittelija: Option[DbEsittelija] = None
  var maakoodi: Option[DbMaakoodi]     = None

  @BeforeAll def setup(): Unit = {
    val configurer: MockMvcConfigurer =
      SecurityMockMvcConfigurers.springSecurity()
    val intermediate: DefaultMockMvcBuilder =
      MockMvcBuilders.webAppContextSetup(context).apply(configurer)
    mockMvc = intermediate.build()
    esittelija = esittelijaRepository.insertEsittelija(UserOid(esittelijaOidString), "testi")
    maakoodi = maakoodiRepository.upsertMaakoodi("752", "Ruotsi", "testi", Some(esittelija.get.esittelijaId))
  }

  @BeforeEach
  def setupTest(): Unit =
    when(mockOnrService.haeAsiointikieli(any[String]))
      .thenReturn(Right("fi"))

    when(mockOnrService.haeHenkilo(esittelijaOidString))
      .thenReturn(Right(OnrUser(esittelijaOidString, "Esko", "Esittelijä")))

  private val mapper = new ObjectMapper()
  mapper.registerModule(DefaultScalaModule)
  mapper.registerModule(new JavaTimeModule)
  mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS)

  def updateHakemus(hakemusOid: HakemusOid, partialHakemus: PartialHakemus): Hakemus = {
    mockMvc
      .perform(
        patch(s"/api/hakemus/${hakemusOid.toString}")
          .`with`(csrf())
          .contentType(MediaType.APPLICATION_JSON)
          .content(mapper.writeValueAsString(partialHakemus))
      )
      .andExpect(status().isOk)
    hakemusService.haeHakemus(hakemusOid).get
  }

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
    verify(auditLog, times(1)).logRead(any(), any(), eqTo(AuditOperation.ReadEsittelija), any())
  }

  // @Test
  @Order(1)
  @WithMockUser(
    value = esittelijaOidString,
    authorities = Array(SecurityConstants.SECURITY_ROOLI_ESITTELIJA_FULL)
  )
  def luoHakemusValidRequestWithoutEsittelijaReturns200(): Unit = {
    when(hakemuspalveluService.haeHakemus(any[HakemusOid]))
      .thenReturn(Right(loadJson("ataruHakemus6666.json")))
    val requestJson =
      """{
          "hakemusOid": "1.2.246.562.11.00000000000000006666",
          "maakoodi": "752",
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
  def luoHakemusValidRequestReturns500WhenHakemusAlreadyExists(): Unit = {
    val hakemus     = UusiAtaruHakemus(HakemusOid("1.2.246.562.11.00000000000000006666"), "752", 1)
    val requestJson = mapper.writeValueAsString(hakemus)

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
    val hakemus     = UusiAtaruHakemus(HakemusOid("1.2.246.562.11.00000000000000006667"), "752", 0)
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
    val hakemus     = UusiAtaruHakemus(HakemusOid("1.2.246.562.11.00000000000000006667"), "752", 0)
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

  // @Test
  @Order(6)
  @WithMockUser(
    value = esittelijaOidString,
    authorities = Array(SecurityConstants.SECURITY_ROOLI_ESITTELIJA_FULL)
  )
  def luoHakemusValidRequestReturns200WithCorrectEsittelijaOid(): Unit = {
    when(hakemuspalveluService.haeHakemus(any[HakemusOid]))
      .thenReturn(Right(loadJson("ataruHakemus6665.json")))

    val requestJson =
      """{
          "hakemusOid": "1.2.246.562.11.00000000000000006665",
          "maakoodi": "752",
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

  // @Test
  @Order(7)
  @WithMockUser(
    value = esittelijaOidString,
    authorities = Array(SecurityConstants.SECURITY_ROOLI_ESITTELIJA_FULL)
  )
  def haeHakemuslistaReturns200AndArrayOfHakemusListItems(): Unit = {
    initAtaruHakemusRequests()
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
                                "kasittelyVaihe": "AlkukasittelyKesken",
                                "taydennyspyyntoLahetetty": null
                              }, {
                                "asiatunnus" : null,
                                "hakija" : "Testi Hakija",
                                "aika" : "2025-05-14T11:06:38.273Z",
                                "hakemusOid" : "1.2.246.562.11.00000000000000006665",
                                "hakemusKoskee" : 0,
                                "esittelijaOid" : "1.2.246.562.24.00000000000000006666",
                                "esittelijaKutsumanimi": "Esko",
                                "esittelijaSukunimi": "Esittelijä",
                                "kasittelyVaihe": "AlkukasittelyKesken",
                                "taydennyspyyntoLahetetty": "2025-07-14T11:06:38.273Z"
                              }, {
                                "asiatunnus" : null,
                                "hakija" : "Testi Toka Hakija",
                                "aika" : "2025-05-14T10:59:47.597Z",
                                "hakemusOid" : "1.2.246.562.11.00000000000000006666",
                                "hakemusKoskee" : 1,
                                "esittelijaOid" : "1.2.246.562.24.00000000000000006666",
                                "esittelijaKutsumanimi": "Esko",
                                "esittelijaSukunimi": "Esittelijä",
                                "kasittelyVaihe": "AlkukasittelyKesken",
                                "taydennyspyyntoLahetetty": "2025-07-21T11:06:38.273Z"
                              }, {
                                "asiatunnus" : null,
                                "hakija" : "Testi Kolmas Hakija",
                                "aika" : "2025-05-14T10:59:47.597Z",
                                "hakemusOid" : "1.2.246.562.11.00000000000000006667",
                                "hakemusKoskee" : 0,
                                "esittelijaOid" : null,
                                "esittelijaKutsumanimi": null,
                                "esittelijaSukunimi": null,
                                "kasittelyVaihe": "AlkukasittelyKesken",
                                "taydennyspyyntoLahetetty": null
                              } ]"""

    hakemusService.tallennaHakemus(UusiAtaruHakemus(HakemusOid("1.2.246.562.11.00000000000000006667"), "000", 0))
    hakemusService.tallennaHakemus(UusiAtaruHakemus(HakemusOid("1.2.246.562.11.00000000000000006668"), "752", 1))

    val result = mockMvc
      .perform(
        get("/api/hakemuslista")
      )
      .andExpect(status().isOk)
      .andExpect(content().contentType(MediaType.APPLICATION_JSON))
      .andExpect(content().json(expectedResult))
    verify(auditLog, times(1)).logRead(any(), any(), eqTo(AuditOperation.ReadHakemukset), any())
  }

  // @Test
  @Order(8)
  @WithMockUser(value = esittelijaOidString, authorities = Array(SecurityConstants.SECURITY_ROOLI_ESITTELIJA_FULL))
  def haeHakemuslistaReturns200AndArrayOfHakemusListItemsWithNaytaAndHakemuskoskeeQueryParameters(): Unit = {
    when(hakemuspalveluService.haeHakemukset(any[Seq[HakemusOid]]))
      .thenReturn(Right(loadJson("ataruHakemukset.json")))
    hakemusService.paivitaHakemus(
      HakemusOid("1.2.246.562.11.00000000000000006668"),
      PartialHakemus(asiakirja = Some(PartialAsiakirja(apHakemus = Some(true)))),
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

  // @Test
  @Order(9)
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
                                "yhteistutkinto": false,
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
                                  "modifiedBy": "Esko Esittelijä"}
                                ],
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
  def paivitaHakemusValidRequestReturns200(): Unit = {
    initAtaruHakemusRequests()

    // maakoodi 0000 -> esittelijaOid = null
    val originalHakemus = UusiAtaruHakemus(HakemusOid("1.2.246.562.11.00000000000000006670"), "0000", 0)
    hakemusService.tallennaHakemus(originalHakemus)

    // Päivitetään esittelijaOid
    var updatedHakemus = PartialHakemus(
      esittelijaOid = Some(esittelijaOidString)
    )
    var paivitettyHakemus = updateHakemus(HakemusOid("1.2.246.562.11.00000000000000006670"), updatedHakemus)
    assert(paivitettyHakemus.esittelijaOid.contains(esittelijaOidString))

    // Päivitetään hakemuskoskee 1 -> 0
    updatedHakemus = PartialHakemus(
      hakemusKoskee = Some(0)
    )
    paivitettyHakemus = updateHakemus(HakemusOid("1.2.246.562.11.00000000000000006670"), updatedHakemus)
    assert(paivitettyHakemus.hakemusKoskee == 0)

    // Päivitetään asiatunnus
    updatedHakemus = PartialHakemus(
      asiatunnus = Some("OPH-122-2025")
    )
    paivitettyHakemus = updateHakemus(HakemusOid("1.2.246.562.11.00000000000000006670"), updatedHakemus)
    assert(paivitettyHakemus.asiatunnus.contains("OPH-122-2025"))

    // Päivitetään yhteistutkinto
    updatedHakemus = PartialHakemus(
      yhteistutkinto = Some(true)
    )
    paivitettyHakemus = updateHakemus(HakemusOid("1.2.246.562.11.00000000000000006670"), updatedHakemus)
    assert(paivitettyHakemus.yhteistutkinto.equals(true))

    // Testissä on 4 eri päivitystä, joten auditlogia tulee kutsua 4 kertaa
    verify(auditLog, times(4)).logChanges(any(), any(), eqTo(AuditOperation.UpdateHakemus), any())
  }

  @Test
  @Order(12)
  @WithMockUser(
    value = esittelijaOidString,
    authorities = Array(SecurityConstants.SECURITY_ROOLI_ESITTELIJA_FULL)
  )
  def paivitaHakemusValidRequestReturns200WithChangedPyydettavatAsiakirjat(): Unit = {
    initAtaruHakemusRequests()
    val hakemusOid = HakemusOid("1.2.246.562.11.00000000000000006670")

    // Lisätään asiakirja
    var updatedHakemus = PartialHakemus(
      asiakirja = Some(
        PartialAsiakirja(
          pyydettavatAsiakirjat = Some(Seq(PyydettavaAsiakirja(None, "tutkintotodistustenjaljennokset")))
        )
      )
    )
    var paivitettyHakemus = updateHakemus(hakemusOid, updatedHakemus)
    assert(paivitettyHakemus.asiakirja.get.pyydettavatAsiakirjat.size == 1)

    val asiakirjaId = hakemusRepository.haeHakemus(hakemusOid).get.asiakirjaId.get

    // Lisätään toinen asiakirja
    var hakemuksenPyydettavatAsiakirjat =
      asiakirjaRepository
        .haePyydettavatAsiakirjat(asiakirjaId)
        .concat(Seq(PyydettavaAsiakirja(None, "tyotodistukset")))

    updatedHakemus = PartialHakemus(
      asiakirja = Some(
        PartialAsiakirja(
          pyydettavatAsiakirjat = Some(hakemuksenPyydettavatAsiakirjat)
        )
      )
    )
    paivitettyHakemus = updateHakemus(hakemusOid, updatedHakemus)
    assert(paivitettyHakemus.asiakirja.get.pyydettavatAsiakirjat.size == 2)

    // Päivitetään asiakirja
    hakemuksenPyydettavatAsiakirjat = asiakirjaRepository
      .haePyydettavatAsiakirjat(asiakirjaId)

    val uudetAsiakirjat =
      Seq(
        hakemuksenPyydettavatAsiakirjat.head,
        PyydettavaAsiakirja(hakemuksenPyydettavatAsiakirjat.last.id, "alkuperaisetliitteet")
      )

    updatedHakemus = PartialHakemus(
      asiakirja = Some(PartialAsiakirja(pyydettavatAsiakirjat = Some(uudetAsiakirjat)))
    )
    paivitettyHakemus = updateHakemus(HakemusOid("1.2.246.562.11.00000000000000006670"), updatedHakemus)
    assert(paivitettyHakemus.asiakirja.get.pyydettavatAsiakirjat.size == 2)
    assert(paivitettyHakemus.asiakirja.get.pyydettavatAsiakirjat.last.asiakirjanTyyppi == "alkuperaisetliitteet")

    // Poistetaan ensimmäinen asiakirja
    hakemuksenPyydettavatAsiakirjat = Seq(
      asiakirjaRepository
        .haePyydettavatAsiakirjat(asiakirjaId)
        .last
    )

    updatedHakemus = PartialHakemus(
      asiakirja = Some(
        PartialAsiakirja(
          pyydettavatAsiakirjat = Some(hakemuksenPyydettavatAsiakirjat)
        )
      )
    )
    paivitettyHakemus = updateHakemus(HakemusOid("1.2.246.562.11.00000000000000006670"), updatedHakemus)
    assert(paivitettyHakemus.asiakirja.get.pyydettavatAsiakirjat.size == 1)
    assert(paivitettyHakemus.asiakirja.get.pyydettavatAsiakirjat.last.asiakirjanTyyppi == "alkuperaisetliitteet")

    // Poistetaan kaikki asiakirjat
    updatedHakemus = PartialHakemus(
      asiakirja = Some(PartialAsiakirja(pyydettavatAsiakirjat = Some(Seq.empty[PyydettavaAsiakirja])))
    )

    paivitettyHakemus = updateHakemus(HakemusOid("1.2.246.562.11.00000000000000006670"), updatedHakemus)
    assert(paivitettyHakemus.asiakirja.get.pyydettavatAsiakirjat.isEmpty)

    // Testissä on 5 eri päivitystä, joten auditlogia tulee kutsua 5 kertaa
    verify(auditLog, times(5)).logChanges(any(), any(), eqTo(AuditOperation.UpdateHakemus), any())

  }

  @Test
  @Order(13)
  @WithMockUser(
    value = esittelijaOidString,
    authorities = Array(SecurityConstants.SECURITY_ROOLI_ESITTELIJA_FULL)
  )
  def paivitaHakemusValidRequestReturns200WithChangedAsiakirjamallit(): Unit = {
    initAtaruHakemusRequests()

    val originalHakemus = UusiAtaruHakemus(HakemusOid("1.2.246.562.11.00000000000000006671"), "0000", 0)
    hakemusService.tallennaHakemus(originalHakemus)
    val dbHakemus = hakemusRepository.haeHakemus(HakemusOid("1.2.246.562.11.00000000000000006671"))

    var updatedHakemus = PartialHakemus(
      asiakirja = Some(
        PartialAsiakirja(asiakirjamallitTutkinnoista =
          Some(
            Map(
              ece    -> AsiakirjamalliTutkinnosta(ece, true, Some("kuvaus1")),
              nuffic -> AsiakirjamalliTutkinnosta(nuffic, false, Some("kuvaus2")),
              aacrao -> AsiakirjamalliTutkinnosta(aacrao, true, None),
              muu    -> AsiakirjamalliTutkinnosta(muu, false, None)
            )
          )
        )
      )
    )
    var paivitettyHakemus = updateHakemus(HakemusOid("1.2.246.562.11.00000000000000006671"), updatedHakemus)
    var asiakirjamallit   = paivitettyHakemus.asiakirja.get.asiakirjamallitTutkinnoista
    assert(asiakirjamallit.size == 4)
    assert(asiakirjamallit.contains(ece))
    assert(asiakirjamallit(ece).vastaavuus)
    assert(asiakirjamallit(ece).kuvaus.contains("kuvaus1"))
    assert(asiakirjamallit.contains(nuffic))
    assert(!asiakirjamallit(nuffic).vastaavuus)
    assert(asiakirjamallit(nuffic).kuvaus.contains("kuvaus2"))
    assert(asiakirjamallit.contains(aacrao))
    assert(asiakirjamallit(aacrao).vastaavuus)
    assert(asiakirjamallit(aacrao).kuvaus.isEmpty)
    assert(asiakirjamallit.contains(muu))
    assert(!asiakirjamallit(muu).vastaavuus)
    assert(asiakirjamallit(muu).kuvaus.isEmpty)

    updatedHakemus = PartialHakemus(
      asiakirja = Some(
        PartialAsiakirja(asiakirjamallitTutkinnoista =
          Some(
            Map(
              ece          -> AsiakirjamalliTutkinnosta(ece, false, Some("editoitu kuvaus")),
              naric_portal -> AsiakirjamalliTutkinnosta(naric_portal, true, Some("naric kuvaus")),
              aacrao       -> AsiakirjamalliTutkinnosta(aacrao, false, None),
              muu          -> AsiakirjamalliTutkinnosta(muu, false, Some("uusi kuvaus"))
            )
          )
        )
      )
    )
    paivitettyHakemus = updateHakemus(HakemusOid("1.2.246.562.11.00000000000000006671"), updatedHakemus)
    asiakirjamallit = paivitettyHakemus.asiakirja.get.asiakirjamallitTutkinnoista
    assert(asiakirjamallit.size == 4)
    assert(asiakirjamallit.contains(ece))
    assert(!asiakirjamallit(ece).vastaavuus)
    assert(asiakirjamallit(ece).kuvaus.contains("editoitu kuvaus"))
    assert(asiakirjamallit.contains(naric_portal))
    assert(asiakirjamallit(naric_portal).vastaavuus)
    assert(asiakirjamallit(naric_portal).kuvaus.contains("naric kuvaus"))
    assert(asiakirjamallit.contains(aacrao))
    assert(!asiakirjamallit(aacrao).vastaavuus)
    assert(asiakirjamallit(aacrao).kuvaus.isEmpty)
    assert(asiakirjamallit.contains(muu))
    assert(!asiakirjamallit(muu).vastaavuus)
    assert(asiakirjamallit(muu).kuvaus.contains("uusi kuvaus"))

    // Testissä on 2 eri päivitystä, joten auditlogia tulee kutsua 2 kertaa
    verify(auditLog, times(2)).logChanges(any(), any(), eqTo(AuditOperation.UpdateHakemus), any())
  }

  @Test
  @Order(13)
  @WithMockUser(
    value = esittelijaOidString,
    authorities = Array(SecurityConstants.SECURITY_ROOLI_ESITTELIJA_FULL)
  )
  def paivitaPartialHakemusWithIMIPyyntoValidRequestReturns200(): Unit = {
    initAtaruHakemusRequests()

    val hakemusOid = HakemusOid("1.2.246.562.11.00000000000000006670")

    // imiPyynto = true
    var updatedHakemus = PartialHakemus(
      asiakirja = Some(PartialAsiakirja(imiPyynto = Some(ImiPyynto(Some(true), null, null, null))))
    )
    var paivitettyHakemus = updateHakemus(hakemusOid, updatedHakemus)
    assert(paivitettyHakemus.asiakirja.get.imiPyynto.imiPyynto.contains(true))

    // Loput IMI-kentät
    updatedHakemus = PartialHakemus(
      asiakirja = Some(
        PartialAsiakirja(imiPyynto =
          Some(
            ImiPyynto(
              Some(true),
              Some("123-6P"),
              Some(LocalDateTime.parse("2025-08-06T00:00:00.000")),
              Some(LocalDateTime.parse("2025-08-15T00:00:00.000"))
            )
          )
        )
      )
    )

    paivitettyHakemus = updateHakemus(hakemusOid, updatedHakemus)
    assert(paivitettyHakemus.asiakirja.get.imiPyynto.imiPyynto.contains(true))
    assert(paivitettyHakemus.asiakirja.get.imiPyynto.imiPyyntoNumero.contains("123-6P"))
    assert(
      paivitettyHakemus.asiakirja.get.imiPyynto.imiPyyntoLahetetty.contains(LocalDateTime.parse("2025-08-06T00:00"))
    )
    assert(
      paivitettyHakemus.asiakirja.get.imiPyynto.imiPyyntoVastattu.contains(LocalDateTime.parse("2025-08-15T00:00"))
    )

    // Päivitetään AP-hakemus
    updatedHakemus = PartialHakemus(
      asiakirja = Some(PartialAsiakirja(apHakemus = Some(true)))
    )
    paivitettyHakemus = updateHakemus(hakemusOid, updatedHakemus)
    assert(paivitettyHakemus.asiakirja.get.apHakemus.contains(true))

    // imi-pyynto null -> Loput IMI-kentät pitäisi olla None
    updatedHakemus = PartialHakemus(
      asiakirja = Some(
        PartialAsiakirja(imiPyynto =
          Some(
            ImiPyynto(
              None
            )
          )
        )
      )
    )

    paivitettyHakemus = updateHakemus(hakemusOid, updatedHakemus)
    assert(paivitettyHakemus.asiakirja.get.imiPyynto.imiPyynto.isEmpty)
    assert(paivitettyHakemus.asiakirja.get.imiPyynto.imiPyyntoNumero.isEmpty)
    assert(paivitettyHakemus.asiakirja.get.imiPyynto.imiPyyntoLahetetty.isEmpty)
    assert(paivitettyHakemus.asiakirja.get.imiPyynto.imiPyyntoVastattu.isEmpty)

    // IMI-kentät uudestaan sisään
    updatedHakemus = PartialHakemus(
      asiakirja = Some(
        PartialAsiakirja(imiPyynto =
          Some(
            ImiPyynto(
              Some(true),
              Some("123-6P"),
              Some(LocalDateTime.parse("2025-08-06T00:00:00.000")),
              Some(LocalDateTime.parse("2025-08-15T00:00:00.000"))
            )
          )
        )
      )
    )
    paivitettyHakemus = updateHakemus(hakemusOid, updatedHakemus)
    assert(paivitettyHakemus.asiakirja.get.imiPyynto.imiPyynto.contains(true))
    assert(paivitettyHakemus.asiakirja.get.imiPyynto.imiPyyntoNumero.contains("123-6P"))
    assert(
      paivitettyHakemus.asiakirja.get.imiPyynto.imiPyyntoLahetetty.contains(LocalDateTime.parse("2025-08-06T00:00"))
    )
    assert(
      paivitettyHakemus.asiakirja.get.imiPyynto.imiPyyntoVastattu.contains(LocalDateTime.parse("2025-08-15T00:00"))
    )

    // Päivitetään joku toinen kenttä, tämä ei saa vaikuttaa IMI-kenttiin
    updatedHakemus = PartialHakemus(
      asiatunnus = Some("OPH-122-2025")
    )
    paivitettyHakemus = updateHakemus(hakemusOid, updatedHakemus)
    assert(paivitettyHakemus.asiakirja.get.imiPyynto.imiPyynto.contains(true))
    assert(paivitettyHakemus.asiakirja.get.imiPyynto.imiPyyntoNumero.contains("123-6P"))
    assert(
      paivitettyHakemus.asiakirja.get.imiPyynto.imiPyyntoLahetetty.contains(LocalDateTime.parse("2025-08-06T00:00"))
    )
    assert(
      paivitettyHakemus.asiakirja.get.imiPyynto.imiPyyntoVastattu.contains(LocalDateTime.parse("2025-08-15T00:00"))
    )
  }

  @Test
  @Order(13)
  @WithMockUser(
    value = esittelijaOidString,
    authorities = Array(SecurityConstants.SECURITY_ROOLI_ESITTELIJA_FULL)
  )
  def paivitaPartialHakemusWithValmistumisenVahvistusValidRequestReturns200(): Unit = {
    initAtaruHakemusRequests()
    val hakemusOid = HakemusOid("1.2.246.562.11.00000000000000006670")

    var updatedHakemus = PartialHakemus(
      asiakirja = Some(
        PartialAsiakirja(valmistumisenVahvistus =
          Some(
            ValmistumisenVahvistus(
              true,
              Some(LocalDateTime.parse("2025-08-06T00:00:00.000")),
              Some(LocalDateTime.parse("2025-08-15T00:00:00.000")),
              Some(Myonteinen),
              Some("Lisätietoja")
            )
          )
        )
      )
    )
    var paivitettyHakemus = updateHakemus(hakemusOid, updatedHakemus)
    assert(paivitettyHakemus.asiakirja.get.valmistumisenVahvistus.valmistumisenVahvistus)
    assert(
      paivitettyHakemus.asiakirja.get.valmistumisenVahvistus.valmistumisenVahvistusPyyntoLahetetty
        .contains(LocalDateTime.parse("2025-08-06T00:00"))
    )
    assert(
      paivitettyHakemus.asiakirja.get.valmistumisenVahvistus.valmistumisenVahvistusSaatu
        .contains(LocalDateTime.parse("2025-08-15T00:00"))
    )
    assert(paivitettyHakemus.asiakirja.get.valmistumisenVahvistus.valmistumisenVahvistusVastaus.contains(Myonteinen))
    assert(
      paivitettyHakemus.asiakirja.get.valmistumisenVahvistus.valmistumisenVahvistusLisatieto.contains("Lisätietoja")
    )

    // Päivitetään vahvistustiedot
    updatedHakemus = PartialHakemus(
      asiakirja = Some(
        PartialAsiakirja(valmistumisenVahvistus =
          Some(
            ValmistumisenVahvistus(
              true,
              Some(LocalDateTime.parse("2025-08-06T00:00:00.000")),
              Some(LocalDateTime.parse("2025-08-15T00:00:00.000")),
              Some(Kielteinen),
              None
            )
          )
        )
      )
    )
    paivitettyHakemus = updateHakemus(hakemusOid, updatedHakemus)
    assert(paivitettyHakemus.asiakirja.get.valmistumisenVahvistus.valmistumisenVahvistusVastaus.contains(Kielteinen))
    assert(paivitettyHakemus.asiakirja.get.valmistumisenVahvistus.valmistumisenVahvistusLisatieto.isEmpty)

    // vahvistus false -> Loput vahvistus-kentät myös None
    updatedHakemus = PartialHakemus(
      asiakirja = Some(
        PartialAsiakirja(valmistumisenVahvistus =
          Some(
            ValmistumisenVahvistus(
              false,
              Some(LocalDateTime.parse("2025-08-06T00:00:00.000")),
              Some(LocalDateTime.parse("2025-08-15T00:00:00.000")),
              Some(Kielteinen),
              None
            )
          )
        )
      )
    )

    paivitettyHakemus = updateHakemus(hakemusOid, updatedHakemus)
    assert(!paivitettyHakemus.asiakirja.get.valmistumisenVahvistus.valmistumisenVahvistus)
    assert(paivitettyHakemus.asiakirja.get.valmistumisenVahvistus.valmistumisenVahvistusPyyntoLahetetty.isEmpty)
    assert(paivitettyHakemus.asiakirja.get.valmistumisenVahvistus.valmistumisenVahvistusSaatu.isEmpty)
    assert(paivitettyHakemus.asiakirja.get.valmistumisenVahvistus.valmistumisenVahvistusVastaus.isEmpty)
    assert(paivitettyHakemus.asiakirja.get.valmistumisenVahvistus.valmistumisenVahvistusLisatieto.isEmpty)
  }

  @Test
  @Order(14)
  @WithMockUser(
    value = esittelijaOidString,
    authorities = Array(SecurityConstants.SECURITY_ROOLI_ESITTELIJA_FULL)
  )
  def luoHakemusValidRequestStoresTutkinnotCorrectly(): Unit = {
    initAtaruHakemusRequests()
    when(hakemuspalveluService.haeHakemus(any[HakemusOid]))
      .thenReturn(Right(loadJson("ataruHakemus6670.json")))
    val requestJson =
      """{
          "hakemusOid": "1.2.246.562.11.00000000000000006670",
          "maakoodi": "752",
          "hakemusKoskee": 1
          }"""

    mockMvc
      .perform(
        post("/api/ataru-hakemus")
          .`with`(csrf())
          .contentType(MediaType.APPLICATION_JSON)
          .content(requestJson)
      )

    val hakemus = hakemusRepository.haeHakemus(HakemusOid("1.2.246.562.11.00000000000000006670"))

    val tutkinnot: Seq[Tutkinto] = hakemusRepository.haeTutkinnotHakemusIdilla(hakemus.get.id)

    val tutkinto1 = tutkinnot.head
    assert(tutkinto1.hakemusId == hakemus.get.id)
    assert(tutkinto1.jarjestys == "1")
    assert(tutkinto1.nimi.contains("Päälikkö"))
    assert(tutkinto1.oppilaitos.contains("Butan Amattikoulu"))
    assert(tutkinto1.aloitusVuosi.contains(1999))
    assert(tutkinto1.paattymisVuosi.contains(2000))
    assert(tutkinto1.maakoodi.contains("762"))
    assert(tutkinto1.todistusOtsikko.contains("examensbevis"))
    assert(tutkinto1.muuTutkintoTieto.isEmpty)

    val tutkinto2 = tutkinnot(1)
    assert(tutkinto2.hakemusId == hakemus.get.id)
    assert(tutkinto2.jarjestys == "2")
    assert(tutkinto2.nimi.contains("Johto tehtävä"))
    assert(tutkinto2.oppilaitos.contains("Johto koulu"))
    assert(tutkinto2.aloitusVuosi.contains(2006))
    assert(tutkinto2.paattymisVuosi.contains(2007))
    assert(tutkinto2.maakoodi.contains("762"))
    assert(tutkinto2.todistusOtsikko.contains("ovrigbevis"))
    assert(tutkinto2.muuTutkintoTieto.isEmpty)

    val tutkinto3 = tutkinnot(2)
    assert(tutkinto3.hakemusId == hakemus.get.id)
    assert(tutkinto3.jarjestys == "3")
    assert(tutkinto3.nimi.contains("Apu poika"))
    assert(tutkinto3.oppilaitos.contains("Apu koulu"))
    assert(tutkinto3.aloitusVuosi.contains(2010))
    assert(tutkinto3.paattymisVuosi.contains(2011))
    assert(tutkinto3.maakoodi.contains("762"))
    assert(tutkinto3.todistusOtsikko.isEmpty)
    assert(tutkinto3.muuTutkintoTieto.isEmpty)

    val muuTutkinto = tutkinnot.last
    assert(muuTutkinto.hakemusId == hakemus.get.id)
    assert(muuTutkinto.jarjestys == "MUU")
    assert(muuTutkinto.nimi.isEmpty)
    assert(muuTutkinto.oppilaitos.isEmpty)
    assert(muuTutkinto.aloitusVuosi.isEmpty)
    assert(muuTutkinto.paattymisVuosi.isEmpty)
    assert(muuTutkinto.maakoodi.isEmpty)
    assert(muuTutkinto.todistusOtsikko.isEmpty)
    assert(
      muuTutkinto.muuTutkintoTieto.contains(
        "olem lisäksi suorittanut onnistunesti\n\n- elämän koulun perus ja ja jatko opintoja monia kymmeniä,,,, opintoviikoja\n\n\nsekä:\n\nesi merkiksi rippi koulun!!!!111"
      )
    )
  }

  @Test
  @Order(15)
  @WithMockUser(
    value = esittelijaOidString,
    authorities = Array(SecurityConstants.SECURITY_ROOLI_ESITTELIJA_FULL)
  )
  def haeHakemusValidRequestReturnsTutkinnotCorrectly(): Unit = {
    initAtaruHakemusRequests()
    when(hakemuspalveluService.haeHakemus(any[HakemusOid]))
      .thenReturn(Right(loadJson("ataruHakemus6670.json")))

    val hakemusId =
      hakemusRepository.haeHakemus(HakemusOid("1.2.246.562.11.00000000000000006670")).get.id

    val expectedResult =
      s"""{
         |  "hakemusOid" : "1.2.246.562.11.00000000000000006670",
         |  "lomakeOid" : "aaa89601-78dd-48c7-91fa-7da419f680bb",
         |  "hakija" : {
         |    "etunimet" : "Testi Kolmas",
         |    "kutsumanimi" : "Tatu",
         |    "sukunimi" : "Hakija",
         |    "kansalaisuus" : {
         |      "fi" : "Suomi",
         |      "sv" : "Finland",
         |      "en" : "Finland"
         |    },
         |    "hetu" : "180462-9981",
         |    "syntymaaika" : "18.04.1962",
         |    "matkapuhelin" : "+3584411222333",
         |    "asuinmaa" : {
         |      "fi" : "Suomi",
         |      "sv" : "Finland",
         |      "en" : "Finland"
         |    },
         |    "katuosoite" : "Sillitie 1",
         |    "postinumero" : "00800",
         |    "postitoimipaikka" : "HELSINKI",
         |    "kotikunta" : {
         |      "fi" : "Kajaani",
         |      "sv" : "Kajana",
         |      "en" : "Kanada"
         |    },
         |    "sahkopostiosoite" : "patu.kuusinen@riibasu.fi"
         |  },
         |  "sisalto" : null,
         |  "liitteidenTilat" : [ {
         |    "attachment" : "582be518-e3ea-4692-8a2c-8370b40213e9",
         |    "state" : "not-checked",
         |    "hakukohde" : "form"
         |  }, {
         |    "attachment" : "5b179002-91a4-449d-8c4a-d024637a516d",
         |    "state" : "not-checked",
         |    "hakukohde" : "form"
         |  }, {
         |    "attachment" : "7281aa4d-39ee-4e5b-a183-11a49e60d678",
         |    "state" : "not-checked",
         |    "hakukohde" : "form"
         |  }, {
         |    "attachment" : "7a403a34-e551-4eed-93e7-52c7ab97ba13",
         |    "state" : "not-checked",
         |    "hakukohde" : "form"
         |  }, {
         |    "attachment" : "8b40d098-da19-4017-9e39-23568ec18140",
         |    "state" : "not-checked",
         |    "hakukohde" : "form"
         |  }, {
         |    "attachment" : "9d67450d-7f2a-4d25-8070-ec360c912fdb",
         |    "state" : "not-checked",
         |    "hakukohde" : "form"
         |  }, {
         |    "attachment" : "ac90b133-1c67-4850-b24c-eb513d509a5c",
         |    "state" : "not-checked",
         |    "hakukohde" : "form"
         |  }, {
         |    "attachment" : "b04bc60f-2c1a-4e6b-8919-f7269a63ccf8",
         |    "state" : "not-checked",
         |    "hakukohde" : "form"
         |  }, {
         |    "attachment" : "b2e6ddc3-f571-4937-8444-8042a6b725fe",
         |    "state" : "not-checked",
         |    "hakukohde" : "form"
         |  }, {
         |    "attachment" : "c5bbd06e-01b1-4b29-af79-5e93da966940",
         |    "state" : "not-checked",
         |    "hakukohde" : "form"
         |  }, {
         |    "attachment" : "c6e4b7d5-7d5e-4c79-b0be-ac8bd2db8b76",
         |    "state" : "not-checked",
         |    "hakukohde" : "form"
         |  }, {
         |    "attachment" : "e5a0fcdc-7d82-4dfb-8919-e894020d8bcf",
         |    "state" : "not-checked",
         |    "hakukohde" : "form"
         |  } ],
         |  "hakemusKoskee" : 0,
         |  "asiatunnus" : "OPH-122-2025",
         |  "kirjausPvm" : "2025-08-19T07:10:39.874",
         |  "esittelyPvm" : null,
         |  "paatosPvm" : null,
         |  "esittelijaOid" : "1.2.246.562.24.00000000000000006666",
         |  "ataruHakemuksenTila" : "KasittelyMaksettu",
         |  "kasittelyVaihe" : "AlkukasittelyKesken",
         |  "muutosHistoria" : [ {
         |    "role" : "Esittelija",
         |    "time" : "2025-06-17T10:02:20.473",
         |    "modifiedBy" : "Esko Esittelijä"
         |  }, {
         |    "role" : "Hakija",
         |    "time" : "2025-06-17T15:19:44.23",
         |    "modifiedBy" : "Tatu Hakija"
         |  }, {
         |    "role" : "Esittelija",
         |    "time" : "2025-06-18T05:57:18.866",
         |    "modifiedBy" : "Esko Esittelijä"
         |  } ],
         |  "taydennyspyyntoLahetetty" : null,
         |  "yhteistutkinto" : true,
         |  "tutkinnot" : [
         |    {
         |      "hakemusId" : $hakemusId,
         |      "jarjestys" : "1",
         |      "nimi" : "Päälikkö",
         |      "oppilaitos" : "Butan Amattikoulu",
         |      "aloitusVuosi" : 1999,
         |      "paattymisVuosi" : 2000,
         |      "maakoodi" : "762",
         |      "muuTutkintoTieto" : null,
         |      "todistuksenPaivamaara" : null,
         |      "koulutusalaKoodi" : null,
         |      "paaaaineTaiErikoisala" : null,
         |      "todistusOtsikko": "examensbevis",
         |      "muuTutkintoMuistioId" : null
         |    },
         |    {
         |      "hakemusId" : $hakemusId,
         |      "jarjestys" : "2",
         |      "nimi" : "Johto tehtävä",
         |      "oppilaitos" : "Johto koulu",
         |      "aloitusVuosi" : 2006,
         |      "paattymisVuosi" : 2007,
         |      "maakoodi" : "762",
         |      "muuTutkintoTieto" : null,
         |      "todistuksenPaivamaara" : null,
         |      "koulutusalaKoodi" : null,
         |      "paaaaineTaiErikoisala" : null,
         |      "todistusOtsikko": "ovrigbevis",
         |      "muuTutkintoMuistioId" : null
         |    },
         |    {
         |      "hakemusId" : $hakemusId,
         |      "jarjestys" : "3",
         |      "nimi" : "Apu poika",
         |      "oppilaitos" : "Apu koulu",
         |      "aloitusVuosi" : 2010,
         |      "paattymisVuosi" : 2011,
         |      "maakoodi": "762",
         |      "muuTutkintoTieto" : null,
         |      "todistuksenPaivamaara" : null,
         |      "koulutusalaKoodi" : null,
         |      "paaaaineTaiErikoisala" : null,
         |      "todistusOtsikko": null,
         |      "muuTutkintoMuistioId" : null
         |    },
         |    {
         |      "hakemusId" : $hakemusId,
         |      "jarjestys" : "MUU",
         |      "nimi" : null,
         |      "oppilaitos" : null,
         |      "aloitusVuosi" : null,
         |      "paattymisVuosi" : null,
         |      "maakoodi" : null,
         |      "muuTutkintoTieto" : "olem lisäksi suorittanut onnistunesti\n\n- elämän koulun perus ja ja jatko opintoja monia kymmeniä,,,, opintoviikoja\n\n\nsekä:\n\nesi merkiksi rippi koulun!!!!111",
         |      "todistuksenPaivamaara" : null,
         |      "koulutusalaKoodi" : null,
         |      "paaaaineTaiErikoisala" : null,
         |      "todistusOtsikko": null,
         |      "muuTutkintoMuistioId" : null
         |    }
         |  ]
         |}""".stripMargin

    val hakemus = mockMvc
      .perform(
        get("/api/hakemus/1.2.246.562.11.00000000000000006670")
          .`with`(csrf())
          .contentType(MediaType.APPLICATION_JSON)
      )
      .andExpect(status().isOk)
      .andExpect(content().contentType(MediaType.APPLICATION_JSON))
      .andExpect(content().json(expectedResult))
  }

  @Test
  @Order(16)
  @WithMockUser(
    value = esittelijaOidString,
    authorities = Array(SecurityConstants.SECURITY_ROOLI_ESITTELIJA_FULL)
  )
  def paivitaOrPoistaPartialHakemusWithTutkinnotValidRequestReturns200(): Unit = {
    initAtaruHakemusRequests()
    when(hakemuspalveluService.haeHakemus(any[HakemusOid]))
      .thenReturn(Right(loadJson("ataruHakemus6670.json")))

    val hakemusId = hakemusRepository.haeHakemus(HakemusOid("1.2.246.562.11.00000000000000006670")).get.id

    val tutkinnot = hakemusRepository.haeTutkinnotHakemusIdilla(hakemusId)

    var requestJson =
      s"""{"tutkinnot" : [
         |    {
         |      "id" : "${tutkinnot.head.id.get}",
         |      "hakemusId" : "${hakemusId}",
         |      "jarjestys" : "1",
         |      "nimi" : "Päälikkö",
         |      "oppilaitos" : "Butan Amattikoulu",
         |      "aloitusVuosi" : 1999,
         |      "paattymisVuosi" : 2000,
         |      "maakoodi" : "762",
         |      "muuTutkintoTieto" : null,
         |      "todistuksenPaivamaara": "Helmikuu 2000",
         |      "koulutusalaKoodi" : "13",
         |      "paaaaineTaiErikoisala" : "erikoisala",
         |      "todistusOtsikko": "otsikko",
         |      "muuTutkintoMuistioId" : null
         |    },
         |    {
         |      "id" : "${tutkinnot(1).id.get}",
         |      "hakemusId" : "${hakemusId}",
         |      "jarjestys" : "2",
         |      "nimi" : "Erityis Johto tehtävä",
         |      "oppilaitos" : "Hankken Johto koulu",
         |      "aloitusVuosi" : 2024,
         |      "paattymisVuosi" : 2025,
         |      "maakoodi" : "100",
         |      "muuTutkintoTieto" : null
         |    },
         |    {
         |      "id" : "${tutkinnot(2).id.get}",
         |      "hakemusId" : "$hakemusId",
         |      "jarjestys" : "3",
         |      "nimi" : "Apu poika",
         |      "oppilaitos" : "Apu koulu",
         |      "aloitusVuosi" : 2010,
         |      "paattymisVuosi" : 2011,
         |      "maakoodi": "762",
         |      "muuTutkintoTieto" : null
         |    },
         |    {
         |      "id" : "${tutkinnot.last.id.get}",
         |      "hakemusId" : "$hakemusId",
         |      "jarjestys" : "MUU",
         |      "nimi" : null,
         |      "oppilaitos" : null,
         |      "aloitusVuosi" : null,
         |      "paattymisVuosi" : null,
         |      "maakoodi" : null,
         |      "muuTutkintoTieto" : "En olekaan suorittanutkoulutusta"
         |    }
         |  ]}}""".stripMargin

    mockMvc
      .perform(
        patch("/api/hakemus/1.2.246.562.11.00000000000000006670")
          .`with`(csrf())
          .contentType(MediaType.APPLICATION_JSON)
          .content(requestJson)
      )
      .andExpect(status().isOk)

    var paivitettyHakemus = hakemusService.haeHakemus(HakemusOid("1.2.246.562.11.00000000000000006670"))
    assert(paivitettyHakemus.get.tutkinnot.head.todistuksenPaivamaara.contains("Helmikuu 2000"))
    assert(paivitettyHakemus.get.tutkinnot.head.koulutusalaKoodi.contains("13"))
    assert(paivitettyHakemus.get.tutkinnot.head.paaaaineTaiErikoisala.contains("erikoisala"))
    assert(paivitettyHakemus.get.tutkinnot.head.todistusOtsikko.contains("otsikko"))

    assert(paivitettyHakemus.get.tutkinnot(1).nimi.contains("Erityis Johto tehtävä"))
    assert(paivitettyHakemus.get.tutkinnot(1).oppilaitos.contains("Hankken Johto koulu"))
    assert(paivitettyHakemus.get.tutkinnot(1).aloitusVuosi.contains(2024))
    assert(paivitettyHakemus.get.tutkinnot(1).paattymisVuosi.contains(2025))
    assert(paivitettyHakemus.get.tutkinnot(1).maakoodi.contains("100"))

    requestJson = s"""{"tutkinnot" : [
                     |    {
                     |      "id" : "${tutkinnot.head.id.get}",
                     |      "hakemusId" : "${hakemusId}",
                     |      "jarjestys" : "1",
                     |      "nimi" : "Päälikkö",
                     |      "oppilaitos" : "Butan Amattikoulu",
                     |      "aloitusVuosi" : 1999,
                     |      "paattymisVuosi" : 2000,
                     |      "maakoodi" : "762",
                     |      "muuTutkintoTieto" : null,
                     |      "todistuksenPaivamaara" : null,
                     |      "koulutusalaKoodi" : null,
                     |      "paaaaineTaiErikoisala" : null,
                     |      "todistusOtsikko": null,
                     |      "muuTutkintoMuistioId" : null
                     |    },
                     |    {
                     |      "id" : "${tutkinnot(2).id.get}",
                     |      "hakemusId" : "$hakemusId",
                     |      "jarjestys" : "3",
                     |      "nimi" : "Apu poika",
                     |      "oppilaitos" : "Apu koulu",
                     |      "aloitusVuosi" : 2010,
                     |      "paattymisVuosi" : 2011,
                     |      "maakoodi": "762",
                     |      "muuTutkintoTieto" : null,
                     |      "todistuksenPaivamaara" : null,
                     |      "koulutusalaKoodi" : null,
                     |      "paaaaineTaiErikoisala" : null,
                     |      "todistusOtsikko": null,
                     |      "muuTutkintoMuistioId" : null
                     |    },
                     |    {
                     |      "id" : "${tutkinnot.last.id.get}",
                     |      "hakemusId" : "$hakemusId",
                     |      "jarjestys" : "MUU",
                     |      "nimi" : null,
                     |      "oppilaitos" : null,
                     |      "aloitusVuosi" : null,
                     |      "paattymisVuosi" : null,
                     |      "maakoodi" : null,
                     |      "muuTutkintoTieto" : "En olekaan suorittanutkoulutusta",
                     |      "todistuksenPaivamaara" : null,
                     |      "koulutusalaKoodi" : null,
                     |      "paaaaineTaiErikoisala" : null,
                     |      "todistusOtsikko": null,
                     |      "muuTutkintoMuistioId" : null
                     |    }
                     |  ]}}""".stripMargin

    mockMvc
      .perform(
        patch("/api/hakemus/1.2.246.562.11.00000000000000006670")
          .`with`(csrf())
          .contentType(MediaType.APPLICATION_JSON)
          .content(requestJson)
      )
      .andExpect(status().isOk)

    paivitettyHakemus = hakemusService.haeHakemus(HakemusOid("1.2.246.562.11.00000000000000006670"))

    assert(paivitettyHakemus.get.tutkinnot.size == 3)
    assert(paivitettyHakemus.get.tutkinnot.head.jarjestys == "1")
    assert(paivitettyHakemus.get.tutkinnot(1).jarjestys == "2")
    assert(paivitettyHakemus.get.tutkinnot(2).jarjestys == "MUU")

    // Testissä on 2 eri päivitystä, joten auditlogia tulee kutsua 2 kertaa
    verify(auditLog, times(2)).logChanges(any(), any(), eqTo(AuditOperation.UpdateHakemus), any())
  }
}
