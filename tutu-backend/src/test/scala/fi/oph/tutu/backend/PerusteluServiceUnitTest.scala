package fi.oph.tutu.backend

import fi.oph.tutu.backend.repository.{HakemusRepository, PerusteluRepository}
import fi.oph.tutu.backend.service.*
import fi.oph.tutu.backend.domain.*

import org.junit.jupiter.api.*
import org.junit.jupiter.api.Assertions.assertEquals

import org.mockito.ArgumentMatchers.any
import org.mockito.Mockito.*
import org.mockito.*

import java.util.Random
import java.time.LocalDateTime
import java.util.UUID

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

val perustelu = Perustelu(
  id = UUID.randomUUID(),
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
  muokkaaja = ""
)
val somePerustelu = Some(perustelu)
val perusteluId   = perustelu.id

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
    ).map(values => {

      val hakemusResult   = values(0)
      val perusteluResult = values(1)
      val expectedResult  = values(2)

      // Setup mock behavior
      when(hakemusRepository.haeHakemus(any[HakemusOid])).thenReturn(hakemusResult)
      when(perusteluRepository.haePerustelu(any[UUID])).thenReturn(perusteluResult)

      val result = perusteluService.haePerustelu(
        HakemusOid("de4ffbea-1763-4a43-a24d-50ee48b81ff1")
      )

      assertEquals(result, expectedResult)
    })
  }

  @Test
  def tallennaPerustelu(): Unit = {
    Seq(
      (someDbHakemus, perusteluId, somePerustelu, somePerustelu),
      (someDbHakemus, perusteluId, None, None),
      (None, perusteluId, somePerustelu, None),
      (None, perusteluId, None, None)
    ).map(values => {

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
        HakemusOid("de4ffbea-1763-4a43-a24d-50ee48b81ff1"),
        perustelu,
        "Hakemuspalvelu"
      )

      assertEquals(result, expectedResult)
    })
  }
}
