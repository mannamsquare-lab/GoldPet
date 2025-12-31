package com.goldpet.domain.admin.repository

import com.goldpet.domain.admin.entity.AdminUser
import org.springframework.data.jpa.repository.JpaRepository
import java.util.Optional

interface AdminUserRepository : JpaRepository<AdminUser, Long> {
    fun findByEmail(email: String): Optional<AdminUser>
}
