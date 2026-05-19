package fi.oph.tutu.backend.repository

import org.springframework.stereotype.{Component, Repository}

@Component
@Repository
class PaatospohjaRepository extends TekstipohjaRepositoryBase {

  def kategoriaTable = "paatospohja_kategoria"
  def pohjaTable     = "paatospohja"

  def kategoriaListOperation    = "hae_paatospohja_kategoriat"
  def kategoriaHakuOperation    = "hae_paatospohja_kategoria"
  def lisaaKategoriaOperation   = "lisaa_paatospohja_kategoria"
  def paivitaKategoriaOperation = "paivita_paatospohja_kategoria"

  def pohjaListOperation    = "hae_paatospohjalista"
  def pohjanHakuOperation   = "hae_paatospohja"
  def lisaaPohjaOperation   = "lisaa_paatospohja"
  def paivitaPohjaOperation = "paivita_paatospohja"
  def poistaPohjaOperation  = "poista_paatospohja"

  def singlePohjaDescGenitiveCase     = "paatospohjan"
  def singleKategoriaDescGenitiveCase = "paatospohjakategorian"
  def pohjaListDescGenitiveCase       = "paatospohjien"
  def kategoriaListDescGenitiveCase   = "paatospohjakategorioiden"
}
