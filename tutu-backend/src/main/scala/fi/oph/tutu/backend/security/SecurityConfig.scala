package fi.oph.tutu.backend.security

import com.zaxxer.hikari.HikariDataSource
import fi.oph.tutu.backend.utils.AuditLog
import fi.vm.sade.javautils.kayttooikeusclient.OphUserDetailsServiceImpl
import org.apereo.cas.client.session.{SessionMappingStorage, SingleSignOutFilter}
import org.apereo.cas.client.validation.{Cas20ServiceTicketValidator, TicketValidator}
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.{Bean, Configuration}
import org.springframework.core.annotation.Order
import org.springframework.core.env.Environment
import org.springframework.http.HttpStatus
import org.springframework.security.authentication.AuthenticationManager
import org.springframework.security.cas.ServiceProperties
import org.springframework.security.cas.authentication.CasAuthenticationProvider
import org.springframework.security.cas.web.{CasAuthenticationEntryPoint, CasAuthenticationFilter}
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.web.SecurityFilterChain
import org.springframework.security.web.authentication.HttpStatusEntryPoint
import org.springframework.security.web.context.{HttpSessionSecurityContextRepository, SecurityContextRepository}
import org.springframework.session.jdbc.config.annotation.SpringSessionDataSource
import org.springframework.session.jdbc.config.annotation.web.http.EnableJdbcHttpSession
import org.springframework.session.web.http.{CookieSerializer, DefaultCookieSerializer}

@Configuration
@EnableWebSecurity
@EnableJdbcHttpSession(tableName = "VIRKAILIJA_SESSION")
class SecurityConfig {
  final private val SPRING_CAS_SECURITY_CHECK_PATH = "/j_spring_cas_security_check"

  @Value("${cas.url}")
  val cas_url: String = null

  @Value("${tutu.backend.url}")
  val tutu_backend_url: String = null

  @Value("${opintopolku.virkailija.url}")
  val opintopolku_virkailija_domain: String = null

  @Bean
  def auditLog(): AuditLog = AuditLog

  @Bean
  @SpringSessionDataSource
  def sessionDatasource(
    @Value("${spring.datasource.url}") url: String,
    @Value("${spring.datasource.username}") username: String,
    @Value("${spring.datasource.password}") password: String
  ): HikariDataSource = {
    val config = new HikariDataSource()
    config.setJdbcUrl(url)
    config.setUsername(username)
    config.setPassword(password)
    config.setMaximumPoolSize(2)
    config
  }

  @Bean
  def securityContextRepository(): HttpSessionSecurityContextRepository = {
    val httpSessionSecurityContextRepository = new HttpSessionSecurityContextRepository()
    httpSessionSecurityContextRepository
  }

  @Bean
  def serviceProperties(): ServiceProperties = {
    val serviceProperties = ServiceProperties()
    serviceProperties.setService(tutu_backend_url + SPRING_CAS_SECURITY_CHECK_PATH)
    serviceProperties.setSendRenew(false)
    serviceProperties
  }

  @Bean
  def casAuthenticationEntrypoint(
    environment: Environment,
    serviceProperties: ServiceProperties
  ): CasAuthenticationEntryPoint = {
    val casAuthenticationEntryPoint = CasAuthenticationEntryPoint()
    casAuthenticationEntryPoint.setLoginUrl(cas_url + "/login")
    casAuthenticationEntryPoint.setServiceProperties(serviceProperties)
    casAuthenticationEntryPoint
  }

  @Bean
  def ticketValidator(): TicketValidator =
    Cas20ServiceTicketValidator(cas_url)

  @Bean
  def casAuthenticationProvider(
    serviceProperties: ServiceProperties,
    ticketValidator: TicketValidator
  ): CasAuthenticationProvider = {
    val casAuthenticationProvider = CasAuthenticationProvider()
    casAuthenticationProvider.setAuthenticationUserDetailsService(new OphUserDetailsServiceImpl())
    casAuthenticationProvider.setServiceProperties(serviceProperties)
    casAuthenticationProvider.setTicketValidator(ticketValidator)
    casAuthenticationProvider.setKey("tutu-backend")
    casAuthenticationProvider
  }

