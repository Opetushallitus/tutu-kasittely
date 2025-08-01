package fi.oph.tutu.backend.domain

import java.util.UUID

case class PyydettavaAsiakirja(
  id: Option[UUID],
  asiakirjanTyyppi: String
)
