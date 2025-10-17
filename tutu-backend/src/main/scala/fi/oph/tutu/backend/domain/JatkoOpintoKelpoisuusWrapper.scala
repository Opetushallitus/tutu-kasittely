package fi.oph.tutu.backend.domain

import com.fasterxml.jackson.core.{JsonParser, JsonToken}
import com.fasterxml.jackson.databind.{DeserializationContext, JsonDeserializer, JsonNode}

case class JatkoOpintoKelpoisuusWrapper(
  jatkoOpintoKelpoisuus: Option[String]
)

object JatkoOpintoKelpoisuusWrapper {
  def fromPartial(partialJatkoOpintoKelpoisuus: Option[JatkoOpintoKelpoisuusWrapper]): JatkoOpintoKelpoisuusWrapper =
    JatkoOpintoKelpoisuusWrapper(
      jatkoOpintoKelpoisuus = partialJatkoOpintoKelpoisuus.flatMap(_.jatkoOpintoKelpoisuus).orElse(None)
    )
}

class JatkoOpintoKelpoisuusWrapperDeserializer extends JsonDeserializer[JatkoOpintoKelpoisuusWrapper] {
  override def deserialize(p: JsonParser, ctxt: DeserializationContext): JatkoOpintoKelpoisuusWrapper = {
    p.getCurrentToken match {
      case JsonToken.VALUE_NULL =>
        JatkoOpintoKelpoisuusWrapper(jatkoOpintoKelpoisuus = None)
      case JsonToken.VALUE_STRING =>
        JatkoOpintoKelpoisuusWrapper(jatkoOpintoKelpoisuus = Some(p.getValueAsString))
      case _ =>
        val node                  = p.getCodec.readTree[JsonNode](p)
        val jatkoOpintoKelpoisuus = Option(node.get("jatkoOpintoKelpoisuus")) match {
          case Some(jsonNode) if !jsonNode.isNull && jsonNode.isTextual =>
            Some(jsonNode.asText())
          case Some(jsonNode) if jsonNode.isNull =>
            None
          case _ => None
        }
        JatkoOpintoKelpoisuusWrapper(jatkoOpintoKelpoisuus)
    }
  }
}
