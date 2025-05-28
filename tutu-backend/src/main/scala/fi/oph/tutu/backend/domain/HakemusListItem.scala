package fi.oph.tutu.backend.domain

import scala.beans.BeanProperty

case class HakemusListItem(
  @BeanProperty hakija: String,
  @BeanProperty vaihe: String,
  @BeanProperty aika: String,
  @BeanProperty hakemusOid: String,
  @BeanProperty syykoodi: Int,
  @BeanProperty esittelijaOid: Option[String],
  @BeanProperty asiatunnus: Option[String]
)
