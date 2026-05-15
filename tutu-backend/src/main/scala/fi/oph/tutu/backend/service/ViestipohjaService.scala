package fi.oph.tutu.backend.service

import fi.oph.tutu.backend.domain.{
  KategorianTekstipohjat,
  ListSortParam,
  SortDef,
  TekstipohjaItem,
  Viestipohja,
  ViestipohjaKategoria,
  ViestipohjaListItem
}
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

  def haeViestipohjatKategorioittain(): Seq[KategorianTekstipohjat] = {
    val kaikkiKategoriat   = viestipohjaRepository.haeViestipohjaKategoriat(ListSortParam("nimi", SortDef.Asc))
    val kaikkiViestipohjat =
      viestipohjaRepository
        .haeViestipohjaLista(ListSortParam("nimi", SortDef.Asc))
        .filter(_.kategoriaId.isDefined)
        .groupBy(_.kategoriaId.get)

    kaikkiKategoriat.map(kategoria =>
      KategorianTekstipohjat(
        kategoriaNimi = kategoria.nimi,
        pohjat =
          kaikkiViestipohjat.getOrElse(kategoria.id.get, Seq()).map(pohja => TekstipohjaItem(pohja.id.get, pohja.nimi))
      )
    )
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
