package fi.oph.tutu.backend.service

import fi.oph.tutu.backend.domain.*
import fi.oph.tutu.backend.repository.*
import fi.oph.tutu.backend.service.*
import fi.oph.tutu.backend.UnitTestBase

import java.util.UUID
import java.time.LocalDateTime

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.scala.DefaultScalaModule

import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.*

import org.mockito.ArgumentMatchers.*
import org.mockito.Mockito.*
import org.mockito.{Mock, MockitoAnnotations}

class ViestiServiceTest extends UnitTestBase {

  val objectMapper = new ObjectMapper()
  objectMapper.registerModule(DefaultScalaModule)

  @Mock
  var viestiRepository: ViestiRepository = _
  @Mock
  var hakemusRepository: HakemusRepository = _
  @Mock
  var onrService: OnrService = _
  @Mock
  var hakemusService: HakemusService = _

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
      viimeisinTaydennyspyyntoPvm = None
    )
  }

  @BeforeEach
  def setup(): Unit = {
    MockitoAnnotations.openMocks(this)
    viestiService = new ViestiService(
      viestiRepository,
      hakemusRepository,
      onrService,
      hakemusService
    )
  }

  @Test
  def haeViestiPalauttaaMuokkaajanJaVahvistajanNimen(): Unit = {
    // Data
    val viestiId = UUID.randomUUID
    val dbViesti = Viesti(muokkaaja = Some("1234"), vahvistaja = Some("1234"))

    // Mock setup
    when(viestiRepository.haeViesti(any[UUID])).thenReturn(Some(dbViesti))

    when(onrService.haeNimiOption(any[Option[String]])).thenReturn(Some("Topolino"))

    // Act
    val viesti = viestiService.haeViesti(viestiId).get

    // Verify
    assertEquals(viesti.muokkaaja, Some("Topolino"))
    assertEquals(viesti.vahvistaja, Some("Topolino"))
  }

  @Test
  def haeViestiListaPalauttaaVahvistajanNimen(): Unit = {
    // Data
    val hakemusOid       = HakemusOid("poop")
    val sort             = ""
    val dbHakemus        = makeDbHakemus(hakemusOid)
    val dbViestiListItem = ViestiListItem(
      id = UUID.randomUUID,
      tyyppi = Viestityyppi.muu,
      otsikko = "",
      vahvistettu = LocalDateTime.now,
      vahvistaja = "1234"
    )

    // Mock setup
    when(hakemusRepository.haeHakemus(any[HakemusOid])).thenReturn(Some(dbHakemus))
    when(viestiRepository.haeViestiLista(any[UUID])).thenReturn(Seq(dbViestiListItem))

    when(onrService.haeNimi(any[Option[String]])).thenReturn("Topolino")

    // Act
    val viestiLista: Seq[ViestiListItem] = viestiService.haeViestiLista(hakemusOid = hakemusOid, sort = sort)

    // Verify
    viestiLista.foreach(viestiListaItem => assertEquals(viestiListaItem.vahvistaja, "Topolino"))
  }

}
