package fi.oph.tutu.backend.domain

import org.json4s.*
import org.json4s.native.JsonMethods.*

case class AtaruLomake(
  id: Long,
  key: String,
  name: Kaannokset,
  content: Option[Seq[LomakeContentItem]] = None
)

case class LomakeContentItem(
  id: String,
  fieldClass: String,
  fieldType: String,
  label: Kaannokset,
  children: Option[Seq[LomakeContentItem]] = None,
  options: Option[Seq[Valinta]] = None
)

case class Valinta(
  label: Kaannokset,
  value: String,
  followups: Option[Seq[LomakeContentItem]] = None
)

case class Kaannokset(
  fi: Option[String] = None,
  sv: Option[String] = None,
  en: Option[String] = None
)

case class SisaltoItem(
  key: String,
  fieldType: String,
  value: Seq[Kaannokset],
  label: Kaannokset,
  children: Option[Seq[SisaltoItem]] = None,
  followups: Option[Seq[SisaltoItem]] = None
)
