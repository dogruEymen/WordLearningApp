# Multi-stage build for Spring Boot application
# Ubuntu tabanlı image kullan (ARM64 uyumluluğu için)
FROM eclipse-temurin:21-jdk-jammy AS builder

WORKDIR /app

# Gradle wrapper dosyalarını kopyala
COPY gradlew .
COPY gradle gradle
COPY build.gradle .
COPY settings.gradle .

# Gradle wrapper'a çalışma izni ver ve dos2unix ile line endings düzelt
RUN chmod +x ./gradlew && \
    sed -i 's/\r$//' ./gradlew

# Kaynak kodları kopyala
COPY src src

# Uygulamayı derle (tek seferde, cache olmadan)
RUN ./gradlew bootJar --no-daemon -x test --stacktrace

# Runtime stage - Ubuntu tabanlı slim image
FROM eclipse-temurin:21-jre-jammy

WORKDIR /app

# Gerekli paketleri yükle
RUN apt-get update && apt-get install -y --no-install-recommends curl && \
    rm -rf /var/lib/apt/lists/*

# JAR dosyasını kopyala
COPY --from=builder /app/build/libs/*.jar app.jar

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8080/auth/health || exit 1

# Port
EXPOSE 8080

# Uygulama başlat
ENTRYPOINT ["java", "-jar", "app.jar", "--spring.profiles.active=docker"]
