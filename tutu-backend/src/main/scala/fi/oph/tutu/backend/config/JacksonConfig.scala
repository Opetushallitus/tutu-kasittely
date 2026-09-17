package fi.oph.tutu.backend.config

import com.fasterxml.jackson.core.JsonParser
import com.fasterxml.jackson.databind.module.SimpleModule
import com.fasterxml.jackson.databind.{
  DeserializationContext,
  DeserializationFeature,
  JsonDeserializer,
  JsonMappingException,
  ObjectMapper,
  SerializationFeature
}
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule
import com.fasterxml.jackson.datatype.jsr310.deser.LocalDateTimeDeserializer
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateTimeSerializer
import com.fasterxml.jackson.module.scala.DefaultScalaModule
import fi.oph.tutu.backend.domain.{
  AnswerValue,
  AnswerValueDeserializer,
  Asiakirja,
  AsiakirjaDeserializer,
  AtaruHakemuksenTila,
  AtaruHakemuksenTilaDeserializer,
  HakemusOid,
  HakemusOidDeserializer,
  ImiPyynto,
  ImiPyyntoDeserializer,
  ValmistumisenVahvistus,
  ValmistumisenVahvistusDeserializer
}
import org.springframework.context.annotation.{Bean, Configuration, Primary}

import java.time.{LocalDateTime, ZoneOffset, ZonedDateTime}
import java.time.format.{DateTimeFormatter, DateTimeParseException}
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
    customModule.addSerializer(
      classOf[LocalDateTime],
      new LocalDateTimeSerializer(DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"))
    )
    // Kaikki backendille tulevat datetime -arvot deserialisoidaan UTC-aikavyöhykkeelle.
    customModule.addDeserializer(classOf[LocalDateTime], new MultiFormatToUtcDateTimeDeserializer())

    customModule.addDeserializer(classOf[HakemusOid], new HakemusOidDeserializer())
    customModule.addDeserializer(classOf[ImiPyynto], new ImiPyyntoDeserializer())
    customModule.addDeserializer(classOf[ValmistumisenVahvistus], new ValmistumisenVahvistusDeserializer())
    customModule.addDeserializer(classOf[Asiakirja], new AsiakirjaDeserializer())
    customModule.addDeserializer(classOf[AtaruHakemuksenTila], new AtaruHakemuksenTilaDeserializer())
    customModule.addDeserializer(classOf[AnswerValue], new AnswerValueDeserializer())
    mapper.registerModule(customModule)

    mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false)
    mapper.configure(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, false)
    mapper.configure(SerializationFeature.INDENT_OUTPUT, true)

    mapper
  }
}

class MultiFormatToUtcDateTimeDeserializer extends JsonDeserializer[LocalDateTime] {
  private val formats = List(
    DateTimeFormatter.ISO_LOCAL_DATE_TIME, // 2026-09-17T14:30:00
    DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSSX"),
    DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ssXXX")
  )

  override def deserialize(
    parser: JsonParser,
    ctxt: DeserializationContext
  ): LocalDateTime = {
    val value = parser.getValueAsString.trim

    formats.view
      .flatMap { format =>
        try Some(ZonedDateTime.parse(value, format).withZoneSameInstant(ZoneOffset.UTC).toLocalDateTime)
        catch {
          case _: DateTimeParseException => None
        }
      }
      .headOption
      .getOrElse {
        throw JsonMappingException.from(
          parser,
          s"Unsupported date-time format: '$value'"
        )
      }
  }
}
