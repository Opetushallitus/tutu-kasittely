package fi.oph.tutu.backend.service

import fi.oph.tutu.backend.domain.*
import fi.oph.tutu.backend.exception.ValitustiedotValidationException
import fi.oph.tutu.backend.repository.{HakemusRepository, ValitustiedotRepository}
import fi.oph.tutu.backend.UnitTestBase
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.{BeforeEach, Test}
import org.mockito.ArgumentMatchers.*
import org.mockito.Mockito.*
import org.mockito.{ArgumentCaptor, Mock, MockitoAnnotations}

import java.time.LocalDateTime
import java.util.UUID

class ValitustiedotServiceTest extends UnitTestBase {

  @Mock
  var valitustiedotRepository: ValitustiedotRepository = _
  @Mock
  var hakemusRepository: HakemusRepository = _
  @Mock
  var hakemusService: HakemusService = _
  @Mock
  var onrService: OnrService = _

  var valitustiedotService: ValitustiedotService = _

  private val hakemusOid = HakemusOid("1.2.246.562.11.00000000000000000123")

  def makeDbHakemus(hakemusOid: HakemusOid): DbHakemus = {
    DbHakemus(
      id = UUID.randomUUID,
      hakemusOid = hakemusOid,
      hakemusKoskee = 1,
      formId = 1,
      esittelijaId = None,
      esittelijaOid = None,
      asiakirjaId = None,
      asiatunnus = None,
      kasittelyVaihe = KasittelyVaihe.ValmisKasiteltavaksi,
      muokattu = None,
      yhteistutkinto = false,
      lopullinenPaatosVastaavaEhdollinenAsiatunnus = None,
      lopullinenPaatosVastaavaEhdollinenSuoritusmaaKoodiUri = None,
      esittelijanHuomioita = None,
      muokkaaja = None,
      onkoPeruutettu = false,
      peruutusPvm = None,
      peruutusLisatieto = None,
      viimeisinTaydennyspyyntoPvm = None,
      saapumisPvm = None,
      ataruHakemusMuokattu = None,
      hakijaEtunimet = None,
      hakijaSukunimi = None,
      esittelyPvm = None,
      lausunnonMaaraaikaPvm = None
    )
  }

  private def makeValitustiedot(id: Option[UUID] = None, hakemusId: Option[UUID] = None): Valitustiedot =
    Valitustiedot(
      id = id,
      hakemusId = hakemusId,
      valitusOPH = ValitusOPH(),
      valitusHaO = ValitusHaO(),
      valitusKHO = ValitusKHO(),
      luoja = Some("1.2.246.562.24.11111111111"),
      muokkaaja = Some("1.2.246.562.24.22222222222")
    )

  @BeforeEach
  def setup(): Unit = {
    MockitoAnnotations.openMocks(this)
    valitustiedotService =
      new ValitustiedotService(valitustiedotRepository, hakemusRepository, hakemusService, onrService)
    when(onrService.haeNimiOption(any[Option[String]])).thenAnswer(invocation =>
      invocation.getArgument[Option[String]](0).map(oid => s"Nimi $oid")
    )
  }

  @Test
  def tallennaValitustiedotLuoUudenHakemusLoytyy(): Unit = {
    val dbHakemus   = makeDbHakemus(hakemusOid)
    val lahetetty   = makeValitustiedot()
    val tallennettu = lahetetty.copy(id = Some(UUID.randomUUID()), hakemusId = Some(dbHakemus.id))

    when(valitustiedotRepository.haeValitustiedot(hakemusOid)).thenReturn(None)
    when(hakemusRepository.haeHakemus(hakemusOid)).thenReturn(Some(dbHakemus))

    val captor = ArgumentCaptor.forClass(classOf[Valitustiedot])
    when(valitustiedotRepository.lisaaValitustiedot(captor.capture(), any[String])).thenReturn(tallennettu)

    val (vanha, uusi) = valitustiedotService.tallennaValitustiedot(hakemusOid, lahetetty, "luoja-oid")

    assertEquals(None, vanha)
    assertEquals(Some(dbHakemus.id), captor.getValue.hakemusId)
    assertEquals(Some("Nimi 1.2.246.562.24.11111111111"), uusi.get.luoja)
    assertEquals(Some("Nimi 1.2.246.562.24.22222222222"), uusi.get.muokkaaja)
    verify(valitustiedotRepository, never()).paivitaValitustiedot(any[UUID], any[Valitustiedot], any[String])
  }

