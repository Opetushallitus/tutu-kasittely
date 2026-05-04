package fi.oph.tutu.backend.repository

import fi.oph.tutu.backend.domain.*
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.{Component, Repository}
import slick.dbio.DBIO
import slick.jdbc.GetResult
import slick.jdbc.PostgresProfile.api.*
import scala.concurrent.ExecutionContext.Implicits.global

import java.time.LocalDateTime
import java.util.UUID
import scala.concurrent.duration.DurationInt
import scala.util.{Failure, Success, Try}
import slick.jdbc.SQLActionBuilder

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
        hakijaSukunimi = r.nextStringOption(),
        esittelyPvm = Option(r.nextTimestamp()).map(_.toLocalDateTime)
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

  implicit val getHakemusListItemWithCountResult: GetResult[(HakemusListItem, Int)] =
    GetResult(r => (getHakemusListItemResult(r), r.nextInt()))

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
    haku: Option[String],
    hakemusKoskee: Seq[Int],
    vaiheet: Seq[String],
    apHakemus: Boolean,
    sortParam: Option[ListSortParam],
    page: Int,
    pageSize: Int
  ): (Seq[HakemusListItem], Long) = {
    try {
      val whereClauses = Seq.newBuilder[SQLActionBuilder]

      if (haku.exists(_.trim().nonEmpty)) {
        val qs = s"%${haku.get.trim()}%"
        whereClauses += sql"""(COALESCE(h.hakija_etunimet, '') || ' ' || COALESCE(h.hakija_sukunimi, '') ILIKE $qs
                                OR h.asiatunnus ILIKE $qs)"""
      }

      // Yhdistetään ehdot sillä jos ap_hakemus, niin kannassa on hakemus_koskee=1
      if (hakemusKoskee.nonEmpty || apHakemus) {
        val ehdot = List(
          Option.when(hakemusKoskee.nonEmpty)(sql"h.hakemus_koskee = ANY($hakemusKoskee)"),
          Option.when(apHakemus)(sql"a.ap_hakemus IS TRUE")
        ).flatten
          .reduce(_ ++ sql" OR " ++ _)

        whereClauses += sql"(" ++ ehdot ++ sql")"
      }

      if (vaiheet.nonEmpty) {
        whereClauses += sql"h.kasittely_vaihe = ANY($vaiheet)"
      }

      if (userOids.nonEmpty) {
        whereClauses += sql"e.esittelija_oid = ANY($userOids)"
      }

      val whereClause = {
        val clauses = whereClauses.result()
        if (clauses.isEmpty) sql""
        else sql" WHERE " ++ clauses.reduce(_ ++ sql" AND " ++ _)
      }

      val orderBy = buildOrderBy(sortParam)
      val offset  = (page - 1) * pageSize

      val countAction = (sql"""
          SELECT COUNT(*)
          FROM hakemus h
          LEFT JOIN esittelija e ON e.id = h.esittelija_id
          LEFT JOIN asiakirja a ON a.id = h.asiakirja_id"""
        ++ whereClause).as[Long].head

      val dataAction = (sql"""
        WITH hakemus_ids AS (
          SELECT h.id
          FROM hakemus h
          LEFT JOIN esittelija e ON e.id = h.esittelija_id
          LEFT JOIN asiakirja a ON a.id = h.asiakirja_id"""
        ++ whereClause ++
        sql"""
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
      """).as[HakemusListItem]

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

  // ---------------------------------------------------------------------------
  // Vapaa tekstihaku – kandidaatti-haarat
  // Jokainen näkymä rakentaa joukon SELECT-haaroja, jotka palauttavat hakemuksen
  // id:n suoraan kunkin lähdetaulun omilla GIN-trgm-indekseillä (BitmapOr per taulu).
  //
  // Osassa käytetään täsmällistä ILIKE %text% -hakua ja osassa pg_trgm %>>-operaattoria,
  // jälkimmäinen voi olla hyödyllinen kentille, joissa esiintyy eri kirjoitustapoja, typoja tms.
  // HUOM: Eriytä ILIKE ja %>>-haut eri alikyselyihin muuten GIN-indeksit eivät toimi.
  // Myös monimutkaiset joinit pilkotaan useampaan alikyselyyn (katso paatostiedotBranches).
  // ---------------------------------------------------------------------------

  private def perustiedotBranches(word: String, wordPat: String): Seq[SQLActionBuilder] =
    Seq(
      sql"""SELECT id AS id FROM hakemus
            WHERE hakija_etunimet %>> $word
            OR hakija_sukunimi %>> $word""",
      sql"""SELECT id AS id FROM hakemus
            WHERE asiatunnus ILIKE $wordPat
            OR esittelijan_huomioita ILIKE $wordPat
            OR peruutus_lisatieto ILIKE $wordPat
            OR lopullinen_paatos_ehdollisen_asiatunnus ILIKE $wordPat"""
    )

  private def asiakirjatBranches(word: String, wordPat: String): Seq[SQLActionBuilder] =
    Seq(sql"""SELECT h.id AS id FROM asiakirja a
              JOIN hakemus h ON h.asiakirja_id = a.id
              WHERE a.allekirjoitukset_tarkistettu_lisatiedot ILIKE $wordPat
              OR a.imi_pyynto_numero ILIKE $wordPat
              OR a.alkuperaiset_asiakirjat_saatu_nahtavaksi_lisatiedot ILIKE $wordPat
              OR a.huomiot_muistioon ILIKE $wordPat
              OR a.esittelijan_huomioita ILIKE $wordPat""")

  private def tutkinnotBranches(word: String, wordPat: String): Seq[SQLActionBuilder] =
    Seq(
      sql"""SELECT hakemus_id AS id FROM tutkinto
            WHERE nimi %>> $word
            OR oppilaitos %>> $word
            OR paaaine_tai_erikoisala %>> $word""",
      sql"""SELECT hakemus_id AS id FROM tutkinto
            WHERE muu_tutkinto_tieto ILIKE $wordPat
            OR todistusotsikko ILIKE $wordPat
            OR ohjeellinen_laajuus ILIKE $wordPat
            OR perustelun_lisatietoja ILIKE $wordPat
            OR muu_tutkinto_muistio ILIKE $wordPat""",
      sql"""SELECT t.hakemus_id AS id FROM tutkinto t
            JOIN maakoodi mk ON mk.koodiuri = t.maakoodiuri
            WHERE mk.fi ILIKE $wordPat
            OR mk.sv ILIKE $wordPat
            OR mk.en ILIKE $wordPat"""
    )

  private def yleisetPerusteluBranches(word: String, wordPat: String): Seq[SQLActionBuilder] =
    Seq(sql"""SELECT hakemus_id AS id FROM perustelu
              WHERE selvitys_tutkinnon_myontajasta_ja_tutkinnon_virallisuudesta ILIKE $wordPat
              OR selvitys_tutkinnon_asemasta_lahtomaan_jarjestelmassa ILIKE $wordPat
              OR jatko_opinto_kelpoisuus_lisatieto ILIKE $wordPat
              OR muu_perustelu ILIKE $wordPat
              OR lausunto_pyynto_lisatiedot ILIKE $wordPat
              OR lausunto_sisalto ILIKE $wordPat
              OR tarkempia_selvityksia ILIKE $wordPat""")

  private def uoRoPerusteluBranches(word: String, wordPat: String): Seq[SQLActionBuilder] =
    Seq(sql"""SELECT hakemus_id AS id FROM perustelu
              WHERE (uo_ro_sisalto->>'koulutuksenSisalto') ILIKE $wordPat
              OR tarkempia_selvityksia ILIKE $wordPat""")

  private def apPerusteluBranches(word: String, wordPat: String): Seq[SQLActionBuilder] =
    Seq(sql"""SELECT hakemus_id AS id FROM perustelu
              WHERE (ap_sisalto->>'todistusEUKansalaisuuteenRinnasteisestaAsemasta') ILIKE $wordPat
              OR (ap_sisalto->>'ammattiJohonPatevoitynyt') ILIKE $wordPat
              OR (ap_sisalto->>'ammattitoiminnanPaaAsiallinenSisalto') ILIKE $wordPat
              OR (ap_sisalto->>'koulutuksenKestoJaSisalto') ILIKE $wordPat
              OR (ap_sisalto->>'lisatietoja') ILIKE $wordPat
              OR (ap_sisalto->>'muutAPPerustelut') ILIKE $wordPat
              OR (ap_sisalto->>'SEUTArviointi') ILIKE $wordPat
              OR tarkempia_selvityksia ILIKE $wordPat""")

  private def paatostiedotBranches(word: String, wordPat: String): Seq[SQLActionBuilder] =
    Seq(
      sql"""SELECT pa.hakemus_id AS id FROM paatos pa
            JOIN paatostieto pt ON pt.paatos_id = pa.id
            WHERE (pt.kielteisen_paatoksen_perustelut->>'muuPerusteluKuvaus') ILIKE $wordPat
            OR pt.esittelijan_huomioita_toimenpiteista ILIKE $wordPat""",
      sql"""SELECT pa.hakemus_id AS id FROM paatos pa
            JOIN paatostieto pt ON pt.paatos_id = pa.id
            JOIN kelpoisuus k ON k.paatostieto_id = pt.id
            WHERE k.kelpoisuus ILIKE $wordPat
            OR k.opetettava_aine ILIKE $wordPat
            OR k.muu_ammatti_kuvaus ILIKE $wordPat
            OR k.direktiivitaso ILIKE $wordPat
            OR k.direktiivitaso_lisatiedot ILIKE $wordPat
            OR (k.kielteisen_paatoksen_perustelut->>'muuPerusteluKuvaus') ILIKE $wordPat""",
      sql"""SELECT pa.hakemus_id AS id FROM paatos pa
            JOIN paatostieto pt ON pt.paatos_id = pa.id
            JOIN tutkinto_tai_opinto tto ON tto.paatostieto_id = pt.id
            WHERE tto.tutkinto_tai_opinto ILIKE $wordPat
            OR (tto.kielteisen_paatoksen_perustelut->>'muuPerusteluKuvaus') ILIKE $wordPat"""
    )

  private def yhteinenKasittelyBranches(word: String, wordPat: String): Seq[SQLActionBuilder] =
    Seq(sql"""SELECT h.id AS id FROM yk_viesti yv
              JOIN hakemus h ON h.hakemus_oid = yv.hakemus_oid
              WHERE yv.kysymys ILIKE $wordPat
              OR yv.vastaus ILIKE $wordPat""")

  private def viestitBranches(word: String, wordPat: String): Seq[SQLActionBuilder] =
    Seq(sql"""SELECT hakemus_id AS id FROM viesti
              WHERE otsikko ILIKE $wordPat
              OR viesti ILIKE $wordPat""")

  private def paatostekstiBranches(word: String, wordPat: String): Seq[SQLActionBuilder] =
    Seq(sql"""SELECT hakemus_id AS id FROM paatosteksti
              WHERE sisalto ILIKE $wordPat""")

  private def buildNakymaCandidateBranches(
    word: String,
    wordPat: String,
    nakyma: HakemusNakyma
  ): Seq[SQLActionBuilder] =
    nakyma match {
      case HakemusNakyma.Perustiedot       => perustiedotBranches(word, wordPat)
      case HakemusNakyma.Asiakirjat        => asiakirjatBranches(word, wordPat)
      case HakemusNakyma.Tutkinnot         => tutkinnotBranches(word, wordPat)
      case HakemusNakyma.PerusteluYleiset  => yleisetPerusteluBranches(word, wordPat)
      case HakemusNakyma.PerusteluUoRo     => uoRoPerusteluBranches(word, wordPat)
      case HakemusNakyma.PerusteluAp       => apPerusteluBranches(word, wordPat)
      case HakemusNakyma.Paatostiedot      => paatostiedotBranches(word, wordPat)
      case HakemusNakyma.YhteinenKasittely => yhteinenKasittelyBranches(word, wordPat)
      case HakemusNakyma.Viestit           => viestitBranches(word, wordPat)
      case HakemusNakyma.Paatosteksti      => paatostekstiBranches(word, wordPat)
      case HakemusNakyma.Kaikki            =>
        perustiedotBranches(word, wordPat) ++
          asiakirjatBranches(word, wordPat) ++
          tutkinnotBranches(word, wordPat) ++
          yleisetPerusteluBranches(word, wordPat) ++
          uoRoPerusteluBranches(word, wordPat) ++
          apPerusteluBranches(word, wordPat) ++
          paatostiedotBranches(word, wordPat) ++
          yhteinenKasittelyBranches(word, wordPat) ++
          viestitBranches(word, wordPat) ++
          paatostekstiBranches(word, wordPat)
    }

  // ---------------------------------------------------------------------------
  // Vapaa tekstihaku – pisteytys
  // word_similarity(query, text) palauttaa 1.0 täsmällisissä osuma-sanoissa,
  // < 1.0 osittaisissa vastaavuuksissa.
  // Pisteytys lasketaan vain jo suodatetuille riveille.
  // ---------------------------------------------------------------------------

  private def scorePerustiedot(word: String, wordPat: String): SQLActionBuilder =
    sql"""(
      word_similarity($word, COALESCE(h.hakija_etunimet, '')) +
      word_similarity($word, COALESCE(h.hakija_sukunimi, '')) +
      word_similarity($word, COALESCE(h.asiatunnus, '')) +
      word_similarity($word, COALESCE(h.esittelijan_huomioita, '')) +
      word_similarity($word, COALESCE(h.peruutus_lisatieto, '')) +
      word_similarity($word, COALESCE(h.lopullinen_paatos_ehdollisen_asiatunnus, ''))
    )"""

  private def scoreAsiakirjat(word: String): SQLActionBuilder =
    sql"""COALESCE((
      SELECT
        word_similarity($word, COALESCE(a.allekirjoitukset_tarkistettu_lisatiedot, '')) +
        word_similarity($word, COALESCE(a.imi_pyynto_numero, '')) +
        word_similarity($word, COALESCE(a.alkuperaiset_asiakirjat_saatu_nahtavaksi_lisatiedot, '')) +
        word_similarity($word, COALESCE(a.huomiot_muistioon, '')) +
        word_similarity($word, COALESCE(a.esittelijan_huomioita, ''))
      FROM asiakirja a
      WHERE a.id = h.asiakirja_id
    ), 0.0)"""

  private def scoreTutkinnot(word: String): SQLActionBuilder =
    sql"""COALESCE((
      SELECT MAX(
        word_similarity($word, COALESCE(t.nimi, '')) +
        word_similarity($word, COALESCE(t.oppilaitos, '')) +
        word_similarity($word, COALESCE(t.muu_tutkinto_tieto, '')) +
        word_similarity($word, COALESCE(t.paaaine_tai_erikoisala, '')) +
        word_similarity($word, COALESCE(t.todistusotsikko, '')) +
        word_similarity($word, COALESCE(t.ohjeellinen_laajuus, '')) +
        word_similarity($word, COALESCE(t.perustelun_lisatietoja, '')) +
        word_similarity($word, COALESCE(t.muu_tutkinto_muistio, '')) +
        word_similarity($word, COALESCE(mk.fi, '')) +
        word_similarity($word, COALESCE(mk.sv, '')) +
        word_similarity($word, COALESCE(mk.en, ''))
      )
      FROM tutkinto t
      LEFT JOIN maakoodi mk ON mk.koodiuri = t.maakoodiuri
      WHERE t.hakemus_id = h.id
    ), 0.0)"""

  private def scoreYleisetPerustelu(word: String): SQLActionBuilder =
    sql"""COALESCE((
      SELECT
        word_similarity($word, COALESCE(p.selvitys_tutkinnon_myontajasta_ja_tutkinnon_virallisuudesta, '')) +
        word_similarity($word, COALESCE(p.selvitys_tutkinnon_asemasta_lahtomaan_jarjestelmassa, '')) +
        word_similarity($word, COALESCE(p.jatko_opinto_kelpoisuus_lisatieto, '')) +
        word_similarity($word, COALESCE(p.muu_perustelu, '')) +
        word_similarity($word, COALESCE(p.lausunto_pyynto_lisatiedot, '')) +
        word_similarity($word, COALESCE(p.lausunto_sisalto, '')) +
        word_similarity($word, COALESCE(p.tarkempia_selvityksia, ''))
      FROM perustelu p
      WHERE p.hakemus_id = h.id
    ), 0.0)"""

  private def scoreUoRoPerustelu(word: String): SQLActionBuilder =
    sql"""COALESCE((
      SELECT
        word_similarity($word, COALESCE(p.uo_ro_sisalto->>'koulutuksenSisalto', '')) +
        word_similarity($word, COALESCE(p.tarkempia_selvityksia, ''))
      FROM perustelu p
      WHERE p.hakemus_id = h.id
    ), 0.0)"""

  private def scoreApPerustelu(word: String): SQLActionBuilder =
    sql"""COALESCE((
      SELECT
        word_similarity($word, COALESCE(p.ap_sisalto->>'todistusEUKansalaisuuteenRinnasteisestaAsemasta', '')) +
        word_similarity($word, COALESCE(p.ap_sisalto->>'ammattiJohonPatevoitynyt', '')) +
        word_similarity($word, COALESCE(p.ap_sisalto->>'ammattitoiminnanPaaAsiallinenSisalto', '')) +
        word_similarity($word, COALESCE(p.ap_sisalto->>'koulutuksenKestoJaSisalto', '')) +
        word_similarity($word, COALESCE(p.ap_sisalto->>'lisatietoja', '')) +
        word_similarity($word, COALESCE(p.ap_sisalto->>'muutAPPerustelut', '')) +
        word_similarity($word, COALESCE(p.ap_sisalto->>'SEUTArviointi', '')) +
        word_similarity($word, COALESCE(p.tarkempia_selvityksia, ''))
      FROM perustelu p
      WHERE p.hakemus_id = h.id
    ), 0.0)"""

  private def scorePaatostiedot(word: String): SQLActionBuilder =
    sql"""COALESCE((
      SELECT MAX(
        word_similarity($word, COALESCE(k.kelpoisuus, '')) +
        word_similarity($word, COALESCE(k.opetettava_aine, '')) +
        word_similarity($word, COALESCE(k.muu_ammatti_kuvaus, '')) +
        word_similarity($word, COALESCE(k.direktiivitaso, '')) +
        word_similarity($word, COALESCE(k.direktiivitaso_lisatiedot, '')) +
        word_similarity($word, COALESCE(k.kielteisen_paatoksen_perustelut->>'muuPerusteluKuvaus', '')) +
        word_similarity($word, COALESCE(tto.tutkinto_tai_opinto, '')) +
        word_similarity($word, COALESCE(tto.kielteisen_paatoksen_perustelut->>'muuPerusteluKuvaus', '')) +
        word_similarity($word, COALESCE(pt.kielteisen_paatoksen_perustelut->>'muuPerusteluKuvaus', '')) +
        word_similarity($word, COALESCE(pt.esittelijan_huomioita_toimenpiteista, ''))
      )
      FROM paatos pa
      JOIN paatostieto pt ON pt.paatos_id = pa.id
      LEFT JOIN kelpoisuus k ON k.paatostieto_id = pt.id
      LEFT JOIN tutkinto_tai_opinto tto ON tto.paatostieto_id = pt.id
      WHERE pa.hakemus_id = h.id
    ), 0.0)"""

  private def scoreYhteinenKasittely(word: String): SQLActionBuilder =
    sql"""COALESCE((
      SELECT MAX(
        word_similarity($word, COALESCE(yv.kysymys, '')) +
        word_similarity($word, COALESCE(yv.vastaus, ''))
      )
      FROM yk_viesti yv
      WHERE yv.hakemus_oid = h.hakemus_oid
    ), 0.0)"""

  private def scoreViestit(word: String): SQLActionBuilder =
    sql"""COALESCE((
      SELECT MAX(
        word_similarity($word, COALESCE(v.otsikko, '')) +
        word_similarity($word, COALESCE(v.viesti, ''))
      )
      FROM viesti v
      WHERE v.hakemus_id = h.id
    ), 0.0)"""

  private def scorePaatosteksti(word: String): SQLActionBuilder =
    sql"""COALESCE((
      SELECT word_similarity($word, COALESCE(pkt.sisalto, ''))
      FROM paatosteksti pkt
      WHERE pkt.hakemus_id = h.id
    ), 0.0)"""

  private def buildWordScore(word: String, wordPat: String, nakyma: HakemusNakyma): SQLActionBuilder =
    nakyma match {
      case HakemusNakyma.Perustiedot       => scorePerustiedot(word, wordPat)
      case HakemusNakyma.Asiakirjat        => scoreAsiakirjat(word)
      case HakemusNakyma.Tutkinnot         => scoreTutkinnot(word)
      case HakemusNakyma.PerusteluYleiset  => scoreYleisetPerustelu(word)
      case HakemusNakyma.PerusteluUoRo     => scoreUoRoPerustelu(word)
      case HakemusNakyma.PerusteluAp       => scoreApPerustelu(word)
      case HakemusNakyma.Paatostiedot      => scorePaatostiedot(word)
      case HakemusNakyma.YhteinenKasittely => scoreYhteinenKasittely(word)
      case HakemusNakyma.Viestit           => scoreViestit(word)
      case HakemusNakyma.Paatosteksti      => scorePaatosteksti(word)
      case HakemusNakyma.Kaikki            =>
        sql"(" ++
          scorePerustiedot(word, wordPat) ++ sql" + " ++
          scoreAsiakirjat(word) ++ sql" + " ++
          scoreTutkinnot(word) ++ sql" + " ++
          scoreYleisetPerustelu(word) ++ sql" + " ++
          scoreUoRoPerustelu(word) ++ sql" + " ++
          scoreApPerustelu(word) ++ sql" + " ++
          scorePaatostiedot(word) ++ sql" + " ++
          scoreYhteinenKasittely(word) ++ sql" + " ++
          scoreViestit(word) ++ sql" + " ++
          scorePaatosteksti(word) ++
          sql")"
    }

  def haeHakemuksetHaulla(
    haku: String,
    nakyma: HakemusNakyma,
    page: Int,
    pageSize: Int
  ): (Seq[HakemusListItem], Int) = {
    try {
      val words = haku.trim().split(" ").filter(_.nonEmpty)
      if (words.isEmpty) {
        return (Seq.empty[HakemusListItem], 0)
      }

      // Per-sana/näkymä kandidaattijoukot yhdistetään UNION:lla, useampi sana INTERSECT:llä.
      // Kaikkien sanojen pitää löytyä jostakin näkymästä.
      val candidateSet: SQLActionBuilder = words
        .map { word =>
          val wordPat  = s"%$word%"
          val branches = buildNakymaCandidateBranches(word, wordPat, nakyma)
          sql"(" ++ branches.reduce(_ ++ sql" UNION " ++ _) ++ sql")"
        }
        .reduce(_ ++ sql" INTERSECT " ++ _)

      // Summataan word_similarity-pisteet kaikille sanoille
      val totalScoreExpr: SQLActionBuilder =
        words
          .map { word =>
            val wordPat = s"%$word%"
            buildWordScore(word, wordPat, nakyma)
          }
          .reduce(_ ++ sql" + " ++ _)

      val offset = (page - 1) * pageSize

      // filtered-joukko on laaja (1000), josta otetaan top 200 pisteiden perusteella.
      val dataAction = (sql"""
        WITH candidates AS (""" ++ candidateSet ++ sql"""),
          filtered AS (
            SELECT id FROM candidates
            LIMIT 1000
          ),
          ranked AS (
            SELECT h.id, (""" ++ totalScoreExpr ++ sql""") AS relevance_score
            FROM hakemus h
            JOIN filtered f ON f.id = h.id
            ORDER BY relevance_score DESC
            LIMIT 200
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
          h.onko_peruutettu,
          (SELECT COUNT(*) FROM ranked) AS total_count
        FROM hakemus h
        JOIN ranked ON ranked.id = h.id
        LEFT JOIN esittelija e ON e.id = h.esittelija_id
        LEFT JOIN asiakirja a ON a.id = h.asiakirja_id
        ORDER BY ranked.relevance_score DESC
        LIMIT $pageSize
        OFFSET $offset
      """).as[(HakemusListItem, Int)]

      // JIT-käännös tuhlaa sekunteja niin disabloidaan
      val transactionalAction = for {
        _     <- sqlu"SET LOCAL jit = off"
        pairs <- dataAction
      } yield pairs

      val pairs      = db.runTransactionally(transactionalAction, "hae_hakemukset_haulla").get
      val items      = pairs.map(_._1)
      val totalCount = pairs.headOption.map(_._2).getOrElse(0)
      (items, totalCount)
    } catch {
      case e: Exception =>
        throw new RuntimeException(
          s"Hakemuksien tekstihaku epäonnistui: ${e.getMessage}",
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
              h.hakija_sukunimi,
              h.esittely_pvm
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

  private def paivitaEsittelyPvm(hakemusOid: HakemusOid, esittelyPvm: LocalDateTime, muokkaaja: String): DBIO[Int] =
    val esittelyPvmValue = java.sql.Timestamp.valueOf(esittelyPvm)
    sqlu"""
      UPDATE hakemus
      SET esittely_pvm = $esittelyPvmValue, muokkaaja = $muokkaaja
      WHERE hakemus_oid = ${hakemusOid.toString}
    """

  def suoritaPaivitaEsittelyPvm(hakemusOid: HakemusOid, esittelyPvm: LocalDateTime, muokkaaja: String): Int = {
    Try {
      db.run(paivitaEsittelyPvm(hakemusOid, esittelyPvm, muokkaaja), "PaivitaEsittelyPvm")
    } match {
      case Success(modified) => modified
      case Failure(e)        =>
        LOG.error(s"Virhe esittelypäivän päivittämisessä: ${e.getMessage}", e)
        throw new RuntimeException(s"Virhe esittelypäivän päivittämisessä: ${e.getMessage}", e)
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
}
