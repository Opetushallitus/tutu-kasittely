package fi.oph.tutu.backend.config

import com.fasterxml.jackson.databind.module.SimpleModule
import com.fasterxml.jackson.databind.{DeserializationFeature, ObjectMapper, SerializationFeature}
import com.fasterxml.jackson.datatype.jsr310.deser.LocalDateTimeDeserializer
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateTimeSerializer
import com.fasterxml.jackson.module.scala.DefaultScalaModule
import fi.oph.tutu.backend.domain.{
  Asiakirja,
  AsiakirjaDeserializer,
  HakemusOid,
  HakemusOidDeserializer,
  ImiPyynto,
  ImiPyyntoDeserializer,
  ValmistumisenVahvistus,
  ValmistumisenVahvistusDeserializer
}
import org.springframework.context.annotation.{Bean, Configuration, Primary}
import org.springframework.http.converter.json.Jackson2ObjectMapperBuilder

import java.time.LocalDateTime
import java.time.format.DateTimeFormatter

@Configuration
class JacksonConfig {

  @Bean
  @Primary
  def tutuMapper(builder: Jackson2ObjectMapperBuilder): ObjectMapper =
    JacksonConfig.configure(builder.createXmlMapper(false).build[ObjectMapper]())
}

object JacksonConfig {
  lazy val mapper: ObjectMapper = configure(new ObjectMapper())

  private def configure(mapper: ObjectMapper): ObjectMapper = {
    mapper.registerModule(DefaultScalaModule)

    val customModule = new SimpleModule()

    // LocalDateTime-kentät käsitellään UTC-ajassa
    val formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss'Z'")
    customModule.addSerializer(classOf[LocalDateTime], new LocalDateTimeSerializer(formatter))
    customModule.addDeserializer(classOf[LocalDateTime], new LocalDateTimeDeserializer(formatter))

    customModule.addDeserializer(classOf[HakemusOid], new HakemusOidDeserializer())
    customModule.addDeserializer(classOf[ImiPyynto], new ImiPyyntoDeserializer())
    customModule.addDeserializer(classOf[ValmistumisenVahvistus], new ValmistumisenVahvistusDeserializer())
    customModule.addDeserializer(classOf[Asiakirja], new AsiakirjaDeserializer())
    mapper.registerModule(customModule)

    mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false)
    mapper.configure(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, false)
    mapper.configure(SerializationFeature.INDENT_OUTPUT, true)

    mapper
  }
}
