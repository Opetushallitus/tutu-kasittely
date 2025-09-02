package fi.oph.tutu.backend

import fi.oph.tutu.backend.domain.*
import fi.oph.tutu.backend.repository.{HakemusRepository, PerusteluRepository}
import fi.oph.tutu.backend.service.*
import org.junit.jupiter.api.*
import org.junit.jupiter.api.Assertions.assertEquals
import org.mockito.*
import org.mockito.ArgumentMatchers.any
import org.mockito.Mockito.*

import java.time.LocalDateTime
import java.util.UUID

val perusteluId   = UUID.randomUUID()
val someDbHakemus = Some(
  DbHakemus(
    id = UUID.fromString("de4ffbea-1763-4a43-a24d-50ee48b81ff1"),
    hakemusOid = HakemusOid("1.2.246.562.11.00000000000000006666"),
    hakemusKoskee = 1,
    esittelijaId = Option(UUID.fromString("de4ffbea-1763-4a43-a24d-50ee48b81ff1")),
    esittelijaOid = Option(UserOid("1.2.246.562.24.00000000000000006666")),
    asiatunnus = Option("OPH-197-2025"),
    kasittelyVaihe = KasittelyVaihe.fromString("AlkukasittelyKesken"),
    muokattu = Option(LocalDateTime.parse("2025-06-14T10:59:47.597")),
    asiakirjaId = None,
    yhteistutkinto = false
  )
)

val perusteluUoRo = PerusteluUoRo(
  id = UUID.randomUUID(),
  perusteluId = perusteluId,
  perustelunSisalto = PerusteluUoRoSisalto(
    koulutuksenSisalto = Some("Sisältöä elämään"),
    opettajatEroMonialaisetOpinnotLaajuus = true,
    opettajatEroOpetettavatAineetOpinnotLaajuus = true,
    opettajatMuuEro = true,
    opettajatMuuEroSelite = Some("Väärennetyt todistukset"),
    vkOpettajatEroKasvatustieteellisetOpinnotSisalto = true,
    vkOpettajatEroVarhaiskasvatusEsiopetusOpinnotLaajuus = true,
    vkOpettajatMuuEro = true,
    vkOpettajatMuuEroSelite = Some("Ei tää mikää opettaja oo"),
    otmMuuEro = true,
    otmMuuEroSelite = Some("Juu ei kyl"),
    sovellettuMuuTilanne = true,
    sovellettuMuuTilanneSelite = Some("Muutamia muita")
  ),
  luotu = LocalDateTime.now(),
  luoja = "Hakemuspalvelu",
  muokattu = None,
  muokkaaja = Option("")
)

val perustelu = Perustelu(
  id = perusteluId,
  hakemusId = UUID.randomUUID(),
  virallinenTutkinnonMyontaja = Option(true),
  virallinenTutkinto = Option(true),
  lahdeLahtomaanKansallinenLahde = true,
  lahdeLahtomaanVirallinenVastaus = true,
  lahdeKansainvalinenHakuteosTaiVerkkosivusto = true,
  selvitysTutkinnonMyontajastaJaTutkinnonVirallisuudesta = "",
  ylimmanTutkinnonAsemaLahtomaanJarjestelmassa = Option("alempi_korkeakouluaste"),
  selvitysTutkinnonAsemastaLahtomaanJarjestelmassa = "",
  luotu = LocalDateTime.now(),
  luoja = "Hakemuspalvelu",
  muokattu = None,
  muokkaaja = Option(""),
  perusteluUoRo = None
)

val somePerustelu                  = Some(perustelu)
val somePerusteluWithUoRoPerustelu = Some(perustelu.copy(perusteluUoRo = Some(perusteluUoRo)))

class PerusteluServiceUnitTest extends UnitTestBase {

  @Mock
  var hakemusRepository: HakemusRepository = _

  @Mock
  var perusteluRepository: PerusteluRepository = _

  var perusteluService: PerusteluService = _

  @BeforeEach
  def setup(): Unit = {
    MockitoAnnotations.openMocks(this)
    perusteluService = new PerusteluService(
      hakemusRepository,
      perusteluRepository
    )
  }

