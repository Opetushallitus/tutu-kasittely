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
        id = Option(UUID.fromString(r.nextString())),
        hakemusId = Option(UUID.fromString(r.nextString())),
        virallinenTutkinnonMyontaja = r.nextBooleanOption(),
        virallinenTutkinto = r.nextBooleanOption(),
        lahdeLahtomaanKansallinenLahde = r.nextBoolean(),
        lahdeLahtomaanVirallinenVastaus = r.nextBoolean(),
        lahdeKansainvalinenHakuteosTaiVerkkosivusto = r.nextBoolean(),
        selvitysTutkinnonMyontajastaJaTutkinnonVirallisuudesta = r.nextString(),
        ylimmanTutkinnonAsemaLahtomaanJarjestelmassa = Option(r.nextString()),
        selvitysTutkinnonAsemastaLahtomaanJarjestelmassa = r.nextString(),
        aikaisemmatPaatokset = r.nextBooleanOption(),
        jatkoOpintoKelpoisuus = Option(r.nextString()),
        jatkoOpintoKelpoisuusLisatieto = Option(r.nextString()),
        luotu = Option(r.nextTimestamp().toLocalDateTime),
        luoja = Option(r.nextString()),
        muokattu = Option(r.nextTimestamp()).map(_.toLocalDateTime),
        muokkaaja = Option(r.nextString())
      )
    )
  }

  implicit val getPerusteluUoRoResult: GetResult[PerusteluUoRo] = GetResult { r =>
    PerusteluUoRo(
      id = Option(UUID.fromString(r.nextString())),
      perusteluId = Option(UUID.fromString(r.nextString())),
      perustelunSisalto = org.json4s.jackson.Serialization.read[PerusteluUoRoSisalto](r.nextString()),
      luotu = Option(r.nextTimestamp()).map(_.toLocalDateTime),
      luoja = Option(r.nextString()),
      muokattu = Option(r.nextTimestamp()).map(_.toLocalDateTime),
      muokkaaja = Option(r.nextString())
    )
  }

  implicit val getLausuntotietoResult: GetResult[Lausuntotieto] = {
    GetResult(r =>
      Lausuntotieto(
        Option(UUID.fromString(r.nextString())),
        Option(UUID.fromString(r.nextString())),
        r.nextStringOption(),
        r.nextStringOption(),
        Seq.empty
      )
    )
  }

  implicit val getLausuntopyyntoResult: GetResult[Lausuntopyynto] = {
    GetResult(r =>
      Lausuntopyynto(
        Option(UUID.fromString(r.nextString())),
        Option(UUID.fromString(r.nextString())),
        r.nextStringOption(),
        Option(r.nextTimestamp()).map(_.toLocalDateTime),
        Option(r.nextTimestamp()).map(_.toLocalDateTime)
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
  ): Perustelu = {
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
            aikaisemmat_paatokset,
            jatko_opinto_kelpoisuus,
            jatko_opinto_kelpoisuus_lisatieto,
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
            ${perustelu.aikaisemmatPaatokset},
            ${perustelu.jatkoOpintoKelpoisuus}::jatko_opinto_kelpoisuus,
            ${perustelu.jatkoOpintoKelpoisuusLisatieto},
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
            aikaisemmat_paatokset = ${perustelu.aikaisemmatPaatokset},
            jatko_opinto_kelpoisuus = ${perustelu.jatkoOpintoKelpoisuus}::jatko_opinto_kelpoisuus,
            jatko_opinto_kelpoisuus_lisatieto = ${perustelu.jatkoOpintoKelpoisuusLisatieto},
            muokkaaja = $luoja
          RETURNING
            id,
            hakemus_id,
            virallinen_tutkinnon_myontaja,
            virallinen_tutkinto,
            lahde_lahtomaan_kansallinen_lahde,
            lahde_lahtomaan_virallinen_vastaus,
            lahde_kansainvalinen_hakuteos_tai_verkkosivusto,
            selvitys_tutkinnon_myontajasta_ja_tutkinnon_virallisuudesta,
            ylimman_tutkinnon_asema_lahtomaan_jarjestelmassa,
            selvitys_tutkinnon_asemasta_lahtomaan_jarjestelmassa,
            aikaisemmat_paatokset,
            jatko_opinto_kelpoisuus,
            jatko_opinto_kelpoisuus_lisatieto,
            luotu,
            luoja,
            muokattu,
            muokkaaja
        """.as[Perustelu].head,
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
              p.aikaisemmat_paatokset,
              p.jatko_opinto_kelpoisuus,
              p.jatko_opinto_kelpoisuus_lisatieto,
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
   * Tallentaa uuden tai modifioidun UO/RO-perustelun
   *
   * @param perusteluId
   * Perustelun uuid
   * @param perusteluUoRo
   * UO/RO-perustelu
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
              perustelun_sisalto,
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
        throw new RuntimeException(s"UO/RO-perustelun tallennus epäonnistui: ${e.getMessage}", e)
    }
  }

  /**
   * Palauttaa yksittäisen UO/RO-perustelun
   *
   * @param perusteluId
   * perustelun uuid
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

  /**
   * Tallentaa uuden tai modifioidun lausuntotiedon
   *
   * @param perusteluId
   * Perustelun uuid
   * @param lausuntotieto
   * Uusi tai modifioitu lausuntotieto
   * @param luojaTaiMuokkaaja
   * perustelun luoja tai muokkaaja
   * @return
   * tallennetun perustelun id
   */
  def tallennaLausuntotieto(
    perusteluId: UUID,
    lausuntotieto: Lausuntotieto,
    luojaTaiMuokkaaja: String
  ): Lausuntotieto = {
    try {
      db.run(
        sql"""
            INSERT INTO lausuntotieto (
              perustelu_id,
              pyyntojen_lisatiedot,
              sisalto,
              luoja
            )
            VALUES (
              ${perusteluId.toString}::uuid,
              ${lausuntotieto.pyyntojenLisatiedot.orNull},
              ${lausuntotieto.sisalto.orNull},
              $luojaTaiMuokkaaja
            )
            ON CONFLICT (perustelu_id)
            DO UPDATE SET
              pyyntojen_lisatiedot = ${lausuntotieto.pyyntojenLisatiedot.orNull},
              sisalto = ${lausuntotieto.sisalto.orNull},
              muokkaaja = $luojaTaiMuokkaaja
            RETURNING *
          """.as[Lausuntotieto].head,
        "tallenna_lausuntotieto"
      )
    } catch {
      case e: Exception =>
        LOG.error(s"Lausuntotiedon tallennus epäonnistui: $e")
        throw new RuntimeException(s"Lausuntotiedon tallennus epäonnistui: ${e.getMessage}", e)
    }
  }

  /**
   * Palauttaa yksittäisen lausuntotiedon
   *
   * @param perusteluId
   * vastaavan perustelutiedon uuid
   * @return
   * lausuntotieto
   */
  def haeLausuntotieto(perusteluId: UUID): Option[Lausuntotieto] = {
    try {
      db.run(
        sql"""
            SELECT
              lt.id,
              lt.perustelu_id,
              lt.pyyntojen_lisatiedot,
              lt.sisalto
            FROM
              lausuntotieto lt
            WHERE
              lt.perustelu_id =  ${perusteluId.toString}::uuid
          """.as[Lausuntotieto].headOption,
        "hae_lausuntotieto"
      )
    } catch {
      case e: Exception =>
        throw new RuntimeException(
          s"Lausuntotiedon haku epäonnistui: ${e.getMessage}",
          e
        )
    }
  }

  /**
   * Palauttaa lausuntotietoon liittyvät lausuntopyynnöt
   *
   * @param lausuntotietoId
   * vastaavan lausuntotiedon uuid
   * @return
   * lausuntopyynnot
   */
  def haeLausuntopyynnot(lausuntotietoId: UUID): Seq[Lausuntopyynto] = {
    try {
      db.run(
        sql"""
            SELECT
              lp.id,
              lp.lausuntotieto_id,
              lp.lausunnon_antaja,
              lp.lahetetty,
              lp.saapunut
            FROM
              lausuntopyynto lp
            WHERE
              lp.lausuntotieto_id =  ${lausuntotietoId.toString}::uuid
          """.as[Lausuntopyynto],
        "hae_lausuntopyynnot"
      )
    } catch {
      case e: Exception =>
        throw new RuntimeException(
          s"Lausuntopyyntöjen haku epäonnistui: ${e.getMessage}",
          e
        )
    }
  }

  /**
   * Tallentaa uudet/muuttu tai modifioidun lausuntotiedon ja siihen liittyvät lausuntopyynnöt
   *
   * @param lausuntotietoId
   * vastaavan lausuntotiedon uuid
   * @param modifyData
   * lausuntopyyntöjen muokkaustiedot
   * @param luojaTaiMuokkaaja
   * pyynnön luoja tai muokkaaja
   */
  def suoritaLausuntopyyntojenModifiointi(
    lausuntotietoId: UUID,
    modifyData: LausuntopyyntoModifyData,
    luojaTaiMuokkaaja: String
  ): Unit = {
    val actions = modifyData.uudet.map(lp => lisaaLausuntopyynto(lausuntotietoId, lp, luojaTaiMuokkaaja)) ++
      modifyData.muutetut.map(lp => paivitaLausuntoPyynto(lp, luojaTaiMuokkaaja)) ++
      modifyData.poistetut.map(poistaLausuntopyynto)
    val combined = db.combineIntDBIOs(actions)
    db.runTransactionally(combined, "suorita_lausuntopyyntojen_modifiointi") match {
      case Success(_) => ()
      case Failure(e) =>
        LOG.error(s"Virhe lausuntopyyntöjen modifioinnissa: ${e.getMessage}", e)
        throw new RuntimeException(s"Virhe lausuntopyyntöjen modifioinnissa: ${e.getMessage}", e)
    }
  }

  def lisaaLausuntopyynto(
    lausuntotietoId: UUID,
    lausuntopyynto: Lausuntopyynto,
    luoja: String
  ): DBIO[Int] =
    sqlu"""
      INSERT INTO lausuntopyynto (lausuntotieto_id, lausunnon_antaja, lahetetty, saapunut, luoja)
      VALUES (
        ${lausuntotietoId.toString}::uuid,
        ${lausuntopyynto.lausunnonAntaja.orNull},
        ${lausuntopyynto.lahetetty.map(java.sql.Timestamp.valueOf).orNull},
        ${lausuntopyynto.saapunut.map(java.sql.Timestamp.valueOf).orNull},
        $luoja
      )"""

  def paivitaLausuntoPyynto(
    lausuntopyynto: Lausuntopyynto,
    muokkaaja: String
  ): DBIO[Int] =
    sqlu"""
      UPDATE lausuntopyynto
      SET
        lausunnon_antaja = ${lausuntopyynto.lausunnonAntaja.orNull},
        lahetetty = ${lausuntopyynto.lahetetty.map(java.sql.Timestamp.valueOf).orNull},
        saapunut = ${lausuntopyynto.saapunut.map(java.sql.Timestamp.valueOf).orNull},
        muokkaaja = $muokkaaja
      WHERE id = ${lausuntopyynto.id.get.toString}::uuid
    """

  def poistaLausuntopyynto(id: UUID): DBIO[Int] =
    sqlu"""
      DELETE FROM lausuntopyynto
      WHERE id = ${id.toString}::uuid
    """
}
