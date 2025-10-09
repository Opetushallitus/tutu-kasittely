package fi.oph.tutu.backend.controller

import fi.oph.tutu.backend.IntegrationTestBase
import fi.oph.tutu.backend.domain.*
import fi.oph.tutu.backend.security.SecurityConstants
import fi.oph.tutu.backend.service.*
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
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.*
import org.springframework.test.web.servlet.setup.{DefaultMockMvcBuilder, MockMvcBuilders, MockMvcConfigurer}
import org.springframework.web.context.WebApplicationContext

import java.time.LocalDateTime
import java.util.UUID

val uuidTemplate1 = "11111111-2222-3333-4444-555555555555"

@AutoConfigureMockMvc
@TestInstance(Lifecycle.PER_CLASS)
@ActiveProfiles(Array("test"))
@TestMethodOrder(classOf[OrderAnnotation])
class PerusteluControllerTest extends IntegrationTestBase {

  def pickTutkinnonAsema: Option[String] = {
    pick(
      Seq(
        Some("alempi_korkeakouluaste"),
        Some("ylempi_korkeakouluaste"),
        Some("alempi_ja_ylempi_korkeakouluaste"),
        Some("tutkijakoulutusaste"),
        Some("ei_korkeakouluaste")
      )
    )
  }

  def pickJatkoOpintoKelpoisuus: Option[String] = {
    pick(
      Seq(
        Some("toisen_vaiheen_korkeakouluopintoihin"),
        Some("tieteellisiin_jatko-opintoihin"),
        Some("muu")
      )
    )
  }

  def makePerustelu(
    virallinenTutkinnonMyontaja: Option[Boolean] = pickBooleanOption,
    virallinenTutkinto: Option[Boolean] = pickBooleanOption,
    lahdeLahtomaanKansallinenLahde: Boolean = pickBoolean,
    lahdeLahtomaanVirallinenVastaus: Boolean = pickBoolean,
    lahdeKansainvalinenHakuteosTaiVerkkosivusto: Boolean = pickBoolean,
    selvitysTutkinnonMyontajastaJaTutkinnonVirallisuudesta: String = randomString,
    ylimmanTutkinnonAsemaLahtomaanJarjestelmassa: Option[String] = pickTutkinnonAsema,
    selvitysTutkinnonAsemastaLahtomaanJarjestelmassa: String = randomString,
    aikaisemmatPaatokset: Option[Boolean] = pickBooleanOption,
    jatkoOpintoKelpoisuus: Option[String] = pickJatkoOpintoKelpoisuus,
    jatkoOpintoKelpoisuusLisatieto: Option[String] = Some(randomString),
    muuPerustelu: Option[String] = None,
    lausuntoPyyntojenLisatiedot: Option[String] = None,
    lausunnonSisalto: Option[String] = None,
    lausuntoPyynnot: Seq[Lausuntopyynto] = Seq.empty
  ): Perustelu = {
    Perustelu(
      None,
      Option(UUID.fromString(uuidTemplate1)),
      virallinenTutkinnonMyontaja,
      virallinenTutkinto,
      lahdeLahtomaanKansallinenLahde,
      lahdeLahtomaanVirallinenVastaus,
      lahdeKansainvalinenHakuteosTaiVerkkosivusto,
      selvitysTutkinnonMyontajastaJaTutkinnonVirallisuudesta,
      ylimmanTutkinnonAsemaLahtomaanJarjestelmassa,
      selvitysTutkinnonAsemastaLahtomaanJarjestelmassa,
      aikaisemmatPaatokset,
      jatkoOpintoKelpoisuus,
      jatkoOpintoKelpoisuusLisatieto,
      muuPerustelu,
      lausuntoPyyntojenLisatiedot,
      lausunnonSisalto,
      lausuntoPyynnot,
      Option(LocalDateTime.now()),
      Option("test user"),
      Option(LocalDateTime.now()),
      Option("test user")
    )
  }

