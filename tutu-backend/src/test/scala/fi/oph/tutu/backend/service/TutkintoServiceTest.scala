package fi.oph.tutu.backend.service

import fi.oph.tutu.backend.domain.*
import fi.oph.tutu.backend.repository.*
import fi.oph.tutu.backend.service.*
import fi.oph.tutu.backend.UnitTestBase

import java.util.UUID

import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.*

import org.mockito.ArgumentMatchers.*
import org.mockito.Mockito.*
import org.mockito.{Mock, MockitoAnnotations}

class TutkintoServiceTest extends UnitTestBase {

  @Mock
  var tutkintoRepository: TutkintoRepository = _
  @Mock
  var onrService: OnrService = _

  var tutkintoService: TutkintoService = _

  @BeforeEach
  def setup(): Unit = {
    MockitoAnnotations.openMocks(this)
    tutkintoService = new TutkintoService(
      tutkintoRepository = tutkintoRepository,
      onrService = onrService
    )
  }

  @Test
  def haeTutkintoPalauttaaMuokkaajanNimen(): Unit = {
    // Data
    val hakemusId  = UUID.randomUUID
    val tutkintoId = UUID.randomUUID
    val dbTutkinto = Tutkinto(
      id = Some(tutkintoId),
      hakemusId = hakemusId,
      jarjestys = "1",
      muokkaaja = Some("1234")
    )

    // Mock setup
    when(tutkintoRepository.haeTutkintoIdlla(any[UUID])).thenReturn(Some(dbTutkinto))

    when(onrService.haeNimiOption(any[Option[String]])).thenReturn(Some("Topolino"))

    // Act
    val tutkinto = tutkintoService.haeTutkinto(tutkintoId).get

    // Verify
    assertEquals(tutkinto.muokkaaja, Some("Topolino"))
  }

  @Test
  def haeTutkinnotPalauttaaMuokkaajanNimen(): Unit = {
    // Data
    val hakemusOid = HakemusOid("poop")
    val hakemusId  = UUID.randomUUID
    val tutkintoId = UUID.randomUUID
    val dbTutkinto = Tutkinto(
      id = Some(tutkintoId),
      hakemusId = hakemusId,
      jarjestys = "1",
      muokkaaja = Some("1234")
    )

    // Mock setup
    when(tutkintoRepository.haeTutkinnotHakemusOidilla(any[HakemusOid])).thenReturn(Seq(dbTutkinto))

    when(onrService.haeNimiOption(any[Option[String]])).thenReturn(Some("Topolino"))

    // Act
    val tutkinnot = tutkintoService.haeTutkinnot(hakemusOid)

    // Verify
    tutkinnot.foreach(tutkinto => assertEquals(tutkinto.muokkaaja, Some("Topolino")))
  }

}
