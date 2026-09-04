package fi.oph.tutu.backend.exception

/**
 * Poikkeus valitustietojen validoinnin epäonnistuessa (esim. KHO:n päivämääräkentät ristiriidassa).
 * Käytetään HTTP 400 (Bad Request) vastauksiin.
 */
class ValitustiedotValidationException(message: String) extends RuntimeException(message)
