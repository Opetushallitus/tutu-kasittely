package fi.oph.tutu.backend.controller

import fi.oph.tutu.backend.domain.{Tekstipohja, TekstipohjaKategoria, TekstipohjaListItem}
import fi.oph.tutu.backend.repository.ViestipohjaRepository
import fi.oph.tutu.backend.utils.AuditOperation
import org.springframework.beans.factory.annotation.Autowired

import java.util.UUID

class ViestipohjaControllerTest extends TekstipohjaControllerTestBase {
  @Autowired
  var viestipohjaRepository: ViestipohjaRepository = _

  override def lisaaKategoriaKantaan(kategoria: TekstipohjaKategoria): UUID =
    viestipohjaRepository.lisaaTekstipohjaKategoria(kategoria, "test-user").id.get

  override def lisaaTekstipohjaKantaan(tekstipohja: Tekstipohja): UUID =
    viestipohjaRepository.lisaaTekstipohja(tekstipohja, "test-user").id.get

  override def haeTekstipohjaLista(): Seq[TekstipohjaListItem] = viestipohjaRepository.haeTekstipohjaLista()

  override def pohjaListPath                = "/api/viestipohja"
  override def pohjaListKategorioittainPath = "/api/viestipohja/kategorioittain"
  override def kategoriaListPath            = "/api/viestipohja/kategoria"
  override def pohjaSavePath                = "/api/viestipohja"
  override def kategoriaSavePath            = "/api/viestipohja/kategoria"

  override def pohjaAccessPath(viestipohjaId: UUID): String = s"/api/viestipohja/$viestipohjaId"

  override def pohjaListAuditOperation: AuditOperation       = AuditOperation.ReadViestipohjat
  override def pohjaReadAuditOperation: AuditOperation       = AuditOperation.ReadViestipohja
  override def kategoriaListAuditOperation: AuditOperation   = AuditOperation.ReadViestipohjaKategoriat
  override def kategoriaCreateAuditOperation: AuditOperation = AuditOperation.CreateViestipohjaKategoria
  override def kategoriaUpdateAuditOperation: AuditOperation = AuditOperation.UpdateViestipohjaKategoria
  override def pohjaCreateAuditOperation: AuditOperation     = AuditOperation.CreateViestipohja
  override def pohjaUpdateAuditOperation: AuditOperation     = AuditOperation.UpdateViestipohja
  override def pohjaDeleteAuditOperation: AuditOperation     = AuditOperation.DeleteViestiPohja
}
