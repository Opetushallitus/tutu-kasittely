package fi.oph.tutu.backend.repository

import fi.oph.tutu.backend.domain.{
  Asiakirja,
  AsiakirjamalliLahde,
  AsiakirjamalliModifyData,
  AsiakirjamalliTutkinnosta,
  DbAsiakirja,
  KasittelyVaiheTiedot,
  PyydettavaAsiakirja,
  PyydettavaAsiakirjaModifyData,
  UserOid,
  ValmistumisenVahvistusVastaus
}
import fi.oph.tutu.backend.service.HakemusModifyOperationResolver
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
class AsiakirjaRepository extends BaseResultHandlers {
  @Autowired
  val db: TutuDatabase = null

  final val DB_TIMEOUT = 30.seconds
  val LOG: Logger      = LoggerFactory.getLogger(classOf[AsiakirjaRepository])

  implicit val getAsiakirjaResult: GetResult[DbAsiakirja] =
    GetResult(r =>
      DbAsiakirja(
        id = UUID.fromString(r.nextString()),
        allekirjoituksetTarkistettu = r.nextBoolean(),
        allekirjoituksetTarkistettuLisatiedot = r.nextStringOption(),
        imiPyynto = r.nextBooleanOption(),
        imiPyyntoNumero = r.nextStringOption(),
        imiPyyntoLahetetty = Option(r.nextTimestamp()).map(_.toLocalDateTime),
        imiPyyntoVastattu = Option(r.nextTimestamp()).map(_.toLocalDateTime),
        alkuperaisetAsiakirjatSaatuNahtavaksi = r.nextBoolean(),
        alkuperaisetAsiakirjatSaatuNahtavaksiLisatiedot = r.nextStringOption(),
        selvityksetSaatu = r.nextBoolean(),
        apHakemus = r.nextBooleanOption(),
        suostumusVahvistamiselleSaatu = r.nextBoolean(),
        valmistumisenVahvistus = r.nextBoolean(),
        valmistumisenVahvistusPyyntoLahetetty = Option(r.nextTimestamp()).map(_.toLocalDateTime),
        valmistumisenVahvistusSaatu = Option(r.nextTimestamp()).map(_.toLocalDateTime),
        valmistumisenVahvistusVastaus = Option(ValmistumisenVahvistusVastaus.fromString(r.nextString())),
        valmistumisenVahvistusLisatieto = r.nextStringOption(),
        viimeinenAsiakirjaHakijalta = Option(r.nextTimestamp()).map(_.toLocalDateTime),
        huomiotMuistioon = r.nextStringOption(),
        esittelijanHuomioita = r.nextStringOption()
      )
    )

  implicit val getPyydettavaAsiakirjaResult: GetResult[PyydettavaAsiakirja] =
    GetResult(r =>
      PyydettavaAsiakirja(
        Option(UUID.fromString(r.nextString())),
        r.nextString()
      )
    )

  implicit val getAsiakirjamalliTutkinnostaResult: GetResult[AsiakirjamalliTutkinnosta] =
    GetResult(r =>
      AsiakirjamalliTutkinnosta(
        AsiakirjamalliLahde.valueOf(r.nextString()),
        r.nextBoolean(),
        Option(r.nextString())
      )
    )

  implicit val getKasittelyVaiheTiedotResult: GetResult[KasittelyVaiheTiedot] =
    GetResult(r =>
      KasittelyVaiheTiedot(
        selvityksetSaatu = r.nextBoolean(),
        vahvistusPyyntoLahetetty = Option(r.nextTimestamp()).map(_.toLocalDateTime),
        vahvistusSaatu = Option(r.nextTimestamp()).map(_.toLocalDateTime),
        imiPyyntoLahetetty = Option(r.nextTimestamp()).map(_.toLocalDateTime),
        imiPyyntoVastattu = Option(r.nextTimestamp()).map(_.toLocalDateTime),
        lausuntoKesken = r.nextBoolean(),
        paatosHyvaksymispaiva = Option(r.nextTimestamp()).map(_.toLocalDateTime),
        paatosLahetyspaiva = Option(r.nextTimestamp()).map(_.toLocalDateTime)
      )
    )

