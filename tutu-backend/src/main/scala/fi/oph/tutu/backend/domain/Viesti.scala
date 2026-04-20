package fi.oph.tutu.backend.domain

import java.time.{LocalDateTime, ZoneId}
import java.util.UUID

case class Viesti(
  id: Option[UUID] = None,
  hakemusId: Option[UUID] = None,
  kieli: Option[Kieli] = None,
  tyyppi: Option[Viestityyppi] = None,
  otsikko: Option[String] = None,
  viesti: Option[String] = None,
  vahvistettu: Option[LocalDateTime] = None,
  vahvistaja: Option[String] = None,
  luotu: Option[LocalDateTime] = None,
  luoja: Option[String] = None,
  muokattu: Option[LocalDateTime] = None,
  muokkaaja: Option[String] = None
)

case class ViestiListItem(
  id: UUID,
  tyyppi: Viestityyppi,
  otsikko: String,
  vahvistettu: LocalDateTime
)

case class ViestiHakemusInfo(
  hakemusOid: HakemusOid,
  esittelija: Esittelija,
  kieli: Kieli,
  requestTimezone: ZoneId,
  asiatunnus: Option[String] = None
)
