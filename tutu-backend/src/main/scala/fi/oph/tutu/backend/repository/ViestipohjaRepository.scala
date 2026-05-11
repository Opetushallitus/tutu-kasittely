package fi.oph.tutu.backend.repository

import fi.oph.tutu.backend.domain.{Kielistetty, Viestipohja, ViestipohjaKategoria, ViestipohjaListItem}
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.{Component, Repository}
import org.slf4j.{Logger, LoggerFactory}
import slick.jdbc.GetResult

import java.util.UUID
import slick.jdbc.PostgresProfile.api.*

@Component
@Repository
class ViestipohjaRepository extends BaseResultHandlers {
  @Autowired
  val db: TutuDatabase = null

  val LOG: Logger = LoggerFactory.getLogger(classOf[ViestipohjaRepository])

  implicit val getViestipohjaResult: GetResult[Viestipohja] =
    GetResult(r =>
      Viestipohja(
        id = Some(r.nextObject().asInstanceOf[UUID]),
        kategoriaId = r.nextObject().asInstanceOf[UUID],
        nimi = r.nextString(),
        sisalto = parseKielistetty(r.nextString()),
        luotu = Some(r.nextTimestamp().toLocalDateTime),
        luoja = Some(r.nextString()),
        muokattu = r.nextTimestampOption().map(_.toLocalDateTime),
        muokkaaja = r.nextStringOption()
      )
    )

  implicit val getViestipohjaListItemResult: GetResult[ViestipohjaListItem] =
    GetResult(r =>
      ViestipohjaListItem(
        id = Some(r.nextObject().asInstanceOf[UUID]),
        kategoriaId = r.nextObject().asInstanceOf[UUID],
        nimi = r.nextString()
      )
    )

  implicit val getViestipohjaKategoriaResult: GetResult[ViestipohjaKategoria] =
    GetResult(r =>
      ViestipohjaKategoria(
        id = Some(r.nextObject().asInstanceOf[UUID]),
        nimi = r.nextString(),
        luotu = Some(r.nextTimestamp().toLocalDateTime),
        luoja = Some(r.nextString()),
        muokattu = r.nextTimestampOption().map(_.toLocalDateTime),
        muokkaaja = r.nextStringOption()
      )
    )

  def haeViestipohjaKategoriat(): Seq[ViestipohjaKategoria] = {
    try {
      db.run(
        sql"""
              SELECT id, nimi, luotu, luoja, muokattu, muokkaaja
              FROM viestipohja_kategoria
              ORDER BY luotu ASC
               """.as[ViestipohjaKategoria],
        "hae_viestipohja_kategoriat"
      )
    } catch {
      case e: Exception =>
        LOG.error(s"Viestipohja kategorioiden haku epäonnistui: $e")
        throw new RuntimeException(
          s"Viestipohja kategorioiden haku epäonnistui: ${e.getMessage}",
          e
        )
    }
  }

  def haeViestipohjaKategoria(viestipohjaKategoriaId: UUID): Option[ViestipohjaKategoria] = {
    try {
      db.run(
        sql"""SELECT id, nimi, luotu, luoja, muokattu, muokkaaja
              FROM viestipohja_kategoria
              WHERE id = ${viestipohjaKategoriaId.toString}::uuid""".as[ViestipohjaKategoria].headOption,
        "hae_viestipohja_kategoria"
      )
    } catch {
      case e: Exception =>
        LOG.error(s"Viestipohja kategorian tallentaminen epäonnistui: $e")
        throw new RuntimeException(
          s"Viestipohja kategorian tallentaminen epäonnistui: ${e.getMessage}",
          e
        )
    }
  }

  def lisaaViestipohjaKategoria(viestipohjaKategoria: ViestipohjaKategoria, luoja: String): ViestipohjaKategoria = {
    try {
      db.run(
        sql"""INSERT INTO viestipohja_kategoria
                       (nimi, luoja)
                     VALUES (
                       ${viestipohjaKategoria.nimi},
                       $luoja
                     )
                     RETURNING
                       id,
                       nimi,
                       luotu,
                       luoja,
                       muokattu,
                       muokkaaja""".as[ViestipohjaKategoria].head,
        "lisaa_viestipohja_kategoria"
      )
    } catch {
      case e: Exception =>
        LOG.error(s"Viestipohja kategorian tallentaminen epäonnistui: $e")
        throw new RuntimeException(
          s"Viestipohja kategorian tallentaminen epäonnistui: ${e.getMessage}",
          e
        )
    }
  }

