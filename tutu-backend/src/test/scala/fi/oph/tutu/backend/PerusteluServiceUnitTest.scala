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

val perusteluId = UUID.randomUUID()
val hakemusId   = UUID.fromString("de4ffbea-1763-4a43-a24d-50ee48b81ff1")
val luoja       = "Hakemuspalvelu"
val muokkaaja   = Some("Traktoripalvelu")

val someDbHakemus = Some(
  DbHakemus(
    id = hakemusId,
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
  id = Some(UUID.randomUUID()),
  perusteluId = perusteluId,
  perustelunSisalto = PerusteluUoRoSisalto(
    opettajatEroMonialaisetOpinnotLaajuus = Some(true),
    opettajatEroOpetettavatAineetOpinnotLaajuus = Some(true),
    opettajatMuuEro = Some(true),
    opettajatMuuEroSelite = Some("Väärennetyt todistukset"),
    vkOpettajatEroKasvatustieteellisetOpinnotSisalto = Some(true),
    vkOpettajatEroVarhaiskasvatusEsiopetusOpinnotLaajuus = Some(true),
    vkOpettajatMuuEro = Some(true),
    vkOpettajatMuuEroSelite = Some("Ei tää mikää opettaja oo"),
    otmMuuEro = Some(true),
    otmMuuEroSelite = Some("Juu ei kyl"),
    sovellettuMuuTilanne = Some(true),
    sovellettuMuuTilanneSelite = Some("Muutamia muita")
  )
)
val partialPerusteluUoRo = PartialPerustelu(
  perusteluUoRo =
    Some(PartialPerusteluUoRo(perusteluId = perusteluId, perustelunSisalto = Some(perusteluUoRo.perustelunSisalto)))
)

val muokattuPerusteluUoRo = PerusteluUoRo(
  perusteluId = perusteluId,
  perustelunSisalto = PerusteluUoRoSisalto(
    opettajatEroMonialaisetOpinnotLaajuus = Some(false),
    opettajatEroOpetettavatAineetOpinnotLaajuus = Some(false),
    opettajatMuuEro = Some(false),
    opettajatMuuEroSelite = Some(""),
    vkOpettajatEroKasvatustieteellisetOpinnotSisalto = Some(false),
    vkOpettajatEroVarhaiskasvatusEsiopetusOpinnotLaajuus = Some(false),
    vkOpettajatMuuEro = Some(false),
    vkOpettajatMuuEroSelite = Some(""),
    otmMuuEro = Some(false),
    otmMuuEroSelite = Some(""),
    sovellettuMuuTilanne = Some(false),
    sovellettuMuuTilanneSelite = Some("")
  )
)
val partialMuokattuPerusteluUoRo = PartialPerustelu(
  perusteluUoRo = Some(
    PartialPerusteluUoRo(perusteluId = perusteluId, perustelunSisalto = Some(muokattuPerusteluUoRo.perustelunSisalto))
  )
)

val perustelu = Perustelu(
  hakemusId = hakemusId,
  virallinenTutkinnonMyontaja = Some(true),
  virallinenTutkinto = Some(true),
  lahdeLahtomaanKansallinenLahde = true,
  lahdeLahtomaanVirallinenVastaus = true,
  lahdeKansainvalinenHakuteosTaiVerkkosivusto = true,
  ylimmanTutkinnonAsemaLahtomaanJarjestelmassa = Some("alempi_korkeakouluaste")
)
val partialPerustelu = PartialPerustelu(
  virallinenTutkinnonMyontaja = perustelu.virallinenTutkinnonMyontaja,
  virallinenTutkinto = perustelu.virallinenTutkinto,
  lahdeLahtomaanKansallinenLahde = Some(perustelu.lahdeLahtomaanKansallinenLahde),
  lahdeLahtomaanVirallinenVastaus = Some(perustelu.lahdeLahtomaanVirallinenVastaus),
  lahdeKansainvalinenHakuteosTaiVerkkosivusto = Some(perustelu.lahdeKansainvalinenHakuteosTaiVerkkosivusto),
  ylimmanTutkinnonAsemaLahtomaanJarjestelmassa = perustelu.ylimmanTutkinnonAsemaLahtomaanJarjestelmassa
)

val muokattuPerustelu = perustelu.copy(
  virallinenTutkinnonMyontaja = Some(false),
  virallinenTutkinto = perustelu.virallinenTutkinto,
  lahdeLahtomaanKansallinenLahde = false,
  lahdeLahtomaanVirallinenVastaus = false,
  lahdeKansainvalinenHakuteosTaiVerkkosivusto = false,
  ylimmanTutkinnonAsemaLahtomaanJarjestelmassa = Some("ylempi_korkeakouluaste")
)
val partialMuokattuPerustelu = PartialPerustelu(
  virallinenTutkinnonMyontaja = muokattuPerustelu.virallinenTutkinnonMyontaja,
  virallinenTutkinto = None,
  lahdeLahtomaanKansallinenLahde = Some(muokattuPerustelu.lahdeLahtomaanKansallinenLahde),
  lahdeLahtomaanVirallinenVastaus = Some(muokattuPerustelu.lahdeLahtomaanVirallinenVastaus),
  lahdeKansainvalinenHakuteosTaiVerkkosivusto = Some(muokattuPerustelu.lahdeKansainvalinenHakuteosTaiVerkkosivusto),
  ylimmanTutkinnonAsemaLahtomaanJarjestelmassa = muokattuPerustelu.ylimmanTutkinnonAsemaLahtomaanJarjestelmassa
)

val somePerustelu           = Some(perustelu)
val someMuokattuPerustelu   = Some(muokattuPerustelu)
val somePerusteluUoRo       = Some(perusteluUoRo)
val someMuokattuPerusteluUo = Some(muokattuPerusteluUoRo)

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
    Seq[(Option[DbHakemus], Option[Perustelu], PartialPerustelu, Option[Perustelu])](
      (someDbHakemus, None, partialPerustelu, somePerustelu),
      (someDbHakemus, somePerustelu, partialMuokattuPerustelu, someMuokattuPerustelu),
      (None, somePerustelu, partialPerustelu, None),
      (None, None, partialPerustelu, None)
    ).foreach(values => {
      val hakemusResult                     = values(0)
      val existingPerustelu                 = values(1)
      val perusteluRequest                  = values(2)
      val expectedResult: Option[Perustelu] = values(3)

      // Setup mock behavior
      when(hakemusRepository.haeHakemus(any[HakemusOid])).thenReturn(hakemusResult)
      when(perusteluRepository.haePerustelu(any[UUID])).thenReturn(existingPerustelu)
      when(
        perusteluRepository.tallennaPerustelu(
          hakemusId,
          expectedResult.orNull,
          luoja
        )
      ).thenReturn(expectedResult.orNull)

      val result = perusteluService.tallennaPerustelu(
        HakemusOid("1.2.246.562.11.00000000000000006666"),
        perusteluRequest,
        luoja
      )
      assertEquals(expectedResult, result)
    })
  }

  // @Test
  def tallennaPerusteluWithUoro(): Unit = {
    Seq[(Option[DbHakemus], Option[PerusteluUoRo], PartialPerustelu, Option[Perustelu], Option[PerusteluUoRo])](
      (someDbHakemus, None, partialPerusteluUoRo, somePerustelu, somePerusteluUoRo),
      (someDbHakemus, somePerusteluUoRo, partialMuokattuPerusteluUoRo, somePerustelu, someMuokattuPerusteluUo),
      (None, None, partialMuokattuPerusteluUoRo, None, None)
    ).foreach(values => {
      val hakemusResult                        = values(0)
      val existingPerusteluUoRo                = values(1)
      val perusteluRequest                     = values(2)
      val expectedPerustelu: Option[Perustelu] = values(3)
      val expectedUoRo: Option[PerusteluUoRo]  = values(4)

      val expectedPerusteluWithId = expectedPerustelu.flatMap(per => Some(per.copy(id = perusteluId)))

      // Setup mock behavior
      when(hakemusRepository.haeHakemus(any[HakemusOid])).thenReturn(hakemusResult)
      when(perusteluRepository.haePerustelu(any[UUID])).thenReturn(expectedPerusteluWithId)
      when(perusteluRepository.haePerusteluUoRo(perusteluId)).thenReturn(existingPerusteluUoRo)
      when(
        perusteluRepository.tallennaPerusteluUoRo(
          perusteluId,
          expectedUoRo.orNull,
          luoja
        )
      ).thenReturn(expectedUoRo.orNull)

      val result = perusteluService.tallennaPerustelu(
        HakemusOid("1.2.246.562.11.00000000000000006666"),
        perusteluRequest,
        "Hakemuspalvelu"
      )
      assertEquals(expectedPerusteluWithId.flatMap(per => Some(per.copy(perusteluUoRo = expectedUoRo))), result)
    })
  }
}
