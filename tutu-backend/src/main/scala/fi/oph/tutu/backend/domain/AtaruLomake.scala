package fi.oph.tutu.backend.domain

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
  options: Seq[Valinta] = Seq(),
  params: Option[ItemParams] = None
)

case class ItemParams(
  `info-text`: Option[InfoText] = None
)

case class InfoText(
  label: Option[Kielistetty] = None,
  value: Option[Kielistetty] = None
)

case class Valinta(
  label: Kielistetty,
  value: String,
  followups: Seq[LomakeContentItem] = Seq()
)

case class PaatosTietoOption(
  label: Option[Kielistetty] = None,
  value: Option[Kielistetty] = None,
  children: Seq[PaatosTietoOption] = Seq()
)

case class PaatosTietoOptions(
  kelpoisuusOptions: Seq[PaatosTietoOption] = Seq(),
  tiettyTutkintoTaiOpinnotOptions: Seq[PaatosTietoOption] = Seq(),
  riittavatOpinnotOptions: Seq[PaatosTietoOption] = Seq()
)

case class SisaltoItem(
  key: String,
  fieldType: String,
  value: Seq[SisaltoValue],
  label: Kielistetty,
  children: Seq[SisaltoItem] = Seq(),
  infoText: Option[InfoText] = None
)

case class SisaltoValue(
  label: Kielistetty,
  value: String,
  followups: Seq[SisaltoItem] = Seq()
)

case class AtaruKysymysId(
  generatedId: String,
  definedId: String
)
