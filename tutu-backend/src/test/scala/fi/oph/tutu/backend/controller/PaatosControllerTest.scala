package fi.oph.tutu.backend.controller

import fi.oph.tutu.backend.IntegrationTestBase
import fi.oph.tutu.backend.domain.*
import fi.oph.tutu.backend.domain.Direktiivitaso.{a_1384_2015_patevyystaso_1, b_1384_2015_patevyystaso_2}
import fi.oph.tutu.backend.domain.Ratkaisutyyppi.PeruutusTaiRaukeaminen
import fi.oph.tutu.backend.security.SecurityConstants
import fi.oph.tutu.backend.service.{HallintoOikeusService, KoodistoService, OnrService, UserService}
import fi.oph.tutu.backend.utils.{AuditLog, AuditOperation, TutuJsonFormats}
import org.json4s.jvalue2extractable
import org.json4s.native.JsonMethods
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
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.{get, post, put}
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.{content, jsonPath, status}
import org.springframework.test.web.servlet.setup.{DefaultMockMvcBuilder, MockMvcBuilders, MockMvcConfigurer}
import org.springframework.web.context.WebApplicationContext

import java.time.LocalDateTime
import java.util.UUID

@AutoConfigureMockMvc
@TestInstance(Lifecycle.PER_CLASS)
@ActiveProfiles(Array("test"))
@TestMethodOrder(classOf[OrderAnnotation])
class PaatosControllerTest extends IntegrationTestBase with TutuJsonFormats {
  @Autowired
  private val context: WebApplicationContext = null
  private var mvc: MockMvc                   = null

  @MockitoBean
  private var userService: UserService = _

  @MockitoBean
  private var onrService: OnrService = _

  @MockitoBean
  private var koodistoService: KoodistoService = _

  @MockitoBean
  private var hallintoOikeusService: HallintoOikeusService = _

  @MockitoBean
  private var auditLog: AuditLog = _

  val lomakeId: Long         = 1527182
  val hakemusOid: HakemusOid = HakemusOid("1.2.246.562.11.00000000000000006666")
  val hakemusOidWithPaatosTiedotJaRinnastettavatTutkinnotTaiOpinnot: HakemusOid = HakemusOid(
    "1.2.246.562.11.00000000000000006667"
  )
  val hakemusOidWithPaatosTiedotJaKelpoisuudet: HakemusOid = HakemusOid(
    "1.2.246.562.11.00000000000000006668"
  )
  val hakemusOidWithKielteisetPaatosTiedot: HakemusOid = HakemusOid(
    "1.2.246.562.11.00000000000000006669"
  )
  var hakemusId: Option[UUID]                                                    = None
  var hakemusIdWithPaatosTiedotJaRinnastettavatTutkinnotTaiOpinnot: Option[UUID] = None
  var hakemusIdWithPaatosTiedotJaKelpoisuudet: Option[UUID]                      = None
  var hakemusIdWithKielteisetPaatosTiedot: Option[UUID]                          = None
  var paatosId: Option[UUID]                                                     = None
  var paatosId2: Option[UUID]                                                    = None
  var paatosTietoId: Option[UUID]                                                = None
  var paatosTietoId2: Option[UUID]                                               = None
  var paatos: Paatos                                                             = _
  var paatosWithPaatosTiedot: Paatos                                             = _
  var paatosWithKielteisetPaatosTiedot: Paatos                                   = _
  var paatosWithPaatosTiedotJaRinnastettavatTutkinnotTaiOpinnot: Paatos          = _
  var paatosWithPaatosTiedotJaKelpoisuudet: Paatos                               = _
  var paatosWithNewPaatosTiedotWithTutkinnotJaKelpoisuudet: Paatos               = _