  /**
   * Hakee vain ne tiedot, joita tarvitaan käsittelyvaiheen ratkaisemiseen.
   *
   * Tämä on optimoitu kysely, joka hakee minimaaliset tiedot yhdellä tietokantakyselyllä,
   * sen sijaan että haettaisiin kaikki asiakirja- ja perustelutiedot useilla kyselyillä.
   *
   * @param asiakirjaId
   *   Hakemuksen asiakirja ID
   * @param hakemusId
   *   Hakemuksen ID
   * @return
   *   Käsittelyvaiheen ratkaisemiseen tarvittavat tiedot
   */
  def haeKasittelyVaiheTiedot(
    asiakirjaId: Option[UUID],
    hakemusId: UUID
  ): Option[KasittelyVaiheTiedot] = {
    asiakirjaId match {
      case Some(id) =>
        try {
          db.run(
            sql"""
              SELECT
                a.selvitykset_saatu,
                a.valmistumisen_vahvistus_pyynto_lahetetty,
                a.valmistumisen_vahvistus_saatu,
                a.imi_pyynto_lahetetty,
                a.imi_pyynto_vastattu,
                EXISTS(
                  SELECT 1 FROM perustelu p
                  JOIN lausuntopyynto l ON l.perustelu_id = p.id
                  WHERE p.hakemus_id = ${hakemusId.toString}::uuid
                    AND l.lahetetty IS NOT NULL
                    AND l.saapunut IS NULL
                ) as lausunto_kesken,
                p.hyvaksymispaiva,
                p.lahetyspaiva
              FROM asiakirja a
              LEFT JOIN paatos p ON p.hakemus_id = ${hakemusId.toString}::uuid
              WHERE a.id = ${id.toString}::uuid
            """.as[KasittelyVaiheTiedot].headOption,
            "hae_kasittely_vaihe_tiedot"
          )
        } catch {
          case e: Exception =>
            LOG.error(s"Käsittelyvaiheen tietojen haku epäonnistui: $e")
            throw new RuntimeException(
              s"Käsittelyvaiheen tietojen haku epäonnistui: ${e.getMessage}",
              e
            )
        }
      case None => None
    }
  }

  def haeKaikkiAsiakirjaTiedot(
    asiakirjaId: Option[UUID]
  ): Option[(DbAsiakirja, Seq[PyydettavaAsiakirja], Map[AsiakirjamalliLahde, AsiakirjamalliTutkinnosta])] = {
    asiakirjaId match {
      case Some(id) =>
        haeAsiakirjaTiedot(id) match {
          case Some(asiakirjaTiedot) =>
            Some((asiakirjaTiedot, haePyydettavatAsiakirjat(id), haeAsiakirjamallitTutkinnoista(id)))
          case None => None
        }
      case _ => None
    }
  }

  def haeAsiakirjaTiedot(
    asiakirjaId: UUID
  ): Option[DbAsiakirja] = {
    try {
      db.run(
        sql"""
            SELECT
              a.id,
              a.allekirjoitukset_tarkistettu,
              a.allekirjoitukset_tarkistettu_lisatiedot,
              a.imi_pyynto,
              a.imi_pyynto_numero,
              a.imi_pyynto_lahetetty,
              a.imi_pyynto_vastattu,
              a.alkuperaiset_asiakirjat_saatu_nahtavaksi,
              a.alkuperaiset_asiakirjat_saatu_nahtavaksi_lisatiedot,
              a.selvitykset_saatu,
              a.ap_hakemus,
              a.suostumus_vahvistamiselle_saatu,
              a.valmistumisen_vahvistus,
              a.valmistumisen_vahvistus_pyynto_lahetetty,
              a.valmistumisen_vahvistus_saatu,
              a.valmistumisen_vahvistus_vastaus,
              a.valmistumisen_vahvistus_lisatieto,
              a.viimeinen_asiakirja_hakijalta,
              a.huomiot_muistioon,
              a.esittelijan_huomioita
            FROM
              asiakirja a
            WHERE
              a.id = ${asiakirjaId.toString}::uuid
          """.as[DbAsiakirja].headOption,
        "hae_asiakirja_tiedot"
      )
    } catch {
      case e: Exception =>
        throw new RuntimeException(
          s"Asiakirjatietojen haku epäonnistui: ${e.getMessage}",
          e
        )
    }
  }

