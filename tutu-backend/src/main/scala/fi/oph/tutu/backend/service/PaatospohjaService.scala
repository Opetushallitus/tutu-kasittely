package fi.oph.tutu.backend.service

import fi.oph.tutu.backend.repository.PaatospohjaRepository
import org.springframework.stereotype.{Component, Service}

@Component
@Service
class PaatospohjaService(paatospohjaRepository: PaatospohjaRepository, esittelijaService: EsittelijaService)
    extends TekstipohjaServiceBase(paatospohjaRepository, esittelijaService)
