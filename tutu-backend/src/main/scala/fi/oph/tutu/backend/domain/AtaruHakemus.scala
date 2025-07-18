package fi.oph.tutu.backend.domain

import org.json4s.*
import org.json4s.native.JsonMethods.*

sealed trait AnswerValue
case class SingleValue(value: String)            extends AnswerValue
case class MultiValue(value: Seq[String])        extends AnswerValue
case class NestedValues(value: Seq[Seq[String]]) extends AnswerValue
case object EmptyValue                           extends AnswerValue

case class AtaruHakemus(
  haku: Option[String],
  etunimet: String,
  key: String,
  form_id: Long,
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
  hakutoiveet: Seq[String],
  `information-request-timestamp`: Option[String]
)

case class Content(
  answers: Seq[Answer]
)

case class Answer(
  key: String,
  value: AnswerValue,
  fieldType: String,
  `original-followup`: Option[String] = None,
  `original-question`: Option[String] = None,
  `duplikoitu-kysymys-hakukohde-oid`: Option[String] = None,
  `duplikoitu-followup-hakukohde-oid`: Option[String] = None
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