  @Test
  def tallennaValitustiedotEiLuoUuttaHakemustaEiLoydy(): Unit = {
    val lahetetty = makeValitustiedot()

    when(valitustiedotRepository.haeValitustiedot(hakemusOid)).thenReturn(None)
    when(hakemusRepository.haeHakemus(hakemusOid)).thenReturn(None)

    val (vanha, uusi) = valitustiedotService.tallennaValitustiedot(hakemusOid, lahetetty, "luoja-oid")

    assertEquals(None, vanha)
    assertEquals(None, uusi)
    verify(valitustiedotRepository, never()).lisaaValitustiedot(any[Valitustiedot], any[String])
  }

  @Test
  def tallennaValitustiedotPaivittaaOlemassaOlevan(): Unit = {
    val vanhaId   = UUID.randomUUID()
    val vanha     = makeValitustiedot(id = Some(vanhaId), hakemusId = Some(UUID.randomUUID()))
    val lahetetty = makeValitustiedot()

    val paivitetty = vanha.copy(
      valitusHaO = ValitusHaO(
        valitettu = Some(true),
        valitusPvm = Some(LocalDateTime.of(2026, 9, 14, 0, 0, 0)),
        ratkaisu = Some("UudelleenKasittely"),
        ratkaisuLisatieto = Some("Palautettu uudelleen käsittelyyn"),
        lausuntopyyntoValittu = Some(true),
        lausuntopyynto = Some(
          ValitusLausuntopyynto(
            ashaTunnus = Some("ASHA-321"),
            saapumisPvm = Some(LocalDateTime.of(2026, 9, 17, 0, 0, 0)),
            maaraAikaPvm = Some(LocalDateTime.of(2026, 9, 29, 0, 0, 0)),
            lausuntoAnnettuPvm = Some(LocalDateTime.of(2026, 9, 24, 0, 0, 0))
          )
        )
      ),
      valitusKHO = ValitusKHO(
        valitettu = Some(true),
        valitusPvm = Some(LocalDateTime.of(2026, 9, 15, 0, 0, 0)),
        ratkaisu = Some(ValitusKHORatkaisu.EiValituslupaa),
        ratkaisuLisatieto = Some("Ei lupaa valittaa"),
        lausuntopyyntoValittu = Some(true),
        lausuntopyynto = Some(
          ValitusLausuntopyynto(
            ashaTunnus = Some("ASHA-123"),
            saapumisPvm = Some(LocalDateTime.of(2026, 9, 16, 0, 0, 0)),
            maaraAikaPvm = Some(LocalDateTime.of(2026, 9, 30, 0, 0, 0)),
            lausuntoAnnettuPvm = Some(LocalDateTime.of(2026, 9, 25, 0, 0, 0))
          )
        )
      )
    )

    when(valitustiedotRepository.haeValitustiedot(hakemusOid)).thenReturn(Some(vanha))
    when(valitustiedotRepository.paivitaValitustiedot(vanhaId, lahetetty, "muokkaaja-oid"))
      .thenReturn(Some(paivitetty))

    val (vanhaTulos, uusiTulos) = valitustiedotService.tallennaValitustiedot(hakemusOid, lahetetty, "muokkaaja-oid")

    assertEquals(Some("Nimi 1.2.246.562.24.11111111111"), vanhaTulos.get.luoja)
    assertEquals(Some("Nimi 1.2.246.562.24.11111111111"), uusiTulos.get.luoja)
    assertEquals(Some(ValitusKHORatkaisu.EiValituslupaa), uusiTulos.get.valitusKHO.ratkaisu)
    assertEquals(Some(LocalDateTime.of(2026, 9, 15, 0, 0, 0)), uusiTulos.get.valitusKHO.valitusPvm)
    assertEquals(Some("Ei lupaa valittaa"), uusiTulos.get.valitusKHO.ratkaisuLisatieto)
    assertEquals(Some(true), uusiTulos.get.valitusKHO.lausuntopyyntoValittu)
    assertEquals(Some("ASHA-123"), uusiTulos.get.valitusKHO.lausuntopyynto.get.ashaTunnus)
    assertEquals(
      Some(LocalDateTime.of(2026, 9, 16, 0, 0, 0)),
      uusiTulos.get.valitusKHO.lausuntopyynto.get.saapumisPvm
    )
    assertEquals(Some(LocalDateTime.of(2026, 9, 30, 0, 0, 0)), uusiTulos.get.valitusKHO.lausuntopyynto.get.maaraAikaPvm)
    assertEquals(
      Some(LocalDateTime.of(2026, 9, 25, 0, 0, 0)),
      uusiTulos.get.valitusKHO.lausuntopyynto.get.lausuntoAnnettuPvm
    )
    assertEquals(Some("UudelleenKasittely"), uusiTulos.get.valitusHaO.ratkaisu)
    assertEquals(Some(LocalDateTime.of(2026, 9, 14, 0, 0, 0)), uusiTulos.get.valitusHaO.valitusPvm)
    assertEquals(Some("Palautettu uudelleen käsittelyyn"), uusiTulos.get.valitusHaO.ratkaisuLisatieto)
    assertEquals(Some(true), uusiTulos.get.valitusHaO.lausuntopyyntoValittu)
    assertEquals(Some("ASHA-321"), uusiTulos.get.valitusHaO.lausuntopyynto.get.ashaTunnus)
    assertEquals(
      Some(LocalDateTime.of(2026, 9, 17, 0, 0, 0)),
      uusiTulos.get.valitusHaO.lausuntopyynto.get.saapumisPvm
    )
    assertEquals(Some(LocalDateTime.of(2026, 9, 29, 0, 0, 0)), uusiTulos.get.valitusHaO.lausuntopyynto.get.maaraAikaPvm)
    assertEquals(
      Some(LocalDateTime.of(2026, 9, 24, 0, 0, 0)),
      uusiTulos.get.valitusHaO.lausuntopyynto.get.lausuntoAnnettuPvm
    )
    verify(valitustiedotRepository, never()).lisaaValitustiedot(any[Valitustiedot], any[String])
  }

