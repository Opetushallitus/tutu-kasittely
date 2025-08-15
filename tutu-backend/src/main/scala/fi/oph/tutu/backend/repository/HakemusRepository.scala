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
import scala.util.{Failure, Success}

@Component
@Repository
class HakemusRepository {
  @Autowired
  val db: TutuDatabase = null

  final val DB_TIMEOUT = 30.seconds
  val LOG: Logger      = LoggerFactory.getLogger(classOf[HakemusRepository])

  implicit val getUUIDResult: GetResult[UUID] =
    GetResult(r => UUID.fromString(r.nextString()))

  implicit val getHakemusOidResult: GetResult[HakemusOid] =
    GetResult(r => HakemusOid(r.nextString()))

  implicit val getHakemusResult: GetResult[DbHakemus] =
    GetResult(r =>
      DbHakemus(
        UUID.fromString(r.nextString()),
        HakemusOid(r.nextString()),
        r.nextInt(),
        Option(r.nextString()).map(UUID.fromString),
        Option(r.nextString()).map(UserOid.apply),
        Option(r.nextString()),
        KasittelyVaihe.fromString(r.nextString()),
        Option(r.nextTimestamp()).map(_.toLocalDateTime),
        r.nextBoolean(),
        Option(r.nextString()),
        r.nextBoolean(),
        Option(r.nextString()),
        r.nextBoolean(),
        imiPyynto = Option(r.nextObject()) match {
          case Some(value: java.lang.Boolean) => Some(value.booleanValue())
          case _                              => None
        },
        Option(r.nextString()),
        Option(r.nextTimestamp()).map(_.toLocalDateTime),
        Option(r.nextTimestamp()).map(_.toLocalDateTime),
        Option(r.nextBoolean())
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
        Option(r.nextBoolean())
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

  def combineIntDBIOs(ints: Seq[DBIO[Int]]): DBIO[Int] = {
    import scala.concurrent.ExecutionContext.Implicits.global
    DBIO.fold(ints, 0)(_ + _)
  }

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
              h.hakemus_oid, h.hakemus_koskee, e.esittelija_oid, h.asiatunnus, h.kasittely_vaihe, h.muokattu, h.ap_hakemus
            FROM
              hakemus h
            LEFT JOIN public.esittelija e on e.id = h.esittelija_id
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
              h.asiatunnus,
              h.kasittely_vaihe,
              h.muokattu,
              h.allekirjoitukset_tarkistettu,
              h.allekirjoitukset_tarkistettu_lisatiedot,
              h.alkuperaiset_asiakirjat_saatu_nahtavaksi,
              h.alkuperaiset_asiakirjat_saatu_nahtavaksi_lisatiedot,
              h.selvitykset_saatu,
              h.imi_pyynto,
              h.imi_pyynto_numero,
              h.imi_pyynto_lahetetty,
              h.imi_pyynto_vastattu,
              h.ap_hakemus
            FROM
              hakemus h
            LEFT JOIN public.esittelija e on e.id = h.esittelija_id
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

      val joinClause = userOid match {
        case None      => ""
        case Some(oid) => s" INNER JOIN esittelija e ON h.esittelija_id = e.id AND e.esittelija_oid = '${oid}'"
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

      if (apHakemus) {
        whereClauses += s"h.ap_hakemus = true"
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
    val hakemusOidString                            = hakemusOid.toString
    val esittelijaIdOrNull                          = partialHakemus.esittelijaId.map(_.toString).orNull
    val asiatunnusOrNull                            = partialHakemus.asiatunnus.map(_.toString).orNull
    val allekirjoituksetTarkistettu                 = partialHakemus.allekirjoituksetTarkistettu
    val allekirjoituksetTarkistettuLisatiedotOrNull =
      partialHakemus.allekirjoituksetTarkistettuLisatiedot.map(_.toString).orNull
    val hakemusKoskee                                         = partialHakemus.hakemusKoskee
    val alkuperaisetAsiakirjatSaatuNahtavaksi                 = partialHakemus.alkuperaisetAsiakirjatSaatuNahtavaksi
    val alkuperaisetAsiakirjatSaatuNahtavaksiLisatiedotOrNull =
      partialHakemus.alkuperaisetAsiakirjatSaatuNahtavaksiLisatiedot.map(_.toString).orNull
    val selvityksetSaatu                 = partialHakemus.selvityksetSaatu
    val imiPyyntoOrNull: Option[Boolean] = partialHakemus.imiPyynto match {
      case Some(imiPyynto) => Some(imiPyynto)
      case None            => None
    }
    val imiPyyntoNumeroOrNull    = partialHakemus.imiPyyntoNumero.orNull
    val imiPyyntoLahetettyOrNull = partialHakemus.imiPyyntoLahetetty.map(java.sql.Timestamp.valueOf).orNull
    val imiPyyntoVastattuOrNull  = partialHakemus.imiPyyntoVastattu.map(java.sql.Timestamp.valueOf).orNull
    val apHakemus                = partialHakemus.apHakemus
    try
      db.run(
        sql"""
        UPDATE hakemus
        SET
          hakemus_koskee = $hakemusKoskee,
          esittelija_id = ${esittelijaIdOrNull}::uuid,
          asiatunnus = $asiatunnusOrNull,
          allekirjoitukset_tarkistettu = $allekirjoituksetTarkistettu,
          allekirjoitukset_tarkistettu_lisatiedot = $allekirjoituksetTarkistettuLisatiedotOrNull,
          alkuperaiset_asiakirjat_saatu_nahtavaksi = $alkuperaisetAsiakirjatSaatuNahtavaksi,
          alkuperaiset_asiakirjat_saatu_nahtavaksi_lisatiedot = $alkuperaisetAsiakirjatSaatuNahtavaksiLisatiedotOrNull,
          selvitykset_saatu = $selvityksetSaatu,
          muokkaaja = $muokkaaja,
          imi_pyynto = $imiPyyntoOrNull,
          imi_pyynto_numero = $imiPyyntoNumeroOrNull,
          imi_pyynto_lahetetty = $imiPyyntoLahetettyOrNull,
          imi_pyynto_vastattu = $imiPyyntoVastattuOrNull,
          ap_hakemus = $apHakemus
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
   * Luo pyydettävän asiakirjan
   *
   * @param hakemusOid
   * hakemuksen oid
   * @param asiakirjaTyyppi
   * pyydettävän asiakirjan tyyppi
   * @param virkailijaOid
   * virkailijan oid
   */
  def luoPyydettavaAsiakirja(
    hakemusOid: HakemusOid,
    asiakirjaTyyppi: String,
    virkailijaOid: UserOid
  ): Unit = {
    try {
      db.run(
        sql"""
          INSERT INTO pyydettava_asiakirja (hakemus_id, asiakirja_tyyppi, luoja)
          VALUES ((SELECT hakemus.id FROM hakemus WHERE hakemus_oid = ${hakemusOid.toString}), ${asiakirjaTyyppi}::asiakirjan_tyyppi, ${virkailijaOid.toString})
        """.asUpdate,
        "luo_pyydettava_asiakirja"
      )
    } catch {
      case e: Exception =>
        LOG.error(s"Pyydettävän asiakirjan luonti epäonnistui: ${e}")
        throw new RuntimeException(
          s"Pyydettävän asiakirjan luonti epäonnistui: ${e.getMessage}",
          e
        )
    }
  }

  /**
   * Päivittää pyydettävän asiakirjan
   *
   * @param id
   * asiakirjan id
   * @param asiakirjaTyyppi
   * pyydettävän asiakirjan tyyppi
   * @param virkailijaOid
   * päivittävän virkailijan oid
   */
  def paivitaPyydettavaAsiakirja(
    id: UUID,
    asiakirjaTyyppi: String,
    virkailijaOid: UserOid
  ): Unit = {
    try {
      db.run(
        sql"""
            UPDATE pyydettava_asiakirja
            SET asiakirja_tyyppi = ${asiakirjaTyyppi}::asiakirjan_tyyppi, muokkaaja = ${virkailijaOid.toString}
            WHERE id = ${id.toString}::uuid
          """.asUpdate,
        "paivita_pyydettava_asiakirja"
      )
    } catch {
      case e: Exception =>
        LOG.error(s"Pyydettävän asiakirjan päivitys epäonnistui: ${e}")
        throw new RuntimeException(
          s"Pyydettävän asiakirjan päivitys epäonnistui: ${e.getMessage}",
          e
        )
    }
  }

  /**
   * Poistaa pyydettävän asiakirjan
   *
   * @param id
   * asiakirjan id
   */
  def poistaPyydettavaAsiakirja(
    id: UUID
  ): Unit = {
    try {
      db.run(
        sqlu"""
          DELETE FROM pyydettava_asiakirja
          WHERE id = ${id.toString}::uuid
        """,
        "poista_pyydettava_asiakirja"
      )
    } catch {
      case e: Exception =>
        LOG.error(s"Pyydettävän asiakirjan poisto epäonnistui: ${e}")
        throw new RuntimeException(
          s"Pyydettävän asiakirjan poisto epäonnistui: ${e.getMessage}",
          e
        )
    }
  }

  /**
   * Hakee hakemuksen pyydettävät asiakirjat
   *
   * @param hakemusOid
   * hakemuksen oid
   * @return
   * hakemuksen pyydettävät asiakirjat
   */
  def haePyydettavatAsiakirjatHakemusOidilla(hakemusOid: HakemusOid): Seq[PyydettavaAsiakirja] = {
    try {
      db.run(
        sql"""
          SELECT id, asiakirja_tyyppi
          FROM pyydettava_asiakirja
          WHERE hakemus_id = (SELECT id FROM hakemus WHERE hakemus_oid = ${hakemusOid.toString})
          ORDER BY luotu
        """.as[PyydettavaAsiakirja],
        "hae_hakemuksen_pyydettavat_asiakirjat"
      )
    } catch {
      case e: Exception =>
        LOG.error(s"Hakemuksen pyydettävien asiakirjojen haku epäonnistui: ${e}")
        throw new RuntimeException(
          s"Hakemuksen pyydettävien asiakirjojen haku epäonnistui: ${e.getMessage}",
          e
        )
    }
  }

  def suoritaAsiakirjamallienModifiointi(
    hakemusId: UUID,
    modifyData: AsiakirjamalliModifyData,
    virkailijaOid: UserOid
  ): Unit = {
    val actions = modifyData.uudetMallit.values.toSeq.map(lisaaAsiakirjamalli(hakemusId, _, virkailijaOid)) ++
      modifyData.muutetutMallit.values.toSeq.map(muokkaaAsiakirjamallia(hakemusId, _, virkailijaOid)) ++
      modifyData.poistetutMallit.map(poistaAsiakirjamalli(hakemusId, _))
    val combined = combineIntDBIOs(actions)
    db.runTransactionally(combined, "suorita_asiakirjamallien_modifiointi") match {
      case Success(_) => ()
      case Failure(e) =>
        LOG.error(s"Virhe asiakirjamallien modifioinnissa: ${e.getMessage}", e)
        throw new RuntimeException(s"Virhe asiakirjamallien modifioinnissa: ${e.getMessage}", e)
    }
  }

  def lisaaAsiakirjamalli(
    hakemusId: UUID,
    asiakirjamalli: AsiakirjamalliTutkinnosta,
    virkailijaOid: UserOid
  ): DBIO[Int] =
    sqlu"""
      INSERT INTO asiakirjamalli_tutkinnosta (hakemus_id, lahde, vastaavuus, kuvaus, luoja)
      VALUES (
        ${hakemusId.toString}::uuid,
        ${asiakirjamalli.lahde.toString}::asiakirja_malli_lahde,
        ${asiakirjamalli.vastaavuus},
        ${asiakirjamalli.kuvaus},
        ${virkailijaOid.toString}
      )
    """

  def muokkaaAsiakirjamallia(
    hakemusId: UUID,
    asiakirjamalli: AsiakirjamalliTutkinnosta,
    virkailijaOid: UserOid
  ): DBIO[Int] =
    sqlu"""
      UPDATE asiakirjamalli_tutkinnosta
      SET vastaavuus = ${asiakirjamalli.vastaavuus},
          kuvaus = ${asiakirjamalli.kuvaus},
          muokkaaja = ${virkailijaOid.toString}
      WHERE hakemus_id = ${hakemusId.toString}::uuid
        AND lahde = ${asiakirjamalli.lahde.toString}::asiakirja_malli_lahde
    """

  def poistaAsiakirjamalli(hakemusId: UUID, lahde: AsiakirjamalliLahde): DBIO[Int] =
    sqlu"""
      DELETE FROM asiakirjamalli_tutkinnosta
      WHERE hakemus_id = ${hakemusId.toString}::uuid
        AND lahde = ${lahde.toString}::asiakirja_malli_lahde
    """

    /**
     * Hakee hakemuksen asiakirjamallit tutkinnosta
     *
     * @param hakemusId
     * hakemuksen id
     * @return
     * hakemuksen asiakirjamallit tutkinnosta
     */
  def haeAsiakirjamallitTutkinnoistaHakemusOidilla(
    hakemusId: UUID
  ): Map[AsiakirjamalliLahde, AsiakirjamalliTutkinnosta] = {
    try {
      db.run(
        sql"""
          SELECT lahde, vastaavuus, kuvaus
          FROM asiakirjamalli_tutkinnosta
          WHERE hakemus_id = ${hakemusId.toString}::uuid
          ORDER BY luotu
        """.as[AsiakirjamalliTutkinnosta],
        "hae_hakemuksen_asiakirjamallit_tutkinnoista"
      ).map(malli => malli.lahde -> malli)
        .toMap
    } catch {
      case e: Exception =>
        LOG.error(s"Hakemuksen asiakirjamallien haku epäonnistui: ${e}")
        throw new RuntimeException(
          s"Hakemuksen asiakirjamallien haku epäonnistui: ${e.getMessage}",
          e
        )
    }
  }
}
