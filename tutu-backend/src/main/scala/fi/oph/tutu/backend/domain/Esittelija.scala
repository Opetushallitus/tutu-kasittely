package fi.oph.tutu.backend.domain

import io.swagger.v3.oas.annotations.media.Schema
import io.swagger.v3.oas.annotations.media.Schema.RequiredMode

import java.util.UUID
import scala.annotation.meta.field
import scala.beans.BeanProperty

@Schema(name = "Esittelija")
case class DbEsittelija(
  @(Schema @field)(
    example = "de4ffbea-1763-4a43-a24d-50ee48b81ff1",
    requiredMode = RequiredMode.REQUIRED,
    maxLength = 16
  )
  @BeanProperty esittelijaId: UUID,
  @(Schema @field)(
    example = "1.2.246.562.24.00000000000000006666",
    requiredMode = RequiredMode.REQUIRED
  )
  @BeanProperty esittelijaOid: UserOid
)

case class Esittelija(
  esittelijaOid: String,
  etunimi: String,
  sukunimi: String
)