  def makePerusteluWithUoro(): Perustelu = {
    makePerustelu().copy(
      uoRoSisalto = UoRoSisalto(
        Some(false),
        Some(false),
        Some(true),
        Some(false),
        Some(true),
        Some(false),
        Some(false),
        Some(true),
        Some(false),
        Some(false),
        Some(false),
        Some(false),
        Some(true),
        Some("eipä vissii"),
        Some(false),
        Some(false),
        Some(false),
        Some(true),
        Some(true),
        Some("näin on"),
        Some(true),
        Some(false),
        Some(true),
        Some(true),
        Some("ei voi"),
        SovellettuTilanne(Some(false)),
        SovellettuTilanneOpetettavatAineet(Some(false)),
        SovellettuTilanne(Some(false)),
        SovellettuTilanne(Some(false)),
        SovellettuTilanne(Some(false)),
        SovellettuTilanneKasvatustieteellinen(Some(false)),
        SovellettuTilanne(Some(false)),
        SovellettuTilanne(Some(false)),
        SovellettuTilanne(Some(false)),
        Some(true),
        Some("se on just nii")
      )
    )
  }

  def makePerusteluWithAP(): Perustelu = {
    makePerustelu().copy(
      apSisalto = APSisalto(
        Some(false),
        Some(false),
        Some(true),
        Some(false),
        Some("todistusEUKansalaisuuteenRinnasteisestaAsemasta"),
        Some("ammattiJohonPatevoitynyt"),
        Some("ammattitoiminnanPaaAsiallinenSisalto"),
        Some("koulutuksenKestoJaSisalto"),
        Some(false),
        Some(false),
        Some(true),
        Some("selvityksetAikaisemmanTapauksenAsiaTunnus"),
        Some(false),
        Some("lisatietoja"),
        Some(true),
        Some("muutAPPerustelut"),
        Some("SEUTArviointi")
      )
    )
  }

  def makePerusteluWithLausuntotieto(): Perustelu = {
    makePerustelu().copy(
      lausuntoPyyntojenLisatiedot = Some(randomString),
      lausunnonSisalto = Some(randomString),
      lausuntopyynnot = Seq(
        Lausuntopyynto(
          lausunnonAntaja = Some(randomString),
          lahetetty = Option(LocalDateTime.now()),
          saapunut = Option(LocalDateTime.now())
        ),
        Lausuntopyynto(
          lausunnonAntaja = Some(randomString),
          lahetetty = None,
          saapunut = None
        ),
        Lausuntopyynto(
          lausunnonAntaja = Some(randomString),
          lahetetty = Option(LocalDateTime.now()),
          saapunut = None
        ),
        Lausuntopyynto(
          lausunnonAntaja = Some(randomString),
          lahetetty = None,
          saapunut = Some(LocalDateTime.now())
        )
      )
    )
  }

  @Autowired
  private val context: WebApplicationContext = null
  private var mvc: MockMvc                   = null

  @MockitoBean
  private var userService: UserService = _

  @Autowired
  private var muistioService: MuistioService = _

  @Autowired
  private var perusteluService: PerusteluService = _

  @MockitoBean
  private var koodistoService: KoodistoService = _

  @MockitoBean
  private var auditLog: AuditLog = _

  val hakemusOid: HakemusOid  = HakemusOid("1.2.246.562.11.00000000000000006666")
  var hakemusId: Option[UUID] = None
  var perustelu: Perustelu    = makePerustelu()

  val hakemusOid2: HakemusOid  = HakemusOid("1.2.246.562.11.00000000000000006667")
  var hakemusId2: Option[UUID] = None
  var perustelu2: Perustelu    = makePerusteluWithUoro()

  val hakemusOid3: HakemusOid  = HakemusOid("1.2.246.562.11.00000000000000006668")
  var hakemusId3: Option[UUID] = None
  var perustelu3: Perustelu    = makePerusteluWithLausuntotieto()

  val hakemusOid4: HakemusOid  = HakemusOid("1.2.246.562.11.00000000000000006669")
  var hakemusId4: Option[UUID] = None
  var perustelu4: Perustelu    = makePerusteluWithAP()

