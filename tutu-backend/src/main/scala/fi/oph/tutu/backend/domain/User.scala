package fi.oph.tutu.backend.domain

import scala.beans.BeanProperty

case class User(
  @BeanProperty userOid: String,
  @BeanProperty authorities: List[String],
  @BeanProperty asiointikieli: Option[String] = None
)

case class UserResponse(@BeanProperty user: User)

case class KansalaisuusKoodi(kansalaisuusKoodi: String)

case class OnrUser(
  oidHenkilo: String,
  kutsumanimi: String,
  sukunimi: String,
  kansalaisuus: Seq[KansalaisuusKoodi],
  hetu: Option[String],
  syntymaaika: String,
  yksiloityVTJ: Boolean
)
