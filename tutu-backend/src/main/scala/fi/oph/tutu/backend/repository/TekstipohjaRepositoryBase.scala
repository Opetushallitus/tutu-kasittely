package fi.oph.tutu.backend.repository

import fi.oph.tutu.backend.domain.SortDef.Asc
import fi.oph.tutu.backend.domain.{ListSortParam, SortDef, Tekstipohja, TekstipohjaKategoria, TekstipohjaListItem}
import org.slf4j.{Logger, LoggerFactory}

import java.util.UUID
import slick.jdbc.PostgresProfile.api.*

trait TekstipohjaRepositoryBase extends TekstipohjaResultHandlers {
  val LOG: Logger = LoggerFactory.getLogger(classOf[TekstipohjaRepositoryBase])

  private val sortableKategoriaFields = Set("luotu", "nimi")
  private val sortablePohjaFields     = Set("luotu", "nimi")

  def kategoriaTable: String
  def pohjaTable: String

  def kategoriaListOperation: String
  def kategoriaHakuOperation: String
  def lisaaKategoriaOperation: String
  def paivitaKategoriaOperation: String
  def pohjaListOperation: String
  def pohjanHakuOperation: String
  def lisaaPohjaOperation: String
  def paivitaPohjaOperation: String
  def poistaPohjaOperation: String

  def singlePohjaDescGenitiveCase: String
  def singleKategoriaDescGenitiveCase: String
  def pohjaListDescGenitiveCase: String
  def kategoriaListDescGenitiveCase: String

  def haeTekstipohjaKategoriat(sortParam: ListSortParam = ListSortParam("luotu", Asc)): Seq[TekstipohjaKategoria] = {
    if (!sortableKategoriaFields.contains(sortParam.param)) {
      throw RuntimeException(s"Tuntematon sort kenttä: ${sortParam.param}")
    }
    try {
      db.run(
        sql"""
            SELECT id, nimi, luotu, luoja, muokattu, muokkaaja
            FROM #$kategoriaTable
            ORDER BY #${sortParam.param} #${SortDef.toSql(sortParam.sortDef)}""".as[TekstipohjaKategoria],
        kategoriaListOperation
      )
    } catch {
      case e: Exception =>
        LOG.error(s"$kategoriaListDescGenitiveCase haku epäonnistui: $e")
        throw new RuntimeException(
          s"$kategoriaListDescGenitiveCase haku epäonnistui: ${e.getMessage}",
          e
        )
    }
  }

  def haeTekstipohjaKategoria(tekstipohjaKategoriaId: UUID): Option[TekstipohjaKategoria] = {
    try {
      db.run(
        sql"""SELECT id, nimi, luotu, luoja, muokattu, muokkaaja
              FROM #$kategoriaTable
              WHERE id = ${tekstipohjaKategoriaId.toString}::uuid""".as[TekstipohjaKategoria].headOption,
        kategoriaHakuOperation
      )
    } catch {
      case e: Exception =>
        LOG.error(s"$singleKategoriaDescGenitiveCase haku epäonnistui: $e")
        throw new RuntimeException(
          s"$singleKategoriaDescGenitiveCase haku epäonnistui: ${e.getMessage}",
          e
        )
    }
  }

  def lisaaTekstipohjaKategoria(tekstipohjaKategoria: TekstipohjaKategoria, luoja: String): TekstipohjaKategoria = {
    try {
      db.run(
        sql"""INSERT INTO #$kategoriaTable
                         (nimi, luoja)
                       VALUES (
                         ${tekstipohjaKategoria.nimi},
                         $luoja
                       )
                       RETURNING
                         id,
                         nimi,
                         luotu,
                         luoja,
                         muokattu,
                         muokkaaja""".as[TekstipohjaKategoria].head,
        lisaaKategoriaOperation
      )
    } catch {
      case e: Exception =>
        LOG.error(s"$singleKategoriaDescGenitiveCase tallentaminen epäonnistui: $e")
        throw new RuntimeException(
          s"$singleKategoriaDescGenitiveCase tallentaminen epäonnistui: ${e.getMessage}",
          e
        )
    }
  }

  def paivitaTekstipohjaKategoria(
    kategoriaId: UUID,
    kategoria: TekstipohjaKategoria,
    muokkaaja: String
  ): Option[TekstipohjaKategoria] = {
    try {
      db.run(
        sql"""UPDATE #$kategoriaTable
                SET
                  nimi = ${kategoria.nimi},
                  muokkaaja = $muokkaaja
                WHERE id = ${kategoriaId.toString}::uuid
                RETURNING
                  id,
                  nimi,
                  luotu,
                  luoja,
                  muokattu,
                  muokkaaja""".as[TekstipohjaKategoria].headOption,
        paivitaKategoriaOperation
      )
    } catch {
      case e: Exception =>
        LOG.error(s"$singleKategoriaDescGenitiveCase tallentaminen epäonnistui: $e")
        throw new RuntimeException(
          s"$singleKategoriaDescGenitiveCase tallentaminen epäonnistui: ${e.getMessage}",
          e
        )
    }
  }

