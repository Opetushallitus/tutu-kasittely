package fi.oph.tutu.backend.repository

import fi.oph.tutu.backend.domain.{Tekstipohja, TekstipohjaKategoria, TekstipohjaListItem}
import org.springframework.beans.factory.annotation.Autowired
import slick.jdbc.GetResult

import java.util.UUID

class TekstipohjaResultHandlers extends BaseResultHandlers {
  @Autowired
  val db: TutuDatabase = null

  implicit val getTekstipohjaResult: GetResult[Tekstipohja] =
    GetResult(r =>
      Tekstipohja(
        id = Some(r.nextObject().asInstanceOf[UUID]),
        kategoriaId = r.nextObjectOption().map(_.asInstanceOf[UUID]),
        nimi = r.nextString(),
        sisalto = parseKielistetty(r.nextString()),
        luotu = Some(r.nextTimestamp().toLocalDateTime),
        luoja = Some(r.nextString()),
        muokattu = r.nextTimestampOption().map(_.toLocalDateTime),
        muokkaaja = r.nextStringOption()
      )
    )

  implicit val getTekstipohjaListItemResult: GetResult[TekstipohjaListItem] =
    GetResult(r =>
      TekstipohjaListItem(
        id = Some(r.nextObject().asInstanceOf[UUID]),
        kategoriaId = r.nextObjectOption().map(_.asInstanceOf[UUID]),
        nimi = r.nextString()
      )
    )

  implicit val getTekstipohjaKategoriaResult: GetResult[TekstipohjaKategoria] =
    GetResult(r =>
      TekstipohjaKategoria(
        id = Some(r.nextObject().asInstanceOf[UUID]),
        nimi = r.nextString(),
        luotu = Some(r.nextTimestamp().toLocalDateTime),
        luoja = Some(r.nextString()),
        muokattu = r.nextTimestampOption().map(_.toLocalDateTime),
        muokkaaja = r.nextStringOption()
      )
    )
}
