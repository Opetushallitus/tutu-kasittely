package fi.oph.tutu.backend.domain

import com.fasterxml.jackson.core.{JsonParser, JsonToken}
import com.fasterxml.jackson.databind.{DeserializationContext, JsonDeserializer, JsonNode}

/**
 * Generic wrapper for Option[String] fields that need to distinguish between:
 * - undefined (field not in update)
 * - null (field explicitly cleared)
 * - string value (field has value)
 *
 * Used for all three-state string radio buttons with clear functionality.
 */
case class StringFieldWrapper(
  value: Option[String]
)

/**
 * Deserializer that handles both flat and nested JSON structures:
 * - Flat: "value"/null
 * - Nested: { "fieldName": "value"/null }
 */
class StringFieldWrapperDeserializer extends JsonDeserializer[StringFieldWrapper] {
  override def deserialize(p: JsonParser, ctxt: DeserializationContext): StringFieldWrapper = {
    p.getCurrentToken match {
      case JsonToken.VALUE_NULL =>
        StringFieldWrapper(value = None)
      case JsonToken.VALUE_STRING =>
        StringFieldWrapper(value = Some(p.getValueAsString))
      case _ =>
        // Handle nested structure: { "fieldName": { "fieldName": value } }
        val node  = p.getCodec.readTree[JsonNode](p)
        val value = {
          val iterator = node.fields()
          if (iterator.hasNext) {
            val entry     = iterator.next()
            val childNode = entry.getValue
            if (childNode.isNull) None
            else if (childNode.isTextual) Some(childNode.asText())
            else None
          } else None
        }
        StringFieldWrapper(value)
    }
  }
}
