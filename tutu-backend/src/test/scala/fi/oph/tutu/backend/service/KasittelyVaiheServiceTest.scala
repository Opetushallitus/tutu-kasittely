package fi.oph.tutu.backend.service

import fi.oph.tutu.backend.domain.*
import fi.oph.tutu.backend.repository.AsiakirjaRepository
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

  private var asiakirjaRepository: AsiakirjaRepository     = _
  private var kasittelyVaiheService: KasittelyVaiheService = _

  @BeforeEach
  def setUp(): Unit = {
    asiakirjaRepository = mock(classOf[AsiakirjaRepository])
    kasittelyVaiheService = new KasittelyVaiheService(asiakirjaRepository)
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
      paatosLahetyspaiva = None
    )

    when(asiakirjaRepository.haeKasittelyVaiheTiedot(Some(asiakirjaId), hakemusId))
      .thenReturn(Some(tiedot))

    val result = kasittelyVaiheService.resolveKasittelyVaihe(Some(asiakirjaId), hakemusId)

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
      paatosLahetyspaiva = None
    )

    when(asiakirjaRepository.haeKasittelyVaiheTiedot(Some(asiakirjaId), hakemusId))
      .thenReturn(Some(tiedot))

    val result = kasittelyVaiheService.resolveKasittelyVaihe(Some(asiakirjaId), hakemusId)

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
      paatosLahetyspaiva = None
    )

    when(asiakirjaRepository.haeKasittelyVaiheTiedot(Some(asiakirjaId), hakemusId))
      .thenReturn(Some(tiedot))

    val result = kasittelyVaiheService.resolveKasittelyVaihe(Some(asiakirjaId), hakemusId)

    assertEquals(KasittelyVaihe.OdottaaIMIVastausta, result)
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
      paatosLahetyspaiva = None
    )

    when(asiakirjaRepository.haeKasittelyVaiheTiedot(Some(asiakirjaId), hakemusId))
      .thenReturn(Some(tiedot))

    val result = kasittelyVaiheService.resolveKasittelyVaihe(Some(asiakirjaId), hakemusId)

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
      paatosLahetyspaiva = None
    )

    when(asiakirjaRepository.haeKasittelyVaiheTiedot(Some(asiakirjaId), hakemusId))
      .thenReturn(Some(tiedot))

    val result = kasittelyVaiheService.resolveKasittelyVaihe(Some(asiakirjaId), hakemusId)

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
      paatosLahetyspaiva = None
    )

    when(asiakirjaRepository.haeKasittelyVaiheTiedot(Some(asiakirjaId), hakemusId))
      .thenReturn(Some(tiedot))

    val result = kasittelyVaiheService.resolveKasittelyVaihe(Some(asiakirjaId), hakemusId)

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
      paatosLahetyspaiva = None
    )

    when(asiakirjaRepository.haeKasittelyVaiheTiedot(Some(asiakirjaId), hakemusId))
      .thenReturn(Some(tiedot))

    val result = kasittelyVaiheService.resolveKasittelyVaihe(Some(asiakirjaId), hakemusId)

    assertEquals(KasittelyVaihe.AlkukasittelyKesken, result)
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
      paatosLahetyspaiva = None
    )

    when(asiakirjaRepository.haeKasittelyVaiheTiedot(Some(asiakirjaId), hakemusId))
      .thenReturn(Some(tiedot))

    val result = kasittelyVaiheService.resolveKasittelyVaihe(Some(asiakirjaId), hakemusId)

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
      paatosLahetyspaiva = None
    )

    when(asiakirjaRepository.haeKasittelyVaiheTiedot(Some(asiakirjaId), hakemusId))
      .thenReturn(Some(tiedot))

    val result = kasittelyVaiheService.resolveKasittelyVaihe(Some(asiakirjaId), hakemusId)

    assertEquals(KasittelyVaihe.OdottaaLausuntoa, result)
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
      paatosLahetyspaiva = None
    )

    when(asiakirjaRepository.haeKasittelyVaiheTiedot(Some(asiakirjaId), hakemusId))
      .thenReturn(Some(tiedot))

    val result = kasittelyVaiheService.resolveKasittelyVaihe(Some(asiakirjaId), hakemusId)

    assertEquals(KasittelyVaihe.AlkukasittelyKesken, result)
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
      paatosLahetyspaiva = None
    )

    when(asiakirjaRepository.haeKasittelyVaiheTiedot(Some(asiakirjaId), hakemusId))
      .thenReturn(Some(tiedot))

    val result = kasittelyVaiheService.resolveKasittelyVaihe(Some(asiakirjaId), hakemusId)

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
      paatosLahetyspaiva = None
    )

    when(asiakirjaRepository.haeKasittelyVaiheTiedot(Some(asiakirjaId), hakemusId))
      .thenReturn(Some(tiedot))

    val result = kasittelyVaiheService.resolveKasittelyVaihe(Some(asiakirjaId), hakemusId)

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
      paatosLahetyspaiva = None
    )

    when(asiakirjaRepository.haeKasittelyVaiheTiedot(Some(asiakirjaId), hakemusId))
      .thenReturn(Some(tiedot))

    val result = kasittelyVaiheService.resolveKasittelyVaihe(Some(asiakirjaId), hakemusId)

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
      paatosLahetyspaiva = None
    )

    when(asiakirjaRepository.haeKasittelyVaiheTiedot(Some(asiakirjaId), hakemusId))
      .thenReturn(Some(tiedot))

    val result = kasittelyVaiheService.resolveKasittelyVaihe(Some(asiakirjaId), hakemusId)

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
      paatosLahetyspaiva = None
    )

    when(asiakirjaRepository.haeKasittelyVaiheTiedot(Some(asiakirjaId), hakemusId))
      .thenReturn(Some(tiedot))

    val result = kasittelyVaiheService.resolveKasittelyVaihe(Some(asiakirjaId), hakemusId)

    assertEquals(KasittelyVaihe.ValmisKasiteltavaksi, result)
  }

  @Test
  def testResolveReturnsAlkukasittelyKeskenWhenNoAsiakirjaId(): Unit = {
    when(asiakirjaRepository.haeKasittelyVaiheTiedot(None, hakemusId))
      .thenReturn(None)

    val result = kasittelyVaiheService.resolveKasittelyVaihe(None, hakemusId)

    assertEquals(KasittelyVaihe.AlkukasittelyKesken, result)
  }

  @Test
  def testResolveReturnsAlkukasittelyKeskenWhenNoTiedotFound(): Unit = {
    when(asiakirjaRepository.haeKasittelyVaiheTiedot(Some(asiakirjaId), hakemusId))
      .thenReturn(None)

    val result = kasittelyVaiheService.resolveKasittelyVaihe(Some(asiakirjaId), hakemusId)

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
      paatosLahetyspaiva = None
    )

    when(asiakirjaRepository.haeKasittelyVaiheTiedot(Some(asiakirjaId), hakemusId))
      .thenReturn(Some(tiedot))

    val result = kasittelyVaiheService.resolveKasittelyVaihe(Some(asiakirjaId), hakemusId)

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
      paatosLahetyspaiva = Some(now.plusDays(1))
    )

    when(asiakirjaRepository.haeKasittelyVaiheTiedot(Some(asiakirjaId), hakemusId))
      .thenReturn(Some(tiedot))

    val result = kasittelyVaiheService.resolveKasittelyVaihe(Some(asiakirjaId), hakemusId)

    assertEquals(KasittelyVaihe.LoppukasittelyValmis, result)
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
      paatosLahetyspaiva = Some(now.plusDays(1))
    )

    when(asiakirjaRepository.haeKasittelyVaiheTiedot(Some(asiakirjaId), hakemusId))
      .thenReturn(Some(tiedot))

    val result = kasittelyVaiheService.resolveKasittelyVaihe(Some(asiakirjaId), hakemusId)

    assertEquals(KasittelyVaihe.LoppukasittelyValmis, result)
  }
}
