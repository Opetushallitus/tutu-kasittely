package fi.oph.tutu.backend.service

import fi.oph.tutu.backend.domain.*
import fi.oph.tutu.backend.fixture.{ataruHakemusFixture, dbHakemusFixture}
import fi.oph.tutu.backend.repository.{AsiakirjaRepository, ValitustiedotRepository}
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.{BeforeEach, Test}
import org.mockito.ArgumentMatchers.any
import org.mockito.Mockito.{mock, when}

import java.time.LocalDateTime
import java.util.UUID

class KasittelyVaiheServiceTest {

  private val now         = LocalDateTime.now()
  private val hakemusId   = UUID.randomUUID()
  private val asiakirjaId = UUID.randomUUID()

  private var asiakirjaRepository: AsiakirjaRepository         = _
  private var valitustiedotRepository: ValitustiedotRepository = _
  private var kasittelyVaiheService: KasittelyVaiheService     = _
  private val dbHakemus    = dbHakemusFixture.copy(id = hakemusId, asiakirjaId = Some(asiakirjaId))
  private val ataruHakemus =
    ataruHakemusFixture.copy(submitted = "2026-01-29T14:30:45.597Z", latestVersionCreated = "2026-01-29T14:30:45.597Z")

  private def ataruHakemusInTila(ataruHakemuksenTila: String): AtaruHakemus =
    ataruHakemus.copy(`application-hakukohde-reviews` = Seq(HakukohdeReview("", ataruHakemuksenTila, "")))

  private def valitustiedotWithKho(valitusKHO: ValitusKHO): Valitustiedot =
    Valitustiedot(valitusOPH = ValitusOPH(), valitusHaO = ValitusHaO(), valitusKHO = valitusKHO)

  private def valitustiedotWithHao(valitusHaO: ValitusHaO): Valitustiedot =
    Valitustiedot(valitusOPH = ValitusOPH(), valitusHaO = valitusHaO, valitusKHO = ValitusKHO())

  @BeforeEach
  def setUp(): Unit = {
    asiakirjaRepository = mock(classOf[AsiakirjaRepository])
    valitustiedotRepository = mock(classOf[ValitustiedotRepository])
    when(valitustiedotRepository.haeValitustiedot(any())).thenReturn(None)
    kasittelyVaiheService = new KasittelyVaiheService(asiakirjaRepository, valitustiedotRepository)
  }

  @Test
  def testResolveReturnsOdottaaTaydennysta(): Unit = {
    val tiedot = KasittelyVaiheTiedot(
      selvityksetSaatu = false,
      vahvistusPyyntoLahetetty = None,
      vahvistusSaatu = None,
      imiPyyntoLahetetty = None,
      imiPyyntoVastattu = None,
      lausuntoKesken = false,
      paatosHyvaksymispaiva = None,
      paatosLahetyspaiva = None,
      paatostekstiVahvistettu = None
    )

    when(asiakirjaRepository.haeKasittelyVaiheTiedot(Some(asiakirjaId), hakemusId))
      .thenReturn(Some(tiedot))

    val result =
      kasittelyVaiheService.resolveKasittelyVaihe(
        dbHakemus.copy(viimeisinTaydennyspyyntoPvm = Some(LocalDateTime.parse("2026-01-29T18:30:45.597"))),
        ataruHakemusInTila("information-request")
      )

    assertEquals(KasittelyVaihe.OdottaaTaydennysta, result)
  }

  @Test
  def testResolveReturnsOdottaaVahvistusta(): Unit = {
    val tiedot = KasittelyVaiheTiedot(
      selvityksetSaatu = false,
      vahvistusPyyntoLahetetty = Some(now),
      vahvistusSaatu = None,
      imiPyyntoLahetetty = None,
      imiPyyntoVastattu = None,
      lausuntoKesken = false,
      paatosHyvaksymispaiva = None,
      paatosLahetyspaiva = None,
      paatostekstiVahvistettu = None
    )

    when(asiakirjaRepository.haeKasittelyVaiheTiedot(Some(asiakirjaId), hakemusId))
      .thenReturn(Some(tiedot))

    val result =
      kasittelyVaiheService.resolveKasittelyVaihe(dbHakemus, ataruHakemusInTila("processing-fee-paid"))

    assertEquals(KasittelyVaihe.OdottaaVahvistusta, result)
  }

