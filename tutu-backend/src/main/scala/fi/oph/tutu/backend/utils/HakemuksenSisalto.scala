package fi.oph.tutu.backend.utils

import fi.oph.tutu.backend.domain.*

def haeKysymyksenTiedot(sisalto: Seq[SisaltoItem], kysymysId: AtaruKysymysId): Option[SisaltoItem] = {
  if (sisalto.isEmpty) {
    None
  } else {
    val current: SisaltoItem = sisalto.head
    if (current.key == kysymysId.generatedId || current.key == kysymysId.definedId) {
      current
    } else {
      val children: Seq[SisaltoItem]           = current.value.flatmap(_.followups) :++ current.children
      val descendantMatch: Option[SisaltoItem] = haeKysymyksenTiedot(children, kysymysId)
      if (descendantMatch.isDefined) {
        descendantMatch
      } else {
        haeKysymyksenTiedot(sisalto.tail, kysymysId)
      }
    }
  }
}
