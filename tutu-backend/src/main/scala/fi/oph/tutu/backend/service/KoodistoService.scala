package fi.oph.tutu.backend.service

import fi.oph.tutu.backend.TutuBackendApplication.CALLER_ID
import fi.oph.tutu.backend.domain.KoodistoItem
import fi.oph.tutu.backend.utils.TutuJsonFormats
import fi.vm.sade.javautils.nio.cas.{CasClient, CasClientBuilder, CasConfig}
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.beans.factory.annotation.{Autowired, Value}
import org.springframework.cache.CacheManager
import org.springframework.cache.annotation.{CacheEvict, CachePut, Cacheable}
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.{Component, Service}
import org.json4s.*
import org.json4s.Extraction.extract
import org.json4s.native.JsonMethods.*

@Component
@Service
class KoodistoService(httpService: HttpService, maakoodiService: MaakoodiService) extends TutuJsonFormats {
  val LOG: Logger = LoggerFactory.getLogger(classOf[KoodistoService])

  @Value("${opintopolku.virkailija.url}")
  val opintopolku_virkailija_domain: String = null

  @Value("${tutu.backend.cas.username}")
  val cas_username: String = null

  @Value("${tutu.backend.cas.password}")
  val cas_password: String = null

  @Autowired
  val cacheManager: CacheManager = null

  private lazy val koodistoCasClient: CasClient = CasClientBuilder.build(
    CasConfig
      .CasConfigBuilder(
        cas_username,
        cas_password,
        s"$opintopolku_virkailija_domain/cas",
        s"$opintopolku_virkailija_domain/koodisto-service",
        CALLER_ID,
        CALLER_ID,
        "/j_spring_cas_security_check"
      )
      .setJsessionName("SESSION")
      .build()
  )

  @Cacheable(value = Array("koodisto"))
  def getKoodisto(koodisto: String): Seq[KoodistoItem] = {
    val items = httpService.get(
      koodistoCasClient,
      s"$opintopolku_virkailija_domain/koodisto-service/rest/json/$koodisto/koodi"
    ) match {
      case Left(error: Throwable) =>
        LOG.error(s"Koodiston $koodisto haku epäonnistui: ${error.getMessage}")
        Seq.empty[KoodistoItem]
      case Right(response: String) =>
        parse(response) match {
          case JArray(values) =>
            values.map(item => extract[KoodistoItem](item))
          case _ => throw new MappingException(s"Cannot deserialize koodisto response")
        }
    }
    if (koodisto == "maatjavaltiot2") {
      try {
        maakoodiService.syncMaakoodit(items, "Koodistopalvelu")
      } catch {
        case e: Exception => LOG.error("Maakoodi DB sync failed after koodisto fetch", e)
      }
    }
    items
  }

  /**
   * Hakee koodiston relaatiot
   * @param koodiUri Koodisto URI (esim. "oppilaitosnumero_03117" tai "kunta_091")
   * @return Either virhe tai JSON-vastaus merkkijonona
   */
  @Cacheable(value = Array("koodistoRelaatiot"), key = "#koodiUri")
  def getKoodistoRelaatiot(koodiUri: String): Either[Throwable, String] = {
    val url = s"$opintopolku_virkailija_domain/koodisto-service/rest/json/relaatio/sisaltyy-alakoodit/$koodiUri"
    httpService.get(koodistoCasClient, url)
  }

  @CacheEvict(value = Array("koodisto", "koodistoRelaatiot"), allEntries = true)
  @Scheduled(fixedRateString = "${caching.spring.dayTTL}")
  def emptyKoodistoCache(): Unit =
    LOG.info("Emptying koodisto-cache and koodistoRelaatiot-cache")

  @CachePut(Array("koodisto"))
  private def updateCached(koodisto: String, value: String): Unit = {
    val koodistoCache = cacheManager.getCache("koodisto")
    koodistoCache.put(koodisto, value)
  }

  /**
   * Hakee oppilaitosnumero-koodit oppilaitostyypin perusteella
   * käyttäen codeelement-rajapintaa joka palauttaa withinCodeElements
   */
  private def haeKorkeakouluTyypinOppilaitokset(oppilaitostyyppiUri: String): Set[String] = {
    val url = s"$opintopolku_virkailija_domain/koodisto-service/rest/codeelement/$oppilaitostyyppiUri/1"
    httpService.get(koodistoCasClient, url) match {
      case Right(responseJson) =>
        try {
          val json = parse(responseJson)
          (json \ "withinCodeElements") match {
            case JArray(elements) =>
              elements.flatMap { element =>
                (element \ "codeElementUri").extractOpt[String].filter(_.startsWith("oppilaitosnumero_"))
              }.toSet
            case _ =>
              LOG.warn(s"withinCodeElements ei löytynyt tai ei ole JArray: $oppilaitostyyppiUri")
              Set.empty
          }
        } catch {
          case e: Exception =>
            LOG.warn(s"Codeelement-vastauksen parsinta epäonnistui: $oppilaitostyyppiUri", e)
            Set.empty
        }
      case Left(error) =>
        LOG.warn(s"Codeelement-haku epäonnistui: $oppilaitostyyppiUri", error)
        Set.empty
    }
  }

  /**
   * Hakee kaikki Suomen korkeakoulut (yliopistot ja ammattikorkeakoulut)
   *
   * Tekee kaksi API-kutsua oppilaitostyyppi codeelement-rajapintaan:
   * - oppilaitostyyppi_42 (Yliopistot) → palauttaa yliopistot withinCodeElements-kentässä
   * - oppilaitostyyppi_41 (Ammattikorkeakoulut) → palauttaa AMK:t withinCodeElements-kentässä
   *
   * Yhdistää tulokset paikallisesti oppilaitosnumero-koodiston kanssa.
   */
  @Cacheable(value = Array("korkeakoulut"), unless = "#result.isEmpty()")
  def haeKorkeakoulut(): Seq[KoodistoItem] = {
    val oppilaitokset = getKoodisto("oppilaitosnumero")

    if (oppilaitokset.isEmpty) {
      LOG.warn("Korkeakoulujen haku epäonnistui: oppilaitosnumero-koodisto on tyhjä")
      return Seq.empty
    }

    val yliopistoKoodit   = haeKorkeakouluTyypinOppilaitokset("oppilaitostyyppi_42") // Yliopistot
    val amkKoodit         = haeKorkeakouluTyypinOppilaitokset("oppilaitostyyppi_41") // Ammattikorkeakoulut
    val korkeakouluKoodit = yliopistoKoodit ++ amkKoodit

    LOG.info(s"Yliopistoja: ${yliopistoKoodit.size}, AMK:ita: ${amkKoodit.size}, yhteensä: ${korkeakouluKoodit.size}")

    // Koodistossa on paljon historiallisia korkeakouluja jotka ei ole enää olemassa
    val korkeakoulut = oppilaitokset
      .filter(_.isValid())
      .filter(oppilaitos => korkeakouluKoodit.contains(oppilaitos.koodiUri))

    LOG.info(s"Voimassa olevia korkeakouluja: ${korkeakoulut.size}")

    korkeakoulut
  }
}