  @Test
  def testResolveReturnsOdottaaLausuntoa(): Unit = {
    val tiedot = KasittelyVaiheTiedot(
      selvityksetSaatu = false,
      vahvistusPyyntoLahetetty = None,
      vahvistusSaatu = None,
      imiPyyntoLahetetty = None,
      imiPyyntoVastattu = None,
      lausuntoKesken = true,
      paatosHyvaksymispaiva = None,
      paatosLahetyspaiva = None,
      paatostekstiVahvistettu = None
    )

    when(asiakirjaRepository.haeKasittelyVaiheTiedot(Some(asiakirjaId), hakemusId))
      .thenReturn(Some(tiedot))

    val result =
      kasittelyVaiheService.resolveKasittelyVaihe(dbHakemus, ataruHakemusInTila("processing-fee-paid"))

    assertEquals(KasittelyVaihe.OdottaaLausuntoa, result)
  }

  @Test
  def testResolveReturnsOdottaaIMIVastausta(): Unit = {
    val tiedot = KasittelyVaiheTiedot(
      selvityksetSaatu = false,
      vahvistusPyyntoLahetetty = None,
      vahvistusSaatu = None,
      imiPyyntoLahetetty = Some(now),
      imiPyyntoVastattu = None,
      lausuntoKesken = false,
      paatosHyvaksymispaiva = None,
      paatosLahetyspaiva = None,
      paatostekstiVahvistettu = None
    )

    when(asiakirjaRepository.haeKasittelyVaiheTiedot(Some(asiakirjaId), hakemusId))
      .thenReturn(Some(tiedot))

    val result =
      kasittelyVaiheService.resolveKasittelyVaihe(dbHakemus, ataruHakemusInTila("processing-fee-paid"))

    assertEquals(KasittelyVaihe.OdottaaIMIVastausta, result)
  }

  @Test
  def testResolveReturnsHakemustaTaydennetty(): Unit = {
    val tiedot = KasittelyVaiheTiedot(
      selvityksetSaatu = false,
      vahvistusPyyntoLahetetty = None,
      vahvistusSaatu = None,
      imiPyyntoLahetetty = None,
      imiPyyntoVastattu = None,
      lausuntoKesken = false,
      paatosHyvaksymispaiva = None,
      paatosLahetyspaiva = None,
      paatostekstiVahvistettu = None
    )

    when(asiakirjaRepository.haeKasittelyVaiheTiedot(Some(asiakirjaId), hakemusId))
      .thenReturn(Some(tiedot))

    val result = kasittelyVaiheService.resolveKasittelyVaihe(
      dbHakemus.copy(viimeisinTaydennyspyyntoPvm = Some(LocalDateTime.parse("2026-01-29T18:30:45.597"))),
      ataruHakemusInTila("information-request").copy(latestVersionCreated = "2026-01-29T19:30:45.597Z")
    )

    assertEquals(KasittelyVaihe.HakemustaTaydennetty, result)
  }

  @Test
  def testResolveReturnsValmisKasiteltavaksi(): Unit = {
    val tiedot = KasittelyVaiheTiedot(
      selvityksetSaatu = true,
      vahvistusPyyntoLahetetty = None,
      vahvistusSaatu = None,
      imiPyyntoLahetetty = None,
      imiPyyntoVastattu = None,
      lausuntoKesken = false,
      paatosHyvaksymispaiva = None,
      paatosLahetyspaiva = None,
      paatostekstiVahvistettu = None
    )

    when(asiakirjaRepository.haeKasittelyVaiheTiedot(Some(asiakirjaId), hakemusId))
      .thenReturn(Some(tiedot))
    val result =
      kasittelyVaiheService.resolveKasittelyVaihe(dbHakemus, ataruHakemusInTila("processing-fee-paid"))

    assertEquals(KasittelyVaihe.ValmisKasiteltavaksi, result)
  }

