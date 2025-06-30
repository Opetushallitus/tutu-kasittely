package fi.oph.tutu.backend.domain

import org.json4s.*
import org.json4s.native.JsonMethods.*

case class AtaruLomake(
  id: Long,
  key: String,
  name: Kaannokset,
  content: Seq[LomakeContentItem] = Seq()
)

case class LomakeContentItem(
  id: String,
  fieldClass: String,
  fieldType: String,
  label: Kaannokset,
  children: Seq[LomakeContentItem] = Seq(),
  options: Seq[Valinta] = Seq()
)

case class Valinta(
  label: Kaannokset,
  value: String,
  followups: Seq[LomakeContentItem] = Seq()
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
  children: Seq[SisaltoItem] = Seq(),
  followups: Seq[SisaltoItem] = Seq()
)