  @Test
  def haePerustelu(): Unit = {
    Seq(
      (someDbHakemus, somePerustelu, somePerustelu),
      (someDbHakemus, None, None),
      (None, somePerustelu, None),
      (None, None, None)
    ).foreach(values => {
      val hakemusResult   = values(0)
      val perusteluResult = values(1)
      val expectedResult  = values(2)

      // Setup mock behavior
      when(hakemusRepository.haeHakemus(any[HakemusOid])).thenReturn(hakemusResult)
      when(perusteluRepository.haePerustelu(any[UUID])).thenReturn(perusteluResult)

      val result = perusteluService.haePerustelu(
        HakemusOid("1.2.246.562.11.00000000000000006666")
      )

      assertEquals(expectedResult, result)
    })
  }

  @Test
  def haePerusteluWithUoRo(): Unit = {
    Seq(
      (someDbHakemus, somePerusteluWithUoRoPerustelu, somePerusteluWithUoRoPerustelu),
      (someDbHakemus, None, None),
      (None, somePerusteluWithUoRoPerustelu, None),
      (None, None, None)
    ).foreach(values => {
      val hakemusResult   = values(0)
      val perusteluResult = values(1)
      val expectedResult  = values(2)

      // Setup mock behavior
      when(hakemusRepository.haeHakemus(any[HakemusOid])).thenReturn(hakemusResult)
      when(perusteluRepository.haePerustelu(any[UUID])).thenReturn(perusteluResult)

      val result = perusteluService.haePerustelu(
        HakemusOid("1.2.246.562.11.00000000000000006666")
      )

      assertEquals(expectedResult, result)
    })
  }

  @Test
  def tallennaPerustelu(): Unit = {
    Seq(
      (someDbHakemus, perusteluId, somePerustelu, somePerustelu),
      (someDbHakemus, perusteluId, None, None),
      (None, perusteluId, somePerustelu, None),
      (None, perusteluId, None, None)
    ).foreach(values => {
      val hakemusResult     = values(0)
      val perusteluIdResult = values(1)
      val perusteluResult   = values(2)
      val expectedResult    = values(3)

      // Setup mock behavior
      when(hakemusRepository.haeHakemus(any[HakemusOid])).thenReturn(hakemusResult)
      when(perusteluRepository.haePerustelu(any[UUID])).thenReturn(perusteluResult)
      when(
        perusteluRepository.tallennaPerustelu(
          any[UUID],
          any[Perustelu],
          any[String]
        )
      ).thenReturn(perusteluIdResult)

      val result = perusteluService.tallennaPerustelu(
        HakemusOid("1.2.246.562.11.00000000000000006666"),
        perustelu,
        "Hakemuspalvelu"
      )
      assertEquals(expectedResult, result)
    })
  }

  @Test
  def tallennaPerusteluWithUoro(): Unit = {
    Seq(
      (someDbHakemus, perusteluId, somePerusteluWithUoRoPerustelu, somePerusteluWithUoRoPerustelu),
      (someDbHakemus, perusteluId, None, None),
      (None, perusteluId, somePerusteluWithUoRoPerustelu, None),
      (None, perusteluId, None, None)
    ).foreach(values => {
      val hakemusResult     = values(0)
      val perusteluIdResult = values(1)
      val perusteluResult   = values(2)
      val expectedResult    = values(3)

      // Setup mock behavior
      when(hakemusRepository.haeHakemus(any[HakemusOid])).thenReturn(hakemusResult)
      when(perusteluRepository.haePerustelu(any[UUID])).thenReturn(perusteluResult)
      when(
        perusteluRepository.tallennaPerustelu(
          any[UUID],
          any[Perustelu],
          any[String]
        )
      ).thenReturn(perusteluIdResult)
      when(
        perusteluRepository.tallennaPerusteluUoRo(
          any[UUID],
          any[PerusteluUoRo],
          any[String]
        )
      ).thenReturn(perusteluUoRo)

      val result = perusteluService.tallennaPerustelu(
        HakemusOid("1.2.246.562.11.00000000000000006666"),
        perustelu,
        "Hakemuspalvelu"
      )
      assertEquals(expectedResult, result)
    })
  }
}
