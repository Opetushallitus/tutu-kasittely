package fi.oph.tutu.backend.service.generator

def toKyllaEi(value: Boolean): String = {
  if (value) { "Kyllä" }
  else { "Ei" }
}