  def tallennaUudetAsiakirjatiedotAction(asiakirja: Asiakirja, luoja: String): DBIO[UUID] = {
    val valmistumisenVahvistusVastausOrNull = asiakirja.valmistumisenVahvistus.valmistumisenVahvistusVastaus
      .map(_.toString)
      .orNull

    sql"""
      INSERT INTO asiakirja (
        allekirjoitukset_tarkistettu,
        allekirjoitukset_tarkistettu_lisatiedot,
        imi_pyynto,
        imi_pyynto_numero,
        imi_pyynto_lahetetty,
        imi_pyynto_vastattu,
        alkuperaiset_asiakirjat_saatu_nahtavaksi,
        alkuperaiset_asiakirjat_saatu_nahtavaksi_lisatiedot,
        selvitykset_saatu,
        ap_hakemus,
        suostumus_vahvistamiselle_saatu,
        valmistumisen_vahvistus,
        valmistumisen_vahvistus_pyynto_lahetetty,
        valmistumisen_vahvistus_saatu,
        valmistumisen_vahvistus_vastaus,
        valmistumisen_vahvistus_lisatieto,
        viimeinen_asiakirja_hakijalta,
        huomiot_muistioon,
        esittelijan_huomioita,
        luoja)
      VALUES (
        ${asiakirja.allekirjoituksetTarkistettu},
        ${asiakirja.allekirjoituksetTarkistettuLisatiedot.orNull},
        ${asiakirja.imiPyynto.imiPyynto.getOrElse(false)},
        ${asiakirja.imiPyynto.imiPyyntoNumero.orNull},
        ${asiakirja.imiPyynto.imiPyyntoLahetetty.map(java.sql.Timestamp.valueOf).orNull},
        ${asiakirja.imiPyynto.imiPyyntoVastattu.map(java.sql.Timestamp.valueOf).orNull},
        ${asiakirja.alkuperaisetAsiakirjatSaatuNahtavaksi},
        ${asiakirja.alkuperaisetAsiakirjatSaatuNahtavaksiLisatiedot.orNull},
        ${asiakirja.selvityksetSaatu},
        ${asiakirja.apHakemus.getOrElse(false)},
        ${asiakirja.suostumusVahvistamiselleSaatu},
        ${asiakirja.valmistumisenVahvistus.valmistumisenVahvistus},
        ${asiakirja.valmistumisenVahvistus.valmistumisenVahvistusPyyntoLahetetty
        .map(java.sql.Timestamp.valueOf)
        .orNull},
        ${asiakirja.valmistumisenVahvistus.valmistumisenVahvistusSaatu.map(java.sql.Timestamp.valueOf).orNull},
        $valmistumisenVahvistusVastausOrNull::valmistumisen_vahvistus_vastaus_enum,
        ${asiakirja.valmistumisenVahvistus.valmistumisenVahvistusLisatieto.orNull},
        ${asiakirja.viimeinenAsiakirjaHakijalta.map(java.sql.Timestamp.valueOf).orNull},
        ${asiakirja.huomiotMuistioon},
        ${asiakirja.esittelijanHuomioita},
        $luoja)
      RETURNING id
    """.as[UUID].head
  }

  def tallennaUudetAsiakirjatiedot(asiakirja: Asiakirja, luoja: String): UUID = {
    try
      val asiakirjaId = db.run(
        tallennaUudetAsiakirjatiedotAction(asiakirja, luoja),
        "tallenna_uudet_asiakirjatiedot"
      )

      // Tallenna myös sisäkkäiset kokoelmat alkuperäisellä tallennuksella
      if (asiakirja.pyydettavatAsiakirjat.nonEmpty) {
        val pyydettavatOperations = HakemusModifyOperationResolver
          .resolvePyydettavatAsiakirjatModifyOperations(
            Seq.empty, // Ei olemassa olevaa dataa ensimmäisellä tallennuksella
            asiakirja.pyydettavatAsiakirjat
          )
        suoritaPyydettavienAsiakirjojenModifiointi(
          asiakirjaId,
          pyydettavatOperations,
          UserOid(luoja)
        )
      }

      if (asiakirja.asiakirjamallitTutkinnoista.nonEmpty) {
        val malliOperations = HakemusModifyOperationResolver
          .resolveAsiakirjamalliModifyOperations(
            Map.empty, // Ei olemassa olevaa dataa ensimmäisellä tallennuksella
            asiakirja.asiakirjamallitTutkinnoista
          )
        suoritaAsiakirjamallienModifiointi(
          asiakirjaId,
          malliOperations,
          UserOid(luoja)
        )
      }

      asiakirjaId
    catch {
      case e: Exception =>
        LOG.error(s"Asiakirjatietojen tallennus epäonnistui: $e")
        throw new RuntimeException(
          s"Asiakirjatietojen tallennus epäonnistui: ${e.getMessage}",
          e
        )
    }
  }

