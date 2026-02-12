package fi.oph.tutu.backend.service

import fi.oph.tutu.backend.UnitTestBase
import fi.oph.tutu.backend.domain.Tutkinto
import org.junit.jupiter.api.Assertions.{assertEquals, assertTrue}
import org.junit.jupiter.api.Test

import java.util.UUID

class HakemusModifyOperationResolverTest extends UnitTestBase {
  val tutkinto1 = Tutkinto(None, UUID.fromString("de4ffbea-1763-4a43-a24d-50ee48b81ff1"), "1", None, None)
  val tutkinto2 = Tutkinto(None, UUID.fromString("de4ffbea-1763-4a43-a24d-50ee48b81ff1"), "2", None, None)
  val tutkinto3 = Tutkinto(
    Some(UUID.fromString("de4ffbea-1763-4a43-a24d-50ee48b81ff1")),
    UUID.fromString("de4ffbea-1763-4a43-a24d-50ee48b81ff1"),
    "3",
    None,
    None
  )
  val tutkinto4 = Tutkinto(
    Some(UUID.fromString("de4ffbea-1763-4a43-a24d-50ee48b81ff2")),
    UUID.fromString("de4ffbea-1763-4a43-a24d-50ee48b81ff1"),
    "4",
    None,
    None
  )
  val tutkinto5 = Tutkinto(
    Some(UUID.fromString("de4ffbea-1763-4a43-a24d-50ee48b81ff3")),
    UUID.fromString("de4ffbea-1763-4a43-a24d-50ee48b81ff1"),
    "5",
    None,
    None
  )
  val tutkinto6 = Tutkinto(
    Some(UUID.fromString("de4ffbea-1763-4a43-a24d-50ee48b81ff4")),
    UUID.fromString("de4ffbea-1763-4a43-a24d-50ee48b81ff1"),
    "6",
    None,
    None
  )
  val muuTutkinto = Tutkinto(
    Some(UUID.fromString("de4ffbea-1763-4a43-a24d-50ee48b81ff5")),
    UUID.fromString("de4ffbea-1763-4a43-a24d-50ee48b81ff1"),
    "MUU",
    None,
    None
  )

  @Test
  def testTutkinnontNumeroidaanOikeinKunPoistetaanUseita(): Unit = {
    val currentTutkinnot = Seq(tutkinto3, tutkinto4, tutkinto5, tutkinto6, muuTutkinto)
    val toBeTutkinnot    = Seq(tutkinto1, tutkinto2, tutkinto4, tutkinto6, muuTutkinto)
    val modifyData = HakemusModifyOperationResolver.resolveTutkintoModifyOperations(currentTutkinnot, toBeTutkinnot)
    assertEquals(2, modifyData.poistetut.size)
    assertEquals(2, modifyData.muutetut.size)
    assertEquals(tutkinto4.copy(jarjestys = "3"), modifyData.muutetut.head)
    assertEquals(tutkinto6.copy(jarjestys = "4"), modifyData.muutetut(1))
  }
  @Test
  def testTutkinnontAsetetaanOikeinKunEiTarvitaUudellenNumerointia(): Unit = {
    val currentTutkinnot = Seq(tutkinto3, tutkinto4, tutkinto5, tutkinto6, muuTutkinto)
    val toBeTutkinnot    = Seq(tutkinto3, tutkinto4, muuTutkinto)
    val modifyData = HakemusModifyOperationResolver.resolveTutkintoModifyOperations(currentTutkinnot, toBeTutkinnot)
    assertEquals(2, modifyData.poistetut.size)
    assertTrue(modifyData.muutetut.isEmpty)
  }
}
