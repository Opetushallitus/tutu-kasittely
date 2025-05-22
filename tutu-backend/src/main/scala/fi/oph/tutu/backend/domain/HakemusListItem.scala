package fi.oph.tutu.backend.domain

import scala.beans.BeanProperty

case class HakemusListItem(
  @BeanProperty asiatunnus: String,
  @BeanProperty hakija: String,
  @BeanProperty vaihe: String,
  @BeanProperty paatostyyppi: String,
  @BeanProperty aika: String,
  @BeanProperty hakemusOid: String,
  @BeanProperty syykoodi: Int,
  @BeanProperty esittelijaId: Option[String],
  @BeanProperty esittelijaOid: Option[String]
)
