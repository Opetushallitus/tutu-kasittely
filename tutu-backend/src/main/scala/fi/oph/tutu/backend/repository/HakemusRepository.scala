package fi.oph.tutu.backend.repository

import fi.oph.tutu.backend.domain.*
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.{Component, Repository}
import slick.dbio.DBIO
import slick.jdbc.GetResult
import slick.jdbc.PostgresProfile.api.*

import java.util.UUID
import scala.util.{Failure, Success}
import scala.concurrent.duration.DurationInt

@Component
@Repository
class HakemusRepository extends BaseResultHandlers {
  @Autowired
  val db: TutuDatabase = null

  final val DB_TIMEOUT = 30.seconds
  val LOG: Logger      = LoggerFactory.getLogger(classOf[HakemusRepository])

  implicit val getHakemusOidResult: GetResult[HakemusOid] =
    GetResult(r => HakemusOid(r.nextString()))

  implicit val getHakemusResult: GetResult[DbHakemus] =
    GetResult(r =>
      DbHakemus(
        UUID.fromString(r.nextString()),
        HakemusOid(r.nextString()),
        r.nextInt(),
        Option(r.nextString()).map(UUID.fromString),
        Option(UserOid(r.nextString())),
        Option(r.nextString()).map(UUID.fromString),
        Option(r.nextString()),
        KasittelyVaihe.fromString(r.nextString()),
        Option(r.nextTimestamp()).map(_.toLocalDateTime),
        r.nextBoolean()
      )
    )

