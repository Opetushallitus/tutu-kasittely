package fi.oph.tutu.backend

import fi.oph.tutu.backend.repository.HakemusRepository
import fi.oph.tutu.backend.controller.Controller
import fi.oph.tutu.backend.service.*
import fi.oph.tutu.backend.domain.*
import fi.oph.tutu.backend.utils.AuditLog
import fi.oph.tutu.backend.security.SecurityConstants

import org.junit.jupiter.api.*

import org.mockito.ArgumentMatchers.any
import org.mockito.Mockito.*

import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.security.test.context.support.WithMockUser
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf
import org.springframework.http.MediaType
import org.springframework.test.context.bean.`override`.mockito.MockitoBean
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.*

import java.util.Random;
import java.time.LocalDateTime
import java.util.UUID

val r = new Random();

def pick[T](items: Seq[T]): T = {
  val index = r.nextInt(items.length)
  items(index)
}

def pickBooleanOption: Option[Boolean] = {
  pick(Seq(Some(true), Some(false)))
}

def pickBoolean: Boolean = {
  pick(Seq(true, false))
}

def randomString: String = {
  UUID.randomUUID().toString()
}

def pickTutkinnonAsema: Option[String] = {
  pick(
    Seq(
      Some("alempi_korkeakouluaste"),
      Some("ylempi_korkeakouluaste"),
      Some("alempi_ja_ylempi_korkeakouluaste"),
      Some("tutkijakoulutusaste"),
      Some("ei_korkeakouluaste")
    )
  )
}

def makePerustelu(
  virallinenTutkinnonMyontaja: Option[Boolean] = pickBooleanOption,
  virallinenTutkinto: Option[Boolean] = pickBooleanOption,
  lahdeLahtomaanKansallinenLahde: Boolean = pickBoolean,
  lahdeLahtomaanVirallinenVastaus: Boolean = pickBoolean,
  lahdeKansainvalinenHakuteosTaiVerkkosivusto: Boolean = pickBoolean,
  selvitysTutkinnonMyontajastaJaTutkinnonVirallisuudesta: String = randomString,
  ylimmanTutkinnonAsemaLahtomaanJarjestelmassa: Option[String] = pickTutkinnonAsema,
  selvitysTutkinnonAsemastaLahtomaanJarjestelmassa: String = randomString
): Perustelu = {
  Perustelu(
    UUID.randomUUID(),
    UUID.randomUUID(),
    virallinenTutkinnonMyontaja,
    virallinenTutkinto,
    lahdeLahtomaanKansallinenLahde,
    lahdeLahtomaanVirallinenVastaus,
    lahdeKansainvalinenHakuteosTaiVerkkosivusto,
    selvitysTutkinnonMyontajastaJaTutkinnonVirallisuudesta,
    ylimmanTutkinnonAsemaLahtomaanJarjestelmassa,
    selvitysTutkinnonAsemastaLahtomaanJarjestelmassa,
    LocalDateTime.now(),
    "Hakemuspalvelu",
    Option(LocalDateTime.now()),
    Option("Hakemuspalvelu")
  )
}

@WebMvcTest(controllers = Array(classOf[Controller]))
class PerusteluControllerUnitTest {

  @MockitoBean
  private var hakemuspalveluService: HakemuspalveluService = _

  @MockitoBean
  private var hakemusRepository: HakemusRepository = _

  @MockitoBean
  private var hakemusService: HakemusService = _

  @MockitoBean
  private var userService: UserService = _

  @MockitoBean
  private var muistioService: MuistioService = _

  @MockitoBean
  private var perusteluService: PerusteluService = _

  @MockitoBean
  private var koodistoService: KoodistoService = _

  @MockitoBean
  private var auditLog: AuditLog = _

  @BeforeEach def setup(): Unit = {

    /**
     * TESTS WILL FAIL unless
     * all Controller dependencies have been touched
     * by a `when`-statement.
     *
     * This is due to MockitoBeans (above) not being
     * loaded without such statement.
     *
     * If a new dependency is added to Controller,
     * add it to the list below!
     */

    when(hakemuspalveluService.toString).thenCallRealMethod()
    when(hakemusRepository.toString).thenCallRealMethod()
    when(hakemusService.toString).thenCallRealMethod()
    when(userService.toString).thenCallRealMethod()
    when(muistioService.toString).thenCallRealMethod()
    when(perusteluService.toString).thenCallRealMethod()
    when(koodistoService.toString).thenCallRealMethod()
    when(auditLog.toString).thenCallRealMethod()

    doNothing().when(auditLog).logCreate(any, any, any, any)
    when(auditLog.getUser(any)).thenReturn(
      fi.vm.sade.auditlog.User(
        null,
        null,
        null,
        null
      )
    )
  }

