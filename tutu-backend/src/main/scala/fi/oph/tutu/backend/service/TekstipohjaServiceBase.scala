package fi.oph.tutu.backend.service

import fi.oph.tutu.backend.domain.*
import fi.oph.tutu.backend.repository.TekstipohjaRepositoryBase

import java.util.UUID

trait TekstipohjaServiceBase(repository: TekstipohjaRepositoryBase, onrService: OnrService) {
  def haeTekstipohjaLista(): Seq[TekstipohjaListItem] = {
    repository.haeTekstipohjaLista()
  }

  def haeTekstipohja(tekstipohjaId: UUID): Option[Tekstipohja] = {
    val tekstipohjaOption = repository.haeTekstipohja(tekstipohjaId)
    tekstipohjaOption.map(tp =>
      tp.copy(
        luoja = onrService.haeNimiOption(tp.luoja),
        muokkaaja = onrService.haeNimiOption(tp.muokkaaja)
      )
    )
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
    repository
      .lisaaTekstipohja(tekstipohja, luoja)
      .copy(
        luoja = onrService.haeNimiOption(Some(luoja))
      )
  }

  def paivitaTekstipohja(tekstipohjaId: UUID, tekstipohja: Tekstipohja, muokkaaja: String): Option[Tekstipohja] = {
    val tekstipohjaOption = repository.paivitaTekstipohja(tekstipohjaId, tekstipohja, muokkaaja)
    tekstipohjaOption.map(tp =>
      tp.copy(
        luoja = onrService.haeNimiOption(tp.luoja),
        muokkaaja = onrService.haeNimiOption(tp.muokkaaja)
      )
    )
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
