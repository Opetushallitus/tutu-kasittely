package fi.oph.tutu.backend.controller

import fi.oph.tutu.backend.domain.{Tekstipohja, TekstipohjaKategoria, TekstipohjaListItem}
import fi.oph.tutu.backend.repository.PaatospohjaRepository
import fi.oph.tutu.backend.utils.AuditOperation
import org.springframework.beans.factory.annotation.Autowired

import java.util.UUID

class PaatospohjaControllerTest extends TekstipohjaControllerTestBase {
  @Autowired
  var paatospohjaRepository: PaatospohjaRepository = _

  override def lisaaKategoriaKantaan(kategoria: TekstipohjaKategoria): UUID =
    paatospohjaRepository.lisaaTekstipohjaKategoria(kategoria, "test-user").id.get
  override def lisaaTekstipohjaKantaan(tekstipohja: Tekstipohja): UUID =
    paatospohjaRepository.lisaaTekstipohja(tekstipohja, "test-user").id.get
  override def haeTekstipohjaLista(): Seq[TekstipohjaListItem] = paatospohjaRepository.haeTekstipohjaLista()

  override def pohjaListPath                                = "/api/paatospohja"
  override def pohjaListKategorioittainPath                 = "/api/paatospohja/kategorioittain"
  override def kategoriaListPath                            = "/api/paatospohja/kategoria"
  override def pohjaSavePath                                = "/api/paatospohja"
  override def kategoriaSavePath                            = "/api/paatospohja/kategoria"
  override def pohjaAccessPath(paatospohjaId: UUID): String = s"/api/paatospohja/$paatospohjaId"

  override def pohjaListAuditOperation: AuditOperation       = AuditOperation.ReadPaatospohjat
  override def pohjaReadAuditOperation: AuditOperation       = AuditOperation.ReadPaatospohja
  override def kategoriaListAuditOperation: AuditOperation   = AuditOperation.ReadPaatospohjaKategoriat
  override def kategoriaCreateAuditOperation: AuditOperation = AuditOperation.CreatePaatospohjaKategoria
  override def kategoriaUpdateAuditOperation: AuditOperation = AuditOperation.UpdatePaatospohjaKategoria
  override def pohjaCreateAuditOperation: AuditOperation     = AuditOperation.CreatePaatospohja
  override def pohjaUpdateAuditOperation: AuditOperation     = AuditOperation.UpdatePaatospohja
  override def pohjaDeleteAuditOperation: AuditOperation     = AuditOperation.DeletePaatospohja
}