  var paatosTiedot: Seq[PaatosTieto] =
    Seq(
      makePaatosTieto(None)
    )
  var kielteisetPaatosTiedot: Seq[PaatosTieto] =
    Seq(
      makeKielteinenPaatosTieto(None)
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
      paatosTiedot = Seq.empty,
      hyvaksymispaiva = Some(LocalDateTime.parse("2025-08-15T00:00:00.000")),
      lahetyspaiva = Some(LocalDateTime.parse("2025-08-23T00:00:00.000"))
    )
  }

  private def makePaatosWithPaatosTiedot(
    givenHakemusId: Option[UUID]
  ): Paatos = {
    Paatos(
      hakemusId = givenHakemusId,
      ratkaisutyyppi = Some(Ratkaisutyyppi.Paatos),
      seutArviointi = pickBoolean,
      peruutuksenTaiRaukeamisenSyy = None,
      paatosTiedot = paatosTiedot,
      hyvaksymispaiva = Some(LocalDateTime.parse("2025-08-15T00:00:00.000")),
      lahetyspaiva = Some(LocalDateTime.parse("2025-08-23T00:00:00.000"))
    )
  }

  private def makePaatosWithKielteisetPaatosTiedot(
    givenHakemusId: Option[UUID]
  ): Paatos = {
    Paatos(
      hakemusId = givenHakemusId,
      ratkaisutyyppi = Some(Ratkaisutyyppi.Paatos),
      peruutuksenTaiRaukeamisenSyy = None,
      paatosTiedot = kielteisetPaatosTiedot,
      hyvaksymispaiva = Some(LocalDateTime.parse("2025-08-15T00:00:00.000")),
      lahetyspaiva = Some(LocalDateTime.parse("2025-08-23T00:00:00.000"))
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
      kielteisenPaatoksenPerustelut = None,
      tutkintoTaso = Some(TutkintoTaso.YlempiKorkeakoulu)
    )
  }

  private def makeKielteinenPaatosTieto(paatosId: Option[UUID]): PaatosTieto = {
    PaatosTieto(
      id = None,
      paatosId = paatosId,
      paatosTyyppi = Some(PaatosTyyppi.Taso),
      sovellettuLaki = None,
      tutkintoId = None,
      lisaaTutkintoPaatostekstiin = None,
      myonteinenPaatos = Some(false),
      kielteisenPaatoksenPerustelut = Some(
        KielteisenPaatoksenPerustelut(
          epavirallinenKorkeakoulu = true
        )
      ),
      tutkintoTaso = None
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
              myonteisenPaatoksenLisavaatimukset = Some(
                MyonteisenPaatoksenLisavaatimukset(taydentavatOpinnot = true)
              ),
              kielteisenPaatoksenPerustelut = None
            )
          )
        )
      ),
      hyvaksymispaiva = Some(LocalDateTime.parse("2025-08-15T00:00:00.000")),
      lahetyspaiva = Some(LocalDateTime.parse("2025-08-23T00:00:00.000"))
    )
  }

  private def makePaatosWithPaatosTiedotJaKelpoisuudet(
    givenHakemusId: Option[UUID],
    givenPaatosId: Option[UUID],
    givenPaatosTietoId: Option[UUID],
    addTutkinnot: Seq[TutkintoTaiOpinto] = Seq.empty
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
          rinnastettavatTutkinnotTaiOpinnot = addTutkinnot,
          kelpoisuudet = Seq(
            Kelpoisuus(
              id = None,
              paatostietoId = givenPaatosTietoId,
              kelpoisuus = Some("Maajussi"),
              opetettavaAine = Some("kyntäminen"),
              muuAmmattiKuvaus = None,
              direktiivitaso = Some(a_1384_2015_patevyystaso_1),
              kansallisestiVaadittavaDirektiivitaso = Some(b_1384_2015_patevyystaso_2),
              direktiivitasoLisatiedot = randomStringOption,
              myonteinenPaatos = Some(true),
              myonteisenPaatoksenLisavaatimukset = Some(
                KelpoisuudenLisavaatimukset(
                  olennaisiaEroja = Some(true),
                  erotKoulutuksessa = Some(
                    ErotKoulutuksessa(
                      erot = Seq(
                        NamedBoolean("eroOpetettavanAineenOpinnoissa", true),
                        NamedBoolean("eroPedagogisissaOpinnoissa", false),
                        NamedBoolean("ero1", true),
                        NamedBoolean("ero2", false)
                      ),
                      muuEro = Some(true),
                      muuEroKuvaus = Some("Lisäksi muuta eroa")
                    )
                  ),
                  korvaavaToimenpide = Some(
                    KorvaavaToimenpide(
                      kelpoisuuskoe = true,
                      sopeutumisaika = true,
                      kelpoisuuskoeJaSopeutumisaika = Some(true),
                      kelpoisuuskoeSisalto = Some(KelpoisuuskoeSisalto(aihealue1 = true)),
                      sopeutumiusaikaKestoKk = Some("6"),
                      kelpoisuuskoeJaSopeutumisaikaSisalto = Some(KelpoisuuskoeSisalto(aihealue2 = true)),
                      kelpoisuuskoeJaSopeutumisaikaKestoKk = Some("12")
                    )
                  ),
                  ammattikokemusJaElinikainenOppiminen = Some(
                    AmmattikomemusJaElinikainenOppiminen(
                      ammattikokemus = Some(true),
                      elinikainenOppiminen = Some(true),
                      lisatieto = Some("Lisätietoa"),
                      korvaavuus = Some(AmmattikokemusElinikainenOppiminenKorvaavuus.Taysi),
                      korvaavaToimenpide = Some(
                        KorvaavaToimenpide(
                          kelpoisuuskoeJaSopeutumisaika = Some(true),
                          kelpoisuuskoeSisalto = Some(KelpoisuuskoeSisalto(aihealue2 = true)),
                          sopeutumiusaikaKestoKk = Some("3")
                        )
                      )
                    )
                  )
                )
              ),
              kielteisenPaatoksenPerustelut = Some(KielteisenPaatoksenPerustelut())
            )
          )
        )
      ),
      hyvaksymispaiva = Some(LocalDateTime.parse("2025-08-15T00:00:00.000")),
      lahetyspaiva = Some(LocalDateTime.parse("2025-08-23T00:00:00.000"))
    )
  }

  private def paatos2Json(paatos: Paatos, ignoreFields: String*): String = {
    val paatosTiedotAsMap =
      paatos.paatosTiedot.map { pt =>
        val tutkinnotJaOpinnotAsMap = pt.rinnastettavatTutkinnotTaiOpinnot.map { t =>
          t.productElementNames.toList.zip(t.productIterator.toList).toMap -- ignoreFields
        }
        val kelpoisuudetAsMap = pt.kelpoisuudet.map { k =>
          k.productElementNames.toList.zip(k.productIterator.toList).toMap -- ignoreFields
        }
        pt.productElementNames.toList
          .zip(pt.productIterator.toList)
          .toMap -- ignoreFields + ("kelpoisuudet" -> kelpoisuudetAsMap) + ("rinnastettavatTutkinnotTaiOpinnot" -> tutkinnotJaOpinnotAsMap)
      }

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
        lomakeId,
        None,
        asiakirjaRepository.tallennaUudetAsiakirjatiedot(Asiakirja(), "testi"),
        "testi"
      )
    )
    hakemusIdWithPaatosTiedotJaRinnastettavatTutkinnotTaiOpinnot = Some(
      hakemusRepository.tallennaHakemus(
        hakemusOidWithPaatosTiedotJaRinnastettavatTutkinnotTaiOpinnot,
        1,
        lomakeId,
        None,
        asiakirjaRepository.tallennaUudetAsiakirjatiedot(Asiakirja(), "testi"),
        "testi"
      )
    )
    hakemusIdWithPaatosTiedotJaKelpoisuudet = Some(
      hakemusRepository.tallennaHakemus(
        hakemusOidWithPaatosTiedotJaKelpoisuudet,
        1,
        lomakeId,
        None,
        asiakirjaRepository.tallennaUudetAsiakirjatiedot(Asiakirja(), "testi"),
        "testi"
      )
    )
    hakemusIdWithKielteisetPaatosTiedot = Some(
      hakemusRepository.tallennaHakemus(
        hakemusOidWithKielteisetPaatosTiedot,
        1,
        lomakeId,
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
    paatosTietoId = paatosRepository.tallennaPaatosTieto(paatosId.get, makePaatosTieto(paatosId), "test user").id
    paatosTietoId2 = paatosRepository.tallennaPaatosTieto(paatosId2.get, makePaatosTieto(paatosId2), "test user").id
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
      hakemusIdWithPaatosTiedotJaKelpoisuudet,
      paatosId2,
      paatosTietoId2
    )
    paatosWithKielteisetPaatosTiedot = makePaatosWithKielteisetPaatosTiedot(
      hakemusIdWithKielteisetPaatosTiedot
    )
    paatosWithNewPaatosTiedotWithTutkinnotJaKelpoisuudet = makePaatosWithPaatosTiedotJaKelpoisuudet(
      hakemusIdWithPaatosTiedotJaKelpoisuudet,
      paatosId2,
      None,
      paatosWithPaatosTiedotJaRinnastettavatTutkinnotTaiOpinnot.paatosTiedot.head.rinnastettavatTutkinnotTaiOpinnot
        .map(_.copy(paatostietoId = None))
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
        put(s"/api/paatos/$hakemusOid")
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
        get(s"/api/paatos/$hakemusOid")
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
        get(s"/api/paatos/${HakemusOid("1.2.246.562.11.00000000000000009999")}")
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
        put(s"/api/paatos/${HakemusOid("1.2.246.562.11.00000000000000009999")}")
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
        put(s"/api/paatos/$hakemusOid")
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
        get(s"/api/paatos/$hakemusOid")
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
        put(s"/api/paatos/$hakemusOidWithPaatosTiedotJaRinnastettavatTutkinnotTaiOpinnot")
          .`with`(csrf())
          .contentType(MediaType.APPLICATION_JSON)
          .content(paatosJSON)
      )
      .andExpect(status().isOk)
      .andExpect(jsonPath("$.id").isString)
      .andExpect(jsonPath("$.paatosTiedot[0].id").isString)
      .andExpect(jsonPath("$.paatosTiedot[0].rinnastettavatTutkinnotTaiOpinnot[0].id").isString)
      .andExpect(jsonPath("$.paatosTiedot[0].rinnastettavatTutkinnotTaiOpinnot[0].tutkintoTaiOpinto").value("testi"))
      .andExpect(
        jsonPath(
          "$.paatosTiedot[0].rinnastettavatTutkinnotTaiOpinnot[0].myonteisenPaatoksenLisavaatimukset.taydentavatOpinnot"
        ).value(true)
      )
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
        get(s"/api/paatos/$hakemusOidWithPaatosTiedotJaRinnastettavatTutkinnotTaiOpinnot")
      )
      .andExpect(status().isOk)
      .andExpect(jsonPath("$.id").isString)
      .andExpect(jsonPath("$.paatosTiedot[0].id").isString)
      .andExpect(jsonPath("$.paatosTiedot[0].rinnastettavatTutkinnotTaiOpinnot[0].id").isString)
      .andExpect(jsonPath("$.paatosTiedot[0].rinnastettavatTutkinnotTaiOpinnot[0].tutkintoTaiOpinto").value("testi"))
      .andExpect(
        jsonPath(
          "$.paatosTiedot[0].rinnastettavatTutkinnotTaiOpinnot[0].myonteisenPaatoksenLisavaatimukset.taydentavatOpinnot"
        ).value(true)
      )

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
        "muokkaaja",
        "paatosTietoOptions"
      )
    mvc
      .perform(
        put(s"/api/paatos/$hakemusOidWithPaatosTiedotJaKelpoisuudet")
          .`with`(csrf())
          .contentType(MediaType.APPLICATION_JSON)
          .content(paatosJSON)
      )
      .andExpect(status().isOk)
      .andExpect(jsonPath("$.id").isString)
      .andExpect(jsonPath("$.paatosTiedot[0].id").isString)
      .andExpect(jsonPath("$.paatosTiedot[0].kelpoisuudet[0].id").isString)
      .andExpect(
        content().json(
          paatos2Json(
            paatosWithPaatosTiedotJaKelpoisuudet,
            "id",
            "luoja",
            "luotu",
            "muokkaaja",
            "paatosTietoOptions"
          )
        )
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
        "luoja",
        "luotu",
        "muokattu",
        "muokkaaja",
        "paatosId",
        "paatosTietoOptions"
      )
    var result = mvc
      .perform(
        get(s"/api/paatos/$hakemusOidWithPaatosTiedotJaKelpoisuudet")
      )
      .andExpect(status().isOk)
      .andExpect(jsonPath("$.id").isString)
      .andExpect(jsonPath("$.paatosTiedot[0].id").isString)
      .andExpect(jsonPath("$.paatosTiedot[0].kelpoisuudet[0].id").isString)
      .andExpect(
        content().json(
          paatos2Json(
            paatosWithPaatosTiedotJaKelpoisuudet,
            "id",
            "luoja",
            "luotu",
            "muokkaaja",
            "paatosTietoOptions"
          )
        )
      )

    verify(auditLog, times(1)).logRead(any(), any(), eqTo(AuditOperation.ReadPaatos), any())
  }

  @Test
  @WithMockUser(value = "kayttaja", authorities = Array(SecurityConstants.SECURITY_ROOLI_ESITTELIJA_FULL))
  @Order(11)
  def tallennaPaatosUudenPaatosTiedonJaTutkinnonJaKelpoisuudenKanssaTallentaaJaPalauttaaKaikenDatan(): Unit = {
    val paatosJSON =
      paatos2Json(
        paatosWithNewPaatosTiedotWithTutkinnotJaKelpoisuudet,
        "luoja",
        "luotu",
        "muokkaaja",
        "paatosTietoOptions"
      )
    mvc
      .perform(
        put(s"/api/paatos/$hakemusOidWithPaatosTiedotJaKelpoisuudet")
          .`with`(csrf())
          .contentType(MediaType.APPLICATION_JSON)
          .content(paatosJSON)
      )
      .andExpect(status().isOk)
      .andExpect(jsonPath("$.id").isString)
      .andExpect(jsonPath("$.paatosTiedot[0].id").isString)
      .andExpect(jsonPath("$.paatosTiedot[0].kelpoisuudet[0].id").isString)
      .andExpect(jsonPath("$.paatosTiedot[0].rinnastettavatTutkinnotTaiOpinnot[0].id").isString)
      .andExpect(
        content().json(
          paatos2Json(
            paatosWithNewPaatosTiedotWithTutkinnotJaKelpoisuudet,
            "id",
            "paatostietoId",
            "luoja",
            "luotu",
            "muokkaaja",
            "paatosTietoOptions"
          )
        )
      )

    verify(auditLog, times(1)).logChanges(any(), any(), eqTo(AuditOperation.UpdatePaatos), any())
  }

  @Test
  @WithMockUser(value = "kayttaja", authorities = Array(SecurityConstants.SECURITY_ROOLI_ESITTELIJA_FULL))
  @Order(12)
  def tallennaPaatosPalauttaaKielteisenPaatosTiedonKanssa200JaKantaanTallennetunDatan(): Unit = {
    val paatosJSON =
      paatos2Json(
        paatosWithKielteisetPaatosTiedot,
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
        put(s"/api/paatos/$hakemusOidWithKielteisetPaatosTiedot")
          .`with`(csrf())
          .contentType(MediaType.APPLICATION_JSON)
          .content(paatosJSON)
      )
      .andExpect(status().isOk)
      .andExpect(jsonPath("$.id").isString)
      .andExpect(jsonPath("$.paatosTiedot[0].id").isString)
      .andExpect(jsonPath("$.paatosTiedot[0].kielteisenPaatoksenPerustelut.epavirallinenKorkeakoulu").value(true))
      .andExpect(content().json(paatosJSON))
    verify(auditLog, times(1)).logChanges(any(), any(), eqTo(AuditOperation.UpdatePaatos), any())
  }

  @Test
  @WithMockUser(value = "kayttaja", authorities = Array(SecurityConstants.SECURITY_ROOLI_ESITTELIJA_FULL))
  @Order(13)
  def haePaatosPalauttaaKielteisenPaatosTiedonKanssa200(): Unit = {
    val paatosId   = paatosRepository.haePaatos(hakemusId.get).get.id
    val paatosJSON =
      paatos2Json(
        paatosWithKielteisetPaatosTiedot
          .copy(id = paatosId, luoja = Some("test user"), paatosTiedot = kielteisetPaatosTiedot),
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
        get(s"/api/paatos/$hakemusOidWithKielteisetPaatosTiedot")
      )
      .andExpect(status().isOk)
      .andExpect(jsonPath("$.id").isString)
      .andExpect(jsonPath("$.paatosTiedot[0].id").isString)
      .andExpect(jsonPath("$.paatosTiedot[0].kielteisenPaatoksenPerustelut.epavirallinenKorkeakoulu").value(true))
      .andExpect(content().json(paatosJSON))
    verify(auditLog, times(1)).logRead(any(), any(), eqTo(AuditOperation.ReadPaatos), any())
  }

  @Test
  @WithMockUser(value = "kayttaja", authorities = Array(SecurityConstants.SECURITY_ROOLI_ESITTELIJA_FULL))
  @Order(14)
  def haePaatosTekstiPalauttaaPaatosTekstinKanssa200(): Unit = {
    when(onrService.haeHenkilo("1.2.246.562.24.00000000001"))
      .thenReturn(
        Right(
          OnrUser(
            oidHenkilo = "1.2.246.562.24.00000000001",
            kutsumanimi = "Roope",
            sukunimi = "Roihuvuori",
            kansalaisuus = Seq(KansalaisuusKoodi("123")),
            hetu = Some("010171-789X"),
            true
          )
        )
      )
    when(hakemuspalveluService.haeHakemus(any[HakemusOid]))
      .thenReturn(Right(loadJson("ataruHakemus6667.json")))
    when(hakemuspalveluService.haeJaParsiHakemus(any[HakemusOid]))
      .thenReturn(Right(JsonMethods.parse(loadJson("ataruHakemus6667.json")).extract[AtaruHakemus]))
    when(koodistoService.getKoodistoRelaatiot(any[String])).thenReturn(Right("""[
    {
      "koodiUri": "maakunta_01",
      "koodiArvo": "01",
      "tila": "HYVAKSYTTY"
    }
  ]"""))
    when(hallintoOikeusService.haeHallintoOikeusByKunta(any[String]))
      .thenReturn(
        HallintoOikeus(
          Some(UUID.fromString("9d36433f-c391-4f45-81e7-d14f95236ce9")),
          "HAMEENLINNA",
          Map(
            Kieli.fi -> "Hämeenlinnan hallinto-oikeus",
            Kieli.sv -> "Tavastehus förvaltningsdomstol",
            Kieli.en -> "Hämeenlinna Administrative Court"
          ),
          Some(
            Map(
              Kieli.fi -> "Koulukatu 9, 13100 Hämeenlinna",
              Kieli.sv -> "Koulukatu 9, 13100 Tavastehus",
              Kieli.en -> "Koulukatu 9, 13100 Hämeenlinna"
            )
          ),
          Some("029 56 46000"),
          Some("hameenlinna.ho@oikeus.fi"),
          Some(
            Map(
              Kieli.fi -> "https://oikeus.fi/hameenlinna",
              Kieli.sv -> "https://oikeus.fi/hameenlinna/sv",
              Kieli.en -> "https://oikeus.fi/hameenlinna/en"
            )
          )
        )
      )
    val result = mvc
      .perform(
        get(s"/api/paatos/$hakemusOidWithPaatosTiedotJaRinnastettavatTutkinnotTaiOpinnot/paatosteksti")
      )
      .andExpect(status().isOk)
      .andExpect(content().contentType("text/html;charset=UTF-8"))
      .andExpect(content().string("\"<p>Tällä hetkellä esikatselu on saatavilla vain tasopäätökselle.</p>\""))
    verify(auditLog, times(1)).logRead(any(), any(), eqTo(AuditOperation.ReadPaatosPreview), any())
  }
}
