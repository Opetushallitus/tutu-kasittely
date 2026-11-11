package fi.oph.tutu.backend.exception

/**
 * Poikkeus tekstipohjan tai sen kategorian validoinnin epäonnistuessa (esim. nimi puuttuu, kategoriaa ei löydy).
 * Käytetään HTTP 400 (Bad Request) vastauksiin.
 */
class TekstipohjaValidationException(message: String) extends RuntimeException(message)
