package fi.oph.tutu.backend.domain

case class User(
  userOid: String,
  authorities: List[String],
  asiointikieli: Option[String] = None
)

case class UserResponse(user: User)

case class KansalaisuusKoodi(kansalaisuusKoodi: String)

case class OnrUser(
  oidHenkilo: String,
  kutsumanimi: String,
  sukunimi: String,
  kansalaisuus: Seq[KansalaisuusKoodi],
  hetu: Option[String],
  yksiloityVTJ: Boolean
)
