package fi.oph.tutu.backend.domain

import java.util.UUID
import scala.beans.BeanProperty

case class User(
  @BeanProperty userOid: String,
  @BeanProperty authorities: List[String],
  @BeanProperty asiointikieli: Option[String] = None
)

case class UserResponse(@BeanProperty user: User)

case class OnrUser(
  oidHenkilo: String,
  kutsumanimi: String,
  sukunimi: String
)
