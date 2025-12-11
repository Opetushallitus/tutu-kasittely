package fi.oph.tutu.backend.repository

import fi.oph.tutu.backend.domain.*
import fi.oph.tutu.backend.utils.Constants.DATE_TIME_FORMAT
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.{Component, Repository}
import slick.dbio.DBIO
import slick.jdbc.GetResult
import slick.jdbc.PostgresProfile.api.*

import java.time.format.DateTimeFormatter
import java.time.{ZoneId, ZonedDateTime}
import java.util.UUID
import scala.concurrent.duration.DurationInt
import scala.util.{Failure, Success, Try}

@Component
@Repository
class TutkintoRepository extends BaseResultHandlers {
  @Autowired
  val db: TutuDatabase = null

  final val DB_TIMEOUT = 30.seconds
  val LOG: Logger      = LoggerFactory.getLogger(classOf[HakemusRepository])

  implicit val getTutkintoResult: GetResult[Tutkinto] =
    GetResult(r =>
      Tutkinto(
        id = Option(r.nextString()).filter(_.nonEmpty).map(UUID.fromString),
        hakemusId = UUID.fromString(r.nextString()),
        jarjestys = r.nextString(),
        nimi = r.nextStringOption(),
        oppilaitos = r.nextStringOption(),
        aloitusVuosi = r.nextIntOption(),
        paattymisVuosi = r.nextIntOption(),
        maakoodiUri = r.nextStringOption(),
        muuTutkintoTieto = r.nextStringOption(),
        todistuksenPaivamaara = r.nextStringOption(),
        koulutusalaKoodiUri = r.nextStringOption(),
        paaaaineTaiErikoisala = r.nextStringOption(),
        todistusOtsikko = r.nextStringOption(),
        muuTutkintoMuistioId = Option(r.nextString()).map(UUID.fromString),
        ohjeellinenLaajuus = r.nextStringOption(),
        opinnaytetyo = r.nextBooleanOption(),
        harjoittelu = r.nextBooleanOption(),
        perustelunLisatietoja = r.nextStringOption(),
        muokkaaja = r.nextStringOption(),
        muokattu = Option(r.nextTimestamp()).map(_.toLocalDateTime)
      )
    )

  def lisaaTutkinto(tutkinto: Tutkinto, luoja: String): DBIO[Int] = {
    val hakemusId                   = tutkinto.hakemusId
    val nimiOrNull                  = tutkinto.nimi.filter(_.nonEmpty).orNull
    val oppilaitosOrNull            = tutkinto.oppilaitos.filter(_.nonEmpty).orNull
    val aloitusVuosi                = tutkinto.aloitusVuosi
    val paattymisVuosi              = tutkinto.paattymisVuosi
    val maakoodiUri                 = tutkinto.maakoodiUri.filter(_.nonEmpty).orNull
    val muuTutkintoTietoOrNull      = tutkinto.muuTutkintoTieto.filter(_.nonEmpty).orNull
    val todistuksenPaivamaaraOrNull = tutkinto.todistuksenPaivamaara.filter(_.nonEmpty).orNull
    val koulutusalaKoodiUri         = tutkinto.koulutusalaKoodiUri.filter(_.nonEmpty).orNull
    val paaaineTaiErikoisala        = tutkinto.paaaaineTaiErikoisala.filter(_.nonEmpty).orNull
    val todistusOtsikko             = tutkinto.todistusOtsikko.filter(_.nonEmpty).orNull
    val muuTutkintoMuistioId        = tutkinto.muuTutkintoMuistioId.map(_.toString).orNull
    val ohjeellinenLaajuus          = tutkinto.ohjeellinenLaajuus.filter(_.nonEmpty).orNull
    val opinnaytetyo                = tutkinto.opinnaytetyo
    val harjoittelu                 = tutkinto.harjoittelu
    val perustelunLisatietoja       = tutkinto.perustelunLisatietoja.filter(_.nonEmpty).orNull
    sqlu"""
      INSERT INTO tutkinto (
        hakemus_id,
        jarjestys,
        nimi,
        oppilaitos,
        aloitus_vuosi,
        paattymis_vuosi,
        maakoodiuri,
        muu_tutkinto_tieto,
        todistuksen_paivamaara,
        koulutusala_koodiuri,
        paaaine_tai_erikoisala,
        todistusotsikko,
        muu_tutkinto_muistio_id,
        ohjeellinen_laajuus,
        opinnaytetyo,
        harjoittelu,
        perustelun_lisatietoja,
        luoja
      )
      VALUES (
        ${hakemusId.toString}::uuid,
        ${tutkinto.jarjestys},
        $nimiOrNull,
        $oppilaitosOrNull,
        $aloitusVuosi,
        $paattymisVuosi,
        $maakoodiUri,
        $muuTutkintoTietoOrNull,
        $todistuksenPaivamaaraOrNull,
        $koulutusalaKoodiUri,
        $paaaineTaiErikoisala,
        $todistusOtsikko,
        $muuTutkintoMuistioId::uuid,
        $ohjeellinenLaajuus,
        $opinnaytetyo,
        $harjoittelu,
        $perustelunLisatietoja,
        $luoja
      )
    """
  }

