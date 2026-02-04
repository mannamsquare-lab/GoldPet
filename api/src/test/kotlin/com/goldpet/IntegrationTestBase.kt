package com.goldpet

import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ActiveProfiles

/**
 * Base class for integration tests.
 * Uses the local development database (PostgreSQL on port 5433).
 * Make sure Docker services are running before running integration tests.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
abstract class IntegrationTestBase
