package fi.oph.tutu.backend.domain

import java.util.UUID

case class Tutkinto(
  id: Option[UUID],
  hakemusId: UUID,
  jarjestys: String,
  nimi: Option[String],
  oppilaitos: Option[String],
  aloitusVuosi: Option[Int] = None,
  paattymisVuosi: Option[Int] = None,
  maakoodi: Option[String] = None,
  muuTutkintoTieto: Option[String] = None,
  todistuksenPaivamaara: Option[String] = None,
  koulutusalaKoodi: Option[String] = None,
  paaaaineTaiErikoisala: Option[String] = None,
  todistusOtsikko: Option[String] = None,
  muuTutkintoMuistioId: Option[UUID] = None
)
