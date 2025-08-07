package fi.oph.tutu.backend.domain

import io.swagger.v3.oas.annotations.media.Schema
import io.swagger.v3.oas.annotations.media.Schema.RequiredMode

import java.time.LocalDateTime
import scala.annotation.meta.field

enum AsiakirjamalliLahde {
  case ece, UK_enic, naric_portal, nuffic, aacrao, muu
}

@Schema(name = "AsiakirjaMalliTutkinnosta")
case class DbAsiakirjamalliTutkinnosta(
  @(Schema @field)(
    example = "1.2.246.562.11.00000000000000006666",
    requiredMode = RequiredMode.REQUIRED,
    maxLength = 40
  )
  hakemusOid: HakemusOid,
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
  uudetMallit: Seq[AsiakirjamalliTutkinnosta],
  muutetutMallit: Seq[AsiakirjamalliTutkinnosta],
  poistetutMallit: Seq[AsiakirjamalliTutkinnosta]
)