  @Test
  def testResolveReturnsAlkukasittelyKeskenWhenNoConditions(): Unit = {
    val tiedot = KasittelyVaiheTiedot(
      selvityksetSaatu = false,
      vahvistusPyyntoLahetetty = None,
      vahvistusSaatu = None,
      imiPyyntoLahetetty = None,
      imiPyyntoVastattu = None,
      lausuntoKesken = false,
      paatosHyvaksymispaiva = None,
      paatosLahetyspaiva = None,
      paatostekstiVahvistettu = None
    )

    when(asiakirjaRepository.haeKasittelyVaiheTiedot(Some(asiakirjaId), hakemusId))
      .thenReturn(Some(tiedot))

    val result =
      kasittelyVaiheService.resolveKasittelyVaihe(dbHakemus, ataruHakemusInTila("processing-fee-paid"))

    assertEquals(KasittelyVaihe.AlkukasittelyKesken, result)
  }

  @Test
  def testResolveVahvistusReceivedWithoutSelvityksetReturnsAlkukasittelyKesken(): Unit = {
    val tiedot = KasittelyVaiheTiedot(
      selvityksetSaatu = false,
      vahvistusPyyntoLahetetty = Some(now),
      vahvistusSaatu = Some(now.plusDays(1)),
      imiPyyntoLahetetty = None,
      imiPyyntoVastattu = None,
      lausuntoKesken = false,
      paatosHyvaksymispaiva = None,
      paatosLahetyspaiva = None,
      paatostekstiVahvistettu = None
    )

    when(asiakirjaRepository.haeKasittelyVaiheTiedot(Some(asiakirjaId), hakemusId))
      .thenReturn(Some(tiedot))

    val result =
      kasittelyVaiheService.resolveKasittelyVaihe(dbHakemus, ataruHakemusInTila("processing-fee-paid"))

    assertEquals(KasittelyVaihe.AlkukasittelyKesken, result)
  }

  @Test
  def testResolveLausuntoReceivedWithoutSelvityksetReturnsAlkukasittelyKesken(): Unit = {
    val tiedot = KasittelyVaiheTiedot(
      selvityksetSaatu = false,
      vahvistusPyyntoLahetetty = None,
      vahvistusSaatu = None,
      imiPyyntoLahetetty = None,
      imiPyyntoVastattu = None,
      lausuntoKesken = false,
      paatosHyvaksymispaiva = None,
      paatosLahetyspaiva = None,
      paatostekstiVahvistettu = None
    )

    when(asiakirjaRepository.haeKasittelyVaiheTiedot(Some(asiakirjaId), hakemusId))
      .thenReturn(Some(tiedot))

    val result =
      kasittelyVaiheService.resolveKasittelyVaihe(dbHakemus, ataruHakemusInTila("processing-fee-paid"))

    assertEquals(KasittelyVaihe.AlkukasittelyKesken, result)
  }

  @Test
  def testResolveIMIVastattuWithoutSelvityksetReturnsAlkukasittelyKesken(): Unit = {
    val tiedot = KasittelyVaiheTiedot(
      selvityksetSaatu = false,
      vahvistusPyyntoLahetetty = None,
      vahvistusSaatu = None,
      imiPyyntoLahetetty = Some(now),
      imiPyyntoVastattu = Some(now.plusWeeks(1)),
      lausuntoKesken = false,
      paatosHyvaksymispaiva = None,
      paatosLahetyspaiva = None,
      paatostekstiVahvistettu = None
    )

    when(asiakirjaRepository.haeKasittelyVaiheTiedot(Some(asiakirjaId), hakemusId))
      .thenReturn(Some(tiedot))

    val result =
      kasittelyVaiheService.resolveKasittelyVaihe(dbHakemus, ataruHakemusInTila("processing-fee-paid"))

    assertEquals(KasittelyVaihe.AlkukasittelyKesken, result)
  }

  @Test
  def testResolvePrioritizesTaydennysPyyntoOverOtherPendingRequests(): Unit = {
    val tiedot = KasittelyVaiheTiedot(
      selvityksetSaatu = false,
      vahvistusPyyntoLahetetty = Some(now),
      vahvistusSaatu = None,
      imiPyyntoLahetetty = Some(now),
      imiPyyntoVastattu = None,
      lausuntoKesken = true,
      paatosHyvaksymispaiva = None,
      paatosLahetyspaiva = None,
      paatostekstiVahvistettu = None
    )

    when(asiakirjaRepository.haeKasittelyVaiheTiedot(Some(asiakirjaId), hakemusId))
      .thenReturn(Some(tiedot))

    val result = kasittelyVaiheService.resolveKasittelyVaihe(
      dbHakemus.copy(viimeisinTaydennyspyyntoPvm = Some(LocalDateTime.parse("2026-01-29T18:30:45.597"))),
      ataruHakemusInTila("information-request")
    )

    assertEquals(KasittelyVaihe.OdottaaTaydennysta, result)
  }

