package fi.oph.tutu.backend.repository

import fi.oph.tutu.backend.domain.*
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.{Component, Repository}
import slick.dbio.DBIO
import slick.jdbc.GetResult
import slick.jdbc.PostgresProfile.api.*
import scala.concurrent.ExecutionContext.Implicits.global

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
        id = UUID.fromString(r.nextString()),
        hakemusOid = HakemusOid(r.nextString()),
        hakemusKoskee = r.nextInt(),
        formId = r.nextLong(),
        esittelijaId = r.nextStringOption().map(UUID.fromString),
        esittelijaOid = r.nextStringOption().map(UserOid(_)),
        asiakirjaId = r.nextStringOption().map(UUID.fromString),
        asiatunnus = r.nextStringOption(),
        kasittelyVaihe = KasittelyVaihe.fromString(r.nextString()),
        muokattu = Option(r.nextTimestamp()).map(_.toLocalDateTime),
        yhteistutkinto = r.nextBoolean(),
        lopullinenPaatosVastaavaEhdollinenAsiatunnus = r.nextStringOption(),
        lopullinenPaatosVastaavaEhdollinenSuoritusmaaKoodiUri = r.nextStringOption(),
        esittelijanHuomioita = r.nextStringOption(),
        muokkaaja = r.nextStringOption(),
        onkoPeruutettu = r.nextBoolean(),
        peruutusPvm = Option(r.nextTimestamp()).map(_.toLocalDateTime),
        peruutusLisatieto = r.nextStringOption(),
        viimeisinTaydennyspyyntoPvm = Option(r.nextTimestamp()).map(_.toLocalDateTime),
        saapumisPvm = Option(r.nextTimestamp()).map(_.toLocalDateTime),
        ataruHakemusMuokattu = Option(r.nextTimestamp()).map(_.toLocalDateTime),
        hakijaEtunimet = r.nextStringOption(),
        hakijaSukunimi = r.nextStringOption()
      )
    )

  implicit val getHakemusListItemResult: GetResult[HakemusListItem] =
    GetResult(r =>
      HakemusListItem(
        hakija = r.nextStringOption().getOrElse(""),
        saapumisPvm = Option(r.nextTimestamp()).map(_.toLocalDateTime),
        hakemusOid = r.nextString(),
        hakemusKoskee = r.nextInt(),
        esittelijaOid = r.nextStringOption(),
        asiatunnus = r.nextStringOption(),
        esittelijaKutsumanimi = r.nextStringOption().orNull,
        esittelijaSukunimi = r.nextStringOption().orNull,
        kasittelyVaihe = KasittelyVaihe.fromString(r.nextString()),
        muokattu = Option(r.nextTimestamp()).map(_.toLocalDateTime),
        taydennyspyyntoLahetetty = Option(r.nextTimestamp()).map(_.toLocalDateTime),
        ataruHakemustaMuokattu = Option(r.nextTimestamp()).map(_.toLocalDateTime),
        apHakemus = Option(r.nextBoolean()),
        viimeinenAsiakirjaHakijalta = Option(r.nextTimestamp()).map(_.toLocalDateTime),
        onkoPeruutettu = Option(r.nextBoolean())
      )
    )

  implicit val getYkViestiListItemResult: GetResult[YkViestiListItem] =
    GetResult(r =>
      YkViestiListItem(
        id = r.nextObject().asInstanceOf[UUID],
        hakemusId = r.nextObject().asInstanceOf[UUID],
        asiatunnus = Option(r.nextString()),
        hakemusOid = HakemusOid(r.nextString()),
        lahettajaOid = Option(r.nextString()),
        vastaanottajaOid = Option(r.nextString()),
        luotu = Some(r.nextTimestamp().toLocalDateTime),
        luettu = r.nextTimestampOption().map(_.toLocalDateTime),
        viesti = Option(r.nextString()),
        vastaus = Option(r.nextString())
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
    formId: Long,
    esittelijaId: Option[UUID],
    asiakirjaId: UUID,
    lopullinenPaatosVastaavaEhdollinenAsiatunnus: Option[String],
    lopullinenPaatosVastaavaEhdollinenSuoritusmaaKoodiUri: Option[String],
    luoja: String,
    saapumisPvm: Option[java.sql.Timestamp] = None,
    ataruHakemusMuokattu: Option[java.sql.Timestamp] = None,
    hakijaEtunimet: Option[String] = None,
    hakijaSukunimi: Option[String] = None,
    viimeisinTaydennyspyyntoPvm: Option[java.sql.Timestamp] = None
  ): DBIO[UUID] =
    val hakemusOidString                                   = hakemusOid.toString
    val esittelijaIdOrNull                                 = esittelijaId.map(_.toString).orNull
    val lopullinenPaatosVastaavaEhdollinenAsiatunnusOrNull =
      lopullinenPaatosVastaavaEhdollinenAsiatunnus.orNull
    val lopullinenPaatosVastaavaEhdollinenSuoritusmaaKoodiUriOrNull =
      lopullinenPaatosVastaavaEhdollinenSuoritusmaaKoodiUri.orNull
    val saapumisPvmOrNull                 = saapumisPvm.orNull
    val ataruHakemusMuokattuOrNull        = ataruHakemusMuokattu.orNull
    val hakijaEtunimetOrNull              = hakijaEtunimet.orNull
    val hakijaSukunimiOrNull              = hakijaSukunimi.orNull
    val viimeisinTaydennyspyyntoPvmOrNull = viimeisinTaydennyspyyntoPvm.orNull

    sql"""
      INSERT INTO hakemus (hakemus_oid, hakemus_koskee, form_id, esittelija_id,
        asiakirja_id, lopullinen_paatos_ehdollisen_asiatunnus,
        lopullinen_paatos_tutkinnon_suoritus_maakoodiuri, luoja,
        saapumis_pvm, ataru_hakemus_muokattu, hakija_etunimet, hakija_sukunimi,
        viimeisin_taydennyspyynto_paiva)
      VALUES ($hakemusOidString, $hakemusKoskee, $formId, $esittelijaIdOrNull::uuid, ${asiakirjaId.toString}::uuid,
        $lopullinenPaatosVastaavaEhdollinenAsiatunnusOrNull,
        $lopullinenPaatosVastaavaEhdollinenSuoritusmaaKoodiUriOrNull, $luoja,
        $saapumisPvmOrNull, $ataruHakemusMuokattuOrNull, $hakijaEtunimetOrNull, $hakijaSukunimiOrNull,
        $viimeisinTaydennyspyyntoPvmOrNull)
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
    formId: Long,
    esittelijaId: Option[UUID],
    asiakirjaId: UUID,
    lopullinenPaatosVastaavaEhdollinenAsiatunnus: Option[String],
    lopullinenPaatosVastaavaEhdollinenSuoritusmaaKoodiUri: Option[String],
    luoja: String
  ): UUID =
    try
      db.run(
        tallennaHakemusAction(
          hakemusOid,
          hakemusKoskee,
          formId,
          esittelijaId,
          asiakirjaId,
          lopullinenPaatosVastaavaEhdollinenAsiatunnus,
          lopullinenPaatosVastaavaEhdollinenSuoritusmaaKoodiUri,
          luoja
        ),
        "tallenna_hakemus"
      )
    catch {
      case e: Exception =>
        LOG.error(s"Hakemuksen tallennus epäonnistui: $e")
        throw new RuntimeException(
          s"Hakemuksen tallennus epäonnistui: ${e.getMessage}",
          e
        )
    }

  def haeHakemusLista(
    userOids: Seq[String],
    hakemusKoskee: Seq[Int],
    vaiheet: Seq[String],
    apHakemus: Boolean,
    sortParam: Option[ListSortParam],
    page: Int,
    pageSize: Int
  ): (Seq[HakemusListItem], Long) = {
    try {
      val whereClauses = Seq.newBuilder[String]

      // Yhdistetään ehdot sillä jos ap_hakemus, niin kannassa on hakemus_koskee=1
      if (hakemusKoskee.nonEmpty || apHakemus) {
        val list  = hakemusKoskee.mkString(", ")
        val ehdot = List(
          Option.when(list.nonEmpty)(s"h.hakemus_koskee IN ($list)"),
          Option.when(apHakemus)("a.ap_hakemus IS TRUE")
        ).flatten

        whereClauses += s"(${ehdot.mkString(" OR ")})"
      }

      if (vaiheet.nonEmpty) {
        val list = vaiheet.map(v => s"'$v'").mkString(", ")
        whereClauses += s"h.kasittely_vaihe IN ($list)"
      }

      if (userOids.nonEmpty) {
        val list = userOids.map(o => s"'$o'").mkString(", ")
        whereClauses += s"e.esittelija_oid IN ($list)"
      }

      val whereClause = {
        val clauses = whereClauses.result()
        if (clauses.isEmpty) "" else "WHERE " + clauses.mkString(" AND ")
      }

      val orderBy = buildOrderBy(sortParam)
      val offset  = (page - 1) * pageSize

      val countAction = sql"""
          SELECT COUNT(*)
          FROM hakemus h
          LEFT JOIN esittelija e ON e.id = h.esittelija_id
          LEFT JOIN asiakirja a ON a.id = h.asiakirja_id
          #$whereClause
        """.as[Long].head

      val dataAction = sql"""
        WITH hakemus_ids AS (
          SELECT h.id
          FROM hakemus h
          LEFT JOIN esittelija e ON e.id = h.esittelija_id
          LEFT JOIN asiakirja a ON a.id = h.asiakirja_id
          #$whereClause
          ORDER BY #$orderBy
          LIMIT $pageSize
          OFFSET $offset
        )
        SELECT
          COALESCE(h.hakija_etunimet, '') || ' ' || COALESCE(h.hakija_sukunimi, ''),
          h.saapumis_pvm,
          h.hakemus_oid,
          h.hakemus_koskee,
          e.esittelija_oid,
          h.asiatunnus,
          e.kutsumanimi,
          e.sukunimi,
          h.kasittely_vaihe,
          h.muokattu,
          h.viimeisin_taydennyspyynto_paiva,
          h.ataru_hakemus_muokattu,
          a.ap_hakemus,
          a.viimeinen_asiakirja_hakijalta,
          h.onko_peruutettu
        FROM hakemus h
        LEFT JOIN esittelija e ON e.id = h.esittelija_id
        LEFT JOIN asiakirja a ON a.id = h.asiakirja_id
        WHERE h.id IN (SELECT id FROM hakemus_ids)
        ORDER BY #$orderBy
      """.as[HakemusListItem]

      val transactionalAction = for {
        totalCount <- countAction
        items      <- dataAction
      } yield (items, totalCount)

      db.runTransactionally(transactionalAction, "hae_hakemus_lista").get
    } catch {
      case e: Exception =>
        throw new RuntimeException(
          s"Hakemuksien listaus epäonnistui: ${e.getMessage}",
          e
        )
    }
  }

  private def buildOrderBy(sortParam: Option[ListSortParam]): String =
    sortParam match {
      case None                                => "h.saapumis_pvm DESC NULLS LAST"
      case Some(ListSortParam(param, sortDef)) =>
        val dir = SortDef.toSql(sortDef)
        param match {
          case "saapumisPvm"    => s"h.saapumis_pvm $dir"
          case "hakija"         => s"h.hakija_etunimet $dir, h.hakija_sukunimi $dir"
          case "asiatunnus"     => s"h.asiatunnus $dir"
          case "esittelija"     => s"e.kutsumanimi $dir, e.sukunimi $dir"
          case "kasittelyvaihe" => s"h.kasittely_vaihe $dir"
          case "hakemusKoskee"  =>
            // Map hakemus_koskee integers to label keys for ordering.
            s"""CASE
               |  WHEN h.hakemus_koskee = 0 THEN 'tutkinnonTasonRinnastaminen'
               |  WHEN h.hakemus_koskee = 1 AND a.ap_hakemus IS TRUE THEN 'kelpoisuusAmmattiinAPHakemus'
               |  WHEN h.hakemus_koskee = 1 THEN 'kelpoisuusAmmattiin'
               |  WHEN h.hakemus_koskee = 2 THEN 'tutkintoSuoritusRinnastaminen'
               |  WHEN h.hakemus_koskee = 3 THEN 'riittavatOpinnot'
               |  WHEN h.hakemus_koskee = 4 THEN 'kelpoisuusAmmattiinAPHakemus'
               |  WHEN h.hakemus_koskee = 5 THEN 'lopullinenPaatos'
               |  ELSE h.hakemus_koskee::text
               | END $dir""".stripMargin
          case "kokonaisaika" => s"h.saapumis_pvm $dir"
          case "hakijanaika"  => s"a.viimeinen_asiakirja_hakijalta $dir"
          case unknown        =>
            throw new IllegalArgumentException(s"Tuntematon sort-parametri: $unknown")
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
              h.form_id,
              h.esittelija_id,
              e.esittelija_oid,
              h.asiakirja_id,
              h.asiatunnus,
              h.kasittely_vaihe,
              h.muokattu,
              h.yhteistutkinto,
              h.lopullinen_paatos_ehdollisen_asiatunnus,
              h.lopullinen_paatos_tutkinnon_suoritus_maakoodiuri,
              h.esittelijan_huomioita,
              h.muokkaaja,
              h.onko_peruutettu,
              h.peruutus_paiva,
              h.peruutus_lisatieto,
              h.viimeisin_taydennyspyynto_paiva,
              h.saapumis_pvm,
              h.ataru_hakemus_muokattu,
              h.hakija_etunimet,
              h.hakija_sukunimi
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
  def paivitaHakemus(
    hakemusOid: HakemusOid,
    hakemus: DbHakemus,
    muokkaaja: String
  ): HakemusOid = {
    val hakemusOidString                                   = hakemusOid.toString
    val esittelijaIdOrNull                                 = hakemus.esittelijaId.map(_.toString).orNull
    val asiakirjaIdOrNull                                  = hakemus.asiakirjaId.map(_.toString).orNull
    val asiatunnusOrNull                                   = hakemus.asiatunnus.orNull
    val hakemusKoskee                                      = hakemus.hakemusKoskee
    val yhteistutkinto                                     = hakemus.yhteistutkinto
    val kasittelyVaihe                                     = hakemus.kasittelyVaihe.toString
    val lopullinenPaatosVastaavaEhdollinenAsiatunnusOrNull =
      hakemus.lopullinenPaatosVastaavaEhdollinenAsiatunnus.orNull
    val lopullinenPaatosVastaavaEhdollinenSuoritusmaaKoodiUriOrNull =
      hakemus.lopullinenPaatosVastaavaEhdollinenSuoritusmaaKoodiUri.orNull
    val esittelijanHuomioita        = hakemus.esittelijanHuomioita
    val peruutettu                  = hakemus.onkoPeruutettu
    val peruutusPvm                 = hakemus.peruutusPvm.map(java.sql.Timestamp.valueOf).orNull
    val peruutusLisatieto           = hakemus.peruutusLisatieto
    val viimeisinTaydennyspyyntoPvm = hakemus.viimeisinTaydennyspyyntoPvm.map(java.sql.Timestamp.valueOf).orNull
    val formId                      = hakemus.formId
    val saapumisPvmOpt              = hakemus.saapumisPvm.map(java.sql.Timestamp.valueOf).orNull
    val ataruHakemusMuokattuOpt     = hakemus.ataruHakemusMuokattu.map(java.sql.Timestamp.valueOf).orNull
    val hakijaEtunimetOpt           = hakemus.hakijaEtunimet.orNull
    val hakijaSukunimiOpt           = hakemus.hakijaSukunimi.orNull

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
          kasittely_vaihe = $kasittelyVaihe,
          lopullinen_paatos_ehdollisen_asiatunnus = $lopullinenPaatosVastaavaEhdollinenAsiatunnusOrNull,
          lopullinen_paatos_tutkinnon_suoritus_maakoodiuri = $lopullinenPaatosVastaavaEhdollinenSuoritusmaaKoodiUriOrNull,
          esittelijan_huomioita = $esittelijanHuomioita,
          onko_peruutettu = $peruutettu,
          peruutus_paiva = $peruutusPvm,
          peruutus_lisatieto = $peruutusLisatieto,
          viimeisin_taydennyspyynto_paiva = $viimeisinTaydennyspyyntoPvm,
          form_id = $formId,
          saapumis_pvm =$saapumisPvmOpt,
          ataru_hakemus_muokattu = $ataruHakemusMuokattuOpt,
          hakija_etunimet = $hakijaEtunimetOpt,
          hakija_sukunimi = $hakijaSukunimiOpt
        WHERE hakemus_oid = $hakemusOidString
        RETURNING
          hakemus_oid
      """.as[HakemusOid].head,
        "paivita_taysi_hakemus"
      )
    catch {
      case e: Exception =>
        LOG.error(s"Hakemuksen täysi päivitys epäonnistui: $e")
        throw new RuntimeException(
          s"Hakemuksen täysi päivitys epäonnistui: ${e.getMessage}",
          e
        )
    }
  }

  private def paivitaAsiatunnus(hakemusOid: HakemusOid, asiatunnus: String, muokkaaja: String): DBIO[Int] =
    sqlu"""
      UPDATE hakemus
      SET asiatunnus = $asiatunnus, muokkaaja = $muokkaaja
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

  def onkoHakemusOlemassa(hakemusOid: HakemusOid): Boolean =
    try {
      db.run(
        sql"""SELECT EXISTS (SELECT 1 FROM hakemus WHERE hakemus_oid = ${hakemusOid.s}) """.as[Boolean].head,
        "tarkista_hakemuksen_olemassaolo"
      )
    } catch {
      case e: Exception =>
        throw new RuntimeException(
          s"Hakemuksen olemassaolon tarkistus epäonnistui: ${e.getMessage}",
          e
        )
    }

  def haeYkViestiLista(userOid: String): Seq[YkViestiListItem] =
    try {
      db.run(
        sql"""
          SELECT
            v.id,
            v.hakemus_id,
            h.asiatunnus,
            h.hakemus_oid,
            v.lahettaja_oid,
            v.vastaanottaja_oid,
            v.luotu,
            v.luettu,
            v.viesti,
            v.vastaus
          FROM
            yk_viesti v
          LEFT JOIN hakemus h on h.id = v.hakemus_id
          WHERE
            v.lahettaja_oid = $userOid OR v.vastaanottaja_oid = $userOid
          """.as[YkViestiListItem],
        "hae_ykviestit"
      )
    } catch {
      case e: Exception =>
        throw new RuntimeException(
          s"Yhteisen käsitetelyn viestien listaus epäonnistui: ${e.getMessage}",
          e
        )
    }
}
