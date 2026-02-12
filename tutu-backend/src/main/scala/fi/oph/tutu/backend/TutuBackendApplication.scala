package fi.oph.tutu.backend

import org.slf4j.{Logger, LoggerFactory}
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.context.properties.EnableConfigurationProperties
import org.springframework.boot.{ApplicationArguments, ApplicationRunner, SpringApplication}
import org.springframework.context.annotation.Bean

object TutuBackendApplication {
  val CALLER_ID = "1.2.246.562.10.00000000001.tutu-virkailija"

  def main(args: Array[String]): Unit =
    SpringApplication.run(classOf[TutuBackendApplication], args: _*)
}

@SpringBootApplication
@EnableConfigurationProperties
class TutuBackendApplication {

  val LOG: Logger = LoggerFactory.getLogger(classOf[TutuBackendApplication])

  @Bean
  def applicationRunner(): ApplicationRunner =
    (args: ApplicationArguments) => LOG.info("STARTED TUTU APPLICATION RUNNER")
}
