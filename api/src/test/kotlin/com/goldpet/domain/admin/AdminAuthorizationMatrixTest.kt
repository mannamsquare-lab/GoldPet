package com.goldpet.domain.admin

import com.goldpet.IntegrationTestBase
import com.goldpet.config.jwt.JwtTokenProvider
import com.goldpet.config.security.AdminUserPrincipal
import com.goldpet.domain.admin.entity.AdminUser
import com.goldpet.domain.admin.entity.AdminUserRole
import com.goldpet.domain.admin.repository.AdminUserRepository
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Tag
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status

/**
 * Phase 0 권한 매트릭스 검증.
 *
 * Phase 0.A: hasAnyRole('ADMIN','SUPER_ADMIN') → hasAnyRole('SUPER_ADMIN','OPERATOR') 정정
 *   검증 엔드포인트: GET /api/v1/admin/users (AdminUserManagementController)
 *
 * Phase 0.B: AdminLBSController / AdminSystemController 클래스 레벨 가드 존재 smoke
 *   검증 엔드포인트: GET /api/v1/admin/lbs/places
 */
@AutoConfigureMockMvc
@Tag("integration")
class AdminAuthorizationMatrixTest : IntegrationTestBase() {

    @Autowired private lateinit var mockMvc: MockMvc
    @Autowired private lateinit var jwtTokenProvider: JwtTokenProvider
    @Autowired private lateinit var adminUserRepository: AdminUserRepository
    @Autowired private lateinit var passwordEncoder: PasswordEncoder

    private val ts = System.currentTimeMillis()
    private lateinit var superAdminUser: AdminUser
    private lateinit var operatorUser: AdminUser
    private lateinit var viewerUser: AdminUser

    @BeforeEach
    fun setUp() {
        superAdminUser = adminUserRepository.save(
            AdminUser(
                email = "matrix_super_$ts@goldpet.com",
                passwordHash = passwordEncoder.encode("pass"),
                name = "Matrix SuperAdmin",
                role = AdminUserRole.SUPER_ADMIN,
                otpSecret = null,
                isActive = true
            )
        )
        operatorUser = adminUserRepository.save(
            AdminUser(
                email = "matrix_operator_$ts@goldpet.com",
                passwordHash = passwordEncoder.encode("pass"),
                name = "Matrix Operator",
                role = AdminUserRole.OPERATOR,
                otpSecret = null,
                isActive = true
            )
        )
        viewerUser = adminUserRepository.save(
            AdminUser(
                email = "matrix_viewer_$ts@goldpet.com",
                passwordHash = passwordEncoder.encode("pass"),
                name = "Matrix Viewer",
                role = AdminUserRole.VIEWER,
                otpSecret = null,
                isActive = true
            )
        )
    }

    @AfterEach
    fun tearDown() {
        runCatching { adminUserRepository.delete(superAdminUser) }
        runCatching { adminUserRepository.delete(operatorUser) }
        runCatching { adminUserRepository.delete(viewerUser) }
    }

    // ── Phase 0.A: AdminUserManagementController GET /api/v1/admin/users ──────

    @Test
    fun `Phase0A - OPERATOR can access admin users endpoint`() {
        mockMvc.perform(
            get("/api/v1/admin/users")
                .header("Authorization", "Bearer ${jwtFor(operatorUser)}")
        ).andExpect(status().isOk)
    }

    @Test
    fun `Phase0A - VIEWER is forbidden from admin users endpoint`() {
        mockMvc.perform(
            get("/api/v1/admin/users")
                .header("Authorization", "Bearer ${jwtFor(viewerUser)}")
        ).andExpect(status().isForbidden)
    }

    @Test
    fun `Phase0A - unauthenticated request to admin users returns 401`() {
        mockMvc.perform(get("/api/v1/admin/users"))
            .andExpect(status().isUnauthorized)
    }

    @Test
    fun `Phase0A - SUPER_ADMIN can access admin users endpoint`() {
        mockMvc.perform(
            get("/api/v1/admin/users")
                .header("Authorization", "Bearer ${jwtFor(superAdminUser)}")
        ).andExpect(status().isOk)
    }

    // ── Phase 0.B: AdminLBSController GET /api/v1/admin/lbs/places ──────────

    @Test
    fun `Phase0B - OPERATOR can access LBS places endpoint`() {
        mockMvc.perform(
            get("/api/v1/admin/lbs/places")
                .header("Authorization", "Bearer ${jwtFor(operatorUser)}")
        ).andExpect(status().isOk)
    }

    @Test
    fun `Phase0B - VIEWER is forbidden from LBS places endpoint`() {
        mockMvc.perform(
            get("/api/v1/admin/lbs/places")
                .header("Authorization", "Bearer ${jwtFor(viewerUser)}")
        ).andExpect(status().isForbidden)
    }

    // ── helpers ────────────────────────────────────────────────────────────────

    private fun jwtFor(adminUser: AdminUser): String {
        val principal = AdminUserPrincipal(adminUser)
        val auth = UsernamePasswordAuthenticationToken(principal, null, principal.authorities)
        return jwtTokenProvider.generateToken(auth)
    }
}
