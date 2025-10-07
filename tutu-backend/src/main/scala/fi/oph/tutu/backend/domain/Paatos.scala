package fi.oph.tutu.backend.domain

import fi.oph.tutu.backend.domain.Ratkaisutyyppi.PeruutusTaiRaukeaminen

import java.time.LocalDateTime
import java.util.UUID

case class Paatos(
  id: Option[UUID] = None,
  hakemusId: Option[UUID] = None,
  ratkaisutyyppi: Option[Ratkaisutyyppi] = None,
  seutArviointi: Boolean = false,
  peruutuksenTaiRaukeamisenSyy: Option[PeruutuksenTaiRaukeamisenSyy] = None,
  luotu: Option[LocalDateTime] = None,
  luoja: Option[String] = None,
  muokattu: Option[LocalDateTime] = None,
  muokkaaja: Option[String] = None
) {
  private def ratkaisutyyppiOnPeruutusTaiRaukeaminen(toBeRatkaisutyyppi: Option[Ratkaisutyyppi]): Boolean = {
    toBeRatkaisutyyppi.contains(PeruutusTaiRaukeaminen) ||
    (ratkaisutyyppi.contains(PeruutusTaiRaukeaminen) && toBeRatkaisutyyppi.isEmpty)
  }
  def mergeWith(partial: PartialPaatos): Paatos =
    this.copy(
      ratkaisutyyppi = partial.ratkaisutyyppi.orElse(this.ratkaisutyyppi),
      seutArviointi = partial.seutArviointi.getOrElse(this.seutArviointi),
      peruutuksenTaiRaukeamisenSyy =
        if (ratkaisutyyppiOnPeruutusTaiRaukeaminen(partial.ratkaisutyyppi))
          partial.peruutuksenTaiRaukeamisenSyy.orElse(this.peruutuksenTaiRaukeamisenSyy)
        else None
    )
}

case class PartialPaatos(
  ratkaisutyyppi: Option[Ratkaisutyyppi] = None,
  seutArviointi: Option[Boolean] = None,
  peruutuksenTaiRaukeamisenSyy: Option[PeruutuksenTaiRaukeamisenSyy] = None
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
