package fi.oph.tutu.backend.domain

import com.fasterxml.jackson.core.{JsonParser, JsonToken}
import com.fasterxml.jackson.databind.{DeserializationContext, JsonDeserializer, JsonNode}

import java.time.LocalDateTime

case class ImiPyynto(
  imiPyynto: Option[Boolean],
  imiPyyntoNumero: Option[String] = None,
  imiPyyntoLahetetty: Option[LocalDateTime] = None,
  imiPyyntoVastattu: Option[LocalDateTime] = None
)

class ImiPyyntoDeserializer extends JsonDeserializer[ImiPyynto] {
  override def deserialize(p: JsonParser, ctxt: DeserializationContext): ImiPyynto = {
    if (p.getCurrentToken == JsonToken.VALUE_NULL) {
      ImiPyynto(
        imiPyynto = None,
        imiPyyntoNumero = None,
        imiPyyntoLahetetty = None,
        imiPyyntoVastattu = None
      )
    } else {
      val node      = p.getCodec.readTree[JsonNode](p)
      val imiPyynto = Option(node.get("imiPyynto")) match {
        case Some(jsonNode) if !jsonNode.isNull && jsonNode.isBoolean =>
          Some(jsonNode.asBoolean())
        case Some(_) =>
          None
        case None =>
          None
      }

      val imiPyyntoNumero = Option(node.get("imiPyyntoNumero"))
        .filterNot(_.isNull)
        .map(_.asText)

      val imiPyyntoLahetetty = Option(node.get("imiPyyntoLahetetty"))
        .filterNot(_.isNull)
        .map(date => LocalDateTime.parse(date.asText))

      val imiPyyntoVastattu = Option(node.get("imiPyyntoVastattu"))
        .filterNot(_.isNull)
        .map(date => LocalDateTime.parse(date.asText))

      ImiPyynto(imiPyynto, imiPyyntoNumero, imiPyyntoLahetetty, imiPyyntoVastattu)
    }
  }
}
