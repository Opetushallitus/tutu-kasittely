package fi.oph.tutu.backend.domain

import java.util.UUID

case class Maakoodi(
  id: UUID,
  esittelijaId: Option[UUID],
  koodiUri: String,
  fi: String,
  sv: String,
  en: String
)

case class DbMaakoodi(
  id: UUID,
  esittelijaId: Option[UUID],
  koodiUri: String,
  fi: String,
  sv: String,
  en: String
)
