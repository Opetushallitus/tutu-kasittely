package fi.oph.tutu.backend.domain

import java.time.LocalDateTime
import java.util.UUID

case class HakemusListItem(
  hakija: String,
  aika: String,
  hakemusOid: String,
  hakemusKoskee: Int,
  esittelijaOid: Option[String],
  asiatunnus: Option[String],
  esittelijaKutsumanimi: String,
  esittelijaSukunimi: String,
  kasittelyVaihe: KasittelyVaihe,
  muokattu: Option[String],
  taydennyspyyntoLahetetty: Option[LocalDateTime],
  ataruHakemustaMuokattu: Option[LocalDateTime] = None,
  apHakemus: Option[Boolean] = None,
  viimeinenAsiakirjaHakijalta: Option[String],
  onkoPeruutettu: Option[Boolean] = None
)
