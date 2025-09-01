package fi.oph.tutu.backend.repository

import fi.oph.tutu.backend.domain.*
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.{Component, Repository}
import slick.jdbc.GetResult
import slick.jdbc.PostgresProfile.api.*

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

  implicit val getPerusteluUoRoResult: GetResult[PerusteluUoRo] = {
    GetResult(r =>
      PerusteluUoRo(
        id = UUID.fromString(r.nextString()),
        perusteluId = UUID.fromString(r.nextString()),
        koulutuksenSisalto = Option(r.nextString()),
        opettajatEroMonialaisetOpinnotSisalto = r.nextBoolean(),
        opettajatEroMonialaisetOpinnotLaajuus = r.nextBoolean(),
        opettajatEroPedagogisetOpinnotSisalto = r.nextBoolean(),
        opettajatEroPedagogisetOpinnotLaajuus = r.nextBoolean(),
        opettajatEroKasvatustieteellisetOpinnotSisalto = r.nextBoolean(),
        opettajatEroKasvatustieteellisetOpinnotVaativuus = r.nextBoolean(),
        opettajatEroKasvatustieteellisetOpinnotLaajuus = r.nextBoolean(),
        opettajatEroOpetettavatAineetOpinnotSisalto = r.nextBoolean(),
        opettajatEroOpetettavatAineetOpinnotVaativuus = r.nextBoolean(),
        opettajatEroOpetettavatAineetOpinnotLaajuus = r.nextBoolean(),
        opettajatEroErityisopettajanOpinnotSisalto = r.nextBoolean(),
        opettajatEroErityisopettajanOpinnotLaajuus = r.nextBoolean(),
        opettajatMuuEro = r.nextBoolean(),
        opettajatMuuEroSelite = Option(r.nextString()),
        vkOpettajatEroKasvatustieteellisetOpinnotSisalto = r.nextBoolean(),
        vkOpettajatEroKasvatustieteellisetOpinnotLaajuus = r.nextBoolean(),
        vkOpettajatEroVarhaiskasvatusEsiopetusOpinnotSisalto = r.nextBoolean(),
        vkOpettajatEroVarhaiskasvatusEsiopetusOpinnotLaajuus = r.nextBoolean(),
        vkOpettajatMuuEro = r.nextBoolean(),
        vkOpettajatMuuEroSelite = Option(r.nextString()),
        otmEroOpinnotSisalto = r.nextBoolean(),
        otmEroOpinnotVaativuus = r.nextBoolean(),
        otmEroOpinnotLaajuus = r.nextBoolean(),
        otmMuuEro = r.nextBoolean(),
        otmMuuEroSelite = Option(r.nextString()),
        sovellettuOpettajanPedagogisetOpinnot = r.nextBoolean(),
        sovellettuOpetettavanAineenOpinnot = r.nextBoolean(),
        sovellettuMonialaisetOpinnot = r.nextBoolean(),
        sovellettuErityisopetus = r.nextBoolean(),
        sovellettuVarhaiskasvatus = r.nextBoolean(),
        sovellettuRinnastaminenKasvatustieteelliseenTutkintoon = r.nextBoolean(),
        sovellettuRiittavatOpinnot = r.nextBoolean(),
        sovellettuRinnastaminenOtmTutkintoon = r.nextBoolean(),
        sovellettuLuokanopettaja = r.nextBoolean(),
        sovellettuMuuTilanne = r.nextBoolean(),
        sovellettuMuuTilanneSelite = r.nextBoolean(),
        tarkempiaSelvityksia = Option(r.nextString()),
        luotu = r.nextTimestamp().toLocalDateTime,
        luoja = r.nextString(),
        muokattu = Option(r.nextTimestamp()).map(_.toLocalDateTime),
        muokkaaja = Option(r.nextString())
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
  ): UUID = {
    try {
      db.run(
        sql"""
            INSERT INTO perustelu_uo_ro (
              perustelu_id,
              koulutuksen_sisalto,
              opettajat_ero_monialaiset_opinnot_sisalto,
              opettajat_ero_monialaiset_opinnot_laajuus,
              opettajat_ero_pedagogiset_opinnot_sisalto,
              opettajat_ero_pedagogiset_opinnot_laajuus,
              opettajat_ero_kasvatustieteelliset_opinnot_sisalto,
              opettajat_ero_kasvatustieteelliset_opinnot_vaativuus,
              opettajat_ero_kasvatustieteelliset_opinnot_laajuus,
              opettajat_ero_opetettavat_aineet_opinnot_sisalto,
              opettajat_ero_opetettavat_aineet_opinnot_vaativuus,
              opettajat_ero_opetettavat_aineet_opinnot_laajuus,
              opettajat_ero_erityisopettajan_opinnot_sisalto,
              opettajat_ero_erityisopettajan_opinnot_laajuus,
              opettajat_muu_ero,
              opettajat_muu_ero_selite,
              vk_opettajat_ero_kasvatustieteelliset_opinnot_sisalto,
              vk_opettajat_ero_kasvatustieteelliset_opinnot_laajuus,
              vk_opettajat_ero_varhaiskasvatus_esiopetus_opinnot_sisalto,
              vk_opettajat_ero_varhaiskasvatus_esiopetus_opinnot_laajuus,
              vk_opettajat_muu_ero,
              vk_opettajat_muu_ero_selite,
              otm_ero_opinnot_sisalto,
              otm_ero_opinnot_vaativuus,
              otm_ero_opinnot_laajuus,
              otm_muu_ero,
              otm_muu_ero_selite,
              sovellettu_opettajan_pedagogiset_opinnot,
              sovellettu_opetettavan_aineen_opinnot,
              sovellettu_monialaiset_opinnot,
              sovellettu_erityisopetus,
              sovellettu_varhaiskasvatus,
              sovellettu_rinnastaminen_kasvatustieteelliseen_tutkintoon,
              sovellettu_riittavat_opinnot,
              sovellettu_rinnastaminen_otm_tutkintoon,
              sovellettu_luokanopettaja,
              sovellettu_muu_tilanne,
              sovellettu_muu_tilanne_selite,
              tarkempia_selvityksia,
              luoja
            )
            VALUES (
              ${perusteluId.toString}::uuid,
              ${perusteluUoRo.koulutuksenSisalto},
              ${perusteluUoRo.opettajatEroMonialaisetOpinnotSisalto},
              ${perusteluUoRo.opettajatEroMonialaisetOpinnotLaajuus},
              ${perusteluUoRo.opettajatEroPedagogisetOpinnotSisalto},
              ${perusteluUoRo.opettajatEroPedagogisetOpinnotLaajuus},
              ${perusteluUoRo.opettajatEroKasvatustieteellisetOpinnotSisalto},
              ${perusteluUoRo.opettajatEroKasvatustieteellisetOpinnotVaativuus},
              ${perusteluUoRo.opettajatEroKasvatustieteellisetOpinnotLaajuus},
              ${perusteluUoRo.opettajatEroOpetettavatAineetOpinnotSisalto},
              ${perusteluUoRo.opettajatEroOpetettavatAineetOpinnotVaativuus},
              ${perusteluUoRo.opettajatEroOpetettavatAineetOpinnotLaajuus},
              ${perusteluUoRo.opettajatEroErityisopettajanOpinnotSisalto},
              ${perusteluUoRo.opettajatEroErityisopettajanOpinnotLaajuus},
              ${perusteluUoRo.opettajatMuuEro},
              ${perusteluUoRo.opettajatMuuEroSelite},
              ${perusteluUoRo.vkOpettajatEroKasvatustieteellisetOpinnotSisalto},
              ${perusteluUoRo.vkOpettajatEroKasvatustieteellisetOpinnotLaajuus},
              ${perusteluUoRo.vkOpettajatEroVarhaiskasvatusEsiopetusOpinnotSisalto},
              ${perusteluUoRo.vkOpettajatEroVarhaiskasvatusEsiopetusOpinnotLaajuus},
              ${perusteluUoRo.vkOpettajatMuuEro},
              ${perusteluUoRo.vkOpettajatMuuEroSelite},
              ${perusteluUoRo.otmEroOpinnotSisalto},
              ${perusteluUoRo.otmEroOpinnotVaativuus},
              ${perusteluUoRo.otmEroOpinnotLaajuus},
              ${perusteluUoRo.otmMuuEro},
              ${perusteluUoRo.otmMuuEroSelite},
              ${perusteluUoRo.sovellettuOpettajanPedagogisetOpinnot},
              ${perusteluUoRo.sovellettuOpetettavanAineenOpinnot},
              ${perusteluUoRo.sovellettuMonialaisetOpinnot},
              ${perusteluUoRo.sovellettuErityisopetus},
              ${perusteluUoRo.sovellettuVarhaiskasvatus},
              ${perusteluUoRo.sovellettuRinnastaminenKasvatustieteelliseenTutkintoon},
              ${perusteluUoRo.sovellettuRiittavatOpinnot},
              ${perusteluUoRo.sovellettuRinnastaminenOtmTutkintoon},
              ${perusteluUoRo.sovellettuLuokanopettaja},
              ${perusteluUoRo.sovellettuMuuTilanne},
              ${perusteluUoRo.sovellettuMuuTilanneSelite},
              ${perusteluUoRo.tarkempiaSelvityksia},
              $luoja
            )
            ON CONFLICT (perustelu_id)
            DO UPDATE SET
              koulutuksen_sisalto = ${perusteluUoRo.koulutuksenSisalto},
              opettajat_ero_monialaiset_opinnot_sisalto = ${perusteluUoRo.opettajatEroMonialaisetOpinnotSisalto},
              opettajat_ero_monialaiset_opinnot_laajuus = ${perusteluUoRo.opettajatEroMonialaisetOpinnotLaajuus},
              opettajat_ero_pedagogiset_opinnot_sisalto = ${perusteluUoRo.opettajatEroPedagogisetOpinnotSisalto},
              opettajat_ero_pedagogiset_opinnot_laajuus = ${perusteluUoRo.opettajatEroPedagogisetOpinnotLaajuus},
              opettajat_ero_kasvatustieteelliset_opinnot_sisalto = ${perusteluUoRo.opettajatEroKasvatustieteellisetOpinnotSisalto},
              opettajat_ero_kasvatustieteelliset_opinnot_vaativuus = ${perusteluUoRo.opettajatEroKasvatustieteellisetOpinnotVaativuus},
              opettajat_ero_kasvatustieteelliset_opinnot_laajuus = ${perusteluUoRo.opettajatEroKasvatustieteellisetOpinnotLaajuus},
              opettajat_ero_opetettavat_aineet_opinnot_sisalto = ${perusteluUoRo.opettajatEroOpetettavatAineetOpinnotSisalto},
              opettajat_ero_opetettavat_aineet_opinnot_vaativuus = ${perusteluUoRo.opettajatEroOpetettavatAineetOpinnotVaativuus},
              opettajat_ero_opetettavat_aineet_opinnot_laajuus = ${perusteluUoRo.opettajatEroOpetettavatAineetOpinnotLaajuus},
              opettajat_ero_erityisopettajan_opinnot_sisalto = ${perusteluUoRo.opettajatEroErityisopettajanOpinnotSisalto},
              opettajat_ero_erityisopettajan_opinnot_laajuus = ${perusteluUoRo.opettajatEroErityisopettajanOpinnotLaajuus},
              opettajat_muu_ero = ${perusteluUoRo.opettajatMuuEro},
              opettajat_muu_ero_selite = ${perusteluUoRo.opettajatMuuEroSelite},
              vk_opettajat_ero_kasvatustieteelliset_opinnot_sisalto = ${perusteluUoRo.vkOpettajatEroKasvatustieteellisetOpinnotSisalto},
              vk_opettajat_ero_kasvatustieteelliset_opinnot_laajuus = ${perusteluUoRo.vkOpettajatEroKasvatustieteellisetOpinnotLaajuus},
              vk_opettajat_ero_varhaiskasvatus_esiopetus_opinnot_sisalto = ${perusteluUoRo.vkOpettajatEroVarhaiskasvatusEsiopetusOpinnotSisalto},
              vk_opettajat_ero_varhaiskasvatus_esiopetus_opinnot_laajuus = ${perusteluUoRo.vkOpettajatEroVarhaiskasvatusEsiopetusOpinnotLaajuus},
              vk_opettajat_muu_ero = ${perusteluUoRo.vkOpettajatMuuEro},
              vk_opettajat_muu_ero_selite = ${perusteluUoRo.vkOpettajatMuuEroSelite},
              otm_ero_opinnot_sisalto = ${perusteluUoRo.otmEroOpinnotSisalto},
              otm_ero_opinnot_vaativuus = ${perusteluUoRo.otmEroOpinnotVaativuus},
              otm_ero_opinnot_laajuus = ${perusteluUoRo.otmEroOpinnotLaajuus},
              otm_muu_ero = ${perusteluUoRo.otmMuuEro},
              otm_muu_ero_selite = ${perusteluUoRo.otmMuuEroSelite},
              sovellettu_opettajan_pedagogiset_opinnot = ${perusteluUoRo.sovellettuOpettajanPedagogisetOpinnot},
              sovellettu_opetettavan_aineen_opinnot = ${perusteluUoRo.sovellettuOpetettavanAineenOpinnot},
              sovellettu_monialaiset_opinnot = ${perusteluUoRo.sovellettuMonialaisetOpinnot},
              sovellettu_erityisopetus = ${perusteluUoRo.sovellettuErityisopetus},
              sovellettu_varhaiskasvatus = ${perusteluUoRo.sovellettuVarhaiskasvatus},
              sovellettu_rinnastaminen_kasvatustieteelliseen_tutkintoon = ${perusteluUoRo.sovellettuRinnastaminenKasvatustieteelliseenTutkintoon},
              sovellettu_riittavat_opinnot = ${perusteluUoRo.sovellettuRiittavatOpinnot},
              sovellettu_rinnastaminen_otm_tutkintoon = ${perusteluUoRo.sovellettuRinnastaminenOtmTutkintoon},
              sovellettu_luokanopettaja = ${perusteluUoRo.sovellettuLuokanopettaja},
              sovellettu_muu_tilanne = ${perusteluUoRo.sovellettuMuuTilanne},
              sovellettu_muu_tilanne_selite = ${perusteluUoRo.sovellettuMuuTilanneSelite},
              tarkempia_selvityksia = ${perusteluUoRo.tarkempiaSelvityksia},
              muokkaaja = $luoja
            RETURNING id
          """.as[UUID].head,
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
