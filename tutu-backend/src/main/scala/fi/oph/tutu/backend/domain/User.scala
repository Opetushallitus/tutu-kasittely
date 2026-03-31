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
  yksiloityVTJ: Boolean,
  yhteystiedotRyhma: Seq[OnrYhteystietoRyhma]
) {
  def toEsittelija: Esittelija = {
    val (sahkoposti, puhelin) = resolveSahkopostiJaPuhelin(yhteystiedotRyhma)
    Esittelija(oidHenkilo, kutsumanimi, sukunimi, sahkoposti, puhelin, None)
  }

  private def findFromYhteystietoRyhmat(yhteystiedotRyhma: Seq[OnrYhteystietoRyhma], tyyppi: String): Option[String] =
    yhteystiedotRyhma
      .flatMap(
        _.yhteystieto.find(yt => yt.yhteystietoTyyppi == tyyppi && Option(yt.yhteystietoArvo).exists(_.nonEmpty))
      )
      .headOption
      .map(_.yhteystietoArvo)

  private def resolveSahkopostiJaPuhelin(
    yhteystiedotRyhma: Seq[OnrYhteystietoRyhma]
  ): (Option[String], Option[String]) = {
    val sahkoposti = findFromYhteystietoRyhmat(yhteystiedotRyhma, "YHTEYSTIETO_SAHKOPOSTI")
    var puhelin    = findFromYhteystietoRyhmat(yhteystiedotRyhma, "YHTEYSTIETO_PUHELINNUMERO")
    puhelin =
      if (puhelin.isDefined) puhelin
      else
        findFromYhteystietoRyhmat(yhteystiedotRyhma, "YHTEYSTIETO_MATKAPUHELINNUMERO")
    (sahkoposti, puhelin)
  }
}

case class OnrYhteystietoRyhma(
  yhteystieto: Seq[OnrUserYhteystieto]
)

case class OnrUserYhteystieto(
  yhteystietoTyyppi: String,
  yhteystietoArvo: String
)
