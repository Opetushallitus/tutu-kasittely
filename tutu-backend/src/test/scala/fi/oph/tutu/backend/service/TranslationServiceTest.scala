package fi.oph.tutu.backend.service

import fi.oph.tutu.backend.UnitTestBase
import fi.vm.sade.javautils.nio.cas.CasClient
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.{BeforeEach, Test}
import org.mockito.ArgumentMatchers.any
import org.mockito.Mockito.when
import org.mockito.{Mock, MockitoAnnotations}

class TranslationServiceTest extends UnitTestBase {
  @Mock
  var httpService: HttpService = _

  var translationService: TranslationService = _

  @BeforeEach
  def setup(): Unit = {
    MockitoAnnotations.openMocks(this)
    translationService = new TranslationService(httpService)
  }

  @Test
  def ReturnsTranslatedTextWhenTranslationIsFound(): Unit = {
    val responseString = """
      [{
        "id": 11,
        "namespace": "tutu-kasittely",
        "key": "correct.key",
        "locale": "fi",
        "value": "Success"
      }]
    """
    when(httpService.get(any[CasClient], any[String])).thenReturn(Right(responseString))
    val translation = translationService.getTranslation("fi", "correct.key")
    assertEquals(translation, "Success")
  }

  @Test
  def ReturnsTranslationKeyWhenTranslationIsNotFound(): Unit = {
    when(httpService.get(any[CasClient], any[String])).thenReturn(Left(Throwable("Key not found")))
    val translation = translationService.getTranslation("fi", "incorrect.key")
    assertEquals(translation, "incorrect.key")
  }
}
