package fi.oph.tutu.backend.controller

import fi.oph.tutu.backend.IntegrationTestBase
import fi.oph.tutu.backend.domain.*
import fi.oph.tutu.backend.domain.Direktiivitaso.{a_1384_2015_patevyystaso_1, b_1384_2015_patevyystaso_2}
import fi.oph.tutu.backend.domain.Ratkaisutyyppi.PeruutusTaiRaukeaminen
import fi.oph.tutu.backend.security.SecurityConstants
import fi.oph.tutu.backend.service.UserService
import fi.oph.tutu.backend.utils.{AuditLog, AuditOperation}
import org.junit.jupiter.api.*
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
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.{get, post}
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.{content, jsonPath, status}
import org.springframework.test.web.servlet.setup.{DefaultMockMvcBuilder, MockMvcBuilders, MockMvcConfigurer}
import org.springframework.web.context.WebApplicationContext

import java.util.UUID

@AutoConfigureMockMvc
@TestInstance(Lifecycle.PER_CLASS)
@ActiveProfiles(Array("test"))
@TestMethodOrder(classOf[OrderAnnotation])
class PaatosControllerTest extends IntegrationTestBase {
  @Autowired
  private val context: WebApplicationContext = null
  private var mvc: MockMvc                   = null

  @MockitoBean
  private var userService: UserService = _

  @MockitoBean
  private var auditLog: AuditLog = _

  val lomakeId               = 1527182
  val hakemusOid: HakemusOid = HakemusOid("1.2.246.562.11.00000000000000006666")
  val hakemusOidWithPaatosTiedotJaRinnastettavatTutkinnotTaiOpinnot: HakemusOid = HakemusOid(
    "1.2.246.562.11.00000000000000006667"
  )
  val hakemusOidWithPaatosTiedotJaKelpoisuudet: HakemusOid = HakemusOid(
    "1.2.246.562.11.00000000000000006668"
  )

  var hakemusId: Option[UUID]                                                    = None
  var hakemusIdWithPaatosTiedotJaRinnastettavatTutkinnotTaiOpinnot: Option[UUID] = None
  var hakemusIdWithPaatosTiedotJaKelpoisuudet: Option[UUID]                      = None
  var paatosId: Option[UUID]                                                     = None
  var paatosId2: Option[UUID]                                                    = None
  var paatosTietoId: Option[UUID]                                                = None
  var paatosTietoId2: Option[UUID]                                               = None
  var paatos: Paatos                                                             = _
  var paatosWithPaatosTiedot: Paatos                                             = _
  var paatosWithPaatosTiedotJaRinnastettavatTutkinnotTaiOpinnot: Paatos          = _
  var paatosWithPaatosTiedotJaKelpoisuudet: Paatos                               = _

  var paatosTiedot: Seq[PaatosTieto] =
    Seq(
      makePaatosTieto(None)
    )

  private def makePaatos(givenHakemusId: Option[UUID]): Paatos = {
    val ratkaisutyyppi = pick(Ratkaisutyyppi.values.map(Some(_)) ++ None)
    Paatos(
      hakemusId = givenHakemusId,
      ratkaisutyyppi = ratkaisutyyppi,
      seutArviointi = pickBoolean,
      peruutuksenTaiRaukeamisenSyy =
        if (ratkaisutyyppi.contains(PeruutusTaiRaukeaminen))
          Some(
            PeruutuksenTaiRaukeamisenSyy(
              eiSaaHakemaansaEikaHaluaPaatostaJonkaVoisiSaada = pickBooleanOption,
              muutenTyytymatonRatkaisuun = pickBooleanOption,
              eiApMukainenTutkintoTaiHaettuaPatevyytta = pickBooleanOption,
              eiTasoltaanVastaaSuomessaSuoritettavaaTutkintoa = pickBooleanOption,
              epavirallinenKorkeakouluTaiTutkinto = pickBooleanOption,
              eiEdellytyksiaRoEikaTasopaatokselle = pickBooleanOption,
              eiEdellytyksiaRinnastaaTiettyihinKkOpintoihin = pickBooleanOption,
              hakijallaJoPaatosSamastaKoulutusKokonaisuudesta = pickBooleanOption,
              muuSyy = pickBooleanOption
            )
          )
        else None,
      paatosTiedot = Seq.empty
    )
  }

