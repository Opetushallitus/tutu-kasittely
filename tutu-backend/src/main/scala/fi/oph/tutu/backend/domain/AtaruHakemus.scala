package fi.oph.tutu.backend.domain

import org.json4s.*
import org.json4s.native.JsonMethods.*

sealed trait AnswerValue
case class SingleValue(value: String)            extends AnswerValue
case class MultiValue(value: Seq[String])        extends AnswerValue
case class NestedValues(value: Seq[Seq[String]]) extends AnswerValue
case object EmptyValue                           extends AnswerValue

object AnswerValueSerializer
    extends CustomSerializer[AnswerValue](_ =>
      (
        {
          case JString(value) =>
            SingleValue(value)
          case JArray(values) if values.forall(_.isInstanceOf[JString]) =>
            MultiValue(values.map(_.extract[String]))
          case JArray(values) if values.forall {
                case JArray(innerValues) => innerValues.forall(_.isInstanceOf[JString])
                case _                   => false
              } =>
            NestedValues(values.map {
              case JArray(innerValues) => innerValues.map(_.extract[String])
              case _                   => throw new MappingException("Invalid nested structure")
            })
          case JArray(Nil) =>
            EmptyValue
          case unexpected =>
            throw new MappingException(s"Cannot deserialize AnswerValue from $unexpected")
        },
        {
          case SingleValue(value) =>
            JString(value)
          case MultiValue(values) =>
            JArray(values.map(JString).toList)
          case NestedValues(values) =>
            JArray(values.map(nested => JArray(nested.map(JString).toList)).toList)
          case EmptyValue =>
            JArray(Nil)
        }
      )
    )
implicit val formats: Formats = DefaultFormats + AnswerValueSerializer

case class AtaruHakemus(
  haku: Option[String],
  etunimet: String,
  key: String,
  content: Content,
  created: String,
  state: String,
  modified: String,
  submitted: String,
  lang: String,
  sukunimi: String,
  `application-review-notes`: Option[String],
  henkilotunnus: Option[String],
  `person-oid`: String,
  `application-hakukohde-attachment-reviews`: Seq[AttachmentReview],
  `application-hakukohde-reviews`: Seq[HakukohdeReview],
  hakutoiveet: Seq[String]
)

case class Content(
  answers: Seq[Answer]
)

case class Answer(
  key: String,
  value: AnswerValue,
  fieldType: String,
  `original-followup`: Option[String],
  `original-question`: Option[String],
  `duplikoitu-kysymys-hakukohde-oid`: Option[String],
  `duplikoitu-followup-hakukohde-oid`: Option[String]
)

case class AttachmentReview(
  attachment: String,
  state: String,
  hakukohde: String
)

case class HakukohdeReview(
  requirement: String,
  state: String,
  hakukohde: String
)