  def perustelu2Json(perustelu: Perustelu, ignoreFields: String*): String = {
    val lausuntopyynnotAsMap =
      if (perustelu.lausuntopyynnot.nonEmpty)
        perustelu.lausuntopyynnot.map { lp =>
          lp.productElementNames.toList.zip(lp.productIterator.toList).toMap -- ignoreFields
        }
      else
        Seq.empty

    val uoro      = perustelu.uoRoSisalto
    val uoroAsMap =
      if (uoro != null) uoro.productElementNames.toList.zip(uoro.productIterator.toList).toMap -- ignoreFields else null

    val ap      = perustelu.apSisalto
    val apAsMap =
      if (ap != null) ap.productElementNames.toList.zip(ap.productIterator.toList).toMap -- ignoreFields else null

    val perusteluAsMap = perustelu.productElementNames.toList
      .zip(perustelu.productIterator.toList)
      .toMap -- ignoreFields + (
      "lausuntopyynnot" -> lausuntopyynnotAsMap,
      "uoRoSisalto"     -> uoroAsMap,
      "apSisalto"       -> apAsMap
    )

    mapper.writeValueAsString(perusteluAsMap)
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
    perustelu = perustelu.copy(hakemusId = Some(hakemusId.get))
    hakemusId2 = Some(
      hakemusRepository.tallennaHakemus(
        hakemusOid2,
        1,
        None,
        asiakirjaRepository.tallennaUudetAsiakirjatiedot(Asiakirja(), "testi"),
        "testi"
      )
    )
    perustelu2 = perustelu2.copy(hakemusId = Some(hakemusId2.get))
    hakemusId3 = Some(
      hakemusRepository.tallennaHakemus(
        hakemusOid3,
        1,
        None,
        asiakirjaRepository.tallennaUudetAsiakirjatiedot(Asiakirja(), "testi"),
        "testi"
      )
    )
    perustelu3 = perustelu3.copy(hakemusId = Some(hakemusId3.get))
    hakemusId4 = Some(
      hakemusRepository.tallennaHakemus(
        hakemusOid4,
        1,
        None,
        asiakirjaRepository.tallennaUudetAsiakirjatiedot(Asiakirja(), "testi"),
        "testi"
      )
    )
    perustelu4 = perustelu4.copy(hakemusId = Some(hakemusId4.get))
  }

  @Test
  @WithMockUser(value = "kayttaja", authorities = Array(SecurityConstants.SECURITY_ROOLI_ESITTELIJA_FULL))
  @Order(1)
  def tallennaPerusteluPalauttaa200JaKantaanTallennetunDatan(): Unit = {
    val perusteluJSON = perustelu2Json(perustelu, "id", "luotu", "muokattu", "muokkaaja")

    when(
      userService.getEnrichedUserDetails(any)
    ).thenReturn(
      User(
        userOid = "test user",
        authorities = List()
      )
    )

    mvc
      .perform(
        post(s"/api/perustelu/${hakemusOid}")
          .`with`(csrf())
          .contentType(MediaType.APPLICATION_JSON)
          .content(perusteluJSON)
      )
      .andExpect(status().isOk)
      .andExpect(jsonPath("$.id").isString)
      .andExpect(jsonPath("$.aikaisemmatPaatokset").isBoolean)
      .andExpect(jsonPath("$.jatkoOpintoKelpoisuus").isString)
      .andExpect(jsonPath("$.jatkoOpintoKelpoisuusLisatieto").isString)
      .andExpect(jsonPath("$.lausuntoPyyntojenLisatiedot").isEmpty)
      .andExpect(jsonPath("$.lausunnonSisalto").isEmpty)
      .andExpect(jsonPath("$.lausuntopyynnot").isEmpty)
      .andExpect(jsonPath("$.hakemusId").isString)
      .andExpect(jsonPath("$.luotu").isString)
      .andExpect(jsonPath("$.luoja").isString)
      .andExpect(jsonPath("$.muokattu").isEmpty)
      .andExpect(jsonPath("$.muokkaaja").isEmpty)
      .andExpect(jsonPath("$.uoRoSisalto").isMap)
      .andExpect(content().json(perusteluJSON))
    verify(auditLog, times(1)).logChanges(any(), any(), eqTo(AuditOperation.UpdatePerustelu), any())
  }

