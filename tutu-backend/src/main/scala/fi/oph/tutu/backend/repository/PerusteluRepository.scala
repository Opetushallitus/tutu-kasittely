package fi.oph.tutu.backend.repository

import fi.oph.tutu.backend.domain.*
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.{Component, Repository}
import slick.dbio.DBIO
import slick.jdbc.GetResult
import slick.jdbc.PostgresProfile.api.*

import java.util.UUID
import scala.concurrent.duration.DurationInt
import scala.util.{Failure, Success}

@Component
@Repository
class PerusteluRepository {
  @Autowired
  val db: TutuDatabase = null

  final val DB_TIMEOUT = 30.seconds
  val LOG: Logger      = LoggerFactory.getLogger(classOf[PerusteluRepository])

  implicit val getUUIDResult: GetResult[UUID] =
    GetResult(r => UUID.fromString(r.nextString()))

  implicit val getPerusteluResult: GetResult[Perustelu] = {
    GetResult(r =>
      Perustelu(
        UUID.fromString(r.nextString()),
        UUID.fromString(r.nextString()),
        Option(r.nextBoolean()),
        Option(r.nextBoolean()),
        r.nextBoolean(),
        r.nextBoolean(),
        r.nextBoolean(),
        r.nextString(),
        Option(r.nextString()),
        r.nextString(),
        r.nextTimestamp().toLocalDateTime,
        r.nextString(),
        Option(r.nextTimestamp()).map(_.toLocalDateTime),
        r.nextString()
      )
    )
  }

  /**
   * Tallentaa uuden perustelun
   *
   * @param hakemusId
   *   hakemuksen uuid
   * @param perustelu
   * @param luoja
   * @return
   *   tallennetun perustelun id
   */
  def tallennaPerustelu(
    hakemusId: UUID,
    perustelu: Perustelu,
    luoja: String
  ): UUID = {
    try {
      db.run(
        sql"""
          INSERT INTO perustelu_yleiset (
            hakemus_id,
            virallinen_tutkinnon_myontaja,
            virallinen_tutkinto,
            lahde_lahtomaan_kansallinen_lahde,
            lahde_lahtomaan_virallinen_vastaus,
            lahde_kansainvalinen_hakuteos_tai_verkkosivusto,
            selvitys_tutkinnon_myontajasta_ja_tutkinnon_virallisuudesta,
            ylimman_tutkinnon_asema_lahtomaan_jarjestelmassa,
            selvitys_tutkinnon_asemasta_lahtomaan_jarjestelmassa,
            luoja
          )
          VALUES (
            ${hakemusId.toString}::uuid,
            ${perustelu.virallinenTutkinnonMyontaja},
            ${perustelu.virallinenTutkinto},
            ${perustelu.lahdeLahtomaanKansallinenLahde},
            ${perustelu.lahdeLahtomaanVirallinenVastaus},
            ${perustelu.lahdeKansainvalinenHakuteosTaiVerkkosivusto},
            ${perustelu.selvitysTutkinnonMyontajastaJaTutkinnonVirallisuudesta},
            ${perustelu.ylimmanTutkinnonAsemaLahtomaanJarjestelmassa}::tutkinnon_asema,
            ${perustelu.selvitysTutkinnonAsemastaLahtomaanJarjestelmassa},
            $luoja
          )
          ON CONFLICT (hakemus_id)
          DO UPDATE SET
            virallinen_tutkinnon_myontaja = ${perustelu.virallinenTutkinnonMyontaja},
            virallinen_tutkinto = ${perustelu.virallinenTutkinto},
            lahde_lahtomaan_kansallinen_lahde = ${perustelu.lahdeLahtomaanKansallinenLahde},
            lahde_lahtomaan_virallinen_vastaus = ${perustelu.lahdeLahtomaanVirallinenVastaus},
            lahde_kansainvalinen_hakuteos_tai_verkkosivusto = ${perustelu.lahdeKansainvalinenHakuteosTaiVerkkosivusto},
            selvitys_tutkinnon_myontajasta_ja_tutkinnon_virallisuudesta = ${perustelu.selvitysTutkinnonMyontajastaJaTutkinnonVirallisuudesta},
            ylimman_tutkinnon_asema_lahtomaan_jarjestelmassa = ${perustelu.ylimmanTutkinnonAsemaLahtomaanJarjestelmassa}::tutkinnon_asema,
            selvitys_tutkinnon_asemasta_lahtomaan_jarjestelmassa = ${perustelu.selvitysTutkinnonAsemastaLahtomaanJarjestelmassa},
            muokkaaja = $luoja
          RETURNING id
        """.as[UUID].head,
        "tallenna_perustelu"
      )
    } catch {
      case e: Exception =>
        LOG.error(s"Perustelun tallennus epäonnistui: ${e}")
        throw new RuntimeException(
          s"Perustelun tallennus epäonnistui: ${e.getMessage}",
          e
        )
    }
  }

  /**
   * Palauttaa yksittäisen perustelun
   *
   * @param hakemusId
   *   hakemuksen uuid
   * @param hakemuksenOsa
   * @param sisainen
   * @return
   *   perustelu
   */
  def haePerustelu(
    hakemusId: UUID
  ): Option[Perustelu] = {
    try {
      db.run(
        sql"""
            SELECT
              p.id,
              p.hakemus_id,
              p.virallinen_tutkinnon_myontaja,
              p.virallinen_tutkinto,
              p.lahde_lahtomaan_kansallinen_lahde,
              p.lahde_lahtomaan_virallinen_vastaus,
              p.lahde_kansainvalinen_hakuteos_tai_verkkosivusto,
              p.selvitys_tutkinnon_myontajasta_ja_tutkinnon_virallisuudesta,
              p.ylimman_tutkinnon_asema_lahtomaan_jarjestelmassa,
              p.selvitys_tutkinnon_asemasta_lahtomaan_jarjestelmassa,
              p.luotu,
              p.luoja,
              p.muokattu,
              p.muokkaaja
            FROM
              perustelu_yleiset p
            WHERE
              p.hakemus_id =  ${hakemusId.toString}::uuid
          """.as[Perustelu].headOption,
        "hae_perustelu"
      )
    } catch {
      case e: Exception =>
        throw new RuntimeException(
          s"Perustelun haku epäonnistui: ${e.getMessage}",
          e
        )
    }
  }

}
