package fi.oph.tutu.backend.service

import fi.oph.tutu.backend.repository.ViestipohjaRepository
import org.springframework.stereotype.{Component, Service}

@Component
@Service
class ViestipohjaService(viestipohjaRepository: ViestipohjaRepository, esittelijaService: EsittelijaService)
    extends TekstipohjaServiceBase(viestipohjaRepository, esittelijaService)