  @Test
  @WithMockUser(value = "kayttaja", authorities = Array(SecurityConstants.SECURITY_ROOLI_ESITTELIJA_FULL))
  @Order(2)
  def haePerusteluPalauttaa200(): Unit = {
    val perusteluId   = perusteluRepository.haePerustelu(hakemusId.get).get.id
    val perusteluJSON = perustelu2Json(perustelu.copy(id = perusteluId), "luotu", "muokattu", "muokkaaja")
    mvc
      .perform(
        get(s"/api/perustelu/${hakemusOid}")
      )
      .andExpect(status().isOk)
      .andExpect(jsonPath("$.id").isString)
      .andExpect(jsonPath("$.hakemusId").isString)
      .andExpect(jsonPath("$.luotu").isString)
      .andExpect(jsonPath("$.luoja").isString)
      .andExpect(jsonPath("$.muokattu").isEmpty)
      .andExpect(jsonPath("$.muokkaaja").isEmpty)
      .andExpect(jsonPath("$.uoRoSisalto").isMap)
      .andExpect(content().json(perusteluJSON))
    verify(auditLog, times(1)).logRead(any(), any(), eqTo(AuditOperation.ReadPerustelu), any())
  }

  @Test
  @WithMockUser(value = "kayttaja", authorities = Array(SecurityConstants.SECURITY_ROOLI_ESITTELIJA_FULL))
  @Order(3)
  def tallennaMuokattuPerusteluPalauttaa200JaKantaanTallennetunDatan(): Unit = {
    val perusteluId   = perusteluRepository.haePerustelu(hakemusId.get).get.id
    val perusteluJSON = perustelu2Json(
      makePerustelu().copy(id = perusteluId, hakemusId = Some(hakemusId.get)),
      "luotu",
      "muokattu",
      "muokkaaja"
    )

    when(
      userService.getEnrichedUserDetails(any)
    ).thenReturn(
      User(
        userOid = "test user",
        authorities = List()
      )
    )

    mvc
      .perform(
        post(s"/api/perustelu/$hakemusOid")
          .`with`(csrf())
          .contentType(MediaType.APPLICATION_JSON)
          .content(perusteluJSON)
      )
      .andExpect(status().isOk)
      .andExpect(jsonPath("$.muokattu").isString)
      .andExpect(jsonPath("$.muokkaaja").isString)
      .andExpect(content().json(perusteluJSON))

    mvc
      .perform(
        get(s"/api/perustelu/$hakemusOid")
      )
      .andExpect(status().isOk)
      .andExpect(content().json(perusteluJSON))
    verify(auditLog, times(1)).logChanges(any(), any(), eqTo(AuditOperation.UpdatePerustelu), any())
  }

  @Test
  @WithMockUser(value = "kayttaja", authorities = Array(SecurityConstants.SECURITY_ROOLI_ESITTELIJA_FULL))
  @Order(4)
  def haePerusteluPalauttaa404KunPerusteluaEiKannassa(): Unit = {
    mvc
      .perform(
        get("/api/perustelu/000")
      )
      .andExpect(status().isNotFound)
  }

  @Test
  @WithMockUser(value = "kayttaja", authorities = Array(SecurityConstants.SECURITY_ROOLI_ESITTELIJA_FULL))
  @Order(5)
  def tallennaPerusteluWithUoRoPalauttaa200JaKantaanTallennetunDatan(): Unit = {
    val perusteluJSON = perustelu2Json(perustelu2, "id", "perusteluId", "luotu", "muokattu", "muokkaaja")
    when(
      userService.getEnrichedUserDetails(any)
    ).thenReturn(
      User(
        userOid = "test user",
        authorities = List()
      )
    )

    mvc
      .perform(
        post(s"/api/perustelu/${hakemusOid2}")
          .`with`(csrf())
          .contentType(MediaType.APPLICATION_JSON)
          .content(perusteluJSON)
      )
      .andExpect(status().isOk)
      .andExpect(jsonPath("$.id").isString)
      .andExpect(jsonPath("$.hakemusId").isString)
      .andExpect(jsonPath("$.luotu").isString)
      .andExpect(jsonPath("$.muokattu").isEmpty)
      .andExpect(jsonPath("$.muokkaaja").isEmpty)
      .andExpect(content().json(perusteluJSON))
    verify(auditLog, times(1)).logChanges(any(), any(), eqTo(AuditOperation.UpdatePerustelu), any())
  }

