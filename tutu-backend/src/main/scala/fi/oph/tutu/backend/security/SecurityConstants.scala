package fi.oph.tutu.backend.security

object SecurityConstants {
  final val OPH_ORGANISAATIO_OID = "1.2.246.562.10.00000000001"

  final val SECURITY_ROOLI_PREFIX          = "ROLE_APP_TUTU_"
  final val SECURITY_ROOLI_ESITTELIJA_FULL = SECURITY_ROOLI_PREFIX + "ESITTELIJA"
  final val SECURITY_ROOLI_CRUD_FULL       = SECURITY_ROOLI_PREFIX + "CRUD"
}
