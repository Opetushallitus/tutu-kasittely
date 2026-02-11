package fi.oph.tutu.backend.domain

import java.time.LocalDateTime
import java.util.UUID

case class Viesti(
  id: Option[UUID] = None,
  hakemusId: Option[UUID] = None,
  kieli: Option[Kieli] = None,
  viestityyppi: Option[Viestityyppi] = None,
  otsikko: Option[String] = None,
  viesti: Option[String] = None,
  vahvistettu: Option[LocalDateTime] = None,
  vahvistaja: Option[String] = None,
  luotu: Option[LocalDateTime] = None,
  luoja: Option[String] = None,
  muokkaaja: Option[String] = None
)

case class ViestiListItem(
  id: UUID,
  viestityyppi: Viestityyppi,
  otsikko: String,
  vahvistettu: LocalDateTime,
  vahvistaja: String
)