  private def suoritaPyydettavienAsiakirjojenModifiointi(
    asiakirjaId: UUID,
    modifyData: PyydettavaAsiakirjaModifyData,
    virkailijaOid: UserOid
  ): Unit = {
    val actions = modifyData.uudet.map(ak => luoPyydettavaAsiakirja(asiakirjaId, ak.asiakirjanTyyppi, virkailijaOid)) ++
      modifyData.muutetut.map(ak => paivitaPyydettavaAsiakirja(ak.id.get, ak.asiakirjanTyyppi, virkailijaOid)) ++
      modifyData.poistetut.map(poistaPyydettavaAsiakirja)
    val combined = db.combineIntDBIOs(actions)
    db.runTransactionally(combined, "suorita_pyydettavien_asiakirjojen_modifiointi") match {
      case Success(_) => ()
      case Failure(e) =>
        LOG.error(s"Virhe pyydettävien asiakirjojen modifioinnissa: ${e.getMessage}", e)
        throw new RuntimeException(s"Virhe pyydettävien asiakirjojen modifioinnissa: ${e.getMessage}", e)
    }
  }

  /**
   * Luo pyydettävän asiakirjan
   *
   * @param asiakirjaId
   * vastaavan asiakirjakokonaisuuden ID
   * @param asiakirjaTyyppi
   * pyydettävän asiakirjan tyyppi
   * @param virkailijaOid
   * virkailijan oid
   */
  def luoPyydettavaAsiakirja(
    asiakirjaId: UUID,
    asiakirjaTyyppi: String,
    virkailijaOid: UserOid
  ): DBIO[Int] =
    sqlu"""
          INSERT INTO pyydettava_asiakirja (asiakirja_id, asiakirja_tyyppi, luoja)
          VALUES (${asiakirjaId.toString}::uuid, $asiakirjaTyyppi::asiakirjan_tyyppi, ${virkailijaOid.toString})
        """

  /**
   * Päivittää pyydettävän asiakirjan
   *
   * @param id
   * pyydettävän asiakirjan id
   * @param asiakirjaTyyppi
   * pyydettävän asiakirjan tyyppi
   * @param virkailijaOid
   * päivittävän virkailijan oid
   */
  private def paivitaPyydettavaAsiakirja(
    id: UUID,
    asiakirjaTyyppi: String,
    virkailijaOid: UserOid
  ): DBIO[Int] =
    sqlu"""
            UPDATE pyydettava_asiakirja
            SET asiakirja_tyyppi = $asiakirjaTyyppi::asiakirjan_tyyppi, muokkaaja = ${virkailijaOid.toString}
            WHERE id = ${id.toString}::uuid
          """

  /**
   * Poistaa pyydettävän asiakirjan
   *
   * @param id
   * pyydettävän asiakirjan id
   */
  private def poistaPyydettavaAsiakirja(
    id: UUID
  ): DBIO[Int] =
    sqlu"""
          DELETE FROM pyydettava_asiakirja
          WHERE id = ${id.toString}::uuid
        """

  /**
   * Hakee hakemuksen pyydettävät asiakirjat
   *
   * @param asiakirjaId
   * vastaavan asiakirjakokonaisuuden ID
   * @return
   * hakemuksen pyydettävät asiakirjat
   */
  private def haePyydettavatAsiakirjat(asiakirjaId: UUID): Seq[PyydettavaAsiakirja] = {
    try {
      db.run(
        sql"""
          SELECT id, asiakirja_tyyppi
          FROM pyydettava_asiakirja
          WHERE asiakirja_id = ${asiakirjaId.toString}::uuid
          ORDER BY luotu
        """.as[PyydettavaAsiakirja],
        "hae_hakemuksen_pyydettavat_asiakirjat"
      )
    } catch {
      case e: Exception =>
        LOG.error(s"Hakemuksen pyydettävien asiakirjojen haku epäonnistui: $e")
        throw new RuntimeException(
          s"Hakemuksen pyydettävien asiakirjojen haku epäonnistui: ${e.getMessage}",
          e
        )
    }
  }

