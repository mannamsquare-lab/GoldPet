package com.goldpet

import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.DynamicPropertyRegistry
import org.springframework.test.context.DynamicPropertySource
import org.testcontainers.containers.PostgreSQLContainer
import org.testcontainers.junit.jupiter.Testcontainers
import org.testcontainers.utility.DockerImageName

/**
 * 통합 테스트 베이스.
 *
 * TestContainers로 PostGIS PostgreSQL 컨테이너를 기동하여 매 테스트 클래스가 격리된 DB에서 실행된다.
 * 이전에는 application-test.yml이 원격 dev DB(101.250.201.36)를 직접 가리켜 테스트 실행 시마다
 * 실 DB에 row가 남는 격리 결함이 있었고, 이 클래스가 그 수정.
 *
 * 요구사항: Docker 데몬이 실행 중이어야 함. 미가동 시 테스트는 ContainerLaunchException으로 실패한다.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@Testcontainers
abstract class IntegrationTestBase {
    companion object {
        @JvmStatic
        private val postgres: PostgreSQLContainer<*> =
            PostgreSQLContainer(DockerImageName.parse("postgis/postgis:16-3.4").asCompatibleSubstituteFor("postgres"))
                .withDatabaseName("goldpet_test")
                .withUsername("test")
                .withPassword("test")
                .withReuse(true)
                .also { it.start() }

        @JvmStatic
        @DynamicPropertySource
        fun registerDataSource(registry: DynamicPropertyRegistry) {
            registry.add("spring.datasource.url", postgres::getJdbcUrl)
            registry.add("spring.datasource.username", postgres::getUsername)
            registry.add("spring.datasource.password", postgres::getPassword)
            registry.add("spring.datasource.driver-class-name") { "org.postgresql.Driver" }
        }
    }
}
