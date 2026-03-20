package fi.oph.tutu.backend.config

import org.slf4j.LoggerFactory
import org.springframework.context.annotation.{Bean, Configuration}
import org.springframework.scheduling.annotation.EnableScheduling
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler
import org.springframework.util.ErrorHandler

@Configuration
@EnableScheduling
class SchedulingConfig {
  private val LOG = LoggerFactory.getLogger(classOf[SchedulingConfig])

  @Bean
  def taskScheduler(): ThreadPoolTaskScheduler = {
    val scheduler = new ThreadPoolTaskScheduler()
    scheduler.setPoolSize(1)
    scheduler.setThreadNamePrefix("tutu-scheduler-")
    scheduler.setAwaitTerminationSeconds(10)
    scheduler.setWaitForTasksToCompleteOnShutdown(true)
    scheduler.setErrorHandler(t => {
      LOG.error("Scheduled task failed", t)
    })
    scheduler
  }
}
