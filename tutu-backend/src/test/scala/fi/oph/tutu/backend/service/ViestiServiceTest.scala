package fi.oph.tutu.backend.service

import fi.oph.tutu.backend.domain.*
import fi.oph.tutu.backend.repository.*
import fi.oph.tutu.backend.service.*
import fi.oph.tutu.backend.service.generator.viesti.ViestiSisaltoGenerator
import fi.oph.tutu.backend.UnitTestBase
import fi.oph.tutu.backend.utils.Utility.toLocalDateTime

import java.util.UUID
import java.time.LocalDateTime
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.*
import org.mockito.ArgumentMatchers.*
import org.mockito.Mockito.*
import org.mockito.{Mock, MockitoAnnotations}

class ViestiServiceTest extends UnitTestBase {

  @Mock
  var viestiRepository: ViestiRepository = _
  @Mock
  var hakemusRepository: HakemusRepository = _
  @Mock
  var esittelijaRepository: EsittelijaRepository = _
  @Mock
  var onrService: OnrService = _
  @Mock
  var hakemusService: HakemusService = _
  @Mock
  var viestiSisaltoGenerator: ViestiSisaltoGenerator = _

  var viestiService: ViestiService = _

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
      saapumisPvm = Some(toLocalDateTime("2025-05-14T10:59:47.597Z")),
      ataruHakemusMuokattu = Some(toLocalDateTime("2025-05-14T10:59:47.597Z")),
      hakijaEtunimet = Some("Jorma Eero"),
      hakijaSukunimi = Some(""),
      esittelyPvm = None
    )
  }

  @BeforeEach
  def setup(): Unit = {
    MockitoAnnotations.openMocks(this)
    viestiService = new ViestiService(
      viestiRepository,
      hakemusRepository,
      esittelijaRepository,
      onrService,
      hakemusService,
      viestiSisaltoGenerator
    )
    when(esittelijaRepository.haeEsittelijaOidilla("1.2.246.562.24.00000000001")).thenReturn(
      Some(
        DbEsittelija(UUID.randomUUID(), UserOid("1.2.246.562.24.00000000001"), Some("Topo"), Some("Lino"), None, None)
      )
    )
    when(esittelijaRepository.haeEsittelijaOidilla("1.2.246.562.24.00000000002")).thenReturn(None)
    when(onrService.haeHenkilo("1.2.246.562.24.00000000002")).thenReturn(
      Right(
        OnrUser(
          "1.2.246.562.24.00000000002",
          "Yrjö",
          "Kortesniemi",
          Seq(),
          None,
          true,
          Seq(
            OnrYhteystietoRyhma(
              Seq(
                OnrUserYhteystieto("YHTEYSTIETO_SAHKOPOSTI", "yka@åbh.sv"),
                OnrUserYhteystieto("YHTEYSTIETO_MATKAPUHELINNUMERO", "050 123345")
              )
            ),
            OnrYhteystietoRyhma(Seq(OnrUserYhteystieto("YHTEYSTIETO_PUHELINNUMERO", "123 456789")))
          )
        )
      )
    )
  }

  @Test
  def haeViestiPalauttaaMuokkaajanJaVahvistajanNimen(): Unit = {
    // Data
    val viestiId = UUID.randomUUID
    val dbViesti =
      Viesti(muokkaaja = Some("1.2.246.562.24.00000000001"), vahvistaja = Some("1.2.246.562.24.00000000002"))

    // Mock setup
    when(viestiRepository.haeViesti(any[UUID])).thenReturn(Some(dbViesti))

    // Act
    val viesti = viestiService.haeViesti(viestiId).get

    // Verify
    assertEquals(Some("Topo Lino"), viesti.muokkaaja)
    assertEquals(Some("Yrjö Kortesniemi"), viesti.vahvistaja)
  }
}
