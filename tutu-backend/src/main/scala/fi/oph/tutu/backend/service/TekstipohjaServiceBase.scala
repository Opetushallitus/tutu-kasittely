package fi.oph.tutu.backend.service

import fi.oph.tutu.backend.domain.{
  KategorianTekstipohjat,
  ListSortParam,
  SortDef,
  Tekstipohja,
  TekstipohjaItem,
  TekstipohjaKategoria,
  TekstipohjaListItem
}
import fi.oph.tutu.backend.repository.TekstipohjaRepositoryBase

import java.util.UUID

trait TekstipohjaServiceBase(repository: TekstipohjaRepositoryBase) {
  def haeTekstipohjaLista(): Seq[TekstipohjaListItem] = {
    repository.haeTekstipohjaLista()
  }

  def haeTekstipohja(tekstipohjaId: UUID): Option[Tekstipohja] = {
    repository.haeTekstipohja(tekstipohjaId)
  }

  def haeTekstipohjatKategorioittain(): Seq[KategorianTekstipohjat] = {
    val kaikkiKategoriat   = repository.haeTekstipohjaKategoriat()
    val kaikkiTekstipohjat =
      repository
        .haeTekstipohjaLista()
        .filter(_.kategoriaId.isDefined)
        .groupBy(_.kategoriaId.get)

    kaikkiKategoriat.map(kategoria =>
      KategorianTekstipohjat(
        kategoriaNimi = kategoria.nimi,
        pohjat =
          kaikkiTekstipohjat.getOrElse(kategoria.id.get, Seq()).map(pohja => TekstipohjaItem(pohja.id.get, pohja.nimi))
      )
    )
  }

  def lisaaTekstipohja(tekstipohja: Tekstipohja, luoja: String): Tekstipohja = {
    repository.lisaaTekstipohja(tekstipohja, luoja)
  }

  def paivitaTekstipohja(tekstipohjaId: UUID, tekstipohja: Tekstipohja, muokkaaja: String): Option[Tekstipohja] = {
    repository.paivitaTekstipohja(tekstipohjaId, tekstipohja, muokkaaja)
  }

  def poistaTekstipohja(viestipohjaId: UUID): Int = {
    repository.poistaTekstipohja(viestipohjaId)
  }

  def haeTekstipohjaKategoriat(): Seq[TekstipohjaKategoria] = {
    repository.haeTekstipohjaKategoriat()
  }

  def haeTekstipohjaKategoria(tekstipohjaKategoriaId: UUID): Option[TekstipohjaKategoria] = {
    repository.haeTekstipohjaKategoria(tekstipohjaKategoriaId)
  }

  def lisaaTekstipohjaKategoria(tekstipohjaKategoria: TekstipohjaKategoria, luoja: String): TekstipohjaKategoria = {
    repository.lisaaTekstipohjaKategoria(tekstipohjaKategoria, luoja)
  }

  def paivitaTekstipohjaKategoria(
    tekstipohjaKategoriaId: UUID,
    tekstipohjaKategoria: TekstipohjaKategoria,
    muokkaaja: String
  ): Option[TekstipohjaKategoria] = {
    repository.paivitaTekstipohjaKategoria(tekstipohjaKategoriaId, tekstipohjaKategoria, muokkaaja)
  }
}
