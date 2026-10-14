# Estagio 1: Build do Spring Boot com Maven
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app

COPY pom.xml .
# Baixa as dependencias em cache
RUN mvn dependency:go-offline -B

COPY src ./src
RUN mvn clean package -DskipTests

# Estagio 2: Runtime leve com JRE 17
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

ENV PORT=8080
EXPOSE 8080

ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
