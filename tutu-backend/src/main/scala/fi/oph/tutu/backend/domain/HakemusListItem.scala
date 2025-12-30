package fi.oph.tutu.backend.domain

import java.time.LocalDateTime
import java.util.UUID

case class HakemusListItem(
  hakija: String,
  aika: String,
  id: UUID,
  hakemusOid: String,
  hakemusKoskee: Int,
  esittelijaOid: Option[String],
  asiakirjaId: Option[UUID],
  asiatunnus: Option[String],
  esittelijaKutsumanimi: String,
  esittelijaSukunimi: String,
  kasittelyVaihe: KasittelyVaihe,
  muokattu: Option[String],
  taydennyspyyntoLahetetty: Option[LocalDateTime],
  apHakemus: Option[Boolean] = None,
  viimeinenAsiakirjaHakijalta: Option[String]
) extends UpdatedFromAtaru
