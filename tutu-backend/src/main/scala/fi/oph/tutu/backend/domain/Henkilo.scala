package fi.oph.tutu.backend.domain

case class OnrHenkilo(
  oidHenkilo: String,
  kutsumanimi: String,
  sukunimi: String
)

case class Henkilo(
  oid: String,
  etunimi: String,
  sukunimi: String
)
