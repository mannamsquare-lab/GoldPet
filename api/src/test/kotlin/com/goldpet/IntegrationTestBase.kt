package com.goldpet

import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ActiveProfiles

/**
 * 통합 테스트 베이스.
 *
 * `deploy-local/docker-compose.yml`로 띄운 로컬 PostGIS 컨테이너(localhost:5433)를 사용한다.
 * 테스트 실행 전에 `./deploy-local/scripts/start.sh`로 인프라를 기동해야 한다.
 *
 * 이전에는 `application-test.yml`이 원격 dev DB(`101.250.201.36`)를 직접 가리켜
 * `./gradlew test` 실행 시마다 실 DB에 row가 누출되는 격리 결함이 있었다.
 * 이제 datasource는 `application-test.yml`이 명시적으로 localhost:5433을 가리키므로
 * 컨테이너가 없으면 테스트가 명시적으로 connection refused로 실패한다.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
abstract class IntegrationTestBase
