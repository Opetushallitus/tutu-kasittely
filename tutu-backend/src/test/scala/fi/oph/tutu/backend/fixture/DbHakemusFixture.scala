package fi.oph.tutu.backend.fixture

import fi.oph.tutu.backend.domain.KasittelyVaihe.AlkukasittelyKesken
import fi.oph.tutu.backend.domain.{DbHakemus, HakemusOid, UserOid}

val dbHakemusFixture = DbHakemus(
  hakemusOid = HakemusOid("1.2.246.562.11.00000000000000006666"),
  hakemusKoskee = 1,
  esittelijaId = None,
  esittelijaOid = Some(UserOid("1.2.246.562.24.00000000000000006666")),
  asiatunnus = Some("OPH-123-2025"),
  kasittelyVaihe = AlkukasittelyKesken,
  muokattu = None)
