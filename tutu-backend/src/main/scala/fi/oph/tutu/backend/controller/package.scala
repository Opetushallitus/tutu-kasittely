package fi.oph.tutu.backend

package object controller {
  final val RESPONSE_200_DESCRIPTION =
    "Pyyntö vastaanotettu"
  final val RESPONSE_400_DESCRIPTION = "Pyyntö virheellinen"
  final val RESPONSE_403_DESCRIPTION =
    "Käyttäjällä ei ole tarvittavia oikeuksia hakemusten luontiin"
  final val RESPONSE_500_DESCRIPTION = "Palvelinvirhe"
}
