package fi.oph.tutu.backend

import org.slf4j.{Logger, LoggerFactory}
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.{ApplicationArguments, ApplicationRunner, SpringApplication}
import org.springframework.context.annotation.{Bean, Profile}
import org.springframework.web.servlet.config.annotation.{CorsRegistry, WebMvcConfigurer}

object TutuBackendApplication {
  val CALLER_ID = "1.2.246.562.10.00000000001.tutu-virkailija"

  def main(args: Array[String]): Unit = {
    SpringApplication.run(classOf[TutuBackendApplication], args: _*)
  }
}

@SpringBootApplication
class TutuBackendApplication {

  val LOG: Logger = LoggerFactory.getLogger(classOf[TutuBackendApplication])

  @Bean
  def applicationRunner(): ApplicationRunner =
    (args: ApplicationArguments) => {
      LOG.info("STARTED TUTU APPLICATION RUNNER")
    }

  @Profile(Array("dev"))
  @Bean
  def corsConfigurer(): WebMvcConfigurer = new WebMvcConfigurer {
    override def addCorsMappings(registry: CorsRegistry): Unit = {
      registry.addMapping("/**").allowedOrigins("https://localhost:3405")
    }
  }
}
