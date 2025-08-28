package fi.oph.tutu.backend.domain

import com.fasterxml.jackson.annotation.JsonIgnore
import com.fasterxml.jackson.core.{JsonParser, JsonToken}
import com.fasterxml.jackson.databind.{DeserializationContext, JsonDeserializer, JsonNode}

import java.time.LocalDateTime

case class ImiPyynto(
  imiPyynto: Option[Boolean],
  imiPyyntoNumero: Option[String] = None,
  imiPyyntoLahetetty: Option[LocalDateTime] = None,
  imiPyyntoVastattu: Option[LocalDateTime] = None
) {
  def this(partialImiPyynto: Option[ImiPyynto]) =
    this(
      imiPyynto = partialImiPyynto.flatMap(_.imiPyynto).orElse(None),
      imiPyyntoNumero = partialImiPyynto.flatMap(_.imiPyyntoNumero).orElse(None),
      imiPyyntoLahetetty = partialImiPyynto.flatMap(_.imiPyyntoLahetetty).orElse(None),
      imiPyyntoVastattu = partialImiPyynto.flatMap(_.imiPyyntoVastattu).orElse(None)
    )

  @JsonIgnore
  def getNumeroIfPyyntoTrue: Option[String] =
    if (imiPyynto.contains(true)) imiPyyntoNumero else None
  @JsonIgnore
  def getLahetettyIfPyyntoTrue: Option[LocalDateTime] =
    if (imiPyynto.contains(true)) imiPyyntoLahetetty else None
  @JsonIgnore
  def getVastattuIfPyyntoTrue: Option[LocalDateTime] =
    if (imiPyynto.contains(true)) imiPyyntoVastattu else None
}

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
