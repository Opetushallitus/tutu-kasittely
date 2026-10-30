package fi.oph.tutu.backend.repository

import fi.oph.tutu.backend.domain.{HakemusOid, PersonOid, TilastoCsvItem, TutkintoTaso}
import fi.oph.tutu.backend.utils.Utility
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.{Component, Repository}
import slick.jdbc.{GetResult, SQLActionBuilder}
import slick.jdbc.PostgresProfile.api.*

import java.sql.Timestamp
import java.util.UUID

@Component
@Repository
class TilastoCsvRepository {
  @Autowired
  val db: TutuDatabase = null

  val LOG: Logger = LoggerFactory.getLogger(classOf[TilastoCsvRepository])

  implicit val getTilastoCsvItemResult: GetResult[TilastoCsvItem] =
    GetResult(r =>
      TilastoCsvItem(
        hakemusId = UUID.fromString(r.nextString()),
        hakemusOid = HakemusOid(r.nextString()),
        hakijaOid = PersonOid(r.nextString()),
        hyvaksymisPvm = r.nextTimestamp().toLocalDateTime,
        henkilotunnus = None, // Ei löydy kannasta
        suoritusMaaKoodiUri = r.nextStringOption(),
        suoritusPvm = r.nextStringOption(),
        koulutusAlaKoodiUri = r.nextStringOption(),
        tutkintoTaso = TutkintoTaso.optionFromString(r.nextString())
      )
    )
  def haeTilastoData(alkuPvm: Option[String], loppuPvm: Option[String]): Seq[TilastoCsvItem] = {
    val base = sql"""
        SELECT p.hakemus_id, h.hakemus_oid, h.hakija_oid, p.hyvaksymispaiva, t.maakoodiuri, t.todistuksen_paivamaara,
          t.koulutusala_koodiuri, pt.tutkintotaso
        FROM paatos p
        INNER JOIN paatostieto pt ON p.id = pt.paatos_id
        INNER JOIN hakemus h ON h.id = p.hakemus_id
        INNER JOIN tutkinto t ON t.hakemus_id = p.hakemus_id and t.jarjestys = '1'
        WHERE p.hyvaksymispaiva IS NOT NULL
      """
    val query = base.concat(aikavaliSql(alkuPvm, loppuPvm)).as[TilastoCsvItem]

    try {
      db.run(query, "hae_tilastokeskus_data")
    } catch {
      case e: Exception =>
        LOG.error(s"Tilastokeskus CSV datan haku epäonnistui: $e")
        throw new RuntimeException(
          s"Tilastokeskus CSV datan haku epäonnistui: ${e.getMessage}",
          e
        )
    }
  }

  private def aikavaliSql(alkuPvm: Option[String], loppuPvm: Option[String]): SQLActionBuilder = {
    val alku  = alkuPvm.map(Utility.toLocalDateTime).map(Timestamp.valueOf)
    val loppu = loppuPvm.map(Utility.toLocalDateTime).map(Timestamp.valueOf)
    (alku, loppu) match {
      case (Some(a), Some(l)) => sql"AND p.hyvaksymispaiva BETWEEN $a AND $l"
      case (Some(a), None)    => sql"AND p.hyvaksymispaiva >= $a"
      case (None, Some(l))    => sql"AND p.hyvaksymispaiva <= $l"
      case (None, None)       => sql""
    }
  }
}
