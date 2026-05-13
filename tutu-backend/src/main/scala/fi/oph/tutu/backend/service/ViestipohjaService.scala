package fi.oph.tutu.backend.service

import fi.oph.tutu.backend.domain.{Viestipohja, ViestipohjaKategoria, ViestipohjaListItem}
import fi.oph.tutu.backend.repository.ViestipohjaRepository
import org.springframework.stereotype.{Component, Service}

import java.util.UUID

@Component
@Service
class ViestipohjaService(viestipohjaRepository: ViestipohjaRepository) {
  def haeViestipohjaLista(): Seq[ViestipohjaListItem] = {
    viestipohjaRepository.haeViestipohjaLista()
  }

  def haeViestipohja(viestipohjaId: UUID): Option[Viestipohja] = {
    viestipohjaRepository.haeViestipohja(viestipohjaId)
  }

  def lisaaViestipohja(viestipohja: Viestipohja, luoja: String): Viestipohja = {
    viestipohjaRepository.lisaaViestipohja(viestipohja, luoja)
  }

  def paivitaViestipohja(viestipohjaId: UUID, viestipohja: Viestipohja, muokkaaja: String): Option[Viestipohja] = {
    viestipohjaRepository.paivitaViestipohja(viestipohjaId, viestipohja, muokkaaja)
  }

  def poistaViestipohja(viestipohjaId: UUID): Int = {
    viestipohjaRepository.poistaViestipohja(viestipohjaId)
  }

  def haeViestipohjaKategoriat(): Seq[ViestipohjaKategoria] = {
    viestipohjaRepository.haeViestipohjaKategoriat()
  }

  def haeViestipohjaKategoria(viestipohjaKategoriaId: UUID): Option[ViestipohjaKategoria] = {
    viestipohjaRepository.haeViestipohjaKategoria(viestipohjaKategoriaId)
  }

  def lisaaViestipohjaKategoria(viestipohjaKategoria: ViestipohjaKategoria, luoja: String): ViestipohjaKategoria = {
    viestipohjaRepository.lisaaViestipohjaKategoria(viestipohjaKategoria, luoja)
  }

  def paivitaViestipohjaKategoria(
    viestipohjaKategoriaId: UUID,
    viestipohjaKategoria: ViestipohjaKategoria,
    muokkaaja: String
  ): Option[ViestipohjaKategoria] = {
    viestipohjaRepository.paivitaViestipohjaKategoria(viestipohjaKategoriaId, viestipohjaKategoria, muokkaaja)
  }
}
