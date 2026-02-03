package fi.oph.tutu.backend.repository

import fi.oph.tutu.backend.domain.*
import org.json4s.jackson.Serialization
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.{Component, Repository}
import slick.dbio.DBIO
import slick.jdbc.{GetResult, SQLActionBuilder}
import slick.jdbc.PostgresProfile.api.*

import java.util.UUID
import scala.concurrent.duration.DurationInt
import scala.util.{Failure, Success}

@Component
@Repository
class PaatosRepository extends BaseResultHandlers {
  @Autowired
  val db: TutuDatabase = null
  val LOG: Logger      = LoggerFactory.getLogger(classOf[PaatosRepository])

  final val DB_TIMEOUT = 30.seconds

  implicit val getPaatosResult: GetResult[Paatos] = GetResult(r =>
    Paatos(
      id = Some(r.nextObject().asInstanceOf[UUID]),
      hakemusId = Some(r.nextObject().asInstanceOf[UUID]),
      ratkaisutyyppi = Option(Ratkaisutyyppi.fromString(r.nextString())),
      seutArviointi = r.nextBoolean(),
      peruutuksenTaiRaukeamisenSyy = Option(Serialization.read[PeruutuksenTaiRaukeamisenSyy](r.nextString())),
      hyvaksymispaiva = r.nextTimestampOption().map(_.toLocalDateTime),
      lahetyspaiva = r.nextTimestampOption().map(_.toLocalDateTime),
      luotu = Some(r.nextTimestamp().toLocalDateTime),
      luoja = Some(r.nextString()),
      muokkaaja = r.nextStringOption()
    )
  )

  implicit val getPaatosTietoResult: GetResult[PaatosTieto] = GetResult(r =>
    PaatosTieto(
      id = Some(r.nextObject().asInstanceOf[UUID]),
      paatosId = Some(r.nextObject().asInstanceOf[UUID]),
      paatosTyyppi = Option(PaatosTyyppi.fromString(r.nextString())),
      sovellettuLaki = Option(SovellettuLaki.fromString(r.nextString())),
      tutkintoId = Some(r.nextObject().asInstanceOf[UUID]),
      lisaaTutkintoPaatostekstiin = r.nextBooleanOption(),
      myonteinenPaatos = r.nextBooleanOption(),
      kielteisenPaatoksenPerustelut = Option(Serialization.read[KielteisenPaatoksenPerustelut](r.nextString())),
      tutkintoTaso = Option(TutkintoTaso.fromString(r.nextString())),
      luotu = Some(r.nextTimestamp().toLocalDateTime),
      luoja = Some(r.nextString()),
      muokkaaja = r.nextStringOption()
    )
  )

  implicit val getTutkintoTaiOpintoResult: GetResult[TutkintoTaiOpinto] = GetResult(r =>
    TutkintoTaiOpinto(
      id = Some(r.nextObject().asInstanceOf[UUID]),
      paatostietoId = Some(r.nextObject().asInstanceOf[UUID]),
      tutkintoTaiOpinto = r.nextStringOption(),
      myonteinenPaatos = r.nextBooleanOption(),
      myonteisenPaatoksenLisavaatimukset =
        Option(Serialization.read[MyonteisenPaatoksenLisavaatimukset](r.nextString())),
      kielteisenPaatoksenPerustelut = Option(Serialization.read[KielteisenPaatoksenPerustelut](r.nextString())),
      luotu = Some(r.nextTimestamp().toLocalDateTime),
      luoja = Some(r.nextString()),
      muokkaaja = r.nextStringOption(),
      opetuskieli = r.nextStringOption()
    )
  )

  implicit val getKelpoisuusResult: GetResult[Kelpoisuus] = GetResult(r =>
    Kelpoisuus(
      id = Some(r.nextObject().asInstanceOf[UUID]),
      paatostietoId = Some(r.nextObject().asInstanceOf[UUID]),
      kelpoisuus = r.nextStringOption(),
      opetettavaAine = r.nextStringOption(),
      muuAmmattiKuvaus = r.nextStringOption(),
      direktiivitaso = Option(Direktiivitaso.fromString(r.nextString())),
      kansallisestiVaadittavaDirektiivitaso = Option(Direktiivitaso.fromString(r.nextString())),
      direktiivitasoLisatiedot = r.nextStringOption(),
      myonteinenPaatos = r.nextBooleanOption(),
      myonteisenPaatoksenLisavaatimukset = Option(Serialization.read[KelpoisuudenLisavaatimukset](r.nextString())),
      kielteisenPaatoksenPerustelut = Option(Serialization.read[KielteisenPaatoksenPerustelut](r.nextString())),
      luotu = Some(r.nextTimestamp().toLocalDateTime),
      luoja = Some(r.nextString()),
      muokkaaja = r.nextStringOption()
    )
  )

