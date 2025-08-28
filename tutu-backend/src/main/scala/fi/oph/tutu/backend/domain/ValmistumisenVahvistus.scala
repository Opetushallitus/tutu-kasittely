package fi.oph.tutu.backend.domain

import com.fasterxml.jackson.annotation.JsonIgnore
import com.fasterxml.jackson.core.{JsonParser, JsonToken}
import com.fasterxml.jackson.databind.{DeserializationContext, JsonDeserializer, JsonNode}

import java.time.LocalDateTime

enum ValmistumisenVahvistusVastaus {
  case Myonteinen, Kielteinen, EiVastausta
}

object ValmistumisenVahvistusVastaus {
  def fromString(value: String): ValmistumisenVahvistusVastaus = value match {
    case "Myonteinen"  => Myonteinen
    case "Kielteinen"  => Kielteinen
    case "EiVastausta" => EiVastausta
    case _             => null
  }
}

case class ValmistumisenVahvistus(
  valmistumisenVahvistus: Boolean,
  valmistumisenVahvistusPyyntoLahetetty: Option[LocalDateTime],
  valmistumisenVahvistusSaatu: Option[LocalDateTime],
  valmistumisenVahvistusVastaus: Option[ValmistumisenVahvistusVastaus],
  valmistumisenVahvistusLisatieto: Option[String]
) {
  def this(
    partialValmistumisenVahvistus: Option[ValmistumisenVahvistus]
  ) = this(
    valmistumisenVahvistus = partialValmistumisenVahvistus.exists(_.valmistumisenVahvistus),
    valmistumisenVahvistusPyyntoLahetetty = partialValmistumisenVahvistus
      .flatMap(_.valmistumisenVahvistusPyyntoLahetetty)
      .orElse(None),
    valmistumisenVahvistusSaatu = partialValmistumisenVahvistus
      .flatMap(_.valmistumisenVahvistusSaatu)
      .orElse(None),
    valmistumisenVahvistusVastaus = partialValmistumisenVahvistus
      .flatMap(_.valmistumisenVahvistusVastaus)
      .orElse(None),
    valmistumisenVahvistusLisatieto = partialValmistumisenVahvistus
      .flatMap(_.valmistumisenVahvistusLisatieto)
      .orElse(None)
  )

  @JsonIgnore
  def getPyyntoLahetettyIfVahvistusTrue: Option[LocalDateTime] =
    if (valmistumisenVahvistus) valmistumisenVahvistusPyyntoLahetetty else None
  @JsonIgnore
  def getSaatuIfVahvistusTrue: Option[LocalDateTime] =
    if (valmistumisenVahvistus) valmistumisenVahvistusSaatu else None
  @JsonIgnore
  def getVastausIfVahvistusTrue: Option[ValmistumisenVahvistusVastaus] =
    if (valmistumisenVahvistus) valmistumisenVahvistusVastaus else None
  @JsonIgnore
  def getLisatietoIfVahvistusTrue: Option[String] =
    if (valmistumisenVahvistus) valmistumisenVahvistusLisatieto else None
}

class ValmistumisenVahvistusDeserializer extends JsonDeserializer[ValmistumisenVahvistus] {
  override def deserialize(p: JsonParser, ctxt: DeserializationContext): ValmistumisenVahvistus = {
    if (p.getCurrentToken == JsonToken.VALUE_NULL) {
      ValmistumisenVahvistus(
        valmistumisenVahvistus = false,
        valmistumisenVahvistusPyyntoLahetetty = None,
        valmistumisenVahvistusSaatu = None,
        valmistumisenVahvistusVastaus = None,
        valmistumisenVahvistusLisatieto = None
      )
    } else {
      val node                   = p.getCodec.readTree[JsonNode](p)
      val valmistumisenVahvistus = node.get("valmistumisenVahvistus") match {
        case jsonNode if !jsonNode.isNull && jsonNode.isBoolean =>
          jsonNode.asBoolean()
        case _ => false
      }

      val valmistumisenVahvistusPyyntoLahetetty = Option(node.get("valmistumisenVahvistusPyyntoLahetetty"))
        .filterNot(_.isNull)
        .map(date => LocalDateTime.parse(date.asText))

      val valmistumisenVahvistusSaatu = Option(node.get("valmistumisenVahvistusSaatu"))
        .filterNot(_.isNull)
        .map(date => LocalDateTime.parse(date.asText))
      val valmistumisenVahvistusVastaus = Option(node.get("valmistumisenVahvistusVastaus"))
        .filterNot(_.isNull)
        .map { jsonNode =>
          jsonNode.asText() match {
            case "Myonteinen" => ValmistumisenVahvistusVastaus.Myonteinen
            case "Kielteinen" => ValmistumisenVahvistusVastaus.Kielteinen
            case _            => ValmistumisenVahvistusVastaus.EiVastausta
          }
        }
      val valmistumisenVahvistusLisatieto = Option(node.get("valmistumisenVahvistusLisatieto"))
        .filterNot(_.isNull)
        .map(_.asText)

      ValmistumisenVahvistus(
        valmistumisenVahvistus,
        valmistumisenVahvistusPyyntoLahetetty,
        valmistumisenVahvistusSaatu,
        valmistumisenVahvistusVastaus,
        valmistumisenVahvistusLisatieto
      )
    }
  }
}
