package fi.oph.tutu.backend.domain

import com.fasterxml.jackson.annotation.JsonIgnoreProperties

/**
 * Käyttäjän tiedot käyttöoikeus-palvelusta.
 *
 * kayttajaTyyppi:
 * - "VIRKAILIJA" = normaali käyttäjä
 * - "PALVELU" = palvelukäyttäjä
 */
@JsonIgnoreProperties(ignoreUnknown = true)
case class Kayttajatiedot(
  username: String,
  mfaProvider: Option[String],
  kayttajaTyyppi: String
)
