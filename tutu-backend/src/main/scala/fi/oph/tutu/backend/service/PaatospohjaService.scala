package fi.oph.tutu.backend.service

import fi.oph.tutu.backend.repository.PaatospohjaRepository
import org.springframework.stereotype.{Component, Service}

@Component
@Service
class PaatospohjaService(paatospohjaRepository: PaatospohjaRepository, onrService: OnrService)
    extends TekstipohjaServiceBase(paatospohjaRepository, onrService)
