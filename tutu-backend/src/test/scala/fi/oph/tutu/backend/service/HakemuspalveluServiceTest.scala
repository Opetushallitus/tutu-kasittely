package fi.oph.tutu.backend.service

import fi.oph.tutu.backend.UnitTestBase
import org.junit.jupiter.api.{BeforeEach, Test}
import org.junit.jupiter.api.Assertions.{assertEquals, assertTrue, fail}
import org.mockito.{Mock, MockitoAnnotations}

class HakemuspalveluServiceTest extends UnitTestBase {
  @Mock
  var httpService: HttpService = _

  var hakemuspalveluService: HakemuspalveluService = _

  @BeforeEach
  def setup(): Unit = {
    MockitoAnnotations.openMocks(this)
    hakemuspalveluService = new HakemuspalveluService(httpService)
  }

  @Test
  def testLiitteidenMuutoshistoria(): Unit = {
    val fileIdsWithTimestamp1 = Seq(
      "4e75a4ad-9e3a-476b-91de-befba64032e0",
      "4dd2eb91-bd62-4664-ad55-bf39dd676357",
      "2cfb0bfa-4938-44b1-8fa0-b3a3caa5f4bb",
      "550e8400-e29b-41d4-a716-446655440000"
    )
    val fileIdsWithTimestamp2 = Seq(
      "11b26d39-c25d-4c7b-97cd-f174048e3a0d",
      "74e42ebc-5e32-4b59-b783-f49b16f3d5cf",
      "5b9f65e0-fde7-47f5-99a1-5c8efc7b0b5e",
      "c3e8805d-fc7e-4c0b-b145-5a82a0ad6dbb"
    )
    val muutosHistoria = hakemuspalveluService.resolveLiitteidenMuutoshistoria(loadJson("muutosHistoria.json"))
    assertEquals(8, muutosHistoria.size)
    fileIdsWithTimestamp1.foreach(id => assertEquals("2025-06-17T13:02:20.473", muutosHistoria(id)))
    fileIdsWithTimestamp2.foreach(id => assertEquals("2025-10-16T09:33:02.234580", muutosHistoria(id)))
  }
}