  /**
   * Tallentaa päätöksen (palauttaa DBIO-actionin transaktioita varten)
   *
   * @param hakemusId
   *   hakemuksen uuid
   * @param paatos
   * @param luojaTaiMuokkaaja
   * @return
   *   DBIO action joka palauttaa tallennetun päätöksen
   */
  def tallennaPaatosAction(hakemusId: UUID, paatos: Paatos, luojaTaiMuokkaaja: String): DBIO[Paatos] = {
    val ratkaisutyyppiOrNull             = paatos.ratkaisutyyppi.map(_.toString).orNull
    val peruutuksenTaiRaukeamisenSyyJson = Serialization.write(paatos.peruutuksenTaiRaukeamisenSyy.orNull)
    sql"""
      INSERT INTO paatos (hakemus_id, ratkaisutyyppi, seut_arviointi_tehty, peruutus_tai_raukeaminen_lisatiedot, hyvaksymispaiva, lahetyspaiva, luoja)
      VALUES (${hakemusId.toString}::uuid, $ratkaisutyyppiOrNull::ratkaisutyyppi, ${paatos.seutArviointi},
        $peruutuksenTaiRaukeamisenSyyJson::jsonb, ${paatos.hyvaksymispaiva
        .map(java.sql.Timestamp.valueOf)
        .orNull}, ${paatos.lahetyspaiva.map(java.sql.Timestamp.valueOf).orNull}, $luojaTaiMuokkaaja)
      ON CONFLICT (hakemus_id)
      DO UPDATE SET
        ratkaisutyyppi = $ratkaisutyyppiOrNull::ratkaisutyyppi,
        seut_arviointi_tehty = ${paatos.seutArviointi},
        peruutus_tai_raukeaminen_lisatiedot = $peruutuksenTaiRaukeamisenSyyJson::jsonb,
        hyvaksymispaiva = ${paatos.hyvaksymispaiva.map(java.sql.Timestamp.valueOf).orNull},
        lahetyspaiva = ${paatos.lahetyspaiva.map(java.sql.Timestamp.valueOf).orNull},
        muokkaaja = $luojaTaiMuokkaaja
      RETURNING id, hakemus_id, ratkaisutyyppi, seut_arviointi_tehty,
        peruutus_tai_raukeaminen_lisatiedot, hyvaksymispaiva, lahetyspaiva, luotu, luoja, muokkaaja
    """.as[Paatos].head
  }

  def tallennaPaatos(hakemusId: UUID, paatos: Paatos, luojaTaiMuokkaaja: String): Paatos = {
    try {
      db.run(
        tallennaPaatosAction(hakemusId, paatos, luojaTaiMuokkaaja),
        "tallenna_paatos"
      )
    } catch {
      case e: Exception =>
        LOG.error(s"Päätöksen tallennus epäonnistui: $e")
        throw new RuntimeException(
          s"Päätöksen tallennus epäonnistui: ${e.getMessage}",
          e
        )
    }
  }

  def haePaatos(hakemusId: UUID): Option[Paatos] = {
    try {
      db.run(
        sql"""
        SELECT id, hakemus_id, ratkaisutyyppi, seut_arviointi_tehty, peruutus_tai_raukeaminen_lisatiedot, hyvaksymispaiva, lahetyspaiva, luotu, luoja, muokkaaja
        FROM paatos
        WHERE hakemus_id = ${hakemusId.toString}::uuid
      """.as[Paatos].headOption,
        "hae_paatos"
      )
    } catch {
      case e: Exception =>
        LOG.error(s"Päätöksen haku epäonnistui: $e")
        throw new RuntimeException(
          s"Päätöksen haku epäonnistui: ${e.getMessage}",
          e
        )
    }
  }

