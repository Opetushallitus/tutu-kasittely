package fi.oph.tutu.backend.utils

import fi.oph.tutu.backend.domain.{
  AnswerValue,
  EmptyValue,
  KasittelyVaihe,
  Kieli,
  Kielistetty,
  KoodistoItem,
  MultiValue,
  NestedValues,
  SingleValue
}
import org.json4s.*
import org.json4s.DefaultFormats

import java.text.SimpleDateFormat

trait TutuJsonFormats {
  implicit val formats: Formats =
    DefaultFormats + AnswerValueSerializer + KoodistoItemSerializer + KielistettySerializer + KasittelyVaiheSerializer
}

object AnswerValueSerializer
    extends CustomSerializer[AnswerValue](format =>
      (
        {
          case JString(value) =>
            SingleValue(value)
          case JArray(values) if values.forall(_.isInstanceOf[JString]) =>
            MultiValue(values.map(_.extract[String](format)))
          case JArray(values) if values.forall {
                case JArray(innerValues) => innerValues.forall(_.isInstanceOf[JString])
                case _                   => false
              } =>
            NestedValues(values.map {
              case JArray(innerValues) => innerValues.map(_.extract[String](format))
              case _                   => throw new MappingException("Invalid nested structure")
            })
          case JArray(Nil) =>
            EmptyValue
          case JNull =>
            EmptyValue
          case unexpected =>
            throw new MappingException(s"Cannot deserialize AnswerValue from $unexpected")
        },
        {
          case SingleValue(value) =>
            JString(value)
          case MultiValue(values) =>
            JArray(values.map(org.json4s.JString.apply).toList)
          case NestedValues(values) =>
            JArray(values.map(nested => JArray(nested.map(org.json4s.JString.apply).toList)).toList)
          case EmptyValue =>
            JArray(Nil)
        }
      )
    )

object KoodistoItemSerializer
    extends CustomSerializer[KoodistoItem](_ =>
      (
        {
          case JObject(fields) =>
            val koodiUri    = fields.collectFirst { case ("koodiUri", JString(koodiUri)) => koodiUri }.getOrElse("")
            val koodiArvo   = fields.collectFirst { case ("koodiArvo", JString(koodiArvo)) => koodiArvo }.getOrElse("")
            val metadata    = fields.collectFirst { case ("metadata", JArray(metadata)) => metadata }.getOrElse(List())
            val kielistetty = metadata.map {
              case JObject(mDataItem) =>
                val kieli = mDataItem.collectFirst { case ("kieli", JString(kieli)) => kieli }.getOrElse("")
                val nimi  = mDataItem.collectFirst { case ("nimi", JString(nimi)) => nimi }.getOrElse("")
                Kieli.valueOf(kieli.toLowerCase()) -> nimi
              case _ =>
                throw new MappingException("Invalid koodisto metadata item")
            }.toMap
            KoodistoItem(koodiUri, koodiArvo, kielistetty)
          case unexpected =>
            throw new MappingException(s"Cannot deserialize KooodistoItem from $unexpected")
        },
        { case k: KoodistoItem =>
          val metadata = JArray(
            k.nimi.toSeq
              .map(k => JObject("nimi" -> JString(k._2), "kieli" -> JString(k._1.toString.toUpperCase)))
              .toList
          )
          val koodiUri  = JString(k.koodiUri)
          val koodiArvo = JString(k.koodiArvo)
          JObject("koodiUri" -> koodiUri, "koodiArvo" -> koodiArvo, "metadata" -> metadata)
        }
      )
    )

object KielistettySerializer
    extends CustomSerializer[Kielistetty](_ =>
      (
        {
          case JObject(fields) => {
            val fiEntry = fields.collectFirst { case ("fi", JString(value)) => Some((Kieli.fi, value)) }.getOrElse(None)
            val svEntry = fields.collectFirst { case ("sv", JString(value)) => Some((Kieli.sv, value)) }.getOrElse(None)
            val enEntry = fields.collectFirst { case ("en", JString(value)) => Some((Kieli.en, value)) }.getOrElse(None)

            val map = Seq(fiEntry, svEntry, enEntry)
              .flatten()
              .foldLeft(
                Map[Kieli, String]()
              )((current, entry) => current.++(Map(entry(0) -> entry(1))))

            map
          }
          case JNothing   => null
          case unexpected =>
            throw new MappingException(s"Cannot deserialize Kielistetty from $unexpected")
        },
        {
          case kielistetty: Map[_, _] if kielistetty.isEmpty || kielistetty.keys.head.isInstanceOf[Kieli] =>
            // Safe cast since we verified this is a Map with Kieli keys (or empty Map)
            val typedMap = kielistetty.asInstanceOf[Kielistetty]
            val fiEntry  =
              typedMap.collectFirst { case (Kieli.fi, value) => Some(("fi", JString(value))) }.getOrElse(None)
            val svEntry =
              typedMap.collectFirst { case (Kieli.en, value) => Some(("sv", JString(value))) }.getOrElse(None)
            val enEntry =
              typedMap.collectFirst { case (Kieli.sv, value) => Some(("en", JString(value))) }.getOrElse(None)

            val obj = Seq(fiEntry, svEntry, enEntry)
              .flatten()
              .foldLeft(
                JObject()
              )((current, entry) => current.merge(JObject(entry(0) -> entry(1))))

            obj
        }
      )
    )

object KasittelyVaiheSerializer
    extends CustomSerializer[KasittelyVaihe](_ =>
      (
        {
          case JString(value) => KasittelyVaihe.fromString(value)
          case unexpected     =>
            throw new MappingException(s"Cannot deserialize KasittelyVaihe from $unexpected")
        },
        { case vaihe: KasittelyVaihe =>
          JString(vaihe.toString)
        }
      )
    )
