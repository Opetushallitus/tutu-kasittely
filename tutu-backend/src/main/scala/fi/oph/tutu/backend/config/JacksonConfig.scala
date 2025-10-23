package fi.oph.tutu.backend.config

import com.fasterxml.jackson.databind.module.SimpleModule
import com.fasterxml.jackson.databind.{DeserializationFeature, ObjectMapper, SerializationFeature}
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule
import com.fasterxml.jackson.module.scala.DefaultScalaModule
import fi.oph.tutu.backend.domain.{
  HakemusOid,
  HakemusOidDeserializer,
  ImiPyynto,
  ImiPyyntoDeserializer,
  ValmistumisenVahvistus,
  ValmistumisenVahvistusDeserializer
}
import org.springframework.context.annotation.{Bean, Configuration, Primary}
import org.springframework.http.converter.json.Jackson2ObjectMapperBuilder

@Configuration
class JacksonConfig {

  @Bean
  @Primary
  def tutuMapper(builder: Jackson2ObjectMapperBuilder): ObjectMapper = {
    val mapper = builder.createXmlMapper(false).build[ObjectMapper]()
    mapper.registerModule(DefaultScalaModule)
    mapper.registerModule(new JavaTimeModule)

    val customModule = new SimpleModule()
    customModule.addDeserializer(classOf[HakemusOid], new HakemusOidDeserializer())
    customModule.addDeserializer(classOf[ImiPyynto], new ImiPyyntoDeserializer())
    customModule.addDeserializer(classOf[ValmistumisenVahvistus], new ValmistumisenVahvistusDeserializer())
    mapper.registerModule(customModule)

    mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false)
    mapper.configure(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, false)
    mapper.configure(SerializationFeature.INDENT_OUTPUT, true)

    mapper
  }
}
