package fi.oph.tutu.backend.domain

import com.fasterxml.jackson.core.{JsonParser, JsonToken}
import com.fasterxml.jackson.databind.{DeserializationContext, JsonDeserializer, JsonNode}
import io.swagger.v3.oas.annotations.media.Schema
import io.swagger.v3.oas.annotations.media.Schema.RequiredMode

import java.time.LocalDateTime
import java.util.UUID
import scala.annotation.meta.field

/* ------- */

case class MuistioPostBody(
  nakyvyys: String = "sisainen",
  sisalto: String = ""
)

case class Muistio(
  id: UUID,
  hakemus_id: UUID,
  sisalto: String = "",
  luotu: LocalDateTime,
  luoja: String,
  muokattu: Option[LocalDateTime] = None,
  muokkaaja: String,
  sisainenHuomio: Boolean = false,
  hakemuksenOsa: String = ""
)
