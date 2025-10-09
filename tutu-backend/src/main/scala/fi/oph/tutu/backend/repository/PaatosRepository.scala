package fi.oph.tutu.backend.repository

import fi.oph.tutu.backend.domain.*
import org.json4s.jackson.Serialization
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
class PaatosRepository extends BaseResultHandlers {
  @Autowired
  val db: TutuDatabase = null
  val LOG: Logger      = LoggerFactory.getLogger(classOf[PaatosRepository])

  final val DB_TIMEOUT = 30.seconds

  private def mapFromTextArray(dbValue: Option[String]): Option[Seq[String]] =
    dbValue.map(_.replaceAll("[{}\"]", "").split(",").map(_.trim).toSeq)

  private def mapToTextArray(scalaValue: Option[Seq[String]]): Option[String] =
    scalaValue.map(_.mkString("{", ",", "}"))

  implicit val getPaatosResult: GetResult[Paatos] = GetResult(r =>
    Paatos(
      id = Some(r.nextObject().asInstanceOf[UUID]),
      hakemusId = Some(r.nextObject().asInstanceOf[UUID]),
      ratkaisutyyppi = Option(Ratkaisutyyppi.fromString(r.nextString())),
      seutArviointi = r.nextBoolean(),
      peruutuksenTaiRaukeamisenSyy = Option(Serialization.read[PeruutuksenTaiRaukeamisenSyy](r.nextString())),
      luotu = Some(r.nextTimestamp().toLocalDateTime),
      luoja = Some(r.nextString()),
      muokattu = r.nextTimestampOption().map(_.toLocalDateTime),
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
      lisaaTutkintoPaatostekstiin = Option(r.nextBoolean()),
      myonteinenPaatos = Option(r.nextBoolean()),
      myonteisenPaatoksenLisavaatimukset = r.nextStringOption(),
      kielteisenPaatoksenPerustelut = r.nextStringOption(),
      tutkintoTaso = Option(TutkintoTaso.fromString(r.nextString())),
      rinnastettavatTutkinnotTaiOpinnot = mapFromTextArray(r.nextStringOption()),
      luotu = Some(r.nextTimestamp().toLocalDateTime),
      luoja = Some(r.nextString()),
      muokattu = r.nextTimestampOption().map(_.toLocalDateTime),
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
      INSERT INTO paatos (hakemus_id, ratkaisutyyppi, seut_arviointi_tehty, peruutus_tai_raukeaminen_lisatiedot, luoja)
      VALUES (${hakemusId.toString}::uuid, $ratkaisutyyppiOrNull::ratkaisutyyppi, ${paatos.seutArviointi},
        $peruutuksenTaiRaukeamisenSyyJson::jsonb, $luojaTaiMuokkaaja)
      ON CONFLICT (hakemus_id)
      DO UPDATE SET
        ratkaisutyyppi = $ratkaisutyyppiOrNull::ratkaisutyyppi,
        seut_arviointi_tehty = ${paatos.seutArviointi},
        peruutus_tai_raukeaminen_lisatiedot = $peruutuksenTaiRaukeamisenSyyJson::jsonb,
        muokkaaja = $luojaTaiMuokkaaja
      RETURNING id, hakemus_id, ratkaisutyyppi, seut_arviointi_tehty,
        peruutus_tai_raukeaminen_lisatiedot, luotu, luoja, muokattu, muokkaaja
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
        SELECT id, hakemus_id, ratkaisutyyppi, seut_arviointi_tehty, peruutus_tai_raukeaminen_lisatiedot, luotu, luoja, muokattu, muokkaaja
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
   * @param perusteluId
   * vastaavan perustelun uuid
   * @param modifyData
   * päätöstietojen muokkaustiedot
   * @param luojaTaiMuokkaaja
   * pyynnön luoja tai muokkaaja
   */
  def suoritaPaatosTietojenModifiointi(
    perusteluId: UUID,
    modifyData: PaatosTietoModifyData,
    luojaTaiMuokkaaja: String
  ): Unit = {
    val actions = modifyData.uudet.map(pt => lisaaPaatosTieto(perusteluId, pt, luojaTaiMuokkaaja)) ++
      modifyData.muutetut.map(pt => paivitaPaatosTieto(pt, luojaTaiMuokkaaja)) ++
      modifyData.poistetut.map(poistaPaatosTieto)
    val combined = db.combineIntDBIOs(actions)
    db.runTransactionally(combined, "suorita_paatostietojen_modifiointi") match {
      case Success(_) => ()
      case Failure(e) =>
        LOG.error(s"Virhe paatostietojen modifioinnissa: ${e.getMessage}", e)
        throw new RuntimeException(s"Virhe paatostietojen modifioinnissa: ${e.getMessage}", e)
    }
  }

  def lisaaPaatosTieto(paatosId: UUID, paatosTieto: PaatosTieto, luoja: String): DBIO[Int] =
    sqlu"""
        INSERT INTO paatostieto (
                                  paatos_id, 
                                  paatostyyppi, 
                                  sovellettulaki, 
                                  tutkinto_id, 
                                  lisaa_tutkinto_paatostekstiin, 
                                  myonteinen_paatos, 
                                  myonteisen_paatoksen_lisavaatimukset, 
                                  kielteisen_paatoksen_perustelut, 
                                  tutkintotaso, 
                                  rinnastettavat_tutkinnot_tai_opinnot, 
                                  luoja
                                )
        VALUES (
          ${paatosId.toString}::uuid,
          ${paatosTieto.paatosTyyppi.map(_.toString).orNull}::paatostyyppi,
          ${paatosTieto.sovellettuLaki.map(_.toString).orNull}::sovellettulaki,
          ${paatosTieto.tutkintoId.map(_.toString).orNull}::uuid,
          ${paatosTieto.lisaaTutkintoPaatostekstiin}::boolean,
          ${paatosTieto.myonteinenPaatos}::boolean,
          ${paatosTieto.myonteisenPaatoksenLisavaatimukset}::jsonb,
          ${paatosTieto.kielteisenPaatoksenPerustelut}::jsonb,
          ${paatosTieto.tutkintoTaso.map(_.toString).orNull}::tutkintotaso,
          ${mapToTextArray(paatosTieto.rinnastettavatTutkinnotTaiOpinnot)}::text[],
          $luoja
        )"""

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
          myonteisen_paatoksen_lisavaatimukset = ${paatosTieto.myonteisenPaatoksenLisavaatimukset}::jsonb,
          kielteisen_paatoksen_perustelut = ${paatosTieto.kielteisenPaatoksenPerustelut}::jsonb,
          tutkintotaso = ${paatosTieto.tutkintoTaso.map(_.toString).orNull}::tutkintotaso,
          rinnastettavat_tutkinnot_tai_opinnot = ${mapToTextArray(
        paatosTieto.rinnastettavatTutkinnotTaiOpinnot
      )}::text[],
          muokkaaja = $muokkaaja
        WHERE id = ${paatosTieto.id.get.toString}::uuid
      """

  def haePaatosTiedot(paatosId: UUID): Seq[PaatosTieto] = {
    try {
      db.run(
        sql"""
          SELECT *
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
}
