package fi.oph.tutu.backend.domain

import java.util.UUID

case class PyydettavaAsiakirja(
  id: Option[UUID],
  asiakirjanTyyppi: String
)

case class PyydettavaAsiakirjaModifyData(
  uudet: Seq[PyydettavaAsiakirja],
  muutetut: Seq[PyydettavaAsiakirja],
  poistetut: Seq[UUID]
)
