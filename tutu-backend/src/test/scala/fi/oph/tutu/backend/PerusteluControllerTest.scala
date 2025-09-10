package fi.oph.tutu.backend

import com.fasterxml.jackson.databind.{ObjectMapper, SerializationFeature}
import com.fasterxml.jackson.databind.node.ObjectNode
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule
import com.fasterxml.jackson.datatype.jsr310.deser.LocalDateTimeDeserializer
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateTimeSerializer
import com.fasterxml.jackson.module.scala.DefaultScalaModule
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
import org.springframework.boot.test.autoconfigure.web.servlet.{AutoConfigureMockMvc, WebMvcTest}
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
import java.time.format.DateTimeFormatter
import java.util.{Random, UUID}

val uuidTemplate1 = "11111111-2222-3333-4444-555555555555"
val r             = new Random();

def pick[T](items: Seq[T]): T = {
  val index = r.nextInt(items.length)
  items(index)
}

def pickBooleanOption: Option[Boolean] = {
  pick(Seq(Some(true), Some(false)))
}

def pickBoolean: Boolean = {
  pick(Seq(true, false))
}

def randomString: String = {
  UUID.randomUUID().toString
}

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

def makePerustelu(
  virallinenTutkinnonMyontaja: Option[Boolean] = pickBooleanOption,
  virallinenTutkinto: Option[Boolean] = pickBooleanOption,
  lahdeLahtomaanKansallinenLahde: Boolean = pickBoolean,
  lahdeLahtomaanVirallinenVastaus: Boolean = pickBoolean,
  lahdeKansainvalinenHakuteosTaiVerkkosivusto: Boolean = pickBoolean,
  selvitysTutkinnonMyontajastaJaTutkinnonVirallisuudesta: String = randomString,
  ylimmanTutkinnonAsemaLahtomaanJarjestelmassa: Option[String] = pickTutkinnonAsema,
  selvitysTutkinnonAsemastaLahtomaanJarjestelmassa: String = randomString
): Perustelu = {
  Perustelu(
    null,
    UUID.fromString(uuidTemplate1),
    virallinenTutkinnonMyontaja,
    virallinenTutkinto,
    lahdeLahtomaanKansallinenLahde,
    lahdeLahtomaanVirallinenVastaus,
    lahdeKansainvalinenHakuteosTaiVerkkosivusto,
    selvitysTutkinnonMyontajastaJaTutkinnonVirallisuudesta,
    ylimmanTutkinnonAsemaLahtomaanJarjestelmassa,
    selvitysTutkinnonAsemastaLahtomaanJarjestelmassa,
    LocalDateTime.now(),
    "test user",
    Option(LocalDateTime.now()),
    Option("test user")
  )
}

def makePerusteluWithUoro(
  virallinenTutkinnonMyontaja: Option[Boolean] = pickBooleanOption,
  virallinenTutkinto: Option[Boolean] = pickBooleanOption,
  lahdeLahtomaanKansallinenLahde: Boolean = pickBoolean,
  lahdeLahtomaanVirallinenVastaus: Boolean = pickBoolean,
  lahdeKansainvalinenHakuteosTaiVerkkosivusto: Boolean = pickBoolean,
  selvitysTutkinnonMyontajastaJaTutkinnonVirallisuudesta: String = randomString,
  ylimmanTutkinnonAsemaLahtomaanJarjestelmassa: Option[String] = pickTutkinnonAsema,
  selvitysTutkinnonAsemastaLahtomaanJarjestelmassa: String = randomString
): Perustelu = {
  Perustelu(
    null,
    UUID.randomUUID(),
    virallinenTutkinnonMyontaja,
    virallinenTutkinto,
    lahdeLahtomaanKansallinenLahde,
    lahdeLahtomaanVirallinenVastaus,
    lahdeKansainvalinenHakuteosTaiVerkkosivusto,
    selvitysTutkinnonMyontajastaJaTutkinnonVirallisuudesta,
    ylimmanTutkinnonAsemaLahtomaanJarjestelmassa,
    selvitysTutkinnonAsemastaLahtomaanJarjestelmassa,
    LocalDateTime.now(),
    "test user",
    Option(LocalDateTime.now()),
    Option("test user"),
    None,
    Some(
      PerusteluUoRo(
        Some(UUID.randomUUID()),
        null,
        PerusteluUoRoSisalto(
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
          Some(true),
          Some(true),
          Some(true),
          Some(true),
          Some(true),
          Some(true),
          Some(true),
          Some(true),
          Some(true),
          Some(true),
          Some("se on just nii")
        ),
        Some(LocalDateTime.now()),
        Some("test user"),
        Option(LocalDateTime.now()),
        Option("test user")
      )
    )
  )
}

