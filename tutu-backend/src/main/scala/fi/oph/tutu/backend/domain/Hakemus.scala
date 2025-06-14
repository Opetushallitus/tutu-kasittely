package fi.oph.tutu.backend.domain

import io.swagger.v3.oas.annotations.media.Schema
import io.swagger.v3.oas.annotations.media.Schema.RequiredMode

import java.time.LocalDateTime
import java.util.UUID
import scala.annotation.meta.field
import scala.beans.BeanProperty

@Schema(name = "Hakemus")
case class DbHakemus(
  @(Schema @field)(
    example = "1.2.246.562.11.00000000000000006666",
    requiredMode = RequiredMode.REQUIRED,
    maxLength = 40
  )
  @BeanProperty hakemusOid: HakemusOid,
  @(Schema @field)(
    example = "1",
    requiredMode = RequiredMode.REQUIRED,
    maxLength = 4
  )
  @BeanProperty hakemusKoskee: Int,
  @(Schema @field)(
    example = "de4ffbea-1763-4a43-a24d-50ee48b81ff1",
    requiredMode = RequiredMode.NOT_REQUIRED,
    maxLength = 16
  )
  @BeanProperty esittelijaId: Option[UUID],
  @(Schema @field)(
    example = "1.2.246.562.24.00000000000000006666",
    requiredMode = RequiredMode.NOT_REQUIRED,
    maxLength = 40
  )
  @BeanProperty esittelijaOid: Option[UserOid],
  @(Schema @field)(
    example = "OPH-197-2025",
    requiredMode = RequiredMode.NOT_REQUIRED,
    maxLength = 40
  )
  @BeanProperty asiatunnus: Option[String]
)

case class Hakemus(
  @BeanProperty hakemusOid: String,
  @BeanProperty hakijanEtunimet: String,
  @BeanProperty hakijanSukunimi: String,
  @BeanProperty hakijanHetu: Option[String] = None,
  @BeanProperty hakemusKoskee: Int,
  @BeanProperty asiatunnus: Option[String] = None,
  @BeanProperty kirjausPvm: Option[LocalDateTime] = None,
  @BeanProperty esittelyPvm: Option[LocalDateTime] = None,
  @BeanProperty paatosPvm: Option[LocalDateTime] = None,
  @BeanProperty esittelijaOid: Option[String] = None
)

case class PartialHakemus(
  @BeanProperty hakemusKoskee: Option[Int] = None,
  @BeanProperty asiatunnus: Option[String] = None,
  @BeanProperty kirjausPvm: Option[LocalDateTime] = None,
  @BeanProperty esittelyPvm: Option[LocalDateTime] = None,
  @BeanProperty paatosPvm: Option[LocalDateTime] = None,
  @BeanProperty esittelijaOid: Option[String] = None
)
