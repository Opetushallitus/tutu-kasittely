package fi.oph.tutu.backend.domain

enum Kieli: 
  case fi, sv, en
  
type Kielistetty = Map[Kieli, String]