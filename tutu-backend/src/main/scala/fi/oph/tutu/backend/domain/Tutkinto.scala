package fi.oph.tutu.backend.domain

import java.time.LocalDateTime
import java.util.UUID

case class Tutkinto(
  id: Option[UUID],
  hakemusId: UUID,
  jarjestys: String,
  nimi: Option[String],
  oppilaitos: Option[String],
  aloitusVuosi: Option[Int] = None,
  paattymisVuosi: Option[Int] = None,
  maakoodiUri: Option[String] = None,
  muuTutkintoTieto: Option[String] = None,
  todistuksenPaivamaara: Option[String] = None,
  koulutusalaKoodiUri: Option[String] = None,
  paaaaineTaiErikoisala: Option[String] = None,
  todistusOtsikko: Option[String] = None,
  muuTutkintoMuistioId: Option[UUID] = None,
  ohjeellinenLaajuus: Option[String] = None,
  opinnaytetyo: Option[Boolean] = None,
  harjoittelu: Option[Boolean] = None,
  perustelunLisatietoja: Option[String] = None,
  muokkaaja: Option[String] = None
)

case class TutkintoModifyData(uudet: Seq[Tutkinto], muutetut: Seq[Tutkinto], poistetut: Seq[UUID])
