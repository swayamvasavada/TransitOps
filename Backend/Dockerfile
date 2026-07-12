FROM maven:3.9-eclipse-temurin-21 AS maven_build
LABEL maintainer="Swayam Vasavada"

WORKDIR /build
COPY pom.xml .
RUN mvn dependency:go-offline

COPY src ./src
RUN mvn clean package -DskipTests


FROM eclipse-temurin:21-jre-jammy
EXPOSE 8080
WORKDIR /app
COPY --from=maven_build /build/target/TransitOps-*.jar /app/transitops.jar

ENTRYPOINT ["java", "-jar", "/app/transitops.jar"]
