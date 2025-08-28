package fi.oph.tutu.backend.fixture

import fi.oph.tutu.backend.domain.DbAsiakirja

val dbAsiakirjaFixture = DbAsiakirja(
  id = java.util.UUID.fromString("f3a9472e-d996-4f2c-9d77-9466823c2ff0"),
  allekirjoituksetTarkistettu = false,
  allekirjoituksetTarkistettuLisatiedot = None,
  alkuperaisetAsiakirjatSaatuNahtavaksi = false,
  alkuperaisetAsiakirjatSaatuNahtavaksiLisatiedot = None,
  selvityksetSaatu = false,
  imiPyynto = None,
  imiPyyntoNumero = None,
  imiPyyntoLahetetty = None,
  imiPyyntoVastattu = None,
  apHakemus = None,
  suostumusVahvistamiselleSaatu = false,
  valmistumisenVahvistus = false,
  valmistumisenVahvistusPyyntoLahetetty = None,
  valmistumisenVahvistusSaatu = None,
  valmistumisenVahvistusVastaus = None,
  valmistumisenVahvistusLisatieto = None,
  viimeinenAsiakirjaHakijalta = None
)