  private def suoritaAsiakirjamallienModifiointi(
    asiakirjaId: UUID,
    modifyData: AsiakirjamalliModifyData,
    virkailijaOid: UserOid
  ): Unit = {
    val actions = modifyData.uudetMallit.values.toSeq.map(lisaaAsiakirjamalli(asiakirjaId, _, virkailijaOid)) ++
      modifyData.muutetutMallit.values.toSeq.map(muokkaaAsiakirjamallia(asiakirjaId, _, virkailijaOid)) ++
      modifyData.poistetutMallit.map(poistaAsiakirjamalli(asiakirjaId, _))
    val combined = db.combineIntDBIOs(actions)
    db.runTransactionally(combined, "suorita_asiakirjamallien_modifiointi") match {
      case Success(_) => ()
      case Failure(e) =>
        LOG.error(s"Virhe asiakirjamallien modifioinnissa: ${e.getMessage}", e)
        throw new RuntimeException(s"Virhe asiakirjamallien modifioinnissa: ${e.getMessage}", e)
    }
  }

  def lisaaAsiakirjamalli(
    asiakirjaId: UUID,
    asiakirjamalli: AsiakirjamalliTutkinnosta,
    virkailijaOid: UserOid
  ): DBIO[Int] =
    sqlu"""
      INSERT INTO asiakirjamalli_tutkinnosta (asiakirja_id, lahde, vastaavuus, kuvaus, luoja)
      VALUES (
        ${asiakirjaId.toString}::uuid,
        ${asiakirjamalli.lahde.toString}::asiakirja_malli_lahde,
        ${asiakirjamalli.vastaavuus},
        ${asiakirjamalli.kuvaus},
        ${virkailijaOid.toString}
      )
    """

  private def muokkaaAsiakirjamallia(
    asiakirjaId: UUID,
    asiakirjamalli: AsiakirjamalliTutkinnosta,
    virkailijaOid: UserOid
  ): DBIO[Int] =
    sqlu"""
      UPDATE asiakirjamalli_tutkinnosta
      SET vastaavuus = ${asiakirjamalli.vastaavuus},
          kuvaus = ${asiakirjamalli.kuvaus},
          muokkaaja = ${virkailijaOid.toString}
      WHERE asiakirja_id = ${asiakirjaId.toString}::uuid
        AND lahde = ${asiakirjamalli.lahde.toString}::asiakirja_malli_lahde
    """

  private def poistaAsiakirjamalli(asiakirjaId: UUID, lahde: AsiakirjamalliLahde): DBIO[Int] =
    sqlu"""
      DELETE FROM asiakirjamalli_tutkinnosta
      WHERE asiakirja_id = ${asiakirjaId.toString}::uuid
        AND lahde = ${lahde.toString}::asiakirja_malli_lahde
    """

  /**
   * Hakee hakemuksen asiakirjamallit tutkinnosta
   *
   * @param asiakirjaId
   * hakemuksen asiakirjakokonaisuuden id
   * @return
   * hakemuksen asiakirjamallit tutkinnosta
   */
  private def haeAsiakirjamallitTutkinnoista(
    asiakirjaId: UUID
  ): Map[AsiakirjamalliLahde, AsiakirjamalliTutkinnosta] = {
    try {
      db.run(
        sql"""
          SELECT lahde, vastaavuus, kuvaus
          FROM asiakirjamalli_tutkinnosta
          WHERE asiakirja_id = ${asiakirjaId.toString}::uuid
          ORDER BY luotu
        """.as[AsiakirjamalliTutkinnosta],
        "hae_hakemuksen_asiakirjamallit_tutkinnoista"
      ).map(malli => malli.lahde -> malli)
        .toMap
    } catch {
      case e: Exception =>
        LOG.error(s"Hakemuksen asiakirjamallien haku epäonnistui: $e")
        throw new RuntimeException(
          s"Hakemuksen asiakirjamallien haku epäonnistui: ${e.getMessage}",
          e
        )
    }
  }

