package fi.oph.tutu.backend

import fi.oph.tutu.backend.domain.{AtaruHakemus, HakemusOid}
import fi.oph.tutu.backend.fixture.hakijaFixture
import fi.oph.tutu.backend.service.{AtaruHakemusParser, HakemuspalveluService}
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
import java.time.Duration
import scala.io.Source

class OphPostgresContainer(dockerImageName: String)
    extends PostgreSQLContainer[OphPostgresContainer](dockerImageName) {}

object IntegrationTestBase extends Object {
  private val postgresContainer = new OphPostgresContainer("postgres:15")
    .withDatabaseName("tutu")
    .withUsername("app")
    .withPassword("app")
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

  val LOG: Logger = LoggerFactory.getLogger(this.getClass)

  val POSTGRES_DATABASENAME = "tutu"
  val POSTGRES_USERNAME     = "app"
  val POSTGRES_PASSWORD     = "app"

  val postgres: OphPostgresContainer = IntegrationTestBase.postgresContainer

  @MockitoBean
  var hakemuspalveluService: HakemuspalveluService = _
  @MockitoBean
  var ataruHakemusParser: AtaruHakemusParser = _

  @BeforeAll
  def startContainer(): Unit = {
    LOG.info("Starting PostgreSQL container for integration tests")
    if (!postgres.isRunning) {
      postgres.start()
      flyway.clean()
      flyway.migrate()
    }
  }

  @AfterAll
  def teardown(): Unit = {
    LOG.info("Shutting PostgreSQL container down")
    postgres.stop()
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
  }
}