  @Test
  def haeValitustiedotSisaltaaLuojanJaMuokkaajanNimet(): Unit = {
    val valitustiedot = makeValitustiedot(id = Some(UUID.randomUUID()), hakemusId = Some(UUID.randomUUID()))

    when(valitustiedotRepository.haeValitustiedot(hakemusOid)).thenReturn(Some(valitustiedot))

    val result = valitustiedotService.haeValitustiedot(hakemusOid).get

    assertEquals(Some("Nimi 1.2.246.562.24.11111111111"), result.luoja)
    assertEquals(Some("Nimi 1.2.246.562.24.22222222222"), result.muokkaaja)
  }

  @Test
  def haeValitustiedotEiLoydyPalauttaaNone(): Unit = {
    when(valitustiedotRepository.haeValitustiedot(hakemusOid)).thenReturn(None)

    val result = valitustiedotService.haeValitustiedot(hakemusOid)

    assertEquals(None, result)
  }

  @Test
  def tallennaValitustiedotEpaonnistuuRatkaisuPvmIlmanValitusPvm(): Unit = {
    val lahetetty = makeValitustiedot().copy(
      valitusKHO = ValitusKHO(
        valitettu = Some(true),
        valitusPvm = None,
        ratkaisuPvm = Some(LocalDateTime.of(2026, 9, 15, 0, 0, 0))
      )
    )

    assertThrows(
      classOf[ValitustiedotValidationException],
      () => valitustiedotService.tallennaValitustiedot(hakemusOid, lahetetty, "muokkaaja-oid")
    )
    verify(valitustiedotRepository, never()).haeValitustiedot(any[HakemusOid])
    verify(valitustiedotRepository, never()).lisaaValitustiedot(any[Valitustiedot], any[String])
    verify(valitustiedotRepository, never()).paivitaValitustiedot(any[UUID], any[Valitustiedot], any[String])
  }