  /**
   * Tallentaa/poistaa uudet/muuttuneet/poistetut päätöstiedot
   *
   * @param paatosId
   * vastaavan päätöksen uuid
   * @param modifyData
   * päätöstietojen muokkaustiedot
   * @param luojaTaiMuokkaaja
   * pyynnön luoja tai muokkaaja
   */
  def suoritaPaatosTietojenModifiointi(
    paatosId: UUID,
    modifyData: PaatosTietoModifyData,
    luojaTaiMuokkaaja: String
  ): Unit = {
    var tutkinnotTaiOpinnotActions = {
      modifyData.muutetut.flatMap { pt =>
        val paatostietoId     = pt.id.getOrElse(UUID.randomUUID())
        val existingTutkinnot = haeTutkinnotTaiOpinnot(paatostietoId)
        val existingIds       = existingTutkinnot.flatMap(_.id).toSet
        val updatedIds        = pt.rinnastettavatTutkinnotTaiOpinnot.flatMap(_.id).toSet
        val idsToDelete       = existingIds.diff(updatedIds)

        val deleteActions = idsToDelete
          .map(id => poistaTutkintoTaiOpinto(id))

        val updateActions = pt.rinnastettavatTutkinnotTaiOpinnot
          .filter(tto => tto.id.isDefined)
          .map(tto => paivitaTutkintoTaiOpinto(tto, luojaTaiMuokkaaja))

        val addActions = pt.rinnastettavatTutkinnotTaiOpinnot
          .filter(tto => tto.id.isEmpty)
          .map(tto => lisaaTutkintoTaiOpinto(paatostietoId, tto, luojaTaiMuokkaaja))

        deleteActions ++ updateActions ++ addActions
      }
    }
    tutkinnotTaiOpinnotActions = tutkinnotTaiOpinnotActions ++ modifyData.poistetut.flatMap { id =>
      haeTutkinnotTaiOpinnot(id).flatMap { tto =>
        tto.id.map(poistaTutkintoTaiOpinto)
      }
    }

    var kelpoisuusActions = {
      modifyData.muutetut.flatMap { pt =>
        val paatostietoId        = pt.id.getOrElse(UUID.randomUUID())
        val existingKelpoisuudet = haeKelpoisuudet(paatostietoId)
        val existingIds          = existingKelpoisuudet.flatMap(_.id).toSet
        val updatedIds           = pt.kelpoisuudet.flatMap(_.id).toSet
        val idsToDelete          = existingIds.diff(updatedIds)

        val deleteActions = idsToDelete
          .map(id => poistaKelpoisuus(id))

        val updateActions = pt.kelpoisuudet
          .filter(k => k.id.isDefined)
          .map(k => paivitaKelpoisuus(k, luojaTaiMuokkaaja))

        val addActions = pt.kelpoisuudet
          .filter(k => k.id.isEmpty)
          .map(k => lisaaKelpoisuus(paatostietoId, k, luojaTaiMuokkaaja))

        deleteActions ++ updateActions ++ addActions
      }
    }
    kelpoisuusActions = kelpoisuusActions ++ modifyData.poistetut.flatMap { id =>
      haeKelpoisuudet(id).flatMap { kelpoisuus =>
        kelpoisuus.id.map(poistaKelpoisuus)
      }
    }
    val separatelySavedPaatostiedot =
      modifyData.uudet.filter(_.containsTutkinnotOrKelpoisuudet)

    val addEntityActionsForNewPaatostiedot = separatelySavedPaatostiedot.flatMap(pt => {
      val paatostieto   = tallennaPaatosTieto(paatosId, pt, luojaTaiMuokkaaja)
      val paatostietoId = paatostieto.id.get

      val tutkinnotTaiOpinnotActions =
        pt.rinnastettavatTutkinnotTaiOpinnot.map(tto => lisaaTutkintoTaiOpinto(paatostietoId, tto, luojaTaiMuokkaaja))

      val kelpoisuusActions = pt.kelpoisuudet.map(k => lisaaKelpoisuus(paatostietoId, k, luojaTaiMuokkaaja))

      tutkinnotTaiOpinnotActions ++ kelpoisuusActions
    })

    val paatostietoActions = modifyData.uudet
      .filterNot(_.containsTutkinnotOrKelpoisuudet)
      .map(pt => lisaaPaatosTieto(paatosId, pt, luojaTaiMuokkaaja).asUpdate) ++
      modifyData.muutetut.map(pt => paivitaPaatosTieto(pt, luojaTaiMuokkaaja)) ++
      modifyData.poistetut.map(poistaPaatosTieto)

    val combined = db.combineIntDBIOs(
      tutkinnotTaiOpinnotActions ++ kelpoisuusActions ++ paatostietoActions ++ addEntityActionsForNewPaatostiedot
    )

    db.runTransactionally(combined, "suorita_paatostietojen_modifiointi") match {
      case Success(_) => ()
      case Failure(e) =>
        LOG.error(s"Virhe paatostietojen modifioinnissa: ${e.getMessage}", e)
        throw new RuntimeException(s"Virhe paatostietojen modifioinnissa: ${e.getMessage}", e)
    }
  }

