package fi.oph.tutu.backend

import fi.oph.tutu.backend.domain.*
import com.fasterxml.jackson.databind.{ObjectMapper, SerializationFeature}
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule
import com.fasterxml.jackson.datatype.jsr310.deser.LocalDateTimeDeserializer
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateTimeSerializer
import com.fasterxml.jackson.module.scala.DefaultScalaModule
import fi.oph.tutu.backend.domain.AsiakirjamalliLahde.{aacrao, ece}
import fi.oph.tutu.backend.fixture.{createTutkinnotFixture, hakijaFixture}
import fi.oph.tutu.backend.repository.{
  AsiakirjaRepository,
  EsittelijaRepository,
  HakemusRepository,
  MaakoodiRepository,
  PaatosRepository,
  PerusteluRepository
}
import fi.oph.tutu.backend.service.{AtaruHakemusParser, HakemuspalveluService, KayttooikeusService}
import org.flywaydb.core.Flyway
import org.junit.jupiter.api.TestInstance.Lifecycle
import org.junit.jupiter.api.{AfterAll, BeforeAll, TestInstance}
import org.mockito.ArgumentMatchers.any
import org.mockito.Mockito.when
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.context.SpringBootTest.{UseMainMethod, WebEnvironment}
import org.springframework.test.context.bean.`override`.mockito.MockitoBean
import org.springframework.test.context.{DynamicPropertyRegistry, DynamicPropertySource}
import org.testcontainers.containers.PostgreSQLContainer
import org.testcontainers.containers.wait.strategy.Wait

import java.io.FileNotFoundException
import java.sql.DriverManager
import java.time.{Duration, LocalDateTime}
import java.time.format.DateTimeFormatter
import java.util.{Random, UUID}
import scala.io.Source

class OphPostgresContainer(dockerImageName: String)
    extends PostgreSQLContainer[OphPostgresContainer](dockerImageName) {}

object IntegrationTestBase extends Object {
  private val postgresContainer = new OphPostgresContainer("postgres:15")
    .withDatabaseName("tutu")
    .withUsername("app")
    .withPassword("app")
    .withReuse(true)
    .waitingFor(Wait.forListeningPort().withStartupTimeout(Duration.ofSeconds(30)))

  @DynamicPropertySource
  def configureProperties(registry: DynamicPropertyRegistry): Unit = {
    postgresContainer.start()
    registry.add("spring.datasource.url", () => postgresContainer.getJdbcUrl)
    registry.add(
      "spring.datasource.username",
      () => postgresContainer.getUsername
    )
    registry.add(
      "spring.datasource.password",
      () => postgresContainer.getPassword
    )
  }
}

@SpringBootTest(
  webEnvironment = WebEnvironment.RANDOM_PORT,
  useMainMethod = UseMainMethod.ALWAYS,
  classes = Array(classOf[TutuBackendApplication])
)
@TestInstance(Lifecycle.PER_CLASS)
class IntegrationTestBase {
  def loadJson(fileName: String): String = {
    val stream = Option(getClass.getClassLoader.getResourceAsStream(fileName))
      .getOrElse(throw new FileNotFoundException(s"$fileName not found in classpath"))

    Source.fromInputStream(stream).mkString
  }
  @Autowired
  private val flyway: Flyway = null

  @Autowired
  var esittelijaRepository: EsittelijaRepository = _

  @Autowired
  var maakoodiRepository: MaakoodiRepository = _

  @Autowired
  var hakemusRepository: HakemusRepository = _

  @Autowired
  var asiakirjaRepository: AsiakirjaRepository = _

  @Autowired
  var perusteluRepository: PerusteluRepository = _

  @Autowired
  var paatosRepository: PaatosRepository = _

  val LOG: Logger = LoggerFactory.getLogger(this.getClass)

  val POSTGRES_DATABASENAME = "tutu"
  val POSTGRES_USERNAME     = "app"
  val POSTGRES_PASSWORD     = "app"

  val postgres: OphPostgresContainer = IntegrationTestBase.postgresContainer

