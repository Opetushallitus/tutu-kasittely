package fi.oph.tutu.backend.domain

import com.fasterxml.jackson.core.{JsonParser, JsonToken}
import com.fasterxml.jackson.databind.{DeserializationContext, JsonDeserializer, JsonNode}

/**
 * Generic wrapper for Option[Boolean] fields that need to distinguish between:
 * - undefined (field not in update)
 * - null (field explicitly cleared)
 * - true/false (field has value)
 *
 * Used for all three-state boolean radio buttons with clear functionality.
 */
case class BooleanFieldWrapper(
  value: Option[Boolean]
)

object BooleanFieldWrapper {
  def fromPartial(partialWrapper: Option[BooleanFieldWrapper]): BooleanFieldWrapper =
    BooleanFieldWrapper(
      value = partialWrapper.flatMap(_.value).orElse(None)
    )
}

/**
 * Deserializer that handles both flat and nested JSON structures:
 * - Flat: true/false/null
 * - Nested: { "fieldName": true/false/null }
 */
class BooleanFieldWrapperDeserializer extends JsonDeserializer[BooleanFieldWrapper] {
  override def deserialize(p: JsonParser, ctxt: DeserializationContext): BooleanFieldWrapper = {
    p.getCurrentToken match {
      case JsonToken.VALUE_NULL =>
        BooleanFieldWrapper(value = None)
      case JsonToken.VALUE_TRUE =>
        BooleanFieldWrapper(value = Some(true))
      case JsonToken.VALUE_FALSE =>
        BooleanFieldWrapper(value = Some(false))
      case _ =>
        // Handle nested structure: { "fieldName": { "fieldName": value } }
        val node  = p.getCodec.readTree[JsonNode](p)
        val value = {
          val iterator = node.fields()
          if (iterator.hasNext) {
            val entry     = iterator.next()
            val childNode = entry.getValue
            if (childNode.isNull) None
            else if (childNode.isBoolean) Some(childNode.asBoolean())
            else None
          } else None
        }
        BooleanFieldWrapper(value)
    }
  }
}