  @Test
  def testResolvePrioritizesVahvistusOverLausunto(): Unit = {
    val tiedot = KasittelyVaiheTiedot(
      selvityksetSaatu = false,
      vahvistusPyyntoLahetetty = Some(now),
      vahvistusSaatu = None,
      imiPyyntoLahetetty = None,
      imiPyyntoVastattu = None,
      lausuntoKesken = true,
      paatosHyvaksymispaiva = None,
      paatosLahetyspaiva = None,
      paatostekstiVahvistettu = None
    )

    when(asiakirjaRepository.haeKasittelyVaiheTiedot(Some(asiakirjaId), hakemusId))
      .thenReturn(Some(tiedot))

    val result =
      kasittelyVaiheService.resolveKasittelyVaihe(dbHakemus, ataruHakemusInTila("processing-fee-paid"))

    assertEquals(KasittelyVaihe.OdottaaVahvistusta, result)
  }

  @Test
  def testResolveMultipleLausuntopyynnot(): Unit = {
    val tiedot = KasittelyVaiheTiedot(
      selvityksetSaatu = false,
      vahvistusPyyntoLahetetty = None,
      vahvistusSaatu = None,
      imiPyyntoLahetetty = None,
      imiPyyntoVastattu = None,
      lausuntoKesken = true,
      paatosHyvaksymispaiva = None,
      paatosLahetyspaiva = None,
      paatostekstiVahvistettu = None
    )

    when(asiakirjaRepository.haeKasittelyVaiheTiedot(Some(asiakirjaId), hakemusId))
      .thenReturn(Some(tiedot))

    val result =
      kasittelyVaiheService.resolveKasittelyVaihe(dbHakemus, ataruHakemusInTila("processing-fee-paid"))

    assertEquals(KasittelyVaihe.OdottaaLausuntoa, result)
  }

  @Test
  def testResolveSelvityksetSaatuPrioritizesOverOriginal(): Unit = {
    val tiedot = KasittelyVaiheTiedot(
      selvityksetSaatu = true,
      vahvistusPyyntoLahetetty = None,
      vahvistusSaatu = None,
      imiPyyntoLahetetty = None,
      imiPyyntoVastattu = None,
      lausuntoKesken = false,
      paatosHyvaksymispaiva = None,
      paatosLahetyspaiva = None,
      paatostekstiVahvistettu = None
    )

    when(asiakirjaRepository.haeKasittelyVaiheTiedot(Some(asiakirjaId), hakemusId))
      .thenReturn(Some(tiedot))

    val result =
      kasittelyVaiheService.resolveKasittelyVaihe(dbHakemus, ataruHakemusInTila("processing-fee-paid"))

    assertEquals(KasittelyVaihe.ValmisKasiteltavaksi, result)
  }

  @Test
  def testResolvePrioritizesVahvistusOverSelvityksetSaatu(): Unit = {
    val tiedot = KasittelyVaiheTiedot(
      selvityksetSaatu = true,
      vahvistusPyyntoLahetetty = Some(now),
      vahvistusSaatu = None,
      imiPyyntoLahetetty = None,
      imiPyyntoVastattu = None,
      lausuntoKesken = false,
      paatosHyvaksymispaiva = None,
      paatosLahetyspaiva = None,
      paatostekstiVahvistettu = None
    )

    when(asiakirjaRepository.haeKasittelyVaiheTiedot(Some(asiakirjaId), hakemusId))
      .thenReturn(Some(tiedot))

    val result =
      kasittelyVaiheService.resolveKasittelyVaihe(dbHakemus, ataruHakemusInTila("processing-fee-paid"))

    assertEquals(KasittelyVaihe.OdottaaVahvistusta, result)
  }

