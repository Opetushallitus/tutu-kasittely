package fi.oph.tutu.backend.repository

import org.springframework.stereotype.{Component, Repository}

@Component
@Repository
class ViestipohjaRepository extends TekstipohjaRepositoryBase {

  def kategoriaTable = "viestipohja_kategoria"
  def pohjaTable     = "viestipohja"

  def kategoriaListOperation    = "hae_viestipohja_kategoriat"
  def kategoriaHakuOperation    = "hae_viestipohja_kategoria"
  def lisaaKategoriaOperation   = "lisaa_viestipohja_kategoria"
  def paivitaKategoriaOperation = "paivita_viestipohja_kategoria"

  def pohjaListOperation    = "hae_viestipohjalista"
  def pohjanHakuOperation   = "hae_viestipohja"
  def lisaaPohjaOperation   = "lisaa_viestipohja"
  def paivitaPohjaOperation = "paivita_viestipohja"
  def poistaPohjaOperation  = "poista_viestipohja"

  def singlePohjaDescGenitiveCase     = "viestipohjan"
  def singleKategoriaDescGenitiveCase = "viestipohjakategorian"
  def pohjaListDescGenitiveCase       = "viestipohjien"
  def kategoriaListDescGenitiveCase   = "viestipohjakategorioiden"
}