  @Test
  @WithMockUser(value = "kayttaja", authorities = Array(SecurityConstants.SECURITY_ROOLI_ESITTELIJA_FULL))
  @Order(6)
  def haePerusteluWithUoroPalauttaa200(): Unit = {
    val perusteluId   = perusteluRepository.haePerustelu(hakemusId2.get).get.id
    val uoro          = perustelu2.uoRoSisalto
    val perustelu     = perustelu2.copy(id = perusteluId, uoRoSisalto = uoro)
    val perusteluJSON = perustelu2Json(perustelu, "luotu", "muokattu", "muokkaaja")

    mvc
      .perform(
        get(s"/api/perustelu/${hakemusOid2}")
      )
      .andExpect(status().isOk)
      .andExpect(jsonPath("$.hakemusId").isString)
      .andExpect(jsonPath("$.luotu").isString)
      .andExpect(jsonPath("$.muokattu").isEmpty)
      .andExpect(jsonPath("$.muokkaaja").isEmpty)
      .andExpect(content().json(perusteluJSON))
    verify(auditLog, times(1)).logRead(any(), any(), eqTo(AuditOperation.ReadPerustelu), any())
  }

  @Test
  @WithMockUser(value = "kayttaja", authorities = Array(SecurityConstants.SECURITY_ROOLI_ESITTELIJA_FULL))
  @Order(7)
  def tallennaMuokattuPerusteluWithUoRoPalauttaa200JaKantaanTallennetunDatan(): Unit = {
    val perusteluId = perusteluRepository.haePerustelu(hakemusId2.get).get.id
    var perustelu   = makePerusteluWithUoro().copy(hakemusId = Some(hakemusId2.get))
    val uoro        = perustelu.uoRoSisalto
    perustelu = perustelu.copy(id = perusteluId, uoRoSisalto = uoro)
    val perusteluJSON = perustelu2Json(perustelu, "luotu", "muokattu", "muokkaaja")
    when(
      userService.getEnrichedUserDetails(any)
    ).thenReturn(
      User(
        userOid = "test user",
        authorities = List()
      )
    )

    mvc
      .perform(
        post(s"/api/perustelu/$hakemusOid2")
          .`with`(csrf())
          .contentType(MediaType.APPLICATION_JSON)
          .content(perusteluJSON)
      )
      .andExpect(status().isOk)
      .andExpect(jsonPath("$.muokattu").isString)
      .andExpect(jsonPath("$.muokkaaja").isString)
      .andExpect(content().json(perusteluJSON))
    mvc
      .perform(
        get(s"/api/perustelu/$hakemusOid2")
      )
      .andExpect(status().isOk)
      .andExpect(content().json(perusteluJSON))
    verify(auditLog, times(1)).logChanges(any(), any(), eqTo(AuditOperation.UpdatePerustelu), any())
  }

  @Test
  @WithMockUser(value = "kayttaja", authorities = Array(SecurityConstants.SECURITY_ROOLI_ESITTELIJA_FULL))
  @Order(8)
  def tallennaPerusteluWithLausuntopyynnotPalauttaa200JaKantaanTallennetunDatan(): Unit = {
    val perusteluJSON =
      perustelu2Json(perustelu3, "id", "perusteluId", "luotu", "muokattu", "muokkaaja")

    when(
      userService.getEnrichedUserDetails(any)
    ).thenReturn(
      User(
        userOid = "test user",
        authorities = List()
      )
    )

    mvc
      .perform(
        post(s"/api/perustelu/${hakemusOid3}")
          .`with`(csrf())
          .contentType(MediaType.APPLICATION_JSON)
          .content(perusteluJSON)
      )
      .andExpect(status().isOk)
      .andExpect(jsonPath("$.id").isString)
      .andExpect(jsonPath("$.hakemusId").isString)
      .andExpect(jsonPath("$.luotu").isString)
      .andExpect(jsonPath("$.muokattu").isEmpty)
      .andExpect(jsonPath("$.muokkaaja").isEmpty)
      .andExpect(content().json(perusteluJSON))
    verify(auditLog, times(1)).logChanges(any(), any(), eqTo(AuditOperation.UpdatePerustelu), any())
  }