  @Test
  @WithMockUser(value = "kayttaja", authorities = Array(SecurityConstants.SECURITY_ROOLI_ESITTELIJA_FULL))
  def haePerusteluPalauttaa200(@Autowired mvc: MockMvc): Unit = {
    val perustelu: Perustelu = makePerustelu();

    when(
      perusteluService.haePerustelu(any)
    ).thenReturn(
      Option(perustelu)
    )

    mvc
      .perform(
        get("/api/perustelu/000")
      )
      .andExpect(status().isOk)
      .andExpect(jsonPath("$.id").isString())
      .andExpect(jsonPath("$.hakemusId").isString())
      .andExpect(jsonPath("$.virallinenTutkinnonMyontaja").isBoolean())
      .andExpect(jsonPath("$.virallinenTutkinto").isBoolean())
      .andExpect(jsonPath("$.lahdeLahtomaanKansallinenLahde").isBoolean())
      .andExpect(jsonPath("$.lahdeLahtomaanVirallinenVastaus").isBoolean())
      .andExpect(jsonPath("$.lahdeKansainvalinenHakuteosTaiVerkkosivusto").isBoolean())
      .andExpect(jsonPath("$.selvitysTutkinnonMyontajastaJaTutkinnonVirallisuudesta").isString())
      .andExpect(jsonPath("$.ylimmanTutkinnonAsemaLahtomaanJarjestelmassa").isString())
      .andExpect(jsonPath("$.selvitysTutkinnonAsemastaLahtomaanJarjestelmassa").isString())
      .andExpect(jsonPath("$.luotu").isString())
      .andExpect(jsonPath("$.luoja").isString())
      .andExpect(jsonPath("$.muokattu").isString())
      .andExpect(jsonPath("$.muokkaaja").isString())
  }

  @Test
  @WithMockUser(value = "kayttaja", authorities = Array(SecurityConstants.SECURITY_ROOLI_ESITTELIJA_FULL))
  def haePerusteluPalauttaa404KunPerusteluaEiKannassa(@Autowired mvc: MockMvc): Unit = {
    when(
      perusteluService.haePerustelu(any)
    ).thenReturn(
      None
    )

    mvc
      .perform(
        get("/api/perustelu/000")
      )
      .andExpect(status().isNotFound)
  }

  @Test
  @WithMockUser(value = "kayttaja", authorities = Array(SecurityConstants.SECURITY_ROOLI_ESITTELIJA_FULL))
  def tallennaPerusteluPalauttaa200JaKantaanTallennetunDatan(@Autowired mvc: MockMvc): Unit = {
    val perustelu: Perustelu  = makePerustelu();
    val perusteluJSON: String = s"""{
      "id": "${perustelu.id.toString}",
      "hakemusId": "${perustelu.hakemusId.toString}",
      "virallinenTutkinnonMyontaja": ${perustelu.virallinenTutkinnonMyontaja.getOrElse(null)},
      "virallinenTutkinto":  ${perustelu.virallinenTutkinto.getOrElse(null)},
      "lahdeLahtomaanKansallinenLahde": ${perustelu.lahdeLahtomaanKansallinenLahde},
      "lahdeLahtomaanVirallinenVastaus": ${perustelu.lahdeLahtomaanVirallinenVastaus},
      "lahdeKansainvalinenHakuteosTaiVerkkosivusto": ${perustelu.lahdeKansainvalinenHakuteosTaiVerkkosivusto},
      "selvitysTutkinnonMyontajastaJaTutkinnonVirallisuudesta": "${perustelu.selvitysTutkinnonMyontajastaJaTutkinnonVirallisuudesta}",
      "ylimmanTutkinnonAsemaLahtomaanJarjestelmassa": "${perustelu.ylimmanTutkinnonAsemaLahtomaanJarjestelmassa
        .getOrElse(null)}",
      "selvitysTutkinnonAsemastaLahtomaanJarjestelmassa": "${perustelu.selvitysTutkinnonAsemastaLahtomaanJarjestelmassa}",
      "luotu": "${perustelu.luotu.toString}",
      "luoja": "${perustelu.luoja.toString}",
      "muokattu": ${perustelu.muokattu.map(date => s"\"${date.toString}\"").getOrElse(null)},
      "muokkaaja": "${perustelu.muokkaaja.toString}"
    }"""

    when(
      perusteluService.tallennaPerustelu(any, any, any)
    ).thenReturn(
      Option(perustelu)
    )

    when(
      userService.getEnrichedUserDetails(any)
    ).thenReturn(
      User(
        userOid = "test user",
        authorities = List()
      )
    )

    mvc
      .perform(
        post("/api/perustelu/000")
          .`with`(csrf())
          .contentType(MediaType.APPLICATION_JSON)
          .content(perusteluJSON)
      )
      .andExpect(status().isOk)
      .andExpect(jsonPath("$.id").isString())
      .andExpect(jsonPath("$.hakemusId").isString())
      .andExpect(jsonPath("$.virallinenTutkinnonMyontaja").isBoolean())
      .andExpect(jsonPath("$.virallinenTutkinto").isBoolean())
      .andExpect(jsonPath("$.lahdeLahtomaanKansallinenLahde").isBoolean())
      .andExpect(jsonPath("$.lahdeLahtomaanVirallinenVastaus").isBoolean())
      .andExpect(jsonPath("$.lahdeKansainvalinenHakuteosTaiVerkkosivusto").isBoolean())
      .andExpect(jsonPath("$.selvitysTutkinnonMyontajastaJaTutkinnonVirallisuudesta").isString())
      .andExpect(jsonPath("$.ylimmanTutkinnonAsemaLahtomaanJarjestelmassa").isString())
      .andExpect(jsonPath("$.selvitysTutkinnonAsemastaLahtomaanJarjestelmassa").isString())
      .andExpect(jsonPath("$.luotu").isString())
      .andExpect(jsonPath("$.luoja").isString())
      .andExpect(jsonPath("$.muokattu").isString())
      .andExpect(jsonPath("$.muokkaaja").isString())
  }
}
