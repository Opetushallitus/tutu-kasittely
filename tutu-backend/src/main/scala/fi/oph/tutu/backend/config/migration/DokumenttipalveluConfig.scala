package fi.oph.tutu.backend.config.migration

import fi.vm.sade.valinta.dokumenttipalvelu.Dokumenttipalvelu
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.{Bean, Configuration, Profile}

@Configuration
class DokumenttipalveluConfig:
  @Bean
  @Profile(Array("prod"))
  def prodDokumenttipalvelu(
    @Value("${aws.region}") region: String,
    @Value("${aws.bucket.name}") bucketName: String
  ): Dokumenttipalvelu =
    Dokumenttipalvelu(region, bucketName)

  @Bean
  @Profile(Array("dev", "test"))
  def mockDokumenttipalvelu(): Dokumenttipalvelu =
    new MockDokumenttipalvelu