  def paivitaViestipohjaKategoria(
    viestipohjaKategoriaId: UUID,
    viestipohjaKategoria: ViestipohjaKategoria,
    muokkaaja: String
  ): Option[ViestipohjaKategoria] = {
    try {
      db.run(
        sql"""UPDATE viestipohja_kategoria
              SET
                nimi = ${viestipohjaKategoria.nimi},
                muokkaaja = $muokkaaja
              WHERE id = ${viestipohjaKategoriaId.toString}::uuid
              RETURNING
                id,
                nimi,
                luotu,
                luoja,
                muokattu,
                muokkaaja""".as[ViestipohjaKategoria].headOption,
        "paivita_viestipohja_kategoria"
      )
    } catch {
      case e: Exception =>
        LOG.error(s"Viestipohja kategorian tallentaminen epäonnistui: $e")
        throw new RuntimeException(
          s"Viestipohja kategorian tallentaminen epäonnistui: ${e.getMessage}",
          e
        )
    }
  }

  def haeViestipohjaLista(): Seq[ViestipohjaListItem] = {
    try {
      db.run(
        sql"""
                  SELECT
                    id,
                    kategoria_id,
                    nimi
                  FROM viestipohja
                  ORDER BY luotu ASC
                   """.as[ViestipohjaListItem],
        "hae_viestipohjalista"
      )
    } catch {
      case e: Exception =>
        LOG.error(s"Viestipohjien haku epäonnistui: $e")
        throw new RuntimeException(
          s"Viestipohjien haku epäonnistui: ${e.getMessage}",
          e
        )
    }
  }

  def haeViestipohja(viestipohjaId: UUID): Option[Viestipohja] = {
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
                    FROM viestipohja
                    WHERE
                     id = ${viestipohjaId.toString}::uuid
                     """.as[Viestipohja].headOption,
        "hae_viestipohjat"
      )
    } catch {
      case e: Exception =>
        LOG.error(s"Viestipohjan ${viestipohjaId.toString} haku epäonnistui: $e")
        throw new RuntimeException(
          s"Viestipohjien haku epäonnistui: ${e.getMessage}",
          e
        )
    }
  }

  def lisaaViestipohja(viestipohja: Viestipohja, luoja: String): Viestipohja = {
    try {
      val sisaltoJson: String = kielistettyToJson(viestipohja.sisalto)

      db.run(
        sql"""INSERT INTO viestipohja (
                kategoria_id,
                nimi,
                sisalto,
                luoja
              )
              VALUES (
                ${viestipohja.kategoriaId.toString}::uuid,
                ${viestipohja.nimi},
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
                muokkaaja""".as[Viestipohja].head,
        "lisaa_viestipohja"
      )
    } catch {
      case e: Exception =>
        LOG.error(s"Viestipohjan tallentaminen epäonnistui: $e")
        throw new RuntimeException(
          s"Viestipohjan tallentaminen epäonnistui: ${e.getMessage}",
          e
        )
    }
  }

  def paivitaViestipohja(viestipohjaId: UUID, viestipohja: Viestipohja, muokkaaja: String): Option[Viestipohja] = {
    try {
      val sisaltoJson: String = kielistettyToJson(viestipohja.sisalto)

      db.run(
        sql"""UPDATE viestipohja
              SET
                kategoria_id = ${viestipohja.kategoriaId.toString}::uuid,
                nimi = ${viestipohja.nimi},
                sisalto = $sisaltoJson::jsonb,
                muokkaaja = $muokkaaja
              WHERE id = ${viestipohjaId.toString}::uuid
              RETURNING
                id,
                kategoria_id,
                nimi,
                sisalto,
                luotu,
                luoja,
                muokattu,
                muokkaaja""".as[Viestipohja].headOption,
        "paivita_viestipohja"
      )
    } catch {
      case e: Exception =>
        LOG.error(s"Viestipohjan $viestipohjaId päivittäminen epäonnistui: $e")
        throw new RuntimeException(
          s"Viestipohjan päivittäminen epäonnistui: ${e.getMessage}",
          e
        )
    }
  }

  def poistaViestipohja(viestipohjaId: UUID): Int = {
    try {
      db.run(
        sqlu"""DELETE FROM viestipohja WHERE id = ${viestipohjaId.toString}::uuid""",
        "poista_viestipohja"
      )
    } catch {
      case e: Exception =>
        LOG.error(s"Viestipohjan ${viestipohjaId.toString} poistaminen epäonnistui: $e")
        throw new RuntimeException(
          s"Viestipohjan poistaminen epäonnistui: ${e.getMessage}",
          e
        )
    }
  }
}