  @Test
  def tallennaValitustiedotEpaonnistuuRatkaisuPvmEnnenValitusPvm(): Unit = {
    val lahetetty = makeValitustiedot().copy(
      valitusKHO = ValitusKHO(
        valitettu = Some(true),
        valitusPvm = Some(LocalDateTime.of(2026, 9, 15, 0, 0, 0)),
        ratkaisuPvm = Some(LocalDateTime.of(2026, 9, 1, 0, 0, 0))
      )
    )

    assertThrows(
      classOf[ValitustiedotValidationException],
      () => valitustiedotService.tallennaValitustiedot(hakemusOid, lahetetty, "muokkaaja-oid")
    )
    verify(valitustiedotRepository, never()).lisaaValitustiedot(any[Valitustiedot], any[String])
    verify(valitustiedotRepository, never()).paivitaValitustiedot(any[UUID], any[Valitustiedot], any[String])
  }

  @Test
  def tallennaValitustiedotEpaonnistuuValitusPvmKunEiValitettu(): Unit = {
    val lahetetty = makeValitustiedot().copy(
      valitusKHO = ValitusKHO(
        valitettu = Some(false),
        valitusPvm = Some(LocalDateTime.of(2026, 9, 15, 0, 0, 0)),
        ratkaisuPvm = None
      )
    )

    assertThrows(
      classOf[ValitustiedotValidationException],
      () => valitustiedotService.tallennaValitustiedot(hakemusOid, lahetetty, "muokkaaja-oid")
    )
    verify(valitustiedotRepository, never()).lisaaValitustiedot(any[Valitustiedot], any[String])
    verify(valitustiedotRepository, never()).paivitaValitustiedot(any[UUID], any[Valitustiedot], any[String])
  }

  @Test
  def tallennaValitustiedotEpaonnistuuRatkaisuPvmKunValitettuPuuttuu(): Unit = {
    val lahetetty = makeValitustiedot().copy(
      valitusKHO = ValitusKHO(
        valitettu = None,
        valitusPvm = Some(LocalDateTime.of(2026, 9, 1, 0, 0, 0)),
        ratkaisuPvm = Some(LocalDateTime.of(2026, 9, 15, 0, 0, 0))
      )
    )

    assertThrows(
      classOf[ValitustiedotValidationException],
      () => valitustiedotService.tallennaValitustiedot(hakemusOid, lahetetty, "muokkaaja-oid")
    )
    verify(valitustiedotRepository, never()).lisaaValitustiedot(any[Valitustiedot], any[String])
    verify(valitustiedotRepository, never()).paivitaValitustiedot(any[UUID], any[Valitustiedot], any[String])
  }

  @Test
  def tallennaValitustiedotOnnistuuEiValitettuIlmanPaivamaaria(): Unit = {
    val dbHakemus = makeDbHakemus(hakemusOid)
    val lahetetty = makeValitustiedot().copy(
      valitusKHO = ValitusKHO(valitettu = Some(false), valitusPvm = None, ratkaisuPvm = None)
    )
    val tallennettu = lahetetty.copy(id = Some(UUID.randomUUID()), hakemusId = Some(dbHakemus.id))

    when(valitustiedotRepository.haeValitustiedot(hakemusOid)).thenReturn(None)
    when(hakemusRepository.haeHakemus(hakemusOid)).thenReturn(Some(dbHakemus))
    when(valitustiedotRepository.lisaaValitustiedot(any[Valitustiedot], any[String])).thenReturn(tallennettu)

    val (_, uusi) = valitustiedotService.tallennaValitustiedot(hakemusOid, lahetetty, "luoja-oid")

    assertEquals(Some(tallennettu.id.get), uusi.flatMap(_.id))
  }

