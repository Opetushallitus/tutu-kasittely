package fi.oph.tutu.backend.repository

import com.fasterxml.jackson.databind.ObjectMapper
import fi.oph.tutu.backend.domain.{Kieli, Kielistetty}
import fi.oph.tutu.backend.utils.TutuJsonFormats
import org.springframework.beans.factory.annotation.Autowired
import slick.jdbc.GetResult

import java.util.UUID

class BaseResultHandlers extends TutuJsonFormats {
  @Autowired
  protected var jsonMapper: ObjectMapper = _

  implicit val getUUIDResult: GetResult[UUID] =
    GetResult(r => UUID.fromString(r.nextString()))

  protected def parseKielistetty(jsonString: String): Kielistetty = {
    val jsonMap = jsonMapper.readValue(jsonString, classOf[Map[String, String]])
    Map(
      Kieli.fi -> jsonMap.getOrElse("fi", ""),
      Kieli.sv -> jsonMap.getOrElse("sv", ""),
      Kieli.en -> jsonMap.getOrElse("en", "")
    )
  }

  protected def parseKielistettyOption(jsonString: Option[String]): Option[Kielistetty] = {
    jsonString.map(parseKielistetty)
  }

  protected def kielistettyToJson(kielistetty: Kielistetty): String = {
    val map = Map(
      "fi" -> kielistetty.getOrElse(Kieli.fi, ""),
      "sv" -> kielistetty.getOrElse(Kieli.sv, ""),
      "en" -> kielistetty.getOrElse(Kieli.en, "")
    )
    jsonMapper.writeValueAsString(map)
  }

  protected def kielistettyOptionToJson(kielistetty: Option[Kielistetty]): Option[String] = {
    kielistetty.map(kielistettyToJson)
  }
}
