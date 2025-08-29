package fi.oph.tutu.backend.repository

import slick.jdbc.GetResult

import java.util.UUID

class BaseResultHandlers {
  implicit val getUUIDResult: GetResult[UUID] =
    GetResult(r => UUID.fromString(r.nextString()))
}