  def lisaaPaatosTieto(
    paatosId: UUID,
    paatosTieto: PaatosTieto,
    luoja: String,
    setResultClause: Boolean = false
  ): SQLActionBuilder = {
    val resultClause = if (setResultClause) {
      s"""
        RETURNING id, paatos_id, paatostyyppi, sovellettulaki, tutkinto_id, lisaa_tutkinto_paatostekstiin,
          myonteinen_paatos, kielteisen_paatoksen_perustelut,
          tutkintotaso, luotu, luoja, null
      """
    } else {
      ""
    }

    sql"""
            INSERT INTO paatostieto (
              paatos_id,
              paatostyyppi,
              sovellettulaki,
              tutkinto_id,
              lisaa_tutkinto_paatostekstiin,
              myonteinen_paatos,
              kielteisen_paatoksen_perustelut,
              tutkintotaso,
              luoja
            )
            VALUES (
              ${paatosId.toString}::uuid,
              ${paatosTieto.paatosTyyppi.map(_.toString).orNull}::paatostyyppi,
              ${paatosTieto.sovellettuLaki.map(_.toString).orNull}::sovellettulaki,
              ${paatosTieto.tutkintoId.map(_.toString).orNull}::uuid,
              ${paatosTieto.lisaaTutkintoPaatostekstiin}::boolean,
              ${paatosTieto.myonteinenPaatos}::boolean,
              ${Serialization.write(paatosTieto.kielteisenPaatoksenPerustelut.orNull)}::jsonb,
              ${paatosTieto.tutkintoTaso.map(_.toString).orNull}::tutkintotaso,
              $luoja)
              #$resultClause"""
  }

  def tallennaPaatosTieto(paatosId: UUID, paatosTieto: PaatosTieto, luoja: String): PaatosTieto = {
    try {
      db.run(
        lisaaPaatosTieto(paatosId, paatosTieto, luoja, true).as[PaatosTieto].head,
        "tallenna_paatostieto"
      )
    } catch {
      case e: Exception =>
        LOG.error(s"Päätöstiedon tallennus epäonnistui: $e")
        throw new RuntimeException(
          s"Päätöstiedon tallennus epäonnistui: ${e.getMessage}",
          e
        )
    }
  }

  private def paivitaPaatosTieto(
    paatosTieto: PaatosTieto,
    muokkaaja: String
  ): DBIO[Int] =
    sqlu"""
        UPDATE paatostieto
        SET
          paatostyyppi = ${paatosTieto.paatosTyyppi.map(_.toString).orNull}::paatostyyppi,
          sovellettulaki = ${paatosTieto.sovellettuLaki.map(_.toString).orNull}::sovellettulaki,
          tutkinto_id = ${paatosTieto.tutkintoId.map(_.toString).orNull}::uuid,
          lisaa_tutkinto_paatostekstiin = ${paatosTieto.lisaaTutkintoPaatostekstiin}::boolean,
          myonteinen_paatos = ${paatosTieto.myonteinenPaatos}::boolean,
          kielteisen_paatoksen_perustelut = ${Serialization.write(
        paatosTieto.kielteisenPaatoksenPerustelut.orNull
      )}::jsonb,
          tutkintotaso = ${paatosTieto.tutkintoTaso.map(_.toString).orNull}::tutkintotaso,
          muokkaaja = $muokkaaja
        WHERE id = ${paatosTieto.id.get.toString}::uuid
      """

  def haePaatosTiedot(paatosId: UUID): Seq[PaatosTieto] = {
    try {
      db.run(
        sql"""
          SELECT id, paatos_id, paatostyyppi, sovellettulaki, tutkinto_id, lisaa_tutkinto_paatostekstiin,
            myonteinen_paatos, kielteisen_paatoksen_perustelut,
            tutkintotaso, luotu, luoja, muokkaaja
          FROM paatostieto
          WHERE paatos_id = ${paatosId.toString}::uuid
          ORDER BY luotu
        """.as[PaatosTieto],
        "hae_paatostiedot"
      )
    } catch {
      case e: Exception =>
        LOG.error(s"Päätöstietojen haku epäonnistui: $e")
        throw new RuntimeException(
          s"Päätöstietojen haku epäonnistui: ${e.getMessage}",
          e
        )
    }
  }