  @Test
  @WithMockUser(value = "kayttaja", authorities = Array(SecurityConstants.SECURITY_ROOLI_ESITTELIJA_FULL))
  @Order(9)
  def haePerusteluWithLausuntotietoPalauttaa200(): Unit = {
    val perusteluId         = perusteluRepository.haePerustelu(hakemusId3.get).get.id
    val lausuntopyynnotInDb = perusteluRepository.haeLausuntopyynnot(perusteluId.get)
    val lausuntopyynnot     = perustelu3.lausuntopyynnot.map(lp =>
      lp.copy(
        perusteluId = Some(perusteluId.get),
        id = lausuntopyynnotInDb.find(_.lausunnonAntaja == lp.lausunnonAntaja).get.id
      )
    )
    val perusteluJSON = perustelu2Json(
      perustelu3.copy(id = perusteluId, lausuntopyynnot = lausuntopyynnot),
      "luotu",
      "muokattu",
      "muokkaaja"
    )

    mvc
      .perform(
        get(s"/api/perustelu/${hakemusOid3}")
      )
      .andExpect(status().isOk)
      .andExpect(jsonPath("$.hakemusId").isString)
      .andExpect(jsonPath("$.luotu").isString)
      .andExpect(jsonPath("$.muokattu").isEmpty)
      .andExpect(jsonPath("$.muokkaaja").isEmpty)
      .andExpect(jsonPath("$.uoRoSisalto").isMap)
      .andExpect(content().json(perusteluJSON))
    verify(auditLog, times(1)).logRead(any(), any(), eqTo(AuditOperation.ReadPerustelu), any())
  }

  @Test
  @WithMockUser(value = "kayttaja", authorities = Array(SecurityConstants.SECURITY_ROOLI_ESITTELIJA_FULL))
  @Order(10)
  def tallennaMuokattuPerusteluWithLausuntotietoPalauttaa200JaKantaanTallennetunDatan(): Unit = {
    val perusteluId     = perusteluRepository.haePerustelu(hakemusId3.get).get.id
    val perustelu       = makePerusteluWithLausuntotieto().copy(id = perusteluId, hakemusId = Some(hakemusId3.get))
    var lausuntopyynnot = perusteluRepository.haeLausuntopyynnot(perusteluId.get)
    lausuntopyynnot = lausuntopyynnot.take(3)
    val perusteluJSON = perustelu2Json(
      perustelu.copy(id = perusteluId, lausuntopyynnot = lausuntopyynnot),
      "luotu",
      "muokattu",
      "muokkaaja"
    )

    when(
      userService.getEnrichedUserDetails(any)
    ).thenReturn(
      User(
        userOid = "test user",
        authorities = List()
      )
    )

    mvc
      .perform(
        post(s"/api/perustelu/$hakemusOid3")
          .`with`(csrf())
          .contentType(MediaType.APPLICATION_JSON)
          .content(perusteluJSON)
      )
      .andExpect(status().isOk)
      .andExpect(jsonPath("$.muokattu").isString)
      .andExpect(jsonPath("$.muokkaaja").isString)
      .andExpect(jsonPath("$.uoRoSisalto").isMap)
      .andExpect(content().json(perusteluJSON))
    mvc
      .perform(
        get(s"/api/perustelu/$hakemusOid3")
      )
      .andExpect(status().isOk)
      .andExpect(content().json(perusteluJSON))
    verify(auditLog, times(1)).logChanges(any(), any(), eqTo(AuditOperation.UpdatePerustelu), any())
  }

