package fi.oph.tutu.backend.repository

import fi.oph.tutu.backend.domain.*
import org.json4s.{DefaultFormats, Formats}
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.{Component, Repository}
import slick.dbio.DBIO
import slick.jdbc.GetResult
import slick.jdbc.PostgresProfile.api.*

implicit val jsonFormats: Formats = DefaultFormats

import java.util.UUID
import scala.concurrent.duration.DurationInt
import scala.util.{Failure, Success}

@Component
@Repository
class PerusteluRepository extends BaseResultHandlers {
  @Autowired
  val db: TutuDatabase = null

  final val DB_TIMEOUT = 30.seconds
  val LOG: Logger      = LoggerFactory.getLogger(classOf[PerusteluRepository])

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
        ylimmanTutkinnonAsemaLahtomaanJarjestelmassa = r.nextStringOption(),
        selvitysTutkinnonAsemastaLahtomaanJarjestelmassa = r.nextString(),
        aikaisemmatPaatokset = r.nextBooleanOption(),
        jatkoOpintoKelpoisuus = r.nextStringOption(),
        jatkoOpintoKelpoisuusLisatieto = r.nextStringOption(),
        muuPerustelu = r.nextStringOption(),
        uoRoSisalto = Option(org.json4s.jackson.Serialization.read[UoRoSisalto](r.nextString())),
        lausuntoPyyntojenLisatiedot = r.nextStringOption(),
        lausunnonSisalto = r.nextStringOption(),
        luotu = Option(r.nextTimestamp().toLocalDateTime),
        luoja = r.nextStringOption(),
        muokattu = Option(r.nextTimestamp()).map(_.toLocalDateTime),
        muokkaaja = r.nextStringOption()
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
   * Tallentaa uuden perustelun (palauttaa DBIO-actionin transaktioita varten)
   *
   * @param hakemusId
   *   hakemuksen uuid
   * @param perustelu
   * @param luoja
   * @return
   *   DBIO action joka palauttaa tallennetun perustelun
   */
  def tallennaPerusteluAction(
    hakemusId: UUID,
    perustelu: Perustelu,
    luoja: String
  ): DBIO[Perustelu] = {
    val uoRoJson: String = org.json4s.jackson.Serialization.write(perustelu.uoRoSisalto.orNull)
    sql"""
      INSERT INTO perustelu (
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
        muu_perustelu,
        uo_ro_sisalto,
        lausunto_pyynto_lisatiedot,
        lausunto_sisalto,
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
        ${perustelu.muuPerustelu},
        $uoRoJson::jsonb,
        ${perustelu.lausuntoPyyntojenLisatiedot},
        ${perustelu.lausunnonSisalto},
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
        muu_perustelu = ${perustelu.muuPerustelu},
        uo_ro_sisalto = $uoRoJson::jsonb,
        lausunto_pyynto_lisatiedot = ${perustelu.lausuntoPyyntojenLisatiedot},
        lausunto_sisalto = ${perustelu.lausunnonSisalto},
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
        muu_perustelu,
        uo_ro_sisalto,
        lausunto_pyynto_lisatiedot,
        lausunto_sisalto,
        luotu,
        luoja,
        muokattu,
        muokkaaja
    """.as[Perustelu].head
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
        tallennaPerusteluAction(hakemusId, perustelu, luoja),
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
              p.muu_perustelu,
              p.uo_ro_sisalto,
              p.lausunto_pyynto_lisatiedot,
              p.lausunto_sisalto,
              p.luotu,
              p.luoja,
              p.muokattu,
              p.muokkaaja
            FROM
              perustelu p
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
   * Palauttaa lausuntotietoon liittyvät lausuntopyynnöt
   *
   * @param perusteluId
   * vastaavan lausuntotiedon uuid
   * @return
   * lausuntopyynnot
   */
  def haeLausuntopyynnot(perusteluId: UUID): Seq[Lausuntopyynto] = {
    try {
      db.run(
        sql"""
            SELECT
              lp.id,
              lp.perustelu_id,
              lp.lausunnon_antaja,
              lp.lahetetty,
              lp.saapunut
            FROM
              lausuntopyynto lp
            WHERE
              lp.perustelu_id =  ${perusteluId.toString}::uuid
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
   * Tallentaa uudet/muuttuneet tai modifioidun lausuntotiedon ja siihen liittyvät lausuntopyynnöt
   *
   * @param perusteluId
   * vastaavan lausuntotiedon uuid
   * @param modifyData
   * lausuntopyyntöjen muokkaustiedot
   * @param luojaTaiMuokkaaja
   * pyynnön luoja tai muokkaaja
   */
  def suoritaLausuntopyyntojenModifiointi(
    perusteluId: UUID,
    modifyData: LausuntopyyntoModifyData,
    luojaTaiMuokkaaja: String
  ): Unit = {
    val actions = modifyData.uudet.map(lp => lisaaLausuntopyynto(perusteluId, lp, luojaTaiMuokkaaja)) ++
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
    perusteluId: UUID,
    lausuntopyynto: Lausuntopyynto,
    luoja: String
  ): DBIO[Int] =
    sqlu"""
      INSERT INTO lausuntopyynto (perustelu_id, lausunnon_antaja, lahetetty, saapunut, luoja)
      VALUES (
        ${perusteluId.toString}::uuid,
        ${lausuntopyynto.lausunnonAntaja.orNull},
        ${lausuntopyynto.lahetetty.map(java.sql.Timestamp.valueOf).orNull},
        ${lausuntopyynto.saapunut.map(java.sql.Timestamp.valueOf).orNull},
        $luoja
      )"""

  private def paivitaLausuntoPyynto(
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

  private def poistaLausuntopyynto(id: UUID): DBIO[Int] =
    sqlu"""
      DELETE FROM lausuntopyynto
      WHERE id = ${id.toString}::uuid
    """
}
