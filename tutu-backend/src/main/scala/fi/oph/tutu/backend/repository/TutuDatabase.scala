package fi.oph.tutu.backend.repository

import com.zaxxer.hikari.{HikariConfig, HikariDataSource}
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.stereotype.Component
import slick.dbio.DBIO
import slick.jdbc.PostgresProfile.api._
import slick.jdbc.JdbcBackend.Database
import slick.jdbc.TransactionIsolation.Serializable
import slick.util.AsyncExecutor

import java.util.concurrent.TimeUnit
import scala.concurrent.Await
import scala.concurrent.duration.Duration
import scala.util.{Failure, Success, Try}

@Component
class TutuDatabase(
  @Value("${spring.datasource.url}") url: String,
  @Value("${spring.datasource.username}") username: String,
  @Value("${spring.datasource.password}") password: String
) {

  val LOG = LoggerFactory.getLogger(classOf[TutuDatabase]);

  private def hikariConfig: HikariConfig = {
    val config = new HikariConfig()
    config.setJdbcUrl(url)
    config.setUsername(username)
    config.setPassword(password)
    val maxPoolSize = 10
    config.setMaximumPoolSize(maxPoolSize)
    config.setMinimumIdle(1)
    config
  }

  @Bean
  val db = {
    val executor = AsyncExecutor("tutu", hikariConfig.getMaximumPoolSize, 1000)
    Database.forDataSource(
      new HikariDataSource(hikariConfig),
      maxConnections = Some(hikariConfig.getMaximumPoolSize),
      executor
    )
  }

  val timeout: Duration = Duration(10, TimeUnit.MINUTES)

  def run[R](operations: DBIO[R], id: String): R = {
    LOG.info(s"Running db query: $id")

    val result = Await.result(
      db.run(operations),
      timeout
    )

    LOG.info(s"Db query finished: $id")
    result
  }

  def runTransactionally[R](operations: DBIO[R], id: String): Try[R] = {
    LOG.info(s"Running db transaction: $id")

    try {
      val result = Await.result(db.run(operations.transactionally.withTransactionIsolation(Serializable)), timeout)
      LOG.info(s"Db transaction finished: $id")
      Success[R](result)
    } catch {
      case e: Exception =>
        LOG.error("Error in transactional db query", e)
        Failure(e)
    }
  }

  def runSimple[R](operations: DBIO[R]): Unit = {
    val result = Await.result(
      db.run(operations),
      timeout
    )
  }

  def combineIntDBIOs(ints: Seq[DBIO[Int]]): DBIO[Int] = {
    import scala.concurrent.ExecutionContext.Implicits.global
    DBIO.fold(ints, 0)(_ + _)
  }
}