  @Test
  def testResolveVahvistusReceivedWithSelvityksetReturnsValmisKasiteltavaksi(): Unit = {
    val tiedot = KasittelyVaiheTiedot(
      selvityksetSaatu = true,
      vahvistusPyyntoLahetetty = Some(now),
      vahvistusSaatu = Some(now.plusDays(1)),
      imiPyyntoLahetetty = None,
      imiPyyntoVastattu = None,
      lausuntoKesken = false,
      paatosHyvaksymispaiva = None,
      paatosLahetyspaiva = None,
      paatostekstiVahvistettu = None
    )

    when(asiakirjaRepository.haeKasittelyVaiheTiedot(Some(asiakirjaId), hakemusId))
      .thenReturn(Some(tiedot))

    val result =
      kasittelyVaiheService.resolveKasittelyVaihe(dbHakemus, ataruHakemusInTila("processing-fee-paid"))

    assertEquals(KasittelyVaihe.ValmisKasiteltavaksi, result)
  }

  @Test
  def testResolveLausuntoReceivedWithSelvityksetReturnsValmisKasiteltavaksi(): Unit = {
    val tiedot = KasittelyVaiheTiedot(
      selvityksetSaatu = true,
      vahvistusPyyntoLahetetty = None,
      vahvistusSaatu = None,
      imiPyyntoLahetetty = None,
      imiPyyntoVastattu = None,
      lausuntoKesken = false,
      paatosHyvaksymispaiva = None,
      paatosLahetyspaiva = None,
      paatostekstiVahvistettu = None
    )

    when(asiakirjaRepository.haeKasittelyVaiheTiedot(Some(asiakirjaId), hakemusId))
      .thenReturn(Some(tiedot))

    val result =
      kasittelyVaiheService.resolveKasittelyVaihe(dbHakemus, ataruHakemusInTila("processing-fee-paid"))

    assertEquals(KasittelyVaihe.ValmisKasiteltavaksi, result)
  }

  @Test
  def testResolveIMIVastattuWithSelvityksetReturnsValmisKasiteltavaksi(): Unit = {
    val tiedot = KasittelyVaiheTiedot(
      selvityksetSaatu = true,
      vahvistusPyyntoLahetetty = None,
      vahvistusSaatu = None,
      imiPyyntoLahetetty = Some(now),
      imiPyyntoVastattu = Some(now.plusWeeks(1)),
      lausuntoKesken = false,
      paatosHyvaksymispaiva = None,
      paatosLahetyspaiva = None,
      paatostekstiVahvistettu = None
    )

    when(asiakirjaRepository.haeKasittelyVaiheTiedot(Some(asiakirjaId), hakemusId))
      .thenReturn(Some(tiedot))

    val result =
      kasittelyVaiheService.resolveKasittelyVaihe(dbHakemus, ataruHakemusInTila("processing-fee-paid"))

    assertEquals(KasittelyVaihe.ValmisKasiteltavaksi, result)
  }

  @Test
  def testResolveReturnsAlkukasittelyKeskenWhenNoAsiakirjaId(): Unit = {
    when(asiakirjaRepository.haeKasittelyVaiheTiedot(None, hakemusId))
      .thenReturn(None)

    val result =
      kasittelyVaiheService.resolveKasittelyVaihe(
        dbHakemus.copy(asiakirjaId = None),
        ataruHakemusInTila("processing-fee-paid")
      )

    assertEquals(KasittelyVaihe.AlkukasittelyKesken, result)
  }

  @Test
  def testResolveReturnsAlkukasittelyKeskenWhenNoTiedotFound(): Unit = {
    when(asiakirjaRepository.haeKasittelyVaiheTiedot(Some(asiakirjaId), hakemusId))
      .thenReturn(None)

    val result =
      kasittelyVaiheService.resolveKasittelyVaihe(dbHakemus, ataruHakemusInTila("processing-fee-paid"))

    assertEquals(KasittelyVaihe.AlkukasittelyKesken, result)
  }

  @Test
  def testResolveReturnsHyvaksyttyEiLahetettyWhenHyvaksymispaivaSet(): Unit = {
    val tiedot = KasittelyVaiheTiedot(
      selvityksetSaatu = false,
      vahvistusPyyntoLahetetty = None,
      vahvistusSaatu = None,
      imiPyyntoLahetetty = None,
      imiPyyntoVastattu = None,
      lausuntoKesken = false,
      paatosHyvaksymispaiva = Some(now),
      paatosLahetyspaiva = None,
      paatostekstiVahvistettu = None
    )

    when(asiakirjaRepository.haeKasittelyVaiheTiedot(Some(asiakirjaId), hakemusId))
      .thenReturn(Some(tiedot))

    val result =
      kasittelyVaiheService.resolveKasittelyVaihe(dbHakemus, ataruHakemusInTila("processing-fee-paid"))

    assertEquals(KasittelyVaihe.HyvaksyttyEiLahetetty, result)
  }

