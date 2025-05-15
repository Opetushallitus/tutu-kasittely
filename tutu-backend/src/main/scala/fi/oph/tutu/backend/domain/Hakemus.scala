package fi.oph.tutu.backend.domain

import io.swagger.v3.oas.annotations.media.Schema
import io.swagger.v3.oas.annotations.media.Schema.RequiredMode

import scala.annotation.meta.field
import scala.beans.BeanProperty

@Schema(name = "Hakemus")
case class Hakemus(
  @(Schema @field)(
    example = "1.2.246.562.11.00000000000000006666",
    requiredMode = RequiredMode.REQUIRED,
    maxLength = 40
  )
  @BeanProperty hakemusOid: HakemusOid,
  @(Schema @field)(
    example = "Teuvo",
    requiredMode = RequiredMode.REQUIRED,
    maxLength = 255
  )
  @BeanProperty firstName: String,
  @(Schema @field)(
    example = "Tulppu",
    requiredMode = RequiredMode.REQUIRED,
    maxLength = 255
  )
  @BeanProperty lastName: String
)
