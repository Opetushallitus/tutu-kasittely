package fi.oph.tutu.backend.config

import org.springframework.context.annotation.Configuration
import org.springframework.beans.factory.annotation.Value
import org.springframework.core.io.Resource
import org.springframework.http.CacheControl
import org.springframework.web.method.HandlerTypePredicate
import org.springframework.web.servlet.config.annotation.{
  PathMatchConfigurer,
  ResourceHandlerRegistry,
  WebMvcConfigurer
}
import org.springframework.web.servlet.resource.PathResourceResolver

import java.util.concurrent.TimeUnit

@Configuration
class WebConfig extends WebMvcConfigurer {
  @Value("${tutu.frontend.dist-location:file:../tutu-frontend/dist/}")
  var frontendDistLocation: String = _

  override def configurePathMatch(configurer: PathMatchConfigurer): Unit = {
    configurer.addPathPrefix("/tutu-backend", HandlerTypePredicate.forBasePackage("fi.oph.tutu.backend.controller"))
  }

  override def addResourceHandlers(registry: ResourceHandlerRegistry): Unit = {
    val distLocation = ensureTrailingSlash(frontendDistLocation)

    registry
      .addResourceHandler("/tutu-frontend/assets/**")
      .addResourceLocations(distLocation + "assets/")
      .setCacheControl(CacheControl.maxAge(365, TimeUnit.DAYS).cachePublic().immutable())

    registry
      .addResourceHandler("/tutu-frontend", "/tutu-frontend/", "/tutu-frontend/**")
      .addResourceLocations(distLocation)
      .setCacheControl(CacheControl.noCache().mustRevalidate())
      .resourceChain(true)
      .addResolver(new PathResourceResolver {
        override def getResource(resourcePath: String, location: Resource): Resource = {
          val requestedResource = super.getResource(resourcePath, location)
          if (
            requestedResource != null && requestedResource
              .exists() && requestedResource.isReadable && requestedResource.isFile
          ) {
            requestedResource
          } else if (resourcePath.contains(".")) {
            null
          } else {
            val indexResource = location.createRelative("index.html")
            if (indexResource.exists() && indexResource.isReadable) indexResource else null
          }
        }
      })
  }

  private def ensureTrailingSlash(value: String): String =
    if (value.endsWith("/")) value else value + "/"
}
