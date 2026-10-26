package fi.oph.tutu.backend.domain

import io.swagger.v3.oas.annotations.media.Schema
import io.swagger.v3.oas.annotations.media.Schema.RequiredMode

import java.util.UUID
import scala.annotation.meta.field

@Schema(name = "YkViestiAihe")
case class DbYkViestiAihe(
  @(Schema @field)(
    example = "de4ffbea-1763-4a43-a24d-50ee48b81ff1",
    requiredMode = RequiredMode.REQUIRED,
    maxLength = 36
  )
  id: UUID,
  @(Schema @field)(
    example = "de4ffbea-1763-4a43-a24d-a24d-50ee48b81ff1",
    requiredMode = RequiredMode.NOT_REQUIRED,
    maxLength = 36
  )
  avain: String
)

case class YkViestiAihe(
  id: UUID,
  avain: String
)
