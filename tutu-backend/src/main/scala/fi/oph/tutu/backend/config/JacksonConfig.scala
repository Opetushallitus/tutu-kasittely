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
import org.springframework.http.converter.json.Jackson2ObjectMapperBuilder

import java.time.LocalDateTime
import java.time.format.DateTimeFormatter

@Configuration
class JacksonConfig {

  @Bean
  @Primary
  def tutuMapper(builder: Jackson2ObjectMapperBuilder): ObjectMapper = {
    val mapper = builder.createXmlMapper(false).build[ObjectMapper]()
    mapper.registerModule(DefaultScalaModule)

    val formatter: DateTimeFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss")
    val javaTimeModule               = new JavaTimeModule()
    javaTimeModule.addSerializer(classOf[LocalDateTime], new LocalDateTimeSerializer(formatter))
    javaTimeModule.addDeserializer(classOf[LocalDateTime], new LocalDateTimeDeserializer(formatter))
    mapper.registerModule(javaTimeModule)

    val customModule = new SimpleModule()
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