  def suoritaLisaaTutkinto(tutkinto: Tutkinto, luoja: String): Int = {
    try {
      db.run(lisaaTutkinto(tutkinto, luoja), "lisaa_tutkinto")
    } catch {
      case e: Exception =>
        LOG.error(s"Tutkinnon lisääminen epäonnistui: $e")
        throw new RuntimeException(
          s"Tutkinnon lisääminen epäonnistui: ${e.getMessage}",
          e
        )
    }
  }

  def suoritaTutkintojenModifiointi(
    modifyData: TutkintoModifyData,
    luojaTaiMuokkaaja: UserOid
  ): Unit = {
    val actions = modifyData.uudet.map(t => lisaaTutkinto(t, luojaTaiMuokkaaja.toString)) ++
      modifyData.poistetut.map(poistaTutkinto) ++
      modifyData.muutetut.map(t => paivitaTutkinto(t, luojaTaiMuokkaaja.toString))
    val combined = db.combineIntDBIOs(actions)
    db.runTransactionally(combined, "suorita_tutkintojen_modifiointi") match {
      case Success(_) => ()
      case Failure(e) =>
        LOG.error(s"Virhe tutkintojen modifioinnissa: ${e.getMessage}", e)
        throw new RuntimeException(s"Virhe tutkintojen modifioinnissa: ${e.getMessage}", e)
    }
  }

  def suoritaPaivitaTutkinto(tutkinto: Tutkinto, muokkaaja: String): Int = {
    Try {
      db.run(paivitaTutkinto(tutkinto, muokkaaja), "PaivitaTutkinto")
    } match {
      case Success(modified) => modified
      case Failure(e)        =>
        LOG.error(s"Virhe tutkinnon päivittämisessä: ${e.getMessage}", e)
        throw new RuntimeException(s"Virhe tutkinnon päivittämisessä: ${e.getMessage}", e)
    }
  }

  /**
   * Poistaa hakemuksen tutkinnon
   *
   * @param id
   * tutkinnon id
   */
  private def poistaTutkinto(
    id: UUID
  ): DBIO[Int] =
    sqlu"""
      DELETE FROM tutkinto
      WHERE id = ${id.toString}::uuid
    """

  def suoritaPoistaTutkinto(id: UUID): Int = {
    try {
      db.run(poistaTutkinto(id), "poista_tutkinto")
    } catch {
      case e: Exception =>
        LOG.error(s"Tutkinnon lisääminen epäonnistui: $e")
        throw new RuntimeException(
          s"Tutkinnon lisääminen epäonnistui: ${e.getMessage}",
          e
        )
    }
  }

