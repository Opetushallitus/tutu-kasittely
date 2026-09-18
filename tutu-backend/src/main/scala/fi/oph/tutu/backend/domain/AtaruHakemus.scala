package fi.oph.tutu.backend.domain

import com.fasterxml.jackson.annotation.JsonProperty
import com.fasterxml.jackson.core.JsonParser
import com.fasterxml.jackson.databind.{DeserializationContext, JsonDeserializer, JsonMappingException, JsonNode}
import fi.oph.tutu.backend.domain.AtaruHakemuksenTila.fromHakukohdeReviewList

import java.time.LocalDateTime
import scala.jdk.CollectionConverters.IteratorHasAsScala

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
  @JsonProperty("created")
  latestVersionCreated: String,
  state: String,
  modified: String,
  submitted: String,
  lang: String,
  sukunimi: String,
  `application-review-notes`: Option[String],
  henkilotunnus: Option[String],
  `person-oid`: String,
  `latest-attachment-reviews`: Seq[AttachmentReviewRaw] = Seq(),
  `application-hakukohde-reviews`: Seq[HakukohdeReview],
  hakutoiveet: Seq[String],
  `information-request-timestamp`: Option[String]
) {
  def hakemuksenTila(): AtaruHakemuksenTila = fromHakukohdeReviewList(`application-hakukohde-reviews`)
}

case class AtaruHakemusUpdate(
  form_id: Long,
  content: Content,
  @JsonProperty("created")
  latestVersionCreated: LocalDateTime,
  modified: LocalDateTime,
  submitted: LocalDateTime,
  `application-hakukohde-reviews`: Seq[HakukohdeReview],
  `information-request-timestamp`: Option[LocalDateTime]
) {
  def hakemuksenTila(): AtaruHakemuksenTila = fromHakukohdeReviewList(`application-hakukohde-reviews`)
}

case class AtaruHakemusListItem(
  key: HakemusOid,
  etunimet: String,
  sukunimi: String,
  submitted: String,
  tila: AtaruHakemuksenTila,
  hakemusKoskee: Int,
  taydennyspyyntoLahetetty: Option[String]
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

case class AttachmentReviewRaw(
  attachment: String,
  state: String,
  hakukohde: String,
  updateTime: String
)

case class AttachmentReview(
  attachment: String,
  state: String,
  hakukohde: String,
  updateTime: Option[LocalDateTime]
)

case class HakukohdeReview(
  requirement: String,
  state: String,
  hakukohde: String
)

class AnswerValueDeserializer extends JsonDeserializer[AnswerValue] {

  override def deserialize(p: JsonParser, ctxt: DeserializationContext): AnswerValue = {
    val node: JsonNode = p.getCodec.readTree(p)
    parse(node, p)
  }

  private def parse(node: JsonNode, p: JsonParser): AnswerValue = {
    if (node == null || node.isNull) {
      EmptyValue
    } else if (node.isTextual) {
      SingleValue(node.asText())
    } else if (node.isArray) {
      val elements = node.elements().asScala.toList

      if (elements.isEmpty) {
        EmptyValue
      } else if (elements.forall(_.isTextual)) {
        MultiValue(elements.map(_.asText()))
      } else if (elements.forall(isStringArray)) {
        NestedValues(elements.map(e => e.elements().asScala.map(_.asText()).toList))
      } else {
        throw new JsonMappingException(p, "Invalid nested structure")
      }
    } else {
      throw new JsonMappingException(p, s"Cannot deserialize AnswerValue from $node")
    }
  }

  private def isStringArray(node: JsonNode): Boolean =
    node.isArray && node.elements().asScala.forall(_.isTextual)
}
