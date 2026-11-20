package fi.oph.tutu.backend.domain

import fi.oph.tutu.backend.domain.AtaruHakemuksenTila.TaydennysPyynto

enum KasittelyVaihe:
  case AlkukasittelyKesken, OdottaaTaydennysta, OdottaaIMIVastausta,
    OdottaaVahvistusta, OdottaaLausuntoa, ValmisKasiteltavaksi,
    HakemustaTaydennetty, HyvaksynnassaTaiLoppukasittelyssa,
    HyvaksyttyEiLahetetty, LoppukasittelyValmis,
    OdottaaKHOLausuntoa, OdottaaKHORatkaisua,
    OdottaaHaOLausuntoa, OdottaaHaORatkaisua

object KasittelyVaihe:
  private val KASITTELYVAIHE_MAPPINGS: Map[String, KasittelyVaihe] = Map(
    "AlkukasittelyKesken"               -> AlkukasittelyKesken,
    "OdottaaTaydennysta"                -> OdottaaTaydennysta,
    "OdottaaIMIVastausta"               -> OdottaaIMIVastausta,
    "OdottaaVahvistusta"                -> OdottaaVahvistusta,
    "OdottaaLausuntoa"                  -> OdottaaLausuntoa,
    "ValmisKasiteltavaksi"              -> ValmisKasiteltavaksi,
    "HakemustaTaydennetty"              -> HakemustaTaydennetty,
    "HyvaksynnassaTaiLoppukasittelyssa" -> HyvaksynnassaTaiLoppukasittelyssa,
    "HyvaksyttyEiLahetetty"             -> HyvaksyttyEiLahetetty,
    "LoppukasittelyValmis"              -> LoppukasittelyValmis,
    "OdottaaKHOLausuntoa"               -> OdottaaKHOLausuntoa,
    "OdottaaKHORatkaisua"               -> OdottaaKHORatkaisua,
    "OdottaaHaOLausuntoa"               -> OdottaaHaOLausuntoa,
    "OdottaaHaORatkaisua"               -> OdottaaHaORatkaisua
  )

  def fromString(value: String): KasittelyVaihe = if (KASITTELYVAIHE_MAPPINGS.contains(value))
    KASITTELYVAIHE_MAPPINGS(value)
  else throw new IllegalArgumentException(s"Tuntematon käsittelyvaihe: $value")

  def isValidKasittelyvaihe(value: String): Boolean = KASITTELYVAIHE_MAPPINGS.contains(value)

  // Implicit ordering for sorting - uses the enum's ordinal (declaration order)
  implicit val ordering: Ordering[KasittelyVaihe] = Ordering.by(_.ordinal)

  def fromAtaruHakemuksenTila(ataruHakemuksenTila: AtaruHakemuksenTila): Option[KasittelyVaihe] =
    ataruHakemuksenTila match {
      case TaydennysPyynto => Some(OdottaaTaydennysta)
      case _               => None
    }
