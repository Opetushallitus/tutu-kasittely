FROM amazoncorretto:21 AS builder
ARG JAR_FILE=target/tutu-backend-0.0.1-SNAPSHOT.jar
COPY ${JAR_FILE} application.jar
RUN java -Djarmode=tools -jar tutu-backend-0.0.1-SNAPSHOT.jar extract --layers --launcher

FROM amazoncorretto:21
COPY --from=builder dependencies/ ./
COPY --from=builder snapshot-dependencies/ ./
COPY --from=builder spring-boot-loader/ ./
COPY --from=builder application/ ./
ENTRYPOINT ["java", "org.springframework.boot.loader.JarLauncher"]