package fi.oph.tutu.backend

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule
import com.fasterxml.jackson.module.scala.DefaultScalaModule
import fi.oph.tutu.backend.controller.Controller
import fi.oph.tutu.backend.domain.*
import fi.oph.tutu.backend.repository.HakemusRepository
import fi.oph.tutu.backend.security.SecurityConstants
import fi.oph.tutu.backend.service.*
import fi.oph.tutu.backend.utils.AuditLog
import org.junit.jupiter.api.*
import org.mockito.ArgumentMatchers.any
import org.mockito.Mockito.*
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.http.MediaType
import org.springframework.security.test.context.support.WithMockUser
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf
import org.springframework.test.context.bean.`override`.mockito.MockitoBean
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.*

import java.time.LocalDateTime
import java.util.{Random, UUID}

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
  UUID.randomUUID().toString
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
    perusteluId,
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

def makePerusteluWithUoro(
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
    perusteluId,
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
    Option("Hakemuspalvelu"),
    None,
    Some(
      PerusteluUoRo(
        UUID.randomUUID(),
        perusteluId,
        PerusteluUoRoSisalto(
          false,
          false,
          true,
          false,
          true,
          false,
          false,
          true,
          false,
          false,
          false,
          false,
          true,
          Some("eipä vissii"),
          false,
          false,
          false,
          true,
          true,
          Some("näin on"),
          true,
          false,
          true,
          true,
          Some("ei voi"),
          true,
          true,
          true,
          true,
          true,
          true,
          true,
          true,
          true,
          true,
          Some("se on just nii")
        ),
        LocalDateTime.now(),
        "Hakemuspalvelu",
        Option(LocalDateTime.now()),
        Option("Hakemuspalvelu")
      )
    )
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

  val mapper = new ObjectMapper()
  mapper.registerModule(DefaultScalaModule)
  mapper.registerModule(new JavaTimeModule())

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
      .andExpect(jsonPath("$.id").isString)
      .andExpect(jsonPath("$.hakemusId").isString)
      .andExpect(jsonPath("$.virallinenTutkinnonMyontaja").isBoolean)
      .andExpect(jsonPath("$.virallinenTutkinto").isBoolean)
      .andExpect(jsonPath("$.lahdeLahtomaanKansallinenLahde").isBoolean)
      .andExpect(jsonPath("$.lahdeLahtomaanVirallinenVastaus").isBoolean)
      .andExpect(jsonPath("$.lahdeKansainvalinenHakuteosTaiVerkkosivusto").isBoolean)
      .andExpect(jsonPath("$.selvitysTutkinnonMyontajastaJaTutkinnonVirallisuudesta").isString)
      .andExpect(jsonPath("$.ylimmanTutkinnonAsemaLahtomaanJarjestelmassa").isString)
      .andExpect(jsonPath("$.selvitysTutkinnonAsemastaLahtomaanJarjestelmassa").isString)
      .andExpect(jsonPath("$.luotu").isString)
      .andExpect(jsonPath("$.luoja").isString)
      .andExpect(jsonPath("$.muokattu").isString)
      .andExpect(jsonPath("$.muokkaaja").isString)
      .andExpect(jsonPath("$.perusteluUoRo").isEmpty)
  }

  @Test
  @WithMockUser(value = "kayttaja", authorities = Array(SecurityConstants.SECURITY_ROOLI_ESITTELIJA_FULL))
  def haePerusteluWithUoroPalauttaa200(@Autowired mvc: MockMvc): Unit = {
    val perusteluWithUoro: Perustelu = makePerusteluWithUoro();

    when(
      perusteluService.haePerustelu(any)
    ).thenReturn(
      Option(perusteluWithUoro)
    )

    mvc
      .perform(
        get("/api/perustelu/000")
      )
      .andExpect(status().isOk)
      .andExpect(jsonPath("$.id").isString)
      .andExpect(jsonPath("$.hakemusId").isString)
      .andExpect(jsonPath("$.perusteluUoRo").isNotEmpty)
      .andExpect(jsonPath("$.perusteluUoRo.id").isString)
      .andExpect(jsonPath("$.perusteluUoRo.perusteluId").isString)
      .andExpect(jsonPath("$.perusteluUoRo.perustelunSisalto").isNotEmpty)
      .andExpect(jsonPath("$.perusteluUoRo.perustelunSisalto.opettajatEroMonialaisetOpinnotSisalto").isBoolean)
      .andExpect(jsonPath("$.perusteluUoRo.perustelunSisalto.opettajatEroMonialaisetOpinnotLaajuus").isBoolean)
      .andExpect(jsonPath("$.perusteluUoRo.perustelunSisalto.opettajatEroPedagogisetOpinnotSisalto").isBoolean)
      .andExpect(jsonPath("$.perusteluUoRo.perustelunSisalto.opettajatEroPedagogisetOpinnotLaajuus").isBoolean)
      .andExpect(jsonPath("$.perusteluUoRo.perustelunSisalto.opettajatEroKasvatustieteellisetOpinnotSisalto").isBoolean)
      .andExpect(
        jsonPath("$.perusteluUoRo.perustelunSisalto.opettajatEroKasvatustieteellisetOpinnotVaativuus").isBoolean
      )
      .andExpect(jsonPath("$.perusteluUoRo.perustelunSisalto.opettajatEroKasvatustieteellisetOpinnotLaajuus").isBoolean)
      .andExpect(jsonPath("$.perusteluUoRo.perustelunSisalto.opettajatEroOpetettavatAineetOpinnotSisalto").isBoolean)
      .andExpect(jsonPath("$.perusteluUoRo.perustelunSisalto.opettajatEroOpetettavatAineetOpinnotVaativuus").isBoolean)
      .andExpect(jsonPath("$.perusteluUoRo.perustelunSisalto.opettajatEroOpetettavatAineetOpinnotLaajuus").isBoolean)
      .andExpect(jsonPath("$.perusteluUoRo.perustelunSisalto.opettajatEroErityisopettajanOpinnotSisalto").isBoolean)
      .andExpect(jsonPath("$.perusteluUoRo.perustelunSisalto.opettajatEroErityisopettajanOpinnotLaajuus").isBoolean)
      .andExpect(jsonPath("$.perusteluUoRo.perustelunSisalto.opettajatMuuEro").isBoolean)
      .andExpect(jsonPath("$.perusteluUoRo.perustelunSisalto.opettajatMuuEroSelite").isString)
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
      "virallinenTutkinnonMyontaja": ${perustelu.virallinenTutkinnonMyontaja.orNull},
      "virallinenTutkinto":  ${perustelu.virallinenTutkinto.orNull},
      "lahdeLahtomaanKansallinenLahde": ${perustelu.lahdeLahtomaanKansallinenLahde},
      "lahdeLahtomaanVirallinenVastaus": ${perustelu.lahdeLahtomaanVirallinenVastaus},
      "lahdeKansainvalinenHakuteosTaiVerkkosivusto": ${perustelu.lahdeKansainvalinenHakuteosTaiVerkkosivusto},
      "selvitysTutkinnonMyontajastaJaTutkinnonVirallisuudesta": "${perustelu.selvitysTutkinnonMyontajastaJaTutkinnonVirallisuudesta}",
      "ylimmanTutkinnonAsemaLahtomaanJarjestelmassa": "${perustelu.ylimmanTutkinnonAsemaLahtomaanJarjestelmassa.orNull}",
      "selvitysTutkinnonAsemastaLahtomaanJarjestelmassa": "${perustelu.selvitysTutkinnonAsemastaLahtomaanJarjestelmassa}",
      "luotu": "${perustelu.luotu.toString}",
      "luoja": "${perustelu.luoja.toString}",
      "muokattu": ${perustelu.muokattu.map(date => s"\"${date.toString}\"").orNull},
      "muokkaaja": "${perustelu.muokkaaja.toString}",
      "perusteluUoRo": {}
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
      .andExpect(jsonPath("$.id").isString)
      .andExpect(jsonPath("$.hakemusId").isString)
      .andExpect(jsonPath("$.virallinenTutkinnonMyontaja").isBoolean)
      .andExpect(jsonPath("$.virallinenTutkinto").isBoolean)
      .andExpect(jsonPath("$.lahdeLahtomaanKansallinenLahde").isBoolean)
      .andExpect(jsonPath("$.lahdeLahtomaanVirallinenVastaus").isBoolean)
      .andExpect(jsonPath("$.lahdeKansainvalinenHakuteosTaiVerkkosivusto").isBoolean)
      .andExpect(jsonPath("$.selvitysTutkinnonMyontajastaJaTutkinnonVirallisuudesta").isString)
      .andExpect(jsonPath("$.ylimmanTutkinnonAsemaLahtomaanJarjestelmassa").isString)
      .andExpect(jsonPath("$.selvitysTutkinnonAsemastaLahtomaanJarjestelmassa").isString)
      .andExpect(jsonPath("$.luotu").isString)
      .andExpect(jsonPath("$.luoja").isString)
      .andExpect(jsonPath("$.muokattu").isString)
      .andExpect(jsonPath("$.muokkaaja").isString)
  }

  @Test
  @WithMockUser(value = "kayttaja", authorities = Array(SecurityConstants.SECURITY_ROOLI_ESITTELIJA_FULL))
  def tallennaPerusteluWithUoRoPalauttaa200JaKantaanTallennetunDatan(@Autowired mvc: MockMvc): Unit = {
    val perusteluWithUoro: Perustelu = makePerusteluWithUoro();
    val perusteluJSON                = mapper.writeValueAsString(perusteluWithUoro)

    when(
      perusteluService.tallennaPerustelu(any, any, any)
    ).thenReturn(
      Option(perusteluWithUoro)
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
      .andExpect(jsonPath("$.id").isString)
      .andExpect(jsonPath("$.hakemusId").isString)
      .andExpect(jsonPath("$.virallinenTutkinnonMyontaja").isBoolean)
      .andExpect(jsonPath("$.virallinenTutkinto").isBoolean)
      .andExpect(jsonPath("$.lahdeLahtomaanKansallinenLahde").isBoolean)
      .andExpect(jsonPath("$.lahdeLahtomaanVirallinenVastaus").isBoolean)
      .andExpect(jsonPath("$.lahdeKansainvalinenHakuteosTaiVerkkosivusto").isBoolean)
      .andExpect(jsonPath("$.selvitysTutkinnonMyontajastaJaTutkinnonVirallisuudesta").isString)
      .andExpect(jsonPath("$.ylimmanTutkinnonAsemaLahtomaanJarjestelmassa").isString)
      .andExpect(jsonPath("$.selvitysTutkinnonAsemastaLahtomaanJarjestelmassa").isString)
      .andExpect(jsonPath("$.luotu").isString)
      .andExpect(jsonPath("$.luoja").isString)
      .andExpect(jsonPath("$.muokattu").isString)
      .andExpect(jsonPath("$.muokkaaja").isString)
      .andExpect(jsonPath("$.perusteluUoRo").isNotEmpty)
      .andExpect(jsonPath("$.perusteluUoRo.id").isString)
      .andExpect(jsonPath("$.perusteluUoRo.perusteluId").isString)
      .andExpect(jsonPath("$.perusteluUoRo.perustelunSisalto").isNotEmpty)
      .andExpect(jsonPath("$.perusteluUoRo.perustelunSisalto.opettajatEroMonialaisetOpinnotSisalto").isBoolean)
      .andExpect(jsonPath("$.perusteluUoRo.perustelunSisalto.opettajatEroMonialaisetOpinnotLaajuus").isBoolean)
      .andExpect(jsonPath("$.perusteluUoRo.perustelunSisalto.opettajatEroPedagogisetOpinnotSisalto").isBoolean)
      .andExpect(jsonPath("$.perusteluUoRo.perustelunSisalto.opettajatEroPedagogisetOpinnotLaajuus").isBoolean)
      .andExpect(jsonPath("$.perusteluUoRo.perustelunSisalto.opettajatEroKasvatustieteellisetOpinnotSisalto").isBoolean)
      .andExpect(
        jsonPath("$.perusteluUoRo.perustelunSisalto.opettajatEroKasvatustieteellisetOpinnotVaativuus").isBoolean
      )
      .andExpect(jsonPath("$.perusteluUoRo.perustelunSisalto.opettajatEroKasvatustieteellisetOpinnotLaajuus").isBoolean)
      .andExpect(jsonPath("$.perusteluUoRo.perustelunSisalto.opettajatEroOpetettavatAineetOpinnotSisalto").isBoolean)
      .andExpect(jsonPath("$.perusteluUoRo.perustelunSisalto.opettajatEroOpetettavatAineetOpinnotVaativuus").isBoolean)
      .andExpect(jsonPath("$.perusteluUoRo.perustelunSisalto.opettajatEroOpetettavatAineetOpinnotLaajuus").isBoolean)
      .andExpect(jsonPath("$.perusteluUoRo.perustelunSisalto.opettajatEroErityisopettajanOpinnotSisalto").isBoolean)
      .andExpect(jsonPath("$.perusteluUoRo.perustelunSisalto.opettajatEroErityisopettajanOpinnotLaajuus").isBoolean)
      .andExpect(jsonPath("$.perusteluUoRo.perustelunSisalto.opettajatMuuEro").isBoolean)
      .andExpect(jsonPath("$.perusteluUoRo.perustelunSisalto.opettajatMuuEroSelite").isString)
  }
}
