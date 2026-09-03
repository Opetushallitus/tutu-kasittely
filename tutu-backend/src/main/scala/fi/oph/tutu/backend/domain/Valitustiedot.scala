package fi.oph.tutu.backend.domain

import java.time.LocalDateTime
import java.util.UUID

case class Valitustiedot(
  id: Option[UUID] = None,
  hakemusId: Option[UUID] = None,
  valitusOPH: ValitusOPH,
  valitusHO: ValitusHO,
  valitusKHO: ValitusKHO,
  luoja: Option[String] = None,
  luotu: Option[LocalDateTime] = None,
  muokkaaja: Option[String] = None,
  muokattu: Option[LocalDateTime] = None
)

case class ValitusOPH(
  maksu: Option[Boolean] = None,
  asiavirhe: Option[Boolean] = None,
  kirjoitusvirhe: Option[Boolean] = None,
  muu: Option[Boolean] = None,
  tasmennys: Option[String] = None
)

// TODO
case class ValitusHO()

case class ValitusKHO(
  valitettu: Option[Boolean] = None,
  valitusPvm: Option[LocalDateTime] = None,
  ratkaisuPvm: Option[LocalDateTime] = None
)
