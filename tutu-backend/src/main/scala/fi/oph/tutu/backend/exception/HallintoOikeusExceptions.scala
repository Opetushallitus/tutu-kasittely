package fi.oph.tutu.backend.exception

/**
 * Poikkeus tilanteissa, joissa hallinto-oikeutta, maakuntaa tai kuntaa ei löydy.
 * Käytetään HTTP 404 (Not Found) vastauksiin.
 */
class HallintoOikeusNotFoundException(message: String) extends RuntimeException(message)

/**
 * Poikkeus ulkoisten palveluiden (esim. koodisto-palvelu) virhetilanteissa.
 * Käytetään HTTP 500 (Internal Server Error) vastauksiin.
 */
class HallintoOikeusServiceException(message: String, cause: Throwable) extends RuntimeException(message, cause)