  @Test
  @WithMockUser(value = "kayttaja", authorities = Array(SecurityConstants.SECURITY_ROOLI_ESITTELIJA_FULL))
  @Order(11)
  def tallennaPerusteluWithAPPalauttaa200JaKantaanTallennetunDatan(): Unit = {
    val perusteluJSON = perustelu2Json(perustelu4, "id", "perusteluId", "luotu", "muokattu", "muokkaaja")
    when(
      userService.getEnrichedUserDetails(any)
    ).thenReturn(
      User(
        userOid = "test user",
        authorities = List()
      )
    )

    mvc
      .perform(
        post(s"/api/perustelu/${hakemusOid4}")
          .`with`(csrf())
          .contentType(MediaType.APPLICATION_JSON)
          .content(perusteluJSON)
      )
      .andExpect(status().isOk)
      .andExpect(jsonPath("$.id").isString)
      .andExpect(jsonPath("$.hakemusId").isString)
      .andExpect(jsonPath("$.luotu").isString)
      .andExpect(jsonPath("$.muokattu").isEmpty)
      .andExpect(jsonPath("$.muokkaaja").isEmpty)
      .andExpect(content().json(perusteluJSON))
    verify(auditLog, times(1)).logChanges(any(), any(), eqTo(AuditOperation.UpdatePerustelu), any())
  }

  @Test
  @WithMockUser(value = "kayttaja", authorities = Array(SecurityConstants.SECURITY_ROOLI_ESITTELIJA_FULL))
  @Order(12)
  def haePerusteluWithAPPalauttaa200(): Unit = {
    val perusteluId   = perusteluRepository.haePerustelu(hakemusId4.get).get.id
    val ap            = perustelu4.apSisalto
    val perustelu     = perustelu4.copy(id = perusteluId, apSisalto = ap)
    val perusteluJSON = perustelu2Json(perustelu, "luotu", "muokattu", "muokkaaja")

    mvc
      .perform(
        get(s"/api/perustelu/${hakemusOid4}")
      )
      .andExpect(status().isOk)
      .andExpect(jsonPath("$.hakemusId").isString)
      .andExpect(jsonPath("$.luotu").isString)
      .andExpect(jsonPath("$.muokattu").isEmpty)
      .andExpect(jsonPath("$.muokkaaja").isEmpty)
      .andExpect(content().json(perusteluJSON))
    verify(auditLog, times(1)).logRead(any(), any(), eqTo(AuditOperation.ReadPerustelu), any())
  }

  @Test
  @WithMockUser(value = "kayttaja", authorities = Array(SecurityConstants.SECURITY_ROOLI_ESITTELIJA_FULL))
  @Order(13)
  def tallennaMuokattuPerusteluWithAPPalauttaa200JaKantaanTallennetunDatan(): Unit = {
    val perusteluId = perusteluRepository.haePerustelu(hakemusId4.get).get.id
    var perustelu   = makePerusteluWithAP().copy(hakemusId = Some(hakemusId4.get))
    val ap          = perustelu.apSisalto
    perustelu = perustelu.copy(id = perusteluId, apSisalto = ap)
    val perusteluJSON = perustelu2Json(perustelu, "luotu", "muokattu", "muokkaaja")
    when(
      userService.getEnrichedUserDetails(any)
    ).thenReturn(
      User(
        userOid = "test user",
        authorities = List()
      )
    )

    mvc
      .perform(
        post(s"/api/perustelu/$hakemusOid4")
          .`with`(csrf())
          .contentType(MediaType.APPLICATION_JSON)
          .content(perusteluJSON)
      )
      .andExpect(status().isOk)
      .andExpect(jsonPath("$.muokattu").isString)
      .andExpect(jsonPath("$.muokkaaja").isString)
      .andExpect(content().json(perusteluJSON))
    mvc
      .perform(
        get(s"/api/perustelu/$hakemusOid4")
      )
      .andExpect(status().isOk)
      .andExpect(content().json(perusteluJSON))
    verify(auditLog, times(1)).logChanges(any(), any(), eqTo(AuditOperation.UpdatePerustelu), any())
  }
}
