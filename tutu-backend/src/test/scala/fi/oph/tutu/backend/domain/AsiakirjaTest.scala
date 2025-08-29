package fi.oph.tutu.backend.domain

import org.junit.jupiter.api.Test

import java.time.LocalDateTime

class AsiakirjaTest {
  val asiakirja: DbAsiakirja = DbAsiakirja(
    id = java.util.UUID.fromString("f3a9472e-d996-4f2c-9d77-9466823c2ff0"),
    allekirjoituksetTarkistettu = false,
    allekirjoituksetTarkistettuLisatiedot = None,
    alkuperaisetAsiakirjatSaatuNahtavaksi = false,
    alkuperaisetAsiakirjatSaatuNahtavaksiLisatiedot = None,
    selvityksetSaatu = false,
    imiPyynto = None,
    imiPyyntoNumero = None,
    imiPyyntoLahetetty = None,
    imiPyyntoVastattu = None,
    apHakemus = None,
    suostumusVahvistamiselleSaatu = false,
    valmistumisenVahvistus = false,
    valmistumisenVahvistusPyyntoLahetetty = None,
    valmistumisenVahvistusSaatu = None,
    valmistumisenVahvistusVastaus = None,
    valmistumisenVahvistusLisatieto = None,
    viimeinenAsiakirjaHakijalta = None
  )

  val date1: LocalDateTime                = LocalDateTime.parse("2025-05-01T10:00:00")
  val date2: LocalDateTime                = LocalDateTime.parse("2025-06-01T10:00:00")
  val asiakirjaWithImiPyynto: DbAsiakirja = asiakirja.copy(
    imiPyynto = Some(true),
    imiPyyntoNumero = Some("12345"),
    imiPyyntoLahetetty = Some(date1),
    imiPyyntoVastattu = Some(date2)
  )
  val asiakirjaWithValmistumisenVahvistus: DbAsiakirja = asiakirja.copy(
    valmistumisenVahvistus = true,
    valmistumisenVahvistusPyyntoLahetetty = Some(date1),
    valmistumisenVahvistusSaatu = Some(date2),
    valmistumisenVahvistusVastaus = Some(ValmistumisenVahvistusVastaus.Myonteinen),
    valmistumisenVahvistusLisatieto = Some("lisatieto")
  )

  @Test
  def testImiPyyntoNotUpdatedIfValueNotGiven(): Unit = {
    val updatedAsiakirja = asiakirjaWithImiPyynto.mergeWithUpdatedAsiakirja(PartialAsiakirja())
    assert(updatedAsiakirja.imiPyynto == asiakirjaWithImiPyynto.imiPyynto)
    assert(updatedAsiakirja.imiPyyntoNumero == asiakirjaWithImiPyynto.imiPyyntoNumero)
    assert(updatedAsiakirja.imiPyyntoLahetetty == asiakirjaWithImiPyynto.imiPyyntoLahetetty)
    assert(updatedAsiakirja.imiPyyntoVastattu == asiakirjaWithImiPyynto.imiPyyntoVastattu)
  }

  @Test
  def testImiPyyntoUpdatedIfValueGiven(): Unit = {
    val updatedAsiakirja = asiakirjaWithImiPyynto.mergeWithUpdatedAsiakirja(
      PartialAsiakirja(imiPyynto =
        Some(
          ImiPyynto(
            Some(true),
            imiPyyntoNumero = Some("9876"),
            imiPyyntoLahetetty = Some(date2),
            imiPyyntoVastattu = Some(date1)
          )
        )
      )
    )
    assert(updatedAsiakirja.imiPyynto.contains(true))
    assert(updatedAsiakirja.imiPyyntoNumero.contains("9876"))
    assert(updatedAsiakirja.imiPyyntoLahetetty.contains(date2))
    assert(updatedAsiakirja.imiPyyntoVastattu.contains(date1))
  }

