package fi.oph.tutu.backend.domain

import scala.beans.BeanProperty

case class HakemusListItem(
  @BeanProperty hakemusOid: String,
  @BeanProperty syykoodi: Int,
  @BeanProperty esittelijaId: Option[String],
  @BeanProperty esittelijaOid: Option[String]
)
