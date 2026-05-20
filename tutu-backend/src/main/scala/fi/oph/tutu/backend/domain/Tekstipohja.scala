package fi.oph.tutu.backend.domain

import java.time.LocalDateTime
import java.util.UUID

case class Tekstipohja(
  id: Option[UUID],
  nimi: String,
  kategoriaId: Option[UUID],
  sisalto: Kielistetty,
  luotu: Option[LocalDateTime],
  luoja: Option[String],
  muokattu: Option[LocalDateTime],
  muokkaaja: Option[String]
)

case class TekstipohjaListItem(
  id: Option[UUID],
  nimi: String,
  kategoriaId: Option[UUID]
)

case class TekstipohjaKategoria(
  id: Option[UUID],
  nimi: String,
  luotu: Option[LocalDateTime],
  luoja: Option[String],
  muokattu: Option[LocalDateTime],
  muokkaaja: Option[String]
)

case class TekstipohjaItem(
  id: UUID,
  nimi: String
)

case class KategorianTekstipohjat(
  kategoriaNimi: String,
  pohjat: Seq[TekstipohjaItem]
)
