FROM amazoncorretto:21 AS builder
ARG JAR_FILE=target/tutu-backend-0.0.1-SNAPSHOT.jar
COPY ${JAR_FILE} application.jar
RUN java -Djarmode=tools -jar application.jar extract --layers --launcher && ls

FROM amazoncorretto:21
RUN yum install -y shadow-utils && yum clean all
RUN adduser tutu
RUN mkdir -p /home/tutu/logs && chown tutu:tutu /home/tutu/logs
USER tutu
VOLUME ["/home/tutu/logs"]
COPY --from=builder application/dependencies/ ./
COPY --from=builder application/snapshot-dependencies/ ./
COPY --from=builder application/spring-boot-loader/ ./
COPY --from=builder application/application/ ./
ENTRYPOINT ["java", "org.springframework.boot.loader.launch.JarLauncher", "--spring.profiles.active=prod", "--spring.config.additional-location=classpath:/oph-configuration/application.properties"]