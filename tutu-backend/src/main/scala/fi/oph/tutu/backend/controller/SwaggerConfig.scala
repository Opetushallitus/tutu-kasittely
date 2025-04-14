package fi.oph.tutu.backend.controller

import io.swagger.v3.oas.models.info.Info
import io.swagger.v3.oas.models.{Components, OpenAPI}
import org.springdoc.core.models.GroupedOpenApi
import org.springframework.context.annotation.{Bean, Configuration}

@Configuration
class SwaggerConfig {

  @Bean
  def publicApi(): GroupedOpenApi = {
    GroupedOpenApi
      .builder()
      .group("tutu-apis")
      .pathsToMatch("/**")
      .build()
  }

  @Bean
  def ovaraOpenApi(): OpenAPI = {
    OpenAPI()
      .info(Info().title("Tutu API").version("1"))
      .components(
        Components()
      )
  }

}
