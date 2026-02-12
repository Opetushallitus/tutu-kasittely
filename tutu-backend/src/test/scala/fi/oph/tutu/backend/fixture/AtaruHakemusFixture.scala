package fi.oph.tutu.backend.fixture

import fi.oph.tutu.backend.domain.{AtaruHakemus, Content}

val ataruHakemusFixture = AtaruHakemus(
  haku = None,
  etunimet = "",
  key = "1.2.246.562.11.00000000000000006666",
  form_id = 1234567890,
  content = Content(answers = Seq()),
  latestVersionCreated = "",
  state = "",
  modified = "",
  submitted = "",
  lang = "fi",
  sukunimi = "",
  `application-review-notes` = None,
  henkilotunnus = None,
  `person-oid` = "1.2.246.562.24.00000000000000006666",
  `application-hakukohde-attachment-reviews` = Seq(),
  `latest-attachment-reviews` = Seq(),
  `application-hakukohde-reviews` = Seq(),
  hakutoiveet = Seq(),
  `information-request-timestamp` = None
)
