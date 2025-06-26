package fi.oph.tutu.backend.domain

import org.json4s.*
import org.json4s.native.JsonMethods.*

case class AtaruLomake(
  id: Long,
  key: String,
  name: Kaannokset,
  content: Option[Seq[LomakeContentItem]]
)

case class LomakeContentItem(
  id: String,
  fieldClass: String,
  fieldType: String,
  label: Kaannokset,
  children: Option[Seq[LomakeContentItem]],
  options: Option[Seq[Valinta]]
)

case class Valinta(
  label: Kaannokset,
  value: String,
  followups: Option[Seq[LomakeContentItem]]
)

case class Kaannokset(
  fi: Option[String],
  sv: Option[String],
  en: Option[String]
)

case class SisaltoItem(
  key: String,
  fieldType: String,
  value: Seq[Kaannokset],
  label: Kaannokset,
  children: Option[Seq[SisaltoItem]],
  followups: Option[Seq[SisaltoItem]]
)

/*
options
value
followups
label
fieldClass
id
fieldType
 */
