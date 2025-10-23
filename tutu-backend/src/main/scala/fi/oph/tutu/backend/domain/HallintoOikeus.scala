package fi.oph.tutu.backend.domain

import java.sql.Timestamp
import java.util.UUID

case class HallintoOikeus(
  id: Option[UUID] = None,
  koodi: String,
  nimi: Kielistetty,
  osoite: Option[Kielistetty] = None,
  puhelin: Option[String] = None,
  sahkoposti: Option[String] = None,
  verkkosivu: Option[Kielistetty] = None,
  luotu: Option[Timestamp] = None,
  muokattu: Option[Timestamp] = None
)
