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
  maksu: Boolean = false,
  asiavirhe: Boolean = false,
  kirjoitusvirhe: Boolean = false,
  muu: Boolean = false,
  tasmennys: Option[String] = None
)

case class ValitusHaO(
  valitettu: Boolean = false,
  valitusPvm: Option[LocalDateTime] = None,
  ratkaisuPvm: Option[LocalDateTime] = None,
  lausuntopyyntoValittu: Boolean = false,
  lausuntopyynto: ValitusLausuntopyynto = ValitusLausuntopyynto(),
  valittajanVaatimus: ValitusHaOValittajanVaatimus = ValitusHaOValittajanVaatimus(),
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
  taso: Boolean = false,
  suuntautuminen: Boolean = false,
  virallisuus: Boolean = false,
  tiettyKelpoisuus: Boolean = false,
  kompensaationPoistoTaiVahennysAP: Boolean = false,
  kompensaationPoistoTaiVahennysUO: Boolean = false,
  muu: Boolean = false,
  tasmennys: Option[String] = None
)

case class ValitusKHO(
  valitettu: Boolean = false,
  valitusPvm: Option[LocalDateTime] = None,
  ratkaisuPvm: Option[LocalDateTime] = None,
  ratkaisu: Option[ValitusKHORatkaisu] = None,
  ratkaisuLisatieto: Option[String] = None,
  lausuntopyyntoValittu: Boolean = false,
  lausuntopyynto: ValitusLausuntopyynto = ValitusLausuntopyynto()
)
