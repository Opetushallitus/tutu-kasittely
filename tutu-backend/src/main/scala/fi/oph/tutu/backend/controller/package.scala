package fi.oph.tutu.backend

import fi.oph.tutu.backend.domain.{ListSortParam, SortDef}

package object controller:
  final val RESPONSE_200_DESCRIPTION = "Pyyntö onnistui"
  final val RESPONSE_400_DESCRIPTION = "Virheellinen pyyntö"
  final val RESPONSE_403_DESCRIPTION = "Ei käyttöoikeuksia"
  final val RESPONSE_404_DESCRIPTION = "Tietuetta ei löytynyt"
  final val RESPONSE_500_DESCRIPTION = "Palvelinvirhe"

  def resolveSortParams(sortDef: String): Option[ListSortParam] = {
    if (sortDef.isEmpty) {
      return None
    }

    val sortSplit = sortDef.split(":")
    if (sortSplit.length != 2) {
      throw new IllegalArgumentException(s"Virheellinen sort määritys: $sortDef")
    }
    val sortDirection = SortDef.fromString(sortSplit(1))
    if (sortDirection == SortDef.Undefined) {
      throw new IllegalArgumentException(s"Virheellinen sort suunta: ${sortSplit(1)}")
    }
    Some(ListSortParam(sortSplit(0), sortDirection))
  }
