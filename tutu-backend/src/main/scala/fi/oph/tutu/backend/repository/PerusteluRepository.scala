package fi.oph.tutu.backend.repository

import fi.oph.tutu.backend.domain.*
import org.json4s.{DefaultFormats, Formats}
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.{Component, Repository}
import slick.jdbc.GetResult
import slick.jdbc.PostgresProfile.api.*

implicit val jsonFormats: Formats = DefaultFormats

import java.util.UUID
import scala.concurrent.duration.DurationInt

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
        Option(r.nextString())
      )
    )
  }

  implicit val getPerusteluUoRoResult: GetResult[PerusteluUoRo] = GetResult { r =>
    PerusteluUoRo(
      id = UUID.fromString(r.nextString()),
      perusteluId = UUID.fromString(r.nextString()),
      perustelunSisalto = org.json4s.jackson.Serialization.read[PerusteluUoRoSisalto](r.nextString()),
      luotu = r.nextTimestamp().toLocalDateTime,
      luoja = r.nextString(),
      muokattu = Option(r.nextTimestamp()).map(_.toLocalDateTime),
      muokkaaja = Option(r.nextString())
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
        LOG.error(s"Perustelun haku epäonnistui (hakemusId: ${hakemusId}): ${e}")
        throw new RuntimeException(
          s"Perustelun haku epäonnistui (hakemusId: ${hakemusId}): ${e.getMessage}",
          e
        )
    }
  }

  /**
   * Tallentaa uuden UO/RO-perustelun
   *
   * @param perusteluId
   * Perustelun uuid
   * @param perusteluUoRo
   * UO/RO-perustelun
   * @param luoja
   * perustelun luoja
   * @return
   * tallennetun perustelun id
   */
  def tallennaPerusteluUoRo(
    perusteluId: UUID,
    perusteluUoRo: PerusteluUoRo,
    luoja: String
  ): PerusteluUoRo = {
    val sisaltoJson: String = org.json4s.jackson.Serialization.write(perusteluUoRo.perustelunSisalto)
    try {
      db.run(
        sql"""
            INSERT INTO perustelu_uo_ro (
              perustelu_id,
              perustelu_sisalto,
              luoja
            )
            VALUES (
              ${perusteluId.toString}::uuid,
               ${sisaltoJson}::jsonb,
              $luoja
            )
            ON CONFLICT (perustelu_id)
            DO UPDATE SET
              perustelun_sisalto = ${sisaltoJson}::jsonb,
              muokkaaja = $luoja
            RETURNING *
          """.as[PerusteluUoRo].head,
        "tallenna_perustelu_uo_ro"
      )
    } catch {
      case e: Exception =>
        LOG.error(s"UO/RO-perustelun tallennus epäonnistui: ${e}")
        throw new RuntimeException(
          s"UO/RO-perustelun tallennus epäonnistui: ${e.getMessage}",
          e
        )
    }
  }

  /**
   * Palauttaa yksittäisen UO/RO-perustelun
   *
   * @param perusteluId
   * perustelun uuid
   *
   * @return
   * perusteluUoRo
   */
  def haePerusteluUoRo(
    perusteluId: UUID
  ): Option[PerusteluUoRo] = {
    try {
      db.run(
        sql"""
              SELECT *
              FROM
                perustelu_uo_ro p
              WHERE
                p.perustelu_id =  ${perusteluId.toString}::uuid
            """.as[PerusteluUoRo].headOption,
        "hae_perustelu_uo_ro"
      )
    } catch {
      case e: Exception =>
        LOG.error(s"UO/RO-perustelun haku epäonnistui: ${e}")
        throw new RuntimeException(
          s"UO/RO-perustelun haku epäonnistui: ${e.getMessage}",
          e
        )
    }
  }
}
