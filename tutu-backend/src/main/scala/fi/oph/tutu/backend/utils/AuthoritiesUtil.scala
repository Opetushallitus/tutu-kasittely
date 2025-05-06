package fi.oph.tutu.backend.utils

import fi.oph.tutu.backend.security.SecurityConstants
import org.springframework.security.core.GrantedAuthority

import java.util
import scala.jdk.CollectionConverters.*
import scala.util.matching.Regex

object AuthoritiesUtil {
  def getTutuAuthorities(allAuthorities: util.Collection[? <: GrantedAuthority]): List[String] = {
    val tutuAuthoritiesRegex: Regex = s"${SecurityConstants.SECURITY_ROOLI_ESITTELIJA_FULL}.*".r
    allAuthorities.asScala.toList
        .flatMap(role => tutuAuthoritiesRegex.findFirstIn(role.getAuthority))
  }
  
  def hasTutuAuthorities(allAuthorities: List[String]): Boolean = {
    allAuthorities.exists(role => role.startsWith(SecurityConstants.SECURITY_ROOLI_ESITTELIJA_FULL))
  }
}
