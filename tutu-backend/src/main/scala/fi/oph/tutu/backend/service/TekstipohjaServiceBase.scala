package fi.oph.tutu.backend.service

import fi.oph.tutu.backend.domain.*
import fi.oph.tutu.backend.repository.TekstipohjaRepositoryBase

import java.util.UUID

trait TekstipohjaServiceBase(repository: TekstipohjaRepositoryBase, esittelijaService: EsittelijaService) {
  def haeTekstipohjaLista(): Seq[TekstipohjaListItem] = {
    repository.haeTekstipohjaLista()
  }

  private def haeNimet(tekstipohja: Tekstipohja) = {
    tekstipohja.copy(
      luoja = tekstipohja.luoja.flatMap(oid => esittelijaService.haeEsittelijaNimi(oid)),
      muokkaaja = tekstipohja.muokkaaja.flatMap(oid => esittelijaService.haeEsittelijaNimi(oid))
    )
  }

  def haeTekstipohja(tekstipohjaId: UUID): Option[Tekstipohja] = {
    val tekstipohjaOption = repository.haeTekstipohja(tekstipohjaId)
    tekstipohjaOption.map(haeNimet)
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
    haeNimet(
      repository
        .lisaaTekstipohja(tekstipohja, luoja)
    )
  }

  def paivitaTekstipohja(tekstipohjaId: UUID, tekstipohja: Tekstipohja, muokkaaja: String): Option[Tekstipohja] = {
    val tekstipohjaOption = repository.paivitaTekstipohja(tekstipohjaId, tekstipohja, muokkaaja)
    tekstipohjaOption.map(haeNimet)
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