  @Bean
  def authenticationManager(
    http: HttpSecurity,
    casAuthenticationProvider: CasAuthenticationProvider
  ): AuthenticationManager =
    http
      .getSharedObject(classOf[AuthenticationManagerBuilder])
      .authenticationProvider(casAuthenticationProvider)
      .build()

  @Bean
  def casAuthenticationFilter(
    authenticationManager: AuthenticationManager,
    serviceProperties: ServiceProperties,
    securityContextRepository: SecurityContextRepository
  ): CasAuthenticationFilter = {
    val casAuthenticationFilter = CasAuthenticationFilter()
    casAuthenticationFilter.setAuthenticationManager(authenticationManager)
    casAuthenticationFilter.setServiceProperties(serviceProperties)
    casAuthenticationFilter.setFilterProcessesUrl(SPRING_CAS_SECURITY_CHECK_PATH)
    casAuthenticationFilter.setSecurityContextRepository(securityContextRepository)
    casAuthenticationFilter
  }

  @Bean
  def casFilterChain(
    http: HttpSecurity,
    authenticationFilter: CasAuthenticationFilter,
    sessionMappingStorage: SessionMappingStorage,
    securityContextRepository: SecurityContextRepository,
    casAuthenticationEntryPoint: CasAuthenticationEntryPoint
  ): SecurityFilterChain = {

    val SWAGGER_WHITELIST = List(
      "/swagger-resources",
      "/swagger-resources/**",
      "/swagger-ui.html",
      "/v3/api-docs/**",
      "/swagger-ui/**"
    )

    http
      .securityMatcher("/**")
      .authorizeHttpRequests(requests =>
        requests
          .requestMatchers(
            "/api/healthcheck",
            // TODO: remove /api/test & /api/hakemus when not needed
            //            "/api/hakemus",
            "/api/test",
            "/api/csrf"
          )
          .permitAll()
          .requestMatchers(SWAGGER_WHITELIST*)
          .permitAll()
          .anyRequest()
          .fullyAuthenticated()
      )
      .csrf(csrf =>
        csrf
          .ignoringRequestMatchers(
            // TODO: tarviiko CSRF:n?
            "/api/hakemus",
            "/api/healthcheck",
            "/api/csrf"
          )
      )
      .exceptionHandling(exceptionHandling =>
        // corsin takia suoran cas uudelleenohjauksen sijaan palautetaan http 401 ja käli hoitaa forwardoinnin login apiin
        exceptionHandling.authenticationEntryPoint(
          new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED)
        )
      )
      .addFilterAt(authenticationFilter, classOf[CasAuthenticationFilter])
      .addFilterBefore(singleLogoutFilter(sessionMappingStorage), classOf[CasAuthenticationFilter])
      .securityContext(securityContext =>
        securityContext
          .requireExplicitSave(true)
          .securityContextRepository(securityContextRepository)
      )
      .logout(logout =>
        logout
          .logoutUrl("/logout")
          .deleteCookies("JSESSIONID")
      )
      .build()
  }

  // api joka ohjaa tarvittaessa kirjautumattoman käyttäjän cas loginiin
  @Bean
  @Order(1)
  def apiLoginFilterChain(
    http: HttpSecurity,
    casAuthenticationEntryPoint: CasAuthenticationEntryPoint
  ): SecurityFilterChain =
    http
      .securityMatcher("/api/login")
      .authorizeHttpRequests(requests =>
        requests
          .requestMatchers(SPRING_CAS_SECURITY_CHECK_PATH)
          .permitAll() // päästetään läpi cas-logout
          .anyRequest
          .fullyAuthenticated
      )
      .exceptionHandling(c => c.authenticationEntryPoint(casAuthenticationEntryPoint))
      .build()

  //
  // Käsitellään CASilta tuleva SLO-pyyntö
  //
  @Bean
  def singleLogoutFilter(sessionMappingStorage: SessionMappingStorage): SingleSignOutFilter = {
    SingleSignOutFilter.setSessionMappingStorage(sessionMappingStorage)
    val singleSignOutFilter: SingleSignOutFilter = new SingleSignOutFilter();
    singleSignOutFilter.setIgnoreInitConfiguration(true);
    singleSignOutFilter
  }

  @Bean
  def cookieSerializer(): CookieSerializer = {
    val serializer = new DefaultCookieSerializer();
    serializer.setUseSecureCookie(true)
    serializer.setCookieName("JSESSIONID");
    serializer;
  }
}
