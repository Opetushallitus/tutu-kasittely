package fi.oph.tutu.backend.domain

import java.time.LocalDateTime
import java.util.UUID

case class Valitustiedot(
  id: Option[UUID] = None,
  hakemusId: Option[UUID] = None,
  valitusOPH: ValitusOPH,
  valitusHaO: ValitusHaO,
  valitusKHO: ValitusKHO,
  luoja: Option[String] = None,
  luotu: Option[LocalDateTime] = None,
  muokkaaja: Option[String] = None,
  muokattu: Option[LocalDateTime] = None
)

case class ValitusOPH(
  maksu: Option[Boolean] = None,
  asiavirhe: Option[Boolean] = None,
  kirjoitusvirhe: Option[Boolean] = None,
  muu: Option[Boolean] = None,
  tasmennys: Option[String] = None
)

case class ValitusHaO(
  valitettu: Option[Boolean] = None,
  valitusPvm: Option[LocalDateTime] = None,
  ratkaisuPvm: Option[LocalDateTime] = None,
  lausuntopyyntoValittu: Option[Boolean] = None,
  lausuntopyynto: Option[ValitusLausuntopyynto] = None,
  valittajanVaatimus: Option[ValitusHaOValittajanVaatimus] = None,
  ratkaisu: Option[String] = None,
  ratkaisuLisatieto: Option[String] = None
)

case class ValitusLausuntopyynto(
  ashaTunnus: Option[String] = None,
  saapumisPvm: Option[LocalDateTime] = None,
  maaraAikaPvm: Option[LocalDateTime] = None,
  lausuntoAnnettuPvm: Option[LocalDateTime] = None
)

case class ValitusHaOValittajanVaatimus(
  taso: Option[Boolean] = None,
  suuntautuminen: Option[Boolean] = None,
  virallisuus: Option[Boolean] = None,
  tiettyKelpoisuus: Option[Boolean] = None,
  kompensaationPoistoTaiVahennysAP: Option[Boolean] = None,
  kompensaationPoistoTaiVahennysUO: Option[Boolean] = None,
  muu: Option[Boolean] = None,
  tasmennys: Option[String] = None
)

case class ValitusKHO(
  valitettu: Option[Boolean] = None,
  valitusPvm: Option[LocalDateTime] = None,
  ratkaisuPvm: Option[LocalDateTime] = None,
  ratkaisu: Option[ValitusKHORatkaisu] = None,
  ratkaisuLisatieto: Option[String] = None,
  lausuntopyyntoValittu: Option[Boolean] = None,
  lausuntopyynto: Option[ValitusLausuntopyynto] = None
)