  @Test
  def testResolveReturnsLoppukasittelyValmisWhenLahetyspaivaSet(): Unit = {
    val tiedot = KasittelyVaiheTiedot(
      selvityksetSaatu = false,
      vahvistusPyyntoLahetetty = None,
      vahvistusSaatu = None,
      imiPyyntoLahetetty = None,
      imiPyyntoVastattu = None,
      lausuntoKesken = false,
      paatosHyvaksymispaiva = Some(now),
      paatosLahetyspaiva = Some(now.plusDays(1)),
      paatostekstiVahvistettu = None
    )

    when(asiakirjaRepository.haeKasittelyVaiheTiedot(Some(asiakirjaId), hakemusId))
      .thenReturn(Some(tiedot))

    val result =
      kasittelyVaiheService.resolveKasittelyVaihe(dbHakemus, ataruHakemusInTila("processing-fee-paid"))

    assertEquals(KasittelyVaihe.LoppukasittelyValmis, result)
  }

  def testResolveReturnsHyvaksynnassaTaiLoppukasittelyssaWhenPaatostekstiVahvistettuSet(): Unit = {
    val tiedot = KasittelyVaiheTiedot(
      selvityksetSaatu = false,
      vahvistusPyyntoLahetetty = None,
      vahvistusSaatu = None,
      imiPyyntoLahetetty = None,
      imiPyyntoVastattu = None,
      lausuntoKesken = false,
      paatosHyvaksymispaiva = None,
      paatosLahetyspaiva = None,
      paatostekstiVahvistettu = Some(now)
    )

    when(asiakirjaRepository.haeKasittelyVaiheTiedot(Some(asiakirjaId), hakemusId))
      .thenReturn(Some(tiedot))

    val result =
      kasittelyVaiheService.resolveKasittelyVaihe(dbHakemus, ataruHakemusInTila("processing-fee-paid"))

    assertEquals(KasittelyVaihe.HyvaksynnassaTaiLoppukasittelyssa, result)
  }

  def testResolvePrioritizesHyvaksyttyEiLahetettyOverHyvaksynnassaTaiLoppukasittelyssa(): Unit = {
    val tiedot = KasittelyVaiheTiedot(
      selvityksetSaatu = false,
      vahvistusPyyntoLahetetty = None,
      vahvistusSaatu = None,
      imiPyyntoLahetetty = None,
      imiPyyntoVastattu = None,
      lausuntoKesken = false,
      paatosHyvaksymispaiva = Some(now),
      paatosLahetyspaiva = None,
      paatostekstiVahvistettu = Some(now)
    )

    when(asiakirjaRepository.haeKasittelyVaiheTiedot(Some(asiakirjaId), hakemusId))
      .thenReturn(Some(tiedot))

    val result =
      kasittelyVaiheService.resolveKasittelyVaihe(dbHakemus, ataruHakemusInTila("processing-fee-paid"))

    assertEquals(KasittelyVaihe.HyvaksyttyEiLahetetty, result)
  }

  @Test
  def testResolvePrioritizesPaatosTilatOverOdottaaVahvistusta(): Unit = {
    val tiedot = KasittelyVaiheTiedot(
      selvityksetSaatu = false,
      vahvistusPyyntoLahetetty = Some(now),
      vahvistusSaatu = None,
      imiPyyntoLahetetty = None,
      imiPyyntoVastattu = None,
      lausuntoKesken = false,
      paatosHyvaksymispaiva = Some(now),
      paatosLahetyspaiva = Some(now.plusDays(1)),
      paatostekstiVahvistettu = None
    )

    when(asiakirjaRepository.haeKasittelyVaiheTiedot(Some(asiakirjaId), hakemusId))
      .thenReturn(Some(tiedot))

    val result = kasittelyVaiheService.resolveKasittelyVaihe(
      dbHakemus.copy(viimeisinTaydennyspyyntoPvm = Some(LocalDateTime.parse("2026-01-29T18:30:45.597"))),
      ataruHakemusInTila("information-request")
    )

    assertEquals(KasittelyVaihe.LoppukasittelyValmis, result)
  }

