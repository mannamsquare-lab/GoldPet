import org.jetbrains.kotlin.gradle.tasks.KotlinCompile

plugins {
    id("org.springframework.boot") version "3.4.3"
    id("io.spring.dependency-management") version "1.1.7"
    kotlin("jvm") version "2.0.21"
    kotlin("plugin.spring") version "2.0.21"
    kotlin("plugin.jpa") version "2.0.21"
}

group = "com.goldpet"
version = "0.0.1-SNAPSHOT"

java {
    sourceCompatibility = JavaVersion.VERSION_21
}

repositories {
    mavenCentral()
}

configurations.all {
    exclude(group = "commons-logging", module = "commons-logging")
}

dependencies {
    implementation("org.springframework.boot:spring-boot-starter-data-jpa")
    implementation("org.springframework.boot:spring-boot-starter-data-redis")
    implementation("org.springframework.boot:spring-boot-starter-web")
    implementation("org.springframework.boot:spring-boot-starter-validation")
    implementation("org.springframework.boot:spring-boot-starter-websocket")
    implementation("org.springframework.boot:spring-boot-starter-actuator")
    implementation("org.springframework.boot:spring-boot-starter-security")
    implementation("org.springframework.boot:spring-boot-starter-oauth2-client")
    implementation("org.springdoc:springdoc-openapi-starter-webmvc-ui:2.3.0")
    implementation("com.fasterxml.jackson.module:jackson-module-kotlin")
    implementation("org.jetbrains.kotlin:kotlin-reflect")
    implementation("com.amazonaws:aws-java-sdk-s3:1.12.559")
    implementation("org.flywaydb:flyway-core:9.22.3")
    implementation("org.hibernate.orm:hibernate-spatial:6.4.4.Final")
    implementation("org.locationtech.jts:jts-core:1.19.0")
    implementation("io.jsonwebtoken:jjwt-api:0.12.3")
    implementation("io.jsonwebtoken:jjwt-impl:0.12.3")
    implementation("io.jsonwebtoken:jjwt-jackson:0.12.3")
    implementation("com.warrenstrange:googleauth:1.5.0")
    implementation("com.google.firebase:firebase-admin:9.2.0")
    implementation("com.drewnoakes:metadata-extractor:2.19.0")
    implementation("net.coobird:thumbnailator:0.4.20")
    implementation("com.twelvemonkeys.imageio:imageio-webp:3.12.0")

    runtimeOnly("org.postgresql:postgresql")
    runtimeOnly("io.micrometer:micrometer-registry-prometheus")

    // Test dependencies
    testImplementation("org.springframework.boot:spring-boot-starter-test")
    testImplementation("org.mockito.kotlin:mockito-kotlin:5.2.1")
    testImplementation("org.springframework.security:spring-security-test")

    // TestContainers 1.20+ required for Java 21 (1.19.x hits sun.misc.Unsafe restriction)
    testImplementation("org.testcontainers:testcontainers:1.20.4")
    testImplementation("org.testcontainers:junit-jupiter:1.20.4")
    testImplementation("org.testcontainers:postgresql:1.20.4")
}

tasks.withType<KotlinCompile> {
    compilerOptions {
        freeCompilerArgs.add("-Xjsr305=strict")
        jvmTarget.set(org.jetbrains.kotlin.gradle.dsl.JvmTarget.JVM_21)
    }
}

tasks.withType<Test> {
    useJUnitPlatform()
    // TestContainers가 macOS Docker Desktop의 유저 소켓을 찾지 못해
    // "Could not find a valid Docker environment"로 실패하는 것을 방지.
    // 환경변수 DOCKER_HOST와 시스템 프로퍼티 docker.host 양쪽에 주입한다 —
    // docker-java의 EnvironmentAndSystemPropertyClientProviderStrategy는
    // 둘 중 하나라도 있으면 해당 소켓을 사용한다.
    fun resolveDockerHost(): String {
        System.getenv("DOCKER_HOST")?.let { return it }
        val userSocket = file("${System.getProperty("user.home")}/.docker/run/docker.sock")
        if (userSocket.exists()) return "unix://${userSocket.absolutePath}"
        val systemSocket = file("/var/run/docker.sock")
        if (systemSocket.exists()) return "unix://${systemSocket.absolutePath}"
        return "unix:///var/run/docker.sock"
    }
    val dockerHost = resolveDockerHost()
    environment("DOCKER_HOST", dockerHost)
    systemProperty("docker.host", dockerHost)
    systemProperty("testcontainers.docker.host", dockerHost)
    // 헬스체크 컨테이너(socat) 스킵 — macOS Docker Desktop에서 전파 지연으로 행 걸리는 것 방지
    systemProperty("testcontainers.checks.disable", "true")
}
