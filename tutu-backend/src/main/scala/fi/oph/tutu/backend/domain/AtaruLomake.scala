package fi.oph.tutu.backend.domain

case class AtaruLomake(
  id: Long,
  key: String,
  name: String, // fi
  content: Option[Seq[LomakeContentItem]]
)

case class LomakeContentItem(
  id: String,
  fieldClass: String,
  fieldType: String,
  label: String, // fi
  children: Option[Seq[LomakeContentItem]],
  options: Option[Seq[Valinta]]
)

case class Valinta(
  label: String, // fi
  value: String,
  followups: Option[Seq[LomakeContentItem]]
)

case class SisaltoItem(
  key: String,
  fieldType: String,
  value: Seq[String],
  label: String,
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
