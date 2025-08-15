package fi.oph.tutu.backend

import com.fasterxml.jackson.databind.{ObjectMapper, SerializationFeature}
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule
import com.fasterxml.jackson.module.scala.DefaultScalaModule
import fi.oph.tutu.backend.domain.*
import fi.oph.tutu.backend.domain.AsiakirjamalliLahde.*
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

  @Autowired
  var esittelijaRepository: EsittelijaRepository = _

  @Autowired
  var hakemusRepository: HakemusRepository = _

  @Autowired
  var hakemusService: HakemusService = _

  @MockitoBean
  var kayttooikeusService: KayttooikeusService = _

  @Autowired
  var userService: UserService = _

  final val esittelijaOidString = "1.2.246.562.24.00000000000000006666"

  var esittelija: Option[DbEsittelija] = None
  @BeforeAll def setup(): Unit         = {
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
  @Order(1)
  @WithMockUser(
    value = esittelijaOidString,
    authorities = Array(SecurityConstants.SECURITY_ROOLI_ESITTELIJA_FULL)
  )
  def luoHakemusValidRequestWithoutEsittelijaReturns200(): Unit = {
    val requestJson =
      """{
          "hakemusOid": "1.2.246.562.11.00000000000000006666",
          "maakoodi": "0008",
          "hakemusKoskee": 1
          }"""

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
    val requestJson =
      """{
          "hakemusOid": "1.2.246.562.11.00000000000000006665",
          "maakoodi": "0008",
          "hakemusKoskee": 0
          }"""

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
                                "kasittelyVaihe": "AlkukasittelyKesken",
                                "taydennyspyyntoLahetetty": null
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
    val virkailijaOid = UserOid("1.2.246.562.24.00000000000000006666")
    hakemusRepository.luoPyydettavaAsiakirja(
      HakemusOid("1.2.246.562.11.00000000000000006667"),
      "tutkintotodistustenjaljennokset",
      virkailijaOid
    )
    hakemusRepository.luoPyydettavaAsiakirja(
      HakemusOid("1.2.246.562.11.00000000000000006667"),
      "tyotodistukset",
      virkailijaOid
    )
    val dbHakemus    = hakemusRepository.haeHakemus(HakemusOid("1.2.246.562.11.00000000000000006667"))
    val malliAction1 = hakemusRepository.lisaaAsiakirjamalli(
      dbHakemus.get.id,
      AsiakirjamalliTutkinnosta(ece, true, Some("Jotain kuvausta")),
      virkailijaOid
    )
    val malliAction2 = hakemusRepository.lisaaAsiakirjamalli(
      dbHakemus.get.id,
      AsiakirjamalliTutkinnosta(aacrao, false, Some("Jotain muuta kuvausta")),
      virkailijaOid
    )
    hakemusRepository.db.run(hakemusRepository.combineIntDBIOs(Seq(malliAction1, malliAction2)), "lisaaAsiakirjamalli")
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
                                "apHakemus": false,
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
                                  "modifiedBy": "Esko Esittelijä"}],
                                  "taydennyspyyntoLahetetty": null,
                                  "muokattu": null,
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
                                      } }
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

    // Päivitetään AP-hakemus
    updatedHakemus = PartialHakemus(
      apHakemus = Some(true)
    )
    paivitettyHakemus = updateHakemus(HakemusOid("1.2.246.562.11.00000000000000006670"), updatedHakemus)
    assert(paivitettyHakemus.apHakemus.contains(true))

    // Päivitetään yhteistutkinto
    updatedHakemus = PartialHakemus(
      yhteistutkinto = Some(true)
    )
    paivitettyHakemus = updateHakemus(HakemusOid("1.2.246.562.11.00000000000000006670"), updatedHakemus)
    assert(paivitettyHakemus.yhteistutkinto.equals(true))
  }

  @Test
  @Order(12)
  @WithMockUser(
    value = esittelijaOidString,
    authorities = Array(SecurityConstants.SECURITY_ROOLI_ESITTELIJA_FULL)
  )
  def paivitaHakemusValidRequestReturns200WithChangedPyydettavatAsiakirjat(): Unit = {
    initAtaruHakemusRequests()

    // Lisätään asiakirja
    var updatedHakemus = PartialHakemus(
      pyydettavatAsiakirjat = Some(Seq(PyydettavaAsiakirja(None, "tutkintotodistustenjaljennokset")))
    )
    var paivitettyHakemus = updateHakemus(HakemusOid("1.2.246.562.11.00000000000000006670"), updatedHakemus)
    assert(paivitettyHakemus.pyydettavatAsiakirjat.size == 1)

    // Lisätään toinen asiakirja
    var hakemuksenAsiakirjat =
      hakemusRepository
        .haePyydettavatAsiakirjatHakemusOidilla(HakemusOid("1.2.246.562.11.00000000000000006670"))
        .concat(Seq(PyydettavaAsiakirja(None, "tyotodistukset")))

    updatedHakemus = PartialHakemus(
      pyydettavatAsiakirjat = Some(hakemuksenAsiakirjat)
    )
    paivitettyHakemus = updateHakemus(HakemusOid("1.2.246.562.11.00000000000000006670"), updatedHakemus)
    assert(paivitettyHakemus.pyydettavatAsiakirjat.size == 2)

    // Lisätään toinen asiakirja
    hakemuksenAsiakirjat = hakemusRepository
      .haePyydettavatAsiakirjatHakemusOidilla(HakemusOid("1.2.246.562.11.00000000000000006670"))
      .concat(Seq(PyydettavaAsiakirja(None, "tyotodistukset")))

    val uudetAsiakirjat =
      Seq(
        hakemuksenAsiakirjat.head,
        PyydettavaAsiakirja(hakemuksenAsiakirjat.last.id, "alkuperaisetliitteet")
      )

    updatedHakemus = PartialHakemus(
      pyydettavatAsiakirjat = Some(uudetAsiakirjat)
    )
    paivitettyHakemus = updateHakemus(HakemusOid("1.2.246.562.11.00000000000000006670"), updatedHakemus)
    assert(paivitettyHakemus.pyydettavatAsiakirjat.size == 2)
    assert(paivitettyHakemus.pyydettavatAsiakirjat.last.asiakirjanTyyppi == "alkuperaisetliitteet")

    // Poistetaan ensimmäinen asiakirja
    hakemuksenAsiakirjat = Seq(
      hakemusRepository
        .haePyydettavatAsiakirjatHakemusOidilla(HakemusOid("1.2.246.562.11.00000000000000006670"))
        .last
    )

    updatedHakemus = PartialHakemus(
      pyydettavatAsiakirjat = Some(hakemuksenAsiakirjat)
    )
    paivitettyHakemus = updateHakemus(HakemusOid("1.2.246.562.11.00000000000000006670"), updatedHakemus)
    assert(paivitettyHakemus.pyydettavatAsiakirjat.size == 1)
    assert(paivitettyHakemus.pyydettavatAsiakirjat.head.asiakirjanTyyppi == "alkuperaisetliitteet")

    // Poistetaan kaikki asiakirjat
    updatedHakemus = PartialHakemus(
      pyydettavatAsiakirjat = Some(Seq.empty[PyydettavaAsiakirja])
    )

    paivitettyHakemus = updateHakemus(HakemusOid("1.2.246.562.11.00000000000000006670"), updatedHakemus)
    assert(paivitettyHakemus.pyydettavatAsiakirjat.isEmpty)
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
      asiakirjamallitTutkinnoista = Some(
        Map(
          ece    -> AsiakirjamalliTutkinnosta(ece, true, Some("kuvaus1")),
          nuffic -> AsiakirjamalliTutkinnosta(nuffic, false, Some("kuvaus2")),
          aacrao -> AsiakirjamalliTutkinnosta(aacrao, true, None),
          muu    -> AsiakirjamalliTutkinnosta(muu, false, None)
        )
      )
    )
    var paivitettyHakemus = updateHakemus(HakemusOid("1.2.246.562.11.00000000000000006671"), updatedHakemus)
    var asiakirjamallit   = paivitettyHakemus.asiakirjamallitTutkinnoista
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
      asiakirjamallitTutkinnoista = Some(
        Map(
          ece          -> AsiakirjamalliTutkinnosta(ece, false, Some("editoitu kuvaus")),
          naric_portal -> AsiakirjamalliTutkinnosta(naric_portal, true, Some("naric kuvaus")),
          aacrao       -> AsiakirjamalliTutkinnosta(aacrao, false, None),
          muu          -> AsiakirjamalliTutkinnosta(muu, false, Some("uusi kuvaus"))
        )
      )
    )
    paivitettyHakemus = updateHakemus(HakemusOid("1.2.246.562.11.00000000000000006671"), updatedHakemus)
    asiakirjamallit = paivitettyHakemus.asiakirjamallitTutkinnoista
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
  }

  @Test
  @Order(13)
  @WithMockUser(
    value = esittelijaOidString,
    authorities = Array(SecurityConstants.SECURITY_ROOLI_ESITTELIJA_FULL)
  )
  def paivitaPartialHakemusWithIMIPyyntoValidRequestReturns200(): Unit = {
    initAtaruHakemusRequests()

    // imiPyynto = true
    var updatedHakemus = PartialHakemus(
      imiPyynto = Some(ImiPyynto(Some(true), null, null, null))
    )
    var requestJson =
      """{"imiPyynto":{
        |"imiPyynto":true,
        |"imiPyyntoNumero":null,
        |"imiPyyntoLahetetty":null,
        |"imiPyyntoVastattu":null}}""".stripMargin

    mockMvc
      .perform(
        patch("/api/hakemus/1.2.246.562.11.00000000000000006670")
          .`with`(csrf())
          .contentType(MediaType.APPLICATION_JSON)
          .content(requestJson)
      )
      .andExpect(status().isOk)

    var paivitettyHakemus = hakemusService.haeHakemus(HakemusOid("1.2.246.562.11.00000000000000006670"))
    assert(paivitettyHakemus.get.imiPyynto.imiPyynto.contains(true))

    // Loput IMI-kentät
    updatedHakemus = PartialHakemus(
      imiPyynto = Some(
        ImiPyynto(
          Some(true),
          Some("123-6P"),
          Some(LocalDateTime.parse("2025-08-06T00:00:00.000")),
          Some(LocalDateTime.parse("2025-08-15T00:00:00.000"))
        )
      )
    )
    requestJson = """{"imiPyynto": {
                    |"imiPyynto":true,
                    |"imiPyyntoNumero":"123-6P",
                    |"imiPyyntoLahetetty":"2025-08-06T00:00:00.000",
                    |"imiPyyntoVastattu":"2025-08-15T00:00:00.000"}}""".stripMargin

    mockMvc
      .perform(
        patch("/api/hakemus/1.2.246.562.11.00000000000000006670")
          .`with`(csrf())
          .contentType(MediaType.APPLICATION_JSON)
          .content(requestJson)
      )
      .andExpect(status().isOk)

    paivitettyHakemus = hakemusService.haeHakemus(HakemusOid("1.2.246.562.11.00000000000000006670"))
    assert(paivitettyHakemus.get.imiPyynto.imiPyynto.contains(true))
    assert(paivitettyHakemus.get.imiPyynto.imiPyyntoNumero.contains("123-6P"))
    assert(paivitettyHakemus.get.imiPyynto.imiPyyntoLahetetty.contains(LocalDateTime.parse("2025-08-06T00:00")))
    assert(paivitettyHakemus.get.imiPyynto.imiPyyntoVastattu.contains(LocalDateTime.parse("2025-08-15T00:00")))

    // imi-pyynto null -> Loput IMI-kentät pitäisi olla None
    updatedHakemus = PartialHakemus(
      imiPyynto = Some(
        ImiPyynto(
          None
        )
      )
    )
    requestJson = """{"imiPyynto":
                    |{"imiPyynto":null}}""".stripMargin

    mockMvc
      .perform(
        patch("/api/hakemus/1.2.246.562.11.00000000000000006670")
          .`with`(csrf())
          .contentType(MediaType.APPLICATION_JSON)
          .content(requestJson)
      )
      .andExpect(status().isOk)

    paivitettyHakemus = hakemusService.haeHakemus(HakemusOid("1.2.246.562.11.00000000000000006670"))
    assert(paivitettyHakemus.get.imiPyynto.imiPyynto.isEmpty)
    assert(paivitettyHakemus.get.imiPyynto.imiPyyntoNumero.isEmpty)
    assert(paivitettyHakemus.get.imiPyynto.imiPyyntoLahetetty.isEmpty)
    assert(paivitettyHakemus.get.imiPyynto.imiPyyntoVastattu.isEmpty)

    // IMI-kentät uudestaan sisään
    updatedHakemus = PartialHakemus(
      imiPyynto = Some(
        ImiPyynto(
          Some(true),
          Some("123-6P"),
          Some(LocalDateTime.parse("2025-08-06T00:00:00.000")),
          Some(LocalDateTime.parse("2025-08-15T00:00:00.000"))
        )
      )
    )
    requestJson = """{"imiPyynto": {
                    |"imiPyynto":true,
                    |"imiPyyntoNumero":"123-6P",
                    |"imiPyyntoLahetetty":"2025-08-06T00:00:00.000",
                    |"imiPyyntoVastattu":"2025-08-15T00:00:00.000"}}""".stripMargin

    mockMvc
      .perform(
        patch("/api/hakemus/1.2.246.562.11.00000000000000006670")
          .`with`(csrf())
          .contentType(MediaType.APPLICATION_JSON)
          .content(requestJson)
      )
      .andExpect(status().isOk)

    paivitettyHakemus = hakemusService.haeHakemus(HakemusOid("1.2.246.562.11.00000000000000006670"))
    assert(paivitettyHakemus.get.imiPyynto.imiPyynto.contains(true))
    assert(paivitettyHakemus.get.imiPyynto.imiPyyntoNumero.contains("123-6P"))
    assert(paivitettyHakemus.get.imiPyynto.imiPyyntoLahetetty.contains(LocalDateTime.parse("2025-08-06T00:00")))
    assert(paivitettyHakemus.get.imiPyynto.imiPyyntoVastattu.contains(LocalDateTime.parse("2025-08-15T00:00")))

    // Päivitetään joku toinen kenttä, tämä ei saa vaikuttaa IMI-kenttiin
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
    assert(paivitettyHakemus.get.imiPyynto.imiPyynto.contains(true))
    assert(paivitettyHakemus.get.imiPyynto.imiPyyntoNumero.contains("123-6P"))
    assert(paivitettyHakemus.get.imiPyynto.imiPyyntoLahetetty.contains(LocalDateTime.parse("2025-08-06T00:00")))
    assert(paivitettyHakemus.get.imiPyynto.imiPyyntoVastattu.contains(LocalDateTime.parse("2025-08-15T00:00")))

    // imi-pyynto false -> Loput IMI-kentät pitäisi olla None
    updatedHakemus = PartialHakemus(
      imiPyynto = Some(
        ImiPyynto(
          Some(false)
        )
      )
    )
    requestJson = """{"imiPyynto":{
                    |"imiPyynto":false,
                    |"imiPyyntoNumero":"123-6P",
                    |"imiPyyntoLahetetty":"2025-08-06T00:00:00.000",
                    |"imiPyyntoVastattu":"2025-08-15T00:00:00.000"}}""".stripMargin

    mockMvc
      .perform(
        patch("/api/hakemus/1.2.246.562.11.00000000000000006670")
          .`with`(csrf())
          .contentType(MediaType.APPLICATION_JSON)
          .content(requestJson)
      )
      .andExpect(status().isOk)

    paivitettyHakemus = hakemusService.haeHakemus(HakemusOid("1.2.246.562.11.00000000000000006670"))
    assert(paivitettyHakemus.get.imiPyynto.imiPyynto.contains(false))
    assert(paivitettyHakemus.get.imiPyynto.imiPyyntoNumero.isEmpty)
    assert(paivitettyHakemus.get.imiPyynto.imiPyyntoLahetetty.isEmpty)
    assert(paivitettyHakemus.get.imiPyynto.imiPyyntoVastattu.isEmpty)
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
