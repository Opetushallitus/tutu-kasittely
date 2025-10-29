package fi.oph.tutu.backend.domain

import java.time.LocalDateTime
import java.util.UUID

case class Paatos(
  id: Option[UUID] = None,
  hakemusId: Option[UUID] = None,
  ratkaisutyyppi: Option[Ratkaisutyyppi] = None,
  seutArviointi: Boolean = false,
  peruutuksenTaiRaukeamisenSyy: Option[PeruutuksenTaiRaukeamisenSyy] = None,
  paatosTiedot: Seq[PaatosTieto] = Seq(),
  paatosTietoOptions: Option[PaatosTietoOptions] = None,
  luotu: Option[LocalDateTime] = None,
  luoja: Option[String] = None,
  muokattu: Option[LocalDateTime] = None,
  muokkaaja: Option[String] = None
)

case class PeruutuksenTaiRaukeamisenSyy(
  eiSaaHakemaansaEikaHaluaPaatostaJonkaVoisiSaada: Option[Boolean] = None,
  muutenTyytymatonRatkaisuun: Option[Boolean] = None,
  eiApMukainenTutkintoTaiHaettuaPatevyytta: Option[Boolean] = None,
  eiTasoltaanVastaaSuomessaSuoritettavaaTutkintoa: Option[Boolean] = None,
  epavirallinenKorkeakouluTaiTutkinto: Option[Boolean] = None,
  eiEdellytyksiaRoEikaTasopaatokselle: Option[Boolean] = None,
  eiEdellytyksiaRinnastaaTiettyihinKkOpintoihin: Option[Boolean] = None,
  hakijallaJoPaatosSamastaKoulutusKokonaisuudesta: Option[Boolean] = None,
  muuSyy: Option[Boolean] = None
)

case class PaatosTieto(
  id: Option[UUID] = None,
  paatosId: Option[UUID] = None,
  paatosTyyppi: Option[PaatosTyyppi] = None,
  sovellettuLaki: Option[SovellettuLaki] = None,
  tutkintoId: Option[UUID] = None,
  lisaaTutkintoPaatostekstiin: Option[Boolean] = None,
  myonteinenPaatos: Option[Boolean] = None,
  // TODO: case classeiksi
  myonteisenPaatoksenLisavaatimukset: Option[String] = None, // TODO: poistetaan ja dropataan columni jos ei tarvita?
  kielteisenPaatoksenPerustelut: Option[String] = None,
  tutkintoTaso: Option[TutkintoTaso],
  rinnastettavatTutkinnotTaiOpinnot: Seq[TutkintoTaiOpinto] = Seq(),
  kelpoisuudet: Seq[Kelpoisuus] = Seq(),
  luotu: Option[LocalDateTime] = None,
  luoja: Option[String] = None,
  muokattu: Option[LocalDateTime] = None,
  muokkaaja: Option[String] = None
)

case class TutkintoTaiOpinto(
  id: Option[UUID] = None,
  paatostietoId: Option[UUID] = None,
  tutkintoTaiOpinto: Option[String] = None,
  myonteinenPaatos: Option[Boolean] = None,
  // TODO: case classeiksi
  myonteisenPaatoksenLisavaatimukset: Option[String] = None,
  kielteisenPaatoksenPerustelut: Option[String] = None,
  luotu: Option[LocalDateTime] = None,
  luoja: Option[String] = None,
  muokattu: Option[LocalDateTime] = None,
  muokkaaja: Option[String] = None
)

case class PaatosTietoModifyData(
  uudet: Seq[PaatosTieto] = Seq.empty,
  muutetut: Seq[PaatosTieto] = Seq.empty,
  poistetut: Seq[UUID] = Seq.empty
)

case class Kelpoisuus(
  id: Option[UUID] = None,
  paatostietoId: Option[UUID] = None,
  kelpoisuus: Option[String] = None,
  opetettavaAine: Option[String] = None,
  muuAmmattiKuvaus: Option[String] = None,
  direktiivitaso: Option[Direktiivitaso] = None,
  kansallisestiVaadittavaDirektiivitaso: Option[Direktiivitaso] = None,
  direktiivitasoLisatiedot: Option[String] = None,
  // TODO: case classeiksi
  myonteinenPaatos: Option[Boolean] = None,
  myonteisenPaatoksenLisavaatimukset: Option[String] = None,
  kielteisenPaatoksenPerustelut: Option[String] = None,
  luotu: Option[LocalDateTime] = None,
  luoja: Option[String] = None,
  muokattu: Option[LocalDateTime] = None,
  muokkaaja: Option[String] = None
)