  /**
   * Päivittää hakemuksen tutkinnon
   *
   * @param tutkinto
   * muokattava tutkinto
   * @param muokkaaja
   * päivittävän virkailijan oid
   */
  private def paivitaTutkinto(
    tutkinto: Tutkinto,
    muokkaaja: String
  ): DBIO[Int] =
    sqlu"""
      UPDATE tutkinto
      SET
        jarjestys = ${tutkinto.jarjestys},
        nimi = ${tutkinto.nimi.filter(_.nonEmpty).orNull},
        oppilaitos = ${tutkinto.oppilaitos.filter(_.nonEmpty).orNull},
        aloitus_vuosi = ${tutkinto.aloitusVuosi},
        paattymis_vuosi = ${tutkinto.paattymisVuosi},
        maakoodiuri = ${tutkinto.maakoodiUri.filter(_.nonEmpty).orNull},
        muu_tutkinto_tieto = ${tutkinto.muuTutkintoTieto.filter(_.nonEmpty).orNull},
        todistuksen_paivamaara = ${tutkinto.todistuksenPaivamaara.filter(_.nonEmpty).orNull},
        koulutusala_koodiuri = ${tutkinto.koulutusalaKoodiUri.filter(_.nonEmpty).orNull},
        paaaine_tai_erikoisala = ${tutkinto.paaaaineTaiErikoisala.filter(_.nonEmpty).orNull},
        todistusotsikko = ${tutkinto.todistusOtsikko.filter(_.nonEmpty).orNull},
        muu_tutkinto_muistio_id = ${tutkinto.muuTutkintoMuistioId.map(_.toString).orNull}::uuid,
        ohjeellinen_laajuus = ${tutkinto.ohjeellinenLaajuus.filter(_.nonEmpty).orNull},
        opinnaytetyo = ${tutkinto.opinnaytetyo},
        harjoittelu = ${tutkinto.harjoittelu},
        perustelun_lisatietoja = ${tutkinto.perustelunLisatietoja.filter(_.nonEmpty).orNull},
        muokkaaja = $muokkaaja
      WHERE id = ${tutkinto.id.get.toString}::uuid
    """

  /**
   * Hakee hakemuksen tutkinnot
   *
   * @param hakemusOid
   * hakemuksen Oid
   * @return
   * hakemuksen tutkinnot
   */
  def haeTutkinnotHakemusOidilla(hakemusOid: HakemusOid): Seq[Tutkinto] = {
    try
      db.run(
        sql"""
    SELECT
      id,
      hakemus_id,
      jarjestys,
      nimi,
      oppilaitos,
      aloitus_vuosi,
      paattymis_vuosi,
      maakoodiuri,
      muu_tutkinto_tieto,
      todistuksen_paivamaara,
      koulutusala_koodiuri,
      paaaine_tai_erikoisala,
      todistusotsikko,
      muu_tutkinto_muistio_id,
      ohjeellinen_laajuus,
      opinnaytetyo,
      harjoittelu,
      perustelun_lisatietoja,
      muokkaaja,
      muokattu
    FROM tutkinto
    WHERE hakemus_id IN
      (SELECT id FROM hakemus where hakemus_oid = ${hakemusOid.toString})
    ORDER BY jarjestys ASC
  """
          .as[Tutkinto],
        "hae_tutkinnot_hakemus_oidlla"
      )
    catch {
      case e: Exception =>
        LOG.error(s"Tutkintojen haku hakemusOid:lla $hakemusOid epäonnistui: $e")
        throw new RuntimeException(
          s"Tutkintojen haku epäonnistui: ${e.getMessage}",
          e
        )
    }
  }

  def haeTutkintoIdlla(tutkintoId: UUID): Option[Tutkinto] = {
    try
      db.run(
        sql"""
        SELECT
          id,
          hakemus_id,
          jarjestys,
          nimi,
          oppilaitos,
          aloitus_vuosi,
          paattymis_vuosi,
          maakoodiuri,
          muu_tutkinto_tieto,
          todistuksen_paivamaara,
          koulutusala_koodiuri,
          paaaine_tai_erikoisala,
          todistusotsikko,
          muu_tutkinto_muistio_id,
          ohjeellinen_laajuus,
          opinnaytetyo,
          harjoittelu,
          perustelun_lisatietoja,
          muokkaaja,
          muokattu
        FROM tutkinto
        WHERE id = ${tutkintoId.toString}::uuid
      """
          .as[Tutkinto],
        "hae_tutkinto_idlla"
      ).headOption
    catch {
      case e: Exception =>
        LOG.error(s"Tutkinnon haku id:lla $tutkintoId epäonnistui: $e")
        throw new RuntimeException(
          s"Tutkinnon haku epäonnistui: ${e.getMessage}",
          e
        )
    }
  }
}
