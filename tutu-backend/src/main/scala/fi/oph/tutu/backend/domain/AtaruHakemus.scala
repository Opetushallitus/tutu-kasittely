package fi.oph.tutu.backend.domain

import io.swagger.v3.oas.annotations.media.Schema
import io.swagger.v3.oas.annotations.media.Schema.RequiredMode

import scala.annotation.meta.field
import scala.beans.BeanProperty

case class AtaruHakemus(
  @(Schema @field)(
    example = "1.2.246.562.11.00000000000000006666",
    requiredMode = RequiredMode.REQUIRED,
    maxLength = 40
  )
  @BeanProperty hakemusOid: HakemusOid,
  @(Schema @field)(
    example = "0008",
    requiredMode = RequiredMode.REQUIRED,
    maxLength = 4
  )
  @BeanProperty maakoodi: String,
  @(Schema @field)(
    example = "0",
    requiredMode = RequiredMode.REQUIRED
  )
  @BeanProperty syykoodi: Int
)
