package fi.oph.tutu.backend.domain

enum KasittelyVaihe:
  case AlkukasittelyKesken, OdottaaTaydennysta, OdottaaIMIVastausta,
    OdottaaVahvistusta, OdottaaLausuntoa, ValmisKasiteltavaksi,
    HakemustaTaydennetty, HyvaksynnassaTaiLoppukasittelyssa,
    HyvaksyttyEiLahetetty, LoppukasittelyValmis

object KasittelyVaihe:
  def fromString(value: String): KasittelyVaihe = value match
    case "AlkukasittelyKesken"               => AlkukasittelyKesken
    case "OdottaaTaydennysta"                => OdottaaTaydennysta
    case "OdottaaIMIVastausta"               => OdottaaIMIVastausta
    case "OdottaaVahvistusta"                => OdottaaVahvistusta
    case "OdottaaLausuntoa"                  => OdottaaLausuntoa
    case "ValmisKasiteltavaksi"              => ValmisKasiteltavaksi
    case "HakemustaTaydennetty"              => HakemustaTaydennetty
    case "HyvaksynnassaTaiLoppukasittelyssa" => HyvaksynnassaTaiLoppukasittelyssa
    case "HyvaksyttyEiLahetetty"             => HyvaksyttyEiLahetetty
    case "LoppukasittelyValmis"              => LoppukasittelyValmis
    case _                                   => throw new IllegalArgumentException(s"Tuntematon käsittelyvaihe: $value")

  // Implicit ordering for sorting - uses the enum's ordinal (declaration order)
  implicit val ordering: Ordering[KasittelyVaihe] = Ordering.by(_.ordinal)
