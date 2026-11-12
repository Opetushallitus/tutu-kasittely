package fi.oph.tutu.backend.service

import fi.oph.tutu.backend.domain.*
import fi.oph.tutu.backend.exception.TekstipohjaValidationException
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
    repository.lisaaTekstipohja(validoi(tekstipohja), luoja)
  }

  def paivitaTekstipohja(tekstipohjaId: UUID, tekstipohja: Tekstipohja, muokkaaja: String): Option[Tekstipohja] = {
    repository.paivitaTekstipohja(tekstipohjaId, validoi(tekstipohja), muokkaaja)
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
    repository.lisaaTekstipohjaKategoria(validoi(tekstipohjaKategoria), luoja)
  }

  def paivitaTekstipohjaKategoria(
    tekstipohjaKategoriaId: UUID,
    tekstipohjaKategoria: TekstipohjaKategoria,
    muokkaaja: String
  ): Option[TekstipohjaKategoria] = {
    repository.paivitaTekstipohjaKategoria(tekstipohjaKategoriaId, validoi(tekstipohjaKategoria), muokkaaja)
  }

  private def validoiNimi(nimi: String): Unit = {
    if (nimi == null || nimi.isBlank) {
      throw new TekstipohjaValidationException("Nimi on pakollinen")
    }
  }

  private def validoi(tekstipohja: Tekstipohja): Tekstipohja = {
    validoiNimi(tekstipohja.nimi)
    if (tekstipohja.sisalto == null) {
      throw new TekstipohjaValidationException("Sisältö on pakollinen")
    }
    tekstipohja.kategoriaId match {
      case None =>
        throw new TekstipohjaValidationException("Kategoria on pakollinen")
      case Some(kategoriaId) if repository.haeTekstipohjaKategoria(kategoriaId).isEmpty =>
        throw new TekstipohjaValidationException("Kategoriaa ei löydy")
      case _ =>
    }
    tekstipohja
  }

  private def validoi(kategoria: TekstipohjaKategoria): TekstipohjaKategoria = {
    validoiNimi(kategoria.nimi)
    if (repository.haeTekstipohjaKategoriat().exists(k => k.nimi == kategoria.nimi && k.id != kategoria.id)) {
      throw new TekstipohjaValidationException("Kategoria on jo olemassa")
    }
    kategoria
  }
}
