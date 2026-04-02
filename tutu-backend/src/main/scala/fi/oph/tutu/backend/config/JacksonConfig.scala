package fi.oph.tutu.backend.config

import com.fasterxml.jackson.databind.module.SimpleModule
import com.fasterxml.jackson.databind.{DeserializationFeature, ObjectMapper, SerializationFeature}
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule
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

import java.time.LocalDateTime
import java.time.format.DateTimeFormatter
import com.fasterxml.jackson.datatype.jdk8.Jdk8Module

@Configuration
class JacksonConfig {

  @Bean
  @Primary
  def tutuMapper(): ObjectMapper = JacksonConfig.mapper
}

object JacksonConfig {
  lazy val mapper: ObjectMapper = configure(new ObjectMapper())

  private def configure(mapper: ObjectMapper): ObjectMapper = {
    mapper.registerModule(DefaultScalaModule)
    mapper.registerModule(new JavaTimeModule)
    mapper.registerModule(new Jdk8Module())

    val customModule = new SimpleModule()

    // LocalDateTime-kenttiin lisätään UTC-aikavyöhyke, vaikka LocalDateTime ei itsessään sisällä aikavyöhyketietoa.
    val formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
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