def makePerusteluWithLausuntotieto(): Perustelu = {
  makePerustelu().copy(lausuntotieto =
    Some(
      Lausuntotieto(
        pyyntojenLisatiedot = Some(randomString),
        sisalto = Some(randomString),
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
    )
  )
}

@AutoConfigureMockMvc
@TestInstance(Lifecycle.PER_CLASS)
@ActiveProfiles(Array("test"))
@TestMethodOrder(classOf[OrderAnnotation])
class PerusteluControllerTest extends IntegrationTestBase {

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

  val mapper = new ObjectMapper()
  mapper.registerModule(DefaultScalaModule)

  val formatter: DateTimeFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss")
  val javaTimeModule               = new JavaTimeModule()
  javaTimeModule.addSerializer(classOf[LocalDateTime], new LocalDateTimeSerializer(formatter))
  javaTimeModule.addDeserializer(classOf[LocalDateTime], new LocalDateTimeDeserializer(formatter))
  mapper.registerModule(javaTimeModule)
  mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS)

  val hakemusOid: HakemusOid  = HakemusOid("1.2.246.562.11.00000000000000006666")
  var hakemusId: Option[UUID] = None
  var perustelu: Perustelu    = makePerustelu()

  val hakemusOid2: HakemusOid  = HakemusOid("1.2.246.562.11.00000000000000006667")
  var hakemusId2: Option[UUID] = None
  var perustelu2: Perustelu    = makePerusteluWithUoro()

  val hakemusOid3: HakemusOid  = HakemusOid("1.2.246.562.11.00000000000000006668")
  var hakemusId3: Option[UUID] = None
  var perustelu3: Perustelu    = makePerusteluWithLausuntotieto()

  def perustelu2Json(perustelu: Perustelu, ignoreFields: String*): String = {
    val lausuntotieto      = perustelu.lausuntotieto.orNull
    val lausuntotietoAsMap =
      if (lausuntotieto != null)
        lausuntotieto.productElementNames.toList
          .zip(lausuntotieto.productIterator.toList)
          .toMap -- ignoreFields + ("lausuntopyynnot" -> lausuntotieto.lausuntopyynnot
          .map(lp => lp.productElementNames.toList.zip(lp.productIterator.toList).toMap -- ignoreFields))
      else null

    val uoro      = perustelu.perusteluUoRo.orNull
    val uoroAsMap =
      if (uoro != null) uoro.productElementNames.toList.zip(uoro.productIterator.toList).toMap -- ignoreFields else null
    val perusteluAsMap = perustelu.productElementNames.toList
      .zip(perustelu.productIterator.toList)
      .toMap -- ignoreFields + ("lausuntotieto" -> lausuntotietoAsMap, "perusteluUoRo" -> uoroAsMap)
    mapper.writeValueAsString(perusteluAsMap)
  }

  @BeforeAll def setup(): Unit = {
    val configurer: MockMvcConfigurer =
      SecurityMockMvcConfigurers.springSecurity()
    val intermediate: DefaultMockMvcBuilder =
      MockMvcBuilders.webAppContextSetup(context).apply(configurer)
    mvc = intermediate.build()
    hakemusId = Some(hakemusRepository.tallennaHakemus(hakemusOid, 1, None, "testi"))
    perustelu = perustelu.copy(hakemusId = hakemusId.get)
    hakemusId2 = Some(hakemusRepository.tallennaHakemus(hakemusOid2, 1, None, "testi"))
    perustelu2 = perustelu2.copy(hakemusId = hakemusId2.get)
    hakemusId3 = Some(hakemusRepository.tallennaHakemus(hakemusOid3, 1, None, "testi"))
    perustelu3 = perustelu3.copy(hakemusId = hakemusId3.get)
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
      .andExpect(jsonPath("$.hakemusId").isString)
      .andExpect(jsonPath("$.luotu").isString)
      .andExpect(jsonPath("$.luoja").isString)
      .andExpect(jsonPath("$.muokattu").isEmpty)
      .andExpect(jsonPath("$.muokkaaja").isEmpty)
      .andExpect(jsonPath("$.lausuntotieto").isEmpty)
      .andExpect(jsonPath("$.perusteluUoRo").isEmpty)
      .andExpect(content().json(perusteluJSON))
    verify(auditLog, times(1)).logCreate(any(), any(), eqTo(AuditOperation.CreatePerustelu), any())
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
      .andExpect(jsonPath("$.lausuntotieto").isEmpty)
      .andExpect(jsonPath("$.perusteluUoRo").isEmpty)
      .andExpect(content().json(perusteluJSON))
    verify(auditLog, times(1)).logRead(any(), any(), eqTo(AuditOperation.ReadPerustelu), any())
  }

  @Test
  @WithMockUser(value = "kayttaja", authorities = Array(SecurityConstants.SECURITY_ROOLI_ESITTELIJA_FULL))
  @Order(3)
  def tallennaMuokattuPerusteluPalauttaa200JaKantaanTallennetunDatan(): Unit = {
    val perusteluId   = perusteluRepository.haePerustelu(hakemusId.get).get.id
    val perusteluJSON = perustelu2Json(
      makePerustelu().copy(id = perusteluId, hakemusId = hakemusId.get),
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
    verify(auditLog, times(1)).logCreate(any(), any(), eqTo(AuditOperation.CreatePerustelu), any())
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
      .andExpect(jsonPath("$.lausuntotieto").isEmpty)
      .andExpect(content().json(perusteluJSON))
    verify(auditLog, times(1)).logCreate(any(), any(), eqTo(AuditOperation.CreatePerustelu), any())
  }

  @Test
  @WithMockUser(value = "kayttaja", authorities = Array(SecurityConstants.SECURITY_ROOLI_ESITTELIJA_FULL))
  @Order(6)
  def haePerusteluWithUoroPalauttaa200(): Unit = {
    val perusteluId   = perusteluRepository.haePerustelu(hakemusId2.get).get.id
    val uoroId        = perusteluRepository.haePerusteluUoRo(perusteluId).get.id
    val uoro          = perustelu2.perusteluUoRo.get.copy(id = uoroId, perusteluId = perusteluId)
    val perustelu     = perustelu2.copy(id = perusteluId, perusteluUoRo = Some(uoro))
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
      .andExpect(jsonPath("$.lausuntotieto").isEmpty)
      .andExpect(content().json(perusteluJSON))
    verify(auditLog, times(1)).logRead(any(), any(), eqTo(AuditOperation.ReadPerustelu), any())
  }

  @Test
  @WithMockUser(value = "kayttaja", authorities = Array(SecurityConstants.SECURITY_ROOLI_ESITTELIJA_FULL))
  @Order(7)
  def tallennaMuokattuPerusteluWithUoRoPalauttaa200JaKantaanTallennetunDatan(): Unit = {
    val perusteluId = perusteluRepository.haePerustelu(hakemusId2.get).get.id
    val uoroId      = perusteluRepository.haePerusteluUoRo(perusteluId).get.id
    var perustelu   = makePerusteluWithUoro().copy(hakemusId = hakemusId2.get)
    val uoro        = perustelu.perusteluUoRo.get.copy(id = uoroId, perusteluId = perusteluId)
    perustelu = perustelu.copy(id = perusteluId, perusteluUoRo = Some(uoro))
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
      .andExpect(jsonPath("$.lausuntotieto").isEmpty)
      .andExpect(content().json(perusteluJSON))
    mvc
      .perform(
        get(s"/api/perustelu/$hakemusOid2")
      )
      .andExpect(status().isOk)
      .andExpect(content().json(perusteluJSON))
    verify(auditLog, times(1)).logCreate(any(), any(), eqTo(AuditOperation.CreatePerustelu), any())
  }

  @Test
  @WithMockUser(value = "kayttaja", authorities = Array(SecurityConstants.SECURITY_ROOLI_ESITTELIJA_FULL))
  @Order(8)
  def tallennaPerusteluWithLausuntotietoPalauttaa200JaKantaanTallennetunDatan(): Unit = {
    val perusteluJSON =
      perustelu2Json(perustelu3, "id", "perusteluId", "lausuntotietoId", "luotu", "muokattu", "muokkaaja")

    println("!!!!!!!!!!!!!!!!!!!!!!!!! " + perusteluJSON)
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
      .andExpect(jsonPath("$.perusteluUoRo").isEmpty)
      .andExpect(content().json(perusteluJSON))
    verify(auditLog, times(1)).logCreate(any(), any(), eqTo(AuditOperation.CreatePerustelu), any())
  }

  @Test
  @WithMockUser(value = "kayttaja", authorities = Array(SecurityConstants.SECURITY_ROOLI_ESITTELIJA_FULL))
  @Order(9)
  def haePerusteluWithLausuntotietoPalauttaa200(): Unit = {
    val perusteluId         = perusteluRepository.haePerustelu(hakemusId3.get).get.id
    val lausuntotietoId     = perusteluRepository.haeLausuntotieto(perusteluId).get.id
    val lausuntopyynnotInDb = perusteluRepository.haeLausuntopyynnot(lausuntotietoId.get)
    val lausuntopyynnot     = perustelu3.lausuntotieto.get.lausuntopyynnot.map(lp =>
      lp.copy(
        lausuntotietoId = lausuntotietoId.get,
        id = lausuntopyynnotInDb.find(_.lausunnonAntaja == lp.lausunnonAntaja).get.id
      )
    )
    val lausuntotieto = perustelu3.lausuntotieto.get.copy(
      id = lausuntotietoId,
      perusteluId = perusteluId,
      lausuntopyynnot = lausuntopyynnot
    )
    val perusteluJSON = perustelu2Json(
      perustelu3.copy(id = perusteluId, lausuntotieto = Some(lausuntotieto)),
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
      .andExpect(jsonPath("$.perusteluUoRo").isEmpty)
      .andExpect(content().json(perusteluJSON))
    verify(auditLog, times(1)).logRead(any(), any(), eqTo(AuditOperation.ReadPerustelu), any())
  }

  @Test
  @WithMockUser(value = "kayttaja", authorities = Array(SecurityConstants.SECURITY_ROOLI_ESITTELIJA_FULL))
  @Order(10)
  def tallennaMuokattuPerusteluWithLausuntotietoPalauttaa200JaKantaanTallennetunDatan(): Unit = {
    val perusteluId                 = perusteluRepository.haePerustelu(hakemusId3.get).get.id
    val lausuntotietoId             = perusteluRepository.haeLausuntotieto(perusteluId).get.id
    val lausuntopyynnotInDbIterator = perusteluRepository.haeLausuntopyynnot(lausuntotietoId.get).iterator
    val perustelu       = makePerusteluWithLausuntotieto().copy(id = perusteluId, hakemusId = hakemusId3.get)
    var lausuntopyynnot = perustelu.lausuntotieto.get.lausuntopyynnot.map(lp =>
      lp.copy(
        lausuntotietoId = lausuntotietoId.get,
        id = lausuntopyynnotInDbIterator.next().id
      )
    )
    lausuntopyynnot = lausuntopyynnot.take(3)
    val lausuntotieto = perustelu.lausuntotieto.get.copy(
      id = lausuntotietoId,
      perusteluId = perusteluId,
      lausuntopyynnot = lausuntopyynnot
    )
    val perusteluJSON = perustelu2Json(
      perustelu.copy(id = perusteluId, lausuntotieto = Some(lausuntotieto)),
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
      .andExpect(jsonPath("$.perusteluUoRo").isEmpty)
      .andExpect(content().json(perusteluJSON))
    mvc
      .perform(
        get(s"/api/perustelu/$hakemusOid3")
      )
      .andExpect(status().isOk)
      .andExpect(content().json(perusteluJSON))
    verify(auditLog, times(1)).logCreate(any(), any(), eqTo(AuditOperation.CreatePerustelu), any())
  }
}
