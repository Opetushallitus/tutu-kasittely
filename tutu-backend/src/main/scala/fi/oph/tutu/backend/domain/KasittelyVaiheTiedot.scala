package fi.oph.tutu.backend.domain

import java.time.LocalDateTime

/**
 * Kevyt data-objekti käsittelyvaiheen ratkaisemista varten.
 *
 * Sisältää vain ne tiedot, joita tarvitaan käsittelyvaiheen määrittämiseen,
 * välttäen tarpeettomien tietojen hakemista tietokannasta.
 */
case class KasittelyVaiheTiedot(
  selvityksetSaatu: Boolean,
  vahvistusPyyntoLahetetty: Option[LocalDateTime],
  vahvistusSaatu: Option[LocalDateTime],
  imiPyyntoLahetetty: Option[LocalDateTime],
  imiPyyntoVastattu: Option[LocalDateTime],
  lausuntoKesken: Boolean
)