  private def makePaatosWithPaatosTiedot(
    givenHakemusId: Option[UUID]
  ): Paatos = {
    val ratkaisutyyppi = Ratkaisutyyppi.Paatos
    Paatos(
      hakemusId = givenHakemusId,
      ratkaisutyyppi = Some(ratkaisutyyppi),
      seutArviointi = pickBoolean,
      peruutuksenTaiRaukeamisenSyy = None,
      paatosTiedot = paatosTiedot
    )
  }

  private def makePaatosTieto(paatosId: Option[UUID]): PaatosTieto = {
    PaatosTieto(
      id = None,
      paatosId = paatosId,
      paatosTyyppi = Some(PaatosTyyppi.Kelpoisuus),
      sovellettuLaki = Some(SovellettuLaki.ap_seut),
      tutkintoId = None,
      lisaaTutkintoPaatostekstiin = None,
      myonteinenPaatos = None,
      myonteisenPaatoksenLisavaatimukset = Some("{}"),
      kielteisenPaatoksenPerustelut = Some("{}"),
      tutkintoTaso = Some(TutkintoTaso.YlempiKorkeakoulu)
    )
  }

  private def makePaatosWithPaatosTiedotJaRinnastettavatTutkinnotTaiOpinnot(
    givenHakemusId: Option[UUID],
    givenPaatosId: Option[UUID],
    givenPaatosTietoId: Option[UUID]
  ): Paatos = {
    val ratkaisutyyppi = Ratkaisutyyppi.Paatos
    Paatos(
      id = givenPaatosId,
      hakemusId = givenHakemusId,
      ratkaisutyyppi = Some(ratkaisutyyppi),
      seutArviointi = pickBoolean,
      peruutuksenTaiRaukeamisenSyy = None,
      paatosTiedot = Seq(
        makePaatosTieto(givenPaatosId).copy(
          id = givenPaatosTietoId,
          paatosTyyppi = Some(PaatosTyyppi.TiettyTutkintoTaiOpinnot),
          rinnastettavatTutkinnotTaiOpinnot = Seq(
            TutkintoTaiOpinto(
              id = None,
              paatostietoId = givenPaatosTietoId,
              tutkintoTaiOpinto = Some("testi"),
              myonteinenPaatos = None,
              myonteisenPaatoksenLisavaatimukset = Some("{}"),
              kielteisenPaatoksenPerustelut = Some("{}")
            )
          )
        )
      )
    )
  }

  private def makePaatosWithPaatosTiedotJaKelpoisuudet(
    givenHakemusId: Option[UUID],
    givenPaatosId: Option[UUID],
    givenPaatosTietoId: Option[UUID]
  ): Paatos = {
    val ratkaisutyyppi = Ratkaisutyyppi.Paatos
    Paatos(
      id = givenPaatosId,
      hakemusId = givenHakemusId,
      ratkaisutyyppi = Some(ratkaisutyyppi),
      seutArviointi = pickBoolean,
      peruutuksenTaiRaukeamisenSyy = None,
      paatosTiedot = Seq(
        makePaatosTieto(givenPaatosId).copy(
          id = givenPaatosTietoId,
          kelpoisuudet = Seq(
            Kelpoisuus(
              id = None,
              paatostietoId = givenPaatosTietoId,
              kelpoisuus = Some("kelpotesti"),
              opetettavaAine = Some("latina"),
              muuAmmattiKuvaus = None,
              direktiivitaso = Some(a_1384_2015_patevyystaso_1),
              kansallisestiVaadittavaDirektiivitaso = Some(b_1384_2015_patevyystaso_2),
              direktiivitasoLisatiedot = randomStringOption,
              myonteinenPaatos = None,
              myonteisenPaatoksenLisavaatimukset = Some("{}"),
              kielteisenPaatoksenPerustelut = Some("{}")
            )
          )
        )
      )
    )
  }

