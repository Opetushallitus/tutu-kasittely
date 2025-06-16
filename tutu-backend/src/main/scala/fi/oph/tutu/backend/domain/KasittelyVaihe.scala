package fi.oph.tutu.backend.domain

enum KasittelyVaihe:
  case AlkukasittelyKesken, OdottaaTaydennysta, OdottaaIMIVastausta,
    OdottaaVahvistusta, OdottaaLausuntoa, ValmisKasiteltävaksi,
    HakemustaTäydennetty, HyvaksynnassaTaiLoppukasittelyssa,
    HyvaksyttyEiLahetetty, LoppukasittelyValmis

object KasittelyVaihe:
  def fromString(value: String): KasittelyVaihe = value match
    case "AlkukasittelyKesken"               => AlkukasittelyKesken
    case "OdottaaTaydennysta"                => OdottaaTaydennysta
    case "OdottaaIMIVastausta"               => OdottaaIMIVastausta
    case "OdottaaVahvistusta"                => OdottaaVahvistusta
    case "OdottaaLausuntoa"                  => OdottaaLausuntoa
    case "ValmisKasiteltävaksi"              => ValmisKasiteltävaksi
    case "HakemustaTäydennetty"              => HakemustaTäydennetty
    case "HyvaksynnassaTaiLoppukasittelyssa" => HyvaksynnassaTaiLoppukasittelyssa
    case "HyvaksyttyEiLahetetty"             => HyvaksyttyEiLahetetty
    case "LoppukasittelyValmis"              => LoppukasittelyValmis
    case _                                   => throw new IllegalArgumentException(s"Tuntematon päätöstyyppi: $value")
