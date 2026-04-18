package com.goldpet.domain.admin.repository

import com.goldpet.domain.admin.entity.AdminUser
import org.springframework.data.jpa.repository.JpaRepository
import java.util.Optional

interface AdminUserRepository : JpaRepository<AdminUser, Long> {
    /**
     * 로그인 조회는 email_hash(BlindIndex HMAC-SHA256)로 수행한다.
     * email 컬럼은 random-IV AES-GCM으로 암호화되어 equality 검색이 불가능하다.
     * 호출부: `BlindIndexUtil.hash(email)` 결과를 넘긴다.
     */
    fun findByEmailHash(emailHash: String): Optional<AdminUser>
}