  @MockitoBean
  var kayttooikeusService: KayttooikeusService = _
  @MockitoBean
  var hakemuspalveluService: HakemuspalveluService = _
  @MockitoBean
  var ataruHakemusParser: AtaruHakemusParser = _

  val mapper = new ObjectMapper()
  mapper.registerModule(DefaultScalaModule)

  val formatter: DateTimeFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss")
  val javaTimeModule               = new JavaTimeModule()
  javaTimeModule.addSerializer(classOf[LocalDateTime], new LocalDateTimeSerializer(formatter))
  javaTimeModule.addDeserializer(classOf[LocalDateTime], new LocalDateTimeDeserializer(formatter))
  mapper.registerModule(javaTimeModule)
  mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS)

  @BeforeAll
  def startContainer(): Unit = {
    LOG.info("Starting PostgreSQL container for integration tests")
    if (!postgres.isRunning) {
      postgres.start()
      flyway.clean()
      flyway.migrate()
    } else {
      val conn = DriverManager.getConnection(postgres.getJdbcUrl, postgres.getUsername, postgres.getPassword)
      val stmt = conn.createStatement()

      val rs = stmt.executeQuery(
        """
          SELECT tablename FROM pg_tables
          WHERE schemaname = 'public'
          """
      )

      val tables = Iterator.continually(rs).takeWhile(_.next()).map(_.getString(1)).toList
      tables.foreach { t =>
        stmt.execute(s"TRUNCATE TABLE $t CASCADE;")
      }

      stmt.close()
      conn.close()
    }
  }

  @AfterAll
  def teardown(): Unit = {
    LOG.info("Shutting PostgreSQL container down")
    // postgres.stop()
  }

  val r = new Random()

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

  def randomStringOption: Option[String] = {
    Option(UUID.randomUUID().toString)
  }

  def initAtaruHakemusRequests(): Unit = {
    when(hakemuspalveluService.haeHakemus(any[HakemusOid]))
      .thenReturn(Right(loadJson("ataruHakemus6667.json")))
    when(hakemuspalveluService.haeMuutoshistoria(any[HakemusOid])).thenReturn(
      Right(loadJson("muutosHistoria.json"))
    )
    when(hakemuspalveluService.haeLomake(any[Long]))
      .thenReturn(Right(loadJson("ataruLomake.json")))
    when(ataruHakemusParser.parseHakija(any[AtaruHakemus])).thenReturn(hakijaFixture)
    when(ataruHakemusParser.parseTutkinnot(any[UUID], any[AtaruHakemus]))
      .thenAnswer { invocation =>
        val uuid = invocation.getArgument[UUID](0)
        createTutkinnotFixture(uuid)
      }

  }

  def addAsiakirjaStuffToHakemus(virkailijaOid: UserOid): UUID = {
    val asiakirjaId = asiakirjaRepository.tallennaUudetAsiakirjatiedot(Asiakirja(), virkailijaOid.toString())
    val apAction1   = asiakirjaRepository.luoPyydettavaAsiakirja(
      asiakirjaId,
      "tutkintotodistustenjaljennokset",
      virkailijaOid
    )
    val apAction2 = asiakirjaRepository.luoPyydettavaAsiakirja(
      asiakirjaId,
      "tyotodistukset",
      virkailijaOid
    )
    val malliAction1 = asiakirjaRepository.lisaaAsiakirjamalli(
      asiakirjaId,
      AsiakirjamalliTutkinnosta(ece, true, Some("Jotain kuvausta")),
      virkailijaOid
    )
    val malliAction2 = asiakirjaRepository.lisaaAsiakirjamalli(
      asiakirjaId,
      AsiakirjamalliTutkinnosta(aacrao, false, Some("Jotain muuta kuvausta")),
      virkailijaOid
    )
    asiakirjaRepository.db.run(
      asiakirjaRepository.db.combineIntDBIOs(Seq(apAction1, apAction2, malliAction1, malliAction2)),
      "lisaaPyydettavatAsiakirjatJaAsiakirjamalli"
    )
    asiakirjaId
  }
}
