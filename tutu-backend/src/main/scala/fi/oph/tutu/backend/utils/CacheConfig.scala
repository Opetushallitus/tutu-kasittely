package fi.oph.tutu.backend.utils

import com.github.benmanes.caffeine.cache.Caffeine
import org.springframework.cache.annotation.EnableCaching
import org.springframework.cache.caffeine.CaffeineCacheManager
import org.springframework.context.annotation.{Bean, Configuration}
import org.springframework.scheduling.annotation.EnableScheduling

import java.util.concurrent.TimeUnit

@EnableCaching
@EnableScheduling
@Configuration
class CacheConfig {

  @Bean
  def caffeineConfig(): Caffeine[AnyRef, AnyRef] = {
    Caffeine
      .newBuilder()
      .expireAfterWrite(60, TimeUnit.MINUTES);
  }

  @Bean
  def cacheManager(caffeine: Caffeine[AnyRef, AnyRef]): CaffeineCacheManager = {
    val caffeineCacheManager = new CaffeineCacheManager()
    caffeineCacheManager.setCaffeine(caffeine)
    caffeineCacheManager
  }
}