  private def paatos2Json(paatos: Paatos, ignoreFields: String*): String = {
    val paatosTiedotAsMap =
      if (paatos.paatosTiedot.nonEmpty)
        paatos.paatosTiedot.map { pt =>
          pt.productElementNames.toList.zip(pt.productIterator.toList).toMap -- ignoreFields
        }
      else
        Seq.empty

    val paatosAsMap = paatos.productElementNames.toList
      .zip(paatos.productIterator.toList)
      .toMap -- ignoreFields + ("paatosTiedot" -> paatosTiedotAsMap)
    mapper.writeValueAsString(paatosAsMap)
  }

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
        None,
        asiakirjaRepository.tallennaUudetAsiakirjatiedot(Asiakirja(), "testi"),
        "testi"
      )
    )
    hakemusIdWithPaatosTiedotJaRinnastettavatTutkinnotTaiOpinnot = Some(
      hakemusRepository.tallennaHakemus(
        hakemusOidWithPaatosTiedotJaRinnastettavatTutkinnotTaiOpinnot,
        1,
        None,
        asiakirjaRepository.tallennaUudetAsiakirjatiedot(Asiakirja(), "testi"),
        "testi"
      )
    )
    hakemusIdWithPaatosTiedotJaKelpoisuudet = Some(
      hakemusRepository.tallennaHakemus(
        hakemusOidWithPaatosTiedotJaKelpoisuudet,
        1,
        None,
        asiakirjaRepository.tallennaUudetAsiakirjatiedot(Asiakirja(), "testi"),
        "testi"
      )
    )
    paatosId = Some(
      paatosRepository
        .tallennaPaatos(
          hakemusIdWithPaatosTiedotJaRinnastettavatTutkinnotTaiOpinnot.get,
          makePaatosWithPaatosTiedot(hakemusIdWithPaatosTiedotJaRinnastettavatTutkinnotTaiOpinnot),
          "test user"
        )
        .id
        .get
    )
    paatosId2 = Some(
      paatosRepository
        .tallennaPaatos(
          hakemusIdWithPaatosTiedotJaKelpoisuudet.get,
          makePaatosWithPaatosTiedot(hakemusIdWithPaatosTiedotJaKelpoisuudet),
          "test user"
        )
        .id
        .get
    )
    paatosRepository.tallennaPaatosTieto(paatosId.get, makePaatosTieto(paatosId), "test user")
    paatosTietoId = Some(paatosRepository.haePaatosTiedot(paatosId.get).head.id.get)
    paatosRepository.tallennaPaatosTieto(paatosId2.get, makePaatosTieto(paatosId2), "test user")
    paatosTietoId2 = Some(paatosRepository.haePaatosTiedot(paatosId2.get).head.id.get)
    paatos = makePaatos(hakemusId)
    paatosWithPaatosTiedot = makePaatosWithPaatosTiedot(
      hakemusId
    )
    paatosWithPaatosTiedotJaRinnastettavatTutkinnotTaiOpinnot =
      makePaatosWithPaatosTiedotJaRinnastettavatTutkinnotTaiOpinnot(
        hakemusIdWithPaatosTiedotJaRinnastettavatTutkinnotTaiOpinnot,
        paatosId,
        paatosTietoId
      )
    paatosWithPaatosTiedotJaKelpoisuudet = makePaatosWithPaatosTiedotJaKelpoisuudet(
      hakemusIdWithPaatosTiedotJaRinnastettavatTutkinnotTaiOpinnot,
      paatosId2,
      paatosTietoId2
    )
  }

  @BeforeEach
  def initMocks(): Unit = {
    when(
      userService.getEnrichedUserDetails(any)
    ).thenReturn(
      User(
        userOid = "test user",
        authorities = List()
      )
    )
    initAtaruHakemusRequests()
  }
  @Test
  @WithMockUser(value = "kayttaja", authorities = Array(SecurityConstants.SECURITY_ROOLI_ESITTELIJA_FULL))
  @Order(1)
  def tallennaPaatosPalauttaa200JaKantaanTallennetunDatan(): Unit = {
    val paatosJSON = paatos2Json(paatos, "id", "luoja", "luotu", "muokattu", "muokkaaja")
    mvc
      .perform(
        post(s"/api/paatos/$hakemusOid/$lomakeId")
          .`with`(csrf())
          .contentType(MediaType.APPLICATION_JSON)
          .content(paatosJSON)
      )
      .andExpect(status().isOk)
      .andExpect(jsonPath("$.id").isString)
      .andExpect(content().json(paatosJSON))
    verify(auditLog, times(1)).logChanges(any(), any(), eqTo(AuditOperation.UpdatePaatos), any())
  }

  @Test
  @WithMockUser(value = "kayttaja", authorities = Array(SecurityConstants.SECURITY_ROOLI_ESITTELIJA_FULL))
  @Order(2)
  def haePaatosPalauttaa200(): Unit = {
    val paatosId   = paatosRepository.haePaatos(hakemusId.get).get.id
    val paatosJSON =
      paatos2Json(
        paatos.copy(id = paatosId, luoja = Some("test user")),
        "id",
        "luotu",
        "muokattu",
        "muokkaaja",
        "paatosTietoOptions"
      )
    mvc
      .perform(
        get(s"/api/paatos/$hakemusOid/$lomakeId")
      )
      .andExpect(status().isOk)
      .andExpect(jsonPath("$.id").isString)
      .andExpect(content().json(paatosJSON))
    verify(auditLog, times(1)).logRead(any(), any(), eqTo(AuditOperation.ReadPaatos), any())
  }

  @Test
  @WithMockUser(value = "kayttaja", authorities = Array(SecurityConstants.SECURITY_ROOLI_ESITTELIJA_FULL))
  @Order(3)
  def haePaatosPalauttaa404KunPaatosEiKannassa(): Unit = {
    mvc
      .perform(
        get(s"/api/paatos/${HakemusOid("1.2.246.562.11.00000000000000009999")}/$lomakeId")
      )
      .andExpect(status().isNotFound)
    verify(auditLog, times(0)).logRead(any(), any(), eqTo(AuditOperation.ReadPaatos), any())
  }

  @Test
  @WithMockUser(value = "kayttaja", authorities = Array(SecurityConstants.SECURITY_ROOLI_ESITTELIJA_FULL))
  @Order(4)
  def tallennaPaatosPalauttaa500KunHakemusEiKannassa(): Unit = {
    val paatosJSON = paatos2Json(paatos, "id", "luoja", "luotu", "muokattu", "muokkaaja", "paatosTietoOptions")
    mvc
      .perform(
        post(s"/api/paatos/${HakemusOid("1.2.246.562.11.00000000000000009999")}/$lomakeId")
          .`with`(csrf())
          .contentType(MediaType.APPLICATION_JSON)
          .content(paatosJSON)
      )
      .andExpect(status().isInternalServerError)
    verify(auditLog, times(0)).logChanges(any(), any(), eqTo(AuditOperation.UpdatePaatos), any())
  }

  @Test
  @WithMockUser(value = "kayttaja", authorities = Array(SecurityConstants.SECURITY_ROOLI_ESITTELIJA_FULL))
  @Order(5)
  def tallennaPaatosPalauttaaPaatosTiedonKanssa200JaKantaanTallennetunDatan(): Unit = {
    val paatosJSON =
      paatos2Json(
        paatosWithPaatosTiedot,
        "id",
        "luoja",
        "luotu",
        "muokattu",
        "muokkaaja",
        "paatosId",
        "paatosTietoOptions"
      )
    mvc
      .perform(
        post(s"/api/paatos/$hakemusOid/$lomakeId")
          .`with`(csrf())
          .contentType(MediaType.APPLICATION_JSON)
          .content(paatosJSON)
      )
      .andExpect(status().isOk)
      .andExpect(jsonPath("$.id").isString)
      .andExpect(jsonPath("$.paatosTiedot[0].id").isString)
      .andExpect(content().json(paatosJSON))
    verify(auditLog, times(1)).logChanges(any(), any(), eqTo(AuditOperation.UpdatePaatos), any())
  }

  @Test
  @WithMockUser(value = "kayttaja", authorities = Array(SecurityConstants.SECURITY_ROOLI_ESITTELIJA_FULL))
  @Order(6)
  def haePaatosPalauttaaPaatosTiedonKanssa200(): Unit = {
    val paatosId   = paatosRepository.haePaatos(hakemusId.get).get.id
    val paatosJSON =
      paatos2Json(
        paatosWithPaatosTiedot.copy(id = paatosId, luoja = Some("test user"), paatosTiedot = paatosTiedot),
        "id",
        "luoja",
        "luotu",
        "muokattu",
        "muokkaaja",
        "paatosId",
        "paatosTietoOptions"
      )
    mvc
      .perform(
        get(s"/api/paatos/$hakemusOid/$lomakeId")
      )
      .andExpect(status().isOk)
      .andExpect(jsonPath("$.id").isString)
      .andExpect(jsonPath("$.paatosTiedot[0].id").isString)
      .andExpect(jsonPath("$.paatosTiedot[0].lisaaTutkintoPaatostekstiin").isEmpty)
      .andExpect(content().json(paatosJSON))
    verify(auditLog, times(1)).logRead(any(), any(), eqTo(AuditOperation.ReadPaatos), any())
  }

  @Test
  @WithMockUser(value = "kayttaja", authorities = Array(SecurityConstants.SECURITY_ROOLI_ESITTELIJA_FULL))
  @Order(7)
  def tallennaPaatosPalauttaaPaatosTiedonJaRinnastettavienTutkintojenTaiOpintoKanssa200JaKantaanTallennetunDatan()
    : Unit = {
    val paatosJSON =
      paatos2Json(
        paatosWithPaatosTiedotJaRinnastettavatTutkinnotTaiOpinnot,
        "luoja",
        "luotu",
        "muokattu",
        "muokkaaja",
        "paatosTietoOptions"
      )
    val result = mvc
      .perform(
        post(s"/api/paatos/$hakemusOidWithPaatosTiedotJaRinnastettavatTutkinnotTaiOpinnot/$lomakeId")
          .`with`(csrf())
          .contentType(MediaType.APPLICATION_JSON)
          .content(paatosJSON)
      )
      .andExpect(status().isOk)
      .andExpect(jsonPath("$.id").isString)
      .andExpect(jsonPath("$.paatosTiedot[0].id").isString)
      .andExpect(jsonPath("$.paatosTiedot[0].rinnastettavatTutkinnotTaiOpinnot[0].id").isString)
      .andExpect(jsonPath("$.paatosTiedot[0].rinnastettavatTutkinnotTaiOpinnot[0].tutkintoTaiOpinto").value("testi"))
    verify(auditLog, times(1)).logChanges(any(), any(), eqTo(AuditOperation.UpdatePaatos), any())
  }

  @Test
  @WithMockUser(value = "kayttaja", authorities = Array(SecurityConstants.SECURITY_ROOLI_ESITTELIJA_FULL))
  @Order(8)
  def haePaatosPalauttaaPaatosTiedonJaRinnastettavienTutkintojenTaiOpintoKanssa200(): Unit = {
    val paatosId   = paatosRepository.haePaatos(hakemusIdWithPaatosTiedotJaRinnastettavatTutkinnotTaiOpinnot.get).get.id
    val paatosJSON =
      paatos2Json(
        paatosWithPaatosTiedotJaRinnastettavatTutkinnotTaiOpinnot.copy(id = paatosId, luoja = Some("test user")),
        "id",
        "luoja",
        "luotu",
        "muokattu",
        "muokkaaja",
        "paatosId",
        "paatosTietoOptions"
      )
    var result = mvc
      .perform(
        get(s"/api/paatos/$hakemusOidWithPaatosTiedotJaRinnastettavatTutkinnotTaiOpinnot/$lomakeId")
      )
      .andExpect(status().isOk)
      .andExpect(jsonPath("$.id").isString)
      .andExpect(jsonPath("$.paatosTiedot[0].id").isString)
      .andExpect(jsonPath("$.paatosTiedot[0].rinnastettavatTutkinnotTaiOpinnot[0].id").isString)
      .andExpect(jsonPath("$.paatosTiedot[0].rinnastettavatTutkinnotTaiOpinnot[0].tutkintoTaiOpinto").value("testi"))

    verify(auditLog, times(1)).logRead(any(), any(), eqTo(AuditOperation.ReadPaatos), any())
  }

  @Test
  @WithMockUser(value = "kayttaja", authorities = Array(SecurityConstants.SECURITY_ROOLI_ESITTELIJA_FULL))
  @Order(9)
  def tallennaPaatosPalauttaaPaatosTiedonJaKelpoisuudenKanssa200JaKantaanTallennetunDatan(): Unit = {
    val paatosJSON =
      paatos2Json(
        paatosWithPaatosTiedotJaKelpoisuudet,
        "luoja",
        "luotu",
        "muokattu",
        "muokkaaja",
        "paatosTietoOptions"
      )
    val result = mvc
      .perform(
        post(s"/api/paatos/$hakemusOidWithPaatosTiedotJaKelpoisuudet/$lomakeId")
          .`with`(csrf())
          .contentType(MediaType.APPLICATION_JSON)
          .content(paatosJSON)
      )
      .andExpect(status().isOk)
      .andExpect(jsonPath("$.id").isString)
      .andExpect(jsonPath("$.paatosTiedot[0].id").isString)
      .andExpect(jsonPath("$.paatosTiedot[0].kelpoisuudet[0].id").isString)
      .andExpect(jsonPath("$.paatosTiedot[0].kelpoisuudet[0].kelpoisuus").value("kelpotesti"))
      .andExpect(jsonPath("$.paatosTiedot[0].kelpoisuudet[0].opetettavaAine").value("latina"))
      .andExpect(jsonPath("$.paatosTiedot[0].kelpoisuudet[0].direktiivitaso").value("a_1384_2015_patevyystaso_1"))
      .andExpect(
        jsonPath("$.paatosTiedot[0].kelpoisuudet[0].kansallisestiVaadittavaDirektiivitaso")
          .value("b_1384_2015_patevyystaso_2")
      )
    verify(auditLog, times(1)).logChanges(any(), any(), eqTo(AuditOperation.UpdatePaatos), any())
  }

  @Test
  @WithMockUser(value = "kayttaja", authorities = Array(SecurityConstants.SECURITY_ROOLI_ESITTELIJA_FULL))
  @Order(10)
  def haePaatosPalauttaaPaatosTiedonJaKelpoisuudenKanssa200(): Unit = {
    val paatosId   = paatosRepository.haePaatos(hakemusIdWithPaatosTiedotJaKelpoisuudet.get).get.id
    val paatosJSON =
      paatos2Json(
        paatosWithPaatosTiedotJaKelpoisuudet.copy(id = paatosId, luoja = Some("test user")),
        "id",
        "luoja",
        "luotu",
        "muokattu",
        "muokkaaja",
        "paatosId",
        "paatosTietoOptions"
      )
    var result = mvc
      .perform(
        get(s"/api/paatos/$hakemusOidWithPaatosTiedotJaKelpoisuudet/$lomakeId")
      )
      .andExpect(status().isOk)
      .andExpect(jsonPath("$.id").isString)
      .andExpect(jsonPath("$.paatosTiedot[0].id").isString)
      .andExpect(jsonPath("$.paatosTiedot[0].kelpoisuudet[0].id").isString)
      .andExpect(jsonPath("$.paatosTiedot[0].kelpoisuudet[0].kelpoisuus").value("kelpotesti"))
      .andExpect(jsonPath("$.paatosTiedot[0].kelpoisuudet[0].opetettavaAine").value("latina"))
      .andExpect(jsonPath("$.paatosTiedot[0].kelpoisuudet[0].direktiivitaso").value("a_1384_2015_patevyystaso_1"))
      .andExpect(
        jsonPath("$.paatosTiedot[0].kelpoisuudet[0].kansallisestiVaadittavaDirektiivitaso")
          .value("b_1384_2015_patevyystaso_2")
      )

    verify(auditLog, times(1)).logRead(any(), any(), eqTo(AuditOperation.ReadPaatos), any())
  }

}
