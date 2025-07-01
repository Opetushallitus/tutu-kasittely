package fi.oph.tutu.backend.domain

import org.json4s.*
import org.json4s.native.JsonMethods.*

case class AtaruLomake(
  id: Long,
  key: String,
  name: Kielistetty,
  content: Seq[LomakeContentItem] = Seq()
)

case class LomakeContentItem(
  id: String,
  fieldClass: String,
  fieldType: String,
  label: Kielistetty,
  children: Seq[LomakeContentItem] = Seq(),
  options: Seq[Valinta] = Seq()
)

case class Valinta(
  label: Kielistetty,
  value: String,
  followups: Seq[LomakeContentItem] = Seq()
)

case class SisaltoItem(
  key: String,
  fieldType: String,
  value: Seq[Kielistetty],
  label: Kielistetty,
  children: Seq[SisaltoItem] = Seq(),
  followups: Seq[SisaltoItem] = Seq()
)