  implicit val getHakemusListItemResult: GetResult[HakemusListItem] =
    GetResult(r =>
      HakemusListItem(
        null,
        null,
        r.nextString(),
        r.nextInt(),
        Option(r.nextString()),
        Option(r.nextString()),
        null,
        null,
        r.nextString(),
        Option(r.nextString()),
        null,
        Option(r.nextBoolean()),
        Option(r.nextString())
      )
    )

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
        maakoodi = r.nextStringOption(),
        muuTutkintoTieto = r.nextStringOption(),
        todistuksenPaivamaara = r.nextStringOption(),
        koulutusalaKoodi = r.nextStringOption(),
        paaaaineTaiErikoisala = r.nextStringOption(),
        todistusOtsikko = r.nextStringOption(),
        muuTutkintoMuistioId = Option(r.nextString()).filter(_.nonEmpty).map(UUID.fromString)
      )
    )

  /**
   * Tallentaa uuden hakemuksen
   *
   * @param hakemusOid
   *   hakemuspalvelun hakemuksen oid
   * @return
   *   tallennetun hakemuksen id
   */
  def tallennaHakemus(hakemusOid: HakemusOid, hakemusKoskee: Int, esittelijaId: Option[UUID], luoja: String): UUID =
    val hakemusOidString   = hakemusOid.toString
    val esittelijaIdOrNull = esittelijaId.map(_.toString).orNull
    try
      db.run(
        sql"""
      INSERT INTO hakemus (hakemus_oid, hakemus_koskee, esittelija_id, luoja)
      VALUES ($hakemusOidString, $hakemusKoskee, ${esittelijaIdOrNull}::uuid, $luoja)
      RETURNING id
    """.as[UUID].head,
        "tallenna_hakemus"
      )
    catch {
      case e: Exception =>
        LOG.error(s"Hakemuksen tallennus epäonnistui: ${e}")
        throw new RuntimeException(
          s"Hakemuksen tallennus epäonnistui: ${e.getMessage}",
          e
        )
    }

  /**
   * Palauttaa listan hakemuksista hakemusOid-listan pohjalta
   * - Palautettavien kenttien listaa täydennettävä sitä mukaa
   *   kun domain-luokka kasvaa
   *
   * @param hakemusOidit
   *   hakemuspalvelun hakemusten oidit
   *
   * @return
   *   HakemusOid-listan mukaiset hakemukset tietoineen
   */
  def haeHakemusLista(hakemusOidt: Seq[HakemusOid]): Seq[HakemusListItem] = {
    try {
      val oidt = hakemusOidt.map(oid => s"'${oid.s}'").mkString(", ")
      db.run(
        sql"""
            SELECT
              h.hakemus_oid, h.hakemus_koskee, e.esittelija_oid, h.asiatunnus, h.kasittely_vaihe, h.muokattu, a.ap_hakemus, a.viimeinen_asiakirja_hakijalta
            FROM
              hakemus h
            LEFT JOIN esittelija e on e.id = h.esittelija_id
            LEFT JOIN asiakirja a on a.id = h.asiakirja_id
            WHERE
              h.hakemus_oid IN (#$oidt)
            """.as[HakemusListItem],
        "hae_hakemukset"
      )
    } catch {
      case e: Exception =>
        throw new RuntimeException(
          s"Hakemuksien listaus epäonnistui: ${e.getMessage}",
          e
        )
    }
  }

  /**
   * Palauttaa yksittäisen hakemuksen
   *
   * @param hakemusOid
   * hakemuksen oid
   * @return
   * hakemuksen
   */
  def haeHakemus(hakemusOid: HakemusOid): Option[DbHakemus] = {
    try {
      db.run(
        sql"""
            SELECT
              h.id,
              h.hakemus_oid,
              h.hakemus_koskee,
              h.esittelija_id,
              e.esittelija_oid,
              h.asiakirja_id,
              h.asiatunnus,
              h.kasittely_vaihe,
              h.muokattu,
              h.yhteistutkinto
            FROM
              hakemus h
            LEFT JOIN esittelija e on e.id = h.esittelija_id
            WHERE
              h.hakemus_oid = ${hakemusOid.s}
          """.as[DbHakemus].headOption,
        "hae_hakemus"
      )
    } catch {
      case e: Exception =>
        throw new RuntimeException(
          s"Hakemuksen haku epäonnistui: ${e.getMessage}",
          e
        )
    }
  }

  /**
   * PLACEHOLDER TOTEUTUS, KUNNES ElasticSearch-HAKU TOTEUTETTU
   *
   * @param userOid
   * esittelijän oid
   * @param hakemusKoskee
   * hakemuspalvelun hakemuksen syy
   * @param vaiheet
   * tutu-hakemuksen käsittelyvaiheet
   * @return
   * hakuehtojen mukaisten hakemusten Oid:t
   */
  def haeHakemusOidit(
    userOid: Option[String],
    hakemusKoskee: Option[String],
    vaiheet: Option[Seq[String]],
    apHakemus: Boolean
  ): Seq[HakemusOid] = {
    try {
      val baseQuery = "SELECT h.hakemus_oid FROM hakemus h"

      val joinClauses = Seq.newBuilder[String]
      userOid.foreach { oid =>
        joinClauses += s"INNER JOIN esittelija e ON h.esittelija_id = e.id AND e.esittelija_oid = '${oid}'"
      }
      if (apHakemus) {
        joinClauses += "INNER JOIN asiakirja a ON h.asiakirja_id = a.id AND a.ap_hakemus = true"
      }
      val joinClause = {
        val clauses = joinClauses.result()
        if (clauses.isEmpty) ""
        else " " + clauses.mkString(" ")
      }

      val whereClauses = Seq.newBuilder[String]

      hakemusKoskee.foreach { s =>
        whereClauses += s"h.hakemus_koskee = ${s.toInt}"
      }

      vaiheet.foreach { v =>
        if (v.nonEmpty) {
          val vaiheList = v.map(vaihe => s"'${vaihe}'").mkString(", ")
          whereClauses += s"h.kasittely_vaihe IN (${vaiheList})"
        }
      }

      val whereClause = {
        val clauses = whereClauses.result()
        if (clauses.isEmpty) ""
        else " WHERE " + clauses.mkString(" AND ")
      }

      val fullQuery = baseQuery + joinClause + whereClause

      LOG.debug(fullQuery)

      db.run(
        sql"""#$fullQuery""".as[HakemusOid],
        "hae_hakemus_oidt"
      )
    } catch {
      case e: Exception =>
        throw new RuntimeException(
          s"HakemusOidien listaus epäonnistui: ${e.getMessage}",
          e
        )
    }
  }

  /**
   * Päivittää osan hakemuksesta
   *
   * @param hakemusOid
   * hakemuksen oid
   * @param hakemusKoskee
   * hakemus koskee -koodi
   * @param esittelijaId
   * esittelijän id
   * @param asiatunnus
   * asiatunnus
   * @param muokkaaja
   * muokkaajan oid
   * @return
   * tallennetun hakemuksen id
   */
  def paivitaPartialHakemus(
    hakemusOid: HakemusOid,
    partialHakemus: DbHakemus,
    muokkaaja: String
  ): HakemusOid = {
    val hakemusOidString   = hakemusOid.toString
    val esittelijaIdOrNull = partialHakemus.esittelijaId.map(_.toString).orNull
    val asiakirjaIdOrNull  = partialHakemus.asiakirjaId.map(_.toString).orNull
    val asiatunnusOrNull   = partialHakemus.asiatunnus.map(identity).orNull
    val hakemusKoskee      = partialHakemus.hakemusKoskee
    val yhteistutkinto     = partialHakemus.yhteistutkinto

    try
      db.run(
        sql"""
        UPDATE hakemus
        SET
          hakemus_koskee = $hakemusKoskee,
          esittelija_id = $esittelijaIdOrNull::uuid,
          asiakirja_id = $asiakirjaIdOrNull::uuid,
          asiatunnus = $asiatunnusOrNull,
          muokkaaja = $muokkaaja,
          yhteistutkinto = $yhteistutkinto
        WHERE hakemus_oid = $hakemusOidString
        RETURNING
          hakemus_oid
      """.as[HakemusOid].head,
        "paivita_hakemus"
      )
    catch {
      case e: Exception =>
        LOG.error(s"Hakemuksen päivitus epäonnistui: ${e}")
        throw new RuntimeException(
          s"Hakemuksen päivitys epäonnistui: ${e.getMessage}",
          e
        )
    }
  }

  /**
   * Hakee hakemuksen tutkinnot
   *
   * @param hakemusId
   * hakemuksen Id
   * @return
   * hakemuksen tutkinnot
   */
  def haeTutkinnotHakemusIdilla(hakemusId: UUID): Seq[Tutkinto] = {
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
      maakoodi,
      muu_tutkinto_tieto,
      todistuksen_paivamaara,
      koulutusala_koodi,
      paaaine_tai_erikoisala,
      todistusotsikko,
      muu_tutkinto_muistio_id
    FROM tutkinto
    WHERE hakemus_id = ${hakemusId.toString}::uuid
    ORDER BY jarjestys ASC
  """
          .as[Tutkinto],
        "hae_tutkinnot_hakemus_idlla"
      )
    catch {
      case e: Exception =>
        LOG.error(s"Tutkintojen haku hakemusId:llä $hakemusId epäonnistui: ${e}")
        throw new RuntimeException(
          s"Tutkintojen haku epäonnistui: ${e.getMessage}",
          e
        )
    }
  }

  def suoritaTutkintojenModifiointi(
    hakemusId: UUID,
    modifyData: TutkintoModifyData,
    luojaTaiMuokkaja: UserOid
  ): Unit = {
    val actions = modifyData.uudet.map(t => lisaaTutkinto(hakemusId, t, luojaTaiMuokkaja.toString)) ++
      modifyData.poistetut.map(poistaTutkinto) ++
      modifyData.muutetut.map(t => paivitaTutkinto(t, luojaTaiMuokkaja))
    val combined = db.combineIntDBIOs(actions)
    db.runTransactionally(combined, "suorita_tutkintojen_modifiointi") match {
      case Success(_) => ()
      case Failure(e) =>
        LOG.error(s"Virhe tutkintojen modifioinnissa: ${e.getMessage}", e)
        throw new RuntimeException(s"Virhe tutkintojen modifioinnissa: ${e.getMessage}", e)
    }
  }

  def lisaaTutkintoSeparately(hakemusId: UUID, tutkinto: Tutkinto, luoja: String): Unit = {
    try {
      db.run(lisaaTutkinto(hakemusId, tutkinto, luoja), "lisaa_tutkinto")
    } catch {
      case e: Exception =>
        LOG.error(s"Tutkinnon lisääminen epäonnistui: ${e}")
        throw new RuntimeException(
          s"Tutkinnon lisääminen epäonnistui: ${e.getMessage}",
          e
        )
    }
  }

  def lisaaTutkinto(hakemusId: UUID, tutkinto: Tutkinto, luoja: String): DBIO[Int] = {
    val nimiOrNull                  = tutkinto.nimi.map(identity).orNull
    val oppilaitosOrNull            = tutkinto.oppilaitos.map(identity).orNull
    val aloitusVuosi                = tutkinto.aloitusVuosi
    val paattymisVuosi              = tutkinto.paattymisVuosi
    val maakoodi                    = tutkinto.maakoodi
    val muuTutkintoTietoOrNull      = tutkinto.muuTutkintoTieto.map(identity).orNull
    val todistuksenPaivamaaraOrNull = tutkinto.todistuksenPaivamaara.map(identity).orNull
    val koulutusalaKoodi            = tutkinto.koulutusalaKoodi
    val paaaineTaiErikoisala        = tutkinto.paaaaineTaiErikoisala.map(identity).orNull
    val todistusOtsikko             = tutkinto.todistusOtsikko.map(identity).orNull
    val muuTutkintoMuistioId        = tutkinto.muuTutkintoMuistioId.map(_.toString).orNull
    sqlu"""
      INSERT INTO tutkinto (
        hakemus_id,
        jarjestys,
        nimi,
        oppilaitos,
        aloitus_vuosi,
        paattymis_vuosi,
        maakoodi,
        muu_tutkinto_tieto,
        todistuksen_paivamaara,
        koulutusala_koodi,
        paaaine_tai_erikoisala,
        todistusotsikko,
        muu_tutkinto_muistio_id,
        luoja
      )
      VALUES (
        ${hakemusId.toString}::uuid,
        ${tutkinto.jarjestys},
        ${nimiOrNull},
        ${oppilaitosOrNull},
        ${aloitusVuosi},
        ${paattymisVuosi},
        ${maakoodi},
        ${muuTutkintoTietoOrNull},
        ${todistuksenPaivamaaraOrNull},
        ${koulutusalaKoodi},
        ${paaaineTaiErikoisala},
        ${todistusOtsikko},
        ${muuTutkintoMuistioId}::uuid,
        $luoja
      )
    """
  }

  /**
   * Päivittää hakemuksen tutkinnon
   *
   * @param tutkinto
   * muokattava tutkinto
   * @param virkailijaOid
   * päivittävän virkailijan oid
   */
  def paivitaTutkinto(
    tutkinto: Tutkinto,
    muokkaaja: UserOid
  ): DBIO[Int] =
    sqlu"""
      UPDATE tutkinto
      SET
        jarjestys = ${tutkinto.jarjestys},
        nimi = ${tutkinto.nimi.orNull},
        oppilaitos = ${tutkinto.oppilaitos.orNull},
        aloitus_vuosi = ${tutkinto.aloitusVuosi},
        paattymis_vuosi = ${tutkinto.paattymisVuosi},
        maakoodi = ${tutkinto.maakoodi},
        muu_tutkinto_tieto = ${tutkinto.muuTutkintoTieto},
        todistuksen_paivamaara = ${tutkinto.todistuksenPaivamaara},
        koulutusala_koodi = ${tutkinto.koulutusalaKoodi},
        paaaine_tai_erikoisala = ${tutkinto.paaaaineTaiErikoisala.orNull},
        todistusotsikko = ${tutkinto.todistusOtsikko.orNull},
        muu_tutkinto_muistio_id = ${tutkinto.muuTutkintoMuistioId.map(_.toString).orNull}::uuid,
        muokkaaja = ${muokkaaja.toString}
      WHERE id = ${tutkinto.id.get.toString}::uuid
    """

  /**
   * Poistaa hakemuksen tutkinnon
   *
   * @param id
   * tutkinnon id
   */
  def poistaTutkinto(
    id: UUID
  ): DBIO[Int] =
    sqlu"""
      DELETE FROM tutkinto
      WHERE id = ${id.toString}::uuid
    """
}