  @Test
  def tallennaValitustiedotEpaonnistuuLausuntopyyntoKunEiValitettu(): Unit = {
    val lahetetty = makeValitustiedot().copy(
      valitusKHO = ValitusKHO(valitettu = Some(false), lausuntopyyntoValittu = Some(true))
    )

    assertThrows(
      classOf[ValitustiedotValidationException],
      () => valitustiedotService.tallennaValitustiedot(hakemusOid, lahetetty, "muokkaaja-oid")
    )
    verify(valitustiedotRepository, never()).lisaaValitustiedot(any[Valitustiedot], any[String])
    verify(valitustiedotRepository, never()).paivitaValitustiedot(any[UUID], any[Valitustiedot], any[String])
  }

  @Test
  def tallennaValitustiedotEpaonnistuuSaapumisPvmKunLausuntopyyntoPuuttuu(): Unit = {
    val lahetetty = makeValitustiedot().copy(
      valitusKHO = ValitusKHO(
        valitettu = Some(true),
        lausuntopyyntoValittu = Some(false),
        lausuntopyynto = Some(ValitusLausuntopyynto(saapumisPvm = Some(LocalDateTime.of(2026, 9, 16, 0, 0, 0))))
      )
    )

    assertThrows(
      classOf[ValitustiedotValidationException],
      () => valitustiedotService.tallennaValitustiedot(hakemusOid, lahetetty, "muokkaaja-oid")
    )
    verify(valitustiedotRepository, never()).lisaaValitustiedot(any[Valitustiedot], any[String])
    verify(valitustiedotRepository, never()).paivitaValitustiedot(any[UUID], any[Valitustiedot], any[String])
  }

  @Test
  def tallennaValitustiedotEpaonnistuuMaaraaikaPvmIlmanSaapumisPvm(): Unit = {
    val lahetetty = makeValitustiedot().copy(
      valitusKHO = ValitusKHO(
        valitettu = Some(true),
        lausuntopyyntoValittu = Some(true),
        lausuntopyynto = Some(ValitusLausuntopyynto(maaraAikaPvm = Some(LocalDateTime.of(2026, 9, 30, 0, 0, 0))))
      )
    )

    assertThrows(
      classOf[ValitustiedotValidationException],
      () => valitustiedotService.tallennaValitustiedot(hakemusOid, lahetetty, "muokkaaja-oid")
    )
    verify(valitustiedotRepository, never()).lisaaValitustiedot(any[Valitustiedot], any[String])
    verify(valitustiedotRepository, never()).paivitaValitustiedot(any[UUID], any[Valitustiedot], any[String])
  }

  @Test
  def tallennaValitustiedotEpaonnistuuMaaraaikaPvmEnnenSaapumisPvm(): Unit = {
    val lahetetty = makeValitustiedot().copy(
      valitusKHO = ValitusKHO(
        valitettu = Some(true),
        lausuntopyyntoValittu = Some(true),
        lausuntopyynto = Some(
          ValitusLausuntopyynto(
            saapumisPvm = Some(LocalDateTime.of(2026, 9, 16, 0, 0, 0)),
            maaraAikaPvm = Some(LocalDateTime.of(2026, 9, 1, 0, 0, 0))
          )
        )
      )
    )

    assertThrows(
      classOf[ValitustiedotValidationException],
      () => valitustiedotService.tallennaValitustiedot(hakemusOid, lahetetty, "muokkaaja-oid")
    )
    verify(valitustiedotRepository, never()).lisaaValitustiedot(any[Valitustiedot], any[String])
    verify(valitustiedotRepository, never()).paivitaValitustiedot(any[UUID], any[Valitustiedot], any[String])
  }

  @Test
  def tallennaValitustiedotEpaonnistuuAnnettuPvmIlmanSaapumisPvm(): Unit = {
    val lahetetty = makeValitustiedot().copy(
      valitusKHO = ValitusKHO(
        valitettu = Some(true),
        lausuntopyyntoValittu = Some(true),
        lausuntopyynto = Some(ValitusLausuntopyynto(lausuntoAnnettuPvm = Some(LocalDateTime.of(2026, 9, 25, 0, 0, 0))))
      )
    )

    assertThrows(
      classOf[ValitustiedotValidationException],
      () => valitustiedotService.tallennaValitustiedot(hakemusOid, lahetetty, "muokkaaja-oid")
    )
    verify(valitustiedotRepository, never()).lisaaValitustiedot(any[Valitustiedot], any[String])
    verify(valitustiedotRepository, never()).paivitaValitustiedot(any[UUID], any[Valitustiedot], any[String])
  }

