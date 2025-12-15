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
  hyvaksymispaiva: Option[LocalDateTime] = None,
  lahetyspaiva: Option[LocalDateTime] = None,
  luotu: Option[LocalDateTime] = None,
  luoja: Option[String] = None,
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
  kielteisenPaatoksenPerustelut: Option[KielteisenPaatoksenPerustelut] = None,
  tutkintoTaso: Option[TutkintoTaso],
  rinnastettavatTutkinnotTaiOpinnot: Seq[TutkintoTaiOpinto] = Seq(),
  kelpoisuudet: Seq[Kelpoisuus] = Seq(),
  luotu: Option[LocalDateTime] = None,
  luoja: Option[String] = None,
  muokkaaja: Option[String] = None
) {
  def containsTutkinnotOrKelpoisuudet: Boolean =
    rinnastettavatTutkinnotTaiOpinnot.nonEmpty || kelpoisuudet.nonEmpty
}

case class TutkintoTaiOpinto(
  id: Option[UUID] = None,
  paatostietoId: Option[UUID] = None,
  tutkintoTaiOpinto: Option[String] = None,
  opetuskieli: Option[String] = None,
  myonteinenPaatos: Option[Boolean] = None,
  myonteisenPaatoksenLisavaatimukset: Option[MyonteisenPaatoksenLisavaatimukset] = None,
  kielteisenPaatoksenPerustelut: Option[KielteisenPaatoksenPerustelut] = None,
  luotu: Option[LocalDateTime] = None,
  luoja: Option[String] = None,
  muokkaaja: Option[String] = None
)

case class MyonteisenPaatoksenLisavaatimukset(
  taydentavatOpinnot: Boolean = false,
  kelpoisuuskoe: Boolean = false,
  sopeutumisaika: Boolean = false
)

case class NamedBoolean(name: String, value: Boolean)

case class ErotKoulutuksessa(
  erot: Seq[NamedBoolean] = Seq(),
  muuEro: Option[Boolean] = None,
  muuEroKuvaus: Option[String] = None
)

case class KelpoisuuskoeSisalto(
  aihealue1: Boolean = false,
  aihealue2: Boolean = false,
  aihealue3: Boolean = false
)

case class KorvaavaToimenpide(
  taydentavatOpinnot: Option[Boolean] = None,
  kelpoisuuskoe: Boolean = false,
  kelpoisuuskoeSisalto: Option[KelpoisuuskoeSisalto] = None,
  sopeutumisaika: Boolean = false,
  sopeutumiusaikaKestoKk: Option[String] = None,
  kelpoisuuskoeJaSopeutumisaika: Boolean = false,
  kelpoisuuskoeJaSopeutumisaikaSisalto: Option[KelpoisuuskoeSisalto] = None,
  kelpoisuuskoeJaSopeutumisaikaKestoKk: Option[String] = None
)

case class AmmattikomemusJaElinikainenOppiminen(
  ammattikokemus: Option[Boolean] = None,
  elinikainenOppiminen: Option[Boolean] = None,
  lisatieto: Option[String] = None,
  korvaavuus: Option[AmmattikokemusElinikainenOppiminenKorvaavuus] = None,
  korvaavaToimenpide: Option[KorvaavaToimenpide] = None
)

case class KelpoisuudenLisavaatimukset(
  olennaisiaEroja: Option[Boolean] = None,
  erotKoulutuksessa: Option[ErotKoulutuksessa] = None,
  korvaavaToimenpide: Option[KorvaavaToimenpide] = None,
  ammattikokemusJaElinikainenOppiminen: Option[AmmattikomemusJaElinikainenOppiminen] = None
)

case class KielteisenPaatoksenPerustelut(
  epavirallinenKorkeakoulu: Boolean = false,
  epavirallinenTutkinto: Boolean = false,
  eiVastaaSuomessaSuoritettavaaTutkintoa: Boolean = false,
  muuPerustelu: Boolean = false,
  muuPerusteluKuvaus: Option[String] = None
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
  myonteinenPaatos: Option[Boolean] = None,
  myonteisenPaatoksenLisavaatimukset: Option[KelpoisuudenLisavaatimukset] = None,
  kielteisenPaatoksenPerustelut: Option[KielteisenPaatoksenPerustelut] = None,
  luotu: Option[LocalDateTime] = None,
  luoja: Option[String] = None,
  muokkaaja: Option[String] = None
)