  @Test
  def testResolveReturnsOdottaaKHOLausuntoaWhenMaaraaikaSetAndLausuntoaEiAnnettu(): Unit = {
    val valitusKHO = ValitusKHO(
      valitettu = Some(true),
      lausuntopyyntoValittu = Some(true),
      lausuntopyynto = Some(ValitusLausuntopyynto(maaraAikaPvm = Some(now)))
    )
    when(valitustiedotRepository.haeValitustiedot(dbHakemus.hakemusOid))
      .thenReturn(Some(valitustiedotWithKho(valitusKHO)))

    val result = kasittelyVaiheService.resolveKasittelyVaihe(dbHakemus, ataruHakemusInTila("processing-fee-paid"))

    assertEquals(KasittelyVaihe.OdottaaKHOLausuntoa, result)
  }

  @Test
  def testResolveReturnsOdottaaKHORatkaisuaWhenLausuntoAnnettuAndRatkaisuaEiAnnettu(): Unit = {
    val valitusKHO = ValitusKHO(
      valitettu = Some(true),
      lausuntopyyntoValittu = Some(true),
      lausuntopyynto = Some(ValitusLausuntopyynto(maaraAikaPvm = Some(now), lausuntoAnnettuPvm = Some(now.plusDays(1))))
    )
    when(valitustiedotRepository.haeValitustiedot(dbHakemus.hakemusOid))
      .thenReturn(Some(valitustiedotWithKho(valitusKHO)))

    val result = kasittelyVaiheService.resolveKasittelyVaihe(dbHakemus, ataruHakemusInTila("processing-fee-paid"))

    assertEquals(KasittelyVaihe.OdottaaKHORatkaisua, result)
  }

  @Test
  def testResolveIgnoresValitusKhoWhenRatkaisuAlreadyAnnettu(): Unit = {
    val tiedot = KasittelyVaiheTiedot(
      selvityksetSaatu = true,
      vahvistusPyyntoLahetetty = None,
      vahvistusSaatu = None,
      imiPyyntoLahetetty = None,
      imiPyyntoVastattu = None,
      lausuntoKesken = false,
      paatosHyvaksymispaiva = Some(now),
      paatosLahetyspaiva = Some(now.plusDays(1)),
      paatostekstiVahvistettu = None
    )
    when(asiakirjaRepository.haeKasittelyVaiheTiedot(Some(asiakirjaId), hakemusId))
      .thenReturn(Some(tiedot))

    val valitusKHO = ValitusKHO(
      valitettu = Some(true),
      lausuntopyyntoValittu = Some(true),
      lausuntopyynto =
        Some(ValitusLausuntopyynto(maaraAikaPvm = Some(now), lausuntoAnnettuPvm = Some(now.plusDays(1)))),
      ratkaisuPvm = Some(now.plusDays(2))
    )
    when(valitustiedotRepository.haeValitustiedot(dbHakemus.hakemusOid))
      .thenReturn(Some(valitustiedotWithKho(valitusKHO)))

    val result = kasittelyVaiheService.resolveKasittelyVaihe(dbHakemus, ataruHakemusInTila("processing-fee-paid"))

    assertEquals(KasittelyVaihe.LoppukasittelyValmis, result)
  }

  @Test
  def testResolveValitusKhoOverridesAsiakirjaPohjainenPaattely(): Unit = {
    val tiedot = KasittelyVaiheTiedot(
      selvityksetSaatu = false,
      vahvistusPyyntoLahetetty = None,
      vahvistusSaatu = None,
      imiPyyntoLahetetty = None,
      imiPyyntoVastattu = None,
      lausuntoKesken = false,
      paatosHyvaksymispaiva = Some(now),
      paatosLahetyspaiva = Some(now.plusDays(1)),
      paatostekstiVahvistettu = None
    )
    when(asiakirjaRepository.haeKasittelyVaiheTiedot(Some(asiakirjaId), hakemusId))
      .thenReturn(Some(tiedot))

    val valitusKHO = ValitusKHO(
      valitettu = Some(true),
      lausuntopyyntoValittu = Some(true),
      lausuntopyynto = Some(ValitusLausuntopyynto(maaraAikaPvm = Some(now)))
    )
    when(valitustiedotRepository.haeValitustiedot(dbHakemus.hakemusOid))
      .thenReturn(Some(valitustiedotWithKho(valitusKHO)))

    val result = kasittelyVaiheService.resolveKasittelyVaihe(dbHakemus, ataruHakemusInTila("processing-fee-paid"))

    assertEquals(KasittelyVaihe.OdottaaKHOLausuntoa, result)
  }

