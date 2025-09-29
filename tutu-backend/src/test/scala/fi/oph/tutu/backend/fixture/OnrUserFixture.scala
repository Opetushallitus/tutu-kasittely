package fi.oph.tutu.backend.fixture

import fi.oph.tutu.backend.domain.{KansalaisuusKoodi, OnrUser}

val onrUserFixture: OnrUser =
  OnrUser(
    oidHenkilo = "1.2.246.562.24.00000000000000006666",
    kutsumanimi = "Erkki",
    sukunimi = "Esittelijä",
    kansalaisuus = Seq(KansalaisuusKoodi("123")),
    hetu = Some("010171-789X"),
    true
  )