  def haeTekstipohjaLista(sortParam: ListSortParam = ListSortParam("luotu", Asc)): Seq[TekstipohjaListItem] = {
    if (!sortablePohjaFields.contains(sortParam.param)) {
      throw RuntimeException(s"Tuntematon sort kenttä: ${sortParam.param}")
    }
    try {
      db.run(
        sql"""SELECT
                id,
                kategoria_id,
                nimi
              FROM #$pohjaTable
              ORDER BY #${sortParam.param} #${SortDef.toSql(sortParam.sortDef)}""".as[TekstipohjaListItem],
        pohjaListOperation
      )
    } catch {
      case e: Exception =>
        LOG.error(s"$pohjaListDescGenitiveCase haku epäonnistui: $e")
        throw new RuntimeException(
          s"$pohjaListDescGenitiveCase haku epäonnistui: ${e.getMessage}",
          e
        )
    }
  }

  def haeTekstipohja(tekstipohjaId: UUID): Option[Tekstipohja] = {
    try {
      db.run(
        sql"""
                    SELECT
                      id,
                      kategoria_id,
                      nimi,
                      sisalto,
                      luotu,
                      luoja,
                      muokattu,
                      muokkaaja
                    FROM #$pohjaTable
                    WHERE
                     id = ${tekstipohjaId.toString}::uuid
                     """.as[Tekstipohja].headOption,
        pohjanHakuOperation
      )
    } catch {
      case e: Exception =>
        LOG.error(s"$singlePohjaDescGenitiveCase ${tekstipohjaId.toString} haku epäonnistui: $e")
        throw new RuntimeException(
          s"$singlePohjaDescGenitiveCase haku epäonnistui: ${e.getMessage}",
          e
        )
    }
  }

  def lisaaTekstipohja(tekstipohja: Tekstipohja, luoja: String): Tekstipohja = {
    try {
      val sisaltoJson: String = kielistettyToJson(tekstipohja.sisalto)

      db.run(
        sql"""INSERT INTO #$pohjaTable (
                kategoria_id,
                nimi,
                sisalto,
                luoja
              )
              VALUES (
                ${tekstipohja.kategoriaId.map(_.toString).orNull}::uuid,
                ${tekstipohja.nimi},
                $sisaltoJson::jsonb,
                $luoja
              )
              RETURNING
                id,
                kategoria_id,
                nimi,
                sisalto,
                luotu,
                luoja,
                muokattu,
                muokkaaja""".as[Tekstipohja].head,
        lisaaPohjaOperation
      )
    } catch {
      case e: Exception =>
        LOG.error(s"$singlePohjaDescGenitiveCase tallentaminen epäonnistui: $e")
        throw new RuntimeException(
          s"$singlePohjaDescGenitiveCase tallentaminen epäonnistui: ${e.getMessage}",
          e
        )
    }
  }

  def paivitaTekstipohja(tekstipohjaId: UUID, tekstipohja: Tekstipohja, muokkaaja: String): Option[Tekstipohja] = {
    try {
      val sisaltoJson: String = kielistettyToJson(tekstipohja.sisalto)

      db.run(
        sql"""UPDATE #$pohjaTable
              SET
                kategoria_id = ${tekstipohja.kategoriaId.map(_.toString).orNull}::uuid,
                nimi = ${tekstipohja.nimi},
                sisalto = $sisaltoJson::jsonb,
                muokkaaja = $muokkaaja
              WHERE id = ${tekstipohjaId.toString}::uuid
              RETURNING
                id,
                kategoria_id,
                nimi,
                sisalto,
                luotu,
                luoja,
                muokattu,
                muokkaaja""".as[Tekstipohja].headOption,
        paivitaPohjaOperation
      )
    } catch {
      case e: Exception =>
        LOG.error(s"$singlePohjaDescGenitiveCase $tekstipohjaId päivittäminen epäonnistui: $e")
        throw new RuntimeException(
          s"$singlePohjaDescGenitiveCase päivittäminen epäonnistui: ${e.getMessage}",
          e
        )
    }
  }

  def poistaTekstipohja(tekstipohjaId: UUID): Int = {
    try {
      db.run(
        sqlu"""DELETE FROM #$pohjaTable WHERE id = ${tekstipohjaId.toString}::uuid""",
        poistaPohjaOperation
      )
    } catch {
      case e: Exception =>
        LOG.error(s"$singlePohjaDescGenitiveCase ${tekstipohjaId.toString} poistaminen epäonnistui: $e")
        throw new RuntimeException(
          s"$singlePohjaDescGenitiveCase poistaminen epäonnistui: ${e.getMessage}",
          e
        )
    }
  }
}