  @Test
  def testResolveReturnsOdottaaHaOLausuntoaWhenMaaraaikaSetAndLausuntoaEiAnnettu(): Unit = {
    val valitusHaO = ValitusHaO(
      valitettu = Some(true),
      lausuntopyyntoValittu = Some(true),
      lausuntopyynto = Some(ValitusLausuntopyynto(maaraAikaPvm = Some(now)))
    )
    when(valitustiedotRepository.haeValitustiedot(dbHakemus.hakemusOid))
      .thenReturn(Some(valitustiedotWithHao(valitusHaO)))

    val result = kasittelyVaiheService.resolveKasittelyVaihe(dbHakemus, ataruHakemusInTila("processing-fee-paid"))

    assertEquals(KasittelyVaihe.OdottaaHaOLausuntoa, result)
  }

  @Test
  def testResolveReturnsOdottaaHaORatkaisuaWhenLausuntoAnnettuAndRatkaisuaEiAnnettu(): Unit = {
    val valitusHaO = ValitusHaO(
      valitettu = Some(true),
      lausuntopyyntoValittu = Some(true),
      lausuntopyynto = Some(ValitusLausuntopyynto(maaraAikaPvm = Some(now), lausuntoAnnettuPvm = Some(now.plusDays(1))))
    )
    when(valitustiedotRepository.haeValitustiedot(dbHakemus.hakemusOid))
      .thenReturn(Some(valitustiedotWithHao(valitusHaO)))

    val result = kasittelyVaiheService.resolveKasittelyVaihe(dbHakemus, ataruHakemusInTila("processing-fee-paid"))

    assertEquals(KasittelyVaihe.OdottaaHaORatkaisua, result)
  }

  @Test
  def testResolveIgnoresValitusHaOWhenRatkaisuAlreadyAnnettu(): Unit = {
    val valitusHaO = ValitusHaO(
      valitettu = Some(true),
      lausuntopyyntoValittu = Some(true),
      lausuntopyynto =
        Some(ValitusLausuntopyynto(maaraAikaPvm = Some(now), lausuntoAnnettuPvm = Some(now.plusDays(1)))),
      ratkaisuPvm = Some(now.plusDays(2))
    )
    when(asiakirjaRepository.haeKasittelyVaiheTiedot(Some(asiakirjaId), hakemusId))
      .thenReturn(None)
    when(valitustiedotRepository.haeValitustiedot(dbHakemus.hakemusOid))
      .thenReturn(Some(valitustiedotWithHao(valitusHaO)))

    val result = kasittelyVaiheService.resolveKasittelyVaihe(dbHakemus, ataruHakemusInTila("processing-fee-paid"))

    assertEquals(KasittelyVaihe.AlkukasittelyKesken, result)
  }

  @Test
  def testResolvePrioritizesKHOOverHaOWhenBothOdottavat(): Unit = {
    val valitusKHO = ValitusKHO(
      valitettu = Some(true),
      lausuntopyyntoValittu = Some(true),
      lausuntopyynto = Some(ValitusLausuntopyynto(maaraAikaPvm = Some(now)))
    )
    val valitusHaO = ValitusHaO(
      valitettu = Some(true),
      lausuntopyyntoValittu = Some(true),
      lausuntopyynto = Some(ValitusLausuntopyynto(maaraAikaPvm = Some(now)))
    )
    when(valitustiedotRepository.haeValitustiedot(dbHakemus.hakemusOid))
      .thenReturn(
        Some(
          Valitustiedot(valitusOPH = ValitusOPH(), valitusHaO = valitusHaO, valitusKHO = valitusKHO)
        )
      )

    val result = kasittelyVaiheService.resolveKasittelyVaihe(dbHakemus, ataruHakemusInTila("processing-fee-paid"))

    assertEquals(KasittelyVaihe.OdottaaKHOLausuntoa, result)
  }
}