  /**
   * Päivittää asiakirjatiedot täysin (korvaa kaikki kentät).
   * Käytetään täyden entiteetin tallennukseen ilman mergeä.
   *
   * @param asiakirjaId asiakirjan id
   * @param asiakirja täysi asiakirja-objekti (ei partial)
   * @param muokkaaja muokkaajan käyttäjätunnus
   * @return päivitetyn asiakirjan id
   */
  def paivitaAsiakirjaTiedot(
    asiakirjaId: UUID,
    asiakirja: Asiakirja,
    muokkaaja: UserOid
  ): UUID = {
    try {
      // Hae nykyiset tiedot nested collection -muutosten selvittämiseksi
      val (currentPyydettavatAsiakirjat, currentAsiakirjamallitTutkinnoista) =
        haeKaikkiAsiakirjaTiedot(Some(asiakirjaId)) match {
          case Some((_, pyydettavat, mallit)) => (pyydettavat, mallit)
          case None                           =>
            throw new RuntimeException(s"Asiakirjaa ei löydy id:llä $asiakirjaId")
        }

      // Päivitä pääasiakirjan kentät suoraan ilman mergeä
      val valmistumisenVahvistusVastausOrNull = asiakirja.valmistumisenVahvistus.valmistumisenVahvistusVastaus
        .map(_.toString)
        .orNull

      val updatedId = db.run(
        sql"""
          UPDATE asiakirja
          SET
            allekirjoitukset_tarkistettu = ${asiakirja.allekirjoituksetTarkistettu},
            allekirjoitukset_tarkistettu_lisatiedot = ${asiakirja.allekirjoituksetTarkistettuLisatiedot.orNull},
            imi_pyynto = ${asiakirja.imiPyynto.imiPyynto},
            imi_pyynto_numero = ${asiakirja.imiPyynto.imiPyyntoNumero.orNull},
            imi_pyynto_lahetetty = ${asiakirja.imiPyynto.imiPyyntoLahetetty.map(java.sql.Timestamp.valueOf).orNull},
            imi_pyynto_vastattu = ${asiakirja.imiPyynto.imiPyyntoVastattu.map(java.sql.Timestamp.valueOf).orNull},
            alkuperaiset_asiakirjat_saatu_nahtavaksi = ${asiakirja.alkuperaisetAsiakirjatSaatuNahtavaksi},
            alkuperaiset_asiakirjat_saatu_nahtavaksi_lisatiedot = ${asiakirja.alkuperaisetAsiakirjatSaatuNahtavaksiLisatiedot.orNull},
            selvitykset_saatu = ${asiakirja.selvityksetSaatu},
            ap_hakemus = ${asiakirja.apHakemus},
            suostumus_vahvistamiselle_saatu = ${asiakirja.suostumusVahvistamiselleSaatu},
            valmistumisen_vahvistus = ${asiakirja.valmistumisenVahvistus.valmistumisenVahvistus},
            valmistumisen_vahvistus_pyynto_lahetetty = ${asiakirja.valmistumisenVahvistus.valmistumisenVahvistusPyyntoLahetetty
            .map(java.sql.Timestamp.valueOf)
            .orNull},
            valmistumisen_vahvistus_saatu = ${asiakirja.valmistumisenVahvistus.valmistumisenVahvistusSaatu
            .map(java.sql.Timestamp.valueOf)
            .orNull},
            valmistumisen_vahvistus_vastaus = $valmistumisenVahvistusVastausOrNull::valmistumisen_vahvistus_vastaus_enum,
            valmistumisen_vahvistus_lisatieto = ${asiakirja.valmistumisenVahvistus.valmistumisenVahvistusLisatieto.orNull},
            viimeinen_asiakirja_hakijalta = ${asiakirja.viimeinenAsiakirjaHakijalta
            .map(java.sql.Timestamp.valueOf)
            .orNull},
            huomiot_muistioon = ${asiakirja.huomiotMuistioon},
            esittelijan_huomioita = ${asiakirja.esittelijanHuomioita},
            muokkaaja = ${muokkaaja.toString}
          WHERE id = ${asiakirjaId.toString}::uuid
          RETURNING id
        """.as[UUID].head,
        "paivita_taysi_asiakirjatiedot"
      )

      // Selvitä ja suorita pyydettävien asiakirjojen muutokset
      val pyydettavatAsiakirjatModifyData = HakemusModifyOperationResolver
        .resolvePyydettavatAsiakirjatModifyOperations(
          currentPyydettavatAsiakirjat,
          asiakirja.pyydettavatAsiakirjat
        )
      suoritaPyydettavienAsiakirjojenModifiointi(
        asiakirjaId,
        pyydettavatAsiakirjatModifyData,
        muokkaaja
      )

      // Selvitä ja suorita asiakirjamallien muutokset
      val asiakirjamalliModifyData = HakemusModifyOperationResolver
        .resolveAsiakirjamalliModifyOperations(
          currentAsiakirjamallitTutkinnoista,
          asiakirja.asiakirjamallitTutkinnoista
        )
      suoritaAsiakirjamallienModifiointi(
        asiakirjaId,
        asiakirjamalliModifyData,
        muokkaaja
      )

      updatedId
    } catch {
      case e: Exception =>
        LOG.error(s"Asiakirjatietojen täysi päivitys epäonnistui: $e")
        throw new RuntimeException(
          s"Asiakirjatietojen täysi päivitys epäonnistui: ${e.getMessage}",
          e
        )
    }
  }
}