  private def poistaPaatosTieto(id: UUID): DBIO[Int] =
    sqlu"""
        DELETE FROM paatostieto
        WHERE id = ${id.toString}::uuid
      """

  def lisaaTutkintoTaiOpinto(paatostietoId: UUID, tutkintoTaiOpinto: TutkintoTaiOpinto, luoja: String): DBIO[Int] =
    sqlu"""
          INSERT INTO tutkinto_tai_opinto (
            paatostieto_id,
            tutkinto_tai_opinto,
            myonteinen_paatos,
            myonteisen_paatoksen_lisavaatimukset,
            kielteisen_paatoksen_perustelut,
            luoja,
            opetuskieli
          )
          VALUES (
            ${paatostietoId.toString}::uuid,
            ${tutkintoTaiOpinto.tutkintoTaiOpinto.map(identity).orNull}::text,
            ${tutkintoTaiOpinto.myonteinenPaatos}::boolean,
            ${Serialization.write(tutkintoTaiOpinto.myonteisenPaatoksenLisavaatimukset.orNull)}::jsonb,
            ${Serialization.write(
        tutkintoTaiOpinto.kielteisenPaatoksenPerustelut.orNull
      )}::jsonb,
            $luoja,
            ${tutkintoTaiOpinto.opetuskieli.orNull}
          )"""

  private def paivitaTutkintoTaiOpinto(
    tutkintoTaiOpinto: TutkintoTaiOpinto,
    muokkaaja: String
  ): DBIO[Int] =
    sqlu"""
          UPDATE tutkinto_tai_opinto
          SET
            tutkinto_tai_opinto = ${tutkintoTaiOpinto.tutkintoTaiOpinto.map(identity).orNull}::text,
            myonteinen_paatos = ${tutkintoTaiOpinto.myonteinenPaatos}::boolean,
            myonteisen_paatoksen_lisavaatimukset = ${Serialization.write(
        tutkintoTaiOpinto.myonteisenPaatoksenLisavaatimukset.orNull
      )}::jsonb,
            kielteisen_paatoksen_perustelut = ${Serialization.write(
        tutkintoTaiOpinto.kielteisenPaatoksenPerustelut.orNull
      )}::jsonb,
            muokkaaja = $muokkaaja,
            opetuskieli = ${tutkintoTaiOpinto.opetuskieli.orNull}
          WHERE id = ${tutkintoTaiOpinto.id.get.toString}::uuid
        """

  def haeTutkinnotTaiOpinnot(paatostietoId: UUID): Seq[TutkintoTaiOpinto] = {
    try {
      db.run(
        sql"""
            SELECT id, paatostieto_id, tutkinto_tai_opinto, myonteinen_paatos,
              myonteisen_paatoksen_lisavaatimukset, kielteisen_paatoksen_perustelut,
              luotu, luoja, muokkaaja, opetuskieli
            FROM tutkinto_tai_opinto
            WHERE paatostieto_id = ${paatostietoId.toString}::uuid
            ORDER BY luotu
          """.as[TutkintoTaiOpinto],
        "hae_tutkinnot_tai_opinnot"
      )
    } catch {
      case e: Exception =>
        LOG.error(s"Tutkintojen tai opintojen haku epäonnistui: $e")
        throw new RuntimeException(
          s"Tutkintojen tai opintojen haku epäonnistui: ${e.getMessage}",
          e
        )
    }
  }

  private def poistaTutkintoTaiOpinto(id: UUID): DBIO[Int] =
    sqlu"""
          DELETE FROM tutkinto_tai_opinto
          WHERE id = ${id.toString}::uuid
        """