  @Test
  def tallennaValitustiedotEpaonnistuuAnnettuPvmEnnenSaapumisPvm(): Unit = {
    val lahetetty = makeValitustiedot().copy(
      valitusKHO = ValitusKHO(
        valitettu = Some(true),
        lausuntopyyntoValittu = Some(true),
        lausuntopyynto = Some(
          ValitusLausuntopyynto(
            saapumisPvm = Some(LocalDateTime.of(2026, 9, 16, 0, 0, 0)),
            lausuntoAnnettuPvm = Some(LocalDateTime.of(2026, 9, 1, 0, 0, 0))
          )
        )
      )
    )

    assertThrows(
      classOf[ValitustiedotValidationException],
      () => valitustiedotService.tallennaValitustiedot(hakemusOid, lahetetty, "muokkaaja-oid")
    )
    verify(valitustiedotRepository, never()).lisaaValitustiedot(any[Valitustiedot], any[String])
    verify(valitustiedotRepository, never()).paivitaValitustiedot(any[UUID], any[Valitustiedot], any[String])
  }

  @Test
  def tallennaValitustiedotOnnistuuLausuntopyyntoPaivamaaratOK(): Unit = {
    val dbHakemus = makeDbHakemus(hakemusOid)
    val lahetetty = makeValitustiedot().copy(
      valitusKHO = ValitusKHO(
        valitettu = Some(true),
        lausuntopyyntoValittu = Some(true),
        lausuntopyynto = Some(
          ValitusLausuntopyynto(
            ashaTunnus = Some("ASHA-123"),
            saapumisPvm = Some(LocalDateTime.of(2026, 9, 16, 0, 0, 0)),
            maaraAikaPvm = Some(LocalDateTime.of(2026, 9, 16, 0, 0, 0)),
            lausuntoAnnettuPvm = Some(LocalDateTime.of(2026, 9, 16, 0, 0, 0))
          )
        )
      )
    )
    val tallennettu = lahetetty.copy(id = Some(UUID.randomUUID()), hakemusId = Some(dbHakemus.id))

    when(valitustiedotRepository.haeValitustiedot(hakemusOid)).thenReturn(None)
    when(hakemusRepository.haeHakemus(hakemusOid)).thenReturn(Some(dbHakemus))
    when(valitustiedotRepository.lisaaValitustiedot(any[Valitustiedot], any[String])).thenReturn(tallennettu)

    val (_, uusi) = valitustiedotService.tallennaValitustiedot(hakemusOid, lahetetty, "luoja-oid")

    assertEquals(Some(tallennettu.id.get), uusi.flatMap(_.id))
  }

  @Test
  def tallennaValitustiedotOnnistuuRatkaisuPvmSamaKuinValitusPvm(): Unit = {
    val dbHakemus = makeDbHakemus(hakemusOid)
    val sama      = LocalDateTime.of(2026, 9, 15, 0, 0, 0)
    val lahetetty = makeValitustiedot().copy(
      valitusKHO = ValitusKHO(valitettu = Some(true), valitusPvm = Some(sama), ratkaisuPvm = Some(sama))
    )
    val tallennettu = lahetetty.copy(id = Some(UUID.randomUUID()), hakemusId = Some(dbHakemus.id))

    when(valitustiedotRepository.haeValitustiedot(hakemusOid)).thenReturn(None)
    when(hakemusRepository.haeHakemus(hakemusOid)).thenReturn(Some(dbHakemus))
    when(valitustiedotRepository.lisaaValitustiedot(any[Valitustiedot], any[String])).thenReturn(tallennettu)

    val (_, uusi) = valitustiedotService.tallennaValitustiedot(hakemusOid, lahetetty, "luoja-oid")

    assertEquals(Some(tallennettu.id.get), uusi.flatMap(_.id))
  }
}