  @Test
  def testImiPyyntoClearedIfNoneValueGiven(): Unit = {
    val updatedAsiakirja = asiakirjaWithImiPyynto.mergeWithUpdatedAsiakirja(
      PartialAsiakirja(imiPyynto = Some(ImiPyynto(None)))
    )
    assert(updatedAsiakirja.imiPyynto.isEmpty)
    assert(updatedAsiakirja.imiPyyntoNumero.isEmpty)
    assert(updatedAsiakirja.imiPyyntoLahetetty.isEmpty)
    assert(updatedAsiakirja.imiPyyntoVastattu.isEmpty)
  }

  @Test
  def testValmistumisenVahvistusNotUpdatedIfValueNotGiven(): Unit = {
    val updatedAsiakirja = asiakirjaWithValmistumisenVahvistus.mergeWithUpdatedAsiakirja(PartialAsiakirja())
    assert(updatedAsiakirja.valmistumisenVahvistus == asiakirjaWithValmistumisenVahvistus.valmistumisenVahvistus)
    assert(
      updatedAsiakirja.valmistumisenVahvistusPyyntoLahetetty == asiakirjaWithValmistumisenVahvistus.valmistumisenVahvistusPyyntoLahetetty
    )
    assert(
      updatedAsiakirja.valmistumisenVahvistusSaatu == asiakirjaWithValmistumisenVahvistus.valmistumisenVahvistusSaatu
    )
    assert(
      updatedAsiakirja.valmistumisenVahvistusVastaus == asiakirjaWithValmistumisenVahvistus.valmistumisenVahvistusVastaus
    )
    assert(
      updatedAsiakirja.valmistumisenVahvistusLisatieto == asiakirjaWithValmistumisenVahvistus.valmistumisenVahvistusLisatieto
    )
  }

  @Test
  def testValmistumisenVahvistusUpdatedIfValueGiven(): Unit = {
    val updatedAsiakirja = asiakirjaWithValmistumisenVahvistus.mergeWithUpdatedAsiakirja(
      PartialAsiakirja(valmistumisenVahvistus =
        Some(
          ValmistumisenVahvistus(
            valmistumisenVahvistus = true,
            valmistumisenVahvistusPyyntoLahetetty = Some(date2),
            valmistumisenVahvistusSaatu = Some(date1),
            valmistumisenVahvistusVastaus = Some(ValmistumisenVahvistusVastaus.Kielteinen),
            valmistumisenVahvistusLisatieto = Some("Ei mennyt niinkuin Strömsössä")
          )
        )
      )
    )
    assert(updatedAsiakirja.valmistumisenVahvistus)
    assert(updatedAsiakirja.valmistumisenVahvistusPyyntoLahetetty.contains(date2))
    assert(updatedAsiakirja.valmistumisenVahvistusSaatu.contains(date1))
    assert(updatedAsiakirja.valmistumisenVahvistusVastaus.contains(ValmistumisenVahvistusVastaus.Kielteinen))
    assert(updatedAsiakirja.valmistumisenVahvistusLisatieto.contains("Ei mennyt niinkuin Strömsössä"))
  }

  @Test
  def testValmistumisenVahvistusClearedIfFalseGiven(): Unit = {
    val updatedAsiakirja = asiakirjaWithValmistumisenVahvistus.mergeWithUpdatedAsiakirja(
      PartialAsiakirja(valmistumisenVahvistus =
        Some(
          ValmistumisenVahvistus(
            false,
            Some(date2),
            Some(date1),
            Some(ValmistumisenVahvistusVastaus.EiVastausta),
            Some("Päivitys")
          )
        )
      )
    )
    assert(!updatedAsiakirja.valmistumisenVahvistus)
    assert(updatedAsiakirja.valmistumisenVahvistusPyyntoLahetetty.isEmpty)
    assert(updatedAsiakirja.valmistumisenVahvistusSaatu.isEmpty)
    assert(updatedAsiakirja.valmistumisenVahvistusVastaus.isEmpty)
    assert(updatedAsiakirja.valmistumisenVahvistusLisatieto.isEmpty)
  }
}