  private def lisaaKelpoisuus(paatostietoId: UUID, kelpoisuus: Kelpoisuus, luoja: String): DBIO[Int] =
    sqlu"""
          INSERT INTO kelpoisuus (
            paatostieto_id,
            kelpoisuus,
            opetettava_aine,
            muu_ammatti_kuvaus,
            direktiivitaso,
            kansallisesti_vaadittava_direktiivitaso,
            direktiivitaso_lisatiedot,
            myonteinen_paatos,
            myonteisen_paatoksen_lisavaatimukset,
            kielteisen_paatoksen_perustelut,
            luoja
          )
          VALUES (
            ${paatostietoId.toString}::uuid,
            ${kelpoisuus.kelpoisuus},
            ${kelpoisuus.opetettavaAine},
            ${kelpoisuus.muuAmmattiKuvaus},
            ${kelpoisuus.direktiivitaso.map(_.toString).orNull}::direktiivitaso,
            ${kelpoisuus.kansallisestiVaadittavaDirektiivitaso.map(_.toString).orNull}::direktiivitaso,
            ${kelpoisuus.direktiivitasoLisatiedot},
            ${kelpoisuus.myonteinenPaatos},
            ${Serialization.write(kelpoisuus.myonteisenPaatoksenLisavaatimukset.orNull)}::jsonb,
            ${Serialization.write(kelpoisuus.kielteisenPaatoksenPerustelut.orNull)}::jsonb,
            $luoja
          )"""

  private def paivitaKelpoisuus(
    kelpoisuus: Kelpoisuus,
    muokkaaja: String
  ): DBIO[Int] =
    sqlu"""
          UPDATE kelpoisuus
          SET
            kelpoisuus = ${kelpoisuus.kelpoisuus},
            opetettava_aine = ${kelpoisuus.opetettavaAine},
            muu_ammatti_kuvaus = ${kelpoisuus.muuAmmattiKuvaus},
            direktiivitaso = ${kelpoisuus.direktiivitaso.map(_.toString).orNull}::direktiivitaso,
            kansallisesti_vaadittava_direktiivitaso = ${kelpoisuus.kansallisestiVaadittavaDirektiivitaso
        .map(_.toString)
        .orNull}::direktiivitaso,
            direktiivitaso_lisatiedot = ${kelpoisuus.direktiivitasoLisatiedot},
            myonteinen_paatos = ${kelpoisuus.myonteinenPaatos},
            myonteisen_paatoksen_lisavaatimukset = ${Serialization.write(
        kelpoisuus.myonteisenPaatoksenLisavaatimukset.orNull
      )}::jsonb,
            kielteisen_paatoksen_perustelut = ${Serialization.write(
        kelpoisuus.kielteisenPaatoksenPerustelut.orNull
      )}::jsonb,
            muokkaaja = $muokkaaja
          WHERE id = ${kelpoisuus.id.get.toString}::uuid
        """

  def haeKelpoisuudet(paatostietoId: UUID): Seq[Kelpoisuus] = {
    try {
      db.run(
        sql"""
            SELECT id, paatostieto_id, kelpoisuus, opetettava_aine, muu_ammatti_kuvaus,
              direktiivitaso, kansallisesti_vaadittava_direktiivitaso, direktiivitaso_lisatiedot,
              myonteinen_paatos, myonteisen_paatoksen_lisavaatimukset, kielteisen_paatoksen_perustelut,
              luotu, luoja, muokkaaja
            FROM kelpoisuus
            WHERE paatostieto_id = ${paatostietoId.toString}::uuid
            ORDER BY luotu
          """.as[Kelpoisuus],
        "hae_kelpoisuudet"
      )
    } catch {
      case e: Exception =>
        LOG.error(s"Kelpoisuuksien haku epäonnistui: $e")
        throw new RuntimeException(
          s"Kelpoisuuksien haku epäonnistui: ${e.getMessage}",
          e
        )
    }
  }

  private def poistaKelpoisuus(id: UUID): DBIO[Int] =
    sqlu"""
          DELETE FROM kelpoisuus
          WHERE id = ${id.toString}::uuid
        """

  def asetaPaatosPeruutetuksi(hakemusId: UUID, muokkaaja: String) =
    try {
      db.run(
        sql"""
            UPDATE paatos
            SET ratkaisutyyppi =
        ${Ratkaisutyyppi.PeruutusTaiRaukeaminen.toString}::ratkaisutyyppi,
                muokkaaja = $muokkaaja
             WHERE hakemus_id = ${hakemusId.toString}::uuid
           """.asUpdate,
        "aseta_paatos_peruutetuksi"
      )
    } catch {
      case e: Exception =>
        LOG.error(s"Päätöksen asettaminen peruutetuksi epäonnistui: $e")
        throw new RuntimeException(
          s"Päätöksen asettaminen peruutetuksi epäonnistui: ${e.getMessage}",
          e
        )
    }
}
