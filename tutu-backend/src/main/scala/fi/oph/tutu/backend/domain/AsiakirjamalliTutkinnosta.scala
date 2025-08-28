package fi.oph.tutu.backend.domain

import io.swagger.v3.oas.annotations.media.Schema
import io.swagger.v3.oas.annotations.media.Schema.RequiredMode

import java.time.LocalDateTime
import java.util.UUID
import scala.annotation.meta.field

enum AsiakirjamalliLahde {
  case ece, UK_enic, naric_portal, nuffic, aacrao, muu
}

@Schema(name = "AsiakirjaMalliTutkinnosta")
case class DbAsiakirjamalliTutkinnosta(
  @(Schema @field)(
    example = "de4ffbea-1763-4a43-a24d-50ee48b81ff1",
    requiredMode = RequiredMode.REQUIRED,
    maxLength = 36
  )
  id: UUID,
  @(Schema @field)(
    example = "de4ffbea-1763-4a43-a24d-50ee48b81ff1",
    requiredMode = RequiredMode.REQUIRED,
    maxLength = 36
  )
  asiakirjaId: UUID,
  @(Schema @field)(
    example = "Ece",
    requiredMode = RequiredMode.REQUIRED,
    maxLength = 50
  )
  lahde: AsiakirjamalliLahde,
  @(Schema @field)(
    example = "true",
    requiredMode = RequiredMode.REQUIRED
  )
  vastaavuus: Boolean,
  @(Schema @field)(
    requiredMode = RequiredMode.NOT_REQUIRED
  )
  kuvaus: Option[String],
  @(Schema @field)(
    example = "2025-06-14T10:59:47.597",
    requiredMode = RequiredMode.NOT_REQUIRED,
    maxLength = 50
  )
  muokattu: Option[LocalDateTime]
)

case class AsiakirjamalliTutkinnosta(
  lahde: AsiakirjamalliLahde,
  vastaavuus: Boolean,
  kuvaus: Option[String]
)

case class AsiakirjamalliModifyData(
  uudetMallit: Map[AsiakirjamalliLahde, AsiakirjamalliTutkinnosta],
  muutetutMallit: Map[AsiakirjamalliLahde, AsiakirjamalliTutkinnosta],
  poistetutMallit: Seq[AsiakirjamalliLahde]
)
