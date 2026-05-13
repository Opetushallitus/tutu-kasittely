package fi.oph.tutu.backend.service

import fi.oph.tutu.backend.IntegrationTestBase
import fi.oph.tutu.backend.UnitTestBase
import fi.oph.tutu.backend.domain.*
import fi.oph.tutu.backend.repository.*
import fi.oph.tutu.backend.service.*
import fi.oph.tutu.backend.utils.Utility.toLocalDateTime
import org.junit.jupiter.api.*
import org.junit.jupiter.api.Assertions.*
import org.mockito.ArgumentMatchers.*
import org.mockito.Mock
import org.mockito.Mockito.*
import org.mockito.MockitoAnnotations
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.test.context.bean.`override`.mockito.MockitoBean

import java.util.UUID
import org.springframework.test.context.ActiveProfiles

@AutoConfigureMockMvc
@ActiveProfiles(Array("test"))
class YkViestiServiceTest extends IntegrationTestBase {

  @MockitoBean
  var onrService: OnrService = _

  var ykViestiService: YkViestiService = _

  @BeforeAll
  def setupOnce: Unit = {
    val esittelijaIdMaybe = esittelijaRepository
      .insertEsittelija(
        esittelijaOid = UserOid("EsittelijaOid-1"),
        muokkaajaTaiLuoja = "testiajuri"
      )
      .map(_.esittelijaId)
    val asiakirjaId = asiakirjaRepository.tallennaUudetAsiakirjatiedot(
      Asiakirja(),
      "testiajuri"
    )
    hakemusRepository.tallennaHakemus(
      hakemusOid = HakemusOid("HakemusOid-1"),
      hakemusKoskee = 4,
      formId = 5,
      esittelijaId = esittelijaIdMaybe,
      asiakirjaId = asiakirjaId,
      lopullinenPaatosVastaavaEhdollinenAsiatunnus = None,
      lopullinenPaatosVastaavaEhdollinenSuoritusmaaKoodiUri = None,
      luoja = "testiajuri"
    )
  }

  @BeforeEach
  def setup(): Unit = {
    MockitoAnnotations.openMocks(this)
    ykViestiService = new YkViestiService(
      ykViestiRepository = ykViestiRepository,
      onrService = onrService
    )
  }

  @Test
  def luoHakemuksenYkViestiMerkitseeLuojanJaAjan(): Unit = {

    // Setup
    val hakemusOid = "HakemusOid-1"
    val user       = User(
      userOid = "LahettajaOid-1",
      authorities = List.empty,
      asiointikieli = None
    )
    val ykKysymysDto = YkKysymysDTO(
      kysymys = Some("Kysymys"),
      vastaanottajaOid = Some("VastaanottajaOid-1")
    )

    // Act
    ykViestiService.luoHakemuksenYkViesti(
      hakemusOid = hakemusOid,
      user = user,
      ykKysymys = ykKysymysDto
    )

    // Verify
    val result = ykViestiRepository.haeHakemuksenYkViestit(hakemusOid).head

    assert(result.luoja.get == "LahettajaOid-1")
    assert(result.luotu.nonEmpty)
  }

  @Test
  def vastaaHakemuksenYkViestiinMerkitseeMuokkaajanJaAjan(): Unit = {
    // Setup
    val hakemusOid = "HakemusOid-1"
    val user       = User(
      userOid = "VastaanottajaOid-1",
      authorities = List.empty,
      asiointikieli = None
    )
    val existingYkViestiId = ykViestiRepository.luoHakemuksenYkViesti(
      YkViesti(
        id = null,
        hakemusOid = HakemusOid(hakemusOid),
        lahettajaOid = Some("UserOid-1"),
        vastaanottajaOid = Some("VastaanottajaOid-1"),
        kysymys = Some("Kysymys"),
        luoja = Some("LahettajaOid-1"),
        hakija = null
      )
    )
    val ykVastausDto = YkVastausDTO(
      id = Some(existingYkViestiId.toString),
      vastaus = Some("Vastaus"),
      laheta = Some(true)
    )

    // Act
    ykViestiService.vastaaHakemuksenYkViestiin(
      hakemusOid = hakemusOid,
      user = user,
      ykVastaus = ykVastausDto
    )

    // Verify
    val result = ykViestiRepository.haeYkViesti(hakemusOid, existingYkViestiId.toString).get

    assert(result.muokkaaja.get == "VastaanottajaOid-1")
    assert(result.muokattu.nonEmpty)
  }

  @Test
  def merkitseYkViestiLuetuksiMerkitseeMuokkaajanJaAjan(): Unit = {
    // Setup
    val hakemusOid = "HakemusOid-1"
    val user       = User(
      userOid = "VastaanottajaOid-1",
      authorities = List.empty,
      asiointikieli = None
    )
    val existingYkViestiId = ykViestiRepository.luoHakemuksenYkViesti(
      YkViesti(
        id = null,
        hakemusOid = HakemusOid(hakemusOid),
        lahettajaOid = Some("UserOid-1"),
        vastaanottajaOid = Some("VastaanottajaOid-1"),
        kysymys = Some("Kysymys"),
        luoja = Some("LahettajaOid-1"),
        hakija = null
      )
    )

    // Act
    ykViestiService.merkitseYkViestiLuetuksi(
      hakemusOid = hakemusOid,
      viestiId = existingYkViestiId.toString,
      user = user
    )

    // Verify
    val result = ykViestiRepository.haeYkViesti(hakemusOid, existingYkViestiId.toString).get

    assert(result.muokkaaja.get == "VastaanottajaOid-1")
    assert(result.muokattu.nonEmpty)
  }
}
