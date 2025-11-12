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
import scala.util.{Failure, Success, Try}

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
        KasittelyVaihe.fromString(r.nextString()),
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
        muokkaaja = r.nextStringOption()
      )
    )

  /**
   * Tallentaa uuden hakemuksen (palauttaa DBIO-actionin transaktioita varten)
   *
   * @param hakemusOid
   *   hakemuspalvelun hakemuksen oid
   * @return
   *   DBIO action joka palauttaa tallennetun hakemuksen id:n
   */
  def tallennaHakemusAction(
    hakemusOid: HakemusOid,
    hakemusKoskee: Int,
    esittelijaId: Option[UUID],
    asiakirjaId: UUID,
    luoja: String
  ): DBIO[UUID] =
    val hakemusOidString   = hakemusOid.toString
    val esittelijaIdOrNull = esittelijaId.map(_.toString).orNull
    sql"""
      INSERT INTO hakemus (hakemus_oid, hakemus_koskee, esittelija_id, asiakirja_id, luoja)
      VALUES ($hakemusOidString, $hakemusKoskee, $esittelijaIdOrNull::uuid, ${asiakirjaId.toString}::uuid, $luoja)
      RETURNING id
    """.as[UUID].head

  /**
   * Tallentaa uuden hakemuksen
   *
   * @param hakemusOid
   *   hakemuspalvelun hakemuksen oid
   * @return
   *   tallennetun hakemuksen id
   */
  def tallennaHakemus(
    hakemusOid: HakemusOid,
    hakemusKoskee: Int,
    esittelijaId: Option[UUID],
    asiakirjaId: UUID,
    luoja: String
  ): UUID =
    try
      db.run(
        tallennaHakemusAction(hakemusOid, hakemusKoskee, esittelijaId, asiakirjaId, luoja),
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
    userOids: Option[Seq[String]],
    hakemusKoskee: Option[Seq[String]],
    vaiheet: Option[Seq[String]],
    apHakemus: Boolean
  ): Seq[HakemusOid] = {
    try {
      val baseQuery = "SELECT h.hakemus_oid FROM hakemus h"

      val joinClauses = Seq.newBuilder[String]

      userOids.foreach { oid =>
        if (oid.nonEmpty) {
          val oidList = oid.map(o => s"'$o'").mkString(", ")
          joinClauses += s"INNER JOIN esittelija e ON h.esittelija_id = e.id AND e.esittelija_oid IN (${oidList})"
        }
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

      hakemusKoskee.foreach { h =>
        if (h.nonEmpty) {
          val hakemusKoskeeList = h.map(hakemusKoskee => s"'${hakemusKoskee}'").mkString(", ")
          whereClauses += s"h.hakemus_koskee IN (${hakemusKoskeeList})"
        }
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
    val kasittelyVaihe     = partialHakemus.kasittelyVaihe.toString

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
          yhteistutkinto = $yhteistutkinto,
          kasittely_vaihe = $kasittelyVaihe
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
   * Päivittää hakemuksen kokonaan (PUT endpoint).
   * Korvaa kaikki käyttäjän muokattavat kentät.
   * NULL arvo pyynnössä -> NULL tietokantaan.
   *
   * @param hakemusOid
   * hakemuksen oid
   * @param hakemus
   * täysi hakemus-objekti
   * @param muokkaaja
   * muokkaajan oid
   * @return
   * tallennetun hakemuksen oid
   */
  def paivitaTaysiHakemus(
    hakemusOid: HakemusOid,
    hakemus: DbHakemus,
    muokkaaja: String
  ): HakemusOid = {
    val hakemusOidString   = hakemusOid.toString
    val esittelijaIdOrNull = hakemus.esittelijaId.map(_.toString).orNull
    val asiakirjaIdOrNull  = hakemus.asiakirjaId.map(_.toString).orNull
    val asiatunnusOrNull   = hakemus.asiatunnus.orNull
    val hakemusKoskee      = hakemus.hakemusKoskee
    val yhteistutkinto     = hakemus.yhteistutkinto
    val kasittelyVaihe     = hakemus.kasittelyVaihe.toString

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
          yhteistutkinto = $yhteistutkinto,
          kasittely_vaihe = $kasittelyVaihe
        WHERE hakemus_oid = $hakemusOidString
        RETURNING
          hakemus_oid
      """.as[HakemusOid].head,
        "paivita_taysi_hakemus"
      )
    catch {
      case e: Exception =>
        LOG.error(s"Hakemuksen täysi päivitys epäonnistui: ${e}")
        throw new RuntimeException(
          s"Hakemuksen täysi päivitys epäonnistui: ${e.getMessage}",
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
      muokkaaja
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
      modifyData.muutetut.map(t => paivitaTutkinto(t, luojaTaiMuokkaja.toString))
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
        ${nimiOrNull},
        ${oppilaitosOrNull},
        ${aloitusVuosi},
        ${paattymisVuosi},
        ${maakoodiUri},
        ${muuTutkintoTietoOrNull},
        ${todistuksenPaivamaaraOrNull},
        ${koulutusalaKoodiUri},
        ${paaaineTaiErikoisala},
        ${todistusOtsikko},
        ${muuTutkintoMuistioId}::uuid,
        ${ohjeellinenLaajuus},
        ${opinnaytetyo},
        ${harjoittelu},
        ${perustelunLisatietoja},
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
        muokkaaja = ${muokkaaja}
      WHERE id = ${tutkinto.id.get.toString}::uuid
    """

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

  private def paivitaAsiatunnus(hakemusOid: HakemusOid, asiatunnus: String, muokkaaja: String): DBIO[Int] =
    sqlu"""
      UPDATE hakemus
      SET asiatunnus = ${asiatunnus}, muokkaaja = ${muokkaaja}
      WHERE hakemus_oid = ${hakemusOid.toString}
    """

  def suoritaPaivitaAsiatunnus(hakemusOid: HakemusOid, asiatunnus: String, muokkaaja: String): Int = {
    Try {
      db.run(paivitaAsiatunnus(hakemusOid, asiatunnus, muokkaaja), "PaivitaAsiatunnus")
    } match {
      case Success(modified) => modified
      case Failure(e)        =>
        LOG.error(s"Virhe asiatunnuksen päivittämisessä: ${e.getMessage}", e)
        throw new RuntimeException(s"Virhe asiatunnuksen päivittämisessä: ${e.getMessage}", e)
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

  private def paivitaHakemusKoskee(hakemusOid: HakemusOid, hakemusKoskee: Int, muokkaaja: String): DBIO[Int] =
    sqlu"""
        UPDATE hakemus
        SET hakemus_koskee = ${hakemusKoskee}, muokkaaja = ${muokkaaja}
        WHERE hakemus_oid = ${hakemusOid.toString}
      """

  def suoritaPaivitaHakemusKoskee(hakemusOid: HakemusOid, hakemusKoskee: Int, muokkaaja: String): Int = {
    Try {
      db.run(paivitaHakemusKoskee(hakemusOid, hakemusKoskee, muokkaaja), "PaivitaHakemusKoskee")
    } match {
      case Success(modified) => modified
      case Failure(e)        =>
        LOG.error(s"Virhe hakemus koskee-tiedon päivittämisessä: ${e.getMessage}", e)
        throw new RuntimeException(s"Virhe hakemus koskee-tiedon päivittämisessä: ${e.getMessage} ${e.getMessage}", e)
    }
  }
}
