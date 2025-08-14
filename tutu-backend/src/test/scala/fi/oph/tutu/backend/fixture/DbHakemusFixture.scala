package fi.oph.tutu.backend.fixture

import fi.oph.tutu.backend.domain.KasittelyVaihe.AlkukasittelyKesken
import fi.oph.tutu.backend.domain.{DbHakemus, HakemusOid, UserOid}

val dbHakemusFixture = DbHakemus(
  id = java.util.UUID.fromString("de4ffbea-1763-4a43-a24d-50ee48b81ff1"),
  hakemusOid = HakemusOid("1.2.246.562.11.00000000000000006666"),
  hakemusKoskee = 1,
  esittelijaId = None,
  esittelijaOid = Some(UserOid("1.2.246.562.24.00000000000000006666")),
  asiatunnus = Some("OPH-123-2025"),
  kasittelyVaihe = AlkukasittelyKesken,
  muokattu = None,
  allekirjoituksetTarkistettu = false,
  allekirjoituksetTarkistettuLisatiedot = None,
  alkuperaisetAsiakirjatSaatuNahtavaksi = false,
  alkuperaisetAsiakirjatSaatuNahtavaksiLisatiedot = None,
  selvityksetSaatu = false,
  imiPyynto = null,
  imiPyyntoNumero = null,
  imiPyyntoLahetetty = null,
  imiPyyntoVastattu = null,
  apHakemus = None
)
