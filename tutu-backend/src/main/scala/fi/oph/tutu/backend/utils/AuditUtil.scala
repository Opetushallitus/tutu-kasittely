package fi.oph.tutu.backend.utils

import fi.vm.sade.auditlog.Changes
import com.fasterxml.jackson.databind.{JsonNode, ObjectMapper}
import scala.jdk.CollectionConverters._

object AuditUtil {
  private val mapper = new ObjectMapper()

  /**
   * Compares two JSON strings and creates a Changes object containing:
   * - Added: new key-value pairs in the after JSON
   * - Updated: changed values for existing keys
   * - Removed: key-value pairs that were in the before JSON but not in the after JSON
   *
   * @param before Optional JSON string representing the state before changes
   * @param after Optional JSON string representing the state after changes
   * @return Changes object with all detected changes
   */
  def getChanges(before: Option[String], after: Option[String]): Changes = {
    val changes = new Changes.Builder()

    val beforeMap = before.map(flattenJson).getOrElse(Map.empty)
    val afterMap  = after.map(flattenJson).getOrElse(Map.empty)

    // Find added keys (keys that exist in after but not in before)
    afterMap.keySet.diff(beforeMap.keySet).foreach(key => changes.added(key, afterMap(key)))

    // Find removed keys (keys that exist in before but not in after)
    val removedKeys = beforeMap.keySet.diff(afterMap.keySet)
    for (key <- removedKeys) {
      changes.removed(key, beforeMap(key))
    }

    // Find updated keys (keys that exist in both but have different values)
    val commonKeys = beforeMap.keySet.intersect(afterMap.keySet)
    for (key <- commonKeys) {
      val beforeValue = beforeMap(key)
      val afterValue  = afterMap(key)
      if (beforeValue != afterValue) {
        changes.updated(key, beforeValue, afterValue)
      }
    }

    changes.build()
  }

  /**
   * Flattens a JSON object into a Map where keys are dot-notation paths
   * and values are string representations of the leaf values.
   *
   * @param json JSON string to flatten
   * @return Map of flattened key-value pairs
   */
  private def flattenJson(json: String): Map[String, String] = {
    try {
      val rootNode = mapper.readTree(json)
      flattenNode(rootNode, "")
    } catch {
      case e: Exception =>
        // If JSON parsing fails, return empty map
        Map.empty
    }
  }

  /**
   * Recursively flattens a JsonNode into a Map.
   *
   * @param node JsonNode to flatten
   * @param path Current path prefix
   * @return Map of flattened key-value pairs
   */
  private def flattenNode(node: JsonNode, path: String): Map[String, String] = {
    if (node.isNull) {
      Map(path -> "null")
    } else if (node.isTextual) {
      Map(path -> node.asText())
    } else if (node.isNumber) {
      Map(path -> node.toString)
    } else if (node.isBoolean) {
      Map(path -> node.asBoolean().toString)
    } else if (node.isObject) {
      node
        .fieldNames()
        .asScala
        .flatMap { fieldName =>
          val fieldPath = if (path.isEmpty) fieldName else s"$path.$fieldName"
          flattenNode(node.get(fieldName), fieldPath)
        }
        .toMap
    } else if (node.isArray) {
      node
        .elements()
        .asScala
        .zipWithIndex
        .flatMap { case (element, index) =>
          val elementPath = s"$path[$index]"
          flattenNode(element, elementPath)
        }
        .toMap
    } else {
      // Fallback for any other node types
      Map(path -> node.toString)
    }
  }
}
